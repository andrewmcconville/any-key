/**
 * Kiosk mode: the app running unattended in a gallery. Turn it on once per device by opening the
 * app with ?kiosk=1 in the address (before the #, e.g. .../any-key/?kiosk=1), and off with ?kiosk=0;
 * the device remembers either. Phones and desktops never get it, so nobody loses their progress
 * for putting the phone down.
 */
const STORAGE_KEY = 'any-key/kiosk';

export const IDLE_MS = 120_000;       // no input for this long and "Still there?" appears
export const COUNTDOWN_MS = 30_000;   // how long it waits; WCAG 2.2.1 asks for at least 20 seconds

/** Whether this device is a kiosk, after taking any ?kiosk=1 or ?kiosk=0 in the address to heart. */
export function readKioskFlag(search = window.location.search) {
  const asked = new URLSearchParams(search).get('kiosk');
  try {
    if (asked === '1' || asked === '0') localStorage.setItem(STORAGE_KEY, asked);
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch (_) {
    return asked === '1';   // storage blocked: only the address can say so
  }
}
