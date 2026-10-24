<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
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

// While one overlay gives way to another both shells are mounted for the length of the fade; only
// the one that is staying answers Esc, or a single press would close two overlays.
const layer = ref(null);
const sheet = ref(null);
const leaving = () => [...(layer.value?.classList ?? [])].some(c => c.endsWith('-leave-active'));
function onKey(e) {
  if (e.key === 'Escape' && props.closable && !leaving()) emit('close');
}

// A sheet takes focus as it opens, on its title (or the sheet itself when it has none), so a
// keyboard or screen-reader user starts at the top of what just opened. The board behind is inert
// meanwhile (TimelineView), and focus goes back to whatever opened the overlay when it closes.
function takeFocus() {
  const el = sheet.value;
  if (!el) return;
  const target = el.querySelector(`[id="${props.titleId}"]`) ?? el;
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}
onMounted(() => {
  window.addEventListener('keydown', onKey);
  takeFocus();
});
onUnmounted(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <div ref="layer" class="layer" @click.self="closable && emit('close')">
    <section
      ref="sheet"
      class="modal"
      :class="{ 'modal--center': align === 'center' }"
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
  height: 236rem;         /* every modal the same size, so one can take another's place without the frame moving */
  max-height: 100%;       /* but never taller than the layer leaves inside the phone's safe areas */
  background: var(--white);
  border-radius: var(--radius-xl);
  border: var(--hairline) solid var(--line-soft);
  display: flex; flex-direction: column;
  overflow: hidden;
  transition: transform var(--dur-sm) var(--ease-standard);
}
/* The panel rises into place while the layer fades in (see the overlay contract in styles.css). */
.layer-enter-from .modal { transform: translateY(2.4rem) scale(.98); }
/* Overlay to overlay (TimelineView picks the name): the frame stays, only the sheet fades. Going
   deeper ('fwd') the new layer sits on top and its sheet fades in over the old one, which stays
   put underneath; coming back ('back') the old layer sits on top and its sheet fades out, with the
   one beneath already there. The layer that is on its way out drops its scrim so the two never stack. */
.fwd-enter-active, .back-leave-active { z-index: 11; }
.fwd-leave-active, .back-leave-active { background: transparent; }
.fwd-enter-active .modal, .back-leave-active .modal { transition: opacity var(--dur-sm) var(--ease-standard); }
.fwd-enter-from .modal, .back-leave-to .modal { opacity: 0; }
/* A centred dialog (Reset, Completion) keeps its words in the middle of the fixed-height sheet. */
.modal--center .modal__scroll { display: flex; flex-direction: column; justify-content: center; }
.modal__header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 2.4rem;
  margin-bottom: 4.8rem;
}
.modal__header h2 { margin: 0; }   /* the browser's h2 margins would make the row taller than the title */
/* The × keeps its 16rem touch target, but the row is only as tall as the title: the button's box
   overhangs it above and below, into the sheet's padding and the gap under the header. */
.modal__header .close { margin-block: calc((var(--lh-title) - 16rem) / 2); }
.modal__scroll { flex: 1 1 auto; min-height: 0; overflow: hidden auto; overscroll-behavior: contain; }   /* fills the frame, so a footer sits at its foot; scrolls down only */
/* The scrollbar shows, so a sheet with more below says so. It sits in the sheet's right padding, its
   gutter always kept so the words line up with the header and footer whether the sheet scrolls or
   not; the 1.6rem either side of the words leaves room for a button's focus ring. */
.modal__scroll {
  margin-inline: -1.6rem -3.2rem;
  padding-inline: 1.6rem;
  scrollbar-gutter: stable;
}
.modal__scroll::-webkit-scrollbar { width: 1.6rem; }
.modal__scroll::-webkit-scrollbar-track { background: var(--fill-soft); border-radius: 0.8rem; }
.modal__scroll::-webkit-scrollbar-thumb { background: var(--muted); border-radius: 0.8rem; }
@supports not selector(::-webkit-scrollbar) {
  .modal__scroll { scrollbar-width: thin; scrollbar-color: var(--muted) var(--fill-soft); }
}
/* The page turns selection off for the board's drag-to-scroll; a modal's words are for reading and copying. */
.modal__header h2, .modal__scroll { user-select: text; -webkit-user-select: text; }
.modal__scroll button { user-select: none; -webkit-user-select: none; }
.modal__footer { margin-top: 4.8rem; flex: 0 0 auto; }
</style>
