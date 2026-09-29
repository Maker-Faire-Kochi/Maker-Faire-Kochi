<script setup lang="ts">
/**
 * The rule that opens every sheet of the homepage: sheet number over the
 * narrow bay, sheet name over the wide one, the sheet count at the far edge,
 * and cyan ticks where the rule crosses a column line. Decorative -- each
 * section still carries its own real heading.
 */
defineProps<{ n: string, label: string }>()

const SHEETS = '04'
</script>

<template>
  <div class="sheet-head" aria-hidden="true">
    <span class="sheet-n">Sht {{ n }} / {{ SHEETS }}</span>
    <span class="sheet-label"><BitsDecryptedText :text="label" /></span>
    <span class="sheet-project">Maker Faire Kochi &middot; 2027</span>
  </div>
</template>

<style scoped>
.sheet-head {
  grid-column: 1 / -1;
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
  margin-bottom: 5rem;
  border-top: 1px solid var(--pn-ink);
  font-family: var(--font-readout);
  font-weight: 500;
  font-size: 0.8125rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--pn-ink);
}

.sheet-head::before,
.sheet-head::after {
  content: '';
  position: absolute;
  top: -7px;
  width: 1px;
  height: 13px;
  background-color: var(--color-cyan);
}

.sheet-head::before {
  left: var(--pn-gutter);
}

.sheet-head::after {
  left: calc(100% / 3);
}

.sheet-n,
.sheet-label,
.sheet-project {
  padding-top: 0.85rem;
}

.sheet-n {
  padding-left: var(--pn-gutter);
}

.sheet-project {
  padding-right: var(--pn-gutter);
  text-align: right;
  color: var(--pn-label);
}

@media (max-width: 900px) {
  .sheet-head {
    grid-template-columns: auto minmax(0, 1fr);
    column-gap: 1.5rem;
    margin-bottom: 3rem;
  }

  .sheet-head::before {
    left: 1.25rem;
  }

  .sheet-head::after,
  .sheet-project {
    display: none;
  }

  .sheet-n {
    padding-left: 1.25rem;
  }
}
</style>
