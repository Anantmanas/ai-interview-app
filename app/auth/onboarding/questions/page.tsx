'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ResumeDropzone } from '@/components/resume/resume-dropzone'
import { useResume } from '@/components/resume/resume-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles, Loader2, CheckCircle2, ArrowRight, Briefcase, X, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { LandingBackground } from '@/components/ui/landing-background'

const DEFAULT_POPULAR_ROLES = [
  'Full Stack Developer',
  'Frontend Engineer',
  'Backend Engineer',
  'AI / ML Engineer',
  'DevOps Engineer',
  'Software Engineer',
  'Mobile Developer',
  'Data Engineer',
]

const MAX_ROLES = 3

export default function QuestionsPage() {
  const router = useRouter()
  const { isResumeReady, resumeData, isExtracting } = useResume()
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [inputRole, setInputRole] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_POPULAR_ROLES)
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [loading, setLoading] = useState(false)

  // Auto-fill initial role from resume if available
  useEffect(() => {
    if (resumeData?.targetRole && selectedRoles.length === 0) {
      setSelectedRoles([resumeData.targetRole])
    }
  }, [resumeData?.targetRole, selectedRoles.length])

  // Fetch AI Role Suggestions whenever resume data changes or on initial mount
  useEffect(() => {
    let isMounted = true

    async function fetchSuggestions() {
      setIsSuggesting(true)
      try {
        const res = await fetch('/api/ai/suggest-roles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            skills: resumeData?.skills || [],
            summary: resumeData?.summary || '',
          }),
        })

        if (res.ok && isMounted) {
          const data = await res.json()
          if (Array.isArray(data.roles) && data.roles.length > 0) {
            setSuggestions(data.roles)
            if (selectedRoles.length === 0 && data.recommended) {
              setSelectedRoles([data.recommended])
            }
          }
        }
      } catch (err) {
        console.warn('[onboarding] failed to fetch AI role suggestions:', err)
      } finally {
        if (isMounted) setIsSuggesting(false)
      }
    }

    void fetchSuggestions()
    return () => {
      isMounted = false
    }
  }, [resumeData])

  const toggleRole = (role: string) => {
    const trimmed = role.trim()
    if (!trimmed) return

    if (selectedRoles.some((r) => r.toLowerCase() === trimmed.toLowerCase())) {
      // Remove role
      setSelectedRoles((prev) => prev.filter((r) => r.toLowerCase() !== trimmed.toLowerCase()))
    } else {
      // Add role if under limit
      if (selectedRoles.length >= MAX_ROLES) return
      setSelectedRoles((prev) => [...prev, trimmed])
    }
  }

  const handleAddCustomRole = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = inputRole.trim()
    if (!trimmed) return

    if (selectedRoles.length >= MAX_ROLES) return

    if (!selectedRoles.some((r) => r.toLowerCase() === trimmed.toLowerCase())) {
      setSelectedRoles((prev) => [...prev, trimmed])
    }
    setInputRole('')
  }

  const removeRole = (roleToRemove: string) => {
    setSelectedRoles((prev) => prev.filter((r) => r.toLowerCase() !== roleToRemove.toLowerCase()))
  }

  const handleFinish = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const finalRoleString = selectedRoles.length > 0 ? selectedRoles.join(', ') : 'Software Engineer'

      await supabase
        .from('profiles')
        .update({ target_role: finalRoleString })
        .eq('id', user.id)

      // Send welcoming email to user
      try {
        await fetch('/api/emails/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Engineer',
          }),
        })
      } catch (emailErr) {
        console.warn('Welcome email trigger notice:', emailErr)
      }

      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#000000] text-white flex items-center justify-center p-4 relative overflow-hidden">
      <LandingBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-2xl bg-[#0a0a0f]/90 border border-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6"
      >
        {/* Header */}
        <div className="border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-[#6366f1] animate-pulse" />
            <p className="font-mono text-[11px] text-[#818cf8] uppercase tracking-[0.2em]">
              // STEP 2: PROFILE CONFIGURATION
            </p>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Target Roles & Setup
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Select up to 3 target roles for calibrated AI interview simulations.
          </p>
        </div>

        {/* Resume Dropzone */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
            Resume Document (Optional)
          </label>
          <ResumeDropzone source="onboarding" />
          <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
            <span className="flex items-center gap-1.5">
              {isResumeReady ? (
                <span className="text-emerald-400 inline-flex items-center gap-1 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Resume Parsed & Grounded
                </span>
              ) : isExtracting ? (
                <span className="text-indigo-400 inline-flex items-center gap-1">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing resume with AI...
                </span>
              ) : (
                'Upload a PDF to automatically calibrate your interview questions'
              )}
            </span>
          </div>
        </div>

        {/* Selected Roles Badges Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <span>Selected Target Roles</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                selectedRoles.length >= MAX_ROLES
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              }`}>
                {selectedRoles.length} / {MAX_ROLES} Selected
              </span>
            </label>
            <span className="text-[11px] text-indigo-400 flex items-center gap-1 font-medium">
              <Sparkles className="h-3 w-3" />
              {isSuggesting ? 'Analyzing...' : 'Free AI Suggestions'}
            </span>
          </div>

          {/* Active Selected Chips */}
          <div className="min-h-[46px] p-2 bg-[#12121a]/80 border border-white/10 rounded-xl flex flex-wrap items-center gap-2">
            <AnimatePresence>
              {selectedRoles.length === 0 ? (
                <span className="text-xs text-neutral-500 px-2 py-1">
                  No roles selected yet. Click suggestions below or type a custom role.
                </span>
              ) : (
                selectedRoles.map((role) => (
                  <motion.div
                    key={role}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white text-xs font-medium pl-3 pr-1.5 py-1.5 rounded-lg border border-indigo-400/40 shadow-sm shadow-indigo-500/20 group"
                  >
                    <span>{role}</span>
                    <button
                      type="button"
                      onClick={() => removeRole(role)}
                      className="p-1 hover:bg-white/20 rounded-md transition-colors text-white/80 hover:text-white"
                      title="Remove role"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Custom Input Field with Add Button */}
          <form onSubmit={handleAddCustomRole} className="flex gap-2">
            <Input
              value={inputRole}
              onChange={(e) => setInputRole(e.target.value)}
              disabled={selectedRoles.length >= MAX_ROLES}
              placeholder={
                selectedRoles.length >= MAX_ROLES
                  ? 'Maximum 3 roles selected (remove one to add another)'
                  : 'Type a custom role (e.g. Cloud Engineer) & press Enter...'
              }
              className="bg-[#12121a] border-white/10 text-white placeholder:text-neutral-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 h-11 text-sm px-3.5 rounded-xl disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={!inputRole.trim() || selectedRoles.length >= MAX_ROLES}
              className="h-11 px-4 rounded-xl bg-[#1f1f30] hover:bg-indigo-600 text-white border border-white/10 flex items-center gap-1.5 shrink-0 transition-colors disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </Button>
          </form>

          {/* AI Role Suggestions Pills */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-neutral-400 font-mono flex items-center gap-1.5">
                <span>AI SUGGESTIONS (CLICK TO SELECT / DESELECT):</span>
                {isSuggesting && <Loader2 className="h-2.5 w-2.5 animate-spin text-indigo-400" />}
              </p>
              {selectedRoles.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedRoles([])}
                  className="text-[11px] text-neutral-400 hover:text-rose-400 font-mono transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {suggestions.map((role) => {
                  const isSelected = selectedRoles.some((r) => r.toLowerCase() === role.toLowerCase())
                  const isDisabled = !isSelected && selectedRoles.length >= MAX_ROLES

                  return (
                    <motion.button
                      key={role}
                      type="button"
                      whileHover={isDisabled ? {} : { scale: 1.02 }}
                      whileTap={isDisabled ? {} : { scale: 0.98 }}
                      onClick={() => !isDisabled && toggleRole(role)}
                      disabled={isDisabled}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600/90 border-indigo-400 text-white font-medium shadow-md shadow-indigo-500/20'
                          : isDisabled
                            ? 'bg-[#12121a]/50 border-white/5 text-neutral-600 cursor-not-allowed'
                            : 'bg-[#161622]/80 hover:bg-[#1f1f30] border-white/10 text-neutral-300 hover:text-white hover:border-indigo-500/40'
                      }`}
                    >
                      <span>{role}</span>
                      {isSelected ? (
                        <X className="h-3 w-3 text-white/80 hover:text-white ml-0.5" />
                      ) : (
                        <Plus className="h-3 w-3 text-neutral-500 opacity-60 group-hover:opacity-100" />
                      )}
                    </motion.button>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4 border-t border-white/10">
          <Button
            onClick={handleFinish}
            disabled={loading || isExtracting || selectedRoles.length === 0}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 h-11 rounded-xl font-medium shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 group disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <span>Complete Setup ({selectedRoles.length})</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </main>
  )
}
