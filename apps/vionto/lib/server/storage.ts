import { S3Client, PutObjectCommand, HeadObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { MAX_IMAGE_BYTES, type AllowedUploadMime } from "./validation";

/**
 * Vionto storage layer.
 *
 * Production: S3-compatible (DigitalOcean Spaces). Configure via env:
 *   DO_SPACES_ENDPOINT, DO_SPACES_REGION, DO_SPACES_BUCKET,
 *   DO_SPACES_KEY, DO_SPACES_SECRET, DO_SPACES_PUBLIC_URL (optional)
 *
 * Local dev: if any required var is missing the helper short-circuits into a
 * stub mode. Uploads are tracked in-session; the rest of the pipeline still
 * works end-to-end offline.
 */

const PRESIGN_EXPIRES_SEC = 10 * 60; // 10 minutes

export type PresignedUpload = {
  key: string;
  uploadUrl: string;
  publicUrl: string;
  headers: Record<string, string>;
  expiresInSec: number;
  isLocalStub: boolean;
};

export type PresignInput = {
  userId: string;
  filename: string;
  contentType: AllowedUploadMime;
  sizeBytes: number;
  sessionId: string;
  category?: StorageCategory;
};

export type StorageCategory =
  | "originals"
  | "thumbnails"
  | "audio"
  | "renders"
  | "exports"
  | "sessions";

type StorageConfig = {
  endpoint: string;
  region: string;
  bucket: string;
  accessKey: string;
  secretKey: string;
  publicUrl: string;
};

function readConfig(): StorageConfig | null {
  const {
    DO_SPACES_ENDPOINT,
    DO_SPACES_REGION,
    DO_SPACES_BUCKET,
    DO_SPACES_KEY,
    DO_SPACES_SECRET,
    DO_SPACES_PUBLIC_URL,
  } = process.env;

  if (!DO_SPACES_ENDPOINT || !DO_SPACES_REGION || !DO_SPACES_BUCKET || !DO_SPACES_KEY || !DO_SPACES_SECRET) {
    return null;
  }

  return {
    endpoint: DO_SPACES_ENDPOINT,
    region: DO_SPACES_REGION,
    bucket: DO_SPACES_BUCKET,
    accessKey: DO_SPACES_KEY,
    secretKey: DO_SPACES_SECRET,
    publicUrl: DO_SPACES_PUBLIC_URL ?? `${DO_SPACES_ENDPOINT.replace(/\/+$/, "")}/${DO_SPACES_BUCKET}`,
  };
}

let cachedClient: { client: S3Client; config: StorageConfig } | null = null;

export function getStorageStatus(): { configured: boolean; bucket?: string; region?: string; endpoint?: string; publicUrl?: string } {
  const config = readConfig();
  if (!config) return { configured: false };
  return {
    configured: true,
    bucket: config.bucket,
    region: config.region,
    endpoint: config.endpoint,
    publicUrl: config.publicUrl,
  };
}

function getClient(): { client: S3Client; config: StorageConfig } | null {
  if (cachedClient) return cachedClient;
  const config = readConfig();
  if (!config) return null;

  const client = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: { accessKeyId: config.accessKey, secretAccessKey: config.secretKey },
    forcePathStyle: false,
  });

  cachedClient = { client, config };
  return cachedClient;
}

/**
 * Build a canonical object key. Never embed raw emails or unsafe filenames.
 * Structure: vionto/{userId}/{category}/{sessionId|projectId}/{uuid}/{safeName}
 */
export function buildKey(
  userId: string,
  category: StorageCategory,
  scopeId: string, // sessionId or projectId
  filename: string,
): string {
  const safe = filename
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/\.{2,}/g, "_")
    .replace(/^[._-]+/, "")
    .slice(0, 80) || "file";
  return `vionto/${userId}/${category}/${scopeId}/${randomUUID()}/${safe}`;
}

