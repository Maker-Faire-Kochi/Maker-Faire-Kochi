<script setup lang="ts">
useHead({
  meta: [{ name: 'robots', content: 'noindex' }],
})
</script>

<template>
  <div class="admin-layout">
    <NuxtRouteAnnouncer />
    <header class="admin-top">
      <a href="/" class="admin-brand">
        <span class="mark" aria-hidden="true" />
        Maker Faire Kochi
      </a>
      <nav class="admin-nav" aria-label="Admin">
        <NuxtLink to="/admin" class="nav-link">Dashboard</NuxtLink>
        <NuxtLink to="/admin/login" class="nav-link">Login</NuxtLink>
        <a href="/interestform" class="nav-link">Form</a>
      </nav>
      <span class="admin-badge">Admin</span>
    </header>
    <main class="admin-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  min-height: 100svh;
  background:
    radial-gradient(ellipse 70% 40% at 100% 0%, rgba(0, 174, 239, 0.1), transparent 50%),
    var(--bg-grouped);
  font-family: var(--font-body);
  color: var(--color-ink);
}
.admin-top {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1.25rem;
  background: var(--color-white);
  border-bottom: 1px solid var(--separator);
}
.admin-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  text-decoration: none;
  color: var(--color-ink);
}
.mark {
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 2px;
  background: linear-gradient(135deg, var(--color-cyan) 50%, var(--color-red) 50%);
}
.admin-nav {
  display: flex;
  gap: 0.25rem;
  margin-left: auto;
}
.nav-link {
  text-decoration: none;
  color: var(--color-muted);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.4rem 0.65rem;
  border-radius: 6px;
}
.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-ink);
  background: rgba(0, 174, 239, 0.08);
}
.admin-badge {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-muted);
  border: 1px solid var(--separator);
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
}
.admin-main {
  padding: 1.25rem;
}
</style>
