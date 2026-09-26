'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  CheckCircle2,
  Loader2,
  Save,
  X,
  Plus,
  Sparkles,
  Building2,
  Trash2,
  AlertTriangle,
  Mail,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { MacTrafficLights } from '@/components/ui/terminal-card'
import { motion, AnimatePresence } from 'motion/react'

const COMPANY_SUGGESTIONS_BY_ROLE: Record<string, string[]> = {
  ai: ['OpenAI', 'Google DeepMind', 'Anthropic', 'NVIDIA', 'Meta', 'Microsoft', 'Scale AI', 'Databricks', 'Palantir'],
  frontend: ['Google', 'Meta', 'Stripe', 'Netflix', 'Amazon', 'Vercel', 'Airbnb', 'Uber', 'Figma', 'Shopify'],
  backend: ['Amazon AWS', 'Google Cloud', 'Microsoft Azure', 'Datadog', 'Cloudflare', 'HashiCorp', 'Stripe', 'Netflix', 'Snowflake'],
  devops: ['AWS', 'Google Cloud', 'Microsoft', 'Datadog', 'Cloudflare', 'HashiCorp', 'Red Hat', 'GitLab'],
  mobile: ['Apple', 'Google', 'Meta', 'Uber', 'Spotify', 'Snap', 'Robinhood', 'Coinbase', 'Duolingo'],
  fintech: ['Stripe', 'Coinbase', 'Robinhood', 'Goldman Sachs', 'Bloomberg', 'PayPal', 'Block (Square)', 'Ramp'],
  default: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Stripe', 'OpenAI', 'Uber', 'Airbnb'],
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [targetCompanies, setTargetCompanies] = useState<string[]>([])
  const [companyInput, setCompanyInput] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('mid')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // ── Delete Account & Data Modal State ──
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteCode, setDeleteCode] = useState('')
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [codeSent, setCodeSent] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (data) {
          setProfile(data)
          setFullName(data.full_name || '')
          setTargetRole(data.target_role || '')
          if (Array.isArray(data.target_companies)) {
            setTargetCompanies(data.target_companies)
          } else if (typeof data.target_companies === 'string' && data.target_companies.trim()) {
            setTargetCompanies(data.target_companies.split(',').map((c: string) => c.trim()).filter(Boolean))
          }
          setExperienceLevel(data.experience_level || 'mid')
        }
      }
      setIsLoading(false)
    }
    fetchProfile()
  }, [supabase])

  // Compute smart suggested companies based on the current target role
  const suggestedCompanies = useMemo(() => {
    const roleLower = targetRole.toLowerCase()
    if (roleLower.includes('ai') || roleLower.includes('ml') || roleLower.includes('machine learning') || roleLower.includes('data')) {
      return COMPANY_SUGGESTIONS_BY_ROLE.ai
    }
    if (roleLower.includes('front') || roleLower.includes('react') || roleLower.includes('ui') || roleLower.includes('web')) {
      return COMPANY_SUGGESTIONS_BY_ROLE.frontend
    }
    if (roleLower.includes('devops') || roleLower.includes('cloud') || roleLower.includes('sre') || roleLower.includes('infrastructure')) {
      return COMPANY_SUGGESTIONS_BY_ROLE.devops
    }
    if (roleLower.includes('back') || roleLower.includes('distributed') || roleLower.includes('system') || roleLower.includes('node') || roleLower.includes('python')) {
      return COMPANY_SUGGESTIONS_BY_ROLE.backend
    }
    if (roleLower.includes('ios') || roleLower.includes('android') || roleLower.includes('mobile') || roleLower.includes('flutter')) {
      return COMPANY_SUGGESTIONS_BY_ROLE.mobile
    }
    if (roleLower.includes('fintech') || roleLower.includes('quant') || roleLower.includes('crypto')) {
      return COMPANY_SUGGESTIONS_BY_ROLE.fintech
    }
    return COMPANY_SUGGESTIONS_BY_ROLE.default
  }, [targetRole])

  const toggleCompany = (company: string) => {
    const trimmed = company.trim()
    if (!trimmed) return

    if (targetCompanies.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setTargetCompanies((prev) => prev.filter((c) => c.toLowerCase() !== trimmed.toLowerCase()))
    } else {
      setTargetCompanies((prev) => [...prev, trimmed])
    }
  }

  const handleAddCompany = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = companyInput.trim()
    if (!trimmed) return

    if (!targetCompanies.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setTargetCompanies((prev) => [...prev, trimmed])
    }
    setCompanyInput('')
  }

  const removeCompany = (companyToRemove: string) => {
    setTargetCompanies((prev) => prev.filter((c) => c.toLowerCase() !== companyToRemove.toLowerCase()))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to save profile')
        return
      }

      // Try updating with target_companies
      const updatePayload: any = {
        full_name: fullName.trim() || null,
        target_role: targetRole.trim() || null,
        target_companies: targetCompanies.length > 0 ? targetCompanies : null,
        experience_level: experienceLevel || 'mid',
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id)

      if (error) {
        // If column is missing in schema, fallback update without target_companies and notify user
        if (error.message.includes('target_companies')) {
          const { error: fallbackError } = await supabase
            .from('profiles')
            .update({
              full_name: fullName.trim() || null,
              target_role: targetRole.trim() || null,
              experience_level: experienceLevel || 'mid',
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)

          if (!fallbackError) {
            toast.warning('Profile saved, but please run the SQL migration in Supabase to enable target companies column.')
            return
          }
        }
        toast.error(`Failed to save: ${error.message}`)
        return
      }

      setProfile((prev: any) => ({
        ...prev,
        full_name: fullName.trim() || null,
        target_role: targetRole.trim() || null,
        target_companies: targetCompanies,
        experience_level: experienceLevel,
      }))

      toast.success('Profile saved successfully')
      try {
        router.refresh()
      } catch {}
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  // ── Send Email Confirmation Code for Deletion ──
  const handleSendDeleteCode = async () => {
    setIsSendingCode(true)
    try {
      const res = await fetch('/api/auth/delete-account/send-code', {
        method: 'POST',
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send confirmation code')
      }

      setCodeSent(true)
      toast.success(data.message || `Confirmation code sent to ${profile?.email}`)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send verification code')
    } finally {
      setIsSendingCode(false)
    }
  }

  // ── Verify Code & Permanently Purge Account ──
  const handleVerifyAndDelete = async () => {
    if (!deleteCode.trim() || deleteCode.trim().length !== 6) {
      toast.error('Please enter the 6-digit confirmation code from your email')
      return
    }

    setIsDeleting(true)
    try {
      const res = await fetch('/api/auth/delete-account/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: deleteCode.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete account')
      }

      toast.success('Account and all associated data permanently deleted.')

      // Clear local storage and caches
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }

      // Sign out on client
      await supabase.auth.signOut()

      // Redirect to Home Page
      setShowDeleteModal(false)
      window.location.href = '/'
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete account')
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-[#818cf8]" />
      </div>
    )
  }

  const calibrationScore = (fullName ? 35 : 0) + (targetRole ? 35 : 0) + (targetCompanies.length > 0 ? 30 : 0)

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-16 font-sans">
      <div>
        <p className="font-mono text-[11px] text-[#818cf8] uppercase tracking-[0.15em] mb-1 font-semibold">// CANDIDATE CONFIG</p>
        <h1 className="font-display text-[28px] sm:text-[32px] font-bold text-white leading-[1.1] tracking-[-0.02em]">Profile</h1>
        <p className="font-body text-[13px] sm:text-[14px] text-[#9ca3af] mt-1">
          Manage your target engineering goals, calibration settings, and account controls.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Details Terminal Window */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-[#1e2030] bg-[#09090f] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden">
            {/* macOS Titlebar */}
            <div className="flex items-center justify-between px-4 h-10 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
              <div className="flex items-center gap-3">
                <MacTrafficLights size="sm" />
                <span className="font-mono text-[11px] text-[#9ca3af] font-medium tracking-wide">
                  candidate-profile.cfg — bash
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  CONFIG ACTIVE
                </span>
              </div>
            </div>

            {/* Terminal Command Cue */}
            <div className="px-5 py-2.5 border-b border-[#1e2030]/40 bg-[#0c0d15]/50 flex items-center gap-2 font-mono text-[12px]">
              <span className="text-[#38bdf8] font-semibold">engineer@interviewai</span>
              <span className="text-[#94a3b8]">:</span>
              <span className="text-[#818cf8]">~/.config</span>
              <span className="text-[#f8fafc]">$</span>
              <span className="text-[#22c55e]">edit profile.env</span>
              <span className="inline-block w-1.5 h-3.5 bg-[#f8fafc] animate-pulse ml-0.5" />
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              <div>
                <p className="font-mono text-[11px] text-white uppercase tracking-[0.08em] font-semibold">
                  Personal Details
                </p>
                <p className="font-body text-[13px] text-[#9ca3af] mt-1">
                  Your target role and companies calibrate the AI evaluation parameters and questions.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-[0.08em] block mb-1.5 font-semibold">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Anant Manas"
                      className="bg-[#050508] border border-[#1e2030] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]/40 rounded-lg px-3.5 py-2.5 text-[13px] text-white placeholder:text-[#64748b] focus:outline-none transition-all w-full font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-[0.08em] block mb-1.5 font-semibold">
                      Email Address
                    </label>
                    <input
                      id="email"
                      value={profile?.email || ''}
                      readOnly
                      className="bg-[#0c0d15] border border-[#1e2030]/60 rounded-lg px-3.5 py-2.5 text-[13px] text-[#64748b] cursor-not-allowed w-full font-mono"
                    />
                  </div>
                </div>

                {/* Target Role Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="targetRole" className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-[0.08em] block font-semibold">
                      Target Role
                    </label>
                    <span className="text-[11px] text-[#818cf8] flex items-center gap-1 font-mono">
                      <Sparkles className="h-3 w-3" />
                      Popular Roles
                    </span>
                  </div>
                  <input
                    id="targetRole"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Frontend Engineer, Full Stack Engineer"
                    className="bg-[#050508] border border-[#1e2030] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]/40 rounded-lg px-3.5 py-2.5 text-[13px] text-white placeholder:text-[#64748b] focus:outline-none transition-all w-full font-mono"
                  />
                  {/* Role suggestions chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      'Full Stack Developer',
                      'Frontend Engineer',
                      'Backend Engineer',
                      'AI / ML Engineer',
                      'DevOps Engineer',
                      'Mobile Developer',
                      'Data Engineer',
                      'Cloud Architect',
                    ].map((role) => {
                      const isSelected = targetRole.toLowerCase().includes(role.toLowerCase())
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setTargetRole(role)}
                          className={`font-mono text-[11px] px-2.5 py-1 rounded-md border transition-all cursor-pointer flex items-center gap-1 ${
                            isSelected
                              ? 'bg-[#4f46e5] border-[#6366f1] text-white font-semibold shadow-sm'
                              : 'bg-[#0c0d15] hover:bg-[#1e2030] border-[#1e2030] text-[#9ca3af] hover:text-white'
                          }`}
                        >
                          <span>{role}</span>
                          {isSelected ? (
                            <CheckCircle2 className="h-2.5 w-2.5 text-white/90" />
                          ) : (
                            <Plus className="h-2.5 w-2.5 text-[#64748b]" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Target Companies Tag Selector */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-[0.08em] block font-semibold">
                      Target Companies ({targetCompanies.length} selected)
                    </label>
                    <span className="text-[11px] text-[#818cf8] flex items-center gap-1 font-mono">
                      <Sparkles className="h-3 w-3" />
                      Role-Tailored Suggestions
                    </span>
                  </div>

                  {/* Selected Companies Badge Box */}
                  <div className="min-h-[44px] p-2 bg-[#050508] border border-[#1e2030] rounded-lg flex flex-wrap items-center gap-1.5">
                    <AnimatePresence>
                      {targetCompanies.length === 0 ? (
                        <span className="text-xs text-[#64748b] px-2 py-1 font-mono">
                          No companies selected yet. Click suggestions below or type a company name.
                        </span>
                      ) : (
                        targetCompanies.map((company) => (
                          <motion.span
                            key={company}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="inline-flex items-center gap-1.5 bg-[#4f46e5]/20 border border-[#6366f1]/40 text-[#c7d2fe] text-[12px] font-mono pl-2.5 pr-1 py-1 rounded-md group"
                          >
                            <span>{company}</span>
                            <button
                              type="button"
                              onClick={() => removeCompany(company)}
                              className="p-0.5 hover:bg-[#6366f1]/30 rounded text-[#9ca3af] hover:text-white transition-colors"
                              title="Remove"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </motion.span>
                        ))
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Input to add custom company */}
                  <form onSubmit={handleAddCompany} className="flex gap-2">
                    <input
                      value={companyInput}
                      onChange={(e) => setCompanyInput(e.target.value)}
                      placeholder="Add company (e.g. Tesla, Netflix, Stripe) & press Enter..."
                      className="bg-[#050508] border border-[#1e2030] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]/40 rounded-lg px-3.5 py-2 text-[13px] text-white placeholder:text-[#64748b] focus:outline-none transition-all w-full font-mono"
                    />
                    <button
                      type="submit"
                      disabled={!companyInput.trim()}
                      className="px-3.5 py-2 rounded-lg bg-[#1e2030] hover:bg-[#6366f1] text-white font-mono text-xs flex items-center gap-1 shrink-0 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </button>
                  </form>

                  {/* Suggestions Chips */}
                  <div className="space-y-1.5 pt-1">
                    <p className="font-mono text-[10px] text-[#64748b] uppercase tracking-wider flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-[#818cf8]" />
                      <span>SUGGESTED FOR YOUR ROLE (CLICK TO TOGGLE):</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedCompanies.map((company) => {
                        const isSelected = targetCompanies.some((c) => c.toLowerCase() === company.toLowerCase())
                        return (
                          <button
                            key={company}
                            type="button"
                            onClick={() => toggleCompany(company)}
                            className={`font-mono text-[11px] px-2.5 py-1 rounded-md border transition-all cursor-pointer flex items-center gap-1 ${
                              isSelected
                                ? 'bg-[#4f46e5] border-[#6366f1] text-white font-semibold shadow-sm'
                                : 'bg-[#0c0d15] hover:bg-[#1e2030] border-[#1e2030] text-[#9ca3af] hover:text-white'
                            }`}
                          >
                            <span>{company}</span>
                            {isSelected ? (
                              <X className="h-2.5 w-2.5 text-white/80" />
                            ) : (
                              <Plus className="h-2.5 w-2.5 text-[#64748b]" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1e2030]/60 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-[#64748b]">
                    Status: <span className="text-[#22c55e]">synced</span>
                  </span>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-neo-violet font-mono text-[12px] font-bold uppercase tracking-[0.05em] px-6 py-2.5 rounded-md cursor-pointer disabled:opacity-50 inline-flex items-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all hover:scale-[1.02]"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Completion Terminal Window */}
        <div className="space-y-6">
          <div className="rounded-xl border border-[#1e2030] bg-[#09090f] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden">
            {/* macOS Titlebar */}
            <div className="flex items-center justify-between px-4 h-10 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
              <div className="flex items-center gap-3">
                <MacTrafficLights size="sm" />
                <span className="font-mono text-[11px] text-[#9ca3af] font-medium tracking-wide">
                  readiness-audit.sh — zsh
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#818cf8] bg-[#818cf8]/10 border border-[#818cf8]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  AUDIT
                </span>
              </div>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] text-white uppercase tracking-[0.08em] font-semibold">
                  Profile Completion
                </p>
                <span className="font-mono text-[12px] font-bold text-[#818cf8]">
                  {calibrationScore}%
                </span>
              </div>

              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-[13px] font-mono bg-[#0c0d15] border border-[#1e2030] p-2.5 rounded-md">
                  <span className="text-[#9ca3af]">Full Name</span>
                  {fullName ? (
                    <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#22c55e]">
                      <CheckCircle2 className="h-3.5 w-3.5" /> DONE
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] text-[#f87171]">MISSING</span>
                  )}
                </div>

                <div className="flex justify-between items-center text-[13px] font-mono bg-[#0c0d15] border border-[#1e2030] p-2.5 rounded-md">
                  <span className="text-[#9ca3af]">Target Role Set</span>
                  {targetRole ? (
                    <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#22c55e]">
                      <CheckCircle2 className="h-3.5 w-3.5" /> DONE
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] text-[#64748b]">NOT SET</span>
                  )}
                </div>

                <div className="flex justify-between items-center text-[13px] font-mono bg-[#0c0d15] border border-[#1e2030] p-2.5 rounded-md">
                  <span className="text-[#9ca3af]">Target Companies</span>
                  {targetCompanies.length > 0 ? (
                    <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#22c55e]">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {targetCompanies.length} SET
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] text-[#64748b]">OPTIONAL</span>
                  )}
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="h-2 w-full bg-[#050508] rounded-full overflow-hidden border border-[#1e2030]">
                    <div
                      className="h-full bg-gradient-to-r from-[#4f46e5] to-[#818cf8] transition-all duration-300 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                      style={{
                        width: `${calibrationScore}%`,
                      }}
                    />
                  </div>
                  <p className="font-mono text-[10px] text-[#64748b] text-right">
                    Calibration score: {calibrationScore} / 100
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DANGER ZONE: ACCOUNT DELETION & DATA PURGE ── */}
      <div className="rounded-xl border border-rose-500/30 bg-[#0c090a] shadow-[0_8px_32px_rgba(244,63,94,0.1),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden">
        {/* macOS Titlebar */}
        <div className="flex items-center justify-between px-4 h-10 border-b border-rose-500/20 bg-[#160b0d] select-none">
          <div className="flex items-center gap-3">
            <MacTrafficLights size="sm" />
            <span className="font-mono text-[11px] text-rose-300 font-medium tracking-wide">
              danger-zone::purge-account.sh — root
            </span>
          </div>
          <span className="font-mono text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold flex items-center gap-1">
            <ShieldAlert className="h-3 w-3" />
            DANGER ZONE
          </span>
        </div>

        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-rose-400" />
              Delete Account & Purge Data
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Permanently delete your user profile, interview history, weakness evaluations, custom roadmaps, and resume files from the database. Requires 6-digit confirmation code sent to your email.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowDeleteModal(true)
              setCodeSent(false)
              setDeleteCode('')
            }}
            className="px-5 py-2.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 border border-rose-500/50 hover:border-rose-500 text-rose-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-rose-900/20 cursor-pointer shrink-0"
          >
            Delete Account...
          </button>
        </div>
      </div>

      {/* ── DELETE ACCOUNT CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-[#0a0a0f] border border-rose-500/40 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.9),0_0_30px_rgba(244,63,94,0.15)] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 h-11 border-b border-[#1e2030] bg-[#11121b]/90">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                  <span className="font-mono text-xs text-rose-300 font-bold uppercase tracking-wider">
                    Confirm Account Purge
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-rose-200 leading-relaxed font-sans">
                      This action is <strong>irreversible</strong>. All your interview recordings, scores, roadmap milestones, and account records will be permanently deleted from the database.
                    </p>
                  </div>
                </div>

                {/* Step 1: Send Verification Code */}
                <div className="space-y-2 bg-[#050508] border border-[#1e2030] rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-indigo-400" />
                      1. Email Confirmation Code
                    </span>
                    {codeSent && (
                      <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                        CODE SENT
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-300 font-mono">
                    Send to: <span className="text-white font-semibold">{profile?.email}</span>
                  </p>

                  <button
                    type="button"
                    onClick={handleSendDeleteCode}
                    disabled={isSendingCode}
                    className="w-full mt-2 py-2 rounded-lg bg-[#1a1b2e] hover:bg-[#252745] border border-indigo-500/30 hover:border-indigo-500/60 text-indigo-200 font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSendingCode ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Sending 6-Digit Code...</span>
                      </>
                    ) : codeSent ? (
                      <>
                        <span>Resend Verification Code</span>
                      </>
                    ) : (
                      <>
                        <span>Send 6-Digit Verification Code</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Step 2: Enter 6-Digit Code */}
                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">
                    2. Enter 6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={deleteCode}
                    onChange={(e) => setDeleteCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 849201"
                    disabled={!codeSent}
                    className="w-full h-12 bg-[#050508] border border-[#1e2030] focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40 rounded-xl px-4 text-center font-mono text-xl tracking-[0.3em] text-white placeholder:text-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  />
                </div>

                {/* Modal Footer Controls */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#1e2030]">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeleting}
                    className="px-4 py-2.5 rounded-lg border border-[#1e2030] text-neutral-400 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleVerifyAndDelete}
                    disabled={isDeleting || !codeSent || deleteCode.length !== 6}
                    className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:hover:bg-rose-600 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Purging All Data...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Permanently Delete Account</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
