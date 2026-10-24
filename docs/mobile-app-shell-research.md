# Mobile app-shell research for Any Key (20 Oct 2026)

Three parallel research passes: Ionic Vue + Capacitor, the Home Assistant frontend and plain-web PWA techniques, and kiosk-grade browser APIs plus the lighter Vue mobile kits. This document is the synthesis; the per-topic sources are at the end.

## Recommendation in one paragraph

Don't adopt Ionic or any UI kit. Everything that gives an app its "shell" feel (standalone launch, no browser chrome, safe areas, no rubber-banding, screen stays awake, haptics where the platform allows them, page transitions) is available as plain web platform features, and every one of them works on a static GitHub Pages site. The one library worth adding is `@vueuse/core`, which wraps six of the kiosk APIs in composables that tree-shake to about a kilobyte each. Pull-to-refresh specifically is the feature to *not* build: on a localStorage-only app there is nothing to refresh, the timeline is a horizontal surface where a vertical pull conflicts with nothing useful, and the platforms already provide it in the places people expect it.

## What each candidate turned out to be

### Ionic Vue 9 + Capacitor
- Ionic 9.0.8 requires Vue Router 5 (we are on 4) and declares Vite 7/8 peers (we are on Vite 6). It installs with `--legacy-peer-deps` and builds, but it is a migration, not an add.
- It wants to own the app: `IonApp` → `IonRouterOutlet` → `IonPage` on every view, overlays appended to `ion-app`, its own lifecycle hooks instead of `onMounted`, and a global `structure.css` that sets `html/body` height and overflow (it would fight our viewport CSS). Our modals-as-routes pattern would have to become Ionic overlays.
- Measured cost: a minimal shell is ~219 KB gzipped JS, versus ~35 KB for our Vue + Router shell today.
- The features it offers (`ion-refresher`, sheet modals with drag-to-dismiss, page transitions, safe-area variables, `createGesture`) all run in a plain browser. Only `createGesture` is officially supported standalone outside an Ionic app.
- Capacitor adds nothing to a web deployment: StatusBar, Keyboard and SplashScreen have no web implementation; Haptics and ScreenOrientation just call `navigator.vibrate` and `screen.orientation.lock`, which we can call ourselves. Native builds would need Node 22 and Xcode 26.
- Verdict: pass. A portrait kiosk gains nothing from it, and the two visible wins (sheet drag, page transitions) are each a few lines of code on the pointer events we already use.

### Home Assistant frontend
- Lit + TypeScript + Workbox, now built on Web Awesome components. Nothing is importable into Vue, but its patterns are worth copying.
- Pull-to-refresh and edge-swipe-to-open-sidebar exist only in the native companion apps. The web frontend implements neither.
- Portable patterns: a `--safe-area-inset-*` variable layer that everything consumes instead of `env()` directly; a DOM `haptic` event mapped to `navigator.vibrate` patterns behind a user toggle; theme → `<meta name="theme-color">` sync; an "update available" toast with a countdown; and kiosk mode as a boolean flag that hides chrome rather than a separate build.

### Lighter Vue kits
| Library | Verdict |
|---|---|
| `@vueuse/core` 15 | Use. `useWakeLock`, `useIdle`, `useFullscreen`, `useScreenOrientation`, `useVibrate`, `usePointerSwipe` map straight onto the kiosk needs. ≤1.2 KB per function. |
| Vant 4 | The only full kit worth piecemeal use (Popup, FloatingPanel, PullRefresh). Still Material-ish and px-based; only if we want a ready-made sheet. |
| Quasar 2 | Tree-shakes well; `v-touch-pan` and `QPullToRefresh` are usable alone. Heavy styling to override. Maybe. |
| Embla Carousel 8 (7 KB) / Swiper 14 | Could replace the custom drag + momentum code on the timeline if it ever needs more polish (snap points, free-mode physics). |
| Konsta UI, Framework7, Vuetify | Pass: Konsta needs Tailwind 4, Framework7 needs its own router, Vuetify is a styling fight. |
| `@vueuse/gesture` | Stale (18 months). Pass. |

