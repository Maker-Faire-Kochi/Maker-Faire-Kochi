<script setup lang="ts">
useHead({
  meta: [{ name: 'robots', content: 'noindex' }],
})
</script>

<template>
  <div class="admin-layout">
    <NuxtRouteAnnouncer />
    <header class="admin-top">
      <a href="/" class="admin-brand">Maker Faire Kochi</a>
      <span class="admin-badge">Organizer</span>
    </header>
    <main class="admin-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  min-height: 100svh;
  background: #f0f2f5;
  font-family: var(--font-body);
  color: var(--color-ink);
}
.admin-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1.25rem;
  background: #fff;
  border-bottom: 1px solid #e5e9ef;
}
.admin-brand {
  font-weight: 700;
  text-decoration: none;
  color: var(--color-ink);
}
.admin-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-muted);
  border: 1px solid #e5e9ef;
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
}
.admin-main {
  padding: 1.25rem;
  max-width: 72rem;
  margin: 0 auto;
}
</style>
