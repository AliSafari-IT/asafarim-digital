import sharp from "sharp";

export type GeneratedThumbnail = {
  body: Buffer;
  contentType: "image/webp";
  width: number;
  height: number;
};

export async function generateThumbnail(
  source: Buffer,
  options: { width?: number; height?: number } = {},
): Promise<GeneratedThumbnail | null> {
  try {
    const width = options.width ?? 512;
    const height = options.height ?? 512;
    const image = sharp(source, { failOn: "none" }).rotate();
    const output = await image
      .resize(width, height, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 78 })
      .toBuffer({ resolveWithObject: true });

    return {
      body: output.data,
      contentType: "image/webp",
      width: output.info.width,
      height: output.info.height,
    };
  } catch {
    return null;
  }
}
