import { TYPE_TOKENS } from '../stores/tokens';
import { COLOR_TOKENS } from '../stores/colors';
import { SHAPE_TOKENS } from '../stores/shape';

/**
 * Reads, from the stylesheets themselves, which design tokens an element is set with. Computed
 * style only gives resolved px and rgb, so instead every same-origin rule the element matches is
 * scanned for var(--…) references (and bare literals) in the properties the tokens cover, and the
 * cascade is approximated per property: the inspector's own override sheet first, then !important,
 * specificity, source order. Each winner is one "binding" the Inspect panel shows and can rebind.
 */

/** id of the <style> the inspector writes rebinds into (see stores/inspect.js). */
export const OVERRIDE_SHEET_ID = 'inspect-overrides';

// One slot per property the tokens cover. `family` picks the token set and the slider.
const SLOTS = {
  'font-size':        { label: 'Font',          family: 'type' },
  'color':            { label: 'Colour',        family: 'color' },
  'background-color': { label: 'Background',    family: 'color' },
  'border-width':     { label: 'Border',        family: 'border' },
  'border-color':     { label: 'Border colour', family: 'color' },
  'border-radius':    { label: 'Radius',        family: 'radius' },
};
const SLOT_ORDER = Object.keys(SLOTS);

/** The tokens a binding of each family may be switched to. */
export const FAMILIES = {
  type:   { options: TYPE_TOKENS.map(t => ({ id: t.id, label: t.label })), varOf: id => `--text-${id}` },
  color:  { options: COLOR_TOKENS.map(t => ({ id: t.id, label: t.label })), varOf: id => `--${id}` },
  radius: { options: SHAPE_TOKENS.filter(t => t.group === 'radius').map(t => ({ id: t.id, label: t.label })), varOf: id => `--${id}` },
  border: { options: SHAPE_TOKENS.filter(t => t.group === 'border').map(t => ({ id: t.id, label: t.label })), varOf: id => `--${id}` },
};

const COLOR_IDS = new Set(COLOR_TOKENS.map(t => t.id));
// Custom properties that are aliases of a token in the stylesheet.
const ALIASES = { '--line': 'ink', '--radius': 'radius-md' };
const NON_VALUES = new Set(['inherit', 'initial', 'unset', 'currentcolor', 'none', 'transparent', '0']);

/* ---------- Rules ---------- */

function* walk(rules, override) {
  for (const r of rules) {
    if (r instanceof CSSStyleRule) yield { rule: r, override };
    else if (r instanceof CSSMediaRule) { if (matchMedia(r.conditionText).matches) yield* walk(r.cssRules, override); }
    else if (r instanceof CSSSupportsRule) yield* walk(r.cssRules, override);
  }
}

/** Every applicable style rule in document order. Cross-origin sheets (Google Fonts) are skipped. */
export function collectRules() {
  const out = [];
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch (_) { continue; }
    const override = sheet.ownerNode?.id === OVERRIDE_SHEET_ID;
    for (const r of walk(rules, override)) out.push({ ...r, order: out.length });
  }
  return out;
}

/** Split on `sep` outside parentheses and brackets. */
function splitTop(text, sep) {
  const parts = [];
  let depth = 0, start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (c === sep && depth === 0) { parts.push(text.slice(start, i)); start = i + 1; }
  }
  parts.push(text.slice(start));
  return parts.map(p => p.trim()).filter(Boolean);
}

/** The part of a selector list that matches `el`, or null. */
function matchingPart(el, selectorText) {
  for (const part of splitTop(selectorText, ',')) {
    try { if (el.matches(part)) return part; } catch (_) { /* pseudo-elements and the like */ }
  }
  return null;
}

/** (ids, classes/attributes/pseudo-classes, elements) folded into one comparable number. */
function specificity(selector) {
  const s = selector.replace(/\([^)]*\)/g, '');
  const ids = (s.match(/#[\w-]+/g) || []).length;
  const classes = (s.match(/\.[\w-]+|\[[^\]]*\]|(?<!:):[\w-]+/g) || []).length;
  const elements = (s.replace(/\[[^\]]*\]/g, '').match(/(^|[\s>+~])[a-zA-Z][\w-]*|::[\w-]+/g) || []).length;
  return ids * 10000 + classes * 100 + elements;
}

