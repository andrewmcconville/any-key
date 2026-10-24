# Any Key feature research (23 Oct 2026)

## Summary

Thirteen research lenses (cozy collecting, field-guide apps, museum interactives, game compendia, timeline interactives, gamification and delight, keyboard culture, kiosk take-away, narrative discovery, accessibility, mechanism and imagery, keys as controls, cozy toys and companions) produced 82 feature proposals backed by about 290 exemplar citations across roughly 200 products, exhibitions, standards and papers. Each proposal went to a three-judge panel: a curator scored concept fit against the premise ("what actually happens when you press it"), the tone and the three identities; a builder scored feasibility in the Vue 3 + Pinia static site and the unattended-kiosk risks; a fact-checker fetched every cited page and ran a visitor test (would a 3 to 8 minute kiosk visitor, or a later phone visitor, use it). 71 proposals survived with at least two keeps, 11 were cut, and about 20 of the 290 exemplars could not be verified from a reachable page. The headline recommendation is the cluster that makes the press perform its own answer: pressing the real key to collect, a live press demo in the card, and travel, foley and captions at the collect moment. Behind that come the Keyboard Shelf, hand-authored cross-references (Related Keys strip, set pairings), the attract loop and idle reset (a correctness fix, since today the next visitor inherits the last visitor's board) and colour returning by era.

## Recommended first

Scores are curator / builder / fact-check, each out of 5. None of the ten needs a backend.

### Keyboard Shelf with silhouettes

In Any Key: A TIMELINE / SHELF toggle flips the board to one stylised keyboard on the 24 px grid, drawing only the fourteen keys over a faint board outline. Collected keys are filled CSS keycaps in an era colourway; missing ones are recessed grey silhouettes, unnamed while their era is locked. Command and Windows sit side by side, Emoji and Dictation on a glass row, Correct as a dashed ghost captioned "1973 · no modern board has it". Tapping a cap opens the existing modal; under about 600 px the shelf becomes an artisan-tray grid.

Seen in: [Pokémon GO Pokédex](https://niantic.helpshift.com/hc/en/6-pokemon-go/faq/2345-how-do-i-find-specific-pokemon/) (silhouettes until caught); [Animal Crossing: New Horizons museum](https://sourcegaming.info/2023/03/20/center-stage-the-museum-animal-crossing-series/) (empty halls are the hook); [Stardew Valley museum](https://store.steampowered.com/app/413150/Stardew_Valley/) (donate to fill shelves); [KBDfans Bliss Artisan Tray](https://kbdfans.com/products/bliss-artisan-tray) (keycap display tray); [Keyboard Layout Editor](https://github.com/iandoug/keyboard-layout-editor) (keycaps in HTML and CSS); [GMK Sky Dolch](https://matrixzj.github.io/docs/gmk-keycaps/Sky-Dolch/) (themed colourway; weak, consider replacing).

Effort: M, no backend. Builder's variant: a boardMode flag in the ui store rather than a route, a 14-row layout table in content.js, era keycap profiles as custom-property sets on .btn--keycap.

Panel: 4 / 5 / 4. Tweak: make the shelf the single collection view and strip the circle grid from Stats.

### Related Keys strip

In Any Key: Under "Why it belongs", two or three small keycap cards in the board's three node states: "Took the carriage back first: Backspace", "Nothing alone, like: Command". Tapping one closes the modal and scrolls the board to that node with a pulse; a locked target reads "? · Era III" and scrolls to the locked rail line without naming the key. The strip appears only after the key is collected, so a tap never abandons an uncollected key.

Seen in: [V&A Explore the Collections, You May Also Like](https://www.vam.ac.uk/blog/digital/you-may-also-like) (image-led facet row, random within facets); [Science Museum Group, Remington No.1](https://collection.sciencemuseumgroup.org.uk/objects/co38234/remington-no-1-typewriter-and-hinged-metal-cover) (Related Objects card row; no dates on the cards).

Effort: S, no backend. Builder's variant: related: [{ id, rel }] per key in content.js, ui.scrollToKey beside scrollToEra, a 1.2 s pulse suppressed under reduced motion.

Panel: 4 / 5 / 4. Tweak: author every link as a lineage or behaviour relation in the house voice; the exemplars rely on catalogue scale, the model here is a printed guide's "compare with" box.

### Set pairings and the curator's notes

In Any Key: Five cross-era pairs: Backspace + Correct ("two ways to take it back"), Command + Windows ("the rivals"), Shift + Caps Lock, Esc + Emoji, and Ctrl + Command ("Nothing alone." twice) replacing the thin Return + Dictation. Each modal carries a "Pairs with" line; collecting the second key delivers a two-sentence curator's note through the existing close-then-toast pipeline and lights a PAIRS row in Stats. No dotted lines on the board: four pairs span 1800 to 4000 canvas px and would run off-frame.

Seen in: [Animal Crossing: New Horizons Museum Day stamp rally](https://nookipedia.com/wiki/International_Museum_Day) (a plaque per completed gallery); [Dorfromantik](https://store.steampowered.com/app/1455840/Dorfromantik/) (small set-goals sustain the session); Stardew Valley museum milestone rewards (unverified, wiki blocked the fetcher).

Effort: M, S for the code; no backend. Builder's variant: a PAIRS array in content.js, pairsFound persisted beside collected and cleared on reset, a one-slot queue so the note precedes the era toast.

Panel: 4 / 5 / 4. Tweak: cut the 7/14 note (collection order is not forced), put the 14/14 line on Completion, keep pairs out of ACHIEVEMENTS.

### Range strip and status line

In Any Key: A "Range" block under the meta line: five cells (Typewriter, Terminal, PC, Mac, Phone) hatched where the key once lived but no longer does, plus a status tag with one wry line: Abundant, Common, Local ("Command. Local. Mac only, borrowed by iPad keyboards."), Extinct ("Correct. Extinct. Last seen on a Selectric."). The tag doubles as the reason some keys collect by button only. A static keyboard outline is tier two; the "You are in its range" hint shows on phone and desktop only. Fact-check first: Dictation is on Apple's 2021 Magic Keyboard, Tab is absent from phone glass, Windows is Local like Command.

Seen in: [Audubon Bird Guide](https://www.audubon.org/menu/audubon-bird-guide-app) (range maps per species); [Flora Incognita](https://floraincognita.com/flora-incognita-app/) (fact sheets follow the user's location); [Hyrule Compendium](https://github.com/gadhagod/Hyrule-Compendium-API) (common locations field per entry); [ACNH Critterpedia](https://nookipedia.com/wiki/Critterpedia) (fixed metadata block per entry).

Effort: S for strip and tag, M with outlines; no backend. Builder's variant: range and status fields per key, outlines from row data in one KeyboardMap.vue, a kiosk flag that hides the platform line.

Panel: 4 / 5 / 4. Tweak: drop tap-to-jump on the map; the timeline is the navigation.

### Live press demo in the card

In Any Key: Under "What the press does", a one-line type sample performs the answer. PRESS TO COLLECT runs the demo on its first press and collects; later presses replay it, so the card keeps one keycap. Backspace eats a letter, Shift capitalises the next, Tab jumps the carriage, Return drops a line, Caps Lock lights an LED, Correct lifts a letter off, Emoji opens a three-glyph picker. The physical key works while the card is open (preventDefault on Tab, Space, Backspace, F1); Esc, Windows and Command demo from the keycap only. System keys get one caption, "acts on the machine, not the page"; Dictation is a labelled simulation with no microphone request. The line is a div, never an input.

Seen in: [Antique Typewriter, arcade.pirillo.com](https://arcade.pirillo.com/antique-typewriter.html) (each press swings a typebar, Shift drops the basket); [Shift Happens Typewriter Simulator](https://shifthappens.site/typewriter/) (ribbon, Wite-Out, margins); [Mechvibes / Klack](https://ziggit.dev/t/klack-a-mechanical-keyboard-sound-simulator/16697) (every keypress answered); OverType (no-erase Backspace) (unverified, cited page gone).

Effort: L as proposed, M tiered; no backend. Tier 1 is a TypeLine primitive plus Space, Shift, Tab, Backspace, Return and Caps Lock; tier 2 adds Correct, Emoji and the system captions; the paper-versus-screen split becomes one sentence.

Panel: 5 / 4 / 4. Tweak: keep behaviours in a demos.js map keyed by key id so content.js stays data.

### Attract loop and idle reset

In Any Key: Behind a ?kiosk=1 flag persisted to localStorage, so phones never lose progress. After about 120 s idle the HUD dims, collected keycaps replay a depress, Caps Lock's LED breathes and the board glides from 1874 to 2011, pausing at one key per era to set its "Why it belongs" line large. A sticky countdown, "Still there? Any key keeps your place · 30", runs from 30 (WCAG asks at least 20); at zero a hardReset clears state and sets started to false so the router shows PRESS ANY KEY. The first touch only wakes the kiosk. The timer pauses on the key and reset routes with a 5 min ceiling; the composition nudges 8 to 16 px per cycle against burn-in.

Seen in: [CMS Design System Idle Timeout](https://design.cms.gov/v/5.0.2/components/idle-timeout/) ("Are you still there?" with onTimeout); [Kartend Attract Mode](https://github.com/EtherAura/Kartend/wiki/Attract-Mode) (120 to 600 s idle is the comfortable band); [Touchscreen museum design guide](https://touchscreenwebsite.com/blog/interactive-touchscreens-museums-galleries-complete-guide/) (attract visuals when idle); [Neko Atsume](https://apps.apple.com/us/app/neko-atsume-kitty-collector/id923917775) (the world ran while you were away); [Animal Crossing: New Horizons museum](https://sourcegaming.info/2023/03/20/center-stage-the-museum-animal-crossing-series/) (ambience in filled halls); MRI OnLocation (unverified); Stony Brook kiosk study (unverified).

Effort: S for the reset, M with the tour; no backend. Builder's variant: a 40-line idle composable, game.hardReset() writing started=false, a sticky ui.countdown in place of the 2.2 s toast.

Panel: 4 / 5 / 4. Tweak: ship the reset first; drop or demote the "collected by the last visitor" line.

### Colour returns by era

In Any Key: The board opens in ink on paper with a faint era hint on headers and ring dots. Each collected key tints its node, label rule and HUD dot in its era colour; clearing an era washes the region over 600 ms, instantly under reduced motion. Colours come from the hardware and are named in the modal: black enamel and nickel, Selectric beige and red, beige ABS and Windows 95 teal, glass white and iOS blue. Fills, borders and dots take the hue; type stays ink so AA contrast never depends on the palette.

Seen in: [Cozy Grove](https://www.pocketgamer.com/articles/086169/cozy-grove-review-a-fun-little-break-each-day/) (a grey island regains colour as you help the spirits; paced over real days there, one session here).

Effort: S, no backend. Builder's variant: --era-1 to --era-4 tokens on :root, style="--era: var(--era-N)" on region, node, label and dot, one rule each; give .rail-break the region tint so its paper mask does not show.

Panel: 4 / 5 / 4. Tweak: pair with the idle reset so every visitor gets the grey-to-colour arc.

### The collect moment: travel, foley, catch line

In Any Key: PRESS TO COLLECT sinks on pointerdown and releases on pointerup with an easing curve and one sound per feedback type: click, clunk, zip, strike, tone; "none" is a drawn flat line and the printed word. Sounds are synthesised in Web Audio with slight pitch jitter, so no files and no licensing; owned recordings can replace presets later. The onomatopoeia prints on the keycap so a muted gallery stays legible; "haptic" uses navigator.vibrate on Android. Collected entries gain a LISTEN keycap with a small waveform. One mute keycap in the Esc menu, not persisted.

Seen in: [Unpacking](https://www.gamedeveloper.com/marketing/auditory-tales-from-the-making-of-zen-puzzler-unpacking) (sound follows material); [ACNH Critterpedia](https://nookipedia.com/wiki/Critterpedia) (first catch gets an exclamation, repeats skip it); [Klack / Thock / Mechvibes](https://9to5mac.com/2023/04/05/klack-app-mechanical-keyboard-sound-effects-for-mac/) (randomised pitch); [Subnautica scanner](https://subnautica.fandom.com/wiki/Scanner_(Subnautica)) (hold-to-fill ring, rejected here); [Pokédex Cry page](https://bulbapedia.bulbagarden.net/wiki/Cry) (waveform drawn as the cry plays); [Museum of Endangered Sounds](https://www.digitaltrends.com/computing/the-old-internet-built-a-museum-for-dying-tech-sounds-and-its-somehow-still-alive/) (soundboard of obsolete devices); [Josh Comeau](https://www.joshwcomeau.com/email/2025-09-25-secret-ingredient/) (randomised particle timing).

Effort: M, no backend. Builder's variant: synth-first in one shared audio module, AudioContext resumed on the start press and every pointerdown, a "speakers available" flag for the kiosk build.

Panel: 4 / 4 / 4. Tweak: no hold-to-fill, keys register on press and release; "Why it belongs" is the catch line; drop the soundboard and the volume cycle.

### Sound captions and haptic equivalents

In Any Key: On collect the caption slot shows a bracketed line for about 1.5 s, written as the physical event: Shift "[the carriage lifts]", Tab "[the carriage runs to the stop]", Ctrl and Command "[nothing, until you hold it with another key]", Emoji "[a tap of glass; this is the whole press]". Silence belongs to Ctrl and Command (feedback none), not Correct or Dictation as first proposed. On Android the types map to vibrate patterns (click 15 ms, clunk 60 ms, zip five pulses); a HAPTICS toggle appears only when 'vibrate' in navigator is true. Captions default on; a SOUND toggle waits for a sound layer.

Seen in: [The Last Door, Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/provide-captions-or-visuals-for-significant-background-sounds/) (background sounds as text, own toggle); [Xbox Accessibility Guideline 104](https://devdocs.xbox.com/gaming/accessibility/xbox-accessibility-guidelines/104) (captions for non-speech sounds); [The Last of Us Part II](https://www.playstation.com/en-us/games/the-last-of-us-part-ii/accessibility/) (vibration cues beside captions); [MDN Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API) (no-op where unsupported; Chrome on Android only in practice).

Effort: S, no backend. Builder's variant: a FEEDBACK_CAPTIONS map in content.js and a settings store at any-key/settings/v1 that RESET does not clear.

Panel: 4 / 4 / 4. Tweak: write the caption per key so each line names its own machine; dim the "Feedback:" meta line while it shows.

### Press the real key

In Any Key: With a key's modal open on the kiosk, pressing the matching physical key sinks the keycap while held and collects on release (keydown for Caps Lock and Meta); PRESS TO COLLECT stays as the touch path. The press is recorded as "pressed for real", an inner ring on the node plus one achievement, not a second counter. Command and Windows resolve from the platform so exactly one is pressable; Correct, Emoji, Dictation and the other logo key read "No such key on this machine". ModalShell gains escCloses=false for the Esc entry; Tab, Space, Enter, Backspace and F1 are cancelled. The affordance appears only after a keydown with a non-empty e.code, so phones never see it; the kiosk requests fullscreen and navigator.keyboard.lock() on PRESS ANY KEY.

Seen in: [Shift Happens, Press the right key!](https://shifthappens.site/) (press the real key; the tap fallback reveals rather than answers); [New Pokémon Snap Photodex](https://sourcegaming.info/2021/11/15/holism-new-pokemon-snaps-four-star-system/) (one photo never completes an entry); [Canadian Museum for Human Rights Universal Key Pad](https://humanrights.ca/story/seven-awesome-accessibility-features-museum) (keypad beside every kiosk); [Key to Type exhibition](https://designto.org/event/key-to-type/) (Remington Junior play station); Pokémon GO seen / caught counters (unverified); Metroid Prime scan points (unverified); Technobezz keyboard tester (unverified).

Effort: M, no backend. Needs a physical keyboard at the kiosk and OS-level hardening (Win, Alt+F4, Ctrl+W).

Panel: 4 / 4 / 4. Tweak: drop the "seen" state and the event log; one meta line, "The browser saw: ShiftLeft · 16".

## Also worth considering

Every other kept feature, grouped by theme. "In Any Key" is the panel's trimmed version, not the original pitch. "Seen in" lists verified exemplars only. None needs a backend. Score is curator / builder / fact-check.

### Collecting and display

| Feature | In Any Key | Seen in | Effort | Score |
|---|---|---|---|---|
| Plate XV and the specimen drawer | A fifteenth node past Glass at 14/14 opens an entry for the Any key (press does nothing), outside the 14; the Stats grid becomes a relative-scale keycap plate | Hyrule Compendium, Stardew Valley museum, ACNH Critterpedia | M (Plate XV alone S) | 4 / 4 / 4 |
| Face-down reveal with stamp | Keys open face-down; the press flips to image and "What the press does" with an accession stamp (venue, date); no NEW tag | Hearthstone card packs, Apple Fitness+ awards, Cooper Hewitt Pen | S | 4 / 5 / 3 |
| Mementos drawer | Reopening a collected key reveals a line-drawn artefact in a 14-slot row under Stats; reveal on first reopen, no session logic | Neko Atsume, Stardew Valley Collections | M | 4 / 4 / 2 |
| Variants strip | A read-only Relatives row (Enter, Mac Delete, Globe); only numpad Enter is detectable, so no second counter | DREDGE Aberrations, Hyrule Compendium | M | 3 / 4 / 2 |
| Write your own label | One 60-character label for the Any key on the completion screen, typed on the kiosk keyboard, session-only | Seattle Art Museum Luminous Label, Powerhouse Odditoreum, Smithsonian Learning Lab | M | 3 / 4 / 3 |

### Field-guide depth

| Feature | In Any Key | Seen in | Effort | Score |
|---|---|---|---|---|
| Compare view with "The tell" | A two-up of confusables (Backspace vs Correct, Shift vs Caps Lock) with one highlighted difference; the tell stays redacted until both keys are collected | Sibley Birds v2, Collins Bird Guide, Rockhounding.org | M | 4 / 4 / 4 |
| Macro lens with field marks | A zoomable macro per key with two or three numbered marks about the part that moves; blocked on imagery, drawn plates where hardware is unavailable | Peterson Identification System, Letterform Archive, Smithsonian Voyager, Google Art Camera | M | 4 / 4 / 4 |
| Observation stars and marginalia | PRESSED and HELD (long-press) observations reveal a struck-through curator's line; no Win or Cmd chords | New Pokémon Snap, Pikmin 4, Outer Wilds, Tunic | M | 4 / 4 / 3 |
| Specimen data sheet | A card back with No., Status, ISO 9995-7 glyph (Caps Lock is U+21EC), ASCII code and live event.code; drop travel and force figures | Pokédex entries, keycode.info, Deskthority, ISO 9995-7 table | M | 4 / 4 / 3 |
| Sources footer | Collapsed per-key "Dated from", a wry confidence line, image credit and licence; no "Cite this key" | Science Museum Group record, V&A Explore the Collections | S | 4 / 4 / 3 |
| Feedback legend, How it feels | One keycap tints node rings by feedback type with an eight-type legend; no chip filters or family achievements | Letterform Archive, V&A, sheets.works Listening Museum | S | 3 / 4 / 3 |

### Sound and touch

| Feature | In Any Key | Seen in | Effort | Score |
|---|---|---|---|---|
| Every press answers | Pressing a collected key replays its feedback and pulses the node; stray keys tick and show "Q: not catalogued" | Bongo Cat, Patatap, Mechvibes, Hidden Folks | M | 4 / 4 / 4 |
| Listening bench | Two "Hear it on" chips per key, period and modern, CC0 clips credited in About; tap plays | sheets.works Listening Museum, Keychron Switch Tester | L (M trimmed) | 3 / 3 / 4 |
| Tap-anything scenery foley | Two or three era props wiggle and sound when tapped, nothing counted; only after key sounds exist | Hidden Folks, Metamorphabet, Townscaper | M (S trimmed) | 2 / 4 / 4 |
| KEEP PRESSING zen mode | A post-14/14 mode with no counter where keys stay pressable; the fact-checker prefers a plain BACK TO BOARD | Alto's Odyssey, Patatap, Chrome Music Lab | M | 4 / 4 / 2 |

### Take-home and kiosk

| Feature | In Any Key | Seen in | Effort | Score |
|---|---|---|---|---|
| The Any-key guestbook | "If there were an Any key, what would it do?" on a keycap keyboard; staff approve before lines cycle under PRESS ANY KEY | C&G Partners NMAAHC guestbook, Ars Electronica Innovision Wall | M | 4 / 4 / 4 |
| QR handoff | A QR plus a five-character base32 code carrying version, venue and the 14-bit set; the phone merges it, achievements recomputed | Cooper Hewitt Pen, Filippini-Fantoni and Bowen MW2007, Wien Museum, Hackernoon URL state | M (S QR-only) | 4 / 4 / 3 |
| Thermal receipt | An 80 mm monospaced slip from Completion via print stylesheet and --kiosk-printing; SAVE RECEIPT off the kiosk | KHM MyCollection, ITP thesis, Poster House KASA, meSch postcards | M, needs printer | 4 / 3 / 4 |
| House tally | A reset-proof per-key ledger: "Found in 61 % of 1,204 runs", hidden under 20 runs, ranked within era | Steam global stats, Indianapolis POP Poll, Cooper Hewitt data, Counter API | S | 3 / 4 / 3 |
| Collection card | A 9:16 canvas of 14 keycaps, n of 14, date and a pinned wry line; share on phone, download on desktop, QR on kiosk | Wordle grid, Duolingo Year in Review, W3C Web Share, Shashingo | M | 3 / 4 / 3 |
| Gallery mirror | A ?mirror=1 wall window lit by the kiosk's storage events; same machine only | Indianapolis POP Poll overhead display, Cooper Hewitt tables | M, needs second display | 3 / 3 / 3 |

### Discovery and play

| Feature | In Any Key | Seen in | Effort | Score |
|---|---|---|---|---|
| Press the real key to find it | A physical key scrolls to its node and toasts "You pressed Tab. c. 1900, Era I"; navigates only; no phone text field | Send Me SFMOMA, Shift Happens, CHM Timeline, Histography | S | 4 / 4 / 4 |
| Placement bonus | An optional untimed tap-to-place on a 5 x 4 quadrant after a collect, then the true spot and one fact | Shift Happens arrange game, Deskthority Caps lock | M | 3 / 4 / 4 |
| Silhouette locks and Name It | Next-era locks show an outline and cryptic placard; a three-name NAME IT earns a mark, never early collection | Pokémon GO Nearby, Strange Horticulture, Artle, Minecraft advancements | S (M per panel) | 4 / 4 / 3 |
| Curator's Requests | One standing brief ("two keys that make no sound") from unlocked eras; five or six briefs | New Pokémon Snap, Seek by iNaturalist, Birda | M | 4 / 4 / 3 |
| Identification key | A three-step filter of 14 tiles; the fact-checker prefers inverting it into a NAME THAT KEY riddle | Merlin Bird ID, Audubon, Rockhounding.org, Arbor Day | M | 3 / 5 / 2 |
| Era verification | Pair effect fragments to keycaps, with distractors, after clearing an era; "One swap away" in amber | Chants of Sennaar, Obra Dinn, NYT Connections, Golden Idol | S | 3 / 4 / 3 |
| Clue Trail | Seven riddle stops riding the 2+2+2+1 unlock rule; the fact-checker prefers a post-completion round | British Museum trails, goSmithsonian Trek, Strange Horticulture | M | 4 / 4 / 2 |
| Still-needed list | NEXT scrolls to the nearest available uncollected node; no sheet, never names locked keys | eBird Targets, Merlin Likely Birds | S | 2 / 5 / 3 |
| Secret presses | ??? achievements (real Tab on Tab's card, Esc on completion); each needs a touch path | Steam hidden achievements, Untappd badge | S | 3 / 4 / 3 |

### Access and inclusion

| Feature | In Any Key | Seen in | Effort | Score |
|---|---|---|---|---|
| Screen-reader-first timeline | Era groups with headings, state in accessible names, one status region, focus restored on close, arrow keys; no edge sounds | MoS Boston Provocative Questions, WebbIE, Merlin and Pokémon GO on AppleVis, Trace EZ Access | M | 4 / 4 / 4 |
| Read-aloud curator voice | LISTEN speaks one sentence per utterance with a local voice and highlights it; kiosk default off | Cooper Hewitt The Senses, Kröller-Müller webReader, Reich 2006, Smithsonian guidelines | M | 3 / 4 / 4 |
| Large type toggle | An Aa keycap steps type 100 / 150 % on the .t-* tokens; mixed-case labels by default; no OpenDyslexic | Choice of Games, Overland, XAG 104, Smithsonian guidelines | S (M per builder) | 3 / 4 / 3 |
| Take Your Time | The timeout warning folds into the idle reset; the unlock toast becomes a persistent GO TO ERA II keycap; no SLOW mode | Celeste Assist Mode, Forza Horizon 5, Reich 2006, Tetralogical | S | 2 / 4 / 3 |
| Switch scan mode | Space-only input auto-scans era then key, Enter promotes to two-switch; keyboard operability first | WebbIE, Sudoku Access | M, needs a switch | 3 / 4 / 2 |
| Language keycap and plain layer | EN / ES string modules with a start-screen keycap, reverting on idle; no PLAIN toggle | Smithsonian guidelines, MoS Boston 2015 | M | 2 / 4 / 3 |
| ACCESS presets | A start-screen ACCESS keycap with a flat toggle panel; presets only once toggles exist | The Last of Us Part II, Celeste, XAG 104, Smithsonian guidelines | S panel, L with prerequisites | 3 / 3 / 3 |

### Mechanism and cross-section

| Feature | In Any Key | Seen in | Effort | Score |
|---|---|---|---|---|
| Signal path, finger to mark | A vertical 5 to 9 node list with a travelling dot and plain glosses (Space: finger, lever, escapement, carriage); four hero keys first | Wikipedia mechanism articles, engineerguy Selectric video | M | 4 / 4 / 4 |
| Press scrubber with cross-section | A keycap handle on a Rest / Actuation / Bottom-out rail drives an SVG cutaway; cutaways must match the real mechanisms, not era archetypes | Ciechanowski Mechanical Watch, ScrollyVideo, lottie-interactivity, Voyager API | L | 4 / 3 / 4 |
| Force-travel tick | An actuation tick on the rail fires the feedback once; measured curves only for computer-era keys | kbsim, Deskthority MX and buckling spring, ThereminGoat, Ciechanowski Sound | M | 4 / 4 / 3 |
| Exploded parts tray | A schematic knolled tray per mechanism family (about seven), numbered parts with notes; stand-alone SVG | Todd McLellan, Animagraffs, iFixit Teardowns | M | 3 / 4 / 4 |
| Era cutaway lineup | Four mechanisms with true-relative travel bars on Stats and Completion, stacked in portrait | Ciechanowski Mechanical Watch, Voyager Explorer | S after the scrubber, M alone | 4 / 4 / 3 |

### Specimen imagery

| Feature | In Any Key | Seen in | Effort | Score |
|---|---|---|---|---|
| Specimen plate | One image recipe for all fourteen, label and scale bar outside the image; drawn plates with a rest / pressed pair | periodictable.com, model-viewer annotations | M | 4 / 4 / 4 |
| Ghost reveal | A GHOST mask (styled range input) between plate and registered cutaway; glass keys read "Underneath: glass." | Ciechanowski, model-viewer hotspots, Assemble with Care, Shift Happens | M (S slider only) | 4 / 4 / 4 |
| Period screen and link-out | A device-shaped panel in the app's palette plays the screen effect on PRESS for eight keys; emulator links off the kiosk | PCjs IBM PC 5150, Infinite Mac, v86 | M | 4 / 4 / 3 |
| Turntable spin | Drag to rotate 12 to 36 rendered frames, collected keys only; render, do not photograph | periodictable.com Spin, ScrollyVideo | M | 2 / 2 / 3 |

### Timeline and context

| Feature | In Any Key | Seen in | Effort | Score |
|---|---|---|---|---|
| Then / Now slider | A range-input wipe between first and current form (GONE for Correct), as flat keycaps captioned then and now | JuxtaposeJS, The Evolution of the Web | S code, M content | 4 / 4 / 3 |
| Meanwhile captions | Gap captions under the rail breaks ("About thirty years. Nothing new to press.") plus a MEANWHILE card section; no tick row | Museum of the World, Histography, The Evolution of the Web | S | 2 / 5 / 4 |
| Era visual-language shifts | One paper tint and accent per era via tokens, type fixed; a silent beat on first entry into a new era | Tiki-Toki Spans, TimelineJS eras, The Evolution of the Web | M (S trimmed) | 4 / 4 / 3 |
| Connections view | Lineage as a Related keys row and thin threads once both ends are collected; no second board | Outer Wilds Rumor Mode, Cooper Hewitt tables | M (S trimmed) | 3 / 4 / 3 |
| Lifespan bars and status | A STATUS chip and wry verdict in the card; on the board only an end cap on Correct | Tiki-Toki Duration view, Hyperakt Evolution of the Web, Google 2014 test | M (S chip only) | 3 / 4 / 3 |
| Re-sort the board | BY FAMILY and BY FEEDBACK layouts; the panel prefers a family line in the card and a static Stats grid | Sibley Birds, Alba, Cooper Hewitt tables, Wilmot's Warehouse | M | 3 / 4 / 2 |
| Machines lane | A host-machine line in the card with sibling keys pulsing on collect; a lane would need ten hosts, not six | The Evolution of the Web, Tiki-Toki Category Band, CHM Timeline | M | 2 / 4 / 3 |

### Keys as controls

| Feature | In Any Key | Seen in | Effort | Score |
|---|---|---|---|---|
| The Typing Room | Paper where only collected keys work, driven by the app's keycap row; every key gets a behaviour; cleared on idle | VIM Adventures, keybr, Untrusted, Typatone | M | 4 / 4 / 4 |
| Start key as first lead | The dismissing key's node pulses "You pressed this one first"; other keys toast "There is no Any key. You pressed Q." | Any key (Wikipedia), There Is No Game, Pony Island | S | 4 / 4 / 3 |
| Ability gating | Collected keys gain surplus powers (Caps Lock uppercases the board, Space pages an era); Tab, Return and Esc never gated | VIM Adventures, Hollow Knight, W3C ARIA APG, VS Code, GitHub shortcuts | L (M trimmed) | 4 / 4 / 3 |

### Ambient life and companions

| Feature | In Any Key | Seen in | Effort | Score |
|---|---|---|---|---|
| Resident caret | One blinking bar on the board nudged by any key, never echoing characters; types the wry line after the modal closes | Kiesling 1967 patent, Mountain, Neko, Office Assistant (counter-example) | M | 4 / 5 / 3 |
| Idle board life | After 20 s idle, Caps Lock's LED blinks and a locked ? breathes, collected keys only, silent | Idle animation convention, Tiny Glade, Mountain, Attract mode | M (S v1) | 4 / 4 / 3 |
| Time-of-day tint | The paper tint follows the clock, with a closed card after hours; the fact-checker prefers tying the day to the visit | Animal Crossing, Tiny Glade, Alto's Adventure, Mountain | S | 3 / 4 / 2 |

### Pacing, stats and return

| Feature | In Any Key | Seen in | Effort | Score |
|---|---|---|---|---|
| Nothing hurries you | The unlock toast waits for a still board, has no timer and offers GO THERE instead of auto-scrolling; a locked placard replaces the shake | Tiny Glade, A Monster's Expedition, A Little to the Left, Toca Boca | S | 2 / 5 / 4 |
| Visit receipt | A one-card receipt on 14/14 or START OVER: time, keys in order, presses, one wry line; no LOG tab or CSV | Flora Incognita, Letterboxd Year in Review, Spotify Wrapped, Hokkaido stamp rally | M (S trimmed) | 3 / 4 / 3 |

## Considered and cut

| Feature | Why cut |
|---|---|
| Shape-coded states and high-contrast era palette | States are already shape-coded in a monochrome system; there is no era palette to swap. |
| Welcome-back placard | Invisible on the kiosk by design; a frozen 14-item set gives a phone visitor no reason to return. |
| Search Terminal | Search solves a scale problem that 14 nodes visible on one board do not have. |
| Sort and arrange the collection | Free arrangement undoes the chronology that is the content; a shared kiosk inherits a stranger's scatter. |
| Variant keycaps | Rarity needs volume and repeat play; a per-device seed makes it fixed, not rare, and hides good content from six in seven visitors. |
| Listen and Name that press | A quiz over eight mostly duplicated sound classes, muted by default in the gallery. |
| Key of the day | Daily rotation needs a large corpus and a returning audience; 14 keys cycle in two weeks on a one-shot kiosk. |
| Staff panel behind a key chord | Back-of-house settings for features that do not exist yet; a config constant does the job. |
| Progressive HUD | Hides the era dots that are the table of contents; its rewards belong to controls not yet built. |
| Session press heatmap | Near-flat counts over 14 one-tap items duplicate the Stats grid. |
| Snapped zoom with minimap | Zoom solves a density the board lacks; a true year axis stacks the same-year keys. |

## Themes

- The press is the premise and the app does not yet perform it. The largest kept cluster (live demo, real-key collect, foley, captions, every press answers, signal path, scrubber) turns the feedback field into something seen, heard or felt. Sound is the biggest missing sense; synthesise it in Web Audio and give every sound a motion and text twin for a muted gallery.
- The physical keyboard is an input the app has not used since the start screen. Press to collect, press to find, start key as lead, ability gating and the Typing Room all need it, plus a confirmed keyboard at the kiosk and OS and browser hardening (Keyboard Lock, Windows key filtering, Esc and Tab collisions).
- Cross-references are the field-guide move that fits 14 items. Related keys, pairings, compare and range are hand-authored from prose already in content.js. Mechanics borrowed from large catalogues (search, facets, zoom, daily rotation) did not transfer; the panel cut or trimmed every one.
- Imagery is the hard dependency. Shelf, macro lens, specimen plate, ghost reveal, scrubber, then / now and turntable all wait on a fixed image recipe; the panel repeatedly preferred drawn plates or CSS keycaps to photographing museum machines a student team cannot borrow.
- Kiosk correctness comes before kiosk delight. Progress persisting across strangers is a defect today; an idle reset with a visible countdown, a kiosk flag, session-only toggles and staff approval for visitor text are prerequisites that guestbook, tally, receipt, mirror and the attract tour all assume.
- Keep one collection view. Shelf, pairs, variants, drawer and receipts each risked a second Stats grid or counter; the recurring fix is one display (the shelf) with everything else as a line in the card.
- The accessibility baseline is cheap and on-theme: Tab to Tab, Return to open Return, state in the accessible name, captions at the collect moment. Modes and presets should wait until there are toggles to bundle; a self-voicing read-aloud is what a screen-reader-less kiosk needs.
- Take-home without a backend has one route: state in the URL hash behind a QR, on a public URL. The printed receipt is the most on-theme object (a press that leaves a mark on paper) but is hardware-bound; expect single-digit pickup and build the handoff as the reset ritual, not for retention.

## Sources

- [A Little to the Left (Steam)](https://store.steampowered.com/app/1629520/A_Little_to_the_Left/)
- [A Monster's Expedition (Steam)](https://store.steampowered.com/app/1052990/A_Monsters_Expedition/)
- [A Monster's Expedition (Wikipedia)](https://en.wikipedia.org/wiki/A_Monster%27s_Expedition)
- [Alba: A Wildlife Adventure beginner's guide](https://www.keengamer.com/articles/guides/alba-a-wildlife-adventure-beginners-guide/)
- [Alto's Adventure (Wikipedia)](https://en.wikipedia.org/wiki/Alto%27s_Adventure)
- [Alto's Odyssey (Wikipedia)](https://en.wikipedia.org/wiki/Alto%27s_Odyssey)
- [Animagraffs](https://animagraffs.com/)
- [Animal Crossing (Wikipedia)](https://en.wikipedia.org/wiki/Animal_Crossing)
- [Animal Crossing museum, Source Gaming](https://sourcegaming.info/2023/03/20/center-stage-the-museum-animal-crossing-series/)
- [Animal Crossing: New Horizons Critterpedia (Nookipedia)](https://nookipedia.com/wiki/Critterpedia)
- [Animal Crossing: New Horizons International Museum Day (Nookipedia)](https://nookipedia.com/wiki/International_Museum_Day)
- [Antique Typewriter, arcade.pirillo.com](https://arcade.pirillo.com/antique-typewriter.html)
- [Any key (Wikipedia)](https://en.wikipedia.org/wiki/Any_key)
- [Arbor Day Foundation, What Tree Is That?](https://www.arborday.org/trees/whattree/)
- [Ars Electronica Innovision Wall](https://webarchive.ars.electronica.art/en/center/current_exhibition_detail.asp%3FiProjectID=12774.html)
- [Artle, Smithsonian Magazine](https://www.smithsonianmag.com/smart-news/new-daily-game-like-wordle-for-art-180980083/)
- [Assemble with Care (Steam)](https://store.steampowered.com/app/1202900/Assemble_with_Care/)
- [Attract mode (Wikipedia)](https://en.wikipedia.org/wiki/Attract_mode)
- [Audubon Bird Guide app](https://www.audubon.org/menu/audubon-bird-guide-app)
- [Bartosz Ciechanowski, Mechanical Watch](https://ciechanow.ski/mechanical-watch/)
- [Bartosz Ciechanowski, Sound](https://ciechanow.ski/sound/)
- [Birda challenges](https://birda.org/challenges/)
- [Bongo Cat](https://bongo.cat/)
- [British Museum Museum Explorer trails](https://www.britishmuseum.org/visit/family-visits/museum-explorer-trails)
- [C&G Partners, NMAAHC Digital Guestbook](https://www.cgpartnersllc.com/projects/digital-guestbook-project/?set=digital-installations)
- [Canadian Museum for Human Rights, seven accessibility features](https://humanrights.ca/story/seven-awesome-accessibility-features-museum)
- [Celeste Assist Mode, Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/celeste-assist-mode)
- [Chants of Sennaar (Wikipedia)](https://en.wikipedia.org/wiki/Chants_of_Sennaar)
- [Children's Museum of Indianapolis POP Poll, Balance Studios](https://www.balancestudios.com/work/pop-culture-poll)
- [Choice of Games font options](https://forum.choiceofgames.com/t/you-can-now-choose-helvetica-or-opendyslexic-font-in-our-games/175066)
- [Chrome Music Lab](https://musiclab.chromeexperiments.com/)
- [CMS Design System Idle Timeout](https://design.cms.gov/v/5.0.2/components/idle-timeout/)
- [Collins Bird Guide app (App Store)](https://apps.apple.com/gb/app/collins-bird-guide/id868827305)
- [Computer History Museum Timeline, 1935](https://www.computerhistory.org/timeline/1935/)
- [Computer History Museum Timeline, by category](https://www.computerhistory.org/timeline/category/)
- [Cooper Hewitt, 5 months with the Pen](https://labs.cooperhewitt.org/?p=2315)
- [Cooper Hewitt, Iterating the Post-Visit Experience](https://labs.cooperhewitt.org/?p=2371)
- [Cooper Hewitt, Designing the Pen](https://www.cooperhewitt.org/new-experience/designing-pen/)
- [Cooper Hewitt, The New Experience](https://www.cooperhewitt.org/new-experience/)
- [Cooper Hewitt, The Senses accessible guide](https://www.cooperhewitt.org/?p=29342)
- [Cooper Hewitt Pen, The Conversation](https://theconversation.com/reinventing-old-technology-cooper-hewitts-interactive-pen-44009)
- [Counter API v2 endpoints](https://docs.counterapi.dev/api/endpoints/v2/)
- [Cozy Grove (Wikipedia)](https://en.wikipedia.org/wiki/Cozy_Grove)
- [Cozy Grove review, Pocket Gamer](https://www.pocketgamer.com/articles/086169/cozy-grove-review-a-fun-little-break-each-day/)
- [Deskthority, Buckling spring](https://deskthority.net/wiki/Buckling_spring)
- [Deskthority, Caps lock](https://deskthority.net/wiki/Caps_lock)
- [Deskthority, Cherry MX](https://deskthority.net/wiki/Cherry_MX)
- [Dorfromantik (Steam)](https://store.steampowered.com/app/1455840/Dorfromantik/)
- [DREDGE Aberrations](https://dredge.wiki.gg/wiki/Aberrations)
- [Duolingo Year in Review](https://blog.duolingo.com/year-in-review-behind-the-scenes)
- [eBird Targets and Needs Alerts](https://support.ebird.org/support/solutions/articles/48000960317)
- [engineerguy videos](https://www.engineerguy.com/videos.htm)
- [Filippini-Fantoni and Bowen, Bookmarking in Museums (MW2007)](https://archimuse.com/mw2007/papers/filippini-fantoni/filippini-fantoni.html)
- [Flora Incognita](https://floraincognita.com/flora-incognita-app/)
- [Forza Horizon 5 accessibility review, Can I Play That](https://caniplaythat.com/2021/11/04/forza-horizon-5-accessibility-review/)
- [Game Accessibility Guidelines, captions for background sounds](https://gameaccessibilityguidelines.com/provide-captions-or-visuals-for-significant-background-sounds/)
- [GitHub keyboard shortcuts](https://docs.github.com/en/get-started/accessibility/keyboard-shortcuts)
- [GMK Sky Dolch](https://matrixzj.github.io/docs/gmk-keycaps/Sky-Dolch/)
- [Google Art Camera](https://blog.google/company-news/outreach-and-initiatives/arts-culture/art-camera-cultural-institute/)
- [Google model-viewer annotations](https://modelviewer.dev/examples/annotations/index.html)
- [Google timeline test 2014, Android Police](https://www.androidpolice.com/2014/07/27/google-is-testing-a-wikipedia-powered-interactive-timeline-view-for-historical-knowledge-graph-searches/)
- [goSmithsonian Trek press release](https://www.si.edu/newsdesk/releases/gosmithsonian-trek-begin-june-24)
- [Hackernoon, app state in the URL](https://hackernoon.com/your-entire-app-database-can-live-inside-a-url)
- [Hearthstone Card pack](https://hearthstone.wiki.gg/wiki/Card_pack)
- [Heaven's Vault preview, PCWorld](https://www.pcworld.com/article/406127/inkles-space-archaeologist-adventure-wont-tell-you-if-your-lost-language-translations-are-wrong.html)
- [Hidden Folks (Steam)](https://store.steampowered.com/app/435400/Hidden_Folks/)
- [Histography](https://histography.io/)
- [Histography, Hyperallergic](https://hyperallergic.com/an-interactive-timeline-of-human-history-according-to-wikipedia)
- [Hokkaido University Museum stamp rally](https://sdgs.hokudai.ac.jp/en/15002/)
- [Hollow Knight (Wikipedia)](https://en.wikipedia.org/wiki/Hollow_Knight)
- [Hyrule Compendium API](https://github.com/gadhagod/Hyrule-Compendium-API)
- [Hyrule Compendium completion rewards, Destructoid](https://www.destructoid.com/compendium-completion-rewards-tears-of-the-kingdom-totk/)
- [IBM Selectric (Wikipedia)](https://en.wikipedia.org/wiki/IBM_Selectric)
- [Idle animation (Wikipedia)](https://en.wikipedia.org/wiki/Idle_animation)
- [iFixit Teardowns](https://www.ifixit.com/Teardown)
- [Infinite Mac](https://infinitemac.org/)
- [ISO/IEC 9995-7 symbols, jdebp.uk](https://jdebp.uk/FGA/iso-9995-7-symbols.html)
- [ITP thesis 2015, Leslie Lin](https://itp.nyu.edu/shows/thesis2015/leslie-lin/)
- [Josh Comeau, the secret ingredient](https://www.joshwcomeau.com/email/2025-09-25-secret-ingredient/)
- [JuxtaposeJS](https://juxtapose.knightlab.com/)
- [Kartend Attract Mode](https://github.com/EtherAura/Kartend/wiki/Attract-Mode)
- [KBDfans Bliss Artisan Tray](https://kbdfans.com/products/bliss-artisan-tray)
- [kbsim mechanical keyboard simulator](https://github.com/tplai/kbsim)
- [Key to Type exhibition, DesignTO](https://designto.org/event/key-to-type/)
- [keybr](https://github.com/aradzie/keybr.com)
- [Keyboard Layout Editor](https://github.com/iandoug/keyboard-layout-editor)
- [Keyboard technology (Wikipedia)](https://en.wikipedia.org/wiki/Keyboard_technology)
- [keycode.info (Toptal)](https://www.toptal.com/developers/keycode/)
- [Keychron Switch Tester 100 Max](https://www.keychron.com/products/keychron-switch-tester-100-max-edition.json)
- [Kiesling blinking cursor patent US3531796A](https://patents.google.com/patent/US3531796A/en)
- [Klack, 9to5Mac](https://9to5mac.com/2023/04/05/klack-app-mechanical-keyboard-sound-effects-for-mac/)
- [Klack, ziggit.dev](https://ziggit.dev/t/klack-a-mechanical-keyboard-sound-simulator/16697)
- [Kröller-Müller Museum webReader](https://www.readspeaker.com/resources/kroller-muller-museum/)
- [Kunsthistorisches Museum MyCollection, Leisure Opportunities](http://www.leisureopportunities.co.uk/news/My-personal-Collection/11259)
- [Letterboxd Year in Review, Cactuslab](https://cactuslab.com/work/letterboxd-year-in-review)
- [Letterform Archive Online Archive](https://letterformarchive.org/online-archive/)
- [lottie-interactivity](https://github.com/LottieFiles/lottie-interactivity)
- [MDN Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)
- [Mechvibes](https://github.com/hainguyents13/mechvibes)
- [Merlin Bird ID (AppleVis)](https://www.applevis.com/apps/ios/reference/merlin-bird-id)
- [Merlin Bird ID (Wikipedia)](https://en.wikipedia.org/wiki/Merlin_Bird_ID)
- [Merlin tips and tricks](https://support.ebird.org/en/support/solutions/articles/48000966225-merlin-tips-and-tricks)
- [Metamorphabet (Wikipedia)](https://en.wikipedia.org/wiki/Metamorphabet)
- [Metroid Dread (Wikipedia)](https://en.wikipedia.org/wiki/Metroid_Dread)
- [Minecraft Advancement](https://minecraft.wiki/w/Advancement)
- [Monkeytype](https://github.com/monkeytypegame/monkeytype)
- [Monster Hunter World Hunter's Notes thread](https://steamcommunity.com/app/582010/discussions/0/1743392486227721425)
- [Mountain (Wikipedia)](https://en.wikipedia.org/wiki/Mountain_(video_game))
- [Museum of Endangered Sounds, Digital Trends](https://www.digitaltrends.com/computing/the-old-internet-built-a-museum-for-dying-tech-sounds-and-its-somehow-still-alive/)
- [Museum of Science Boston, Developing Accessible Touchscreen Interactives (2015)](https://aam-us.org/wp-content/uploads/2024/04/8.EXHFall2015_ohara_Reich_Lindgren_Streicher.pdf)
- [Museum of Science Boston, Reich 2006](https://archimuse.com/mw2006/papers/reich/reich.html)
- [Museum passport stamp-rally study](https://conference.pixel-online.net/files/foe/ed0016/FP/11172-GAME8112-FP-FOE16.pdf)
- [Neko (Wikipedia)](https://en.wikipedia.org/wiki/Neko_(software))
- [Neko Atsume (App Store)](https://apps.apple.com/us/app/neko-atsume-kitty-collector/id923917775)
- [Neko Atsume (Wikipedia)](https://en.wikipedia.org/wiki/Neko_Atsume)
- [New Pokémon Snap (Wikipedia)](https://en.wikipedia.org/wiki/New_Pok%C3%A9mon_Snap)
- [New Pokémon Snap four-star system, Source Gaming](https://sourcegaming.info/2021/11/15/holism-new-pokemon-snaps-four-star-system/)
- [New Pokémon Snap star ratings, Nintendo Life](https://www.nintendolife.com/guides/new-pokemon-snap-star-ratings-how-to-take-4-star-photos)
- [Nintendo Switch send to smartphone, How-To Geek](https://www.howtogeek.com/703330/how-to-transfer-nintendo-switch-screenshots-to-a-smartphone-wirelessly/)
- [NYT Connections "One away", Beebom](https://beebom.com/puzzle/what-does-one-away-mean-in-nyt-connections/)
- [Office Assistant (Wikipedia)](https://en.wikipedia.org/wiki/Office_Assistant)
- [Outer Wilds Rumor Mode thread](https://steamcommunity.com/app/753640/discussions/0/3194739612545860731)
- [Outer Wilds ship log thread](https://steamcommunity.com/app/753640/discussions/0/2518023667592336699/)
- [Overland OpenDyslexic option, Kotaku](https://kotaku.com/indie-game-offers-special-font-for-dyslexic-players-1838453134)
- [Patatap](https://patatap.com/)
- [Patatap (Wikipedia)](https://en.wikipedia.org/wiki/Patatap)
- [PCjs IBM PC 5150 CGA](https://www.pcjs.org/machines/pcx86/ibm/5150/cga/)
- [Peterson Identification System (Wikipedia)](https://en.wikipedia.org/wiki/Peterson_Identification_System)
- [Pikmin 4 Treasure Catalog](https://www.pikminwiki.com/Treasure_Catalog)
- [Pokédex Cry page (Bulbapedia)](https://bulbapedia.bulbagarden.net/wiki/Cry)
- [Pokédex entry, Bulbasaur (pokemon.com)](https://www.pokemon.com/us/pokedex/bulbasaur)
- [Pokémon GO (AppleVis, 2016)](https://www.applevis.com/comment/58966)
- [Pokémon GO Nearby silhouettes (Niantic)](https://niantic.helpshift.com/hc/en/6-pokemon-go/faq/102-finding-catching-wild-pokemon/)
- [Pokémon GO Pokédex silhouettes (Niantic)](https://niantic.helpshift.com/hc/en/6-pokemon-go/faq/2345-how-do-i-find-specific-pokemon/)
- [Pokémon GO Postcard Book](https://pokemongo.com/en/news/postcardbook)
- [Pony Island (Wikipedia)](https://en.wikipedia.org/wiki/Pony_Island)
- [Poster House KASA interactives, GDUSA](https://gdusa.com/?p=36654)
- [Powerhouse Museum Odditoreum labels](https://www.freshandnew.org/2009/08/odditoreum-visitor-written-labels-now-on-flickr)
- [Raycast](https://www.raycast.com/)
- [Retro Studios retrospective, Nintendo World Report](https://www.nintendoworldreport.com/news/14884/retro-studios-retrospective)
- [Return of the Obra Dinn rule of three, Film Stories](https://filmstories.co.uk/?p=83249)
- [Rijksstudio, Museums and the Web 2013](https://mw2013.museumsandtheweb.com/paper/rijksstudio-make-your-own-masterpiece/)
- [Rockhounding.org Rock Identifier](https://rockhounding.org/identify)
- [Science Museum Group, Remington No.1](https://collection.sciencemuseumgroup.org.uk/objects/co38234/remington-no-1-typewriter-and-hinged-metal-cover)
- [ScrollyVideo](https://github.com/dkaoster/scrolly-video)
- [Seattle Art Museum, Write Your Own Luminous Label](https://samblog.seattleartmuseum.org/2011/10/write-your-own-luminous-label/)
- [Seek by iNaturalist (App Store)](https://apps.apple.com/app/seek-by-inaturalist/id1353224144)
- [Send Me SFMOMA, It's Nice That](https://www.itsnicethat.com/news/send-me-san-francisco-museum-of-modern-art-sms-art-110717)
- [Shashingo, Denfaminicogamer](https://news.denfaminicogamer.jp/news/2403052b)
- [sheets.works, The Listening Museum](https://sheets.works/data-viz/keyboard-sounds)
- [Sheffield Hallam, Writing Postcards from the Museum](https://shura.shu.ac.uk/16572)
- [Shift Happens](https://shifthappens.site/)
- [Shift Happens Typewriter Simulator](https://shifthappens.site/typewriter/)
- [Sibley Birds app, compare two species](https://www.sibleyguides.com/ufaqs/how-can-i-compare-two-species-side-by-side-in-the-sibley-birds-app)
- [Smithsonian Guidelines for Accessible Exhibition Design](https://www.sifacilities.si.edu/sites/default/files/Files/Accessibility/accessible-exhibition-design1.pdf)
- [Smithsonian Learning Lab, adding and customizing resources](https://learninglab.si.edu/help/create/adding-and-customizing-resources)
- [Smithsonian Voyager (GitHub)](https://github.com/Smithsonian/dpo-voyager)
- [Smithsonian Voyager Explorer API](https://smithsonian.github.io/dpo-voyager/explorer/api/)
- [Spotify Wrapped (Wikipedia)](https://en.wikipedia.org/wiki/Spotify_Wrapped)
- [Spotify Wrapped, ADMA](https://adma.com.au/resources/personal-shareable-no-strings-attached-the-winning-formula-behind-spotify-wrapped)
- [Stardew Valley (Steam)](https://store.steampowered.com/app/413150/Stardew_Valley/)
- [Stardew Valley LibraryMuseum.cs](https://raw.githubusercontent.com/veywrn/StardewValley/master/StardewValley/Locations/LibraryMuseum.cs)
- [Stardew Valley Museum (official wiki)](https://wiki.stardewvalley.net/Museum)
- [Steam global gameplay stats](https://steamcommunity.com/stats/708950/achievements)
- [Steam hidden achievements thread](https://steamcommunity.com/discussions/forum/0/3183487594852508694)
- [Strange Horticulture (Wikipedia)](https://en.wikipedia.org/wiki/Strange_Horticulture)
- [Strange Horticulture review, GameSpew](https://www.gamespew.com/2022/01/strange-horticulture-review/)
- [Subnautica Scanner](https://subnautica.fandom.com/wiki/Scanner_(Subnautica))
- [Sudoku Access review](https://a11y-paradise.onrender.com/reviews/69dc0d88c25da7917dbfcb95)
- [Tetralogical, session timeouts](https://tetralogical.com/blog/2022/03/07/session-timeouts/)
- [The Case of the Golden Idol review, The Escape Effect](https://theescapeeffect.com/blog/the-case-of-the-golden-idol-review-a-brilliant-web-of-deduction)
- [The Evolution of the Web, Google Developers](https://developers.googleblog.com/en/behind-the-scenes-visualizing-the-evolution-of-the-web/)
- [The Evolution of the Web, Hyperakt](https://www.hyperakt.com/work/evolution-of-the-web)
- [The Evolution of the Web, Vizzuality](https://www.vizzuality.com/project/evolution-of-the-web)
- [The Last of Us Part II accessibility](https://www.playstation.com/en-us/games/the-last-of-us-part-ii/accessibility/)
- [The Legend of Zelda: Breath of the Wild (Wikipedia)](https://en.wikipedia.org/wiki/The_Legend_of_Zelda:_Breath_of_the_Wild)
- [The Museum of the World, Google Experiments](https://experiments.withgoogle.com/the-museum-of-the-world)
- [Theodore Gray, periodictable.com Iron](https://periodictable.com/Elements/026/index.html)
- [There Is No Game: Wrong Dimension (Wikipedia)](https://en.wikipedia.org/wiki/There_Is_No_Game:_Wrong_Dimension)
- [ThereminGoat force curves](https://github.com/ThereminGoat/force-curves)
- [Tiki-Toki, category duration view](https://www.tiki-toki.com/blog/entry/category-duration-view/)
- [Tiki-Toki, tags, spans and more](https://www.tiki-toki.com/blog/entry/tags-spans-and-more)
- [TimelineJS3 TimeEra.js](https://github.com/NUKnightLab/TimelineJS3/blob/master/src/js/timenav/TimeEra.js)
- [Tiny Glade (Steam)](https://store.steampowered.com/app/2198150/Tiny_Glade/)
- [Toca Boca, about](https://tocaboca.com/about/)
- [Todd McLellan](https://www.toddmclellan.com/)
- [Touchscreen (Wikipedia)](https://en.wikipedia.org/wiki/Touchscreen)
- [Touchscreen museum design guide](https://touchscreenwebsite.com/blog/interactive-touchscreens-museums-galleries-complete-guide/)
- [Townscaper](https://www.townscapergame.com/)
- [Trace Center EZ Access](https://trace.umd.edu/ez)
- [Tunic (Wikipedia)](https://en.wikipedia.org/wiki/Tunic_(video_game))
- [Typatone](https://typatone.com/)
- [Unpacking audio, Game Developer](https://www.gamedeveloper.com/marketing/auditory-tales-from-the-making-of-zen-puzzler-unpacking)
- [Untappd 11th anniversary badge](https://untappd.com/blog/cheers-to-11-years-of-check-ins/1356)
- [Untrusted](https://github.com/AlexNisnevich/untrusted)
- [v86](https://copy.sh/v86/)
- [V&A, Announcing Explore the Collections](https://www.vam.ac.uk/blog/digital/announcing-explore-the-collections)
- [V&A, Tippoo's Tiger object page](https://collections.vam.ac.uk/item/O61949/)
- [V&A, You May Also Like](https://www.vam.ac.uk/blog/digital/you-may-also-like)
- [VIM Adventures](https://vim-adventures.com/)
- [Vimium](https://github.com/philc/vimium)
- [VS Code user interface](https://code.visualstudio.com/docs/getstarted/userinterface)
- [W3C ARIA APG keyboard interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- [W3C Web Share API](https://www.w3.org/TR/web-share/)
- [WebbIE, switch-accessible menus](https://www.webbie.org.uk/blog/?p=196)
- [Whippletree mechanism (Wikipedia)](https://en.wikipedia.org/wiki/Whippletree_(mechanism))
- [Wien Museum web guide help](https://guide.wienmuseum.at/en/seite/hilfe)
- [Wilmot's Warehouse (Steam)](https://store.steampowered.com/app/839870/Wilmots_Warehouse/)
- [Wordle, Smithsonian Magazine](https://www.smithsonianmag.com/smart-news/heres-why-the-word-game-wordle-went-viral-180979439/)
- [Workinman kiosk design guide](https://workinman.com/trade-show-museum-kiosk-design-development/)
- [Xbox Accessibility Guideline 104](https://devdocs.xbox.com/gaming/accessibility/xbox-accessibility-guidelines/104)
