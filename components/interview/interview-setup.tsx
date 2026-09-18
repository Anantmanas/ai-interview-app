'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile, InterviewType, Difficulty } from '@/lib/types'
import { useResume } from '@/components/resume/resume-provider'
import { SkillIcon } from '@/components/resume/skill-icon'
import { ResumeDropzone } from '@/components/resume/resume-dropzone'
import { Code, Users, Network, Zap, Shield, Sparkles } from 'lucide-react'

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

  // Auto-generate session name: Mock_Test 01, Mock_Test 02, etc.
  const defaultSessionName = `Mock_Test ${String(existingCount + 1).padStart(2, '0')}`

  const [title, setTitle] = useState(defaultSessionName)
  const [type, setType] = useState<InterviewType>('technical')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [loading, setLoading] = useState(false)
  const [showCustomTitle, setShowCustomTitle] = useState(false)

  // Keep title updated if existingCount changes or initializes
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
      <div className="bg-[#0A0A0B] border border-[#303236] rounded-[4px] p-6 sm:p-8 shadow-2xl space-y-8">
        {/* Header Briefing */}
        <div className="border-b border-[#303236] pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#34D59A] font-semibold">
                ASSESSMENT SETUP
              </span>
              <span className="text-[#797D86] text-xs">/</span>
              <span className="text-[10px] font-mono text-[#94979E] uppercase">
                ADAPTIVE ENGINE
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#FFFFFF]">
              Configure Interview Session
            </h1>
            <p className="text-xs text-[#797D86]">
              AI interviewer will adapt live questions and code evaluations to your profile.
            </p>
          </div>

          {/* Session Tag Pill */}
          <div className="bg-[#151617] border border-[#303236] rounded-[4px] px-3 py-1.5 flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-[#797D86] font-mono uppercase">ID</span>
            <span className="text-xs font-mono font-bold text-[#34D59A]">{title}</span>
          </div>
        </div>

        {/* 1. Session Naming Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#FFFFFF] flex items-center gap-2">
              <span className="text-[#34D59A]">01.</span> SESSION NAME
            </label>
            <button
              type="button"
              onClick={() => setShowCustomTitle(!showCustomTitle)}
              className="text-[11px] font-mono text-[#797D86] hover:text-[#34D59A] transition-colors uppercase underline underline-offset-4"
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
              className="w-full bg-[#151617] border border-[#303236] focus:border-[#34D59A] focus:outline-none rounded-[4px] px-4 py-3 text-sm font-mono text-[#FFFFFF] transition-colors"
            />
          ) : (
            <div className="w-full bg-[#151617] border border-[#303236] rounded-[4px] px-4 py-3 flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-[#FFFFFF]">{title}</span>
              <span className="text-[10px] font-mono text-[#797D86] uppercase tracking-wider bg-[#242628] px-2 py-0.5 rounded-full">
                AUTO-INCREMENTED
              </span>
            </div>
          )}
        </div>

        {/* 2. Resume / Source of Truth Context Status */}
        <div className="bg-[#151617] border border-[#303236] rounded-[4px] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#34D59A]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFFFFF]">
                RESUME GROUNDING CONTEXT
              </span>
            </div>
            <span
              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                isResumeReady || profile?.resume_text
                  ? 'bg-[#34D59A]/10 text-[#34D59A] border-[#34D59A]/30'
                  : 'bg-[#FF3621]/10 text-[#FF3621] border-[#FF3621]/30'
              }`}
            >
              {isResumeReady || profile?.resume_text ? 'ACTIVE SYNC' : 'NO RESUME LINKED'}
            </span>
          </div>

          {isResumeReady && resumeData ? (
            <div className="space-y-2">
              <p className="text-xs text-[#C9CBCF]">
                Questions will be tailored to <strong className="text-[#FFFFFF]">{resumeData.name || 'your profile'}</strong> ({resumeData.targetRole || 'Software Engineer'}).
              </p>
              {resumeData.skills && resumeData.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {resumeData.skills.slice(0, 8).map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono bg-[#0A0A0B] border border-[#303236] rounded-[3px] px-2 py-0.5 text-[#C9CBCF]"
                    >
                      <SkillIcon skill={skill} className="w-3 h-3" size={12} />
                      {skill}
                    </span>
                  ))}
                  {resumeData.skills.length > 8 && (
                    <span className="text-[10px] font-mono text-[#797D86] self-center">
                      +{resumeData.skills.length - 8} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <p className="text-xs text-[#94979E]">
                Upload your resume to generate hyper-personalized questions matching your exact stack.
              </p>
              <ResumeDropzone source="interview-setup" />
            </div>
          )}
        </div>

        {/* 3. Interview Track Selection */}
        <div className="space-y-3">
          <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#FFFFFF] flex items-center gap-2">
            <span className="text-[#34D59A]">02.</span> SELECT INTERVIEW TRACK
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
                  className={`p-4 rounded-[4px] text-left transition-all border flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-[#151617] border-[#34D59A] shadow-md shadow-[#34D59A]/10'
                      : 'bg-[#151617]/50 border-[#303236] hover:border-[#797D86] hover:bg-[#151617]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`p-2 rounded-[4px] ${
                        isSelected ? 'bg-[#34D59A] text-[#151617]' : 'bg-[#242628] text-[#94979E]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#34D59A] shadow-sm shadow-[#34D59A]" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#FFFFFF]">
                      {opt.label}
                    </h3>
                    <p className="text-[11px] text-[#797D86] mt-1 leading-relaxed">
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
          <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#FFFFFF] flex items-center gap-2">
            <span className="text-[#34D59A]">03.</span> TARGET SENIORITY LEVEL
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DIFFICULTY_OPTIONS.map((opt) => {
              const isSelected = difficulty === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDifficulty(opt.id)}
                  className={`p-4 rounded-[4px] text-left transition-all border flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'bg-[#151617] border-[#34D59A] shadow-md shadow-[#34D59A]/10'
                      : 'bg-[#151617]/50 border-[#303236] hover:border-[#797D86] hover:bg-[#151617]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#34D59A] uppercase tracking-wider font-semibold">
                      {opt.level}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#34D59A]" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-mono text-xs font-bold text-[#FFFFFF]">
                      {opt.label}
                    </h3>
                    <p className="text-[11px] text-[#797D86] mt-0.5 leading-relaxed">
                      {opt.desc}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Action Controls & Launch CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#303236]">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="w-full sm:w-auto rounded-full border border-[#303236] hover:border-[#797D86] text-[#C9CBCF] hover:text-[#FFFFFF] text-xs font-mono uppercase tracking-wider px-6 py-3 transition-colors"
          >
            ← Cancel & Return
          </button>

          <button
            type="button"
            onClick={handleStartInterview}
            disabled={loading}
            className="w-full sm:w-auto rounded-full bg-[#34D59A] hover:bg-[#285D49] hover:text-[#FFFFFF] text-[#151617] font-mono text-xs font-bold uppercase tracking-wider px-8 py-3.5 transition-all shadow-md shadow-[#34D59A]/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-[#151617] border-t-transparent rounded-full animate-spin" />
                <span>INITIALIZING COCKPIT...</span>
              </>
            ) : (
              <span>LAUNCH SESSION →</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
