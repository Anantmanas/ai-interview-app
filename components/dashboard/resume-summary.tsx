'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useResume } from '@/components/resume/resume-provider'
import { SkillIcon } from '@/components/resume/skill-icon'
import { CheckCircle2, FileText, ChevronDown, ChevronUp } from 'lucide-react'

export function ResumeSummary() {
  const { resumeData, resumeMeta, isResumeReady } = useResume()
  const [expanded, setExpanded] = useState(false)
  const [userFullName, setUserFullName] = useState<string>('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const name =
          user.user_metadata?.full_name?.trim() ||
          user.user_metadata?.name?.trim() ||
          user.email?.split('@')[0] ||
          ''
        if (name) setUserFullName(name)
      }
    })
  }, [])

  if (!isResumeReady || !resumeData) {
    return null
  }

  const skills = resumeData.skills || []
  const displayName = userFullName || 'Candidate'

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] hover:border-white/20 transition-all overflow-hidden font-sans">
      {/* Titlebar */}
      <div className="flex items-center justify-between px-6 sm:px-7 h-12 border-b border-white/10 bg-white/[0.02] select-none">
        <div className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#8052ff] shadow-[0_0_8px_#8052ff]" />
          <span className="font-mono text-[10px] sm:text-[11px] text-white/50 font-semibold tracking-wider uppercase truncate max-w-[280px] sm:max-w-md">
            RESUME GROUNDING // {resumeMeta?.fileName || 'ACTIVE_FILE'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-[#15846e] bg-[#15846e]/20 border border-[#15846e]/40 px-3 py-0.5 rounded-full uppercase tracking-wider font-semibold">
            GROUNDING ACTIVE
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-7 space-y-5">
        {/* Candidate & Target Role */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <span className="text-white/50">Candidate:</span>
          <strong className="text-white font-medium text-sm font-sans">{displayName}</strong>
          <span className="text-white/20">•</span>
          <span className="text-white/50">Target:</span>
          <span className="text-[#8052ff] font-medium">{resumeData.targetRole || 'Software Engineer'}</span>
        </div>

        {/* Collapsible Executive Summary */}
        {(() => {
          const isPdfMetadata = (s?: string) => {
            if (!s) return true
            if (s.startsWith('%PDF-') || s.startsWith('PDF-')) return true
            if (s.includes('/Creator') || s.includes('/Producer') || s.includes('/Type/Catalog')) return true
            if (/^PDF-\d|^%PDF-\d/.test(s)) return true
            if ((s.match(/\/(Type|Creator|Producer|Author|Title|ModDate|CreationDate)\b/g) || []).length >= 2) return true
            return false
          }
          const isGlyphGarbage = (s?: string) => {
            if (!s) return true
            if (isPdfMetadata(s)) return true
            const symbols = s.match(/[$%&#!*+\\=~^`<>{}[\]|]/g) || []
            return symbols.length / s.length > 0.08
          }
          const summaryText = resumeData.summary && !isGlyphGarbage(resumeData.summary)
            ? resumeData.summary
            : 'Experienced Software Engineer specializing in modern frontend and full-stack development with React, TypeScript, and scalable web architectures.'

          return (
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/15 transition-colors">
              <p
                className={`font-sans text-[13.5px] text-zinc-300 font-light leading-relaxed cursor-pointer ${expanded ? '' : 'line-clamp-2'}`}
                onClick={() => setExpanded(!expanded)}
              >
                {summaryText}
              </p>
              {summaryText.length > 120 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="font-mono text-[11px] text-[#8052ff] hover:text-white transition-colors mt-2.5 inline-flex items-center gap-1 cursor-pointer font-semibold uppercase tracking-wider"
                >
                  {expanded ? (
                    <>
                      <span>Collapse Summary</span>
                      <ChevronUp className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      <span>Expand Executive Summary</span>
                      <ChevronDown className="h-3 w-3" />
                    </>
                  )}
                </button>
              )}
            </div>
          )
        })()}

        {/* Extracted Skills */}
        <div>
          <p className="font-mono text-[10px] uppercase text-white/50 tracking-[0.16em] mb-3 font-semibold">
            EXTRACTED TECHNICAL STACK ({skills.length > 0 ? skills.length : 'DETECTED'})
          </p>
          <div className="flex flex-wrap gap-2.5">
            {(skills.length > 0 ? skills : ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git'])
              .slice(0, 18)
              .map((skill) => (
                <div
                  key={skill}
                  className="group inline-flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#8052ff]/40 rounded-full px-3.5 py-1.5 transition-all shadow-sm"
                >
                  <SkillIcon skill={skill} className="w-4 h-4 shrink-0" size={16} />
                  <span className="font-mono text-[11px] font-medium text-white group-hover:text-[#8052ff] transition-colors">
                    {skill}
                  </span>
                </div>
              ))}
            {skills.length > 18 && (
              <span className="font-mono text-[11px] text-white/50 self-center px-3 py-1 bg-white/[0.04] border border-white/10 rounded-full">
                +{skills.length - 18} more
              </span>
            )}
          </div>
        </div>

        <div className="pt-3 flex items-center justify-between text-[11px] font-mono text-white/50 border-t border-white/10">
          <div className="flex items-center gap-2 text-[#15846e] font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Active: AI interviewer generates grounded interview vectors</span>
          </div>
        </div>
      </div>
    </div>
  )
}
