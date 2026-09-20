'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function ProfilePage() {
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
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-[#a855f7]" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <p className="font-mono text-[11px] text-[#c084fc] uppercase tracking-[0.15em] mb-1 font-semibold">// CANDIDATE CONFIG</p>
        <h1 className="font-display text-[32px] font-bold text-[#fdfcff] leading-[1.1] tracking-[-0.02em]">Profile</h1>
        <p className="font-body text-[14px] text-[#c8c0e0] mt-1">
          Manage your target engineering goals and personal details for AI customization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Profile Form */}
          <div className="card-console">
            <div className="p-5 border-b border-[#291a45]">
              <p className="font-mono text-[11px] text-[#fdfcff] uppercase tracking-[0.08em] font-semibold">Personal Details</p>
              <p className="font-body text-[13px] text-[#948bb0] mt-1">
                Your target role and companies help the AI generate relevant interview questions.
              </p>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="font-mono text-[10px] text-[#c8c0e0] uppercase tracking-[0.08em] block mb-1.5 font-semibold">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="bg-[#140e24] border border-[#291a45] rounded-[6px] px-3.5 py-2.5 text-[14px] text-[#f5f3ff] placeholder:text-[#50446b] focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7]/40 transition-colors w-full font-body"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="font-mono text-[10px] text-[#c8c0e0] uppercase tracking-[0.08em] block mb-1.5 font-semibold">
                    Email Address
                  </label>
                  <input
                    id="email"
                    value={profile?.email || ''}
                    readOnly
                    className="bg-[#0d0918] border border-[#291a45] rounded-[6px] px-3.5 py-2.5 text-[14px] text-[#50446b] cursor-not-allowed w-full font-body"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="targetRole" className="font-mono text-[10px] text-[#c8c0e0] uppercase tracking-[0.08em] block mb-1.5 font-semibold">
                  Target Role
                </label>
                <input
                  id="targetRole"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Senior Frontend Engineer"
                  className="bg-[#140e24] border border-[#291a45] rounded-[6px] px-3.5 py-2.5 text-[14px] text-[#f5f3ff] placeholder:text-[#50446b] focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7]/40 transition-colors w-full font-body"
                />
              </div>
              <div>
                <label htmlFor="targetCompanies" className="font-mono text-[10px] text-[#c8c0e0] uppercase tracking-[0.08em] block mb-1.5 font-semibold">
                  Target Companies (comma separated)
                </label>
                <input
                  id="targetCompanies"
                  value={targetCompanies}
                  onChange={(e) => setTargetCompanies(e.target.value)}
                  placeholder="Google, Meta, Amazon, Stripe"
                  className="bg-[#140e24] border border-[#291a45] rounded-[6px] px-3.5 py-2.5 text-[14px] text-[#f5f3ff] placeholder:text-[#50446b] focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7]/40 transition-colors w-full font-body"
                />
              </div>
              <div className="pt-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-neo-violet font-mono text-[12px] font-bold uppercase tracking-[0.05em] px-8 py-2.5 rounded-[6px] cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving Profile...</span>
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

        <div className="space-y-6">
          <div className="card-console">
            <div className="p-5 border-b border-[#291a45]">
              <p className="font-mono text-[11px] text-[#fdfcff] uppercase tracking-[0.08em] font-semibold">Profile Completion</p>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[13px] font-body">
                  <span className="text-[#c8c0e0]">Full Name</span>
                  {fullName ? (
                    <span className="flex items-center gap-1 font-mono text-[11px] text-[#c084fc]">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Done
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] text-[#f87171]">Missing</span>
                  )}
                </div>
                <div className="flex justify-between items-center text-[13px] font-body">
                  <span className="text-[#c8c0e0]">Target Role Set</span>
                  {targetRole ? (
                    <span className="flex items-center gap-1 font-mono text-[11px] text-[#c084fc]">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Done
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] text-[#948bb0]">Not set</span>
                  )}
                </div>
                <div className="h-2 w-full bg-[#140e24] rounded-full overflow-hidden border border-[#291a45]">
                  <div
                    className="h-full bg-gradient-to-r from-[#9333ea] to-[#c084fc] transition-all duration-300"
                    style={{
                      width: `${(fullName ? 50 : 0) + (targetRole ? 50 : 0)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
