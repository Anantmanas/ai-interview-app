'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, CheckCircle2, ArrowLeft, Mail, Sparkles } from 'lucide-react'
import { TypewriterInput } from '@/components/auth/TypewriterInput'
import { LandingBackground } from '@/components/ui/landing-background'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings`,
      })

      if (resetError) {
        setError(resetError.message)
        return
      }

      setSuccess(true)
    } catch {
      setError('An unexpected error occurred while requesting password reset.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#000000] flex items-center justify-center p-6 relative overflow-hidden">
      <LandingBackground />

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Logo header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <span className="led-pulse h-2 w-2 rounded-full bg-[#6366f1]" />
            <span className="font-mono text-[14px] font-bold text-[#ffffff] uppercase tracking-[0.1em]">
              InterviewAI
            </span>
          </Link>
          <p className="font-mono text-[10px] text-[#818cf8] uppercase tracking-[0.2em] mb-2.5">
            // RECOVERY TERMINAL
          </p>
          <h1 className="font-display text-[28px] sm:text-[30px] font-bold text-[#ffffff] tracking-[-0.025em]">
            Reset Password
          </h1>
          <p className="font-body text-[14px] text-[#9ca3af] mt-2">
            Enter your account email to receive a recovery link
          </p>
        </motion.div>

        {/* Auth card */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[#09090e] border border-[#1e1e2f] rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] p-7"
        >
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-5 text-center py-2"
            >
              <div className="mx-auto w-12 h-12 rounded-xl bg-[#0d2818] border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e] shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <div>
                <h3 className="font-display text-lg font-semibold text-white">Recovery Link Dispatched</h3>
                <p className="font-body text-xs text-[#9ca3af] mt-2 leading-relaxed">
                  We sent a secure password reset link to{' '}
                  <span className="font-mono text-[#818cf8] font-medium">{email}</span>.
                </p>
              </div>

              <div className="p-3 bg-[#0c0d18] border border-[#1e2030] rounded-lg text-left text-xs font-mono text-[#64748b] space-y-1">
                <p className="text-[#94a3b8] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#818cf8]" /> Check your inbox & spam folders
                </p>
                <p className="text-[11px]">Link remains valid for 60 minutes.</p>
              </div>

              <div className="pt-2">
                <Link
                  href="/auth/login"
                  className="btn-neo-violet w-full font-mono text-[12px] font-bold uppercase tracking-[0.06em] py-3 rounded-md transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleReset} className="space-y-0">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-[#2a0e15] border border-[#5c1d28] rounded-md text-[#f87171] font-mono text-[11px] mb-5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email field */}
              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-[0.1em] block mb-2"
                >
                  Account Email Address
                </label>
                <TypewriterInput
                  id="email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholders={['engineer@company.com', 'dev@startup.io', 'you@domain.com']}
                  autoComplete="email"
                  required
                  className="input-focus-glow"
                />
              </div>

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.99 }}
                className="btn-neo-violet w-full font-mono text-[12px] font-bold uppercase tracking-[0.06em] py-3 rounded-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] mb-5"
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-1 items-center"
                    >
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-white"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                        />
                      ))}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Send Recovery Link</span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Back to sign in link */}
              <div className="pt-2 text-center border-t border-[#1e1e2f]/80">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#9ca3af] hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5 text-[#818cf8]" />
                  <span>Back to Sign in</span>
                </Link>
              </div>
            </form>
          )}
        </motion.div>

        {/* Footer */}
        <p className="text-center font-mono text-[11px] text-[#4b5563] mt-6">
          Need assistance?{' '}
          <Link href="/help" className="text-[#818cf8] hover:text-white transition-colors">
            Contact Support
          </Link>
        </p>
      </div>
    </main>
  )
}
