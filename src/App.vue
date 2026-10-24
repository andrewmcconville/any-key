<script setup>
// The whole app lives inside one portrait stage; every route renders within it.
// A collected key's cap flies to the HUD in its own layer above the routes; the floating panels
// (design tools) sit above that.
import KeyFlight from './components/KeyFlight.vue';
import PanelHost from './components/PanelHost.vue';
</script>

<template>
  <div class="stage">
    <RouterView />
    <KeyFlight />
    <PanelHost />
  </div>
</template>
