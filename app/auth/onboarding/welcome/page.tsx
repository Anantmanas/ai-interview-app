'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { useResume } from '@/components/resume/resume-provider'
import { ResumeDropzone } from '@/components/resume/resume-dropzone'
import {
  Upload,
  Target,
  Rocket,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  X,
  Plus,
} from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const POPULAR_ROLES = [
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Developer',
  'Software Engineer',
  'AI / ML Engineer',
  'DevOps Engineer',
  'Data Engineer',
  'Mobile Developer',
]

const STEPS = [
  {
    id: 'resume',
    number: 1,
    title: 'Upload your resume',
    subtitle: 'Takes 30 seconds. Personalizes every question to your background.',
    icon: Upload,
    color: '#8052ff',
  },
  {
    id: 'role',
    number: 2,
    title: 'Set your target role',
    subtitle: "We'll calibrate difficulty, topics, and question style to match.",
    icon: Target,
    color: '#8052ff',
  },
  {
    id: 'launch',
    number: 3,
    title: "You're ready to go",
    subtitle: "Your first AI mock interview is waiting. Let's start.",
    icon: Rocket,
    color: '#15846e',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnboardingWelcomePage() {
  const router = useRouter()
  const { isResumeReady, isExtracting, resumeData } = useResume()

  const [step, setStep] = useState(0)
  const [selectedRole, setSelectedRole] = useState('')
  const [customRole, setCustomRole] = useState('')
  const [saving, setSaving] = useState(false)

  // Auto-fill role suggestion from resume
  useEffect(() => {
    if (resumeData?.targetRole && !selectedRole) {
      setSelectedRole(resumeData.targetRole)
    }
  }, [resumeData?.targetRole, selectedRole])

  const canAdvance = () => {
    if (step === 0) return true // resume is optional
    if (step === 1) return !!selectedRole
    return true
  }

  const handleFinish = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const finalRole = selectedRole || 'Software Engineer'

      if (user) {
        await supabase
          .from('profiles')
          .update({
            target_role: finalRole,
            onboarding_complete: true,
            onboarding_step: 3,
          })
          .eq('id', user.id)

        // Trigger welcome email (non-fatal)
        try {
          await fetch('/api/emails/welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              fullName:
                user.user_metadata?.full_name ||
                user.email?.split('@')[0] ||
                'Engineer',
            }),
          })
        } catch {}
      }

      // Go straight into first interview
      router.push('/interview/new')
    } finally {
      setSaving(false)
    }
  }

  const handleSkipToRole = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .update({ target_role: 'Software Engineer', onboarding_complete: true })
          .eq('id', user.id)
      }
      router.push('/dashboard')
    } finally {
      setSaving(false)
    }
  }

  const handleSkipToDashboard = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const finalRole = selectedRole || customRole.trim() || 'Software Engineer'
      if (user) {
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email,
            target_role: finalRole,
          }, { onConflict: 'id' })
      }
    } catch (err) {
      console.warn('Skip profile error:', err)
    } finally {
      setSaving(false)
      window.location.href = '/dashboard'
    }
  }

  const StepIcon = STEPS[step].icon

  return (
    <main className="min-h-screen bg-[#000000] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-[#8052ff] opacity-[0.06] blur-[160px]" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-[#15846e] opacity-[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[540px]">
        {/* ── Brand header ── */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center">
              <span className="h-2 w-2 rounded-full bg-[#8052ff]" />
            </div>
            <span className="font-sans text-base font-light text-white tracking-tight">
              InterviewAI
            </span>
          </div>

          <button
            type="button"
            onClick={handleSkipToDashboard}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-mono text-[11px] uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer"
          >
            Skip to Dashboard
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* ── Step indicator ── */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-mono font-bold transition-all duration-300 ${
                  i <= step
                    ? 'bg-[#8052ff] border border-[#8052ff] text-white'
                    : 'bg-white/5 border border-white/10 text-white/40'
                }`}
              >
                {i < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.number}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-px w-8 transition-all duration-500 ${
                    i < step ? 'bg-[#8052ff]' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── Card ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.8)] overflow-hidden relative"
          >
            {/* Subtle top Electric Iris hairline */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#8052ff]/40 to-transparent pointer-events-none" />

            {/* Card header */}
            <div className="px-7 pt-7 pb-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${STEPS[step].color}18`, border: `1px solid ${STEPS[step].color}30` }}
                >
                  <StepIcon className="h-5 w-5" style={{ color: STEPS[step].color }} />
                </div>
                <div>
                  <p className="font-mono text-[10px] text-[#8052ff] uppercase tracking-[0.16em] font-semibold flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8052ff] shadow-[0_0_8px_#8052ff]" />
                    Step {STEPS[step].number} of {STEPS.length}
                  </p>
                  <h1 className="font-display text-[22px] font-normal text-white leading-tight mt-1 tracking-[-0.03em]">
                    {STEPS[step].title}
                  </h1>
                </div>
              </div>
              <p className="font-sans text-sm text-zinc-400 font-light leading-relaxed">
                {STEPS[step].subtitle}
              </p>
            </div>

            {/* Card body */}
            <div className="px-7 py-6">
              {/* ── STEP 0: Resume Upload ── */}
              {step === 0 && (
                <div className="space-y-4">
                  <ResumeDropzone source="onboarding" />

                  {isResumeReady && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 px-3.5 py-2.5 bg-[#10b981]/10 border border-[#10b981]/25 rounded-xl"
                    >
                      <CheckCircle2 className="h-4 w-4 text-[#10b981] shrink-0" />
                      <p className="font-mono text-[12px] text-[#10b981] font-semibold">
                        Resume parsed — questions will be tailored to your background
                      </p>
                    </motion.div>
                  )}

                  {isExtracting && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-[#8052ff]/10 border border-[#8052ff]/20 rounded-2xl">
                      <Loader2 className="h-4 w-4 text-[#8052ff] animate-spin shrink-0" />
                      <p className="font-mono text-[12px] text-[#8052ff]">
                        Analyzing your resume with AI...
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 1: Target Role ── */}
              {step === 1 && (
                <div className="space-y-4">
                  {selectedRole && (
                    <div className="flex items-center gap-2 p-3 bg-[#8052ff]/10 border border-[#8052ff]/25 rounded-2xl">
                      <CheckCircle2 className="h-4 w-4 text-[#8052ff] shrink-0" />
                      <span className="font-mono text-[13px] text-white font-semibold flex-1 truncate">
                        {selectedRole}
                      </span>
                      <button
                        onClick={() => setSelectedRole('')}
                        className="text-white/40 hover:text-white transition-colors cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {POPULAR_ROLES.map((role) => (
                      <button
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        className={`text-left px-4 py-3 rounded-2xl border font-mono text-[12px] transition-all cursor-pointer ${
                          selectedRole === role
                            ? 'border-[#8052ff] bg-[#8052ff]/20 text-white font-semibold'
                            : 'border-white/10 text-white/60 hover:border-white/20 hover:text-white hover:bg-white/[0.03]'
                        }`}
                      >
                        {role}
                        {selectedRole === role && (
                          <span className="float-right text-[#8052ff]">✓</span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customRole.trim()) {
                          setSelectedRole(customRole.trim())
                          setCustomRole('')
                        }
                      }}
                      placeholder="Or type your own role..."
                      className="flex-1 bg-white/[0.03] border border-white/10 text-white placeholder:text-white/40 text-[12px] font-mono px-4 py-2.5 rounded-full focus:outline-none focus:border-[#8052ff] transition-colors"
                    />
                    <button
                      onClick={() => {
                        if (customRole.trim()) {
                          setSelectedRole(customRole.trim())
                          setCustomRole('')
                        }
                      }}
                      disabled={!customRole.trim()}
                      className="px-4 py-2.5 bg-white/[0.05] border border-white/10 text-white/60 hover:text-white rounded-full transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Launch ── */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <SummaryRow
                      done={isResumeReady}
                      label={isResumeReady ? 'Resume uploaded & analyzed' : 'No resume (questions will be general)'}
                      color="#15846e"
                    />
                    <SummaryRow
                      done={!!selectedRole}
                      label={selectedRole ? `Targeting: ${selectedRole}` : 'Role: Software Engineer (default)'}
                      color="#8052ff"
                    />
                    <SummaryRow
                      done={true}
                      label="AI interviewer calibrated & ready"
                      color="#8052ff"
                    />
                  </div>

                  <div className="p-5 bg-[#15846e]/[0.08] border border-[#15846e]/30 rounded-2xl text-center">
                    <Sparkles className="h-6 w-6 text-[#15846e] mx-auto mb-2" />
                    <p className="font-sans text-base font-light text-white mb-1">
                      Your first interview is ready
                    </p>
                    <p className="font-mono text-[11px] text-white/50 uppercase tracking-wider">
                      Expect 5–8 questions · ~15–20 minutes · Instant feedback
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Card footer / navigation */}
            <div className="px-7 pb-7 pt-2 flex items-center justify-between gap-3">
              {step > 0 ? (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-mono text-[11px] uppercase tracking-wider rounded-full transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
              ) : (
                <button
                  onClick={handleSkipToRole}
                  disabled={saving || isExtracting}
                  className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-[11px] text-white/70 hover:text-white uppercase tracking-wider transition-colors disabled:opacity-40 cursor-pointer"
                >
                  Skip setup
                </button>
              )}

              {step < STEPS.length - 1 ? (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canAdvance() || isExtracting}
                  className="btn-dala-primary flex items-center gap-2 px-7 py-2.5 font-mono text-[12px] font-semibold uppercase tracking-wider rounded-full cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {step === 0 && isResumeReady ? 'Continue' : step === 0 ? 'Skip for now' : 'Continue'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </motion.button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSkipToDashboard}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white font-mono text-[11px] uppercase tracking-wider rounded-full transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Skip to Dashboard
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleFinish}
                    disabled={saving}
                    className="flex items-center gap-2 px-7 py-2.5 bg-[#15846e] hover:bg-[#12705e] border border-[#15846e]/40 text-white font-mono text-[12px] font-semibold uppercase tracking-wider rounded-full transition-all shadow-[0_0_20px_rgba(21,132,110,0.3)] disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        Launch First Interview
                        <Rocket className="h-3.5 w-3.5" />
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="text-center font-mono text-[10px] text-[#8C8C88] mt-6 uppercase tracking-widest">
          InterviewAI · Encrypted & Isolated · Your data stays yours
        </p>
      </div>
    </main>
  )
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function SummaryRow({
  done,
  label,
  color,
}: {
  done: boolean
  label: string
  color: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-5 w-5 rounded-full flex items-center justify-center shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}
      >
        <CheckCircle2 className="h-3 w-3" style={{ color }} />
      </div>
      <span className="font-mono text-[12px] text-[#8C8C88]">{label}</span>
    </div>
  )
}
