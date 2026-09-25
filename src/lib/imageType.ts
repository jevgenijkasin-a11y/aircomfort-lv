// Detects an image's real format from its first bytes ("magic numbers"),
// regardless of the file name. Used to reject SVG/HTML uploaded as .jpg/.png.

export type SniffedType = 'jpg' | 'png' | 'webp' | 'avif' | 'gif' | 'svg' | 'html' | 'unknown';

export const RASTER_TYPES: SniffedType[] = ['jpg', 'png', 'webp', 'avif', 'gif'];

export function sniffImageType(buf: Uint8Array): SniffedType {
  const b = Buffer.from(buf.buffer, buf.byteOffset, Math.min(buf.byteLength, 512));
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP') return 'webp';
  if (b.subarray(4, 8).toString('latin1') === 'ftyp' && /avi[fs]/.test(b.subarray(8, 12).toString('latin1'))) return 'avif';
  if (b.subarray(0, 4).toString('latin1') === 'GIF8') return 'gif';
  const text = b.toString('utf8').replace(/^﻿/, '').trimStart().toLowerCase();
  if (text.startsWith('<svg') || (text.startsWith('<?xml') && text.includes('<svg'))) return 'svg';
  if (text.startsWith('<!doctype') || text.startsWith('<html') || text.startsWith('<')) return 'html';
  return 'unknown';
}

const LABEL: Record<SniffedType, string> = {
  jpg: 'JPG', png: 'PNG', webp: 'WebP', avif: 'AVIF', gif: 'GIF', svg: 'SVG', html: 'HTML', unknown: 'неизвестный формат',
};

/** null if the upload is an accepted raster image, otherwise a Russian error message. */
export function uploadTypeError(buf: Uint8Array, fileName: string): string | null {
  const real = sniffImageType(buf);
  if (RASTER_TYPES.includes(real)) return null;
  return `Файл «${fileName}» не является изображением: по содержимому это ${LABEL[real]}. Загрузите JPG, PNG, WebP, AVIF или GIF.`;
}
