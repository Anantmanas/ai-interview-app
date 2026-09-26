'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Laptop, Smartphone, AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface MobileDeviceWarningProps {
  allowBypass?: boolean
}

export function MobileDeviceWarning({ allowBypass = true }: MobileDeviceWarningProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const isSmallScreen = window.innerWidth < 768
      const isMobileAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
      setIsMobile(isSmallScreen || isMobileAgent)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!isMobile || dismissed) {
    return null
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-[#090912] border border-[#3730a3]/60 rounded-2xl p-6 shadow-[0_0_50px_rgba(99,102,241,0.25)] relative overflow-hidden"
        >
          {/* Neon Top Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4f46e5] via-[#818cf8] to-[#06b6d4]" />

          {/* Icon Header */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-[#14142b] border border-[#4f46e5]/40 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <Laptop className="w-6 h-6 text-[#818cf8]" />
            </div>
            <div className="flex items-center text-[#64748b]">
              <span className="w-6 h-[1px] bg-[#3730a3]" />
              <AlertTriangle className="w-4 h-4 text-[#fbbf24] mx-1" />
              <span className="w-6 h-[1px] bg-[#3730a3]" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#12121a] border border-[#27273a] flex items-center justify-center opacity-60">
              <Smartphone className="w-5 h-5 text-[#9ca3af]" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-1.5 mb-4">
            <p className="font-mono text-[10px] text-[#818cf8] uppercase tracking-[0.2em] font-semibold">
              // DEVICE OPTIMIZATION
            </p>
            <h2 className="font-display text-xl font-bold text-white tracking-tight">
              Please Use a Laptop / Desktop
            </h2>
          </div>

          {/* Body Text */}
          <p className="text-xs text-[#94a3b8] leading-relaxed text-center mb-6">
            For the most accurate voice recognition, interactive coding environment, and smooth interview simulation, we kindly recommend opening this session on a <span className="text-white font-medium">Laptop or PC</span> for a better experience.
          </p>

          {/* Key Advantages list */}
          <div className="bg-[#121222] border border-[#1e1e38] rounded-xl p-3 mb-6 space-y-2 text-[11px] text-[#cbd5e1] font-mono">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#34d399] shrink-0" />
              <span>Full-screen technical coding workspace</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#34d399] shrink-0" />
              <span>Low-latency speech-to-text audio input</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#34d399] shrink-0" />
              <span>Side-by-side live AI evaluation feedback</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2.5">
            <Link
              href="/dashboard"
              className="w-full py-2.5 px-4 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider text-center bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white hover:opacity-90 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Dashboard
            </Link>

            {allowBypass && (
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="w-full py-2 px-3 rounded-lg font-mono text-[11px] text-[#64748b] hover:text-[#94a3b8] hover:bg-[#14142b]/50 transition-colors text-center"
              >
                Continue on mobile anyway (Limited UX)
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
