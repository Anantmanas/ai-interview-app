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
    <div className="min-h-screen bg-[#050505] text-[#F4F2EC] flex flex-col items-center justify-center p-6 relative select-none">
      <div className="relative z-10 w-full max-w-[520px]">
        {/* Brand Header + Skip to Dashboard */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#2447FF]" />
            <span className="font-display text-[15px] font-bold text-[#F4F2EC] tracking-tight">
              InterviewAI
            </span>
          </div>
          <button
            type="button"
            onClick={handleGoToDashboard}
            disabled={saving}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-white/10 hover:border-white/25 bg-white/[0.03] hover:bg-white/[0.06] text-[#8C8C88] hover:text-[#F4F2EC] font-mono text-[11px] uppercase tracking-wider transition-all disabled:opacity-40"
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
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-mono font-bold border transition-all duration-200 ${
                    step > s.id
                      ? 'bg-[#2447FF]/20 border-[#2447FF] text-[#2447FF]'
                      : step === s.id
                        ? 'bg-[#2447FF] border-[#2447FF] text-white'
                        : 'border-white/15 text-[#8C8C88] bg-transparent'
                  }`}
                >
                  {step > s.id ? '✓' : s.id}
                </div>
                <span
                  className={`text-[11px] font-mono uppercase tracking-[0.08em] hidden sm:block transition-colors ${
                    step >= s.id ? 'text-[#F4F2EC]' : 'text-[#8C8C88]'
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
              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-7 sm:p-8">
                <p className="font-mono text-[10px] text-[#2447FF] uppercase tracking-[0.16em] mb-2 font-semibold">
                  STEP 01 / RESUME GROUNDING
                </p>
                <h1 className="font-display text-[26px] sm:text-[28px] font-bold text-[#F4F2EC] leading-tight mb-2">
                  Ground your AI interviewer
                </h1>
                <p className="font-body text-[#8C8C88] text-[13px] sm:text-[14px] leading-relaxed mb-6">
                  Upload your resume so the AI calibrates interview questions to your actual tech
                  stack and experience level. Optional but recommended.
                </p>

                {/* Upload zone */}
                <div
                  className={`border border-dashed rounded-lg p-7 text-center mb-6 transition-all cursor-pointer ${
                    resumeUploaded
                      ? 'border-[#10b981]/50 bg-[#10b981]/5'
                      : 'border-white/15 hover:border-white/30 bg-white/[0.02]'
                  }`}
                  onClick={() => document.getElementById('resume-upload')?.click()}
                >
                  {resumeUploaded ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-9 h-9 rounded-md bg-[#10b981]/20 flex items-center justify-center text-[#10b981]">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <p className="text-[#10b981] text-[13px] font-mono font-medium">
                        {resumeFileName || 'Resume uploaded and parsed'}
                      </p>
                      <p className="text-[#8C8C88] text-[11px] font-mono">
                        Click to replace PDF
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-9 h-9 rounded-md bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#8C8C88] mb-1">
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-[#2447FF]" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </div>
                      <p className="text-[#F4F2EC] text-[13px] font-mono font-medium">
                        {uploading ? 'Parsing your resume...' : 'Drop your resume PDF or click to browse'}
                      </p>
                      <p className="text-[#8C8C88] text-[11px] font-mono">PDF only · Max 10MB</p>
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
                    className="flex-1 bg-[#2447FF] hover:bg-[#1A3AE8] text-white font-mono text-xs uppercase tracking-[0.12em] font-bold h-11 rounded-md transition-all"
                  >
                    <span>{resumeUploaded ? 'Continue with Resume →' : 'Continue →'}</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSkipResume}
                    className="border border-white/15 hover:border-white/30 text-[#8C8C88] hover:text-[#F4F2EC] bg-transparent font-mono text-xs uppercase tracking-[0.1em] h-11 px-4 rounded-md"
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
              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-7 sm:p-8">
                <p className="font-mono text-[10px] text-[#2447FF] uppercase tracking-[0.16em] mb-2 font-semibold">
                  STEP 02 / TARGET TRACK
                </p>
                <h1 className="font-display text-[26px] sm:text-[28px] font-bold text-[#F4F2EC] leading-tight mb-2">
                  What role are you targeting?
                </h1>
                <p className="font-body text-[#8C8C88] text-[13px] sm:text-[14px] leading-relaxed mb-6">
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
                      className={`px-3 py-2 rounded-md text-[12px] font-mono border transition-all ${
                        targetRole === role && !customRole
                          ? 'border-[#2447FF] bg-[#2447FF]/15 text-white font-semibold'
                          : 'border-white/10 bg-white/[0.02] text-[#8C8C88] hover:border-white/25 hover:text-[#F4F2EC]'
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
                  className="w-full bg-white/[0.03] border border-white/15 rounded-md px-4 py-2.5 text-[13px] font-mono text-[#F4F2EC] placeholder:text-[#8C8C88] focus:outline-none focus:border-[#2447FF] transition-colors mb-6"
                />

                <div className="flex gap-3">
                  <Button
                    onClick={handleRoleSave}
                    disabled={!effectiveRole || saving}
                    className="flex-1 bg-[#2447FF] hover:bg-[#1A3AE8] text-white font-mono text-xs uppercase tracking-[0.12em] font-bold h-11 rounded-md transition-all disabled:opacity-40"
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
              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-7 sm:p-8 text-center">
                <div className="w-12 h-12 rounded-lg bg-[#2447FF]/15 border border-[#2447FF]/30 flex items-center justify-center mx-auto mb-5 text-[#2447FF]">
                  <CheckCircle2 className="h-6 w-6" />
                </div>

                <p className="font-mono text-[10px] text-[#2447FF] uppercase tracking-[0.16em] mb-2 font-semibold">
                  STEP 03 / CALIBRATION COMPLETE
                </p>
                <h1 className="font-display text-[26px] sm:text-[28px] font-bold text-[#F4F2EC] leading-tight mb-2">
                  Your AI session is ready
                </h1>
                <p className="font-body text-[#8C8C88] text-[13px] sm:text-[14px] leading-relaxed mb-6 max-w-sm mx-auto">
                  Target Track: <strong className="text-white font-medium">{effectiveRole}</strong>.{' '}
                  {resumeUploaded ? 'Resume parsed and integrated.' : 'Standard baseline profile active.'}
                </p>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleFinish}
                    disabled={saving}
                    className="w-full bg-[#2447FF] hover:bg-[#1A3AE8] text-white font-mono text-xs uppercase tracking-[0.12em] font-bold h-12 rounded-md transition-all shadow-[0_0_25px_rgba(36,71,255,0.35)]"
                  >
                    <span>Start First Interview →</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleGoToDashboard}
                    disabled={saving}
                    className="w-full border border-white/15 hover:border-white/30 text-[#8C8C88] hover:text-[#F4F2EC] bg-transparent font-mono text-xs uppercase tracking-[0.1em] h-11 rounded-md transition-all"
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
