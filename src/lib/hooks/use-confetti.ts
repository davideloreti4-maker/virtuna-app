'use client'

import confetti from 'canvas-confetti'

/**
 * Fire confetti celebration
 */
export function fireConfetti() {
  // First burst
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#7C3AED', '#FF5757', '#10B981', '#F59E0B', '#3B82F6'],
  })

  // Second burst after short delay
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#7C3AED', '#FF5757', '#10B981'],
    })
  }, 150)

  // Third burst from the other side
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#7C3AED', '#FF5757', '#10B981'],
    })
  }, 300)
}

/**
 * Fire a smaller celebration confetti
 */
export function fireSmallConfetti() {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#7C3AED', '#FF5757', '#10B981'],
  })
}
