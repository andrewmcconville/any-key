/**
 * Photos of the keys, from src/assets/images, keyed by file name. A key names its photo in the
 * content data (`photo`), and the bundler takes care of the URL.
 */
const PHOTOS = import.meta.glob('../assets/images/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default', query: '?url' });

/** The URL of a photo by file name, or null if there is no such file. */
export function photoUrl(name) {
  return name ? (PHOTOS[`../assets/images/${name}`] ?? null) : null;
}

const bounds = new Map();
/**
 * How much of a loaded photo the subject fills, as shares of its height: { top, bottom }, the first
 * and last rows with solid pixels (a faint shadow does not count). The box a photo sits in is
 * square, but the cap inside has clear space around it, so a connector or label meeting the box's
 * edge would stop short of the cap. Measured once per photo on a small canvas; call it once the
 * image has decoded (img.decode()), or the canvas has nothing to read.
 */
export function photoBounds(img) {
  const key = img.currentSrc || img.src;
  if (bounds.has(key)) return bounds.get(key);
  const n = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = n;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, n, n);
  const data = ctx.getImageData(0, 0, n, n).data;
  let top = -1, bottom = -1;
  for (let y = 0; y < n; y++) {
    let solid = false;
    for (let x = 0; x < n && !solid; x++) solid = data[(y * n + x) * 4 + 3] > 64;
    if (solid) { if (top < 0) top = y; bottom = y + 1; }
  }
  // Nothing solid means the pixels were not there to read yet; that is not worth remembering.
  if (top < 0) return { top: 0, bottom: 1 };
  const b = { top: top / n, bottom: bottom / n };
  bounds.set(key, b);
  return b;
}
