'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Profile, InterviewType, Difficulty } from '@/lib/types'
import { useResume } from '@/components/resume/resume-provider'
import { SkillIcon } from '@/components/resume/skill-icon'
import { ResumeDropzone } from '@/components/resume/resume-dropzone'
import { Code, Users, Network, Sparkles, ArrowRight, ArrowLeft, Target, ShieldCheck } from 'lucide-react'

interface InterviewSetupProps {
  profile: Profile | null
  existingCount?: number
}

const TYPE_OPTIONS: { id: InterviewType; label: string; desc: string; icon: any }[] = [
  {
    id: 'technical',
    label: 'Algorithms & Data Structures',
    desc: 'Algorithmic reasoning, time/space complexity analysis, and real-time Monaco IDE compilation.',
    icon: Code,
  },
  {
    id: 'system_design',
    label: 'Distributed Architecture',
    desc: 'Scalability, microservices, partitioning, database trade-offs, and high-throughput system design.',
    icon: Network,
  },
  {
    id: 'behavioral',
    label: 'Staff Leadership & STAR',
    desc: 'Engineering leadership, conflict resolution, technical debt management, and architectural trade-offs.',
    icon: Users,
  },
]

const DIFFICULTY_OPTIONS: { id: Difficulty; label: string; level: string; desc: string }[] = [
  {
    id: 'easy',
    label: 'ENTRY / JUNIOR',
    level: 'L3 / Junior Eng',
    desc: 'Core fundamentals, straightforward algorithmic implementations, and standard patterns.',
  },
  {
    id: 'medium',
    label: 'MID-LEVEL / SENIOR',
    level: 'L4 - L5 / Senior',
    desc: 'Deep edge cases, concurrent state management, and architectural trade-off evaluations.',
  },
  {
    id: 'hard',
    label: 'STAFF / PRINCIPAL',
    level: 'L6+ / Staff Eng',
    desc: 'Complex distributed consensus, critical system failure recovery, and extreme scale optimization.',
  },
]

