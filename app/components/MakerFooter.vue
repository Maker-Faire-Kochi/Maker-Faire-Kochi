<script setup>
import { ref } from 'vue'
import { Check } from '@lucide/vue'

const email = ref('')
const subscribed = ref(false)

const handleSubscribe = () => {
  if (email.value.trim()) {
    subscribed.value = true
    email.value = ''
    setTimeout(() => {
      subscribed.value = false
    }, 5000)
  }
}
</script>

<template>
  <footer class="maker-footer">
    <div class="container footer-container">
      <div class="footer-top">
        <div class="footer-brand-column">
          <div class="footer-logo">
            Make<span class="colon">:</span> Maker Faire <span class="location">Kochi</span>
          </div>
          <p class="brand-desc">
            A celebration of the maker movement, bringing engineers, crafters, artists, and innovators together in Kerala.
          </p>
          <div class="social-links">
            <a href="https://twitter.com/makerfaire" target="_blank" rel="noopener" class="social-icon" aria-label="Twitter">
              X
            </a>
            <a href="https://instagram.com/makerfaire" target="_blank" rel="noopener" class="social-icon" aria-label="Instagram">
              IG
            </a>
            <a href="https://youtube.com/makerfaire" target="_blank" rel="noopener" class="social-icon" aria-label="YouTube">
              YT
            </a>
          </div>
        </div>

        <div class="footer-links-column">
          <h4 class="column-title">Quick Links</h4>
          <ul class="link-list">
            <li><a href="#about" class="footer-link">About the Event</a></li>
            <li><a href="#countdown" class="footer-link">Countdown status</a></li>
            <li><a href="#categories" class="footer-link">Exhibition Themes</a></li>
            <li><a href="https://forms.gle/makerfairekochi2027" target="_blank" rel="noopener noreferrer" class="footer-link">Submit a Project</a></li>
          </ul>
        </div>

        <div class="footer-newsletter-column">
          <h4 class="column-title">Get Event Updates</h4>
          <p class="newsletter-desc">Subscribe to get notified about tickets, schedules, and key announcements.</p>
          
          <form v-if="!subscribed" @submit.prevent="handleSubscribe" class="newsletter-form">
            <input 
              v-model="email" 
              type="email" 
              placeholder="your.email@example.com" 
              required 
              class="newsletter-input" 
            />
            <button type="submit" class="btn-maker btn-maker-primary newsletter-btn">
              Subscribe
            </button>
          </form>
          
          <p v-else class="subscribe-success" role="status">
            <Check class="subscribe-check" :size="18" :stroke-width="2.5" aria-hidden="true" />
            You're on the list. We'll keep you posted.
          </p>
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
.maker-footer {
  background-color: var(--color-dark);
  color: var(--color-white);
  border-top: var(--border-width-thick) solid var(--color-dark);
  padding: 5rem 0 3rem 0;
  padding-bottom: calc(var(--rail-h) + 2rem + env(safe-area-inset-bottom));
  font-family: var(--font-body);
}

.footer-top {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 1fr;
  gap: 4rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 4rem;
  margin-bottom: 2.5rem;
}

.footer-logo {
  font-family: var(--font-headline);
  font-size: 1.5rem;
  margin-bottom: 1.2rem;
  text-transform: uppercase;
}

.footer-logo .colon {
  color: var(--color-red);
}

.footer-logo .location {
  color: var(--color-cyan);
}

.brand-desc {
  font-size: 0.95rem;
  color: var(--color-gray-400);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: var(--border-width-thin) solid var(--color-white);
  background-color: var(--color-charcoal);
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 0.9rem;
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
.column-title {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color: var(--color-cyan);
}

.link-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-link {
  color: var(--color-gray-400);
  font-size: 1rem;
  transition: color var(--transition-fast);
  font-family: var(--font-mono);
  text-transform: uppercase;
}

.footer-link:hover {
  color: var(--color-cyan);
  padding-left: 4px;
}

/* Newsletter Column */
.newsletter-desc {
  font-size: 0.95rem;
  color: var(--color-gray-400);
  margin-bottom: 1.25rem;
}

.newsletter-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.newsletter-input {
  width: 100%;
  padding: 0.85rem 1rem;
  border: var(--border-width-thick) solid var(--color-white);
  background-color: var(--color-charcoal);
  color: var(--color-white);
  font-family: var(--font-body);
  font-size: 1rem;
  border-radius: var(--radius-pill);
}

/* No `outline: none` here. It suppressed the global focus ring and left the 1px
   border swapping white for cyan as the ONLY indicator — 2.53:1 across a single
   pixel, which is not a focus indicator. The global `.maker-footer
   :focus-visible` rule paints a real 2px cyan ring; the border shift is now just
   reinforcement rather than the whole signal. */
.newsletter-input:focus {
  border-color: var(--color-cyan);
}

.newsletter-btn {
  width: 100%;
  justify-content: center;
  border-color: var(--color-white);
  box-shadow: var(--shadow-soft);
  border-radius: var(--radius-pill);
}

.newsletter-btn:hover {
  box-shadow: var(--shadow-soft);
}

.subscribe-check {
  color: var(--color-cyan);
  flex-shrink: 0;
}

.subscribe-success {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: rgba(0, 174, 239, 0.1);
  border: var(--border-width-thin) solid var(--color-cyan);
  color: var(--color-cyan);
  padding: 1rem;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 0.95rem;
  text-align: center;
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
