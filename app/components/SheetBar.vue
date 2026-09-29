<script setup lang="ts">
defineProps<{
  sheet: string
  links: { href: string, label: string }[]
}>()
</script>

<template>
  <header class="sheet-bar">
    <a href="/" class="sheet-brand">
      <img class="mark" src="/img/logo/apple-touch-icon.png" alt="" width="28" height="28" />
      <span>Maker Faire Kochi</span>
    </a>
    <span class="sheet-name">{{ sheet }}</span>
    <nav class="sheet-nav" :aria-label="sheet">
      <NuxtLink
        v-for="l in links"
        :key="l.href + l.label"
        :to="l.href"
        class="sheet-link"
      >{{ l.label }}</NuxtLink>
    </nav>
  </header>
</template>

<style scoped>
.sheet-bar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: stretch;
  background: #fff;
  border-bottom: 2px solid var(--pn-ink);
  font-family: var(--font-readout);
}
.sheet-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1.5rem;
  border-right: 1px solid var(--pn-ink);
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--pn-ink);
}
.mark { width: 28px; height: 28px; }
.sheet-name {
  align-self: center;
  padding: 0 1.5rem;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--pn-label);
}
.sheet-nav { display: flex; }
.sheet-link {
  display: inline-flex;
  align-items: center;
  padding: 0 1.25rem;
  border-left: 1px solid var(--pn-ink);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--pn-ink);
}
.sheet-link:hover { background: rgba(0, 174, 239, 0.08); }
.sheet-link.router-link-exact-active { background: var(--pn-ink); color: #fff; }
@media (max-width: 640px) {
  .sheet-bar { grid-template-columns: 1fr auto; }
  .sheet-name { display: none; }
  .sheet-brand span { display: none; }
  .sheet-link { padding: 0 0.8rem; }
}
</style>
