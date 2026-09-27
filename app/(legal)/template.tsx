'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function LegalTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Handle hash scrolling on popstate / route remount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const id = window.location.hash.replace('#', '')
      const el = document.getElementById(id)
      if (el) {
        // Small delay to allow browser layout to settle
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' })
        }, 50)
      }
    }
  }, [pathname])

  return (
    <div key={pathname} className="w-full">
      {children}
    </div>
  )
}
