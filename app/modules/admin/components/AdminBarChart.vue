<script setup lang="ts">
import type { CountRow } from '../composables/useInterestAnalytics'

defineProps<{
  title: string
  rows: CountRow[]
  empty?: string
  /** 'cyan' | 'red' bar fill */
  tone?: 'cyan' | 'red'
}>()
</script>

<template>
  <section class="chart-card">
    <h3 class="chart-title">{{ title }}</h3>
    <p v-if="!rows.length" class="empty">{{ empty || 'No responses yet' }}</p>
    <ul v-else class="bars">
      <li v-for="row in rows" :key="row.value" class="bar-row">
        <div class="bar-meta">
          <span class="bar-label">{{ row.label }}</span>
          <span class="bar-count">{{ row.count }} <span class="pct">({{ row.pct }}%)</span></span>
        </div>
        <div class="track" role="presentation">
          <div
            class="fill"
            :class="tone === 'red' ? 'fill-red' : 'fill-cyan'"
            :style="{ width: `${Math.max(row.pct, row.count ? 2 : 0)}%` }"
          />
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.chart-card {
  background: var(--color-white);
  border: 1px solid var(--separator);
  border-radius: 12px;
  padding: 1.1rem 1.2rem 1.25rem;
}
.chart-title {
  margin: 0 0 1rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-ink);
}
.empty {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.875rem;
}
.bars {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.bar-meta {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.3rem;
  font-size: 0.8125rem;
}
.bar-label {
  color: var(--color-ink);
  font-weight: 500;
}
.bar-count {
  color: var(--color-muted);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.pct {
  opacity: 0.85;
}
.track {
  height: 8px;
  border-radius: 999px;
  background: var(--bg-grouped);
  overflow: hidden;
}
.fill {
  height: 100%;
  border-radius: 999px;
  min-width: 0;
}
.fill-cyan {
  background: var(--color-cyan);
}
.fill-red {
  background: var(--color-red-cta);
}
</style>