function parseDeclarations(text) {
  return splitTop(text.replace(/\/\*[\s\S]*?\*\//g, ''), ';').map(d => {
    const i = d.indexOf(':');
    if (i < 0) return null;
    const important = /!important\s*$/i.test(d);
    return { prop: d.slice(0, i).trim().toLowerCase(), value: d.slice(i + 1).replace(/!important\s*$/i, '').trim(), important };
  }).filter(d => d && d.value !== '');
}

/**
 * The rule's declaration block as written. Chrome's cssText loses a shorthand that holds var() once
 * a later longhand overrides part of it (`border: var(--hairline) …; border-top: 0` comes back as
 * empty longhands), so when that shows, the block is read from the owning <style>'s source instead.
 */
function sourceBlock(rule) {
  const text = rule.parentStyleSheet?.ownerNode?.textContent;
  if (!text) return null;
  const sel = rule.selectorText;
  for (let i = text.indexOf(sel); i >= 0; i = text.indexOf(sel, i + 1)) {
    const open = text.indexOf('{', i + sel.length);
    if (open < 0) break;
    if (!/^\s*$/.test(text.slice(i + sel.length, open))) continue;
    const close = text.indexOf('}', open);
    return close < 0 ? null : text.slice(open + 1, close);
  }
  return null;
}

function declarations(rule) {
  const css = rule.style.cssText;
  if (/:\s*;/.test(css)) {
    const src = sourceBlock(rule);
    if (src) return parseDeclarations(src);
  }
  return parseDeclarations(css);
}

/* ---------- Classification ---------- */

const VAR = /var\((--[\w-]+)\)/g;
const LENGTH = /(\d*\.?\d+)(rem|px|em)\b/;
const varsIn = value => [...value.matchAll(VAR)].map(m => m[1]);

/** A binding for `slot`, bound to `ref` (a var(--x) or a literal substring of the declaration). */
function bind(slot, ref, tokenId, alias = null, extra = {}) {
  return { slot, ref, tokenId, alias, ...extra };
}

/** The bindings a single declaration contributes, if any. */
function classify(prop, value) {
  const v = value.trim();
  if (NON_VALUES.has(v.toLowerCase())) return [];
  const vars = varsIn(v);
  const out = [];
  const colorVar = vars.find(x => COLOR_IDS.has(x.slice(2)) || x === '--line');
  const colorBinding = slot => colorVar && bind(slot, `var(${colorVar})`, ALIASES[colorVar] ?? colorVar.slice(2), ALIASES[colorVar] ? colorVar : null);

  if (prop === 'font' || prop === 'font-size') {
    const tv = vars.find(x => x.startsWith('--text-'));
    const lv = vars.find(x => x.startsWith('--lh-'));
    const lh = lv ? `var(${lv})` : null;
    if (tv) out.push(bind('font-size', `var(${tv})`, tv.slice(7), null, { lh }));
    else { const m = LENGTH.exec(v); if (m) out.push(bind('font-size', m[0], null, null, { lh })); }
  } else if (prop === 'color') {
    const b = colorBinding('color'); if (b) out.push(b);
  } else if (prop === 'background' || prop === 'background-color') {
    const b = colorBinding('background-color'); if (b) out.push(b);
  } else if (prop === 'border' || prop === 'border-width' || prop === 'border-color') {
    if (prop !== 'border-color') {
      const wv = vars.find(x => x === '--stroke' || x === '--hairline');
      if (wv) out.push(bind('border-width', `var(${wv})`, wv.slice(2)));
      else { const m = LENGTH.exec(v); if (m && parseFloat(m[1]) > 0) out.push(bind('border-width', m[0], null)); }
    }
    if (prop !== 'border-width') { const b = colorBinding('border-color'); if (b) out.push(b); }
  } else if (prop === 'border-radius') {
    const rv = vars.find(x => x.startsWith('--radius'));
    if (rv) out.push(bind('border-radius', `var(${rv})`, ALIASES[rv] ?? rv.slice(2), ALIASES[rv] ? rv : null));
    else out.push(bind('border-radius', v, null));
  }
  return out;
}

