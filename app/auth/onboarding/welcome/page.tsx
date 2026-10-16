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
  FileText,
  RefreshCw,
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
    color: '#2447FF',
  },
  {
    id: 'role',
    number: 2,
    title: 'Set your target role',
    subtitle: "We'll calibrate difficulty, topics, and question style to match.",
    icon: Target,
    color: '#2447FF',
  },
  {
    id: 'launch',
    number: 3,
    title: "You're ready to go",
    subtitle: "Your first AI mock interview is waiting. Let's start.",
    icon: Rocket,
    color: '#2447FF',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnboardingWelcomePage() {
  const router = useRouter()
  const { isResumeReady, isExtracting, resumeData, resumeMeta, storedResumes } = useResume()

  const [step, setStep] = useState(0)
  const [selectedRole, setSelectedRole] = useState('')
  const [customRole, setCustomRole] = useState('')
  const [saving, setSaving] = useState(false)
  const [isReplacingResume, setIsReplacingResume] = useState(false)

  const activeStored = storedResumes?.find((r) => r.isActive) || storedResumes?.[0]
  const displayedFileName =
    resumeMeta?.fileName ||
    activeStored?.fileName ||
    (resumeData?.name ? `${resumeData.name.replace(/\s+/g, '_')}_Resume.pdf` : 'Uploaded_Resume.pdf')

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
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-3 sm:p-4 md:p-6 relative overflow-hidden font-sans">
      {/* Background ambient */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-[#2447FF] opacity-[0.05] blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[250px] w-[250px] rounded-full bg-[#2447FF] opacity-[0.03] blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-[660px] md:max-w-[700px] my-auto">
        {/* ── Brand header ── */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2447FF]" />
            </div>
            <span className="font-sans text-sm sm:text-base font-light text-white tracking-tight">
              InterviewAI
            </span>
          </div>

          <button
            type="button"
            onClick={handleSkipToDashboard}
            disabled={saving}
            className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-mono text-[10px] sm:text-[11px] uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer"
          >
            Skip to Dashboard
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* ── Step indicator ── */}
        <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all duration-300 ${
                  i <= step
                    ? 'bg-[#2447FF] border border-[#2447FF] text-white'
                    : 'bg-white/5 border border-white/10 text-white/40'
                }`}
              >
                {i < step ? <CheckCircle2 className="h-3 w-3" /> : s.number}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-px w-6 sm:w-10 transition-all duration-500 ${
                    i < step ? 'bg-[#2447FF]' : 'bg-white/10'
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
            initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl border border-white/10 bg-[#0A0A0A] shadow-[0_24px_80px_rgba(0,0,0,0.8)] overflow-hidden relative"
          >
            {/* Subtle top hairline */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#2447FF]/40 to-transparent pointer-events-none" />

            {/* Card header */}
            <div className="px-5 sm:px-7 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3 mb-1.5">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${STEPS[step].color}18`, border: `1px solid ${STEPS[step].color}30` }}
                >
                  <StepIcon className="h-4 w-4" style={{ color: STEPS[step].color }} />
                </div>
                <div>
                  <p className="font-mono text-[9px] text-[#2447FF] uppercase tracking-[0.16em] font-semibold flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-[#2447FF]" />
                    Step {STEPS[step].number} of {STEPS.length}
                  </p>
                  <h1 className="font-display text-lg sm:text-xl font-normal text-white leading-tight mt-0.5 tracking-[-0.03em]">
                    {STEPS[step].title}
                  </h1>
                </div>
              </div>
              <p className="font-sans text-xs text-zinc-400 font-light leading-relaxed">
                {STEPS[step].subtitle}
              </p>
            </div>

            {/* Card body */}
            <div className="px-5 sm:px-7 py-3.5 sm:py-4">
              {/* ── STEP 0: Resume Upload ── */}
              {step === 0 && (
                <div className="space-y-3">
                  {/* When resume is ready and user is not actively replacing it */}
                  {isResumeReady && !isReplacingResume ? (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 sm:p-5 relative overflow-hidden font-sans space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-xl bg-[#2447FF]/10 border border-[#2447FF]/25 flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5 text-[#2447FF]" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p
                                className="font-mono text-[13px] font-semibold text-white truncate max-w-[200px] sm:max-w-[340px]"
                                title={displayedFileName}
                              >
                                {displayedFileName}
                              </p>
                              <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#2447FF]/15 border border-[#2447FF]/30 text-[#2447FF] font-semibold shrink-0">
                                Selected
                              </span>
                            </div>
                            <p className="font-sans text-[11px] sm:text-[12px] text-zinc-400 font-light truncate mt-0.5">
                              {resumeData?.skills?.length
                                ? `${resumeData.skills.length} technical skills identified`
                                : 'Parsed & ready'}
                              {resumeData?.targetRole ? ` • ${resumeData.targetRole}` : ''}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsReplacingResume(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white font-mono text-[11px] uppercase tracking-wider transition-all cursor-pointer shrink-0"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Replace</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[11px] font-mono text-zinc-400">
                        <span className="flex items-center gap-1.5 text-zinc-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#2447FF]" />
                          Resume parsed — questions will be tailored to your background
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-2">
                      {isReplacingResume && (
                        <div className="flex items-center justify-between px-1">
                          <span className="font-mono text-[11px] text-zinc-400 truncate max-w-[260px] sm:max-w-none">
                            Upload new resume to replace <span className="text-white font-medium">{displayedFileName}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsReplacingResume(false)}
                            className="text-zinc-400 hover:text-white font-mono text-[11px] underline cursor-pointer shrink-0"
                          >
                            Cancel & Keep Current
                          </button>
                        </div>
                      )}
                      <ResumeDropzone
                        source="onboarding"
                        onSuccess={() => setIsReplacingResume(false)}
                      />
                    </div>
                  )}

                  {isExtracting && (
                    <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#2447FF]/10 border border-[#2447FF]/20 rounded-xl">
                      <Loader2 className="h-4 w-4 text-[#2447FF] animate-spin shrink-0" />
                      <p className="font-mono text-[11px] text-[#2447FF]">
                        Analyzing your resume with AI...
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 1: Target Role ── */}
              {step === 1 && (
                <div className="space-y-3">
                  {selectedRole && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#2447FF]/10 border border-[#2447FF]/25 rounded-xl">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#2447FF] shrink-0" />
                      <span className="font-mono text-[12px] text-white font-semibold flex-1 truncate">
                        {selectedRole}
                      </span>
                      <button
                        onClick={() => setSelectedRole('')}
                        className="text-white/40 hover:text-white transition-colors cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {POPULAR_ROLES.map((role) => (
                      <button
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        className={`text-left px-3 py-2 rounded-xl border font-mono text-[11px] sm:text-[12px] transition-all cursor-pointer truncate ${
                          selectedRole === role
                            ? 'border-[#2447FF] bg-[#2447FF]/15 text-white font-semibold'
                            : 'border-white/10 text-white/60 hover:border-white/20 hover:text-white hover:bg-white/[0.03]'
                        }`}
                        title={role}
                      >
                        {role}
                        {selectedRole === role && (
                          <span className="float-right text-[#2447FF]">✓</span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-0.5">
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
                      className="flex-1 bg-white/[0.03] border border-white/10 text-white placeholder:text-white/40 text-[11px] font-mono px-3.5 py-2 rounded-full focus:outline-none focus:border-[#2447FF] transition-colors"
                    />
                    <button
                      onClick={() => {
                        if (customRole.trim()) {
                          setSelectedRole(customRole.trim())
                          setCustomRole('')
                        }
                      }}
                      disabled={!customRole.trim()}
                      className="px-3.5 py-2 bg-white/[0.05] border border-white/10 text-white/60 hover:text-white rounded-full transition-colors disabled:opacity-40 cursor-pointer text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Launch ── */}
              {step === 2 && (
                <div className="space-y-3.5">
                  <div className="space-y-2">
                    <SummaryRow
                      done={isResumeReady}
                      label={isResumeReady ? 'Resume uploaded & analyzed' : 'No resume (questions will be general)'}
                      color="#2447FF"
                    />
                    <SummaryRow
                      done={!!selectedRole}
                      label={selectedRole ? `Targeting: ${selectedRole}` : 'Role: Software Engineer (default)'}
                      color="#2447FF"
                    />
                    <SummaryRow
                      done={true}
                      label="AI interviewer calibrated & ready"
                      color="#2447FF"
                    />
                  </div>

                  <div className="p-3.5 sm:p-4 bg-[#2447FF]/[0.06] border border-[#2447FF]/25 rounded-xl text-center">
                    <Sparkles className="h-5 w-5 text-[#2447FF] mx-auto mb-1.5" />
                    <p className="font-sans text-sm sm:text-base font-light text-white mb-0.5">
                      Your first interview is ready
                    </p>
                    <p className="font-mono text-[10px] text-white/50 uppercase tracking-wider">
                      Expect 5–8 questions · ~15–20 minutes · Instant feedback
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Card footer / navigation */}
            <div className="px-5 sm:px-7 py-3 sm:py-3.5 border-t border-white/[0.06] flex items-center justify-between gap-3">
              {step > 0 ? (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-mono text-[11px] uppercase tracking-wider rounded-full transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
              ) : (
                <button
                  onClick={handleSkipToRole}
                  disabled={saving || isExtracting}
                  className="px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-[11px] text-white/70 hover:text-white uppercase tracking-wider transition-colors disabled:opacity-40 cursor-pointer"
                >
                  Skip setup
                </button>
              )}

              {step < STEPS.length - 1 ? (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canAdvance() || isExtracting}
                  className="flex items-center gap-2 px-6 py-2 bg-[#2447FF] hover:bg-[#1d3ad4] text-white font-mono text-[11px] font-semibold uppercase tracking-wider rounded-full transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-none"
                >
                  {step === 0 && isResumeReady ? 'Continue' : step === 0 ? 'Skip for now' : 'Continue'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </motion.button>
              ) : (
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleSkipToDashboard}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white font-mono text-[10px] sm:text-[11px] uppercase tracking-wider rounded-full transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Skip to Dashboard
                    <ArrowRight className="h-3 w-3" />
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleFinish}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-[#2447FF] hover:bg-[#1d3ad4] text-white font-mono text-[11px] font-semibold uppercase tracking-wider rounded-full transition-colors disabled:opacity-50 cursor-pointer shadow-none"
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

        <p className="text-center font-mono text-[9px] text-[#8C8C88] mt-2.5 sm:mt-3 uppercase tracking-widest">
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
