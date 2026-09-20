'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { HelpCircle, X, Search, Mail, ExternalLink } from 'lucide-react'
import Link from 'next/link'

const QUICK_ANSWERS = [
  { q: 'How to start an interview?', href: '/help#getting-started' },
  { q: 'Upgrade to Pro', href: '/pricing' },
  { q: 'Cancel subscription', href: '/dashboard/billing' },
  { q: 'Microphone not working', href: '/help#technical-issues' },
]

export function SupportWidget() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = QUICK_ANSWERS.filter(a =>
    a.q.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full bg-[#71d083] text-[#04040b] shadow-[0_4px_24px_rgba(113,208,131,0.3)] flex items-center justify-center border border-[#366740] hover:bg-[#82dba2] transition-colors"
        aria-label="Get help"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <HelpCircle className="h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-6 z-40 w-[300px] bg-[#0c0c10] border border-[#2b292d] rounded-[8px] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-[#2b292d]/60 bg-[#0a0a0e]">
              <div className="flex items-center gap-2 mb-1">
                <span className="led-pulse h-1.5 w-1.5 rounded-full bg-[#71d083]" />
                <p className="font-mono text-[11px] font-bold text-[#e5e5e5] uppercase tracking-[0.08em]">
                  Help & Support
                </p>
              </div>
              <p className="font-body text-[12px] text-[#49474e]">
                Usually replies within 24 hours.
              </p>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-[#2b292d]/60">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#49474e]" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-[#0a0a0e] border border-[#2b292d] rounded-[4px] pl-8 pr-3 py-2 font-mono text-[11px] text-[#e5e5e5] placeholder-[#49474e] focus:outline-none focus:border-[#71d083]/50 transition-colors"
                />
              </div>
            </div>

            {/* Quick answers */}
            <div className="p-3">
              <p className="font-mono text-[9px] text-[#49474e] uppercase tracking-[0.1em] mb-2">
                Quick answers
              </p>
              <div className="space-y-1">
                {filtered.map((a) => (
                  <Link
                    key={a.q}
                    href={a.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-[4px] border border-[#2b292d] hover:border-[#4b494e] hover:bg-[#0a0a0e] transition-colors group"
                  >
                    <span className="font-mono text-[11px] text-[#b5b2bc] group-hover:text-[#e5e5e5] transition-colors">
                      {a.q}
                    </span>
                    <ExternalLink className="h-3 w-3 text-[#49474e] group-hover:text-[#71d083] transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="p-3 pt-0 space-y-2">
              <Link
                href="/help"
                onClick={() => setOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-[#2b292d] hover:border-[#4b494e] text-[#7c7a85] hover:text-[#e5e5e5] font-mono text-[11px] uppercase tracking-[0.06em] rounded-[4px] transition-colors"
              >
                View Full Help Center
              </Link>
              <a
                href="mailto:support@interviewai.app"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#71d083]/10 border border-[#71d083]/20 hover:bg-[#71d083]/15 text-[#71d083] font-mono text-[11px] uppercase tracking-[0.06em] rounded-[4px] transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                Email Support
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
