# Any Key

A touch-kiosk collecting game: fourteen keyboard keys everyone has pressed, arranged by the year each first appeared, in four eras. Tap a key to read what the press actually does, press it to collect it, collect two in an era to unlock the next.

Built as the lo-fi prototype for UWM ART 424 "Catalog & Curate". The Figma file is the source of truth for content; the app began as a port of its **p2.6 Lo-Fi Wireframe** page and has since moved past it, with key pictures on the board, a key gauge and hamburger menu in the top bar, the era dots in the bottom bar, and the collect flight.

## Stack

Vue 3.5 (Composition API, `<script setup>`), Vite 8, Pinia 4, Vue Router 5, Vitest 5. No UI library; styles are hand-written against the Figma grid.

## Run it

Needs Node 24 LTS (the `engines` field in package.json gives the full range); the deploy workflow builds on Node 24 too. Vite 8 builds for Chrome and Edge 111+, Firefox 114+ and Safari 16.4+, so a kiosk browser older than that is not supported.

```bash
npm install
npm run dev
```

Then open the URL Vite prints (http://127.0.0.1:5173 by default). `npm run build` writes a static site to `dist/` that can be served from any host, since the router uses hash history and the Vite base is relative.

## Tests

```bash
npm test
```

Vitest runs in jsdom; `npm run test:watch` reruns on save. Tests sit beside the code they cover as `*.test.js`: the game rules (`stores/game.test.js`), the overlay stack against real browser history (`composables/useOverlayNav.test.js`), closing a card during the collect beat (`views/KeyDetailView.test.js`), modal focus (`components/ModalShell.test.js`), the notice (`stores/ui.test.js`), the kiosk idle reset and its flag, and the key pictures' files and sources (`data/content.test.js`).

## Kiosk mode

A gallery kiosk resets itself for the next visitor. Open the app once on that device with `?kiosk=1` before the `#` (for example `https://andrewmcconville.github.io/any-key/?kiosk=1`); the device remembers, and `?kiosk=0` turns it off. After two minutes without a touch or a key, "Still there?" counts down from 30 seconds; any key or touch keeps the visitor's place. At zero the collection resets, overlays and design windows close, and the start screen comes back. Phones and desktops never get this, so nobody loses progress for putting a phone down. See `src/lib/kiosk.js` and `src/components/IdleReset.vue`.

## Images

The eight key pictures in `src/assets/images` are AI-generated with ChatGPT (OpenAI), not photographs; four still carry OpenAI's C2PA credentials. Each key with a picture names its source (`photoSource`, looked up in `IMAGE_SOURCES` in `src/data/content.js`), its card credits the picture, and About explains. A real photograph would get its own entry in `IMAGE_SOURCES` with the photographer and licence. The card itself still shows a placeholder box where the picture will go.

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`, which builds the app and publishes `dist/` to GitHub Pages at https://andrewmcconville.github.io/any-key/. The repo's Pages source must be set to **GitHub Actions** (Settings → Pages → Build and deployment → Source); the "deploy from a branch" mode serves the raw repo and the app will not load.

The app is portrait and sized to a 9:16 stage, so on a desktop browser it sits centred; on a phone or kiosk it fills the screen.

## Structure

```
src/
  main.js              app entry: Pinia, router, global styles
  App.vue              the portrait stage: routes, the collect flight, the kiosk idle reset, design windows
  router/index.js      routes + the start-screen guard
  stores/game.js       collection state, unlock + achievement rules, localStorage persistence
  stores/ui.js         the notice (unlocks, locked keys), scroll-to-era requests, era in view, the collect flight
  data/content.js      the 14 keys, eras, achievements, image sources and all copy; node positions derived here
  assets/images/       the key pictures (AI-generated, see Images)
  assets/styles.css    global styles. The Figma board is 1440 canvas px wide and 1rem = 10 canvas px,
                       so a Figma value of 192 becomes 19.2rem. Type sizes and the minimum control size are
                       tokens on :root (--text-*, --lh-*, --tap, --icon); change the ramp there, not per component
  stores/tokens.js     the type ramp as live values; writes the --text-*/--lh-* variables on :root
  stores/colors.js     the colour tokens as live OKLCH values; writes --ink, --paper, … on :root
  lib/oklch.js         OKLCH → CSS string and → sRGB hex
  stores/swing.js      scroll physics: each key's lag behind the rail as the board scrolls, the springs that settle it, and their knobs
  stores/panels.js     design windows: open state, position and stacking order
  stores/flight.js     the collect effect's knobs (the cap's flight, the beat before the card closes)
  stores/shape.js      borders and radii as live values
  stores/motion.js     durations and easings as live values
  stores/corona.js     the glow round the gauge
  stores/ring.js       the era ring's stretch between eras
  stores/inspect.js    the Inspect window's picked element and its bindings
  stores/undo.js       Cmd+Z / Ctrl+Z for the design windows
  composables/         useOverlayNav (overlays as a history stack), useCopyText, useRemPx
  lib/                 kiosk (the kiosk flag and idle timings), photos, oklch, noise (the corona's edge),
                       bindings (which tokens an element uses), flash, replay (Play buttons run the real motion)
  components/          HudTop (menu, gauge, stats), HudBottom + EraDots, TimelineBoard, TimelineNode,
                       ToastBanner (the notice), ModalShell, AppButton, CloseButton, KeyFlight (the collect flight),
                       Corona, IdleReset (the kiosk's "Still there?"), FloatingPanel + PanelHost (design windows),
                       TokenTuner, EasingEditor, PanelActions
  panels/              design windows: TypeTokens, Colors, Shape (borders & radii), Inspect, Corona,
                       Flight (Collect), Ring (Era ring), Swing (Scroll physics)
  views/               TimelineView (the board) and one view per overlay:
                       Start, KeyDetail, Stats, Menu, About, Reset, Completion
docs/                  design review, feature research and mobile app-shell research; the first two carry dated status notes
any-key-sitemap.png    the 20 Oct sitemap; out of date (see the status note in the design review)
```

## Routes

Every overlay is a child route of the timeline, so the board stays mounted and keeps its scroll position underneath a modal.

Overlays form a stack in browser history: opening one is a history push and closing it (× button, Esc, Cancel, Back to board) is a history back, so you land wherever you came from, even another overlay, and the browser or phone back button does the same thing. Reset and Start over unwind the whole stack to the board. See `src/composables/useOverlayNav.js`.

| Route | Screen |
|---|---|
| `#/` | Timeline board with HUDs |
| `#/start` | Start screen (forced until the visitor presses any key) |
| `#/key/:id` | Key detail + Press to collect |
| `#/stats` | Stats and achievements |
| `#/menu`, `#/about`, `#/reset` | The menu and its modals |
| `#/complete` | Completion screen after the 14th key |

## Design tools

Menu → Design tools opens floating panels: small windows you can drag around by their title bars, like a desktop app, that stack with the last-touched one on top. **Typography** lists every type token rendered in its own style with a slider underneath; moving a slider changes the `--text-*` variable on `:root` (and its line-height in proportion) so the whole app updates live. **Colours** gives every colour token lightness, chroma and hue sliders (the palette is authored in OKLCH, so lightness steps look even and hue can change without the colour going muddy), plus an opacity slider for the scrim; the readout shows the nearest sRGB hex. **Corona** tunes the glow round the HUD's key count, a shape whose edge is Perlin noise drifting in time: its speed, stand-off, flare and ripple, glow and fall-off, blur and hole, with Copy values giving the defaults block for `stores/corona.js`. **Collect** plays the collect effect on demand (a cap flying from the button to the gauge, its trail, the corona's flare) and tunes its timings and sizes the same way, for `stores/flight.js`. **Era ring** plays the ring's stretch between eras and sets its duration, lag and the easing of each edge, the `--ring-*` tokens on `:root`. **Scroll physics** tunes how the keys swing from the rail as the board scrolls (inertia, max lag, frequency, damping, how connector length slows the swing, the key's tilt, the connector's bend and how far the name and year trail it), over a live trace of every key's lag; its play button flicks every key from full lag, for `stores/swing.js`. The windows themselves are exempt from what they change: `PanelHost` copies the stylesheet's `:root` tokens onto its own layer at mount, so a slider restyles the app underneath and never the tool in your hand. ⌘Z (Ctrl+Z) while a window is open takes the last change back, a step at a time: a slider drag is one step, Reset all is one step, and so is an Inspect rebind. None of these persists: a refresh returns to the values in the code (only the game state is saved), and each has a Copy values button that puts the current values on the clipboard as a `:root` block ready to paste into `styles.css`. `FloatingPanel` is reusable: give it an id and a title, and the panels store keeps its position and brings the last-touched panel to the front, so more tools can be added to `PanelHost.vue`.

The Design tools group shows in every visitor's Menu today, kiosk or not. Hiding it from visitors is planned for when the app goes live.

## Rules implemented

- Era I is open at start; collecting 2 keys in an era unlocks the next one.
- Collecting flies the key's cap to the gauge and closes the card a beat later. Anything a card adds later plays when the card opens, never in the moment after the press.
- An unlock is announced by a notice under the top bar once the cap lands. It has no timer: it stays until the visitor taps GO TO ERA, reaches that era, opens an overlay, or dismisses it. The board never moves by itself.
- Tapping a locked key shows a notice saying which era is locked and how many more keys in the era before it open it, with GO TO ERA for that era.
- HUD era dots: dashed = locked, ✓ = cleared; one ring slides to the era in view. Every dot jumps to its era.
- Achievements: There is no Any key, First press, Era I–IV cleared, Full set.
- Collecting the 14th key shows the Completion screen, with Back to board, View stats and Start over. Reset (or Start over) clears everything, re-locks Eras II–IV and brings the start screen back.
- Any physical key press dismisses the start screen; Esc closes modals.
- While an overlay is open the board and both bars are inert. Each modal focuses its title as it opens (the start screen takes no focus), and focus returns to whatever opened the overlays when they close. Notices hand focus on when their own buttons close them.
- In kiosk mode only, two minutes without input brings up "Still there?" and a 30 second countdown, then the start screen (see Kiosk mode).
