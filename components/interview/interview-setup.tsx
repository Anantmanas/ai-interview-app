'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Profile, InterviewType, Difficulty } from '@/lib/types'
import { useResume } from '@/components/resume/resume-provider'
import { SkillIcon } from '@/components/resume/skill-icon'
import { ResumeDropzone } from '@/components/resume/resume-dropzone'
import { 
  Code, 
  Users, 
  Network, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Target, 
  Check, 
  Terminal, 
  Layers, 
  CheckCircle2, 
  Clock, 
  FileCheck2,
  Cpu
} from 'lucide-react'

interface InterviewSetupProps {
  profile: Profile | null
  existingCount?: number
}

const COMMON_ROLES = [
  'Full Stack Developer',
  'Frontend Engineer',
  'Backend Engineer',
  'Software Engineer',
  'Distributed Systems Architect',
  'AI / ML Engineer',
  'DevOps & Cloud Engineer',
  'Mobile Developer (iOS/Android)',
]

const TYPE_OPTIONS: { id: InterviewType; label: string; desc: string; icon: any; recommendedFor: string[] }[] = [
  {
    id: 'technical',
    label: 'Algorithms & Data Structures',
    desc: 'Algorithmic reasoning, time/space complexity analysis, and real-time Monaco IDE compilation.',
    icon: Code,
    recommendedFor: ['software engineer', 'full stack developer'],
  },
  {
    id: 'coding',
    label: 'Hands-on Live Coding',
    desc: 'Practical programming challenges, modular function implementation, and edge-case execution.',
    icon: Terminal,
    recommendedFor: ['frontend engineer', 'full stack developer', 'mobile developer'],
  },
  {
    id: 'system_design',
    label: 'Distributed Architecture',
    desc: 'Scalability, microservices, partitioning, database trade-offs, and high-throughput system design.',
    icon: Network,
    recommendedFor: ['backend engineer', 'distributed systems architect', 'devops & cloud engineer'],
  },
  {
    id: 'behavioral',
    label: 'Staff Leadership & STAR',
    desc: 'Engineering leadership, conflict resolution, technical debt management, and architectural trade-offs.',
    icon: Users,
    recommendedFor: ['senior', 'staff', 'lead'],
  },
  {
    id: 'mixed',
    label: 'Mixed Comprehensive Simulation',
    desc: 'Holistic 15-minute simulation blending technical architecture, problem solving, and behavioral leadership.',
    icon: Layers,
    recommendedFor: ['full stack developer', 'software engineer'],
  },
]

const DIFFICULTY_OPTIONS: { id: Difficulty; label: string; level: string; desc: string }[] = [
  {
    id: 'easy',
    label: 'Junior',
    level: 'L3 / Junior Engineer',
    desc: 'Foundational data structures, clean code syntax, and standard algorithmic patterns.',
  },
  {
    id: 'medium',
    label: 'Mid-Level',
    level: 'L4 - L5 / Mid-Level',
    desc: 'System edge cases, concurrency, API contracts, and practical performance trade-offs.',
  },
  {
    id: 'hard',
    label: 'Senior',
    level: 'L6+ / Senior & Staff',
    desc: 'Complex distributed consensus, extreme scale, architectural failure recovery, and trade-offs.',
  },
]

const STORAGE_KEY = 'interviewai_setup_selections'

interface SavedSelections {
  role?: string
  difficulty?: Difficulty
  type?: InterviewType
  selectedFocus?: string[]
}

