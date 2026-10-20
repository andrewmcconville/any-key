<script setup>
import { useUiStore } from '../stores/ui';
const ui = useUiStore();
</script>

<template>
  <button
    class="toast t-heading"
    type="button"
    :data-open="ui.toast.open"
    aria-live="assertive"
    @click="ui.dismissToast()"
  >{{ ui.toast.text }}</button>
</template>
