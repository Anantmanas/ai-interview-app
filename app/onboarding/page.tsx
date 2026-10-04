'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

// Step definitions
const STEPS = [
  { id: 1, key: 'resume',  label: 'Resume',      title: 'Ground your AI interviewer' },
  { id: 2, key: 'role',    label: 'Target role',  title: 'Set your target' },
  { id: 3, key: 'ready',   label: 'Launch',       title: "You're ready" },
]

const ROLES = [
  'Frontend Engineer', 'Full Stack Developer', 'Backend Engineer',
  'AI / ML Engineer', 'DevOps Engineer', 'Mobile Developer',
  'Data Engineer', 'Cloud Architect', 'System Design Engineer',
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [targetRole, setTargetRole] = useState('Frontend Engineer')
  const [uploading, setUploading] = useState(false)
  const [resumeUploaded, setResumeUploaded] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSkipResume = () => setStep(2)

  const handleRoleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({
        target_role: targetRole,
        onboarding_step: 2,
      }).eq('id', user.id)
    }
    setSaving(false)
    setStep(3)
  }

  const handleFinish = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({
        onboarding_complete: true,
        onboarding_step: 3,
      }).eq('id', user.id)
    }
    router.push('/interview/new')
  }

  const handleGoToDashboard = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ onboarding_complete: true }).eq('id', user.id)
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full opacity-[0.06] blur-[120px]"
          style={{ background: 'radial-gradient(circle, #00D4AA, transparent)' }} />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full opacity-[0.04] blur-[100px]"
          style={{ background: 'radial-gradient(circle, #7B6FFF, transparent)' }} />
      </div>

      <div className="relative z-10 w-full max-w-[520px]">

        {/* Brand Header + Skip to Dashboard */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#00D4AA]/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#00D4AA]" />
            </div>
            <span className="font-display text-[15px] font-bold text-[#F0F0FF] tracking-tight">InterviewAI</span>
          </div>
          <button
            type="button"
            onClick={handleGoToDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#3A3A5C] hover:border-[#6B6B8A] bg-[#14142A]/50 text-[#8C8C88] hover:text-[#F0F0FF] font-mono text-[11px] uppercase tracking-wider transition-all"
          >
            Skip to Dashboard →
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-mono font-semibold border transition-all duration-300 ${
                  step > s.id
                    ? 'bg-[#00D4AA] border-[#00D4AA] text-[#080810]'
                    : step === s.id
                    ? 'border-[#00D4AA] text-[#00D4AA] bg-transparent'
                    : 'border-[#3A3A5C] text-[#6B6B8A] bg-transparent'
                }`}>
                  {step > s.id ? '✓' : s.id}
                </div>
                <span className={`text-[11px] font-mono uppercase tracking-[0.06em] hidden sm:block transition-colors ${
                  step >= s.id ? 'text-[#B8B8D4]' : 'text-[#3A3A5C]'
                }`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px transition-all duration-500 ${
                  step > s.id ? 'bg-[#00D4AA]' : 'bg-[#1C1C36]'
                }`} />
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="bg-[#0E0E1A]/80 backdrop-blur-md border border-[rgba(255,255,255,0.08)] rounded-2xl p-8"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}>

                <p className="font-mono text-[11px] text-[#00D4AA] uppercase tracking-[0.12em] mb-3">
                  Step 1 of 3
                </p>
                <h1 className="font-display text-[28px] font-bold text-[#F0F0FF] leading-tight mb-3">
                  Ground your AI interviewer
                </h1>
                <p className="text-[#6B6B8A] text-[14px] leading-relaxed mb-8">
                  Upload your resume and every question gets calibrated to your actual background, tech stack, and experience level. Takes 30 seconds.
                </p>

                {/* Upload zone */}
                <div className={`border-2 border-dashed rounded-xl p-8 text-center mb-6 transition-all cursor-pointer ${
                  resumeUploaded
                    ? 'border-[#00D4AA] bg-[#00D4AA]/5'
                    : 'border-[#3A3A5C] hover:border-[#6B6B8A] bg-[#14142A]/50'
                }`}
                  onClick={() => document.getElementById('resume-upload')?.click()}
                >
                  {resumeUploaded ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-[#00D4AA]/20 flex items-center justify-center">
                        <span className="text-[#00D4AA] text-lg">✓</span>
                      </div>
                      <p className="text-[#00D4AA] text-[13px] font-medium">Resume uploaded and parsed</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-[#1C1C36] flex items-center justify-center mb-1">
                        <span className="text-[#6B6B8A] text-xl">↑</span>
                      </div>
                      <p className="text-[#B8B8D4] text-[13px] font-medium">
                        {uploading ? 'Parsing your resume...' : 'Drop your PDF here or click to browse'}
                      </p>
                      <p className="text-[#6B6B8A] text-[11px]">PDF only · Max 10MB</p>
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

                <div className="flex gap-3">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!resumeUploaded}
                    className="flex-1 bg-gradient-to-r from-[#00D4AA] to-[#7B6FFF] text-[#080810] font-semibold border-0 h-11 disabled:opacity-30"
                  >
                    Continue →
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleSkipResume}
                    className="text-[#6B6B8A] hover:text-[#B8B8D4] h-11 px-4"
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="bg-[#0E0E1A]/80 backdrop-blur-md border border-[rgba(255,255,255,0.08)] rounded-2xl p-8"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}>

                <p className="font-mono text-[11px] text-[#00D4AA] uppercase tracking-[0.12em] mb-3">
                  Step 2 of 3
                </p>
                <h1 className="font-display text-[28px] font-bold text-[#F0F0FF] leading-tight mb-3">
                  What are you targeting?
                </h1>
                <p className="text-[#6B6B8A] text-[14px] leading-relaxed mb-6">
                  Your target role shapes the difficulty, topics, and question types the AI generates in every session.
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {ROLES.map((role) => (
                    <button
                      key={role}
                      onClick={() => setTargetRole(role)}
                      className={`px-3 py-2 rounded-lg text-[12px] font-mono border transition-all ${
                        targetRole === role
                          ? 'border-[#00D4AA] bg-[#00D4AA]/10 text-[#00D4AA]'
                          : 'border-[#3A3A5C] text-[#6B6B8A] hover:border-[#6B6B8A] hover:text-[#B8B8D4]'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>

                {/* Custom role input */}
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Or type a custom role..."
                  className="w-full bg-[#14142A] border border-[#3A3A5C] rounded-lg px-4 py-2.5 text-[13px] text-[#F0F0FF] placeholder:text-[#3A3A5C] focus:outline-none focus:border-[#00D4AA] transition-colors mb-6"
                />

                <Button
                  onClick={handleRoleSave}
                  disabled={!targetRole || saving}
                  className="w-full bg-gradient-to-r from-[#00D4AA] to-[#7B6FFF] text-[#080810] font-semibold border-0 h-11"
                >
                  {saving ? 'Saving...' : 'Set target →'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3 — Launch */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="bg-[#0E0E1A]/80 backdrop-blur-md border border-[rgba(0,212,170,0.2)] rounded-2xl p-8 text-center"
                style={{ boxShadow: 'inset 0 1px 0 rgba(0,212,170,0.1), 0 0 40px rgba(0,212,170,0.06)' }}>

                {/* Animated checkmark */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00D4AA] to-[#7B6FFF] flex items-center justify-center mx-auto mb-6"
                >
                  <span className="text-[#080810] text-2xl font-bold">✓</span>
                </motion.div>

                <p className="font-mono text-[11px] text-[#00D4AA] uppercase tracking-[0.12em] mb-3">
                  Setup complete
                </p>
                <h1 className="font-display text-[28px] font-bold text-[#F0F0FF] leading-tight mb-3">
                  Your session is calibrated
                </h1>
                <p className="text-[#6B6B8A] text-[14px] leading-relaxed mb-8">
                  Target: <span className="text-[#B8B8D4] font-medium">{targetRole}</span>.{' '}
                  Your AI interviewer is ready. The first session will establish your baseline score and identify improvement areas.
                </p>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleFinish}
                    className="w-full bg-gradient-to-r from-[#00D4AA] to-[#7B6FFF] text-[#080810] font-semibold border-0 h-12 text-[15px]"
                  >
                    Start first interview →
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleGoToDashboard}
                    className="w-full border-[#3A3A5C] text-[#B8B8D4] hover:text-[#F0F0FF] hover:border-[#6B6B8A] bg-transparent h-11 text-[14px]"
                  >
                    Skip to Dashboard →
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
