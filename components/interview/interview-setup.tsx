'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile, InterviewType, Difficulty } from '@/lib/types'
import { useResume } from '@/components/resume/resume-provider'
import { SkillIcon } from '@/components/resume/skill-icon'
import { ResumeDropzone } from '@/components/resume/resume-dropzone'
import { Code, Users, Network, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react'

interface InterviewSetupProps {
  profile: Profile | null
  existingCount?: number
}

const TYPE_OPTIONS: { id: InterviewType; label: string; desc: string; icon: any }[] = [
  {
    id: 'technical',
    label: 'Technical Coding & Core',
    desc: 'Algorithms, data structures, framework concepts, and practical coding problems.',
    icon: Code,
  },
  {
    id: 'system_design',
    label: 'System Architecture',
    desc: 'Scalability, microservices, databases, load balancing, and high-level design.',
    icon: Network,
  },
  {
    id: 'behavioral',
    label: 'Behavioral & Leadership',
    desc: 'STAR method questions on conflict resolution, impact, and engineering decisions.',
    icon: Users,
  },
]

const DIFFICULTY_OPTIONS: { id: Difficulty; label: string; level: string; desc: string }[] = [
  {
    id: 'easy',
    label: 'ENTRY / JUNIOR',
    level: 'L3 / Junior Eng',
    desc: 'Core fundamentals and direct questions.',
  },
  {
    id: 'medium',
    label: 'MID-LEVEL',
    level: 'L4 / Senior Eng',
    desc: 'Deep technical edge cases and trade-offs.',
  },
  {
    id: 'hard',
    label: 'STAFF / PRINCIPAL',
    level: 'L5+ / Staff Eng',
    desc: 'Complex distributed challenges and critical optimizations.',
  },
]

export function InterviewSetup({ profile, existingCount = 0 }: InterviewSetupProps) {
  const router = useRouter()
  const { resumeData, isResumeReady } = useResume()

  const defaultSessionName = `Mock_Test ${String(existingCount + 1).padStart(2, '0')}`

  const [title, setTitle] = useState(defaultSessionName)
  const [type, setType] = useState<InterviewType>('technical')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [loading, setLoading] = useState(false)
  const [showCustomTitle, setShowCustomTitle] = useState(false)

  useEffect(() => {
    if (!showCustomTitle) {
      setTitle(`Mock_Test ${String(existingCount + 1).padStart(2, '0')}`)
    }
  }, [existingCount, showCustomTitle])

  const handleStartInterview = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const sessionTitle = title.trim() || defaultSessionName

      const { data: interview, error } = await supabase
        .from('interviews')
        .insert({
          user_id: profile?.id,
          title: sessionTitle,
          type,
          difficulty,
          status: 'in_progress',
        })
        .select()
        .single()

      if (error) throw error
      router.push(`/interview/${interview.id}`)
    } catch (err) {
      console.error('Failed to create interview:', err)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Cockpit Card Container */}
      <div className="card-console-glow p-6 sm:p-8 space-y-8">
        {/* Header Briefing */}
        <div className="border-b border-[#291a45] pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#c084fc] font-semibold">
                ASSESSMENT SETUP
              </span>
              <span className="text-[#50446b] text-xs">/</span>
              <span className="text-[10px] font-mono text-[#948bb0] uppercase">
                ADAPTIVE ENGINE
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#fdfcff] font-display">
              Configure Interview Session
            </h1>
            <p className="text-xs text-[#948bb0]">
              AI interviewer will adapt live questions and code evaluations to your profile.
            </p>
          </div>

          {/* Session Tag Pill */}
          <div className="bg-[#140e24] border border-[#3b1d66] rounded-[6px] px-3 py-1.5 flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-[#948bb0] font-mono uppercase">ID</span>
            <span className="text-xs font-mono font-bold text-[#c084fc]">{title}</span>
          </div>
        </div>

        {/* 1. Session Naming Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#fdfcff] flex items-center gap-2">
              <span className="text-[#a855f7]">01.</span> SESSION NAME
            </label>
            <button
              type="button"
              onClick={() => setShowCustomTitle(!showCustomTitle)}
              className="text-[11px] font-mono text-[#948bb0] hover:text-[#c084fc] transition-colors uppercase underline underline-offset-4 cursor-pointer"
            >
              {showCustomTitle ? 'Reset to Auto-Generated' : 'Edit Custom Name'}
            </button>
          </div>

          {showCustomTitle ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mock_Test 01"
              className="w-full bg-[#140e24] border border-[#291a45] focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7]/40 focus:outline-none rounded-[6px] px-4 py-3 text-sm font-mono text-[#fdfcff] transition-colors"
            />
          ) : (
            <div className="w-full bg-[#140e24] border border-[#291a45] rounded-[6px] px-4 py-3 flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-[#fdfcff]">{title}</span>
              <span className="text-[10px] font-mono text-[#c084fc] uppercase tracking-wider bg-[#201138] border border-[#4c1d95] px-2.5 py-0.5 rounded-full">
                AUTO-INCREMENTED
              </span>
            </div>
          )}
        </div>

        {/* 2. Resume / Source of Truth Context Status */}
        <div className="bg-[#140e24] border border-[#291a45] rounded-[6px] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#a855f7]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#fdfcff]">
                RESUME GROUNDING CONTEXT
              </span>
            </div>
            <span
              className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border ${
                isResumeReady || profile?.resume_text
                  ? 'bg-[#201138] text-[#c084fc] border-[#4c1d95]'
                  : 'bg-[#2a0e15] text-[#f87171] border-[#5c1d28]'
              }`}
            >
              {isResumeReady || profile?.resume_text ? 'ACTIVE SYNC' : 'NO RESUME LINKED'}
            </span>
          </div>

          {isResumeReady && resumeData ? (
            <div className="space-y-2">
              <p className="text-xs text-[#c8c0e0]">
                Questions will be tailored to <strong className="text-[#fdfcff]">{resumeData.name || 'your profile'}</strong> ({resumeData.targetRole || 'Software Engineer'}).
              </p>
              {resumeData.skills && resumeData.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {resumeData.skills.slice(0, 10).map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono bg-[#0d0918] border border-[#291a45] rounded-[4px] px-2.5 py-1 text-[#f5f3ff] hover:border-[#4c1d95] transition-colors"
                    >
                      <SkillIcon skill={skill} className="w-3.5 h-3.5" size={14} />
                      {skill}
                    </span>
                  ))}
                  {resumeData.skills.length > 10 && (
                    <span className="text-[10px] font-mono text-[#948bb0] self-center">
                      +{resumeData.skills.length - 10} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <p className="text-xs text-[#948bb0]">
                Upload your resume to generate hyper-personalized questions matching your exact stack.
              </p>
              <ResumeDropzone source="interview-setup" />
            </div>
          )}
        </div>

        {/* 3. Interview Track Selection */}
        <div className="space-y-3">
          <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#fdfcff] flex items-center gap-2">
            <span className="text-[#a855f7]">02.</span> SELECT INTERVIEW TRACK
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TYPE_OPTIONS.map((opt) => {
              const isSelected = type === opt.id
              const Icon = opt.icon
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setType(opt.id)}
                  className={`p-4 rounded-[6px] text-left transition-all border flex flex-col justify-between space-y-3 cursor-pointer ${
                    isSelected
                      ? 'bg-[#201138] border-[#a855f7] shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                      : 'bg-[#140e24]/70 border-[#291a45] hover:border-[#4c1d95] hover:bg-[#140e24]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`p-2 rounded-[6px] ${
                        isSelected ? 'bg-gradient-to-r from-[#9333ea] to-[#7c3aed] text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]' : 'bg-[#1b1330] text-[#948bb0]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#c084fc] led-pulse" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#fdfcff]">
                      {opt.label}
                    </h3>
                    <p className="text-[11px] text-[#948bb0] mt-1 leading-relaxed">
                      {opt.desc}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 4. Target Seniority / Difficulty Level */}
        <div className="space-y-3">
          <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#fdfcff] flex items-center gap-2">
            <span className="text-[#a855f7]">03.</span> TARGET SENIORITY LEVEL
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DIFFICULTY_OPTIONS.map((opt) => {
              const isSelected = difficulty === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDifficulty(opt.id)}
                  className={`p-4 rounded-[6px] text-left transition-all border flex flex-col justify-between space-y-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#201138] border-[#a855f7] shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                      : 'bg-[#140e24]/70 border-[#291a45] hover:border-[#4c1d95] hover:bg-[#140e24]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#c084fc] uppercase tracking-wider font-semibold">
                      {opt.level}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#c084fc] led-pulse" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-mono text-xs font-bold text-[#fdfcff]">
                      {opt.label}
                    </h3>
                    <p className="text-[11px] text-[#948bb0] mt-0.5 leading-relaxed">
                      {opt.desc}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Action Controls & Launch CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#291a45]">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="w-full sm:w-auto rounded-[6px] border border-[#291a45] hover:border-[#4c1d95] bg-[#140e24] text-[#c8c0e0] hover:text-[#fdfcff] text-xs font-mono uppercase tracking-wider px-6 py-3 transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Cancel & Return
          </button>

          <button
            type="button"
            onClick={handleStartInterview}
            disabled={loading}
            className="w-full sm:w-auto rounded-[6px] btn-neo-violet font-mono text-xs font-bold uppercase tracking-wider px-8 py-3.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>INITIALIZING COCKPIT...</span>
              </>
            ) : (
              <>
                <span>LAUNCH SESSION</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
