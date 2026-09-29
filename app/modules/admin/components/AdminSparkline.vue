<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ values: number[] }>()

const W = 120
const H = 30

const pts = computed(() => {
  const v = props.values
  const max = Math.max(1, ...v)
  const step = v.length > 1 ? W / (v.length - 1) : W
  return v.map((n, i) => [i * step, H - 2 - (n / max) * (H - 6)] as const)
})

const line = computed(() => pts.value.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(''))
const area = computed(() => (pts.value.length ? `${line.value}L${W} ${H}L0 ${H}Z` : ''))
const last = computed(() => pts.value[pts.value.length - 1])
</script>

<template>
  <svg class="spark" :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" aria-hidden="true">
    <path :d="area" class="spark-area" />
    <path :d="line" class="spark-line" />
    <path v-if="last" :d="`M${last[0]} ${last[1]}h0`" class="spark-dot" />
  </svg>
</template>

<style scoped>
.spark {
  display: block;
  width: 100%;
  height: 30px;
  overflow: visible;
}
.spark-area { fill: rgba(0, 174, 239, 0.12); }
.spark-line { fill: none; stroke: var(--color-cyan); stroke-width: 1.5; vector-effect: non-scaling-stroke; }
/* A round-capped zero-length stroke stays circular under preserveAspectRatio="none". */
.spark-dot { stroke: var(--color-red); stroke-width: 6; stroke-linecap: round; vector-effect: non-scaling-stroke; }
</style>
