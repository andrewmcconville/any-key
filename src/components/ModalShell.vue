<script setup>
import { onMounted, onUnmounted } from 'vue';
import CloseButton from './CloseButton.vue';

const props = defineProps({
  title: { type: String, default: '' },
  titleId: { type: String, default: 'modal-title' },
  /** 'default' | 'completion' | 'reset' */
  variant: { type: String, default: 'default' },
  /** Show the × and allow Esc / backdrop to close */
  closable: { type: Boolean, default: true },
});
const emit = defineEmits(['close']);

function onKey(e) {
  if (e.key === 'Escape' && props.closable) emit('close');
}
onMounted(() => window.addEventListener('keydown', onKey));
onUnmounted(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <div class="layer" @click.self="closable && emit('close')">
    <section
      class="modal"
      :class="{ completion: variant === 'completion', reset: variant === 'reset' }"
      :role="variant === 'reset' ? 'alertdialog' : 'dialog'"
      aria-modal="true"
      :aria-labelledby="titleId"
    >
      <div v-if="title" class="modal__header">
        <h2 class="t-title" :id="titleId">{{ title }}</h2>
        <CloseButton v-if="closable" @click="emit('close')" />
      </div>
      <div class="modal__scroll">
        <slot />
      </div>
      <div v-if="$slots.footer" class="modal__footer">
        <slot name="footer" />
      </div>
    </section>
  </div>
</template>
