# Any Key lo-fi — design review (19 Oct 2026)

> **Status, 24 Oct 2026.** This review describes the lo-fi as it was on 19 Oct. Since then:
>
> - **Dropped.** How to play was removed, and the bottom bar now holds the era dots instead of STATS / HOW TO PLAY / ABOUT / RESET. Stats moved into the hamburger Menu. Findings about the How to play modal and the bottom-bar buttons, including item 10, no longer apply.
> - **Applied.** Cancel is the solid default on Reset. Completion's achievement line sits under the heading. The ⌘ and ⊞ glyphs are gone from the board and card labels. The modal scrim is 72%. Era dots are dashed when locked and carry a ✓ when cleared, with one ring that slides to the era in view.
> - **Overridden.** The start screen's words sit in the middle of the frame rather than lower down, and its scrim is still 85% rather than about 70%. The key-detail image is 32rem tall rather than 16:9, to make room for the larger type.
> - **Sitemap.** any-key-sitemap.png predates all of this. It still shows How to play, the old bottom bar, a "Three-finger salute" achievement that was never added, and per-key Sound and previous / next controls that were not built.

Three focused reviews of the Lo-Fi Wireframe page in the Any Key Figma file, run against the project's own p2.9 design-system rules. Screens reviewed: Timeline, Key detail, Stats, How to play, About, Completion, Reset, Start overlay, HUD top, HUD bottom. All measurements are canvas px (3× CSS px), read from renders, ±2 px.

## Synthesis — what to fix first

1. **Touch targets under the 132-px minimum.** HUD bottom buttons 300×112; Close 120; era dots 56; achievement rows 128. Fix: HUD buttons 312×136 (4×312 + 3×32 = 1344, 48 gutters); Close 144; era dots 132 with 24 gaps, or treat the dot row as a non-tappable indicator; rows 136.
2. **Fixed modal heights leave dead space** (How to play 642–644, About 714–718, Stats 585, Key detail 430–433 between last content and the button). Hug Stats, How to play and About with a 96 bottom pad. Keep Key detail fixed for per-key consistency, but grow the image to 1200×675 (16:9) so the figure absorbs the slack.
3. **The core action is the least emphasised button.** PRESS TO COLLECT is outlined while GOT IT, VIEW STATS and RESET are solid, and it lacks the keycap shadow PRESS ANY KEY has. Make collect the one lit, keycap-styled action; demote the others to outlined. Flip Reset so Cancel is the solid default. Set RESET apart from STATS / HOW TO PLAY / ABOUT in the HUD.
4. **Grid discipline.** Values sit on a 10-px habit, not the 24-px grid (pads 56/80/100/60, gaps 32/40, buttons 112/170/180/200, node 220, Stats circle 150, pitch 171). Five different left edges (48 HUD top, 66 HUD bottom, 72 panel, 120 modal content, ≈60 Stats row). Resnap to 24: pads 48/48/96, gaps 24/48, two button heights (192, 144), HUD 168/192, node 216, Stats circle 144; HUD bottom gutter to 48; write down "panel 72, content 120" as the rule.
5. **Type: 16 sizes against a five-style system.** Map everything to Display (new, 160, for ANY KEY and 14 / 14), Title 84/92, Heading 44/52, Body 32/46 (+ strong), Label 26/34. Label 26 is 8.7 CSS px on a phone, under the ~11 px floor: either accept phone as secondary or raise Label to 32/40. Node names should be Body strong, years Label. Set tabular figures on every counter. Replace the 56-px "×" text with a stroked icon. Use fixed line-heights from the styles instead of 130%.
6. **Timeline.** Dashed connectors run through "Space bar / 1874" and "Tab / c. 1900"; above-rail nodes sit at unrelated heights (−311, −151) and below-rail at (+290, +370). Use two mirrored tiers (±168, ±408), labels always on the far side from the rail, pitch 400 throughout. Move "swipe to explore →" onto the rail end near the cut-off node.
7. **Stats grid reads as a texture, not eras.** Circle gap ≈21 equals circle-to-label gap 20; "⌘ Command" and "⊞ Windows" have 39 px between them and will touch in Space Grotesk, which also lacks ⌘/⊞. Options: 4 columns per era row (rows of 4/4/4/2; 264 columns + 48 gaps = 1200, circles 144), or keep 7 columns with a 96 gap after the 4th. Drop the glyphs or draw them as icons; allow two-line labels. Give achievement cards a visible stroke and 32 inner inset.
8. **HUD era dots don't yet read as progress.** Outlined-when-locked clashes with the board's "outlined = available"; filled conflates "open" with "current". Use dashed for locked, outlined + ✓ for cleared, filled for the era in view; 96–132 px.
9. **Spacing details.** Completion: body→button 42 but heading→body 61 (proximity inverted); move "Achievement unlocked · Full set" under the heading. Reset: 162 under the buttons vs 80 above. Start overlay: content floats high, lower 37% empty, scrim fully opaque; drop the group so the button lands near y 1800–2000 and use ~70% scrim. About: tighten the Sources block (12 between bullets, 48 before/after) and set bullets in Body with a hanging indent. How to play: top-align badges with the heading line box.
10. **Hi-fi type will break HUD bottom**: "HOW TO PLAY" at Heading 44 is ≥303 px in a 300-px button. Use Label 26 caps there (the honest exception) or widen to 312.

