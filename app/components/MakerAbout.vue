<template>
  <section id="about" class="about-section section-padding">
    <div class="container">
      <div class="about-grid">
        <div class="about-text-area">
          <span class="badge-maker badge-maker-red">The Movement</span>
          <h2 class="section-title">What is Maker Faire?</h2>
          <p class="lead-text">
            Maker Faire is the Greatest Show (and Tell) on Earth—a family-friendly festival of invention, creativity, and resourcefulness.
          </p>
          <p class="body-text">
            It is a gathering of fascinating, curious people who enjoy learning and who love sharing what they can do. From engineers to artists, science clubs to hobbyists, Maker Faire is a venue for makers to show their hobbies, experiments, and projects.
          </p>
          <p class="body-text">
            We call it the <strong>celebration of the Maker Movement</strong>. It is a place where hands-on learning meets future technology, and where anyone can discover the joy of creating something from scratch.
          </p>

          <div class="kochi-focus">
            <h3 class="focus-title">Why Kochi?</h3>
            <p class="body-text">
              Kochi is the innovation and hardware prototyping capital of Kerala. With a thriving ecosystem of startup incubators, fablabs, maker spaces, and creative design studios, Kochi is uniquely positioned to host a diverse gathering of minds ready to shape the future.
            </p>
          </div>
        </div>

        <div class="about-cards-area">
          <!-- Card 1 -->
          <div class="card-maker card-about card-red">
            <div class="card-icon">🛠️</div>
            <h3 class="card-title">Exhibit Your Project</h3>
            <p class="card-desc">
              Whether you built a giant metal dragon, a smart IoT farm system, or beautiful upcycled art—we want you to showcase it!
            </p>
            <a href="https://forms.gle/makerfairekochi2027" target="_blank" rel="noopener noreferrer" class="card-link">Apply to Exhibit →</a>
          </div>

          <!-- Card 2 -->
          <div class="card-maker card-about card-cyan">
            <div class="card-icon">💡</div>
            <h3 class="card-title">Learn & Connect</h3>
            <p class="card-desc">
              Meet fellow developers, expert hardware designers, crafters, and educators. Share knowledge, tools, and ideas.
            </p>
            <a href="#countdown" class="card-link">Save the Date →</a>
          </div>

          <!-- Card 3 -->
          <div class="card-maker card-about card-yellow">
            <div class="card-icon">🚀</div>
            <h3 class="card-title">Inspire the Next Gen</h3>
            <p class="card-desc">
              Bring your kids and family to witness hands-on workshops, live demos, robotics leagues, and interactive science experiments.
            </p>
            <a href="#categories" class="card-link">Explore Themes →</a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-section {
  background-color: var(--color-white);
  border-bottom: var(--border-width-thick) solid var(--color-dark);
}

.about-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 5rem;
  align-items: start;
}

.section-title {
  font-size: 3rem;
  margin-top: 0.5rem;
  margin-bottom: 2rem;
  color: var(--color-dark);
}

.lead-text {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-red);
  margin-bottom: 1.5rem;
}

.body-text {
  color: var(--color-gray-800);
  margin-bottom: 1.5rem;
}

.kochi-focus {
  background-color: var(--color-gray-100);
  border-left: var(--border-width-thick) solid var(--color-cyan);
  padding: 1.5rem;
  margin-top: 2rem;
  border-radius: 0 4px 4px 0;
}

.focus-title {
  font-size: 1.2rem;
  color: var(--color-dark);
  margin-bottom: 0.75rem;
}

/* Right Cards Grid */
.about-cards-area {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.card-about {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.card-icon {
  font-size: 2.2rem;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  color: var(--color-dark);
}

.card-desc {
  font-size: 0.95rem;
  color: var(--color-gray-800);
  margin-bottom: 1.5rem;
}

.card-link {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  color: var(--color-dark);
  margin-top: auto;
  border-bottom: 2px solid transparent;
}

.card-link:hover {
  border-color: var(--color-dark);
}

/* Card border modifications */
.card-red {
  border-color: var(--color-dark);
  box-shadow: 6px 6px 0px var(--color-red);
}
.card-red:hover {
  box-shadow: 10px 10px 0px var(--color-red);
  transform: translate(-4px, -4px);
}

.card-cyan {
  border-color: var(--color-dark);
  box-shadow: 6px 6px 0px var(--color-cyan);
}
.card-cyan:hover {
  box-shadow: 10px 10px 0px var(--color-cyan);
  transform: translate(-4px, -4px);
}

.card-yellow {
  border-color: var(--color-dark);
  box-shadow: 6px 6px 0px var(--color-yellow);
}
.card-yellow:hover {
  box-shadow: 10px 10px 0px var(--color-yellow);
  transform: translate(-4px, -4px);
}

@media (max-width: 992px) {
  .about-grid {
    grid-template-columns: 1fr;
    gap: 4rem;
  }
}
</style>
