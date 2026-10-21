<script setup>
// The layer that floating panels live in: it covers the stage but only the panels themselves take
// pointer events, so the app underneath stays usable. Add new panels to the list below.
import TypeTokensPanel from '../panels/TypeTokensPanel.vue';
import ColorsPanel from '../panels/ColorsPanel.vue';
</script>

<template>
  <div class="panel-host">
    <TypeTokensPanel />
    <ColorsPanel />
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
