<script setup lang="ts">
import MediaPack from '~/modules/media-pack/components/MediaPack.vue'

definePageMeta({ layout: 'form' })

useSeoMeta({
  title: 'Media Pack — Maker Faire Kochi',
  description:
    'Make a share card with your own photo and tell everyone you’re coming to Maker Faire Kochi, 5–6 February 2027. Your photo stays on your device.',
})
</script>

<template>
  <MediaPack />
</template>
