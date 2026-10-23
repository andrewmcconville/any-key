<script setup>
// The layer that floating panels live in: it covers the stage but only the panels themselves take
// pointer events, so the app underneath stays usable. Add new panels to the list below.
//
// The design tools retune the app's tokens live by writing --text-*, --ink, --radius-* and the rest
// onto <html>. The windows themselves must not follow (a tool whose own type shrinks as you shrink
// the type is unusable), so on mount this layer takes a copy of every custom property the
// stylesheet declares on :root, as authored. Custom properties inherit from the nearest ancestor
// that sets them, so everything inside the windows reads these fixed values and only the app
// underneath changes.
import { onMounted, ref } from 'vue';
import TypeTokensPanel from '../panels/TypeTokensPanel.vue';
import ColorsPanel from '../panels/ColorsPanel.vue';
import ShapePanel from '../panels/ShapePanel.vue';
import CoronaPanel from '../panels/CoronaPanel.vue';
import FlightPanel from '../panels/FlightPanel.vue';
import RingPanel from '../panels/RingPanel.vue';
import InspectPanel from '../panels/InspectPanel.vue';
import SwingPanel from '../panels/SwingPanel.vue';

const host = ref(null);
function freezeTokens() {
  const el = host.value;
  if (!el) return;
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }   // a cross-origin sheet (fonts) can't be read
    for (const rule of rules) {
      if (rule.selectorText !== ':root') continue;
      for (const name of rule.style) {
        if (name.startsWith('--')) el.style.setProperty(name, rule.style.getPropertyValue(name));
      }
    }
  }
}
onMounted(freezeTokens);
</script>

<template>
  <div ref="host" class="panel-host">
    <TypeTokensPanel />
    <ColorsPanel />
    <ShapePanel />
    <CoronaPanel />
    <FlightPanel />
    <RingPanel />
    <InspectPanel />
    <SwingPanel />
  </div>
</template>

<style scoped>
.panel-host {
  position: absolute; inset: 0;
  z-index: 50;             /* above overlays (10) so a panel stays usable with a modal open */
  pointer-events: none;
}
.panel-host > :deep(*) { pointer-events: auto; }
</style>
