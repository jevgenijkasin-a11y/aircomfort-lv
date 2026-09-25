/**
 * Shrinks an uploaded image before it is stored: max `maxWidth` px wide,
 * EXIF-rotated, re-encoded as WebP. SVG/GIF and anything sharp can't read
 * are stored unchanged. next/image then serves resized AVIF/WebP to clients.
 *
 * sharp is loaded lazily: if it is missing on the server (npm install not
 * run after deploy), uploads still work — the original file is stored.
 */
export async function optimizeUpload(
  input: Buffer,
  ext: string,
  maxWidth = 1920,
): Promise<{ data: Buffer; ext: string; optimized: boolean }> {
  if (ext === 'svg' || ext === 'gif') return { data: input, ext, optimized: false };
  try {
    const sharp = (await import('sharp')).default;
    const data = await sharp(input)
      .rotate()
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    return { data, ext: 'webp', optimized: true };
  } catch (err) {
    console.warn('[upload] image not optimized (sharp unavailable or unreadable file):', (err as Error)?.message);
    return { data: input, ext, optimized: false };
  }
}
