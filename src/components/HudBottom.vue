<template>
  <nav class="hud-bottom">
    <RouterLink class="hud-btn" :to="{ name: 'stats' }">STATS</RouterLink>
    <RouterLink class="hud-btn" :to="{ name: 'how-to-play' }">HOW TO PLAY</RouterLink>
    <RouterLink class="hud-btn" :to="{ name: 'about' }">ABOUT</RouterLink>
    <RouterLink class="hud-btn hud-btn--quiet" :to="{ name: 'reset' }">RESET</RouterLink>
  </nav>
</template>

<style scoped>
.hud-bottom {
  flex: 0 0 19.2rem;
  height: 19.2rem;
  width: 100%;
  max-width: var(--phone-w);
  margin-inline: auto;
  display: flex;
  align-items: center;
  gap: 3.2rem;
  padding: 0 4.8rem;
  background: #efefef;
  border-top: 0.2rem solid var(--line-soft);
  z-index: 3;
}
.hud-btn {
  flex: 1 1 0;
  height: 13.6rem;
  display: grid; place-items: center;
  text-decoration: none; color: var(--ink);
  border-radius: 1.6rem;
  border: var(--stroke) solid var(--ink);
  background: var(--white);
  font: 500 2.6rem/3.4rem var(--font-display); letter-spacing: .02em;
  transition: transform .08s;
}
.hud-btn:active { transform: translateY(0.4rem); }
.hud-btn--quiet { border-color: transparent; background: #f8f8f8; }
</style>
