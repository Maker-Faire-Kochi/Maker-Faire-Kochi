<script setup lang="ts">
useHead({
  meta: [{ name: 'theme-color', content: '#FFFFFF' }],
})
</script>

<template>
  <div class="form-layout maker-app">
    <NuxtRouteAnnouncer />
    <BitsClickSpark selector=".key, .spark" />
    <a href="#form-main" class="skip-link">Skip to form</a>
    <SheetBar
      sheet="Interest form"
      :links="[
        { href: '/', label: 'Home' },
        { href: '/interestform', label: 'Form' },
      ]"
    />
    <main id="form-main" tabindex="-1">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.form-layout {
  min-height: 100svh;
  color: var(--pn-ink);
}
</style>
