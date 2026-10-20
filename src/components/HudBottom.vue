<template>
  <nav class="hud-bottom">
    <RouterLink class="hud-btn" :to="{ name: 'stats' }">STATS</RouterLink>
    <RouterLink class="hud-btn" :to="{ name: 'how-to-play' }">HOW TO PLAY</RouterLink>
    <RouterLink class="hud-btn" :to="{ name: 'about' }">ABOUT</RouterLink>
    <RouterLink class="hud-btn hud-btn--quiet" :to="{ name: 'reset' }">RESET</RouterLink>
  </nav>
</template>
