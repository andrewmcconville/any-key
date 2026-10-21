<script setup>
// The whole app lives inside one portrait stage; every route renders within it.
// Floating panels (design tools) sit in their own layer above the routes.
import PanelHost from './components/PanelHost.vue';
</script>

<template>
  <div class="stage">
    <RouterView />
    <PanelHost />
  </div>
</template>
