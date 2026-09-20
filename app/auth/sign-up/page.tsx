'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle } from 'lucide-react'
import { TypewriterInput } from '@/components/auth/TypewriterInput'
import { LandingBackground } from '@/components/ui/landing-background'

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

export default function SignUpPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback?next=/auth/onboarding/welcome`,
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.session) {
        router.push('/auth/onboarding/welcome')
      } else {
        router.push('/auth/sign-up-success')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    setOauthLoading(provider)
    try {
      const supabase = createClient()
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/auth/onboarding/welcome`,
        },
      })
    } catch {
      setError('OAuth sign-up failed. Please try again.')
      setOauthLoading(null)
    }
  }

  return (
    <main className="min-h-screen bg-[#04040b] flex items-center justify-center p-6 relative overflow-hidden">
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
            <span className="led-pulse h-2 w-2 rounded-full bg-[#71d083]" />
            <span className="font-mono text-[14px] font-bold text-[#e5e5e5] uppercase tracking-[0.1em]">InterviewAI</span>
          </Link>
          <p className="font-mono text-[10px] text-[#71d083] uppercase tracking-[0.2em] mb-2.5">// ACCESS TERMINAL</p>
          <h1 className="font-display text-[30px] font-bold text-[#e5e5e5] tracking-[-0.025em]">
            Create Your Account
          </h1>
          <p className="font-body text-[14px] text-[#7c7a85] mt-2">
            Start practicing with AI today
          </p>
        </motion.div>

        {/* Auth card — motion entrance */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[#121113] border border-[#2b292d] rounded-[6px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-7"
        >
          {/* OAuth buttons */}
          <div className="flex flex-col gap-2.5 mb-5">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={!!oauthLoading || loading}
              className="w-full flex items-center justify-center gap-2.5 bg-[#0e0e12] border border-[#2b292d] hover:border-[#4b494e] text-[#e5e5e5] font-mono text-[12px] uppercase tracking-[0.06em] py-2.5 rounded-[6px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {oauthLoading === 'google' ? (
                <span className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-[#7c7a85]"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                    />
                  ))}
                </span>
              ) : (
                <svg viewBox="0 0 24 24" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() => handleOAuth('github')}
              disabled={!!oauthLoading || loading}
              className="w-full flex items-center justify-center gap-2.5 bg-[#0e0e12] border border-[#2b292d] hover:border-[#4b494e] text-[#e5e5e5] font-mono text-[12px] uppercase tracking-[0.06em] py-2.5 rounded-[6px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {oauthLoading === 'github' ? (
                <span className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-[#7c7a85]"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                    />
                  ))}
                </span>
              ) : (
                <GitHubIcon className="h-4 w-4" />
              )}
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#2b292d]" />
            <span className="font-mono text-[10px] text-[#49474e] uppercase tracking-[0.1em]">or</span>
            <div className="flex-1 h-px bg-[#2b292d]" />
          </div>

          <form onSubmit={handleSignUp} className="space-y-0">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-[#2a0e15] border border-[#5c1d28] rounded-[6px] text-[#f87171] font-mono text-[11px] mb-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Full Name field */}
            <div className="mb-4">
              <label htmlFor="fullName" className="font-mono text-[10px] text-[#b5b2bc] uppercase tracking-[0.1em] block mb-2">
                Full Name
              </label>
              <TypewriterInput
                id="fullName"
                type="text"
                name="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholders={['John Doe', 'Sarah Chen', 'Arjun Sharma', 'Maria Lopez']}
                autoComplete="name"
                required
                className="input-focus-glow"
              />
            </div>

            {/* Email field */}
            <div className="mb-4">
              <label htmlFor="email" className="font-mono text-[10px] text-[#b5b2bc] uppercase tracking-[0.1em] block mb-2">
                Email Address
              </label>
              <TypewriterInput
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholders={[
                  'engineer@company.com',
                  'dev@startup.io',
                  'you@domain.com',
                ]}
                autoComplete="email"
                required
                className="input-focus-glow"
              />
            </div>

            {/* Password field */}
            <div className="mb-4">
              <label htmlFor="password" className="font-mono text-[10px] text-[#b5b2bc] uppercase tracking-[0.1em] block mb-2">
                Password
              </label>
              <TypewriterInput
                id="password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholders={['••••••••••••', '············', '············']}
                autoComplete="new-password"
                required
                className="input-focus-glow"
              />
            </div>

            {/* Confirm Password field */}
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="font-mono text-[10px] text-[#b5b2bc] uppercase tracking-[0.1em] block mb-2">
                Confirm Password
              </label>
              <TypewriterInput
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholders={['Confirm your password']}
                autoComplete="new-password"
                required
                className="input-focus-glow"
              />
            </div>

            {/* Submit button — motion with AnimatePresence loading dots */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[#71d083] text-[#04040b] font-mono text-[13px] font-bold uppercase tracking-[0.06em] py-3.5 rounded-[6px] border border-[#366740] hover:bg-[#82dba2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] relative overflow-hidden flex items-center justify-center"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <span className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-[#04040b]"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                        />
                      ))}
                    </span>
                    <span>Creating Account</span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Create Account →
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>
        </motion.div>

        {/* Switch link */}
        <p className="text-center font-mono text-[11px] text-[#49474e] mt-5 uppercase tracking-[0.04em]">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="text-[#70b8ff] hover:text-[#eeeef0] transition-colors"
          >
            Sign in
          </Link>
        </p>

        <p className="text-center font-mono text-[10px] text-[#49474e] mt-3">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-[#70b8ff] hover:text-[#eeeef0] transition-colors">
            Terms of Service
          </Link>{' '}and{' '}
          <Link href="/privacy" className="text-[#70b8ff] hover:text-[#eeeef0] transition-colors">
            Privacy Policy
          </Link>.
        </p>
      </div>
    </main>
  )
}
