'use client'

import { useEffect } from 'react'

export function ReferralCookieSetter({ code }: { code: string }) {
  useEffect(() => {
    if (!code) return
    try {
      document.cookie = `referral_code=${encodeURIComponent(code)}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
      localStorage.setItem('interviewai_referral_code', code)
    } catch {}
  }, [code])

  return null
}
