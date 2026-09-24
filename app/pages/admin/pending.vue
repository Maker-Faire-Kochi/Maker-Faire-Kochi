<script setup lang="ts">
import AdminPending from '~/modules/admin/components/AdminPending.vue'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth'],
})

useSeoMeta({ title: 'Waiting for approval — Maker Faire Kochi' })
</script>

<template>
  <ClientOnly>
    <AdminPending />
  </ClientOnly>
</template>
