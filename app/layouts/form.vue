<script setup lang="ts">
useHead({
  meta: [{ name: 'theme-color', content: '#F6F8FC' }],
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
  background: #f6f8fc;
  color: var(--color-ink);
  font-family: var(--font-body);
}
</style>