## Keep
- Rail at 1260, dead centre between the two HUDs; alternating nodes with drop lines and the cut fourth node teach the scroll without a hint.
- One 1200 content column shared by image, body, collect button, Stats rows and achievement cards; pixel-identical modal headers.
- Eyebrow → body pattern (muted caps over body) maps 1:1 to Label/Body; 2× title-to-body contrast.
- Caps on every button label; Roman numerals for eras vs Arabic for counts.
- Completion's numeral owns the screen with one full-width primary.
- HUD top: dots left, counter right, one 80-px centreline, 48 gutters.

---

## Full report — Grid & layout

**1. HUD bottom buttons are under the touch minimum (10, 01).** Four buttons measure 300 × 112 (37 CSS px tall) inside a 200-tall bar; spec minimum is 132. These are the only persistent navigation on the kiosk. Fix: 312 × 136 with 32 gaps and 48 gutters (4×312 + 3×32 = 1344 = 1440 − 96), 32 above/below.

**2. Close button and era dots are under 132 (02–05, 09).** Close circle is 120 × 120 in every modal. HUD era dots are 56 diameter on a 76 pitch; if they jump between eras they are 18 CSS px targets. Fix: close 144 (keeps the 56 header top); era dots either 132 with 24 gaps (row = 600 wide) or make the whole dot row one 160-tall tap region and treat the dots as indicators only.

**3. Fixed modal heights are not justified by content.** Dead space between last content and the bottom button/padding: Key detail 433, Stats 585 (no button at all), How to play 644, About 718. Heights 1976/1986/1652/2116 follow no rule (Stats and Key detail differ by 10). Fix: hug with a 96 bottom pad, or pick one shared height (e.g. 1968) driven by the longest key description and apply it to Key detail only.

**4. Five different left edges across the system.** HUD top dots and era title 48; HUD bottom buttons 66; modal panel 72 (1440 − 1296)/2; modal content 120; Stats circle row ≈60. The p2.9 "120 modal gutter" is in fact where the modal content lands (72 + 48 padding), not the panel. Fix: write that down as the rule (panel 72, content 120 = HUD gutter 48 + 72) or make the panel 1200 wide with 120 gutters and accept a 1104 button; and move HUD bottom to 48.

**5. Values are on a 10-px habit, not the 24-px grid.** Off-grid: top pad 56, Completion pads 80/100/60, Reset 80, gaps 32/40, buttons 112/170/180/200, HUD 160/200, node 220, Stats circle 150 and pitch 171, era dot 56, all modal heights. On-grid: 48, 96, 1200, 1296, close 120. Fix: set nudge to 24 and resnap — pads 48/48/96, gaps 24/48, buttons 192 and 144, HUD 168/192, node 216, Stats circle 144.

**6. Timeline node rhythm has no mirrored pairs (01).** Rail sits at 1260 (exact board centre, good). Circle-edge distances from the rail: Space bar −311, Tab −151, Shift +290, Backspace +370 — four unrelated values. For above-rail nodes the label sits between circle and rail and the dashed connector runs straight through "Space bar / 1874". Node x pitch is 400/400/420. Fix: two tiers mirrored about the rail (circle edge at ±168 and ±408), labels always on the far side from the rail, pitch 400 throughout.

