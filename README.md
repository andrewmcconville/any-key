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
  components/          HudTop, HudBottom, TimelineBoard, TimelineNode, ToastBanner, ModalShell, AppButton, CloseButton
  views/               TimelineView (the board) and one view per overlay:
                       Start, KeyDetail, Stats, HowToPlay, About, Reset, Completion
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
| `#/how-to-play`, `#/about`, `#/reset` | The three HUD modals |
| `#/complete` | Completion screen after the 14th key |

## Rules implemented

- Era I is open at start; collecting 2 keys in an era unlocks the next one and shows a toast that scrolls the board there.
- HUD dots: dashed = locked, outlined with ✓ = cleared, filled = era in view.
- Achievements: There is no Any key, First press, Era I–IV cleared, Full set.
- Collecting the 14th key shows the Completion screen; Reset (or Start over) clears everything and re-locks Eras II–IV.
- Any physical key press dismisses the start screen; Esc closes modals.
