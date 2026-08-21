// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Maker Faire Kochi 2027',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Maker Faire Kochi is happening on January 26 & 27, 2027! A celebration of invention, creativity, and the maker spirit in Kerala.' },
        { property: 'og:title', content: 'Maker Faire Kochi 2027' },
        { property: 'og:description', content: 'The Greatest Show (& Tell) on Earth comes to Kochi! Announcing Maker Faire Kochi on January 26 & 27, 2027. Join the celebration of invention, creativity, and curiosity.' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Maker Faire Kochi 2027' },
        { name: 'twitter:description', content: 'A family-friendly festival of invention, creativity, and resourcefulness. Kochi, January 26-27, 2027.' }
      ]
    }
  }
})
