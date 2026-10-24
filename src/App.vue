<script setup>
// The whole app lives inside one portrait stage; every route renders within it.
// A collected key's cap flies to the HUD in its own layer above the routes; the floating panels
// (design tools) sit above that.
import IdleReset from './components/IdleReset.vue';
import KeyFlight from './components/KeyFlight.vue';
import PanelHost from './components/PanelHost.vue';
import { readKioskFlag } from './lib/kiosk';

// A kiosk resets itself for the next visitor after a spell without input (?kiosk=1, see lib/kiosk.js),
// and fills its screen however large (the .kiosk rule in styles.css).
const kiosk = readKioskFlag();
document.documentElement.classList.toggle('kiosk', kiosk);
</script>

<template>
  <div class="stage">
    <RouterView />
    <KeyFlight />
    <IdleReset v-if="kiosk" />
    <PanelHost />
  </div>
</template>
