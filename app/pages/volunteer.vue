<script setup lang="ts">
import VolunteerForm from '~/modules/volunteer/components/VolunteerForm.vue'

definePageMeta({ layout: 'form' })

useSeoMeta({
  title: 'Media Team Volunteer — Maker Faire Kochi',
  description:
    'Join the Maker Faire Kochi 2027 media team as a videographer, editor, writer, or designer. Open to volunteers across Kerala.',
})
</script>

<template>
  <VolunteerForm />
</template>
