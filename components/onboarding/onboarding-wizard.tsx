'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, ArrowRight, ArrowLeft, Mic, Upload, Target, Building2 } from 'lucide-react'

const TARGET_ROLES = ['SDE-1 (Junior)', 'SDE-2 (Mid)', 'Senior Engineer', 'Staff Engineer', 'Engineering Manager']
const COMPANIES = ['Google', 'Meta', 'Amazon', 'Apple', 'Microsoft', 'Flipkart', 'Swiggy', 'Zepto', 'Series A Startup', 'MNC India']
const INTERVIEW_TYPES = [
  { id: 'dsa', label: 'DSA / Algorithms', icon: '🧮' },
  { id: 'system_design', label: 'System Design', icon: '🏗️' },
  { id: 'behavioral', label: 'Behavioral', icon: '🤝' },
  { id: 'frontend', label: 'Frontend', icon: '🖥️' },
  { id: 'backend', label: 'Backend', icon: '⚙️' },
]

const STEPS = [
  { id: 'role', title: 'What role are you targeting?', icon: Target },
  { id: 'companies', title: 'Which companies?', icon: Building2 },
  { id: 'interview_type', title: 'Start with which interview type?', icon: Mic },
  { id: 'done', title: "You're all set!", icon: CheckCircle },
]

export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [selectedType, setSelectedType] = useState('')
  const [saving, setSaving] = useState(false)

  const toggleCompany = (c: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : prev.length < 5 ? [...prev, c] : prev
    )
  }

  const handleFinish = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase.from('profiles').update({
        target_role: selectedRole,
        target_companies: selectedCompanies,
        onboarding_complete: true,
        onboarding_step: 4,
      }).eq('id', user.id)
    }

    // Send welcome email
    try {
      const { data: profile } = await supabase.from('profiles').select('email, full_name').eq('id', user!.id).single()
      await fetch('/api/emails/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile?.email ?? user?.email, fullName: profile?.full_name }),
      })
    } catch { /* non-fatal */ }

    router.push(selectedType ? `/interview/new?type=${selectedType}` : '/dashboard')
  }

  const canAdvance = () => {
    if (step === 0) return !!selectedRole
    if (step === 1) return selectedCompanies.length > 0
    if (step === 2) return !!selectedType
    return true
  }

  const StepIcon = STEPS[step].icon

  return (
    <div className="min-h-screen bg-[#04040b] flex items-center justify-center p-6">
      <div className="w-full max-w-[560px]">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.06em] ${
                  i === step ? 'text-[#71d083]' : i < step ? 'text-[#366740]' : 'text-[#2b292d]'
                }`}
              >
                <div className={`h-1.5 w-1.5 rounded-full ${
                  i === step ? 'bg-[#71d083]' : i < step ? 'bg-[#366740]' : 'bg-[#2b292d]'
                }`} />
              </div>
            ))}
          </div>
          <div className="h-1 bg-[#2b292d] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#71d083] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          <p className="font-mono text-[10px] text-[#49474e] mt-2 text-right uppercase tracking-[0.06em]">
            Step {step + 1} of {STEPS.length}
          </p>
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#0c0c10] border border-[#2b292d] rounded-[8px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] p-8"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-[#71d083]/10 border border-[#71d083]/20 flex items-center justify-center">
                <StepIcon className="h-5 w-5 text-[#71d083]" />
              </div>
              <div>
                <p className="font-mono text-[10px] text-[#71d083] uppercase tracking-[0.15em]">
                  // ONBOARDING
                </p>
                <h2 className="font-display text-[20px] font-bold text-[#e5e5e5] leading-tight">
                  {STEPS[step].title}
                </h2>
              </div>
            </div>

            {/* Step content */}
            {step === 0 && (
              <div className="grid grid-cols-1 gap-2">
                {TARGET_ROLES.map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`text-left px-4 py-3 rounded-[6px] border font-mono text-[13px] transition-all ${
                      selectedRole === role
                        ? 'border-[#71d083] bg-[#71d083]/10 text-[#71d083]'
                        : 'border-[#2b292d] text-[#7c7a85] hover:border-[#4b494e] hover:text-[#e5e5e5]'
                    }`}
                  >
                    {role}
                    {selectedRole === role && <span className="float-right">✓</span>}
                  </button>
                ))}
              </div>
            )}

            {step === 1 && (
              <div>
                <p className="font-mono text-[11px] text-[#49474e] mb-4 uppercase tracking-[0.06em]">
                  Select up to 5 companies
                </p>
                <div className="flex flex-wrap gap-2">
                  {COMPANIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleCompany(c)}
                      className={`px-3 py-1.5 rounded-[4px] border font-mono text-[12px] transition-all ${
                        selectedCompanies.includes(c)
                          ? 'border-[#71d083] bg-[#71d083]/10 text-[#71d083]'
                          : 'border-[#2b292d] text-[#7c7a85] hover:border-[#4b494e]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 gap-2">
                {INTERVIEW_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedType(t.id)}
                    className={`flex items-center gap-3 text-left px-4 py-3 rounded-[6px] border font-mono text-[13px] transition-all ${
                      selectedType === t.id
                        ? 'border-[#71d083] bg-[#71d083]/10 text-[#71d083]'
                        : 'border-[#2b292d] text-[#7c7a85] hover:border-[#4b494e] hover:text-[#e5e5e5]'
                    }`}
                  >
                    <span className="text-lg">{t.icon}</span>
                    {t.label}
                    {selectedType === t.id && <span className="ml-auto">✓</span>}
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="text-center py-4">
                <div className="h-16 w-16 rounded-full bg-[#71d083]/10 border border-[#71d083]/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-[#71d083]" />
                </div>
                <p className="font-body text-[15px] text-[#7c7a85] mb-2">
                  Profile set up. Ready to practice as a{' '}
                  <strong className="text-[#e5e5e5]">{selectedRole}</strong>.
                </p>
                {selectedCompanies.length > 0 && (
                  <p className="font-mono text-[12px] text-[#49474e]">
                    Targeting: {selectedCompanies.join(', ')}
                  </p>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => step > 0 ? setStep(s => s - 1) : undefined}
                disabled={step === 0}
                className="flex items-center gap-2 px-4 py-2 border border-[#2b292d] hover:border-[#4b494e] text-[#7c7a85] hover:text-[#e5e5e5] font-mono text-[11px] uppercase tracking-[0.06em] rounded-[6px] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>

              {step < STEPS.length - 1 ? (
                <motion.button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canAdvance()}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#71d083] text-[#04040b] font-mono text-[12px] font-bold uppercase tracking-[0.06em] rounded-[6px] border border-[#366740] hover:bg-[#82dba2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
                >
                  Continue
                  <ArrowRight className="h-3.5 w-3.5" />
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleFinish}
                  disabled={saving}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#71d083] text-[#04040b] font-mono text-[12px] font-bold uppercase tracking-[0.06em] rounded-[6px] border border-[#366740] hover:bg-[#82dba2] disabled:opacity-50 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
                >
                  {saving ? 'Setting up...' : 'Start First Interview →'}
                </motion.button>
              )}
            </div>

            {/* Skip */}
            {step < STEPS.length - 1 && (
              <button
                onClick={() => setStep(STEPS.length - 1)}
                className="w-full mt-3 font-mono text-[10px] text-[#49474e] hover:text-[#7c7a85] uppercase tracking-[0.08em] transition-colors"
              >
                Skip setup →
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
