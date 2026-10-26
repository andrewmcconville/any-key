import { describe, expect, it } from 'vitest';
import { BOARD_WIDTH, ERAS, IMAGE_SOURCES, KEYS, RAIL_Y, YEAR_WIDTH, yearX } from './content';
import { photoUrl } from '../lib/photos';

describe('board layout', () => {
  const LABEL_W = 360;     // a key's name and year
  const STACK_H = 460;     // a photo key, its name and year
  const pairs = KEYS.flatMap((a, i) => KEYS.slice(i + 1).map(b => [a, b]));

  it('keys are in year order', () => {
    for (let i = 1; i < KEYS.length; i++) expect(KEYS[i].at, KEYS[i].id).toBeGreaterThanOrEqual(KEYS[i - 1].at);
  });

  it('every key hangs from a hook on the ruler, within a year of its key’s year', () => {
    for (const k of KEYS) {
      expect(Math.abs(k.cx - yearX(k.at)), k.id).toBeLessThan(YEAR_WIDTH);
      expect(k.cx, k.id).toBeGreaterThanOrEqual(0);
      expect(k.cx, k.id).toBeLessThanOrEqual(BOARD_WIDTH);
    }
  });

  it('keys whose labels would meet hang a key, name and year apart', () => {
    for (const [a, b] of pairs.filter(([a, b]) => Math.abs(a.cx - b.cx) < LABEL_W)) {
      expect(Math.abs(a.cy - b.cy), `${a.id} / ${b.id}`).toBeGreaterThanOrEqual(STACK_H);
    }
  });

  it('the chains are not all one length', () => {
    expect(new Set(KEYS.map(k => k.cy)).size).toBe(KEYS.length);
  });

  // The board's height is planned for keys down to here; deeper, a name hangs below a short window.
  it('no key hangs more than 136rem below the rail', () => {
    for (const k of KEYS) expect(k.cy - RAIL_Y, k.id).toBeLessThanOrEqual(1360);
  });

  it('every key lies in its own era’s stretch of the board', () => {
    for (const k of KEYS) {
      const next = ERAS.find(e => e.id === k.era + 1);
      expect(k.cx, k.id).toBeGreaterThanOrEqual(ERAS[k.era - 1].from);
      if (next) expect(k.cx, k.id).toBeLessThan(next.from);
    }
  });
});

describe('key pictures', () => {
  const withPhoto = KEYS.filter(k => k.photo);

  // The app's own lookup, so a name it could not load (wrong case, a format it does not glob) fails.
  it.each(withPhoto.map(k => [k.id, k]))('%s names a picture the app can load', (_, key) => {
    expect(photoUrl(key.photo)).toBeTruthy();
  });

  it.each(withPhoto.map(k => [k.id, k]))('%s says where its picture came from', (_, key) => {
    expect(IMAGE_SOURCES[key.photoSource]).toBeDefined();
  });

  it('every key says what its picture shows, or the picture it is waiting for', () => {
    for (const key of KEYS) expect(key.image, key.id).toBeTruthy();
  });
});