## Capability matrix (what the platforms actually allow)

| Capability | Mechanism | iPad / iPhone Safari | Android Chrome | Desktop Chrome | Static host |
|---|---|---|---|---|---|
| Launch without browser chrome | manifest `display: standalone` + Add to Home Screen | Yes (iOS 26 opens any Home Screen site as an app) | Yes; `fullscreen` also honoured | Install prompt | Yes |
| Keep screen awake | `navigator.wakeLock` | Safari 16.4; Home Screen apps from iOS 18.4 | 84+ | 84+ | Yes |
| Lock orientation | `screen.orientation.lock` / manifest `orientation` | No API; use Guided Access "motion off" | Yes, in fullscreen or installed | No | Yes |
| True fullscreen | `requestFullscreen()` | iPad only, with an exit button; iPhone no | Yes, hides system bars | Yes | Yes |
| Lock device to the app | OS feature | Guided Access (triple-click) | Screen pinning; Lock Task via MDM | `chrome --kiosk` | n/a |
| Inactivity reset | event timer (`useIdle`) | Yes | Yes | Yes | Yes |
| Haptics | `navigator.vibrate` | **No**, and no plans | 32+, after a user gesture | API exists, no motor | Yes |
| Disable pinch / long-press / selection | `touch-action`, `-webkit-touch-callout`, `user-select`, `gesturestart` | Yes | Yes | Yes | Yes |
| Disable browser pull-to-refresh | `overscroll-behavior-y: none` | Partial; moot in standalone mode | Yes | Yes | Yes |
| Block edge back-swipe | – | Impossible in Safari; disappears in standalone mode | Hash router keeps it in-app | – | – |
| Safe areas | `viewport-fit=cover` + `env(safe-area-inset-*)` | 11.3+ | Chrome 135+ | – | Yes |
| Page transitions | View Transitions API around route changes | 18+ | 111+ | 111+ | Yes |
| Audio feedback | one `AudioContext`, resumed on first touch | Must start inside a touch handler | Same | Same | Yes |
| Offline / install | `vite-plugin-pwa` 2 (`generateSW`, `autoUpdate`) | Yes | Yes | Yes | Yes, with `base` set |

## Proposed plan, in tiers

### Tier 1: touch hygiene and safe areas (about an hour)
- `overscroll-behavior: none` on `html/body`; `touch-action: pan-x` on the board and `manipulation` elsewhere; `user-select: none` and `-webkit-touch-callout: none` globally; `preventDefault` on `contextmenu` and `gesturestart`.
- Safe-area variable layer copied from Home Assistant, consumed by the two HUD bars and the modal panels, not the board.
- `<meta name="theme-color">` pair for light and dark.

### Tier 2: installable, standalone PWA (about two hours including icon export)
- `vite-plugin-pwa` with `generateSW` + `registerType: 'autoUpdate'`, `display: standalone`, `orientation: portrait-primary`, maskable icons at 192 and 512.
- Document the kiosk setup: Add to Home Screen, then Guided Access on iPad or screen pinning on Android. This is what removes the browser chrome and the back-swipe.

### Tier 3: kiosk behaviours via VueUse (about two hours)
- `useWakeLock` on mount, re-requested on `visibilitychange`.
- `useIdle(180_000)`: after three minutes without a touch, reset progress and return to the start screen (the existing Reset logic already does this).
- `useFullscreen` behind a tap, Android only.
- `useVibrate` guarded by `isSupported`, fired on collect and era unlock, with the user-toggle pattern from HA. iPad will stay silent.
- Audio: one `AudioContext` resumed on first `pointerdown`, decoded buffers for the per-key feedback sounds (click, clunk, zip, strike, tone, haptic).

### Tier 4: polish (optional, a day)
- View Transitions wrapper on route changes, feature-detected; keep the modal routes.
- Sheet-style key detail: drag the modal down to dismiss, built on the pointer-event code the board already uses.
- Replace the custom drag + momentum with Embla or Swiper free-mode if the timeline needs snap points.

