<script setup>
import { onMounted, onUnmounted } from 'vue';
import CloseButton from './CloseButton.vue';

const props = defineProps({
  title: { type: String, default: '' },
  titleId: { type: String, default: 'modal-title' },
  /** Panel width, a CSS length. */
  width: { type: String, default: '129.6rem' },
  /** Text alignment inside the panel: 'start' | 'center'. */
  align: { type: String, default: 'start' },
  /** Panel padding, a CSS shorthand. */
  padding: { type: String, default: '4.8rem' },
  /** 'dialog' | 'alertdialog' */
  role: { type: String, default: 'dialog' },
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
      :style="{ width, padding, textAlign: align }"
      :role="role"
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

<style scoped>
.modal {
  max-height: 236rem;
  background: var(--white);
  border-radius: var(--radius-xl);
  border: var(--hairline) solid var(--line-soft);
  display: flex; flex-direction: column;
  overflow: hidden;
  transition: transform var(--dur-sm) var(--ease-standard);
}
/* The panel rises into place while the layer fades in (see the overlay contract in styles.css). */
.layer-enter-from .modal { transform: translateY(2.4rem) scale(.98); }
.modal__header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 2.4rem;
  margin-bottom: 4.8rem;
}
.modal__scroll { overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none; min-height: 0; }
/* The page turns selection off for the board's drag-to-scroll; a modal's words are for reading and copying. */
.modal__header h2, .modal__scroll { user-select: text; -webkit-user-select: text; }
.modal__scroll button { user-select: none; -webkit-user-select: none; }
.modal__scroll::-webkit-scrollbar { display: none; }
.modal__footer { margin-top: 4.8rem; flex: 0 0 auto; }
</style>
