<script setup lang="ts">
import { Hammer, Users, Sparkles } from '@lucide/vue'

/**
 * Three equal icon+heading+text cards was the page's structure here. Cards are
 * the lazy container: they flatten three different invitations into one shape
 * and let the section carry no hierarchy at all. This is a hairline-separated
 * editorial stack instead — same content, real rhythm, and it collapses to a
 * single column without the card chrome fighting it.
 */
const invitations = [
  {
    icon: Hammer,
    title: 'Exhibit your project',
    body: 'Whether you built a giant metal dragon, a smart IoT farm system, or beautiful upcycled art — we want you to show it.',
    href: '/interestform',
    cta: 'Get involved',
    external: false,
  },
  {
    icon: Users,
    title: 'Learn and connect',
    body: 'Meet developers, hardware designers, crafters and educators. Share knowledge, tools and ideas.',
    href: '#countdown',
    cta: 'See the dates',
    external: false,
  },
  {
    icon: Sparkles,
    title: 'Inspire the next lot',
    body: 'Bring your kids and family for hands-on workshops, live demos, robotics leagues and interactive science.',
    href: '#categories',
    cta: 'Explore what fits',
    external: false,
  },
]
</script>

<template>
  <section id="about" class="about-section section-padding">
    <div class="container">
      <div class="about-grid">
        <div class="about-text-area">
          <h2 class="section-title display-type">What is Maker Faire?</h2>
          <p class="lead-text">
            Maker Faire is the Greatest Show (and Tell) on Earth—a family-friendly festival of invention, creativity, and resourcefulness.
          </p>
          <p class="body-text">
            A gathering of curious people who like learning and love showing what
            they can do — engineers and embroiderers, science clubs and cooks,
            hobbyists and hard-headed tinkerers.
          </p>
          <p class="body-text">
            We call it a <strong>celebration of the Maker Movement</strong>: a place
            where hands-on learning meets whatever comes next, and where anyone can
            find out what it feels like to make a thing from scratch.
          </p>

        </div>

        <ul class="invitations">
          <li v-for="item in invitations" :key="item.title" class="invitation">
            <component :is="item.icon" class="invitation-icon" :size="22" :stroke-width="1.75" aria-hidden="true" />
            <div class="invitation-body">
              <h3 class="invitation-title subhead">{{ item.title }}</h3>
              <p class="invitation-text">{{ item.body }}</p>
              <a
                v-if="item.cta"
                :href="item.href"
                :target="item.external ? '_blank' : undefined"
                :rel="item.external ? 'noopener noreferrer' : undefined"
                class="invitation-link"
              >{{ item.cta }}</a>
            </div>
          </li>
        </ul>
      </div>

      <!-- Full-width row of its own. It used to sit at the bottom of the left
           column, which is most of why that column ran roughly twice the height
           of the right one. -->
      <div class="kochi-focus">
        <h3 class="focus-title subhead">Why Kochi?</h3>
        <p class="kochi-text">
          Kochi is the innovation and hardware prototyping capital of Kerala — a
          thriving ecosystem of incubators, fablabs, maker spaces and design
          studios. It is also a city that has repaired, adapted and re-rigged
          borrowed technology for six hundred years. Both of those are the same
          instinct.
        </p>
      </div>

      <!-- Global Impact Stats -->
      <div class="stats-container">
        <h3 class="stats-header display-type">The Global Impact of Maker Faire</h3>
        <!-- One treatment for all four. They previously differed ONLY by a 3px
             coloured top border while every numeral was already ink, so the
             colour drew a distinction that meant nothing -- and spent the
             accent palette to do it. The numeral carries the rank now. -->
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-number">40+</span>
            <span class="stat-label">Countries Hosting</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">150+</span>
            <span class="stat-label">Annual Faires</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">1.5M+</span>
            <span class="stat-label">Annual Attendees</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">2006</span>
            <span class="stat-label">Year Established</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* The full-bleed 1px ink rule that used to close this section is gone: it
   belonged to no system and was the only hairline of its kind on the page.
   Separation from the Domains section comes from the ground change instead. */
.about-section {
  background-color: var(--bg-base);
}

