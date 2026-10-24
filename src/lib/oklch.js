/**
 * OKLCH helpers. The app's colours are authored in OKLCH (perceptual lightness, chroma, hue) and
 * handed to CSS as oklch(); these convert to sRGB hex for readouts and for tools that want hex.
 */

/** CSS value: oklch(L C H) or oklch(L C H / A). L is 0–1, C ≥ 0, H in degrees. */
export function oklchCss({ l, c, h, alpha = 1 }) {
  const base = `oklch(${round(l, 3)} ${round(c, 3)} ${round(h, 1)}`;
  return alpha < 1 ? `${base} / ${round(alpha, 2)})` : `${base})`;
}

/** sRGB hex of an OKLCH colour, with out-of-gamut channels clipped. */
export function oklchToHex({ l, c, h }) {
  const hr = (h * Math.PI) / 180;
  const a = c * Math.cos(hr), b = c * Math.sin(hr);
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;
  const L = l_ ** 3, M = m_ ** 3, S = s_ ** 3;
  const rl = +4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S;
  const gl = -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S;
  const bl = -0.0041960863 * L - 0.7034186147 * M + 1.7076147010 * S;
  return '#' + [rl, gl, bl].map(v => {
    const s = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(v, 0), 1 / 2.4) - 0.055;
    return Math.round(Math.min(1, Math.max(0, s)) * 255).toString(16).padStart(2, '0');
  }).join('');
}

export function round(n, dp) {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}
