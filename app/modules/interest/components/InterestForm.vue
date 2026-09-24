<script setup lang="ts">
import InterestField from './InterestField.vue'
import InterestSection from './InterestSection.vue'
import {
  HAS_PROJECT,
  HEARD_FROM,
  LOCATIONS,
  ORG_COLLABORATE,
  PARTICIPATION,
  PROJECT_CATEGORIES,
  SELF_DESCRIBE,
  VOLUNTEER_AREAS,
  VOLUNTEER_TIME,
} from '~~/shared/interest/constants'
import { useInterestForm } from '../composables/useInterestForm'

const {
  form,
  submitting,
  submitted,
  errors,
  showContribute,
  showProjectBlock,
  showVolunteer,
  toggleParticipation,
  toggleCategory,
  toggleVolunteerArea,
  submit,
} = useInterestForm()

async function onSubmit(e: Event) {
  e.preventDefault()
  await submit()
}
</script>

<template>
  <div class="at-shell">
    <header class="at-hero">
      <a href="/" class="at-logo" aria-label="Maker Faire Kochi home">
        <img
          src="/img/logo/mf-kochi-square-512.png"
          width="40"
          height="40"
          alt=""
        />
        <span>Maker Faire Kochi</span>
      </a>
      <h1 class="at-title">Get <span class="at-title-accent">Involved</span></h1>
      <p class="at-lede">
        Make. Share. Build. Connect. Maker Faire Kochi brings together makers, creators,
        students, artists, innovators, educators, and curious minds. Tell us how you'd
        like to be part of the Faire!
      </p>
      <p class="at-note">
        This is an interest form, not registration. We'll follow up when the next step opens.
      </p>
    </header>

    <div v-if="submitted" class="at-card at-thanks" role="status">
      <div class="at-brand-bar" aria-hidden="true"><span class="cyan" /><span class="red" /></div>
      <h2>Thanks — you're on our radar.</h2>
      <p>
        We read every response. If you offered to exhibit, volunteer, or partner, expect a
        follow-up as plans firm up.
      </p>
      <a href="/" class="at-btn-secondary">Back to Maker Faire Kochi</a>
    </div>

    <form v-else class="at-card" novalidate @submit="onSubmit">
      <div class="at-brand-bar" aria-hidden="true"><span class="cyan" /><span class="red" /></div>
      <!-- honeypot -->
      <div class="at-hp" aria-hidden="true">
        <label for="website">Website</label>
        <input id="website" v-model="form.website" type="text" tabindex="-1" autocomplete="off" />
      </div>

      <InterestSection title="1. Basic information">
        <InterestField label="Name" required html-for="name">
          <input id="name" v-model="form.name" class="at-input" type="text" name="name" autocomplete="name" required />
        </InterestField>
        <InterestField label="Email address" required html-for="email">
          <input id="email" v-model="form.email" class="at-input" type="email" name="email" autocomplete="email" required />
        </InterestField>
        <InterestField label="Phone number" hint="Optional" html-for="phone">
          <input id="phone" v-model="form.phone" class="at-input" type="tel" name="phone" autocomplete="tel" />
        </InterestField>
        <InterestField label="Where are you from?" required>
          <div class="at-choices" role="radiogroup" aria-label="Where are you from?">
            <label v-for="o in LOCATIONS" :key="o.value" class="at-choice">
              <input v-model="form.location" type="radio" name="location" :value="o.value" />
              <span>{{ o.label }}</span>
            </label>
          </div>
        </InterestField>
        <InterestField label="What best describes you?" required>
          <div class="at-choices" role="radiogroup" aria-label="What best describes you?">
            <label v-for="o in SELF_DESCRIBE" :key="o.value" class="at-choice">
              <input v-model="form.selfDescribe" type="radio" name="selfDescribe" :value="o.value" />
              <span>{{ o.label }}</span>
            </label>
          </div>
          <input
            v-if="form.selfDescribe === 'other'"
            v-model="form.selfDescribeOther"
            class="at-input at-input-follow"
            type="text"
            placeholder="Tell us more"
            aria-label="Other description"
          />
        </InterestField>
      </InterestSection>

      <InterestSection
        title="2. How do you want to be part of Maker Faire Kochi?"
        subtitle="Pick everything that fits — this is the main question."
      >
        <InterestField label="How would you like to participate?" required>
          <div class="at-choices">
            <label v-for="o in PARTICIPATION" :key="o.value" class="at-choice">
              <input
                type="checkbox"
                :checked="form.participation.includes(o.value)"
                @change="toggleParticipation(o.value)"
              />
              <span>{{ o.label }}</span>
            </label>
          </div>
        </InterestField>
        <InterestField
          label="What would you like to make possible at Maker Faire Kochi?"
          hint="Ideas beyond the checklist are welcome — that's the spirit of a Maker Faire."
          html-for="makePossible"
        >
          <textarea id="makePossible" v-model="form.makePossible" class="at-textarea" rows="3" />
        </InterestField>
      </InterestSection>

      <InterestSection v-if="showContribute || showProjectBlock" title="3. If you want to contribute…">
        <InterestField
          v-if="showContribute"
          label="Tell us a little about what you'd like to contribute."
          hint="What do you make, teach, organize, or bring to the community?"
          required
          html-for="contribute"
        >
          <textarea id="contribute" v-model="form.contributeText" class="at-textarea" rows="4" />
        </InterestField>
        <template v-if="showProjectBlock">
          <InterestField label="Do you already have a project or idea you'd like to showcase?" required>
            <div class="at-choices" role="radiogroup">
              <label v-for="o in HAS_PROJECT" :key="o.value" class="at-choice">
                <input v-model="form.hasProject" type="radio" name="hasProject" :value="o.value" />
                <span>{{ o.label }}</span>
              </label>
            </div>
          </InterestField>
          <template v-if="form.hasProject === 'yes'">
            <InterestField label="Tell us about your project." required html-for="project">
              <textarea id="project" v-model="form.projectDescription" class="at-textarea" rows="4" />
            </InterestField>
            <InterestField label="What category does your project fall under?" required>
              <div class="at-choices">
                <label v-for="o in PROJECT_CATEGORIES" :key="o.value" class="at-choice">
                  <input
                    type="checkbox"
                    :checked="form.projectCategories.includes(o.value)"
                    @change="toggleCategory(o.value)"
                  />
                  <span>{{ o.label }}</span>
                </label>
              </div>
            </InterestField>
          </template>
        </template>
      </InterestSection>

      <InterestSection v-if="showVolunteer" title="4. For volunteers">
        <InterestField label="What would you like to help with?" required>
          <div class="at-choices">
            <label v-for="o in VOLUNTEER_AREAS" :key="o.value" class="at-choice">
              <input
                type="checkbox"
                :checked="form.volunteerAreas.includes(o.value)"
                @change="toggleVolunteerArea(o.value)"
              />
              <span>{{ o.label }}</span>
            </label>
          </div>
        </InterestField>
        <InterestField label="How much time can you contribute?" required>
          <div class="at-choices" role="radiogroup">
            <label v-for="o in VOLUNTEER_TIME" :key="o.value" class="at-choice">
              <input v-model="form.volunteerTime" type="radio" name="volunteerTime" :value="o.value" />
              <span>{{ o.label }}</span>
            </label>
          </div>
        </InterestField>
      </InterestSection>

      <InterestSection title="5. Community / organization">
        <InterestField label="Are you part of a makerspace, club, school, college, community, or organization?">
          <div class="at-choices" role="radiogroup">
            <label class="at-choice">
              <input v-model="form.inOrganization" type="radio" name="inOrg" :value="true" />
              <span>Yes</span>
            </label>
            <label class="at-choice">
              <input v-model="form.inOrganization" type="radio" name="inOrg" :value="false" />
              <span>No</span>
            </label>
          </div>
        </InterestField>
        <template v-if="form.inOrganization === true || form.participation.includes('org_booth')">
          <InterestField label="Organization / community name" required html-for="orgName">
            <input id="orgName" v-model="form.orgName" class="at-input" type="text" />
          </InterestField>
          <InterestField label="Would your organization be interested in collaborating with Maker Faire Kochi?" required>
            <div class="at-choices" role="radiogroup">
              <label v-for="o in ORG_COLLABORATE" :key="o.value" class="at-choice">
                <input v-model="form.orgCollaborate" type="radio" name="orgCollab" :value="o.value" />
                <span>{{ o.label }}</span>
              </label>
            </div>
          </InterestField>
        </template>
      </InterestSection>

      <InterestSection title="6. Final">
        <InterestField label="How did you hear about Maker Faire Kochi?">
          <div class="at-choices" role="radiogroup">
            <label v-for="o in HEARD_FROM" :key="o.value" class="at-choice">
              <input v-model="form.heardFrom" type="radio" name="heardFrom" :value="o.value" />
              <span>{{ o.label }}</span>
            </label>
          </div>
          <input
            v-if="form.heardFrom === 'other'"
            v-model="form.heardFromOther"
            class="at-input at-input-follow"
            type="text"
            placeholder="Where did you hear about us?"
          />
        </InterestField>
        <InterestField label="Anything else you'd like to tell us?" hint="Optional" html-for="else">
          <textarea id="else" v-model="form.anythingElse" class="at-textarea" rows="3" />
        </InterestField>
      </InterestSection>

      <div v-if="errors.length" class="at-errors" role="alert">
        <p v-for="(err, i) in errors" :key="i">{{ err }}</p>
      </div>

      <div class="at-actions">
        <button class="at-submit" type="submit" :disabled="submitting">
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
.at-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  color: var(--color-ink);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}
.at-logo img {
  border-radius: 8px;
  box-shadow: 0 0 0 2px var(--color-cyan);
}
.at-title {
  margin: 0 0 0.75rem;
  font-family: var(--font-body);
  font-size: clamp(1.6rem, 4vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-ink);
}
/* Large display accent — --color-red clears 3:1 large-text on white. */
.at-title-accent {
  color: var(--color-red);
}
.at-lede {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  line-height: 1.55;
  color: var(--color-gray-800);
}
.at-note {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-muted);
  line-height: 1.45;
}
.at-brand-bar {
  display: flex;
  gap: 0.35rem;
  height: 3px;
  margin: 0.35rem 0 0.75rem;
}
.at-brand-bar .cyan {
  flex: 2;
  border-radius: 2px;
  background: var(--color-cyan);
}
.at-brand-bar .red {
  flex: 1;
  border-radius: 2px;
  background: var(--color-red);
}
.at-card {
  background: var(--color-white);
  border: 1px solid var(--separator);
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(41, 41, 41, 0.04), 0 8px 24px rgba(0, 174, 239, 0.06);
  padding: 0.85rem 1.35rem 1.5rem;
}
.at-thanks {
  padding: 1.25rem 1.5rem 2rem;
  text-align: left;
}
.at-thanks h2 {
  margin: 0 0 0.75rem;
  font-family: var(--font-body);
  font-size: 1.35rem;
  color: var(--color-ink);
}
.at-thanks p {
  margin: 0 0 1.25rem;
  color: var(--color-muted);
  line-height: 1.5;
}
.at-input,
.at-textarea {
  width: 100%;
  box-sizing: border-box;
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-ink);
  background: var(--color-white);
  border: 1px solid var(--color-gray-400);
  border-radius: 8px;
  padding: 0.7rem 0.85rem;
  min-height: 44px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.at-textarea {
  min-height: 6rem;
  resize: vertical;
  line-height: 1.45;
}
.at-input:focus,
.at-textarea:focus {
  outline: none;
  border-color: var(--color-cyan);
  box-shadow: 0 0 0 3px rgba(0, 174, 239, 0.22);
}
.at-input-follow {
  margin-top: 0.65rem;
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
  padding: 0.55rem 0.4rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  line-height: 1.35;
  color: var(--color-ink);
}
.at-choice:hover {
  background: rgba(0, 174, 239, 0.06);
}
.at-choice:has(input:checked) {
  background: rgba(0, 174, 239, 0.1);
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
.at-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0.65rem 1.4rem;
  border: none;
  border-radius: 8px;
  background: var(--color-red-cta);
  color: var(--color-white);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
}
.at-submit:hover:not(:disabled) {
  filter: brightness(0.96);
}
.at-submit:disabled {
  opacity: 0.65;
  cursor: wait;
}
.at-submit:focus-visible {
  outline: 2px solid var(--color-cyan);
  outline-offset: 2px;
}
.at-btn-secondary {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--color-cyan);
  color: var(--color-ink);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
}
.at-btn-secondary:hover {
  background: rgba(0, 174, 239, 0.08);
}
.at-errors {
  background: rgba(196, 18, 26, 0.06);
  border: 1px solid rgba(196, 18, 26, 0.28);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin: 0.5rem 0 1rem;
}
.at-errors p {
  margin: 0.2rem 0;
  color: var(--color-red-cta);
  font-size: 0.875rem;
}
.at-hp {
  position: absolute;
  left: -9999px;
  height: 0;
  overflow: hidden;
}
</style>
