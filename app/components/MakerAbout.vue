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

      <!-- Global Impact Stats -->
      <div class="stats-container">
        <h3 class="stats-header">The Global Impact of Maker Faire</h3>
        <div class="stats-grid">
          <div class="stat-card stat-cyan">
            <span class="stat-number">40+</span>
            <span class="stat-label">Countries Hosting</span>
          </div>
          <div class="stat-card stat-red">
            <span class="stat-number">150+</span>
            <span class="stat-label">Annual Faires</span>
          </div>
          <div class="stat-card stat-yellow">
            <span class="stat-number">1.5M+</span>
            <span class="stat-label">Annual Attendees</span>
          </div>
          <div class="stat-card stat-dark">
            <span class="stat-number">2006</span>
            <span class="stat-label">Year Established</span>
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

/* Global Stats Section */
.stats-container {
  margin-top: 5rem;
  padding-top: 4rem;
  border-top: 4px dashed var(--color-gray-400);
}

.stats-header {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 3rem;
  color: var(--color-dark);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
}

.stat-card {
  background-color: var(--color-white);
  border: var(--border-width-thick) solid var(--color-dark);
  padding: 2rem 1.5rem;
  text-align: center;
  border-radius: 6px;
  transition: transform var(--transition-fast);
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-cyan {
  box-shadow: 6px 6px 0px var(--color-cyan);
}
.stat-cyan .stat-number {
  color: var(--color-cyan);
}
.stat-cyan:hover {
  box-shadow: 10px 10px 0px var(--color-cyan);
}

.stat-red {
  box-shadow: 6px 6px 0px var(--color-red);
}
.stat-red .stat-number {
  color: var(--color-red);
}
.stat-red:hover {
  box-shadow: 10px 10px 0px var(--color-red);
}

.stat-yellow {
  box-shadow: 6px 6px 0px var(--color-yellow);
}
.stat-yellow .stat-number {
  color: var(--color-yellow);
  -webkit-text-stroke: 1px var(--color-dark);
}
.stat-yellow:hover {
  box-shadow: 10px 10px 0px var(--color-yellow);
}

.stat-dark {
  box-shadow: 6px 6px 0px var(--color-dark);
}
.stat-dark .stat-number {
  color: var(--color-dark);
}
.stat-dark:hover {
  box-shadow: 10px 10px 0px var(--color-dark);
}

.stat-number {
  display: block;
  font-family: var(--font-headline);
  font-size: 3.5rem;
  line-height: 1;
  margin-bottom: 0.75rem;
}

.stat-label {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 0.95rem;
  text-transform: uppercase;
  color: var(--color-gray-800);
}

@media (max-width: 992px) {
  .about-grid {
    grid-template-columns: 1fr;
    gap: 4rem;
  }
  
  .stats-container {
    margin-top: 4rem;
    padding-top: 3rem;
  }
}

@media (max-width: 576px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