export function InterviewSetup({ profile, existingCount = 0 }: InterviewSetupProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paramTopic = searchParams.get('topic') || ''
  const paramType = searchParams.get('type') as InterviewType | null
  const paramDifficulty = searchParams.get('difficulty') as Difficulty | null

  const { resumeData, isResumeReady } = useResume()

  const defaultSessionName = paramTopic
    ? `Targeted: ${paramTopic}`
    : `Mock_Session ${String(existingCount + 1).padStart(2, '0')}`

  const [title, setTitle] = useState(defaultSessionName)
  const [type, setType] = useState<InterviewType>(paramType || 'technical')
  const [difficulty, setDifficulty] = useState<Difficulty>(paramDifficulty || 'medium')
  const [loading, setLoading] = useState(false)
  const [showCustomTitle, setShowCustomTitle] = useState(Boolean(paramTopic))

  useEffect(() => {
    if (!showCustomTitle && !paramTopic) {
      setTitle(`Mock_Session ${String(existingCount + 1).padStart(2, '0')}`)
    }
  }, [existingCount, showCustomTitle, paramTopic])

  const handleStartInterview = async () => {
    setLoading(true)
    try {
      const sessionTitle = title.trim() || defaultSessionName
      const targetRoleValue = paramTopic ? `Topic: ${paramTopic}` : profile?.target_role

      // Call dedicated API route with server-side authentication & admin fallback
      const res = await fetch('/api/interviews/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: sessionTitle,
          type,
          difficulty,
          target_role: targetRoleValue,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok && data?.interview?.id) {
        router.push(`/interview/${data.interview.id}`)
        return
      }

      // Client-side fallback if API returned non-ok
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
    <div className="space-y-6">
      {/* Cockpit Card Container */}
      <div className="rounded-2xl border border-white/10 bg-[#0D0D0D] shadow-2xl overflow-hidden">
        {/* Titlebar Header */}
        <div className="flex items-center justify-between px-8 h-14 border-b border-white/10 bg-white/[0.02] select-none">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#2447FF]" />
            <span className="font-mono text-xs text-[#8C8C88] font-semibold tracking-wider uppercase">
              SIMULATION CONFIGURATION MATRIX
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#34d399] bg-[#34d399]/10 border border-[#34d399]/30 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
            INSTRUMENT READY
          </span>
        </div>

        <div className="p-8 sm:p-12 space-y-12">
          {/* Header Briefing */}
          <div className="border-b border-white/10 pb-8 flex flex-col sm:flex-row sm:items-baseline justify-between gap-6">
            <div className="space-y-2">
              <span className="font-mono text-xs uppercase tracking-widest text-[#2447FF] font-semibold block">
                PATH INITIALIZATION
              </span>
              <h1 className="display-statement text-[#F4F2EC] font-bold">
                Configure Practice Session
              </h1>
              <p className="font-body text-base text-[#8C8C88] max-w-xl font-light">
                Select your engineering domain and calibration depth. The AI interviewer synthesizes questions anchored in your profile in real-time.
              </p>
            </div>

            {/* Session Tag Pill */}
            <div className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
              <span className="text-[10px] text-[#8C8C88] font-mono uppercase">ID</span>
              <span className="text-xs font-mono font-bold text-[#F4F2EC]">{title}</span>
            </div>
          </div>

          {/* Targeted Topic Alert if opened from Roadmap */}
          {paramTopic && (
            <div className="bg-[#2447FF]/10 border border-[#2447FF]/30 rounded-xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <Target className="h-5 w-5 text-[#2447FF] shrink-0" />
                <div>
                  <span className="font-mono text-[10px] uppercase font-bold text-[#2447FF] tracking-widest block">
                    ROADMAP TARGETED REMEDIATION
                  </span>
                  <p className="text-base text-[#F4F2EC] font-semibold">
                    Target topic: <span className="text-white underline">{paramTopic}</span>
                  </p>
                </div>
              </div>
              <span className="font-mono text-[10px] bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/30 px-3 py-1 rounded-full uppercase tracking-wider shrink-0 font-semibold">
                LINKED
              </span>
            </div>
          )}

          {/* 1. Session Naming Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#F4F2EC] flex items-center gap-2">
                <span className="text-[#2447FF]">01.</span> SESSION IDENTIFIER
              </label>
              <button
                type="button"
                onClick={() => setShowCustomTitle(!showCustomTitle)}
                className="text-xs font-mono text-[#8C8C88] hover:text-white transition-colors uppercase cursor-pointer"
              >
                {showCustomTitle ? 'Reset to Auto-Generated' : 'Custom Title'}
              </button>
            </div>

            {showCustomTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Distributed_Consensus_01"
                className="w-full bg-[#050505] border border-white/10 focus:border-[#2447FF] rounded-xl px-5 py-3.5 text-sm font-mono text-[#F4F2EC] transition-colors"
              />
            ) : (
              <div className="w-full bg-[#050505] border border-white/10 rounded-xl px-5 py-3.5 flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-[#F4F2EC]">{title}</span>
                <span className="text-[10px] font-mono text-[#8C8C88] uppercase tracking-wider bg-white/[0.04] border border-white/10 px-2.5 py-0.5 rounded-full">
                  CALIBRATED
                </span>
              </div>
            )}
          </div>

          {/* 2. Resume / Source of Truth Context Status */}
          <div className="bg-[#050505] border border-white/10 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#2447FF]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F4F2EC]">
                  02. CANDIDATE GROUNDING CONTEXT
                </span>
              </div>
              <span
                className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border ${
                  isResumeReady || profile?.resume_text
                    ? 'bg-[#34d399]/10 text-[#34d399] border-[#34d399]/30'
                    : 'bg-white/[0.05] text-[#8C8C88] border-white/10'
                }`}
              >
                {isResumeReady || profile?.resume_text ? 'ACTIVE SYNC' : 'OPTIONAL RESUME'}
              </span>
            </div>

            {isResumeReady && resumeData ? (
              <div className="space-y-3">
                <p className="text-xs text-[#8C8C88]">
                  Grounding questions on <strong className="text-white">{resumeData.name || 'your profile'}</strong> ({resumeData.targetRole || 'Software Engineer'}).
                </p>
                {resumeData.skills && resumeData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {resumeData.skills.slice(0, 10).map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 text-xs font-mono bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1 text-[#F4F2EC]"
                      >
                        <SkillIcon skill={skill} className="w-3.5 h-3.5" size={14} />
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-[#8C8C88]">
                  Ingest your resume to calibrate questions to your specific engineering stack.
                </p>
                <ResumeDropzone source="interview-setup" />
              </div>
            )}
          </div>

          {/* 3. Interview Track Selection */}
          <div className="space-y-4">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#F4F2EC] flex items-center gap-2">
              <span className="text-[#2447FF]">03.</span> CHOOSE INTERVIEW SIMULATION PATH
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {TYPE_OPTIONS.map((opt) => {
                const isSelected = type === opt.id
                const Icon = opt.icon
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setType(opt.id)}
                    className={`p-6 rounded-2xl text-left transition-all border flex flex-col justify-between space-y-4 cursor-pointer ${
                      isSelected
                        ? 'bg-white/[0.06] border-[#2447FF] shadow-lg'
                        : 'bg-[#050505] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`p-3 rounded-xl ${
                          isSelected
                            ? 'bg-[#2447FF] text-white'
                            : 'bg-white/[0.04] text-[#8C8C88]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#2447FF]" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-[#F4F2EC]">
                        {opt.label}
                      </h3>
                      <p className="text-xs text-[#8C8C88] mt-1.5 leading-relaxed">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 4. Target Seniority / Difficulty Level */}
          <div className="space-y-4">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#F4F2EC] flex items-center gap-2">
              <span className="text-[#2447FF]">04.</span> TARGET SENIORITY LEVEL
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {DIFFICULTY_OPTIONS.map((opt) => {
                const isSelected = difficulty === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDifficulty(opt.id)}
                    className={`p-6 rounded-2xl text-left transition-all border flex flex-col justify-between space-y-3 cursor-pointer ${
                      isSelected
                        ? 'bg-white/[0.06] border-[#2447FF] shadow-lg'
                        : 'bg-[#050505] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[#8C8C88] uppercase tracking-wider font-semibold">
                        {opt.level}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#2447FF]" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-[#F4F2EC]">
                        {opt.label}
                      </h3>
                      <p className="text-xs text-[#8C8C88] mt-1.5 leading-relaxed">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Action Controls & Launch CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="w-full sm:w-auto rounded-xl border border-white/10 hover:border-white/25 bg-transparent text-[#8C8C88] hover:text-white text-xs font-mono uppercase tracking-wider px-6 py-4 transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Cancel & Return
            </button>

            <button
              type="button"
              onClick={handleStartInterview}
              disabled={loading}
              className="bg-[#2447FF] hover:bg-[#1A3AE8] text-white w-full sm:w-auto font-mono text-xs font-semibold uppercase tracking-[0.1em] px-9 py-4 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-xl hover:scale-[1.01]"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>INITIALIZING SIMULATION...</span>
                </>
              ) : (
                <>
                  <span>COMMENCE SIMULATION</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
