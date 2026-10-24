// Any Key — content. Mirrors the Figma file (p2.5 Content / p2.6 Lo-Fi Wireframe).
// Positions are in Figma canvas px (1440-wide board, 2560 tall); 1rem = 10 canvas px.

export const ERAS = [
  { id: 1, numeral: 'I',   name: 'MECHANICAL', years: '1874–1900' },
  { id: 2, numeral: 'II',  name: 'ELECTRIC',   years: '1929–1973' },
  { id: 3, numeral: 'III', name: 'COMPUTER',   years: '1981–1994' },
  { id: 4, numeral: 'IV',  name: 'GLASS',      years: '2011' },
];

export const ERA_WIDTH = 1800;      // canvas px per era region
export const RAIL_Y = 1260;         // rail centreline, canvas px
export const NODE_PITCH = 400;
export const NODE_FIRST_X = 200;    // centre of the first node in each era

// Circle-centre y per tier (canvas px)
const TIER = { farAbove: 751, nearAbove: 991, nearBelow: 1543, farBelow: 1783 };
const FOUR = ['farAbove', 'nearBelow', 'nearAbove', 'farBelow'];
const TWO  = ['nearAbove', 'nearBelow'];

export const KEYS = [
  // Era I · Mechanical
  { id: 'space', legend: '␣',    era: 1, name: 'Space bar',  year: '1874',    feedback: 'click',
    image: 'Manual typewriter space bar, macro, worn pale in the middle',
    press: 'Moves the carriage one character without striking a typebar; on a computer, inserts character 32.',
    description: 'The Sholes & Glidden typewriter of 1874 — the machine that fixed QWERTY — gave the space its own long bar under the bottom row, and it has been the biggest key on every keyboard since.',
    why: 'It is the only key that prints nothing, and the one everyone presses most.' },
  { id: 'shift', legend: '⇧',    era: 1, name: 'Shift',      year: '1878',    feedback: 'clunk',
    image: 'SHIFT key on a Remington No. 2, carriage lifted mid-press',
    press: 'Typewriter: lifts the carriage so a second character on every typebar reaches the page. Computer: sets a modifier; every other key becomes something else.',
    description: 'The Remington No. 2 of 1878 put upper and lower case on one keyboard: holding Shift physically lifted the carriage so the other half of each typebar struck the paper.',
    why: 'The first key whose only job is to change what the other keys do.' },
  { id: 'tab', legend: '⇥',      era: 1, name: 'Tab',        year: 'c. 1900', feedback: 'zip',
    image: 'TAB key and the tab-stop rack on an Underwood, macro',
    press: 'Typewriter: releases the carriage to run to the next stop. Computer: inserts a tab character, or moves focus to the next field.',
    description: 'Tabulator attachments arrived in the 1890s to send the carriage flying to a preset column stop for typing tables; the Underwood No. 5 built one in around 1900, and the name shrank to Tab.',
    why: 'Built for tables; now it indents, jumps between fields, and autocompletes, and nobody thinks of a table.' },
  { id: 'backspace', legend: '⌫', era: 1, name: 'Backspace', year: '1900s',   feedback: 'click',
    image: 'BACK SPACE key on an Underwood, macro',
    press: 'Typewriter: moves the carriage back one character and prints nothing. Computer: deletes the character before the cursor.',
    description: 'Early typewriters could only move forward; a back spacer key, standard by the Underwood No. 5 around 1900, stepped the carriage back one character so you could strike over a mistake. Computers kept the key and turned stepping back into erasing.',
    why: 'The key that went from “go back” to “take it back.”' },

  // Era II · Electric
  { id: 'return', legend: '↵',   era: 2, name: 'Return',     year: '1929',    feedback: 'click', photo: 'electromatic.png',
    image: 'CARRIAGE RETURN key on an Electromatic typewriter, 1929, macro',
    press: 'On a typewriter: carriage left, paper up one line. On a computer: send, submit, confirm.',
    description: 'Typewriters had a lever to return the carriage. The Electromatic of 1929 put a motor behind it and gave it a key, marked CARRIAGE RETURN and set at the right of the keyboard where the lever had been.',
    why: 'A lever that moved paper became the key that means yes.' },
  { id: 'esc', legend: 'esc',      era: 2, name: 'Esc',        year: '1960',    feedback: 'click', photo: 'teletype-model-33-esc-key-transparent.png',
    image: 'ESC key, top-left corner, macro; the 2016 Touch Bar esc',
    press: 'Sends character 27 and lets the program decide; almost always, stop whatever is happening.',
    description: 'Bob Bemer wrote ESC into ASCII in 1960 so a terminal could switch character sets; the Teletype Model 33 gave it a key in 1963, vi made it the way out of everything, and Apple turned it into a strip of glass in 2016 and gave the key back in 2019.',
    why: 'The universal “get me out of here” — and the one key people refused to let become a picture.' },
  { id: 'ctrl', legend: 'ctrl',     era: 2, name: 'Ctrl',       year: '1963',    feedback: 'none', photo: 'teletype-model-33-ctrl-key-transparent.png',
    image: 'CTRL key on a Teletype Model 33, macro',
    press: 'Nothing alone. Held with another key, sends a command instead of a character: copy, undo, cancel, reboot.',
    description: 'On the Teletype Model 33, holding CTRL stripped bits from the next key so it sent a control character instead of a letter — Ctrl-G rang the bell. In 1981 David Bradley wired Ctrl-Alt-Del into the IBM PC as a developer’s reboot shortcut, and it got out.',
    why: 'The key that turns a keyboard into a control panel.' },
  { id: 'correct', legend: 'correct',  era: 2, name: 'Correct',    year: '1973',    feedback: 'strike', photo: 'selectric-ii-correcting-key-v3-transparent.png',
    image: 'IBM Correcting Selectric II, CORRECT key and lift-off tape',
    press: 'Backs the carrier up one space and switches to the lift-off tape, so the next strike removes a character instead of printing one.',
    description: 'The Correcting Selectric II of 1973 added a second tape that lifted the ink back off the paper: back up one space, strike the wrong letter again, and it was gone. The first undo you could hold in your hand.',
    why: 'The press that takes a press back.' },

  // Era III · Computer
  { id: 'f1', legend: 'F1',       era: 3, name: 'F1',         year: '1981',    feedback: 'click',
    image: 'F1 key on an IBM Model F keyboard, left-hand function columns', photo: 'ibm-f1-key-transparent.png',
    press: 'Sends a code the program interprets; by convention, opens help.',
    description: 'The IBM PC of 1981 put ten numbered function keys in two columns down the left of its keyboard, labeled F1 to F10. Nothing on the keycap says what they do; software decided, and F1 settled into meaning help.',
    why: 'The first key whose label is a number, not a letter — the keyboard stops describing itself.' },
  { id: 'capslock', legend: '⇪', era: 3, name: 'Caps Lock',  year: '1981',    feedback: 'click + LED',
    image: 'Caps Lock key with its LED lit, macro', photo: 'xerox-alto-lock.png',
    press: 'Toggles a mode: every letter arrives uppercase until it is pressed again. An LED says which state you are in.',
    description: 'Typewriters had a shift lock that held the carriage up; the IBM PC of 1981 renamed it Caps Lock, gave it a light, and made it affect only letters. The Happy Hacking Keyboard replaced it with Ctrl in 1996 and Google dropped it from the Chromebook in 2011.',
    why: 'The only key that changes what every later press means until you press it again.' },
  { id: 'command', legend: '⌘',  era: 3, name: '⌘ Command',  short: 'Command', year: '1984', feedback: 'none',
    image: '⌘ key on an original Macintosh M0110 keyboard', photo: 'apple-command-key-transparent.png',
    press: 'Nothing alone. With a letter, runs a menu command — ⌘Z, ⌘S, ⌘Q — so the whole menu bar can be learned by hand.',
    description: 'The Lisa had an Apple key; when the Macintosh menus filled up with apple logos, Steve Jobs objected, and Susan Kare pulled a looped square out of a symbol dictionary — a Swedish road sign for a place of interest.',
    why: 'A key people know by its picture, not its name.' },
  { id: 'windows', legend: '⊞',  era: 3, name: '⊞ Windows',  short: 'Windows', year: '1994', feedback: 'click',
    image: '⊞ key on a Microsoft Natural Keyboard, 1994 flag logo', photo: 'windows.png',
    press: 'Opens the Start menu. With a letter, system shortcuts — ⊞D shows the desktop, ⊞L locks the screen.',
    description: 'Microsoft put its logo on a key on the Natural Keyboard in 1994 and shipped Windows 95 to use it the next year; since then nearly every PC keyboard has carried a corporate logo as a standard key.',
    why: 'The first logo that became a key.' },

  // Era IV · Glass
  { id: 'emoji', legend: '☺︎',    era: 4, name: 'Emoji',      title: 'Emoji key', year: '2011', feedback: 'haptic',
    image: 'iOS keyboard with the emoji key, default and pressed',
    press: 'Swaps the whole keyboard for a grid of pictures; nothing moves and nothing is typed until you pick one.',
    description: 'Emoji arrived on the iPhone keyboard for Japan in 2008 and for everyone in iOS 5 in 2011, and a dedicated smiley key followed: a key with no physical ancestor, pressed a few billion times a day.',
    why: 'The first iconic key that was never a key.' },
  { id: 'dictation', legend: '🎙︎', era: 4, name: 'Dictation', title: 'Dictation key', year: '2011', feedback: 'tone',
    image: 'iOS keyboard with the dictation key, default and listening',
    press: 'Opens the microphone and streams your voice to a server; text comes back and types itself.',
    description: 'The iPhone 4S of 2011 put a microphone key beside the space bar: press it, talk, and the words appear. It is a keyboard key whose job is to make the keyboard unnecessary.',
    why: 'The key you press to stop typing.' },
];

