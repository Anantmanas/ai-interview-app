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
    <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center p-6 relative select-none font-sans">
      <div className="relative z-10 w-full max-w-[540px]">
        {/* Brand Header + Skip to Dashboard */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#8052ff]" />
            <span className="font-sans text-base font-light text-white tracking-tight">
              InterviewAI
            </span>
          </div>
          <button
            type="button"
            onClick={handleGoToDashboard}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-mono text-[11px] uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer"
          >
            <span>Skip to Dashboard</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Clean Progress indicator */}
        <div className="flex items-center gap-3 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all duration-200 ${
                    step >= s.id
                      ? 'bg-[#8052ff] border border-[#8052ff] text-white'
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
                    step > s.id ? 'bg-[#8052ff]' : 'bg-white/10'
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
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-7 sm:p-9 shadow-[0_24px_80px_rgba(0,0,0,0.8)] relative overflow-hidden font-sans">
                {/* Subtle top Electric Iris hairline */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#8052ff]/40 to-transparent pointer-events-none" />

                <p className="font-mono text-[10px] text-[#8052ff] uppercase tracking-[0.16em] mb-2 font-semibold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8052ff] shadow-[0_0_8px_#8052ff]" />
                  STEP 01 / RESUME GROUNDING
                </p>
                <h1 className="font-display text-2xl sm:text-3xl font-normal text-white leading-tight mb-2 tracking-[-0.03em]">
                  Ground your AI interviewer
                </h1>
                <p className="font-sans text-zinc-400 text-[13px] sm:text-[14px] font-light leading-relaxed mb-6">
                  Upload your resume so the AI calibrates interview questions to your actual tech
                  stack and experience level. Optional but recommended.
                </p>

                {/* Upload zone */}
                <div
                  className={`border border-dashed rounded-2xl p-7 text-center mb-6 transition-all cursor-pointer ${
                    resumeUploaded
                      ? 'border-[#15846e]/50 bg-[#15846e]/10'
                      : 'border-white/15 hover:border-white/30 bg-white/[0.02]'
                  }`}
                  onClick={() => document.getElementById('resume-upload')?.click()}
                >
                  {resumeUploaded ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-[#15846e]/20 flex items-center justify-center text-[#15846e]">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <p className="text-[#15846e] text-[13px] font-mono font-medium">
                        {resumeFileName || 'Resume uploaded and parsed'}
                      </p>
                      <p className="text-zinc-500 text-[11px] font-mono">
                        Click to replace PDF
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/60 mb-1">
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-[#8052ff]" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </div>
                      <p className="text-white text-[13px] font-mono font-medium">
                        {uploading ? 'Parsing your resume...' : 'Drop your resume PDF or click to browse'}
                      </p>
                      <p className="text-zinc-500 text-[11px] font-mono">PDF only · Max 10MB</p>
                    </div>
                  )}
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setUploading(true)
                      setResumeFileName(file.name)
                      const form = new FormData()
                      form.append('file', file)
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
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={uploading}
                    className="btn-dala-primary flex-1 h-10 rounded-full cursor-pointer"
                  >
                    <span>{resumeUploaded ? 'Continue with Resume →' : 'Continue →'}</span>
                  </Button>
                  <Button
                    onClick={handleSkipResume}
                    className="btn-dala-secondary flex-1 sm:flex-initial h-10 px-6 rounded-full cursor-pointer"
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
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-7 sm:p-9 shadow-[0_24px_80px_rgba(0,0,0,0.8)] relative overflow-hidden font-sans">
                {/* Subtle top Electric Iris hairline */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#8052ff]/40 to-transparent pointer-events-none" />

                <p className="font-mono text-[10px] text-[#8052ff] uppercase tracking-[0.16em] mb-2 font-semibold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8052ff] shadow-[0_0_8px_#8052ff]" />
                  STEP 02 / TARGET TRACK
                </p>
                <h1 className="font-display text-2xl sm:text-3xl font-normal text-white leading-tight mb-2 tracking-[-0.03em]">
                  What role are you targeting?
                </h1>
                <p className="font-sans text-zinc-400 text-[13px] sm:text-[14px] font-light leading-relaxed mb-6">
                  Select your primary discipline. The AI interviewer will calibrate its questions, difficulty, and code challenges accordingly.
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        setTargetRole(role)
                        setCustomRole('')
                      }}
                      className={`px-3.5 py-2 rounded-full text-[12px] font-mono border transition-all cursor-pointer ${
                        targetRole === role && !customRole
                          ? 'border-[#8052ff] bg-[#8052ff]/20 text-white font-semibold'
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
                  className="w-full bg-white/[0.03] border border-white/10 rounded-full px-5 py-3 text-[13px] font-mono text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#8052ff] transition-colors mb-6"
                />

                <div className="flex gap-3">
                  <Button
                    onClick={handleRoleSave}
                    disabled={!effectiveRole || saving}
                    className="btn-dala-primary flex-1 h-10 rounded-full cursor-pointer disabled:opacity-40"
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
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-7 sm:p-9 text-center shadow-[0_24px_80px_rgba(0,0,0,0.8)] relative overflow-hidden font-sans">
                {/* Subtle top Electric Iris hairline */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#8052ff]/40 to-transparent pointer-events-none" />

                <div className="w-12 h-12 rounded-full bg-[#8052ff]/15 border border-[#8052ff]/30 flex items-center justify-center mx-auto mb-5 text-[#8052ff] shadow-[0_0_16px_rgba(128,82,255,0.2)]">
                  <CheckCircle2 className="h-6 w-6" />
                </div>

                <p className="font-mono text-[10px] text-[#8052ff] uppercase tracking-[0.16em] mb-2 font-semibold flex items-center justify-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8052ff] shadow-[0_0_8px_#8052ff]" />
                  STEP 03 / CALIBRATION COMPLETE
                </p>
                <h1 className="font-display text-2xl sm:text-3xl font-normal text-white leading-tight mb-2 tracking-[-0.03em]">
                  Your AI session is ready
                </h1>
                <p className="font-sans text-zinc-400 text-[13px] sm:text-[14px] font-light leading-relaxed mb-6 max-w-sm mx-auto">
                  Target Track: <strong className="text-white font-medium">{effectiveRole}</strong>.{' '}
                  {resumeUploaded ? 'Resume parsed and integrated.' : 'Standard baseline profile active.'}
                </p>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleFinish}
                    disabled={saving}
                    className="btn-dala-primary w-full h-10 rounded-full cursor-pointer"
                  >
                    <span>Start First Interview →</span>
                  </Button>
                  <Button
                    onClick={handleGoToDashboard}
                    disabled={saving}
                    className="btn-dala-secondary w-full h-10 rounded-full cursor-pointer disabled:opacity-40"
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
