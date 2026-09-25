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
  color: var(--color-muted);
  font-family: var(--font-body);
}
</style>
