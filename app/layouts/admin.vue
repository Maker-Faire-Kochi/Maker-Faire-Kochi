<script setup lang="ts">
useHead({
  meta: [{ name: 'robots', content: 'noindex' }],
})
</script>

<template>
  <div class="admin-layout maker-app">
    <NuxtRouteAnnouncer />
    <BitsClickSpark selector=".key, .a-tab, .spark" />
    <SheetBar
      sheet="Control room"
      :links="[
        { href: '/admin', label: 'Dashboard' },
        { href: '/interestform', label: 'Form' },
        { href: '/admin/login', label: 'Login' },
      ]"
    />
    <main class="admin-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  min-height: 100svh;
  color: var(--pn-ink);
}
.admin-main { padding: 2.5rem 1.5rem 4rem; }
@media (max-width: 640px) {
  .admin-main { padding: 1.5rem 1rem 3rem; }
}
</style>

<style>
/* Shared admin panel: a ruled drawing cell with a figure number. */
.a-panel {
  min-width: 0;
  padding: 1.1rem 1.25rem 1.35rem;
  background: #fff;
  border: 1px solid var(--pn-ink);
  box-shadow: 3px 3px 0 rgba(10, 10, 10, 0.08);
}
.a-head {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin: 0 0 1.1rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid rgba(10, 10, 10, 0.15);
}
.a-fig {
  flex-shrink: 0;
  font-family: var(--font-readout);
  font-size: 0.66rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  /* Cyan fails as text on white (2.53:1); this darker blueprint is 5.0:1. */
  color: #0077A8;
}
.a-title {
  margin: 0;
  font-family: var(--font-panel);
  font-stretch: 62%;
  font-weight: 800;
  font-size: 1.15rem;
  line-height: 1.1;
  text-transform: uppercase;
  color: var(--pn-ink);
}
.a-meta {
  margin-left: auto;
  font-family: var(--font-readout);
  font-size: 0.7rem;
  color: var(--pn-label);
  white-space: nowrap;
}
.a-empty {
  margin: 0;
  font-family: var(--font-readout);
  font-size: 0.8rem;
  color: var(--pn-label);
}
</style>