**7. Stats grid column logic (03).** 7 × 171 = 1197 is a division of the 1200 content width, not a grid; circles are inset 12 px from the title edge. "⌘ Command" and "⊞ Windows" leave 39 px between them at Inter 24 Regular; at Label 26 Medium +2% they grow ~12% and will touch. Fix: 4 columns per era row, 264 columns + 48 gaps = 1200, circles 144, labels get 264 to breathe. Also reads as the era story. (Note: eras are 4/4/4/2 keys, so this is four rows.)

**8. Achievement rows (03).** Cards are 128 tall (under 132 if tappable; fine if static) with a 24 gap; the 70-px status circle sits ~6 px from the card's left border while the text starts 112 in. Fix: 32 inset for the circle, 136 row height.

**9. Button size inventory.** Heights 200 (collect, Press any key), 180 (Got it, Close), 170 (Completion, Reset), 112 (HUD); widths 1200/1000/880/460/300. Fix: two sizes, 192 and 144.

**10. Hi-fi type will break the HUD bottom.** "HOW TO PLAY" at Inter SemiBold 28 spans 193 px; at Heading 44 it is ≥303 px in a 300-wide button. Use Label 26 for HUD buttons or widen to 312 and shorten to "HELP". Title 84/92 adds ~28 px to each modal header row; fine against a 120/144 close button. Body 32/46 adds ~4 px per line — Key detail's spacer absorbs it, but only while the spacer exists.

Keep: rail at 1260; pixel-identical modal headers (title x≈52, close 1125–1244 × 58–176); one 1200 content column; node 220 and Stats circle 150 clear the touch minimum; node pitch 400 shows 3.6 nodes so the fourth is cut as a scroll cue; HUD top dots and counter share one 80-px centreline with 48 gutters.

---

## Full report — Whitespace & gestalt

**1. Key detail — the one action that matters is the least emphasised button in the set.** PRESS TO COLLECT is outlined; GOT IT, VIEW STATS and RESET are solid. By similarity, the visitor learns "solid = do this", then meets the core-loop action as a secondary style. The Start overlay's PRESS ANY KEY has a hard offset keycap shadow; the collect button does not, so the two "press" moments don't look related. Fix: give PRESS TO COLLECT the same keycap shadow (it then reads as a key in the "available" state, consistent with the outlined PRESS nodes), and demote the other solid buttons to outlined so only collect is lit.

**2. Fixed-height modals leave the action floating.** Empty band between last content and the bottom button: How to play 642 (39% of the modal), About 714, Stats 586, Key detail 430. The action is no longer in proximity to what it concludes, and a tall card hides the dimmed board. Fix: hug content on How to play, About and Stats (gap to button 96). On Key detail keep the fixed height but grow the image placeholder to 1200×675 (16:9).

**3. HUD era dots don't read as progress.** ~56 px with Roman numerals, left-clustered like iOS page dots, which invites tapping; under the 132 minimum. Locked eras are plain outlined circles, which on the board means "available" (locked = dashed + ?). "Filled" conflates "open" with "current". Fix: 96 px dots, 24 gap; dashed for locked, outlined + ✓ for cleared, filled for the era currently in view.

**4. Timeline — connectors cut through labels; node heights drift.** Space bar's dashed drop line runs behind "Space bar / 1874". Space bar's year is 207 above the rail, Tab's "c. 1900" only ~57. The "swipe to explore →" hint sits bottom-right, 450+ px from the cut Backspace node. Fix: break the connector 24 above the name and 24 below the year (or put labels outboard of the circle); one height per side; move the hint onto the rail end (y ≈ 1300, right edge). Era fog could not be assessed: Era II is outside the captured viewport.

**5. Stats grid is a texture, not groups.** Horizontal gap between circles ~21, same as circle→label 20, so 14 circles fuse into a strip. Achievement card borders are near-invisible and the circle sits ~6 from the card's left edge. Fix: circles 132, 36 gaps, 96 gap between the 4th and 5th column; cards get 32–48 inner padding and a visible stroke, or drop the cards and use 48 row gaps.

**6. Completion — proximity inverted.** Numeral→heading 56, heading→body 61, body→VIEW STATS only 42. "Achievement unlocked · Full set" is stranded 88 below START OVER. Fix: body→button 96; move the achievement line under EVERY KEY PRESSED with a 24 gap.

**7. Reset — weight and balance.** Destructive RESET is solid; Cancel outlined. Bottom padding ~162 vs 80 on top. In the HUD, RESET is a visual peer of STATS/HOW TO PLAY/ABOUT. Fix: flip the fills, 80 all round (modal ≈ 620 tall), set RESET apart in the HUD.