function getStoredSelections(): SavedSelections {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveSelections(data: SavedSelections) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

export function InterviewSetup({ profile, existingCount = 0 }: InterviewSetupProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paramTopic = searchParams.get('topic') || searchParams.get('role') || ''
  const isRetry = searchParams.get('retry') === 'true'
  const paramType = searchParams.get('type') as InterviewType | null
  const paramDifficulty = searchParams.get('difficulty') as Difficulty | null

  const { resumeData, isResumeReady } = useResume()

  // 1. Determine Inferred Role from Resume
  const inferredRole = useMemo(() => {
    if (paramTopic) return paramTopic
    if (resumeData?.targetRole && resumeData.targetRole.trim()) {
      return resumeData.targetRole.trim()
    }
    const skills = (resumeData?.skills || []).map((s) => s.toLowerCase())
    const hasFront = skills.some((s) => ['react', 'next.js', 'vue', 'angular', 'javascript', 'typescript', 'tailwind'].includes(s))
    const hasBack = skills.some((s) => ['node.js', 'python', 'go', 'golang', 'java', 'sql', 'postgresql', 'mongodb', 'docker'].includes(s))
    if (hasFront && hasBack) return 'Full Stack Developer'
    if (hasFront) return 'Frontend Engineer'
    if (hasBack) return 'Backend Engineer'
    if (skills.some((s) => ['aws', 'kubernetes', 'docker', 'terraform', 'ci/cd'].includes(s))) return 'DevOps & Cloud Engineer'
    return profile?.target_role || 'Software Engineer'
  }, [resumeData, profile, paramTopic])

  // Saved selections initialization
  const initialSaved = useMemo(() => getStoredSelections(), [])

  // Wizard Step: 1 = Role, 2 = Seniority, 3 = Simulation Path & Focus, 4 = 15-Minute Preview & Launch
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  // Form State
  const [role, setRole] = useState(() => paramTopic || initialSaved.role || inferredRole)
  const [isRoleInferred, setIsRoleInferred] = useState(() => !paramTopic && !initialSaved.role && Boolean(resumeData?.targetRole || resumeData?.skills?.length))
  const [type, setType] = useState<InterviewType>(() => paramType || initialSaved.type || 'technical')
  const [difficulty, setDifficulty] = useState<Difficulty>(() => paramDifficulty || initialSaved.difficulty || 'medium')
  const [selectedFocus, setSelectedFocus] = useState<string[]>(() => initialSaved.selectedFocus || [])
  const [isCustomRoleInput, setIsCustomRoleInput] = useState(false)
  const [loading, setLoading] = useState(false)

  // Auto-sync inferred role on first load if user has not manually customized
  useEffect(() => {
    if (!initialSaved.role && inferredRole && inferredRole !== role) {
      setRole(inferredRole)
      setIsRoleInferred(true)
    }
  }, [inferredRole, initialSaved.role, role])

  // Persist selections
  useEffect(() => {
    saveSelections({
      role,
      difficulty,
      type,
      selectedFocus,
    })
  }, [role, difficulty, type, selectedFocus])

  // Session Title calculation
  const defaultSessionName = useMemo(() => {
    if (paramTopic) return `Targeted: ${paramTopic}`
    return `Mock_Session ${String(existingCount + 1).padStart(2, '0')}`
  }, [paramTopic, existingCount])

  const [title, setTitle] = useState(defaultSessionName)
  const [showCustomTitle, setShowCustomTitle] = useState(Boolean(paramTopic))

  // Inferred available skills from resume for focus selection (max 8)
  const availableSkills = useMemo(() => {
    const raw = resumeData?.skills || []
    return raw.slice(0, 10)
  }, [resumeData])

  const toggleFocus = (skill: string) => {
    setSelectedFocus((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill].slice(0, 4)
    )
  }

  // Handle final simulation launch
  const handleStartInterview = async () => {
    setLoading(true)
    try {
      const sessionTitle = title.trim() || defaultSessionName
      const targetRoleValue = role.trim() || profile?.target_role || 'Software Engineer'

      const res = await fetch('/api/interviews/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: sessionTitle,
          type,
          difficulty,
          target_role: targetRoleValue,
          focus_areas: selectedFocus,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok && data?.interview?.id) {
        router.push(`/interview/${data.interview.id}`)
        return
      }

      // Fallback
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const effectiveUserId = user?.id || profile?.id

      if (!effectiveUserId) {
        toast.error('Session expired. Please log in again.')
        router.push('/auth/login')
        return
      }

      const { data: interview, error } = await supabase
        .from('interviews')
        .insert({
          user_id: effectiveUserId,
          title: sessionTitle,
          type,
          difficulty,
          target_role: targetRoleValue,
          status: 'in_progress',
        })
        .select()
        .single()

      if (error) {
        throw new Error(error.message || 'Failed to initialize interview database record')
      }

      router.push(`/interview/${interview.id}`)
    } catch (err: any) {
      console.error('Failed to create interview:', err)
      toast.error(err.message || 'Could not start interview. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Targeted Re-test Notification Banner */}
      {isRetry && (
        <div className="rounded-2xl border border-[#8052ff]/40 bg-[#8052ff]/10 p-4 sm:p-5 flex items-center justify-between gap-4 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#8052ff]/20 flex items-center justify-center text-[#8052ff] shrink-0 border border-[#8052ff]/30">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="font-mono text-xs font-semibold text-white uppercase tracking-wider">
                Targeted Blindspot Re-test Session
              </p>
              <p className="font-sans text-xs text-zinc-300 font-light mt-0.5">
                Calibrating targeted 15-minute simulation for <strong className="text-white font-medium">{role || 'selected role'}</strong>. Review parameters or jump directly to launch.
              </p>
            </div>
          </div>
          <span className="font-mono text-[10px] text-[#15846e] bg-[#15846e]/10 border border-[#15846e]/30 px-3 py-1 rounded-full uppercase tracking-wider font-semibold shrink-0 hidden sm:inline-block">
            RE-TEST ACTIVE
          </span>
        </div>
      )}

      {/* Cockpit Card Container */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Titlebar Header with Step Progress */}
        <div className="flex items-center justify-between px-6 sm:px-10 h-16 border-b border-white/10 bg-white/[0.02] select-none">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#8052ff] shadow-[0_0_8px_#8052ff]" />
            <span className="font-mono text-xs text-zinc-400 font-medium tracking-[0.16em] uppercase">
              CALIBRATION WIZARD // STEP 0{step} OF 04
            </span>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStep(s as any)}
                aria-label={`Jump to step ${s}`}
                className={`w-7 h-1.5 rounded-full transition-all cursor-pointer ${
                  step === s
                    ? 'bg-[#8052ff] shadow-[0_0_8px_#8052ff]'
                    : step > s
                    ? 'bg-white/40'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-10 lg:p-12 space-y-10">
          {/* STEP 1: ROLE & GROUNDING */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffb829]" />
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#ffb829]">
                    STEP 01 — TARGET ROLE & DOMAIN
                  </span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl text-white font-normal tracking-[-0.035em]">
                  What role are you practicing for?
                </h1>
                <p className="font-sans text-sm text-zinc-400 font-light max-w-xl">
                  Questions and architectural trade-offs will calibrate directly to this engineering domain.
                </p>
              </div>

              {/* Inferred Status Indicator */}
              {isResumeReady && (
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-[#ffb829] shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase font-semibold text-[#15846e] tracking-wider bg-[#15846e]/10 border border-[#15846e]/30 px-2 py-0.5 rounded-full">
                          RESUME GROUNDED
                        </span>
                        {isRoleInferred && (
                          <span className="font-mono text-[10px] uppercase text-[#ffb829] tracking-wider">
                            Auto-Inferred
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-300 mt-1">
                        Active Profile: <strong className="text-white">{resumeData?.name || 'Candidate'}</strong>
                        {resumeData?.skills?.length ? ` (${resumeData.skills.length} technical skills verified)` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    Pre-selected: <span className="text-white font-medium">{role}</span>
                  </span>
                </div>
              )}

              {/* Role Selection Pills */}
              <div className="space-y-3">
                <label className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-300 block">
                  Select or Edit Target Engineering Domain
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {COMMON_ROLES.map((r) => {
                    const isSelected = role.toLowerCase() === r.toLowerCase()
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setRole(r)
                          setIsRoleInferred(false)
                          setIsCustomRoleInput(false)
                        }}
                        className={`p-4 rounded-2xl text-left font-mono text-xs transition-all flex items-center justify-between border cursor-pointer ${
                          isSelected
                            ? 'bg-[#8052ff]/15 border-[#8052ff] text-white shadow-[0_0_20px_rgba(128,82,255,0.25)]'
                            : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/10 text-zinc-300'
                        }`}
                      >
                        <span className="font-sans text-sm font-medium">{r}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#8052ff]" />}
                      </button>
                    )
                  })}
                </div>

                {/* Custom Role Input */}
                <div className="pt-2">
                  {!isCustomRoleInput && !COMMON_ROLES.some((r) => r.toLowerCase() === role.toLowerCase()) ? (
                    <div className="bg-white/[0.02] border border-[#8052ff] rounded-2xl p-4 flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{role}</span>
                      <button
                        type="button"
                        onClick={() => setIsCustomRoleInput(true)}
                        className="text-xs font-mono text-[#8052ff] hover:underline cursor-pointer uppercase"
                      >
                        Edit Role
                      </button>
                    </div>
                  ) : isCustomRoleInput ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => {
                          setRole(e.target.value)
                          setIsRoleInferred(false)
                        }}
                        placeholder="e.g. SRE / Cloud Architect"
                        className="flex-1 bg-white/[0.02] border border-white/10 focus:border-[#8052ff] rounded-2xl px-4 py-3 text-sm font-mono text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomRoleInput(false)}
                        className="btn-dala-secondary px-5 py-3 cursor-pointer text-xs font-mono"
                      >
                        Set
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsCustomRoleInput(true)}
                      className="text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer uppercase tracking-wider"
                    >
                      + Enter Custom Role Title
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SENIORITY */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8052ff]" />
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#8052ff]">
                    STEP 02 — SENIORITY CALIBRATION
                  </span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl text-white font-normal tracking-[-0.035em]">
                  Select your seniority level
                </h1>
                <p className="font-sans text-sm text-zinc-400 font-light max-w-xl">
                  Adjusts the depth of algorithmic complexity, architectural scale, and leadership expectations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {DIFFICULTY_OPTIONS.map((opt) => {
                  const isSelected = difficulty === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDifficulty(opt.id)}
                      className={`p-6 sm:p-7 rounded-3xl text-left transition-all duration-200 border flex flex-col justify-between space-y-4 cursor-pointer ${
                        isSelected
                          ? 'bg-[#8052ff]/10 border-[#8052ff] shadow-[0_0_30px_rgba(128,82,255,0.25)]'
                          : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                          {opt.level}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#8052ff] shadow-[0_0_8px_#8052ff]" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-display text-2xl font-normal text-white tracking-tight">
                          {opt.label}
                        </h3>
                        <p className="font-sans text-xs text-zinc-400 mt-2 leading-relaxed font-light">
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 3: SIMULATION PATH & FOCUS */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#15846e]" />
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#15846e]">
                    STEP 03 — SIMULATION PATH & FOCUS
                  </span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl text-white font-normal tracking-[-0.035em]">
                  Choose your rehearsal path
                </h1>
                <p className="font-sans text-sm text-zinc-400 font-light max-w-xl">
                  Pick the format of the session. Focus areas are dynamically tailored from your background.
                </p>
              </div>

              {/* Simulation Paths */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {TYPE_OPTIONS.map((opt) => {
                  const isSelected = type === opt.id
                  const Icon = opt.icon
                  const isRecommended = opt.recommendedFor.some((rec) => role.toLowerCase().includes(rec))
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setType(opt.id)}
                      className={`p-6 rounded-3xl text-left transition-all duration-200 border flex flex-col justify-between space-y-4 cursor-pointer ${
                        isSelected
                          ? 'bg-[#8052ff]/15 border-[#8052ff] shadow-[0_0_30px_rgba(128,82,255,0.25)]'
                          : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`p-3 rounded-2xl ${
                            isSelected
                              ? 'bg-[#8052ff] text-white shadow-[0_0_15px_rgba(128,82,255,0.5)]'
                              : 'bg-white/[0.04] text-zinc-400'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        {isRecommended && (
                          <span className="text-[10px] font-mono text-[#15846e] bg-[#15846e]/10 border border-[#15846e]/30 px-2.5 py-0.5 rounded-full font-semibold uppercase">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-normal text-white tracking-tight">
                          {opt.label}
                        </h3>
                        <p className="font-sans text-xs text-zinc-400 mt-1.5 leading-relaxed font-light">
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Focus Areas (Inferred from Resume, Avoid Giant Checklist) */}
              {availableSkills.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-300">
                      Relevant Focus Areas (Pick up to 3)
                    </label>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {selectedFocus.length}/3 selected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableSkills.map((skill) => {
                      const isFocused = selectedFocus.includes(skill)
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleFocus(skill)}
                          className={`inline-flex items-center gap-1.5 text-xs font-mono rounded-full px-4 py-1.5 border transition-all cursor-pointer ${
                            isFocused
                              ? 'bg-[#8052ff] text-white border-[#8052ff] shadow-[0_0_12px_rgba(128,82,255,0.4)]'
                              : 'bg-white/[0.03] hover:bg-white/[0.06] text-zinc-300 border-white/10'
                          }`}
                        >
                          <SkillIcon skill={skill} className="w-3.5 h-3.5" size={14} />
                          <span>{skill}</span>
                          {isFocused && <Check className="w-3 h-3 ml-0.5" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: 15-MINUTE REHEARSAL PREVIEW & LAUNCH */}
          {step === 4 && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffb829]" />
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#ffb829]">
                    STEP 04 — REHEARSAL STRUCTURE PREVIEW
                  </span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl text-white font-normal tracking-[-0.035em]">
                  How your 15-minute interview works
                </h1>
                <p className="font-sans text-sm text-zinc-400 font-light max-w-xl">
                  A transparent breakdown of the simulation flow and the evaluation feedback you will receive.
                </p>
              </div>

              {/* 4-Phase Timeline Preview */}
              <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                  <Clock className="w-4 h-4 text-[#8052ff]" />
                  <span className="font-mono text-xs uppercase tracking-widest text-white font-semibold">
                    15-MINUTE TIMED RUNTIME TIMELINE
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1.5">
                    <span className="font-mono text-[10px] text-[#8052ff] uppercase block">
                      01 // 1-2 MIN
                    </span>
                    <h4 className="font-sans text-sm text-white font-medium">Warm-Up</h4>
                    <p className="font-sans text-xs text-zinc-400 font-light leading-relaxed">
                      Baseline problem setup, scope clarification, and constraint definition.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1.5">
                    <span className="font-mono text-[10px] text-[#8052ff] uppercase block">
                      02 // 5-7 MIN
                    </span>
                    <h4 className="font-sans text-sm text-white font-medium">Core Challenge</h4>
                    <p className="font-sans text-xs text-zinc-400 font-light leading-relaxed">
                      Main domain problem: implementation, architecture, or STAR leadership scenario.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1.5">
                    <span className="font-mono text-[10px] text-[#ffb829] uppercase block">
                      03 // 4-5 MIN
                    </span>
                    <h4 className="font-sans text-sm text-white font-medium">Adaptive Probing</h4>
                    <p className="font-sans text-xs text-zinc-400 font-light leading-relaxed">
                      AI probes deeper into your answer: scale, edge cases, failure recovery, and trade-offs.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1.5">
                    <span className="font-mono text-[10px] text-[#15846e] uppercase block">
                      04 // 2-3 MIN
                    </span>
                    <h4 className="font-sans text-sm text-white font-medium">Synthesis & Debrief</h4>
                    <p className="font-sans text-xs text-zinc-400 font-light leading-relaxed">
                      Objective scoring and weakness diagnosis mapped to your learning roadmap.
                    </p>
                  </div>
                </div>
              </div>

              {/* What You Receive Card */}
              <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                  <FileCheck2 className="w-4 h-4 text-[#15846e]" />
                  <span className="font-mono text-xs uppercase tracking-widest text-white font-semibold">
                    YOUR POST-INTERVIEW DELIVERABLES
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#15846e] shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-sans text-sm text-white font-medium">Technical & Problem-Solving Score</h5>
                      <p className="text-xs text-zinc-400 font-light mt-0.5">
                        Rigorous rubric evaluating code correctness, Big-O efficiency, and architectural soundness.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#15846e] shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-sans text-sm text-white font-medium">Communication & Structure Assessment</h5>
                      <p className="text-xs text-zinc-400 font-light mt-0.5">
                        Feedback on requirement gathering, assumption clarity, and trade-off articulation.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#15846e] shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-sans text-sm text-white font-medium">Diagnosed Technical Blindspots</h5>
                      <p className="text-xs text-zinc-400 font-light mt-0.5">
                        Clear identification of missed edge cases, memory limits, and sub-optimal patterns.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#15846e] shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-sans text-sm text-white font-medium">Mastery Roadmap Remediation</h5>
                      <p className="text-xs text-zinc-400 font-light mt-0.5">
                        Targeted curriculum modules and 1-click retry mock session focused on diagnosed gaps.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calibration Summary Strip */}
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-zinc-500 uppercase">CONFIG:</span>
                  <span className="text-white font-medium">{role}</span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-white font-medium uppercase">{difficulty} LEVEL</span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-white font-medium uppercase">{type} TRACK</span>
                  {selectedFocus.length > 0 && (
                    <>
                      <span className="text-zinc-600">•</span>
                      <span className="text-[#8052ff]">{selectedFocus.join(', ')}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomTitle(!showCustomTitle)}
                    className="text-[11px] text-zinc-400 hover:text-white uppercase cursor-pointer"
                  >
                    {showCustomTitle ? 'Auto Title' : 'Rename Session'}
                  </button>
                </div>
              </div>

              {showCustomTitle && (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Custom Session Title"
                  className="w-full bg-white/[0.02] border border-white/10 focus:border-[#8052ff] rounded-2xl px-5 py-3 text-sm font-mono text-white outline-none"
                />
              )}
            </div>
          )}

          {/* Wizard Navigation Action Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="btn-dala-secondary w-full sm:w-auto px-6 py-2.5 cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="btn-dala-secondary w-full sm:w-auto px-6 py-2.5 cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel & Return</span>
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as any)}
                className="btn-dala-primary w-full sm:w-auto px-8 py-2.5 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartInterview}
                disabled={loading}
                className="btn-dala-primary w-full sm:w-auto px-8 py-2.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(128,82,255,0.4)]"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>INITIALIZING REHEARSAL...</span>
                  </>
                ) : (
                  <>
                    <span>COMMENCE REHEARSAL</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
