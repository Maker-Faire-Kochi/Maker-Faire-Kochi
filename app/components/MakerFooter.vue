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
</script>

<template>
  <footer class="maker-footer">
    <div class="container footer-container">
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
            A celebration of the maker movement, bringing engineers, crafters, artists, and innovators together in Kerala.
          </p>
          <!-- Was the literal text "X" / "IG" / "YT" in three boxes, pointing at
               twitter.com/makerfaire, instagram.com/makerfaire and
               youtube.com/makerfaire -- the GLOBAL Make Community accounts, not
               this faire's. Two real destinations now.

               The Instagram glyph is an inline SVG because @lucide/vue ships no
               brand icons (Instagram, Twitter and Youtube are simply not
               exported). Mail is a Lucide icon, so the two match in weight. -->
          <div class="social-links">
            <a :href="INSTAGRAM_URL" target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="Maker Faire Kochi on Instagram">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
            </a>
            <a :href="`mailto:${CONTACT_EMAIL}`" class="social-icon" aria-label="Email Maker Faire Kochi">
              <Mail :size="20" :stroke-width="2" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div class="footer-links-column">
          <h4 class="column-title subhead">Quick Links</h4>
          <ul class="link-list">
            <li><a href="#about" class="footer-link">About the Event</a></li>
            <li><a href="#categories" class="footer-link">Exhibition Themes</a></li>
            <li><a href="#countdown" class="footer-link">Countdown status</a></li>
          </ul>
        </div>

        <!-- Replaces the newsletter column. With the proposal CTAs removed there
             was otherwise NO way to contact the faire anywhere on the site. -->
        <div class="footer-contact-column">
          <h4 class="column-title subhead">Contact</h4>
          <a :href="`mailto:${CONTACT_EMAIL}`" class="contact-email">{{ CONTACT_EMAIL }}</a>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="legal-text">
          <p>© 2027 Maker Faire Kochi. All rights reserved.</p>
          <p class="trademark-text">
            Maker Faire is a registered trademark of Make Community LLC. Maker Faire Kochi is independently organized and operated under license from Make Community LLC.
          </p>
        </div>
        <div class="credits">
          Made with ❤️ by the <span class="highlight">Kochi Maker Community</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Charcoal, not ink. The countdown section directly above is ink, and two
   identical dark grounds stacked read as one slab with a heading floating in
   the middle of it. #1F1F1F against #292929 is a quiet but real step. */
.maker-footer {
  background-color: var(--color-charcoal);
  color: var(--label-on-dark);
  border-top: 1px solid var(--separator-on-dark);
  padding: 5rem 0 3rem 0;
  padding-bottom: calc(var(--rail-h) + 2rem + env(safe-area-inset-bottom));
  font-family: var(--font-body);
}

.footer-top {
  display: grid;
  grid-template-columns: 1.4fr 0.8fr 1fr;
  gap: 4rem;
  border-bottom: 1px solid var(--separator-on-dark);
  padding-bottom: 4rem;
  margin-bottom: 2.5rem;
}

/* The mark carries its own white plaque and cyan frame, so it needs no colour
   handling on the dark ground -- and the whole --color-red vs --color-red-on-dark
   question that the old typeset version raised simply goes away with it. */
.footer-logo {
  display: block;
  width: 216px;
  max-width: 100%;
  height: auto;
  margin-bottom: var(--sp-4);
}

.brand-desc {
  font-size: 0.95rem;
  color: var(--label-secondary-on-dark);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.social-links {
  display: flex;
  gap: 1rem;
}

/* Kept as the literal X / IG / YT strings rather than swapped for icons:
   @lucide/vue ships no brand glyphs (verified -- Twitter, Instagram and
   Youtube are simply not exported), and inventing lookalikes would be worse
   than plain initials. Sized to a real 44px target instead. */
.social-icon {
  /* 44px is the control-size floor; there is no separate width/height, because
     a 40px width under a 44px min-width is just a confusing way to write 44. */
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-white);
  /* INK, not charcoal. This chip used to be charcoal on an ink footer; the
     footer is charcoal now, so charcoal-on-charcoal would have erased it.
     Ink is the lighter of the two, so the step survives the swap. */
  background-color: var(--color-ink);
  color: var(--color-white);
  transition: transform var(--transition-fast), background-color var(--transition-fast), border-color var(--transition-fast);
}

.social-icon:hover {
  transform: translateY(-2px);
  background-color: var(--color-cyan);
  border-color: var(--color-cyan);
  color: var(--color-dark);
}

/* Links column */
/* Was Bungee at 1.2rem in cyan. Three cyan display headings made the accent do
   structural work; as sentence-case subheads they rank by weight instead, and
   cyan is left for the small rule that marks the column. */
.column-title {
  position: relative;
  margin-bottom: var(--sp-4);
  padding-bottom: var(--sp-2);
  color: var(--label-on-dark);
}

/* The accent, as a mark beside the words instead of the words themselves. */
.column-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 24px;
  height: 2px;
  background-color: var(--color-cyan);
}

.link-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-link {
  color: var(--label-secondary-on-dark);
  font-size: 1rem;
  transition: color var(--transition-fast);
  font-family: var(--font-mono);
}

.footer-link:hover {
  color: var(--color-cyan);
  text-decoration: underline;
}

/* Contact column */
/* The rule is text-decoration, NOT border-bottom. A border sits at the bottom
   of the BOX, and the 44px minimum target makes that box far taller than the
   text -- so the underline detached and floated well below the address. An
   underline with an offset hugs the glyphs however tall the hit area is. */
.contact-email {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-family: var(--font-mono);
  font-size: 1rem;
  color: var(--label-secondary-on-dark);
  text-decoration: underline;
  text-underline-offset: 0.25em;
  text-decoration-thickness: 1px;
  transition: color var(--transition-fast);
  /* An email address is one long unbroken token; without this it overflows the
     column at narrow widths instead of wrapping. */
  overflow-wrap: anywhere;
}

.contact-email:hover {
  color: var(--color-cyan);
}

/* Footer Bottom */
.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 3rem;
  font-size: 0.85rem;
  color: var(--color-muted-on-dark);
}

.legal-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 70%;
}

.trademark-text {
  font-size: 0.75rem;
  line-height: 1.4;
}

.credits {
  font-family: var(--font-mono);
  font-weight: 700;
  white-space: nowrap;
}

.credits .highlight {
  color: var(--color-cyan);
}

@media (max-width: 992px) {
  .footer-top {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .legal-text {
    max-width: 100%;
  }
}
</style>
