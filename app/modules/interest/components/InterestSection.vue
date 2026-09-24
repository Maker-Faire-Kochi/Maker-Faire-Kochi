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
  border-bottom: 1px solid #e5e9ef;
}
.at-section:last-of-type {
  border-bottom: none;
}
.at-section-head {
  margin-bottom: 1.1rem;
}
.at-section-title {
  margin: 0;
  font-family: var(--font-body);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-ink);
  letter-spacing: -0.01em;
}
.at-section-sub {
  margin: 0.35rem 0 0;
  font-size: 0.875rem;
  color: var(--color-muted);
  line-height: 1.45;
}
</style>
