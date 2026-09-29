<script setup lang="ts">
import AdminDashboard from '~/modules/admin/components/AdminDashboard.vue'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth'],
})

useSeoMeta({ title: 'Interest dashboard — Maker Faire Kochi' })
</script>

<template>
  <ClientOnly>
    <AdminDashboard />
    <template #fallback>
      <p class="boot">Checking admin lock…</p>
    </template>
  </ClientOnly>
</template>

<style scoped>
.boot {
  margin: 3rem auto;
  text-align: center;
  color: var(--pn-label);
  font-family: var(--font-readout);
  font-size: 0.8rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
</style>
