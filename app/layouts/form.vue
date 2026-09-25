<script setup lang="ts">
useHead({
  meta: [{ name: 'theme-color', content: '#EDF7FB' }],
})
</script>

<template>
  <div class="form-layout">
    <NuxtRouteAnnouncer />
    <a href="#form-main" class="skip-link">Skip to form</a>
    <main id="form-main" tabindex="-1">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.form-layout {
  min-height: 100svh;
  /* Soft paper with a cyan wash — structural brand, not text. */
  background:
    radial-gradient(ellipse 80% 50% at 100% 0%, rgba(0, 174, 239, 0.12), transparent 55%),
    radial-gradient(ellipse 60% 40% at 0% 100%, rgba(237, 28, 36, 0.06), transparent 50%),
    var(--bg-grouped);
  color: var(--color-ink);
  font-family: var(--font-body);
}
</style>
