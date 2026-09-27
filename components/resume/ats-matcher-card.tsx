'use client'

import { useState } from 'react'
import { useResume } from '@/components/resume/resume-provider'
import { MacTrafficLights } from '@/components/ui/terminal-card'
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileSearch,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'

interface ATSAnalysis {
  matchScore: number
  matchLevel: string
  summary: string
  matchedSkills: string[]
  missingCriticalSkills: string[]
  bulletImprovements: string[]
}

export function ATSMatcherCard() {
  const { resumeData, isResumeReady } = useResume()
  const [jobDescription, setJobDescription] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const handleAuditMatch = async () => {
    if (!jobDescription.trim() || jobDescription.trim().length < 20) {
      toast.error('Please paste a full job description (at least a few sentences).')
      return
    }

    if (!isResumeReady || !resumeData) {
      toast.error('Please upload and select an active resume first.')
      return
    }

    setAnalyzing(true)
    try {
      const res = await fetch('/api/resume/match-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeData,
          jobDescription: jobDescription.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze Job Description match')
      }

      setAnalysis(data.analysis)
      toast.success('ATS Match analysis complete!')
    } catch (err: any) {
      console.error('ATS Match error:', err)
      toast.error(err.message || 'Failed to complete ATS match')
    } finally {
      setAnalyzing(false)
    }
  }

  const copyBullet = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    toast.success('Copied suggestion to clipboard')
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const scoreColor = (score: number) => {
    if (score >= 80) return { text: '#34d399', bg: '#052016', border: '#065f46' }
    if (score >= 60) return { text: '#fbbf24', bg: '#1c1608', border: '#78350f' }
    return { text: '#f87171', bg: '#2a0e15', border: '#5c1d28' }
  }

  return (
    <div className="rounded-xl border border-[#1e2030] bg-[#09090f] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden">
      {/* Titlebar */}
      <div className="flex items-center justify-between px-4 h-10 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
        <div className="flex items-center gap-3">
          <MacTrafficLights size="sm" />
          <span className="font-mono text-[11px] text-[#9ca3af] font-medium tracking-wide flex items-center gap-1.5">
            <FileSearch className="h-3.5 w-3.5 text-[#818cf8]" />
            ats-audit-matcher.py — zsh
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-[#818cf8] bg-[#14142b] border border-[#3730a3] px-2 py-0.5 rounded uppercase tracking-wider">
            AI ATS GROUNDING
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-7 space-y-6">
        {/* Header Briefing */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2030]/60 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] uppercase font-bold text-[#818cf8] bg-[#14142b] border border-[#3730a3]/40 px-2 py-0.5 rounded">
                ⚡ ATS GAP ANALYSIS
              </span>
              {resumeData && (
                <span className="font-mono text-[10px] text-[#9ca3af] bg-[#0c0d15] border border-[#1e2030] px-2 py-0.5 rounded">
                  Active: {resumeData.name || 'Candidate'} ({resumeData.targetRole || 'Software Engineer'})
                </span>
              )}
            </div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-white">
              Target Job Description Matcher
            </h2>
            <p className="font-body text-xs sm:text-sm text-[#9ca3af] mt-0.5">
              Paste the job description you want to apply for. Our ATS model evaluates keyword density, tech stack alignment, and generates instant resume bullet fixes.
            </p>
          </div>
        </div>

        {/* Input Area */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-mono text-xs font-semibold text-[#f8fafc] uppercase tracking-wider">
              Paste Job Description Text (JD)
            </label>
            <span className="font-mono text-[10px] text-[#64748b]">
              Supports postings from LinkedIn, Indeed, Greenhouse, Lever, etc.
            </span>
          </div>

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste full job description requirements, responsibilities, and preferred qualifications here..."
            rows={5}
            className="w-full bg-[#0c0d15] border border-[#1e2030] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]/40 focus:outline-none rounded-xl p-4 text-xs font-mono text-[#f8fafc] placeholder-[#64748b] leading-relaxed transition-all resize-y"
          />

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-2">
            {jobDescription && (
              <button
                type="button"
                onClick={() => {
                  setJobDescription('')
                  setAnalysis(null)
                }}
                className="font-mono text-xs text-[#9ca3af] hover:text-white px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-center sm:text-left"
              >
                Clear
              </button>
            )}

            <button
              onClick={handleAuditMatch}
              disabled={analyzing || !jobDescription.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#4f46e5] text-white hover:bg-[#5865f2] disabled:opacity-50 disabled:cursor-not-allowed border border-[#6366f1]/40 shadow-[0_0_20px_rgba(79,70,229,0.35)] font-mono text-xs font-bold uppercase tracking-wider px-5 py-3 sm:py-2.5 rounded-lg transition-all cursor-pointer"
            >
              {analyzing ? <Spinner className="h-4 w-4" /> : <Sparkles className="h-4 w-4 text-[#fbbf24]" />}
              <span>{analyzing ? 'Auditing Resume Against JD...' : 'Audit ATS Match'}</span>
            </button>
          </div>
        </div>

        {/* Results Area */}
        {analysis && (
          <div className="pt-4 border-t border-[#1e2030] space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Top Score Bar */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-[#14142b]/80 via-[#0e0f1a] to-[#14142b]/80 border border-[#3730a3]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-xl border flex flex-col items-center justify-center font-mono font-bold shrink-0 shadow-lg"
                  style={{
                    color: scoreColor(analysis.matchScore).text,
                    backgroundColor: scoreColor(analysis.matchScore).bg,
                    borderColor: scoreColor(analysis.matchScore).border,
                  }}
                >
                  <span className="text-2xl leading-none">{analysis.matchScore}%</span>
                  <span className="text-[9px] uppercase tracking-widest mt-1 opacity-80">MATCH</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded border"
                      style={{
                        color: scoreColor(analysis.matchScore).text,
                        backgroundColor: scoreColor(analysis.matchScore).bg,
                        borderColor: scoreColor(analysis.matchScore).border,
                      }}
                    >
                      {analysis.matchLevel}
                    </span>
                    <span className="font-mono text-[10px] text-[#9ca3af]">
                      ATS PARSE QUALITY: HIGH
                    </span>
                  </div>
                  <p className="text-xs text-[#9ca3af] mt-1.5 leading-relaxed max-w-xl">
                    {analysis.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Matched vs Missing Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Matched Skills */}
              <div className="p-4 rounded-xl border border-[#065f46]/60 bg-[#052016]/40 space-y-3">
                <div className="flex items-center gap-2 text-[#34d399] font-mono text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Matched Keywords & Skills ({analysis.matchedSkills.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.matchedSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="font-mono text-xs px-2.5 py-1 rounded-md bg-[#065f46]/30 text-[#6ee7b7] border border-[#065f46]/60 font-medium"
                    >
                      ✓ {skill}
                    </span>
                  ))}
                  {analysis.matchedSkills.length === 0 && (
                    <span className="font-mono text-xs text-[#64748b]">No direct keyword matches found.</span>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="p-4 rounded-xl border border-[#5c1d28]/60 bg-[#2a0e15]/40 space-y-3">
                <div className="flex items-center gap-2 text-[#f87171] font-mono text-xs font-bold uppercase tracking-wider">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Missing JD Keywords ({analysis.missingCriticalSkills.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.missingCriticalSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="font-mono text-xs px-2.5 py-1 rounded-md bg-[#2a0e15] text-[#fca5a5] border border-[#5c1d28] font-medium"
                    >
                      + {skill}
                    </span>
                  ))}
                  {analysis.missingCriticalSkills.length === 0 && (
                    <span className="font-mono text-xs text-[#34d399]">No critical gaps identified!</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actionable Resume Bullet Improvements */}
            {analysis.bulletImprovements?.length > 0 && (
              <div className="p-5 rounded-xl border border-[#1e2030] bg-[#0c0d15] space-y-3">
                <div className="flex items-center gap-2 text-[#fbbf24] font-mono text-xs font-bold uppercase tracking-wider">
                  <Lightbulb className="h-4 w-4" />
                  <span>Recommended Resume Bullet Additions</span>
                </div>
                <p className="text-xs text-[#9ca3af]">
                  Incorporate these targeted bullet revisions into your resume before submitting to maximize ATS score:
                </p>

                <div className="space-y-2.5 pt-1">
                  {analysis.bulletImprovements.map((bullet, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#11121b] border border-[#1e2030] flex items-start justify-between gap-3 text-xs text-[#e2e8f0] font-sans leading-relaxed group"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="font-mono text-[10px] text-[#818cf8] font-bold mt-0.5 shrink-0">
                          0{idx + 1}.
                        </span>
                        <span>{bullet}</span>
                      </div>

                      <button
                        onClick={() => copyBullet(bullet, idx)}
                        className="p-1.5 rounded text-[#9ca3af] hover:text-[#818cf8] hover:bg-[#14142b] border border-transparent hover:border-[#3730a3]/50 transition-colors shrink-0 cursor-pointer"
                        title="Copy bullet"
                      >
                        {copiedIdx === idx ? <Check className="h-3.5 w-3.5 text-[#34d399]" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
