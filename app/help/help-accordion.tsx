'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface HelpAccordionProps {
  items: Array<{ q: string; a: string }>
}

export function HelpAccordion({ items }: HelpAccordionProps) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="border border-[#1e1e2f] rounded-[6px] bg-[#09090e] overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
          >
            <span className="font-mono text-[13px] text-white">{item.q}</span>
            <ChevronDown
              className={`h-4 w-4 flex-shrink-0 text-[#64748b] transition-transform duration-200 ${
                open === i ? 'rotate-180 text-[#818cf8]' : ''
              }`}
            />
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="px-5 pb-4 border-t border-[#1e1e2f]">
                  <p className="font-body text-[14px] text-[#9ca3af] leading-[1.75] pt-3">
                    {item.a}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
