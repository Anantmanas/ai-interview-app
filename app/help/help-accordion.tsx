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
        <div key={i} className="border border-[#2b292d] rounded-[6px] bg-[#0c0c10]/60 overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
          >
            <span className="font-mono text-[13px] text-[#e5e5e5]">{item.q}</span>
            <ChevronDown
              className={`h-4 w-4 flex-shrink-0 text-[#49474e] transition-transform duration-200 ${
                open === i ? 'rotate-180 text-[#71d083]' : ''
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
                <div className="px-5 pb-4 border-t border-[#2b292d]/60">
                  <p className="font-body text-[14px] text-[#7c7a85] leading-[1.75] pt-3">
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
