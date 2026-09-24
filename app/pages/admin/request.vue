<script setup lang="ts">
import AdminAccessRequest from '~/modules/admin/components/AdminAccessRequest.vue'

definePageMeta({
  layout: 'admin',
  middleware: [],
})

useSeoMeta({ title: 'Request organizer access — Maker Faire Kochi' })
</script>

<template>
  <ClientOnly>
    <AdminAccessRequest />
  </ClientOnly>
</template>
