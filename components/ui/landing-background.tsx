'use client'

import { motion } from 'motion/react'

/**
 * Shared animated ambient background used on the landing page and auth pages.
 * Renders: animated dot grid (grid-drift), green + violet orbs (motion), scan line, vignette.
 */
export function LandingBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Sapphire ambient orb — top left */}
      <motion.div
        className="absolute -top-40 -left-20 h-[700px] w-[700px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(15, 82, 186, 0.14) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Sapphire bright ambient orb — bottom right */}
      <motion.div
        className="absolute -bottom-40 -right-20 h-[600px] w-[600px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(41, 121, 232, 0.10) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Subtle scan line — slow single pass */}
      <div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0F52BA]/25 to-transparent"
        style={{ animation: 'scan-line 12s linear infinite', top: 0 }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,transparent_30%,#020202_100%)]" />
    </div>
  )
}
