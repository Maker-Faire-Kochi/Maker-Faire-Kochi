<script setup lang="ts">
import InterestField from '~/modules/interest/components/InterestField.vue'
import InterestSection from '~/modules/interest/components/InterestSection.vue'
import {
  MEDIA_DOMAINS,
  MEDIA_HOURS,
  MEDIA_OCCUPATIONS,
} from '~~/shared/volunteer/constants'
import { MAX_LEN } from '~~/shared/volunteer/validate'
import { useVolunteerForm } from '../composables/useVolunteerForm'

const { form, submitting, submitted, errors, toggleDomain, submit } = useVolunteerForm()

async function onSubmit(e: Event) {
  e.preventDefault()
  await submit()
}
</script>

<template>
  <div class="at-shell">
    <header class="at-hero">
      <p class="at-sheet">Sht 05 · Media volunteer</p>
      <h1 class="at-title">Media <span class="at-title-accent">team</span></h1>
      <p class="at-lede">
        Every maker has a story, and we need people to tell them. Join the Maker Faire
        Kochi media team as a videographer, editor, writer, or designer.
      </p>
      <p class="at-note">
        Open to volunteers across Kerala. This is a media-team call — not the general
        Get Involved form.
      </p>
    </header>

    <div v-if="submitted" class="at-card at-thanks" role="status">
      <div class="at-brand-bar" aria-hidden="true"><span class="cyan" /><span class="red" /></div>
      <h2>Thanks — you're on the list.</h2>
      <p>
        We read every response. Expect a follow-up as the media team takes shape for
        2027.
      </p>
      <a href="/" class="key at-btn-secondary">Back to Maker Faire Kochi</a>
    </div>

    <form v-else class="at-card" novalidate @submit="onSubmit">
      <div class="at-brand-bar" aria-hidden="true"><span class="cyan" /><span class="red" /></div>

      <div class="at-hp" aria-hidden="true">
        <label for="vol-website">Website</label>
        <input id="vol-website" v-model="form.website" type="text" tabindex="-1" autocomplete="off" />
      </div>

      <InterestSection title="1. About you">
        <InterestField label="Full name" required html-for="vol-name">
          <input
            id="vol-name"
            v-model="form.name"
            :maxlength="MAX_LEN.name"
            class="at-input"
            type="text"
            name="name"
            autocomplete="name"
            required
          />
        </InterestField>
        <InterestField label="Email address" required html-for="vol-email">
          <input
            id="vol-email"
            v-model="form.email"
            :maxlength="MAX_LEN.email"
            class="at-input"
            type="email"
            name="email"
            autocomplete="email"
            required
          />
        </InterestField>
        <InterestField label="Phone number (WhatsApp)" required html-for="vol-phone">
          <input
            id="vol-phone"
            v-model="form.phone"
            :maxlength="MAX_LEN.phone"
            class="at-input"
            type="tel"
            name="phone"
            autocomplete="tel"
            required
          />
        </InterestField>
        <InterestField label="Location" hint="Optional" html-for="vol-location">
          <input
            id="vol-location"
            v-model="form.location"
            :maxlength="MAX_LEN.location"
            class="at-input"
            type="text"
            name="location"
            autocomplete="address-level2"
          />
        </InterestField>
        <InterestField label="Occupation" hint="Optional">
          <div class="at-choices" role="radiogroup" aria-label="Occupation">
            <label v-for="o in MEDIA_OCCUPATIONS" :key="o.value" class="at-choice">
              <input v-model="form.occupation" type="radio" name="occupation" :value="o.value" />
              <span>{{ o.label }}</span>
            </label>
          </div>
        </InterestField>
      </InterestSection>

      <InterestSection
        title="2. How you want to contribute"
        subtitle="Pick every media domain that fits."
      >
        <InterestField label="Which domain would you like to contribute to?" required>
          <div class="at-choices">
            <label v-for="o in MEDIA_DOMAINS" :key="o.value" class="at-choice">
              <input
                type="checkbox"
                :checked="form.domains.includes(o.value)"
                @change="toggleDomain(o.value)"
              />
              <span>{{ o.label }}</span>
            </label>
          </div>
        </InterestField>
        <InterestField
          label="Portfolio or previous work"
          hint="Optional — a link to samples, Instagram, Drive, or a reel"
          html-for="vol-portfolio"
        >
          <input
            id="vol-portfolio"
            v-model="form.portfolioUrl"
            :maxlength="MAX_LEN.portfolio"
            class="at-input"
            type="text"
            name="portfolio"
            inputmode="url"
            placeholder="https://"
            autocomplete="url"
          />
        </InterestField>
        <InterestField label="Hours per week during the build-up" required>
          <div class="at-choices" role="radiogroup" aria-label="Hours per week">
            <label v-for="o in MEDIA_HOURS" :key="o.value" class="at-choice">
              <input v-model="form.hoursPerWeek" type="radio" name="hours" :value="o.value" required />
              <span>{{ o.label }}</span>
            </label>
          </div>
        </InterestField>
      </InterestSection>

      <div v-if="errors.length" class="at-errors" role="alert">
        <p v-for="(err, i) in errors" :key="i">{{ err }}</p>
      </div>

      <div class="at-actions">
        <button class="key key-red at-submit" type="submit" :disabled="submitting">
          {{ submitting ? 'Sending…' : 'Submit' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.at-shell {
  width: min(100%, 40rem);
  margin: 0 auto;
  padding: 2rem 1.25rem 4rem;
}
.at-hero {
  margin-bottom: 1.5rem;
}
.at-sheet {
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--pn-label);
}
.at-title {
  margin: 0 0 1rem;
  font-family: var(--font-panel);
  font-stretch: 62%;
  font-size: clamp(3rem, 9vw, 4.5rem);
  font-weight: 900;
  line-height: 0.88;
  text-transform: uppercase;
  color: var(--pn-ink);
}
.at-title-accent {
  color: var(--color-red);
}
.at-lede {
  margin: 0 0 0.75rem;
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--pn-ink);
}
.at-note {
  margin: 0;
  padding-left: 0.75rem;
  border-left: 3px solid var(--color-cyan);
  font-size: 1rem;
  color: var(--pn-label);
  line-height: 1.5;
}
.at-brand-bar {
  display: flex;
  height: 4px;
  margin: 0 -1.35rem 0.75rem;
}
.at-brand-bar .cyan { flex: 2; background: var(--color-cyan); }
.at-brand-bar .red { flex: 1; background: var(--color-red-cta); }
.at-card {
  background: #FFFFFF;
  border: 1px solid var(--pn-ink);
  box-shadow: 4px 4px 0 rgba(10, 10, 10, 0.1);
  padding: 0 1.35rem 1.5rem;
}
.at-thanks {
  padding: 1.25rem 1.5rem 2rem;
  text-align: left;
}
.at-thanks h2 {
  margin: 0.5rem 0 0.75rem;
  font-family: var(--font-panel);
  font-stretch: 62%;
  font-size: 2rem;
  font-weight: 900;
  line-height: 0.95;
  text-transform: uppercase;
  color: var(--pn-ink);
}
.at-thanks p {
  margin: 0 0 1.25rem;
  color: var(--pn-label);
  line-height: 1.5;
}
.at-input {
  width: 100%;
  box-sizing: border-box;
  font-family: var(--font-readout);
  font-size: 1rem;
  color: var(--pn-ink);
  background: #FFFFFF;
  border: 1px solid var(--pn-ink);
  border-radius: 0;
  padding: 0.7rem 0.85rem;
  min-height: 44px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.at-input:focus {
  outline: none;
  box-shadow: 0 0 0 1px var(--pn-ink), 3px 3px 0 var(--color-cyan);
}
.at-choices {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.at-choice {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  min-height: 44px;
  padding: 0.65rem 0.5rem;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 0.9rem;
  line-height: 1.35;
  color: var(--pn-ink);
}
.at-choice:hover {
  background: rgba(0, 174, 239, 0.06);
}
.at-choice:has(input:checked) {
  background: rgba(0, 174, 239, 0.08);
  border-color: var(--pn-ink);
  box-shadow: inset 3px 0 0 var(--color-red-cta);
}
.at-choice input {
  margin-top: 0.2rem;
  width: 1.05rem;
  height: 1.05rem;
  accent-color: var(--color-red-cta);
  flex-shrink: 0;
}
.at-actions {
  padding: 0.5rem 0 0.25rem;
}
.at-submit { min-width: 10rem; }
.at-submit:disabled {
  opacity: 0.65;
  cursor: wait;
}
.at-btn-secondary { text-decoration: none; }
.at-errors {
  border: 1px solid var(--color-red-cta);
  box-shadow: inset 3px 0 0 var(--color-red-cta);
  padding: 0.75rem 1rem;
  margin: 0.5rem 0 1rem;
}
.at-errors p {
  margin: 0.2rem 0;
  color: var(--color-red-cta);
  font-size: 1rem;
}
.at-hp {
  position: absolute;
  left: -9999px;
  height: 0;
  overflow: hidden;
}
</style>
