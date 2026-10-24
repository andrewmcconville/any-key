<template>
  <button class="close" type="button" aria-label="Close">
    <svg viewBox="0 0 56 56" aria-hidden="true"><path d="M14 14 42 42M42 14 14 42" /></svg>
  </button>
</template>

<style scoped>
/* Just the ×, no circle; the box stays 16rem so the tap target is unchanged. */
.close {
  width: 16rem; height: 16rem; flex: 0 0 auto;
  border-radius: 50%;
  display: grid; place-items: center;
}
.close svg { width: var(--icon); height: var(--icon); stroke: var(--ink); stroke-width: 6; stroke-linecap: round; fill: none; }
.close:active { transform: scale(.94); }
</style>
