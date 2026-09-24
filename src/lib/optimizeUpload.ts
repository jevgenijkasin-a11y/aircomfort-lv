import sharp from 'sharp';

/**
 * Shrinks an uploaded image before it is stored: max `maxWidth` px wide,
 * EXIF-rotated, re-encoded as WebP. SVG/GIF and anything sharp can't read
 * are stored unchanged. next/image then serves resized AVIF/WebP to clients.
 */
export async function optimizeUpload(
  input: Buffer,
  ext: string,
  maxWidth = 1920,
): Promise<{ data: Buffer; ext: string; contentType: string }> {
  if (ext === 'svg' || ext === 'gif') {
    return { data: input, ext, contentType: ext === 'svg' ? 'image/svg+xml' : 'image/gif' };
  }
  try {
    const data = await sharp(input)
      .rotate()
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    return { data, ext: 'webp', contentType: 'image/webp' };
  } catch {
    return { data: input, ext, contentType: 'application/octet-stream' };
  }
}