/* Equal columns. It was 1.1fr / 0.9fr with all the prose plus the Kochi panel
   on the left, so the left ran roughly twice the height of the right and the
   row read as lopsided. "Why Kochi" now sits in its own full-width row below. */
.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: start;
}

.section-title {
  font-size: var(--text-title-1);
  line-height: var(--text-title-1-lh);
  margin-bottom: var(--sp-4);
  color: var(--label);
}

/* A pull quote, not three lines of shouting. It was 20.8px of saturated
   --color-red-cta running three lines deep, which passes contrast (6.09:1) but
   fights the headline directly above it for the same attention. Red survives as
   the rule down the left edge — an accent beside the words, which is what the
   palette reserves it for — while the words themselves are read in ink. */
.lead-text {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-ink);
  margin-bottom: 1.5rem;
  padding-left: 1.25rem;
  border-left: 3px solid var(--color-red-cta);
}

.body-text {
  color: var(--color-gray-800);
  margin-bottom: var(--sp-4);
}

.kochi-focus {
  margin-top: var(--sp-6);
  padding: var(--sp-5) 2.25rem;
  background-color: var(--surface-2);
  border: 1px solid var(--separator);
  border-radius: var(--radius-card);
}

/* This is the section's argument, not its footnote. At --color-muted (#5A6169,
   6.27:1) and 1.1rem it read as fine print under its own heading; --color-gray-800
   is #3A3F45 at 10.62:1, which is the emphasis the content actually carries. */
.kochi-text {
  max-width: 68ch;
  font-size: 1.15rem;
  color: var(--color-gray-800);
}

.focus-title {
  color: var(--label);
  margin-bottom: var(--sp-2);
}

/* Invitations — a hairline-separated stack, not a card grid. */
.invitations {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.invitation {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  padding: 1.75rem 0;
  border-top: 1px solid var(--color-hairline);
}

.invitation:last-child {
  border-bottom: 1px solid var(--color-hairline);
}

.invitation-icon {
  /* Not cyan: a 1.75-stroke glyph at #00AEEF on white is 2.53:1, under the 3:1
     non-text floor and visibly faint. Cyan stays structural on dark grounds. */
  color: var(--color-ink);
  margin-top: 0.15rem;
}

.invitation-title {
  color: var(--label);
}

.invitation-text {
  margin-top: var(--sp-1);
  font-size: 0.98rem;
  color: var(--label-secondary);
}

.invitation-link {
  display: inline-block;
  margin-top: 0.85rem;
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-red-cta);
  border-bottom: 1px solid currentColor;
  padding-bottom: 1px;
}

.invitation-link:hover {
  color: var(--color-ink);
}

/* Global Stats Section */
.stats-container {
  margin-top: var(--sp-6);
  padding-top: var(--sp-6);
  border-top: 1px solid var(--separator);
}

.stats-header {
  text-align: center;
  font-size: var(--text-title-2);
  line-height: var(--text-title-2-lh);
  margin-bottom: var(--sp-5);
  color: var(--label);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--sp-3);
}

/* Four decorations were doing one job here: a 1px ink border, a 3px coloured
   top border, a shadow and a hover lift. A stat is not interactive, so the
   lift was a false affordance -- it invited a click that does nothing. One
   quiet grouped surface, and the numeral does the talking. */
.stat-card {
  background-color: var(--surface-2);
  border: 1px solid var(--separator);
  padding: var(--sp-5) var(--sp-4);
  text-align: center;
  border-radius: var(--radius-card);
}

.stat-number {
  display: block;
  font-family: var(--font-headline);
  font-size: clamp(2.5rem, 4.5vw, 3.25rem);
  line-height: 1;
  margin-bottom: var(--sp-2);
  color: var(--label);
}

.stat-label {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: var(--text-caption);
  line-height: var(--text-caption-lh);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--label-secondary);
}

@media (max-width: 992px) {
  .about-grid {
    grid-template-columns: 1fr;
    gap: 4rem;
  }
  
  .stats-container {
    margin-top: var(--sp-6);
    padding-top: var(--sp-5);
  }
}

@media (max-width: 576px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: var(--sp-3);
  }
}
</style>