**8. Start overlay.** The content group (760–1640) floats above centre; the lower 37% is empty and that's where the thumb is. The scrim is fully opaque in this render. Fix: drop the group so the button lands around 1800–2000; scrim at ~70% so the rail and first node ghost through.

**9. About.** The Sources bullet block (360 tall) is the heaviest ink mass but the least relevant to Marcus. Group sources tighter (12 between bullets, 48 before/after) and let the About paragraph breathe.

**10. How to play.** Badges hang ~17 px below the heading centre. Top-align badge with the heading line box.

Keep: Key detail eyebrow→body 23 vs section→section 41; How to play rhythm (26 within a step, 74 between); Completion's numeral owns the screen; the timeline spine's continuity teaches the scroll; HUD top's two clean groups.

---

## Full report — Typography

**Inventory.** 16 distinct sizes (24, 26, 28, 30, 32, 34, 36, 40, 44, 48, 50, 52, 56, 64, 160, 180) across ~24 size/weight combos, against a four-size, five-style system. Buttons alone use five sizes (28 HUD, 40 Completion/Reset, 44 GOT IT/CLOSE, 48 PRESS TO COLLECT, 52 PRESS ANY KEY).

**Proposed mapping**
- 180 ANY KEY, 160 "14 / 14" → a justified sixth style, Display: Space Grotesk Bold 160/160, -2%, tabular figures. Unify at 160 so the two moments rhyme.
- 64 modal titles → Title 84/92 (fits beside the close circle; "About & Sources" ≈ 700 px of 1030 available).
- 52/48/44/40 buttons, 48 step numerals, 48 EVERY KEY PRESSED, 44 step headings, 44 toast, 40 HUD counter → Heading 44/52.
- 36 era region label, 30 meta line, 30 "swipe to explore", 28 years/captions/button caption, 26 eyebrows/row subtitles/ACHIEVEMENTS, 24 Stats grid labels and HUD dot numerals, 28 HUD bottom buttons → Label 26/34 (HUD bottom buttons can't take Heading 44 in a 296-px button; Label caps is the honest exception).
- 32 body, 30 "0 of 14 collected", 40 start subtitle → Body 32/46. 34 node names, 34 achievement titles → Body strong 32/46. 28 About bullets → Body 32/46 with hanging indent.
- 56 "×", 56 "≈", 50 and 40 "✓/?" → not text; icons.

**Findings, by severity**
1. Label 26 is below the phone floor. 26 canvas = 8.7 CSS px; the 24-px Stats labels and HUD numerals are 8 px. iOS's practical floor is ~11 CSS px (33 canvas). Either accept phone as secondary, or set Label to 32/40 (Space Grotesk Medium + caps + muted distinguishes it from Body). At minimum promote the 24s to Label.
2. Timeline node names. The system assigns names to Label 26 Medium; the lo-fi uses 34 Semi Bold. Names are the only wayfinding on the board. Name = Body strong 32/46, year = Label 26/34. Knock the label out of the connector.
3. Stats grid labels. "⌘ Command" and "⊞ Windows" at Label 26 Medium +2% run ≈140 px in a 171-px column, and ⌘/⊞ aren't in Space Grotesk, so they fall back to a system font. Drop the glyphs or draw them as 26-px icons; allow two-line labels.
4. "×" close. Inter × at 56 is ~25 px of ink in a 120 circle. Use a 56-px icon with a 6-px stroke, with an accessible name "Close".
5. Numerals. Counters will jitter with proportional figures. Set tnum on Label/Heading/Display counters. Keep spaces around the slash only at Display size; "0/14" at HUD.
6. Line heights. 130% on 32 gives 41.6 and 115% on 64 gives 73.6, off-grid; the system's fixed 46/52/92 fixes this. Start subtitle's 40/135% is a one-off; map to Body.
7. Eyebrow tracking. All-caps Label at +2% is tight for 26-px caps; consider +4–5% on caps instances only.
8. Line length. Body at 32 in the 1200-px column measures 74–76 characters; expect ~70–72 in Plex. Cap the Body measure at ~1040 px in Key detail and About.

Working well: caps on every button label; the eyebrow pattern maps 1:1 to Label; 2× title-to-body contrast; Roman numerals for eras vs Arabic for counts; "14 / 14" at 100% line-height.
