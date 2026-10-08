<script setup>
import { Mail } from '@lucide/vue'
import { CONTACT_EMAIL, INSTAGRAM_URL } from '~/composables/useCountdown'

/**
 * The newsletter form was REMOVED at the owner's request. It is worth knowing
 * what it actually did: `handleSubscribe` set a flag, cleared the field, showed
 * "You're on the list", and reset after five seconds. It never sent anything
 * anywhere -- there was no endpoint and no storage, so every address typed into
 * it was silently discarded. Removing it is the honest outcome; wiring it to a
 * real provider would have been the other one.
 *
 * If a form ever returns here, RESTORE THE NAV RAIL'S KEYBOARD AVOIDANCE with
 * it (see MakerHeader.vue) -- that logic existed solely because this input sat
 * under a fixed bottom rail on phones.
 */
const sheets = [
  { n: '00', label: 'General arrangement', href: '#top' },
  { n: '01', label: 'About', href: '#about' },
  { n: '02', label: 'Domains', href: '#categories' },
  { n: '03', label: 'When', href: '#countdown' },
]
</script>

<template>
  <footer class="maker-footer enamel">
    <SheetHead n="04" label="Colophon" />
    <div class="footer-container">
      <div class="footer-top">
        <div class="footer-brand-column">
          <!-- The real lockup, not a Bungee approximation of it. This was
               typeset as "Make:" + "Maker Faire" + "Kochi" with a red colon and
               cyan city, which is a redrawing of a licensed trademark in the
               wrong typeface -- and it drifts from the official mark every time
               anyone touches the CSS. Same <picture> pattern as the hero. -->
          <picture>
            <source srcset="/img/logo/mf-kochi-long@2x.webp 2x, /img/logo/mf-kochi-long.webp 1x" type="image/webp" />
            <img
              src="/img/logo/mf-kochi-long.png"
              width="216"
              height="36"
              class="footer-logo"
              alt="Maker Faire Kochi"
              loading="lazy"
              decoding="async"
            />
          </picture>
          <p class="brand-desc">
            Organised by TinkerHub Foundation and MakerGram. Kerala’s first licensed Maker Faire — a public stage for the people already building in the state’s labs and campuses.
          </p>
          <!-- Was the literal text "X" / "IG" / "YT" in three boxes, pointing at
               twitter.com/makerfaire, instagram.com/makerfaire and
               youtube.com/makerfaire -- the GLOBAL Make Community accounts, not
               this faire's. Two real destinations now.

               The Instagram glyph is an inline SVG because @lucide/vue ships no
               brand icons (Instagram, Twitter and Youtube are simply not
               exported). Mail is a Lucide icon, so the two match in weight. -->
          <div class="social-links">
            <a :href="INSTAGRAM_URL" target="_blank" rel="noopener noreferrer" class="social-link">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              Instagram
            </a>
            <a :href="`mailto:${CONTACT_EMAIL}`" class="social-link">
              <Mail :size="16" :stroke-width="2" aria-hidden="true" />
              Email
            </a>
          </div>
        </div>

        <nav class="footer-links-column" aria-labelledby="sheet-index">
          <h4 id="sheet-index" class="column-title">Sheet index</h4>
          <ol class="link-list">
            <li v-for="s in sheets" :key="s.n">
              <a :href="s.href" class="footer-link"><span class="sheet-n" aria-hidden="true">{{ s.n }}</span>{{ s.label }}</a>
            </li>
          </ol>
        </nav>

        <!-- Replaces the newsletter column. With the proposal CTAs removed there
             was otherwise NO way to contact the faire anywhere on the site. -->
        <div class="footer-contact-column">
          <h4 class="column-title">Contact</h4>
          <a :href="`mailto:${CONTACT_EMAIL}`" class="contact-email">{{ CONTACT_EMAIL }}</a>

          <dl class="colophon">
            <div>
              <dt>Organised by</dt>
              <dd>TinkerHub Foundation and MakerGram</dd>
            </div>
          </dl>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="credits">© 2027 Maker Faire Kochi. All rights reserved.</p>
        <p class="legal-text">
          Maker Faire is a registered trademark of Make Community LLC. Maker Faire Kochi is independently organized and operated under license from Make Community LLC.
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* The sheet's title block: ruled cells on the page's own column line. */
.maker-footer,
.maker-footer p {
  font-family: var(--font-readout);
}

