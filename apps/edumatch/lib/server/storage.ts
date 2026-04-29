import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { MAX_FILE_BYTES, type AllowedMime } from "./validation";

/**
 * Phase 2.1 storage layer.
 *
 * Production: S3-compatible (DigitalOcean Spaces). Configure via env:
 *   SPACES_ENDPOINT, SPACES_REGION, SPACES_BUCKET, SPACES_ACCESS_KEY, SPACES_SECRET_KEY
 *   SPACES_PUBLIC_URL (optional — defaults to `${endpoint}/${bucket}`)
 *
 * Local dev: if any required var is missing the helper short-circuits into a
 * stub mode that returns a non-functional URL but the rest of the inquiry
 * pipeline still works end-to-end. This keeps the dev loop offline-friendly.
 *
 * Spatial / signed-URL caveats: presigned PUT URLs are scoped to a single key
 * + content-type. The client *must* echo the same `Content-Type` header on
 * the actual PUT, otherwise S3 rejects the signature. We surface that as part
 * of the response so the client can't get it wrong.
 */

const PRESIGN_EXPIRES_SEC = 5 * 60; // 5 minutes

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
  contentType: AllowedMime;
  sizeBytes: number;
};

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
    SPACES_ENDPOINT,
    SPACES_REGION,
    SPACES_BUCKET,
    SPACES_ACCESS_KEY,
    SPACES_SECRET_KEY,
    SPACES_PUBLIC_URL,
  } = process.env;

  if (
    !SPACES_ENDPOINT ||
    !SPACES_REGION ||
    !SPACES_BUCKET ||
    !SPACES_ACCESS_KEY ||
    !SPACES_SECRET_KEY
  ) {
    return null;
  }

  return {
    endpoint: SPACES_ENDPOINT,
    region: SPACES_REGION,
    bucket: SPACES_BUCKET,
    accessKey: SPACES_ACCESS_KEY,
    secretKey: SPACES_SECRET_KEY,
    publicUrl: SPACES_PUBLIC_URL ?? `${SPACES_ENDPOINT.replace(/\/$/, "")}/${SPACES_BUCKET}`,
  };
}

let cachedClient: { client: S3Client; config: StorageConfig } | null = null;

function getClient(): { client: S3Client; config: StorageConfig } | null {
  if (cachedClient) return cachedClient;
  const config = readConfig();
  if (!config) return null;

  const client = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKey,
      secretAccessKey: config.secretKey,
    },
    forcePathStyle: false,
  });

  cachedClient = { client, config };
  return cachedClient;
}

/**
 * Build the canonical object key for an inquiry attachment.
 * Including the userId in the path lets us enforce ownership on later reads
 * without round-tripping the database.
 */
export function buildAttachmentKey(userId: string, filename: string): string {
  const safe = filename
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/\.{2,}/g, "_") // collapse "..", "..." etc. so the key can't look like a parent ref
    .replace(/^[._-]+/, "") // strip leading separators
    .slice(0, 80) || "file";
  return `inquiries/${userId}/${randomUUID()}/${safe}`;
}

/**
 * Verify that a key was issued for the given user. Cheap string check, but
 * it's the security boundary that stops user A from claiming user B's
 * upload as their own attachment.
 */
export function isKeyOwnedBy(key: string, userId: string): boolean {
  return key.startsWith(`inquiries/${userId}/`);
}

export async function createPresignedUploadUrl(
  input: PresignInput,
): Promise<PresignedUpload> {
  if (input.sizeBytes > MAX_FILE_BYTES) {
    throw new Error(`File exceeds ${MAX_FILE_BYTES} bytes`);
  }

  const key = buildAttachmentKey(input.userId, input.filename);
  const headers = { "Content-Type": input.contentType };

  const handle = getClient();
  if (!handle) {
    // Local-dev stub: surface a non-functional URL so the rest of the pipeline
    // can still be exercised end-to-end against an in-memory description.
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

  const uploadUrl = await getSignedUrl(handle.client, command, {
    expiresIn: PRESIGN_EXPIRES_SEC,
  });

  return {
    key,
    uploadUrl,
    publicUrl: `${handle.config.publicUrl.replace(/\/$/, "")}/${key}`,
    headers,
    expiresInSec: PRESIGN_EXPIRES_SEC,
    isLocalStub: false,
  };
}

/**
 * Confirm an object actually exists in storage before persisting an
 * attachment record. In stub mode we skip the check and trust the client.
 */
export async function objectExists(key: string): Promise<boolean> {
  const handle = getClient();
  if (!handle) return true;
  try {
    await handle.client.send(
      new HeadObjectCommand({ Bucket: handle.config.bucket, Key: key }),
    );
    return true;
  } catch {
    return false;
  }
}
