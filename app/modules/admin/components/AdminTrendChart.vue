<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  days: { key: string; label: string; count: number }[]
}>()

const max = computed(() => Math.max(1, ...props.days.map((d) => d.count)))
</script>

<template>
  <section class="trend-card">
    <h3 class="chart-title">Responses over time</h3>
    <p class="sub">Last 14 days</p>
    <div class="trend" role="img" :aria-label="`Daily responses, peak ${max}`">
      <div
        v-for="d in days"
        :key="d.key"
        class="col"
        :title="`${d.label}: ${d.count}`"
      >
        <div class="col-track">
          <div
            class="col-fill"
            :style="{ height: `${(d.count / max) * 100}%` }"
          />
        </div>
        <span class="col-count">{{ d.count || '' }}</span>
        <span class="col-label">{{ d.label }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.trend-card {
  background: var(--color-white);
  border: 1px solid var(--separator);
  border-radius: 12px;
  padding: 1.1rem 1.2rem 1.25rem;
}
.chart-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
}
.sub {
  margin: 0.2rem 0 1rem;
  font-size: 0.75rem;
  color: var(--color-muted);
}
.trend {
  display: grid;
  grid-template-columns: repeat(14, 1fr);
  gap: 0.35rem;
  align-items: end;
  min-height: 9rem;
}
.col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-width: 0;
}
.col-track {
  width: 100%;
  max-width: 1.5rem;
  height: 6.5rem;
  display: flex;
  align-items: flex-end;
  background: var(--bg-grouped);
  border-radius: 4px 4px 0 0;
  overflow: hidden;
}
.col-fill {
  width: 100%;
  background: linear-gradient(180deg, var(--color-cyan), #0088bb);
  border-radius: 4px 4px 0 0;
  min-height: 0;
}
.col-count {
  font-size: 0.65rem;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
  font-weight: 600;
  min-height: 0.85rem;
}
.col-label {
  font-size: 0.55rem;
  color: var(--color-muted);
  writing-mode: horizontal-tb;
  text-align: center;
  line-height: 1.1;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}
@media (max-width: 720px) {
  .col-label {
    display: none;
  }
  .trend {
    gap: 0.2rem;
  }
}
</style>
