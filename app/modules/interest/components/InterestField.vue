<script setup lang="ts">
defineProps<{
  label: string
  required?: boolean
  hint?: string
  htmlFor?: string
}>()
</script>

<template>
  <div class="at-field">
    <label v-if="label" class="at-label" :for="htmlFor">
      {{ label }}
      <span v-if="required" class="at-req" aria-hidden="true">*</span>
    </label>
    <p v-if="hint" class="at-hint">{{ hint }}</p>
    <slot />
  </div>
</template>

<style scoped>
.at-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.25rem;
}
.at-label {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--pn-ink);
}
.at-req {
  color: var(--color-red-cta);
  margin-left: 0.15rem;
}
.at-hint {
  margin: 0;
  font-size: 1rem;
  color: var(--pn-label);
  line-height: 1.4;
}
</style>
