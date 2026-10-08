<script setup lang="ts">
import InterestForm from '~/modules/interest/components/InterestForm.vue'

definePageMeta({ layout: 'form' })

useSeoMeta({
  title: 'Get Involved — Maker Faire Kochi',
  description:
    'Tell us how you’d like to be part of Maker Faire Kochi 2027, Kerala’s first licensed Maker Faire, built together by TinkerHub Foundation, MakerGram and Kerala Startup Mission. Interest form — not registration.',
})
</script>

<template>
  <InterestForm />
</template>
