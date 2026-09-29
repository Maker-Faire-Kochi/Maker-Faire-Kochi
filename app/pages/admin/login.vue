<script setup lang="ts">
import AdminLogin from '~/modules/admin/components/AdminLogin.vue'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-guest'],
})

useSeoMeta({ title: 'Admin login — Maker Faire Kochi' })
</script>

<template>
  <ClientOnly>
    <AdminLogin />
    <template #fallback>
      <p class="boot">Loading lock screen…</p>
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
