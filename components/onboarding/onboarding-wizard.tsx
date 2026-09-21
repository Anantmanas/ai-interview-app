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
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-6">
      <div className="w-full max-w-[560px]">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.06em] ${
                  i === step ? 'text-[#818cf8]' : i < step ? 'text-[#4f46e5]' : 'text-[#1e1e2f]'
                }`}
              >
                <div className={`h-1.5 w-1.5 rounded-full ${
                  i === step ? 'bg-[#818cf8]' : i < step ? 'bg-[#4f46e5]' : 'bg-[#1e1e2f]'
                }`} />
              </div>
            ))}
          </div>
          <div className="h-1 bg-[#1e1e2f] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#4f46e5] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          <p className="font-mono text-[10px] text-[#64748b] mt-2 text-right uppercase tracking-[0.06em]">
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
            className="bg-[#09090e] border border-[#1e1e2f] rounded-[8px] shadow-[0_0_50px_rgba(79,70,229,0.08)] p-8"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-[#4f46e5]/15 border border-[#4f46e5]/30 flex items-center justify-center">
                <StepIcon className="h-5 w-5 text-[#818cf8]" />
              </div>
              <div>
                <p className="font-mono text-[10px] text-[#818cf8] uppercase tracking-[0.15em]">
                  // ONBOARDING
                </p>
                <h2 className="font-display text-[20px] font-bold text-white leading-tight">
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
                        ? 'border-[#4f46e5] bg-[#4f46e5]/15 text-[#818cf8]'
                        : 'border-[#1e1e2f] text-[#9ca3af] hover:border-[#3730a3] hover:text-white'
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
                <p className="font-mono text-[11px] text-[#64748b] mb-4 uppercase tracking-[0.06em]">
                  Select up to 5 companies
                </p>
                <div className="flex flex-wrap gap-2">
                  {COMPANIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleCompany(c)}
                      className={`px-3 py-1.5 rounded-[4px] border font-mono text-[12px] transition-all ${
                        selectedCompanies.includes(c)
                          ? 'border-[#4f46e5] bg-[#4f46e5]/15 text-[#818cf8]'
                          : 'border-[#1e1e2f] text-[#9ca3af] hover:border-[#3730a3] hover:text-white'
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
                        ? 'border-[#4f46e5] bg-[#4f46e5]/15 text-[#818cf8]'
                        : 'border-[#1e1e2f] text-[#9ca3af] hover:border-[#3730a3] hover:text-white'
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
                <div className="h-16 w-16 rounded-full bg-[#4f46e5]/15 border border-[#4f46e5]/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-[#818cf8]" />
                </div>
                <p className="font-body text-[15px] text-[#9ca3af] mb-2">
                  Profile set up. Ready to practice as a{' '}
                  <strong className="text-white">{selectedRole}</strong>.
                </p>
                {selectedCompanies.length > 0 && (
                  <p className="font-mono text-[12px] text-[#64748b]">
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
                className="flex items-center gap-2 px-4 py-2 border border-[#1e1e2f] hover:border-[#3730a3] text-[#9ca3af] hover:text-white font-mono text-[11px] uppercase tracking-[0.06em] rounded-[6px] transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-[#000000]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>

              {step < STEPS.length - 1 ? (
                <motion.button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canAdvance()}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#4f46e5] text-white font-mono text-[12px] font-bold uppercase tracking-[0.06em] rounded-[6px] border border-[#3730a3] hover:bg-[#5865f2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-[0_0_20px_rgba(79,70,229,0.35)]"
                >
                  Continue
                  <ArrowRight className="h-3.5 w-3.5" />
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleFinish}
                  disabled={saving}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#4f46e5] text-white font-mono text-[12px] font-bold uppercase tracking-[0.06em] rounded-[6px] border border-[#3730a3] hover:bg-[#5865f2] disabled:opacity-50 transition-colors shadow-[0_0_20px_rgba(79,70,229,0.35)]"
                >
                  {saving ? 'Setting up...' : 'Start First Interview →'}
                </motion.button>
              )}
            </div>

            {/* Skip */}
            {step < STEPS.length - 1 && (
              <button
                onClick={() => setStep(STEPS.length - 1)}
                className="w-full mt-3 font-mono text-[10px] text-[#64748b] hover:text-[#9ca3af] uppercase tracking-[0.08em] transition-colors"
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