/* ---------- Resolution ---------- */

const rgbToHex = rgb => {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/.exec(rgb);
  if (!m) return rgb;
  const hex = '#' + [m[1], m[2], m[3]].map(n => Number(n).toString(16).padStart(2, '0')).join('');
  return m[4] != null && Number(m[4]) < 1 ? `${hex} ${Math.round(Number(m[4]) * 100)}%` : hex;
};

function computedFor(el, slot) {
  const cs = getComputedStyle(el);
  const px = v => `${parseFloat(v).toFixed(1)}px`;
  switch (slot) {
    case 'font-size': return px(cs.fontSize);
    case 'color': return rgbToHex(cs.color);
    case 'background-color': return rgbToHex(cs.backgroundColor);
    case 'border-width': return px(cs.borderTopWidth);
    case 'border-color': return rgbToHex(cs.borderTopColor);
    case 'border-radius': {
      const r = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius];
      return r.every(x => x === r[0]) ? px(r[0]) : r.map(px).join(' ');
    }
    default: return '';
  }
}

const compareRank = (a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; };

/**
 * The winning binding per slot for `el`: { slot, label, family, prop, raw, ref, lh, tokenId, alias,
 * selector, computed }. `selector` is the exact matching selector (scope attribute included) so an
 * override written against it reaches the same elements. Pass the rules from collectRules() to
 * resolve many elements against one scan.
 */
export function bindingsFor(el, rules = collectRules()) {
  const best = {};
  for (const { rule, override, order } of rules) {
    const part = matchingPart(el, rule.selectorText);
    if (!part) continue;
    const spec = specificity(part);
    for (const d of declarations(rule)) {
      for (const b of classify(d.prop, d.value)) {
        const rank = [override ? 1 : 0, d.important ? 1 : 0, spec, order];
        if (!best[b.slot] || compareRank(rank, best[b.slot].rank) >= 0) {
          best[b.slot] = { ...b, prop: d.prop, raw: d.value, selector: part, rank };
        }
      }
    }
  }
  return SLOT_ORDER.filter(s => best[s]).map(s => {
    const { rank, ...b } = best[s];
    return { ...b, ...SLOTS[s], computed: computedFor(el, s) };
  });
}

/** The element itself or its nearest ancestor with at least one binding; null if none, undefined inside the panels. */
export function nearestBound(el, rules, cache = new WeakMap()) {
  for (let node = el; node && node !== document.body; node = node.parentElement) {
    if (node.closest('.panel-host')) return undefined;
    if (!cache.has(node)) cache.set(node, bindingsFor(node, rules));
    if (cache.get(node).length) return node;
  }
  return null;
}

/**
 * The declaration that rebinds `binding` to token `newId`: the old reference is swapped inside the
 * original value, so a shorthand keeps its other parts and a four-value radius keeps its pattern.
 * For the type ramp the paired line-height follows, as its own declaration if the size stood alone.
 */
export function rebound(binding, newId) {
  const newVar = `var(${FAMILIES[binding.family].varOf(newId)})`;
  let value = binding.raw.split(binding.ref).join(newVar);
  const extra = [];
  if (binding.family === 'type') {
    const lh = `var(--lh-${newId})`;
    if (binding.lh) value = value.split(binding.lh).join(lh);
    else if (binding.prop === 'font-size') extra.push({ prop: 'line-height', value: lh });
  }
  return { prop: binding.prop, value, extra };
}

/** A selector as it reads in the component's own <style scoped>, without Vue's scope attribute. */
export const unscoped = selector => selector.replace(/\[data-v-[\w-]+\]/g, '');
