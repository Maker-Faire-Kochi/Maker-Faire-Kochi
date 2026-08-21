<template>
  <header class="maker-header">
    <div class="container nav-container">
      <div class="logo-area">
        <div class="maker-dot animate-spin-slow"></div>
        <span class="logo-text">Make<span class="colon">:</span> Maker Faire <span class="location-label">Kochi</span></span>
      </div>
      <nav class="nav-links">
        <a href="#about" class="nav-link">About</a>
        <a href="#countdown" class="nav-link">Countdown</a>
        <a href="#categories" class="nav-link">Themes</a>
        <a href="https://forms.gle/makerfairekochi2027" target="_blank" rel="noopener noreferrer" class="btn-maker btn-maker-accent nav-cta">
          Submit Proposal
        </a>
      </nav>
    </div>
  </header>

  <section class="hero-section maker-grid-bg">
    <div class="container hero-container">
      <div class="hero-content">
        <div class="badge-row">
          <span class="badge-maker badge-maker-red">Jan 26 & 27, 2027</span>
          <span class="badge-maker badge-maker-cyan">Kochi, Kerala</span>
        </div>
        
        <h1 class="hero-title">
          Maker Faire<br />
          <span class="text-outline">Kochi</span>
        </h1>
        
        <p class="hero-subtitle">
          The Greatest Show (& Tell) on Earth is back in Kerala! A family-friendly festival of invention, creativity, and resourcefulness, celebrating the global Maker Movement.
        </p>

        <div class="hero-actions">
          <a href="https://forms.gle/makerfairekochi2027" target="_blank" rel="noopener noreferrer" class="btn-maker btn-maker-primary hero-btn">
            Join as Maker (Call for Proposals)
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </a>
          <a href="#about" class="btn-maker btn-maker-secondary hero-btn">
            Learn More
          </a>
        </div>
      </div>

      <div class="hero-visual">
        <div class="image-frame">
          <img src="/img/hero.jpg" alt="Maker Faire Kochi - Celebration of Creativity" class="hero-img" />
          <div class="frame-sticker sticker-robot">🤖 INVENT</div>
          <div class="frame-sticker sticker-craft">🎨 CREATE</div>
          <div class="frame-sticker sticker-tech">⚡️ TECH</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Header Styles */
.maker-header {
  background-color: var(--color-white);
  border-bottom: var(--border-width-thick) solid var(--color-dark);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 1rem 0;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.maker-dot {
  width: 24px;
  height: 24px;
  background-color: var(--color-red);
  border: var(--border-width-thin) solid var(--color-dark);
  border-radius: 4px;
  position: relative;
}

.maker-dot::before {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  width: 8px;
  height: 8px;
  background-color: var(--color-yellow);
  border: 1px solid var(--color-dark);
}

.logo-text {
  font-family: var(--font-headline);
  font-size: 1.4rem;
  letter-spacing: -0.5px;
}

.logo-text .colon {
  color: var(--color-red);
}

.location-label {
  color: var(--color-cyan);
  position: relative;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  font-family: var(--font-mono);
  font-weight: 700;
  text-transform: uppercase;
  font-size: 1rem;
  position: relative;
  padding: 0.25rem 0;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 3px;
  background-color: var(--color-red);
  transition: width var(--transition-fast);
}

.nav-link:hover::after {
  width: 100%;
}

.nav-cta {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  box-shadow: 4px 4px 0px var(--color-dark);
}

.nav-cta:hover {
  box-shadow: 6px 6px 0px var(--color-dark);
}

/* Hero Styles */
.hero-section {
  padding: 5rem 0;
  background-color: var(--color-light);
  border-bottom: var(--border-width-thick) solid var(--color-dark);
  position: relative;
  overflow: hidden;
}

.hero-container {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 4rem;
  align-items: center;
}

.badge-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.hero-title {
  font-size: 4.5rem;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  color: var(--color-dark);
  line-height: 1;
}

.hero-subtitle {
  font-size: 1.3rem;
  color: var(--color-gray-800);
  margin-bottom: 2.5rem;
  max-width: 90%;
}

.hero-actions {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.hero-btn {
  font-size: 1.1rem;
}

/* Visual Container */
.hero-visual {
  display: flex;
  justify-content: center;
  position: relative;
}

.image-frame {
  position: relative;
  border: var(--border-width-thick) solid var(--color-dark);
  box-shadow: var(--shadow-maker-cyan);
  border-radius: 8px;
  background-color: var(--color-white);
  padding: 10px;
  max-width: 100%;
  transform: rotate(1deg);
  transition: transform var(--transition-normal);
}

.image-frame:hover {
  transform: rotate(-1deg) scale(1.02);
}

.hero-img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 4px;
  border: var(--border-width-thin) solid var(--color-dark);
}

/* Frame Stickers */
.frame-sticker {
  position: absolute;
  padding: 0.4rem 0.8rem;
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  border: var(--border-width-thin) solid var(--color-dark);
  box-shadow: 3px 3px 0px var(--color-dark);
  z-index: 10;
}

.sticker-robot {
  top: -15px;
  left: 20px;
  background-color: var(--color-yellow);
  transform: rotate(-5deg);
}

.sticker-craft {
  bottom: 20px;
  left: -20px;
  background-color: var(--color-red);
  color: var(--color-white);
  transform: rotate(8deg);
}

.sticker-tech {
  top: 40px;
  right: -15px;
  background-color: var(--color-cyan);
  color: var(--color-dark);
  transform: rotate(-10deg);
}

/* Responsive styles */
@media (max-width: 1024px) {
  .hero-title {
    font-size: 3.5rem;
  }
}

@media (max-width: 768px) {
  .nav-links {
    display: none; /* simple hidden for mobile now */
  }
  
  .hero-container {
    grid-template-columns: 1fr;
    gap: 3rem;
    text-align: center;
  }
  
  .badge-row {
    justify-content: center;
  }
  
  .hero-subtitle {
    max-width: 100%;
    font-size: 1.1rem;
  }
  
  .hero-actions {
    justify-content: center;
    gap: 1rem;
  }
  
  .hero-visual {
    margin-top: 1rem;
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
}

@media (max-width: 576px) {
  .hero-title {
    font-size: 2.2rem;
  }

  .hero-actions .btn-maker {
    width: 100%;
    justify-content: center;
  }
  
  /* Prevent stickers from pushing outside screen margins */
  .sticker-craft {
    left: 10px;
    bottom: 10px;
  }

  .sticker-tech {
    right: 10px;
    top: 10px;
  }

  .frame-sticker {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
  }
}
</style>
