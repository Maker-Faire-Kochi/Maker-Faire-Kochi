// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css', '~/assets/css/hero-scene.css'],

  // The hero scene is a server component: ~400KB of SVG path data that must be
  // sent once in the SSR HTML and never again in the client bundle.
  experimental: { componentIslands: true },

  runtimeConfig: {
    public: {
      /**
       * Public origin for social metadata.
       *
       * `useRequestURL()` in app.vue is correct under SSR, but `nuxt generate`
       * has NO request — it resolved to `http://localhost` and baked
       * `http://localhost/img/logo/...` into og:image and twitter:image, so
       * every share of a statically generated deploy had a broken preview.
       * Verified by grepping the generated index.html.
       *
       * Left empty by default so SSR keeps deriving the origin per request
       * (which survives a proxy or CDN). The three host variables below are
       * provided automatically by Netlify, Cloudflare Pages and Vercel
       * respectively, so a static deploy on any of them is correct with no
       * configuration; set NUXT_PUBLIC_SITE_URL to override.
       */
      siteUrl:
        process.env.NUXT_PUBLIC_SITE_URL ||
        process.env.URL ||
        process.env.CF_PAGES_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
        /**
         * Production origin, and the LAST link in the chain on purpose. The three
         * host variables above are set by Netlify / Cloudflare Pages / Vercel on
         * preview deploys, so a preview still describes itself correctly; only a
         * build with none of them set -- i.e. production, or `nuxt generate`
         * locally -- falls through to here. That is what stopped og:image being
         * baked as `http://localhost/img/logo/...` on a static deploy.
         */
        'https://makerfaire.in',
    },
  },
  app: {
    head: {
      title: 'Maker Faire Kochi 2027',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#FFFFFF' },
        { name: 'description', content: 'Maker Faire Kochi is happening on January 26 & 27, 2027! A celebration of invention, creativity, and the maker spirit in Kerala.' },
        { property: 'og:title', content: 'Maker Faire Kochi 2027' },
        { property: 'og:description', content: 'The Greatest Show (& Tell) on Earth comes to Kochi! Announcing Maker Faire Kochi on January 26 & 27, 2027. Join the celebration of invention, creativity, and curiosity.' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Maker Faire Kochi 2027' },
        { name: 'twitter:description', content: 'A family-friendly festival of invention, creativity, and resourcefulness. Kochi, January 26-27, 2027.' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // Outfit weights are exactly the ones the stylesheets use: 400 (body),
        // 500 (domain chips), 600 (lead/emphasis), 700 (countdown date). 300 and
        // 800 were requested and never referenced anywhere in app/.
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Bungee&family=Outfit:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;700&display=swap' },
        { rel: 'apple-touch-icon', href: '/img/logo/apple-touch-icon.png' },
        // Declared rather than left to the browser's implicit /favicon.ico probe,
        // and paired with a large PNG so modern browsers and PWA surfaces get the
        // real mark instead of a 48px upscale.
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'icon', type: 'image/png', href: '/img/logo/mf-kochi-square-512.png', sizes: '512x512' }
      ]
    }
  }
})