// Derive board positions
for (const era of ERAS) {
  const keys = KEYS.filter(k => k.era === era.id);
  const tiers = keys.length === 2 ? TWO : FOUR;
  keys.forEach((k, i) => {
    k.index = i;
    k.cx = (era.id - 1) * ERA_WIDTH + NODE_FIRST_X + i * NODE_PITCH;
    k.cy = TIER[tiers[i]];
    k.above = k.cy < RAIL_Y;
  });
}

export const ACHIEVEMENTS = [
  { id: 'anyKey',    title: 'There is no Any key', sub: 'Pressed the start screen' },
  { id: 'firstPress', title: 'First press',        sub: 'Collected your first key' },
  { id: 'era1',      title: 'Era I cleared',        sub: 'Collect all 4 Mechanical keys' },
  { id: 'era2',      title: 'Era II cleared',       sub: 'Collect all 4 Electric keys' },
  { id: 'era3',      title: 'Era III cleared',      sub: 'Collect all 4 Computer keys' },
  { id: 'era4',      title: 'Era IV cleared',       sub: 'Collect both Glass keys' },
  { id: 'fullSet',   title: 'Full set',             sub: 'Collect all 14 keys' },
];

export const COPY = {
  start: {
    title: 'ANY KEY',
    sub: 'A collection of the keys everyone has pressed — and what each one actually does.',
    button: 'PRESS ANY KEY',
    caption: '14 keys · 4 eras · press each one to collect it',
  },
  about: {
    about: 'Any Key is a collection of fourteen keyboard keys everyone has pressed, from typewriters to glass, arranged by the year each first appeared. Every key answers the same question: what actually happens when you press it?',
    madeBy: 'Andrew McConville · ART 424 UX/UI Design for Apps · University of Wisconsin–Milwaukee · Catalog & Curate exemplar #2',
    sources: [
      'Wikipedia — Space bar; Shift key; Tab key; Esc key; Control key; Command key; Windows key; Emoji',
      'Deskthority wiki — Return key; Marcin Wichary — The day Return became Enter',
      'Wikipedia — Sholes and Glidden typewriter; Bob Bemer; Teletype Model 33; Control-Alt-Delete',
      'Wikipedia — IBM Selectric; IBM — Selectric typewriter history',
      'Folklore.org — Swedish Campground (Andy Hertzfeld)',
      'Wikipedia — Microsoft Natural Keyboard; Windows 95',
      'Image credits — to be added per key',
    ],
    tools: ['Figma variables & conditional prototyping · Claude (research, spec, wireframe)'],
  },
  completion: {
    heading: 'EVERY KEY PRESSED',
    achievement: 'Achievement unlocked · Full set',
    body: 'From a bar that prints nothing to a key that was never a key — you have collected the whole set. One of them took a press back, and you pressed it again anyway.',
  },
  reset: {
    title: 'Reset progress?',
    body: 'This clears all collected keys and locks Eras II, III and IV again. Press Reset to confirm.',
  },
  collectCaption: 'Press and release to add this key to your collection.',
};