/** Verify that a key was issued for the given user. */
export function isKeyOwnedBy(key: string, userId: string): boolean {
  return key.startsWith(`vionto/${userId}/`);
}

/** Extract session or project scope from a well-formed key. */
export function getKeyScope(key: string): string | null {
  const parts = key.split("/");
  return parts.length >= 5 ? parts[4] : null;
}

export async function createPresignedUploadUrl(input: PresignInput): Promise<PresignedUpload> {
  if (input.sizeBytes > MAX_IMAGE_BYTES) {
    throw new Error(`File exceeds ${MAX_IMAGE_BYTES} bytes`);
  }

  const key = buildKey(input.userId, input.category ?? "sessions", input.sessionId, input.filename);
  const headers: Record<string, string> = { "Content-Type": input.contentType };

  const handle = getClient();
  if (!handle) {
    return {
      key,
      uploadUrl: `local-stub://${key}`,
      publicUrl: `local-stub://${key}`,
      headers,
      expiresInSec: PRESIGN_EXPIRES_SEC,
      isLocalStub: true,
    };
  }

  const command = new PutObjectCommand({
    Bucket: handle.config.bucket,
    Key: key,
    ContentType: input.contentType,
    ContentLength: input.sizeBytes,
  });

  const uploadUrl = await getSignedUrl(handle.client, command, { expiresIn: PRESIGN_EXPIRES_SEC });

  return {
    key,
    uploadUrl,
    publicUrl: `${handle.config.publicUrl.replace(/\/+$/, "")}/${key}`,
    headers,
    expiresInSec: PRESIGN_EXPIRES_SEC,
    isLocalStub: false,
  };
}

/** Confirm an object exists in storage before persisting metadata. */
export async function objectExists(key: string): Promise<boolean> {
  const handle = getClient();
  if (!handle) return true; // stub mode: trust the client
  try {
    await handle.client.send(new HeadObjectCommand({ Bucket: handle.config.bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

/** Delete an object from storage. */
export async function deleteObject(key: string): Promise<void> {
  const handle = getClient();
  if (!handle) return;
  try {
    await handle.client.send(new DeleteObjectCommand({ Bucket: handle.config.bucket, Key: key }));
  } catch {
    // ignore — already gone or never existed
  }
}

/**
 * Build the public URL for a storage key based on current configuration.
 * Returns a `local-stub://` URL in stub mode so callers can still persist the key.
 */
export function getPublicUrlForKey(key: string): string {
  const handle = getClient();
  if (!handle) return `local-stub://${key}`;
  return `${handle.config.publicUrl.replace(/\/+$/, "")}/${key}`;
}

/** Maximum bytes fetched for server-side metadata extraction (EXIF headers). */
export const MAX_METADATA_FETCH_BYTES = 2 * 1024 * 1024; // 2 MB is enough for JPEG/PNG headers + EXIF

/**
 * Fetch object bytes from storage for server-side metadata extraction.
 * Returns null in stub mode or if the object is missing / unreadable.
 * Capped to `maxBytes` to avoid loading large originals into memory.
 */
export async function getObjectBytes(key: string, maxBytes: number = MAX_METADATA_FETCH_BYTES): Promise<Buffer | null> {
  const handle = getClient();
  if (!handle) return null;
  try {
    const response = await handle.client.send(
      new GetObjectCommand({
        Bucket: handle.config.bucket,
        Key: key,
        Range: `bytes=0-${Math.max(0, maxBytes - 1)}`,
      }),
    );
    const body = response.Body as unknown as AsyncIterable<Uint8Array> | undefined;
    if (!body) return null;
    const chunks: Buffer[] = [];
    let total = 0;
    for await (const chunk of body) {
      const buf = Buffer.from(chunk);
      chunks.push(buf);
      total += buf.length;
      if (total >= maxBytes) break;
    }
    return Buffer.concat(chunks, Math.min(total, maxBytes));
  } catch {
    return null;
  }
}
