// ── Reveal info sections on scroll ──────────────────────────────────────
const revealOnScroll = () => {
  const targets = document.querySelectorAll('.info-section');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => {
    // Pause animation until section enters viewport
    [...el.children].forEach((child, i) => {
      child.style.animationPlayState = 'paused';
      child.style.animationDelay = `${0.05 + i * 0.08}s`;
    });
    observer.observe(el);
  });
};

// ── Smooth-scroll nav links ─────────────────────────────────────────────
const initSmoothNav = () => {
  document.querySelectorAll('.nav-links a').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id && id.startsWith('#')) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
};

document.addEventListener('DOMContentLoaded', () => {
  revealOnScroll();
  initSmoothNav();
});
