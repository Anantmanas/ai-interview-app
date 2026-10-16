'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2, Upload, FileText, Loader2 } from 'lucide-react'

// Step definitions
const STEPS = [
  { id: 1, key: 'resume', label: 'Resume', title: 'Ground your AI interviewer' },
  { id: 2, key: 'role', label: 'Target role', title: 'Set your target' },
  { id: 3, key: 'ready', label: 'Launch', title: "You're ready" },
]

const ROLES = [
  'Frontend Engineer',
  'Full Stack Developer',
  'Backend Engineer',
  'Software Engineer',
  'AI / ML Engineer',
  'DevOps Engineer',
  'Data Engineer',
  'Cloud Architect',
  'System Design Engineer',
]

export default function OnboardingPage() {
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [targetRole, setTargetRole] = useState('Frontend Engineer')
  const [customRole, setCustomRole] = useState('')
  const [uploading, setUploading] = useState(false)
  const [resumeUploaded, setResumeUploaded] = useState(false)
  const [resumeFileName, setResumeFileName] = useState('')
  const [saving, setSaving] = useState(false)

  const effectiveRole = customRole.trim() || targetRole || 'Software Engineer'

  const handleSkipResume = () => setStep(2)

  const handleRoleSave = async () => {
    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').upsert(
          {
            id: user.id,
            email: user.email,
            target_role: effectiveRole,
          },
          { onConflict: 'id' }
        )
      }
    } catch (err) {
      console.warn('Error saving role:', err)
    } finally {
      setSaving(false)
      setStep(3)
    }
  }

  const handleFinish = async () => {
    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').upsert(
          {
            id: user.id,
            email: user.email,
            target_role: effectiveRole,
          },
          { onConflict: 'id' }
        )
      }
    } catch (err) {
      console.warn('Error saving profile on finish:', err)
    } finally {
      setSaving(false)
      window.location.href = '/interview/new'
    }
  }

  const handleGoToDashboard = async () => {
    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').upsert(
          {
            id: user.id,
            email: user.email,
            target_role: effectiveRole,
          },
          { onConflict: 'id' }
        )
      }
    } catch (err) {
      console.warn('Error saving profile on skip:', err)
    } finally {
      setSaving(false)
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 relative select-none font-sans overflow-hidden">
      <div className="relative z-10 w-full max-w-[660px] md:max-w-[700px] my-auto">
        {/* Brand Header + Skip to Dashboard */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#2447FF]" />
            <span className="font-sans text-sm sm:text-base font-light text-white tracking-tight">
              InterviewAI
            </span>
          </div>
          <button
            type="button"
            onClick={handleGoToDashboard}
            disabled={saving}
            className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-mono text-[10px] sm:text-[11px] uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer"
          >
            <span>Skip to Dashboard</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Clean Progress indicator */}
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all duration-200 ${
                    step >= s.id
                      ? 'bg-[#2447FF] border border-[#2447FF] text-white'
                      : 'bg-white/5 border border-white/10 text-white/40'
                  }`}
                >
                  {step > s.id ? '✓' : s.id}
                </div>
                <span
                  className={`text-[11px] font-mono uppercase tracking-[0.08em] hidden sm:block transition-colors ${
                    step >= s.id ? 'text-white' : 'text-white/40'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px transition-all duration-300 ${
                    step > s.id ? 'bg-[#2447FF]' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {/* Step 1 — Resume */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="rounded-3xl border border-white/10 bg-[#0A0A0A] p-5 sm:p-7 shadow-[0_24px_80px_rgba(0,0,0,0.8)] relative overflow-hidden font-sans">
                {/* Subtle top hairline */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#2447FF]/40 to-transparent pointer-events-none" />

                <p className="font-mono text-[9px] text-[#2447FF] uppercase tracking-[0.16em] mb-1 font-semibold flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-[#2447FF]" />
                  STEP 01 / RESUME GROUNDING
                </p>
                <h1 className="font-display text-lg sm:text-xl font-normal text-white leading-tight mb-1 tracking-[-0.03em]">
                  Ground your AI interviewer
                </h1>
                <p className="font-sans text-zinc-400 text-xs font-light leading-relaxed mb-4">
                  Upload your resume so the AI calibrates interview questions to your actual tech
                  stack and experience level. Optional but recommended.
                </p>

                {/* Upload zone or Selected Resume display */}
                {resumeUploaded ? (
                  <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-4 sm:p-5 mb-4 relative overflow-hidden font-sans space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-[#2447FF]/10 border border-[#2447FF]/25 flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-[#2447FF]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-[13px] font-semibold text-white truncate max-w-[200px] sm:max-w-[340px]">
                              {resumeFileName || 'Resume.pdf'}
                            </p>
                            <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#2447FF]/15 border border-[#2447FF]/30 text-[#2447FF] font-semibold shrink-0">
                              Selected
                            </span>
                          </div>
                          <p className="font-sans text-[11px] sm:text-[12px] text-zinc-400 font-light truncate mt-0.5">
                            Resume uploaded and parsed successfully
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => document.getElementById('resume-upload')?.click()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white font-mono text-[11px] uppercase tracking-wider transition-all cursor-pointer shrink-0"
                      >
                        <span>Replace</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[11px] font-mono text-zinc-400">
                      <span className="flex items-center gap-1.5 text-zinc-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#2447FF]" />
                        Resume parsed — questions will be tailored to your background
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    className="border border-dashed border-white/15 hover:border-white/30 bg-white/[0.02] rounded-2xl p-5 sm:p-6 text-center mb-4 transition-all cursor-pointer"
                    onClick={() => document.getElementById('resume-upload')?.click()}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/60 mb-0.5">
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-[#2447FF]" />
                        ) : (
                          <Upload className="h-4 w-4 text-[#2447FF]" />
                        )}
                      </div>
                      <p className="text-white text-xs font-mono font-medium">
                        {uploading ? 'Parsing your resume...' : 'Drop your resume (PDF, DOCX, TXT) or click to browse'}
                      </p>
                      <p className="text-zinc-500 text-[10px] font-mono">PDF, DOCX or TXT · Max 10MB</p>
                    </div>
                  </div>
                )}

                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setUploading(true)
                    setResumeFileName(file.name)
                    let uploadFile = file
                    if (
                      file.size > 4 * 1024 * 1024 &&
                      (file.name.endsWith('.txt') || file.type === 'text/plain')
                    ) {
                      const text = await file.text()
                      const trimmed = text.trim()
                      const safeText = trimmed.length > 500_000 ? trimmed.slice(0, 500_000) : trimmed
                      uploadFile = new File([safeText], file.name, { type: 'text/plain' })
                    }
                    const form = new FormData()
                    form.append('file', uploadFile)
                    try {
                      await fetch('/api/resume', { method: 'POST', body: form })
                      setResumeUploaded(true)
                    } catch (err) {
                      console.error('Upload error:', err)
                    } finally {
                      setUploading(false)
                    }
                  }}
                />

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={uploading}
                    className="flex-1 h-9 px-5 bg-[#2447FF] hover:bg-[#1d3ad4] text-white font-mono text-[11px] font-semibold uppercase tracking-wider rounded-full transition-colors cursor-pointer shadow-none"
                  >
                    <span>{resumeUploaded ? 'Continue with Resume →' : 'Continue →'}</span>
                  </Button>
                  <Button
                    onClick={handleSkipResume}
                    className="btn-dala-secondary flex-1 sm:flex-initial h-9 px-5 rounded-full cursor-pointer text-xs"
                  >
                    Skip for now
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2 — Target role */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="rounded-3xl border border-white/10 bg-[#0A0A0A] p-5 sm:p-7 shadow-[0_24px_80px_rgba(0,0,0,0.8)] relative overflow-hidden font-sans">
                {/* Subtle top hairline */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#2447FF]/40 to-transparent pointer-events-none" />

                <p className="font-mono text-[9px] text-[#2447FF] uppercase tracking-[0.16em] mb-1 font-semibold flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-[#2447FF]" />
                  STEP 02 / TARGET TRACK
                </p>
                <h1 className="font-display text-lg sm:text-xl font-normal text-white leading-tight mb-1 tracking-[-0.03em]">
                  What role are you targeting?
                </h1>
                <p className="font-sans text-zinc-400 text-xs font-light leading-relaxed mb-4">
                  Select your primary discipline. The AI interviewer will calibrate its questions, difficulty, and code challenges accordingly.
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        setTargetRole(role)
                        setCustomRole('')
                      }}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-mono border transition-all cursor-pointer ${
                        targetRole === role && !customRole
                          ? 'border-[#2447FF] bg-[#2447FF]/15 text-white font-semibold'
                          : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/25 hover:text-white'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>

                {/* Custom role input */}
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="Or enter custom role (e.g. SRE, iOS Engineer)..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-full px-4 py-2.5 text-xs font-mono text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#2447FF] transition-colors mb-4"
                />

                <div className="flex gap-3">
                  <Button
                    onClick={handleRoleSave}
                    disabled={!effectiveRole || saving}
                    className="flex-1 h-9 px-5 bg-[#2447FF] hover:bg-[#1d3ad4] text-white font-mono text-[11px] font-semibold uppercase tracking-wider rounded-full transition-colors cursor-pointer disabled:opacity-40 shadow-none"
                  >
                    <span>{saving ? 'Saving...' : 'Set Target & Continue →'}</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3 — Launch */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="rounded-3xl border border-white/10 bg-[#0A0A0A] p-5 sm:p-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.8)] relative overflow-hidden font-sans">
                {/* Subtle top hairline */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#2447FF]/40 to-transparent pointer-events-none" />

                <div className="w-10 h-10 rounded-full bg-[#2447FF]/10 border border-[#2447FF]/25 flex items-center justify-center mx-auto mb-3 text-[#2447FF]">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <p className="font-mono text-[9px] text-[#2447FF] uppercase tracking-[0.16em] mb-1 font-semibold flex items-center justify-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-[#2447FF]" />
                  STEP 03 / CALIBRATION COMPLETE
                </p>
                <h1 className="font-display text-lg sm:text-xl font-normal text-white leading-tight mb-1 tracking-[-0.03em]">
                  Your AI session is ready
                </h1>
                <p className="font-sans text-zinc-400 text-xs font-light leading-relaxed mb-4 max-w-sm mx-auto">
                  Target Track: <strong className="text-white font-medium">{effectiveRole}</strong>.{' '}
                  {resumeUploaded ? 'Resume parsed and integrated.' : 'Standard baseline profile active.'}
                </p>

                <div className="flex flex-col gap-2.5">
                  <Button
                    onClick={handleFinish}
                    disabled={saving}
                    className="w-full h-9 px-5 bg-[#2447FF] hover:bg-[#1d3ad4] text-white font-mono text-[11px] font-semibold uppercase tracking-wider rounded-full transition-colors cursor-pointer shadow-none"
                  >
                    <span>Start First Interview →</span>
                  </Button>
                  <Button
                    onClick={handleGoToDashboard}
                    disabled={saving}
                    className="btn-dala-secondary w-full h-9 rounded-full cursor-pointer disabled:opacity-40 text-xs"
                  >
                    Go to Dashboard Instead
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
