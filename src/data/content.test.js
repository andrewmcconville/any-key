import { describe, expect, it } from 'vitest';
import { IMAGE_SOURCES, KEYS } from './content';
import { photoUrl } from '../lib/photos';

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
