# Any Key

A touch-kiosk collecting game: fourteen keyboard keys everyone has pressed, arranged by the year each first appeared, in four eras. Tap a key to read what the press actually does, press it to collect it, collect two in an era to unlock the next.

Built as the lo-fi prototype for UWM ART 424 "Catalog & Curate". The Figma file is the source of truth for content and layout; this app mirrors the **p2.6 Lo-Fi Wireframe** page.

## Stack

Vue 3 (Composition API, `<script setup>`), Vite, Pinia, Vue Router. No UI library; styles are hand-written against the Figma grid.

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (http://127.0.0.1:5173 by default). `npm run build` writes a static site to `dist/` that can be served from any host, since the router uses hash history and the Vite base is relative.

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`, which builds the app and publishes `dist/` to GitHub Pages at https://andrewmcconville.github.io/any-key/. The repo's Pages source must be set to **GitHub Actions** (Settings → Pages → Build and deployment → Source); the "deploy from a branch" mode serves the raw repo and the app will not load.

The app is portrait and sized to a 9:16 stage, so on a desktop browser it sits centred; on a phone or kiosk it fills the screen.

## Structure

```
src/
  main.js              app entry: Pinia, router, global styles
  App.vue              the portrait stage
  router/index.js      routes + the start-screen guard
  stores/game.js       collection state, unlock + achievement rules, localStorage persistence
  stores/ui.js         toast, scroll-to-era requests, era in view
  data/content.js      the 14 keys, eras, achievements and all copy; node positions derived here
  assets/styles.css    global styles. The Figma board is 1440 canvas px wide and 1rem = 10 canvas px,
                       so a Figma value of 192 becomes 19.2rem. Type sizes and the minimum control size are
                       tokens on :root (--text-*, --lh-*, --tap, --icon); change the ramp there, not per component
  stores/tokens.js     the type ramp as live values; writes the --text-*/--lh-* variables on :root
  stores/colors.js     the colour tokens as live OKLCH values; writes --ink, --paper, … on :root
  lib/oklch.js         OKLCH → CSS string and → sRGB hex
  stores/swing.js      scroll physics: each key's lag behind the rail as the board scrolls, the springs that settle it, and their knobs
  stores/panels.js     floating panels: open state, position and stacking order
  components/          HudTop, HudBottom, EraDots, TimelineBoard, TimelineNode, ToastBanner, ModalShell, AppButton,
                       CloseButton, FloatingPanel (a draggable window), PanelHost (the layer panels live in)
  panels/              design-tool panels: TypeTokensPanel (sliders for every type token),
                       ColorsPanel (a picker per colour token, plus opacity for the scrim)
  views/               TimelineView (the board) and one view per overlay:
                       Start, KeyDetail, Stats, About, Reset, Completion
docs/                  design reviews
```

## Routes

Every overlay is a child route of the timeline, so the board stays mounted and keeps its scroll position underneath a modal.

Overlays form a stack in browser history: opening one is a history push and closing it (× button, Esc, Got it, Cancel) is a history back, so you land wherever you came from, even another overlay, and the browser or phone back button does the same thing. Reset and Start over unwind the whole stack to the board. See `src/composables/useOverlayNav.js`.

| Route | Screen |
|---|---|
| `#/` | Timeline board with HUDs |
| `#/start` | Start screen (forced until the visitor presses any key) |
| `#/key/:id` | Key detail + Press to collect |
| `#/stats` | Stats and achievements |
| `#/menu`, `#/about`, `#/reset` | The menu and its modals |
| `#/complete` | Completion screen after the 14th key |

## Design tools

Menu → Design tools opens floating panels: small windows you can drag around by their title bars, like a desktop app, that stack with the last-touched one on top. **Typography** lists every type token rendered in its own style with a slider underneath; moving a slider changes the `--text-*` variable on `:root` (and its line-height in proportion) so the whole app updates live. **Colours** gives every colour token lightness, chroma and hue sliders (the palette is authored in OKLCH, so lightness steps look even and hue can change without the colour going muddy), plus an opacity slider for the scrim; the readout shows the nearest sRGB hex. **Corona** tunes the glow round the HUD's key count, a shape whose edge is Perlin noise drifting in time: its speed, stand-off, flare and ripple, glow and fall-off, blur and hole, with Copy values giving the defaults block for `stores/corona.js`. **Collect** plays the collect effect on demand (a cap flying from the button to the gauge, its trail, the corona's flare) and tunes its timings and sizes the same way, for `stores/flight.js`. **Era ring** plays the ring's stretch between eras and sets its duration, lag and the easing of each edge, the `--ring-*` tokens on `:root`. **Scroll physics** tunes how the keys swing from the rail as the board scrolls (inertia, max lag, frequency, damping, how connector length slows the swing, the key's tilt, the connector's bend and how far the name and year trail it), over a live trace of every key's lag; its play button flicks every key from full lag, for `stores/swing.js`. The windows themselves are exempt from what they change: `PanelHost` copies the stylesheet's `:root` tokens onto its own layer at mount, so a slider restyles the app underneath and never the tool in your hand. None of these persists: a refresh returns to the values in the code (only the game state is saved), and each has a Copy values button that puts the current values on the clipboard as a `:root` block ready to paste into `styles.css`. `FloatingPanel` is reusable: give it an id and a title, and the panels store keeps its position and brings the last-touched panel to the front, so more tools can be added to `PanelHost.vue`.

## Rules implemented

- Era I is open at start; collecting 2 keys in an era unlocks the next one and shows a toast. The board stays where the player is; tapping the toast scrolls to the new era.
- HUD dots: dashed = locked, outlined with ✓ = cleared, filled = era in view.
- Achievements: There is no Any key, First press, Era I–IV cleared, Full set.
- Collecting the 14th key shows the Completion screen; Reset (or Start over) clears everything and re-locks Eras II–IV.
- Any physical key press dismisses the start screen; Esc closes modals.
