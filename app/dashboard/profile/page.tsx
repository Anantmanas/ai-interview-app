'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { MacTrafficLights } from '@/components/ui/terminal-card'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [targetCompanies, setTargetCompanies] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('mid')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
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
          setTargetCompanies(Array.isArray(data.target_companies) ? data.target_companies.join(', ') : '')
          setExperienceLevel(data.experience_level || 'mid')
        }
      }
      setIsLoading(false)
    }
    fetchProfile()
  }, [supabase])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to save profile')
        return
      }

      const companiesList = targetCompanies
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim() || null,
          target_role: targetRole.trim() || null,
          target_companies: companiesList.length > 0 ? companiesList : null,
          experience_level: experienceLevel || 'mid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) {
        toast.error(`Failed to save: ${error.message}`)
        return
      }

      setProfile((prev: any) => ({
        ...prev,
        full_name: fullName.trim() || null,
        target_role: targetRole.trim() || null,
        target_companies: companiesList,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-[#818cf8]" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <p className="font-mono text-[11px] text-[#818cf8] uppercase tracking-[0.15em] mb-1 font-semibold">// CANDIDATE CONFIG</p>
        <h1 className="font-display text-[32px] font-bold text-white leading-[1.1] tracking-[-0.02em]">Profile</h1>
        <p className="font-body text-[14px] text-[#9ca3af] mt-1">
          Manage your target engineering goals and personal details for AI customization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Personal Details Terminal Window */}
        <div className="md:col-span-2 space-y-6">
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

                <div>
                  <label htmlFor="targetRole" className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-[0.08em] block mb-1.5 font-semibold">
                    Target Role
                  </label>
                  <input
                    id="targetRole"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Frontend Engineer, Full Stack Engineer"
                    className="bg-[#050508] border border-[#1e2030] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]/40 rounded-lg px-3.5 py-2.5 text-[13px] text-white placeholder:text-[#64748b] focus:outline-none transition-all w-full font-mono"
                  />
                </div>

                <div>
                  <label htmlFor="targetCompanies" className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-[0.08em] block mb-1.5 font-semibold">
                    Target Companies (comma separated)
                  </label>
                  <input
                    id="targetCompanies"
                    value={targetCompanies}
                    onChange={(e) => setTargetCompanies(e.target.value)}
                    placeholder="Google, Meta, Amazon, Stripe"
                    className="bg-[#050508] border border-[#1e2030] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]/40 rounded-lg px-3.5 py-2.5 text-[13px] text-white placeholder:text-[#64748b] focus:outline-none transition-all w-full font-mono"
                  />
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
                  {(fullName ? 50 : 0) + (targetRole ? 50 : 0)}%
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

                <div className="space-y-1.5 pt-1">
                  <div className="h-2 w-full bg-[#050508] rounded-full overflow-hidden border border-[#1e2030]">
                    <div
                      className="h-full bg-gradient-to-r from-[#4f46e5] to-[#818cf8] transition-all duration-300 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                      style={{
                        width: `${(fullName ? 50 : 0) + (targetRole ? 50 : 0)}%`,
                      }}
                    />
                  </div>
                  <p className="font-mono text-[10px] text-[#64748b] text-right">
                    Calibration score: {(fullName ? 50 : 0) + (targetRole ? 50 : 0)} / 100
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
