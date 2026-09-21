'use client'

import { motion } from 'motion/react'

/**
 * Shared animated ambient background used on the landing page and auth pages.
 * Renders: animated dot grid (grid-drift), green + violet orbs (motion), scan line, vignette.
 */
export function LandingBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Animated dot grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          animation: 'grid-drift 20s linear infinite',
        }}
      />

      {/* Electric Indigo ambient orb — top left */}
      <motion.div
        className="absolute -top-40 -left-20 h-[700px] w-[700px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(79,70,229,0.14) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Vivid Indigo/Periwinkle ambient orb — bottom right */}
      <motion.div
        className="absolute -bottom-40 -right-20 h-[600px] w-[600px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.10) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Subtle scan line — slow single pass */}
      <div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6366f1]/20 to-transparent"
        style={{ animation: 'scan-line 10s linear infinite', top: 0 }}
      />

      {/* Vignette — pulls eyes to center content */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,transparent_30%,#000000_100%)]" />
    </div>
  )
}
