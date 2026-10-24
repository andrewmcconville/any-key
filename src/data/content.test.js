import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { IMAGE_SOURCES, KEYS } from './content';

// Vitest runs from the project root. (import.meta.url is no help here: under jsdom it is not a file URL.)
const imagesDir = path.resolve('src/assets/images');

describe('key pictures', () => {
  const withPhoto = KEYS.filter(k => k.photo);

  it.each(withPhoto.map(k => [k.id, k]))('%s names a picture that exists', (_, key) => {
    expect(fs.existsSync(path.join(imagesDir, key.photo))).toBe(true);
  });

  it.each(withPhoto.map(k => [k.id, k]))('%s says where its picture came from', (_, key) => {
    expect(IMAGE_SOURCES[key.photoSource]).toBeDefined();
  });

  it('every key says what its picture shows, or the picture it is waiting for', () => {
    for (const key of KEYS) expect(key.image, key.id).toBeTruthy();
  });
});
