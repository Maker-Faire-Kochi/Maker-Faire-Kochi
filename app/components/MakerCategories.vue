<template>
  <section id="categories" class="categories-section section-padding maker-grid-bg">
    <div class="container">
      <div class="header-area text-center">
        <span class="badge-maker badge-maker-cyan">Infinite Possibilities</span>
        <h2 class="section-title">What's at Maker Faire?</h2>
        <p class="section-subtitle">
          If you made it, you can show it. We welcome projects across all creative, technical, and scientific disciplines!
        </p>
      </div>

      <div class="categories-grid">
        <!-- Theme 1 -->
        <div class="theme-card">
          <div class="card-tag tag-red">Robotics & AI</div>
          <div class="card-body">
            <div class="theme-icon">🤖</div>
            <p class="theme-text">
              Drones, autonomous rovers, robotic arms, AI assistants, machine learning integrations, and competitive battlebots.
            </p>
          </div>
        </div>

        <!-- Theme 2 -->
        <div class="theme-card">
          <div class="card-tag tag-cyan">3D Printing & Prototyping</div>
          <div class="card-body">
            <div class="theme-icon">🖨️</div>
            <p class="theme-text">
              CNC routing, laser cutting, custom 3D printed mechanical builds, resin printing, and rapid hardware prototyping.
            </p>
          </div>
        </div>

        <!-- Theme 3 -->
        <div class="theme-card">
          <div class="card-tag tag-yellow">Electronics & IoT</div>
          <div class="card-body">
            <div class="theme-icon">⚡</div>
            <p class="theme-text">
              Smart home automation, Arduino & Raspberry Pi hacks, custom wearable tech, retro console mods, and sensor networks.
            </p>
          </div>
        </div>

        <!-- Theme 4 -->
        <div class="theme-card">
          <div class="card-tag tag-cyan">Art, Craft & Design</div>
          <div class="card-body">
            <div class="theme-icon">🎨</div>
            <p class="theme-text">
              Upcycled art installations, kinetic sculptures, handmade leather & textiles, interactive murals, and digital craft.
            </p>
          </div>
        </div>

        <!-- Theme 5 -->
        <div class="theme-card">
          <div class="card-tag tag-yellow">Green Tech & Agri</div>
          <div class="card-body">
            <div class="theme-icon">🌱</div>
            <p class="theme-text">
              Hydroponics, smart agricultural monitors, solar & wind energy harvesters, plastic recycling machines, and eco-materials.
            </p>
          </div>
        </div>

        <!-- Theme 6 -->
        <div class="theme-card">
          <div class="card-tag tag-red">Space & Science</div>
          <div class="card-body">
            <div class="theme-icon">🚀</div>
            <p class="theme-text">
              Model rocketry, astronomy setups, physics experiments, DIY bio-hacking, chemistry displays, and educational kits.
            </p>
          </div>
        </div>
      </div>

      <div class="action-banner">
        <div class="banner-content">
          <h3>Have an idea that doesn't fit these categories?</h3>
          <p>That's even better! Maker Faire is built on unique, unexpected, and boundary-pushing projects. Share your vision with us.</p>
        </div>
        <a href="https://forms.gle/makerfairekochi2027" target="_blank" rel="noopener noreferrer" class="btn-maker btn-maker-primary banner-btn">
          Pitch Your Project
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.categories-section {
  background-color: var(--color-light);
  border-bottom: var(--border-width-thick) solid var(--color-dark);
}

.text-center {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 4rem auto;
}

.section-title {
  font-size: 3rem;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
  color: var(--color-dark);
}

.section-subtitle {
  font-size: 1.2rem;
  color: var(--color-gray-800);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 2.5rem;
  margin-bottom: 5rem;
}

.theme-card {
  background-color: var(--color-white);
  border: var(--border-width-thick) solid var(--color-dark);
  box-shadow: var(--shadow-maker);
  border-radius: 6px;
  overflow: visible;
  position: relative;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  display: flex;
  flex-direction: column;
}

.theme-card:hover {
  transform: translate(-3px, -3px);
  box-shadow: 10px 10px 0px var(--color-dark);
}

.card-tag {
  position: absolute;
  top: -15px;
  left: 20px;
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  padding: 0.25rem 0.75rem;
  border: var(--border-width-thin) solid var(--color-dark);
  box-shadow: 2px 2px 0px var(--color-dark);
}

.tag-red {
  background-color: var(--color-red);
  color: var(--color-white);
}

.tag-cyan {
  background-color: var(--color-cyan);
  color: var(--color-dark);
}

.tag-yellow {
  background-color: var(--color-yellow);
  color: var(--color-dark);
}

.card-body {
  padding: 2.5rem 1.5rem 1.5rem 1.5rem;
  flex: 1;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.theme-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.theme-text {
  font-size: 1rem;
  color: var(--color-gray-800);
  line-height: 1.5;
}

/* Bottom Action Banner */
.action-banner {
  background-color: var(--color-white);
  border: var(--border-width-thick) solid var(--color-dark);
  box-shadow: var(--shadow-maker-red);
  padding: 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 3rem;
  border-radius: 8px;
}

.action-banner h3 {
  font-size: 1.8rem;
  margin-bottom: 0.75rem;
  color: var(--color-dark);
}

.action-banner p {
  color: var(--color-gray-800);
  font-size: 1.05rem;
  max-width: 700px;
}

.banner-btn {
  flex-shrink: 0;
}

@media (max-width: 992px) {
  .action-banner {
    flex-direction: column;
    text-align: center;
    gap: 2rem;
    padding: 2rem;
  }
}
</style>
