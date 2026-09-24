<script setup lang="ts">
/** Old /admin/request → signup is now on login. */
await navigateTo('/admin/login', { replace: true })
</script>

<template>
  <p>Redirecting…</p>
</template>
