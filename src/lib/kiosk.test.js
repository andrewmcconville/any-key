import { beforeEach, describe, expect, it } from 'vitest';
import { readKioskFlag } from './kiosk';

beforeEach(() => localStorage.clear());

describe('the kiosk flag', () => {
  it('is off unless asked for', () => {
    expect(readKioskFlag('')).toBe(false);
  });

  it('turns on with ?kiosk=1 and stays on without it', () => {
    expect(readKioskFlag('?kiosk=1')).toBe(true);
    expect(readKioskFlag('')).toBe(true);
  });

  it('turns off again with ?kiosk=0', () => {
    readKioskFlag('?kiosk=1');
    expect(readKioskFlag('?kiosk=0')).toBe(false);
    expect(readKioskFlag('')).toBe(false);
  });

  it('ignores other values, whichever way it was set', () => {
    expect(readKioskFlag('?kiosk=yes')).toBe(false);
    readKioskFlag('?kiosk=1');
    expect(readKioskFlag('?kiosk=yes')).toBe(true);
    expect(readKioskFlag('')).toBe(true);
  });
});