### Not recommended
- Pull-to-refresh. Nothing to refresh, and in standalone mode on iOS it doesn't exist anyway. If "refresh" means "start over", that is the Reset button and the idle timer.
- Ionic, Capacitor, Konsta, Framework7, Vuetify as kits.

## Target hardware (answered 20 Oct 2026)

Any device: phone, tablet, laptop, desktop, or a Raspberry Pi driving a touch monitor. So nothing above can be assumed; every shell feature is a progressive enhancement that is feature-detected and silently absent where unsupported. What that means per device:

| Device | Launch / lock-down | Works | Absent |
|---|---|---|---|
| iPhone | Add to Home Screen (standalone) | wake lock (18.4+), safe areas, transitions, audio | haptics, orientation lock, fullscreen |
| iPad | Home Screen app + Guided Access | wake lock, fullscreen (with exit button), audio | haptics, orientation lock API (use Guided Access "motion off") |
| Android phone / tablet | Installed PWA + screen pinning | everything, including haptics, orientation lock, immersive fullscreen | – |
| Laptop / desktop | Browser tab, or `chrome --kiosk` | mouse drag + momentum (already built), keyboard (Esc, any key), transitions, audio | haptics (no motor), touch-only hints |
| Raspberry Pi + touch monitor | Chromium in `--kiosk` mode on boot, the usual Pi signage setup | touch, wake lock, fullscreen, audio via HDMI/3.5 mm, idle reset | haptics; orientation is set at the OS level, not by the page |

Consequences for the plan:
- Tier 1 (touch hygiene) and Tier 3's idle reset and audio are the items that pay off on every device, so they come first.
- The Pi is the purest kiosk: Chromium `--kiosk --noerrdialogs --disable-pinch --overscroll-history-navigation=0` plus `xset s off` style screen-blanking control gives the whole shell from the OS side; the page only needs wake lock as a belt-and-braces measure and the idle reset. A short `docs/kiosk-setup.md` with the Pi autostart line, iPad Guided Access steps and Android screen pinning steps would be worth writing alongside Tier 2.
- The "swipe to explore" hint should become device-aware: "swipe" on touch, "drag or scroll" with a mouse, detected from the first pointer type seen rather than from user-agent sniffing.
- Haptics stay a guarded extra (Android only in practice); audio becomes the primary feedback channel because it is the one that works everywhere.

## Open questions for Andrew
1. What should "refresh" mean, if anything? Reset progress, or reload content? The answer decides whether Tier 4 includes any pull gesture.
2. Do you want sounds? The content has a feedback type per key, which suggests yes, and that is a Tier 3 item. On an any-device target it is the one feedback channel that works everywhere.

## Sources
Ionic: ionicframework.com/docs (vue/quickstart, vue/navigation, vue/lifecycle, api/modal, api/refresher, api/content, utilities/gestures, theming/css-shadow-parts, updating/9-0, reference/support); capacitorjs.com/docs (web, plugins/web, apis/haptics, apis/status-bar, apis/keyboard, apis/screen-orientation); npm registry and a scratch Vite build for sizes.
Home Assistant: github.com/home-assistant/frontend (service-worker.ts, register-service-worker.ts, ha-drawer.ts, main.globals.ts, haptic-mixin.ts, external_app_entrypoint.ts); home-assistant/core frontend/helpers.py; companion.home-assistant.io (gestures, haptics); github.com/NemesisRE/kiosk-mode.
Web platform: MDN browser-compat-data 8.1.6; developer.chrome.com (edge-to-edge, overscroll-behavior, view-transitions, wake-lock, idle-detection, autoplay); webkit.org blogs and bugs 254545, 265438, 275947, 285120, 240183; support.apple.com/111795 (Guided Access); developer.android.com lock-task-mode; vite-pwa-org.netlify.app.
Libraries: vueuse.org; konstaui.com; framework7.io; quasar.dev; vuetifyjs.com; github.com/youzan/vant; swiperjs.com; embla-carousel; npm registry and bundlephobia for versions and sizes (20 Oct 2026).
