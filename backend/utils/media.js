// Member-uploaded pictures (profile photos, post photos). Pure helpers: the
// type is decided from the file's own bytes, never from what the client says.

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const MEDIA_PATH = /^\/media\/([a-f0-9]{32})$/;

/** 'image/jpeg' | 'image/png' | 'image/webp', or null when it is not one of them. */
export function sniffImageType(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.toString('latin1', 0, 4) === 'RIFF' && buf.toString('latin1', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}

export const mediaPath = (id) => `/media/${id}`;

/** The media ID inside a stored '/media/<id>' path, or null for anything else. */
export function mediaIdOf(path) {
  const m = MEDIA_PATH.exec(String(path || ''));
  return m ? m[1] : null;
}

/** A stored value that is safe to hand to clients as a picture path, else null. */
export const safeMediaPath = (path) => (mediaIdOf(path) ? String(path) : null);