.maker-footer {
  display: grid;
  grid-template-columns: var(--pn-grid);
  /* Ends exactly on the pinned strip, which closes the last row. */
  padding-bottom: calc(var(--rail-h) + env(safe-area-inset-bottom));
  color: var(--pn-ink);
}

.maker-footer :deep(.sheet-head) {
  margin-bottom: 0;
}

.footer-container {
  grid-column: 1 / -1;
}

.footer-top,
.footer-bottom {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
}

/* Same rule as every table above: the wide bay's first cell starts ON the
   column line, and only the cells after it are ruled off. */
.footer-top > *,
.footer-bottom > * {
  padding: 2.5rem var(--pn-gutter) 2.5rem 0;
}

.footer-top > .footer-brand-column,
.footer-bottom > .credits {
  padding-left: var(--pn-gutter);
}



.footer-bottom {
  border-top: 1px solid var(--pn-ink);
}

.footer-logo {
  display: block;
  width: 200px;
  max-width: 100%;
  height: auto;
  margin-bottom: 1.5rem;
}

.brand-desc {
  max-width: 32ch;
  font-size: 1.125rem;
  line-height: 1.55;
  color: var(--pn-label);
  margin-bottom: 1.5rem;
}

.social-links {
  display: flex;
  gap: 1.5rem;
}

.social-link,
.footer-link,
.contact-email {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  color: var(--pn-ink);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.3em;
  transition: text-decoration-color var(--dur-fast) linear;
}

.social-link {
  font-family: var(--font-readout);
  font-weight: 500;
  font-size: 1.125rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.column-title {
  margin-bottom: 0.75rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid var(--pn-ink);
  font-family: var(--font-readout);
  font-weight: 500;
  font-size: 0.875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--pn-label);
}

.link-list {
  list-style: none;
  display: flex;
  flex-direction: column;
}

.link-list {
  margin-top: -0.75rem;
}

.link-list li {
  border-bottom: 1px solid var(--pn-ink);
}

.footer-link {
  display: flex;
  gap: 1rem;
  font-size: 1.125rem;
  text-decoration-color: transparent;
}

.sheet-n {
  width: 1.6rem;
  color: var(--pn-label);
  font-variant-numeric: tabular-nums;
}

.colophon {
  display: grid;
  gap: 1rem;
  margin-top: 2rem;
}

.colophon dt {
  font-weight: 500;
  font-size: 0.875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--pn-label);
}

.colophon dd {
  margin: 0.3rem 0 0;
  font-size: 1.125rem;
  color: var(--pn-ink);
}

.footer-link:hover {
  text-decoration-color: currentColor;
}

.contact-email {
  font-family: var(--font-readout);
  font-size: 1rem;
  overflow-wrap: anywhere;
}

.footer-bottom {
  font-size: 1.125rem;
  color: var(--pn-label);
}

.legal-text,
.credits {
  font-size: 1rem;
  line-height: 1.55;
  color: var(--pn-label);
}

.legal-text {
  grid-column: 2 / -1;
  grid-row: 1;
  max-width: 80ch;
}

.credits {
  grid-column: 1;
  grid-row: 1;
}

@media (max-width: 900px) {
  .maker-footer {
    grid-template-columns: minmax(0, 1fr);
  }

  .footer-top,
  .footer-bottom {
    grid-template-columns: minmax(0, 1fr);
  }

  .footer-top > *,
  .footer-bottom > *,
  .footer-top > .footer-brand-column,
  .footer-bottom > .credits {
    padding: 2rem 1.25rem;
  }

  .footer-top > * + *,
  .footer-bottom > .credits {
    border-top: 1px solid var(--pn-ink);
  }

  .legal-text,
  .credits {
    grid-column: 1;
    grid-row: auto;
  }
}
</style>
