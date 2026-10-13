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
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null)

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
          const metaCompanies = user.user_metadata?.target_companies
          if (Array.isArray(metaCompanies) && metaCompanies.length > 0) {
            setTargetCompanies(metaCompanies)
          } else if (Array.isArray(data.target_companies)) {
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

      // 1. Persist target_companies to user metadata
      try {
        await supabase.auth.updateUser({
          data: {
            target_companies: targetCompanies,
            target_role: targetRole.trim() || undefined,
            full_name: fullName.trim() || undefined,
          },
        })
      } catch {}

      // 2. Try updating profiles table with target_companies
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
        // If column is missing in profiles schema, update core profile fields without target_companies
        const { error: fallbackError } = await supabase
          .from('profiles')
          .update({
            full_name: fullName.trim() || null,
            target_role: targetRole.trim() || null,
            experience_level: experienceLevel || 'mid',
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)

        if (fallbackError) {
          toast.error(`Failed to save: ${fallbackError.message}`)
          return
        }
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
    setDevCodeHint(null)
    try {
      const res = await fetch('/api/auth/delete-account/send-code', {
        method: 'POST',
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send confirmation code')
      }

      setCodeSent(true)
      if (data.devCode) {
        setDevCodeHint(data.devCode)
      }
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
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-8 pb-32 font-sans">
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 mb-1.5 font-mono text-[11px] text-[#8052ff] uppercase tracking-[0.18em] font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-[#8052ff] shadow-[0_0_8px_#8052ff]" />
          <span>CANDIDATE CONFIG // CALIBRATION & TELEMETRY</span>
        </div>
        <h1 className="font-display text-[28px] sm:text-[34px] font-normal text-white leading-[1.1] tracking-[-0.03em]">
          Profile Calibration
        </h1>
        <p className="font-sans text-[13px] sm:text-[14px] text-zinc-400 mt-1.5 font-light">
          Manage your target engineering goals, calibration settings, and account controls.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Details Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden font-sans">
            {/* Dala Titlebar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02] select-none flex-wrap gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="h-2 w-2 rounded-full bg-[#8052ff] shadow-[0_0_8px_#8052ff]" />
                <span className="font-mono text-[11px] text-white/70 font-semibold tracking-wider uppercase truncate">
                  candidate-profile.cfg
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-[10px] text-[#15846e] bg-[#15846e]/20 border border-[#15846e]/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                  CONFIG ACTIVE
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-7 space-y-6">
              <div>
                <p className="font-mono text-[11px] text-white uppercase tracking-[0.08em] font-semibold">
                  Personal Details
                </p>
                <p className="font-sans text-[13px] text-zinc-400 mt-1">
                  Your target role and companies calibrate the AI evaluation parameters and questions.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="font-mono text-[10px] text-white/50 uppercase tracking-[0.08em] block mb-1.5 font-semibold">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Anant Manas"
                      className="bg-white/[0.03] border border-white/10 focus:border-[#8052ff] rounded-full px-4 py-2.5 text-[13px] text-white placeholder:text-white/30 focus:outline-none transition-all w-full font-mono"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="email" className="font-mono text-[10px] text-white/50 uppercase tracking-[0.08em] font-semibold">
                        Email Address
                      </label>
                      {profile?.email && (
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(profile.email)
                            toast.success('Email copied to clipboard')
                          }}
                          className="font-mono text-[10px] text-[#8052ff] hover:text-white transition-colors cursor-pointer"
                        >
                          Copy
                        </button>
                      )}
                    </div>
                    <div className="bg-white/[0.03] border border-white/10 rounded-full px-4 py-2.5 text-[12px] sm:text-[13px] text-white/70 font-mono break-all select-all flex items-center justify-between gap-2 min-h-[42px]">
                      <span>{profile?.email || 'No email attached'}</span>
                      <span className="text-[9px] font-mono text-[#15846e] uppercase shrink-0 font-semibold">VERIFIED</span>
                    </div>
                  </div>
                </div>

                {/* Target Role Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="targetRole" className="font-mono text-[10px] text-white/50 uppercase tracking-[0.08em] block font-semibold">
                      Target Role
                    </label>
                    <span className="text-[11px] text-[#8052ff] flex items-center gap-1 font-mono font-medium">
                      <Sparkles className="h-3 w-3" />
                      Popular Roles
                    </span>
                  </div>
                  <input
                    id="targetRole"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Frontend Engineer, Full Stack Engineer"
                    className="bg-white/[0.03] border border-white/10 focus:border-[#8052ff] rounded-full px-4 py-2.5 text-[13px] text-white placeholder:text-white/30 focus:outline-none transition-all w-full font-mono"
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
                          className={`font-mono text-[11px] px-3 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#8052ff] border-[#8052ff] text-white font-semibold'
                              : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 text-white/60 hover:text-white'
                          }`}
                        >
                          <span>{role}</span>
                          {isSelected ? (
                            <CheckCircle2 className="h-2.5 w-2.5 text-white/90" />
                          ) : (
                            <Plus className="h-2.5 w-2.5 text-white/40" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Target Companies Tag Selector */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-[10px] text-white/50 uppercase tracking-[0.08em] block font-semibold">
                      Target Companies ({targetCompanies.length} selected)
                    </label>
                    <span className="text-[11px] text-[#8052ff] flex items-center gap-1 font-mono font-medium">
                      <Sparkles className="h-3 w-3" />
                      Role-Tailored Suggestions
                    </span>
                  </div>

                  {/* Selected Companies Badge Box */}
                  <div className="min-h-[44px] p-2 bg-white/[0.02] border border-white/10 rounded-2xl flex flex-wrap items-center gap-1.5">
                    <AnimatePresence>
                      {targetCompanies.length === 0 ? (
                        <span className="text-xs text-white/40 px-2 py-1 font-mono">
                          No companies selected yet. Click suggestions below or type a company name.
                        </span>
                      ) : (
                        targetCompanies.map((company) => (
                          <motion.span
                            key={company}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="inline-flex items-center gap-1.5 bg-[#8052ff]/15 border border-[#8052ff]/30 text-white text-[12px] font-mono pl-3 pr-1.5 py-1 rounded-full group font-medium"
                          >
                            <span>{company}</span>
                            <button
                              type="button"
                              onClick={() => removeCompany(company)}
                              className="p-0.5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors cursor-pointer"
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
                      className="bg-white/[0.03] border border-white/10 focus:border-[#8052ff] rounded-full px-4 py-2 text-[12px] text-white placeholder:text-white/30 focus:outline-none transition-all w-full font-mono"
                    />
                    <button
                      type="submit"
                      disabled={!companyInput.trim()}
                      className="px-4 py-2 rounded-full bg-white/5 hover:bg-[#8052ff] border border-white/10 hover:border-[#8052ff] text-white font-mono text-xs font-semibold flex items-center gap-1 shrink-0 transition-all disabled:opacity-40 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </button>
                  </form>

                  {/* Suggestions Chips */}
                  <div className="space-y-1.5 pt-1">
                    <p className="font-mono text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1 font-semibold">
                      <Building2 className="h-3 w-3 text-[#8052ff]" />
                      <span>SUGGESTED FOR YOUR ROLE (CLICK TO TOGGLE):</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5 pr-14 sm:pr-0">
                      {suggestedCompanies.map((company) => {
                        const isSelected = targetCompanies.some((c) => c.toLowerCase() === company.toLowerCase())
                        return (
                          <button
                            key={company}
                            type="button"
                            onClick={() => toggleCompany(company)}
                            className={`font-mono text-[11px] px-3 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-[#8052ff] border-[#8052ff] text-white font-semibold'
                                : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 text-white/60 hover:text-white'
                            }`}
                          >
                            <span>{company}</span>
                            {isSelected ? (
                              <X className="h-2.5 w-2.5 text-white/80" />
                            ) : (
                              <Plus className="h-2.5 w-2.5 text-white/40" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-white/40">
                    Status: <span className="text-[#15846e] font-semibold">synced</span>
                  </span>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-dala-primary px-6 py-2.5 rounded-full text-xs font-mono font-semibold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
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

        {/* Right Column: Profile Readiness Card */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden font-sans">
            {/* Dala Titlebar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02] select-none">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-[#8052ff] shadow-[0_0_8px_#8052ff]" />
                <span className="font-mono text-[11px] text-white/70 font-semibold tracking-wider uppercase">
                  readiness-audit.sh
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#8052ff] bg-[#8052ff]/20 border border-[#8052ff]/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                  AUDIT
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-7 space-y-6">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] text-white uppercase tracking-[0.08em] font-semibold">
                  Profile Completion
                </p>
                <span className="font-display text-2xl font-light text-[#8052ff]">
                  {calibrationScore}%
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-[13px] font-mono bg-white/[0.02] border border-white/10 p-3 rounded-2xl">
                  <span className="text-zinc-400">Full Name</span>
                  {fullName ? (
                    <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#15846e] font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" /> DONE
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] text-[#ffb829] font-semibold">MISSING</span>
                  )}
                </div>

                <div className="flex justify-between items-center text-[13px] font-mono bg-white/[0.02] border border-white/10 p-3 rounded-2xl">
                  <span className="text-zinc-400">Target Role Set</span>
                  {targetRole ? (
                    <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#15846e] font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" /> DONE
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] text-zinc-500">NOT SET</span>
                  )}
                </div>

                <div className="flex justify-between items-center text-[13px] font-mono bg-white/[0.02] border border-white/10 p-3 rounded-2xl">
                  <span className="text-zinc-400">Target Companies</span>
                  {targetCompanies.length > 0 ? (
                    <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#15846e] font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {targetCompanies.length} SET
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] text-zinc-500">OPTIONAL</span>
                  )}
                </div>

                <div className="space-y-2 pt-2">
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-[#8052ff] to-[#a78bfa] transition-all duration-300"
                      style={{
                        width: `${calibrationScore}%`,
                      }}
                    />
                  </div>
                  <p className="font-mono text-[10px] text-zinc-400 text-right font-medium">
                    Calibration score: {calibrationScore} / 100
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DANGER ZONE: ACCOUNT DELETION & DATA PURGE ── */}
      <div className="rounded-3xl border border-rose-500/20 bg-rose-950/[0.08] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden font-sans">
        {/* Titlebar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-500/20 bg-rose-500/[0.03] select-none">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
            <span className="font-mono text-[11px] text-rose-300 font-semibold tracking-wider uppercase">
              danger-zone::purge-account
            </span>
          </div>
          <span className="font-mono text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold flex items-center gap-1">
            <ShieldAlert className="h-3 w-3" />
            DANGER ZONE
          </span>
        </div>

        <div className="p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <h3 className="font-mono text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-rose-400" />
              Delete Account & Purge Data
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans font-light">
              Permanently delete your candidate profile, interview recordings, weakness evaluations, custom roadmaps, and resume files. Requires a 6-digit confirmation code sent to your email.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowDeleteModal(true)
              setCodeSent(false)
              setDeleteCode('')
            }}
            className="px-5 py-2.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 hover:border-rose-500/60 text-rose-300 hover:text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shrink-0"
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
              className="w-full max-w-md bg-[#0a0a0a]/95 backdrop-blur-2xl border border-rose-500/30 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.9),0_0_40px_rgba(244,63,94,0.15)] overflow-hidden font-sans"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-rose-500/20 bg-rose-500/[0.04]">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                  <span className="font-mono text-xs text-rose-300 font-semibold uppercase tracking-wider">
                    Confirm Account Purge
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-200 leading-relaxed font-sans">
                    This action is <strong>irreversible</strong>. All your interview recordings, scores, roadmap milestones, and account records will be permanently deleted from the database.
                  </p>
                </div>

                {/* Step 1: Send Verification Code */}
                <div className="space-y-2 bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-[#8052ff]" />
                      1. Email Confirmation Code
                    </span>
                    {codeSent && (
                      <span className="font-mono text-[10px] text-[#15846e] bg-[#15846e]/20 border border-[#15846e]/40 px-2 py-0.5 rounded-full font-semibold">
                        CODE SENT
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-300 font-mono">
                    Send to: <span className="text-white font-semibold">{profile?.email}</span>
                  </p>

                  <button
                    type="button"
                    onClick={handleSendDeleteCode}
                    disabled={isSendingCode}
                    className="w-full mt-2 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
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

                  {devCodeHint && (
                    <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300 text-xs font-mono flex items-center justify-between">
                      <span>Testing Code: <strong className="text-white tracking-widest text-sm">{devCodeHint}</strong></span>
                      <button
                        type="button"
                        onClick={() => setDeleteCode(devCodeHint)}
                        className="text-[10px] text-[#8052ff] hover:text-white underline cursor-pointer"
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}
                </div>

                {/* Step 2: Enter 6-Digit Code */}
                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block">
                    2. Enter 6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={deleteCode}
                    onChange={(e) => setDeleteCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 849201"
                    disabled={!codeSent}
                    className="w-full h-12 bg-white/[0.03] border border-white/10 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40 rounded-full px-4 text-center font-mono text-xl tracking-[0.3em] text-white placeholder:text-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  />
                </div>

                {/* Modal Footer Controls */}
                <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeleting}
                    className="px-5 py-2.5 rounded-full border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleVerifyAndDelete}
                    disabled={isDeleting || !codeSent || deleteCode.length !== 6}
                    className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:hover:bg-rose-600 text-white font-mono text-xs font-semibold uppercase tracking-wider shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Purging All Data...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Permanently Delete</span>
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
