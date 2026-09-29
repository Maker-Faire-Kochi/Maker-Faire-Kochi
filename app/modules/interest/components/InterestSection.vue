<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <section class="at-section">
    <header class="at-section-head">
      <h2 class="at-section-title">{{ title }}</h2>
      <p v-if="subtitle" class="at-section-sub">{{ subtitle }}</p>
    </header>
    <div class="at-section-body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.at-section {
  padding: 1.5rem 0;
  border-bottom: 1px solid rgba(10, 10, 10, 0.18);
}
.at-section:last-of-type {
  border-bottom: none;
}
.at-section-head {
  margin-bottom: 1.1rem;
}
.at-section-title {
  margin: 0;
  display: inline-block;
  font-family: var(--font-panel);
  font-stretch: 62%;
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1;
  text-transform: uppercase;
  color: var(--pn-ink);
  padding-bottom: 0.4rem;
  border-bottom: 2px solid var(--pn-ink);
}
.at-section-sub {
  margin: 0.45rem 0 0;
  font-size: 1rem;
  color: var(--pn-label);
  line-height: 1.45;
}
</style>
