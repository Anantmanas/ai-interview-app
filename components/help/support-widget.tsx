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
        className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full bg-[#4f46e5] text-white shadow-[0_4px_24px_rgba(79,70,229,0.4)] flex items-center justify-center border border-[#3730a3] hover:bg-[#5865f2] transition-colors"
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
            className="fixed bottom-24 right-6 z-40 w-[300px] bg-[#09090e] border border-[#1e1e2f] rounded-[8px] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-[#1e1e2f] bg-[#000000]">
              <div className="flex items-center gap-2 mb-1">
                <span className="led-pulse h-1.5 w-1.5 rounded-full bg-[#6366f1]" />
                <p className="font-mono text-[11px] font-bold text-white uppercase tracking-[0.08em]">
                  Help & Support
                </p>
              </div>
              <p className="font-body text-[12px] text-[#64748b]">
                Usually replies within 24 hours.
              </p>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-[#1e1e2f]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#64748b]" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-[#000000] border border-[#1e1e2f] rounded-[4px] pl-8 pr-3 py-2 font-mono text-[11px] text-white placeholder-[#64748b] focus:outline-none focus:border-[#6366f1] transition-colors"
                />
              </div>
            </div>

            {/* Quick answers */}
            <div className="p-3">
              <p className="font-mono text-[9px] text-[#64748b] uppercase tracking-[0.1em] mb-2">
                Quick answers
              </p>
              <div className="space-y-1">
                {filtered.map((a) => (
                  <Link
                    key={a.q}
                    href={a.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-[4px] border border-[#1e1e2f] hover:border-[#3730a3] hover:bg-[#14142b] transition-colors group"
                  >
                    <span className="font-mono text-[11px] text-[#9ca3af] group-hover:text-white transition-colors">
                      {a.q}
                    </span>
                    <ExternalLink className="h-3 w-3 text-[#64748b] group-hover:text-[#818cf8] transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="p-3 pt-0 space-y-2">
              <Link
                href="/help"
                onClick={() => setOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-[#1e1e2f] hover:border-[#3730a3] text-[#9ca3af] hover:text-white font-mono text-[11px] uppercase tracking-[0.06em] rounded-[4px] transition-colors bg-[#000000]"
              >
                View Full Help Center
              </Link>
              <a
                href="mailto:support@interviewai.app"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#4f46e5]/15 border border-[#4f46e5]/30 hover:bg-[#4f46e5]/25 text-[#818cf8] font-mono text-[11px] uppercase tracking-[0.06em] rounded-[4px] transition-colors"
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
