<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const targetDate = new Date('2027-01-26T09:00:00+05:30').getTime()

const days = ref('00')
const hours = ref('00')
const minutes = ref('00')
const seconds = ref('00')
const eventStarted = ref(false)

let timerInterval = null

const updateCountdown = () => {
  const now = new Date().getTime()
  const distance = targetDate - now

  if (distance < 0) {
    eventStarted.value = true
    days.value = '00'
    hours.value = '00'
    minutes.value = '00'
    seconds.value = '00'
    if (timerInterval) clearInterval(timerInterval)
    return
  }

  const d = Math.floor(distance / (1000 * 60 * 60 * 24))
  const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
  const s = Math.floor((distance % (1000 * 60)) / 1000)

  days.value = String(d).padStart(2, '0')
  hours.value = String(h).padStart(2, '0')
  minutes.value = String(m).padStart(2, '0')
  seconds.value = String(s).padStart(2, '0')
}

onMounted(() => {
  updateCountdown()
  timerInterval = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<template>
  <section id="countdown" class="countdown-section">
    <div class="container">
      <div class="blueprint-box">
        <div class="blueprint-grid-bg"></div>
        <div class="blueprint-header">
          <span class="blueprint-title">SYSTEM STATUS: EVENT_COUNTDOWN.EXE</span>
          <span class="blueprint-date">T-MINUS SYSTEM</span>
        </div>
        
        <div class="countdown-grid">
          <!-- Days -->
          <div class="time-block">
            <div class="time-number">{{ days }}</div>
            <div class="time-label">Days</div>
          </div>
          
          <div class="time-separator">:</div>

          <!-- Hours -->
          <div class="time-block">
            <div class="time-number">{{ hours }}</div>
            <div class="time-label">Hours</div>
          </div>

          <div class="time-separator">:</div>

          <!-- Minutes -->
          <div class="time-block">
            <div class="time-number">{{ minutes }}</div>
            <div class="time-label">Minutes</div>
          </div>

          <div class="time-separator">:</div>

          <!-- Seconds -->
          <div class="time-block">
            <div class="time-number">{{ seconds }}</div>
            <div class="time-label">Seconds</div>
          </div>
        </div>

        <div class="blueprint-footer">
          <p v-if="!eventStarted" class="countdown-announcement">
            📢 Maker Faire Kochi launches on <strong>Jan 26, 2027</strong>. Prepare your projects, build teams, and get ready!
          </p>
          <p v-else class="countdown-announcement celebrating">
            🎉 The Event is Live! Welcome to Maker Faire Kochi 2027!
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.countdown-section {
  padding: 5rem 0;
  background-color: var(--color-dark);
  border-bottom: var(--border-width-thick) solid var(--color-dark);
  color: var(--color-white);
  overflow: hidden;
}

.blueprint-box {
  position: relative;
  border: 3px dashed var(--color-cyan);
  border-radius: 8px;
  padding: 3rem 2rem;
  background-color: rgba(0, 174, 239, 0.05); /* very light cyan overlay */
  overflow: hidden;
}

.blueprint-grid-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: 20px 20px;
  background-image: 
    linear-gradient(to right, rgba(0, 174, 239, 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 174, 239, 0.04) 1px, transparent 1px);
  z-index: 1;
  pointer-events: none;
}

.blueprint-header {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 174, 239, 0.3);
  padding-bottom: 1rem;
  margin-bottom: 2.5rem;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: var(--color-cyan);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.countdown-grid {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.time-block {
  text-align: center;
  flex: 1;
  max-width: 140px;
  background-color: var(--color-charcoal);
  border: var(--border-width-thin) solid var(--color-cyan);
  box-shadow: 4px 4px 0px var(--color-cyan);
  padding: 1.5rem 1rem;
  border-radius: 4px;
}

.time-number {
  font-family: var(--font-headline);
  font-size: 3.5rem;
  color: var(--color-yellow);
  line-height: 1;
  margin-bottom: 0.5rem;
}

.time-label {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  text-transform: uppercase;
  color: var(--color-gray-400);
  font-weight: 700;
  letter-spacing: 0.5px;
}

.time-separator {
  font-family: var(--font-headline);
  font-size: 3.5rem;
  color: var(--color-cyan);
  animation: blink 1s step-end infinite;
}

.blueprint-footer {
  position: relative;
  z-index: 2;
  text-align: center;
  border-top: 1px solid rgba(0, 174, 239, 0.3);
  padding-top: 1.5rem;
}

.countdown-announcement {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  color: var(--color-light);
}

.countdown-announcement strong {
  color: var(--color-red);
}

.celebrating {
  color: var(--color-yellow);
  font-size: 1.3rem;
  font-weight: bold;
}

@keyframes blink {
  50% { opacity: 0; }
}

@media (max-width: 768px) {
  .blueprint-box {
    padding: 2rem 1rem;
  }
  
  .countdown-grid {
    gap: 0.5rem;
  }
  
  .time-block {
    padding: 1rem 0.5rem;
  }
  
  .time-number {
    font-size: 2.2rem;
  }
  
  .time-separator {
    font-size: 2rem;
  }
  
  .blueprint-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }
}
</style>
