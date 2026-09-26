'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react'
import { MacTrafficLights } from '@/components/ui/terminal-card'
import { motion, AnimatePresence } from 'motion/react'

interface HistorySessionCardProps {
  interview: any
  index: number
  totalCount: number
}

export function HistorySessionCard({ interview, index, totalCount }: HistorySessionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const strengths = Array.isArray(interview.strengths) ? interview.strengths : []
  const weaknesses = Array.isArray(interview.weaknesses) ? interview.weaknesses : []
  const summary = interview.feedback_summary || ''

  return (
    <div className="rounded-xl border border-[#1e2030] bg-[#09090f] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-[#3730a3] transition-all overflow-hidden">
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between px-4 h-9 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
        <div className="flex items-center gap-2.5">
          <MacTrafficLights size="sm" />
          <span className="font-mono text-[10px] text-[#9ca3af] font-medium">
            session-{String(totalCount - index).padStart(2, '0')}.sh — bash
          </span>
        </div>
        <div>
          {interview.status === 'completed' ? (
            <span className="font-mono text-[9px] text-[#818cf8] bg-[#14142b] border border-[#3730a3] rounded px-2 py-0.5 uppercase tracking-[0.05em]">
              [COMPLETED]
            </span>
          ) : (
            <span className="font-mono text-[9px] text-[#9ca3af] bg-[#09090e] border border-[#1e1e2f] rounded px-2 py-0.5 uppercase tracking-[0.05em]">
              [IN_PROGRESS]
            </span>
          )}
        </div>
      </div>

      {/* Main Card Content */}
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[12px] font-bold text-[#64748b]">
                {String(totalCount - index).padStart(2, '0')}
              </span>
              <h3 className="font-display font-semibold text-[16px] text-white hover:text-[#818cf8] transition-colors">
                {interview.title}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[12px] font-mono text-[#9ca3af]">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-[#64748b]" />
                {new Date(interview.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-[#64748b]" />
                {formatDuration(interview.duration_seconds)}
              </span>
              <span>•</span>
              <span className="bg-[#14142b] border border-[#1e1e2f] rounded px-2 py-0.5 uppercase text-[10px] text-[#818cf8]">
                {interview.type.replace('_', ' ')}
              </span>
              <span className="bg-[#14142b] border border-[#1e1e2f] rounded px-2 py-0.5 uppercase text-[10px] text-[#9ca3af]">
                {interview.difficulty}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right mr-2">
              {interview.overall_score !== null && interview.overall_score > 0 ? (
                <>
                  <div className="font-display text-[26px] font-bold bg-gradient-to-r from-[#6366f1] to-[#818cf8] bg-clip-text text-transparent leading-none">
                    {interview.overall_score}%
                  </div>
                  <div className="font-mono text-[10px] text-[#64748b] uppercase mt-0.5">Score</div>
                </>
              ) : interview.status === 'completed' ? (
                <span className="font-mono text-[11px] text-[#64748b] bg-[#0f0f18] border border-[#1e1e2f] rounded-[2px] px-2 py-0.5">
                  — PENDING
                </span>
              ) : null}
            </div>

            {/* Collapsible Dropdown Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.05em] text-[#9ca3af] hover:text-white transition-colors bg-[#0c0d15] hover:bg-[#14142b] border border-[#1e2030] hover:border-[#3730a3] px-3 py-2 rounded-lg cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#818cf8]" />
              <span>{isExpanded ? 'Hide Suggestions' : 'View Suggestions'}</span>
              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            <Link
              href={interview.status === 'completed' ? `/dashboard/history/${interview.id}` : `/interview/${interview.id}`}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.05em] text-[#818cf8] hover:text-white transition-colors bg-[#14142b] border border-[#3730a3]/60 hover:border-[#4f46e5] px-4 py-2 rounded-lg"
            >
              <span>{interview.status === 'completed' ? 'Details' : 'Resume'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Expandable Dropdown Drawer */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-[#1e2030] space-y-4">
                {/* Caveman Summary / Quick Take */}
                {summary && (
                  <div className="bg-[#0c0d15] border border-[#1e2030] rounded-lg p-3.5 space-y-1.5">
                    <p className="font-mono text-[10px] text-[#818cf8] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" />
                      AI SESSION SUMMARY & SUGGESTIONS:
                    </p>
                    <p className="font-sans text-xs text-[#cbd5e1] leading-relaxed">
                      {summary}
                    </p>
                  </div>
                )}

                {/* Strengths & Weaknesses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Strengths */}
                  <div className="bg-[#0c0d15]/70 border border-[#1e2030] rounded-lg p-3 space-y-2">
                    <p className="font-mono text-[10px] text-[#22c55e] uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      KEY STRENGTHS ({strengths.length || 0})
                    </p>
                    {strengths.length > 0 ? (
                      <ul className="space-y-1 font-sans text-xs text-[#9ca3af]">
                        {strengths.map((s: any, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-[#22c55e] font-mono">•</span>
                            <span>{typeof s === 'string' ? s : s.topic || s.reason}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] text-[#64748b] font-mono">No specific strengths recorded.</p>
                    )}
                  </div>

                  {/* Weaknesses / Improvements */}
                  <div className="bg-[#0c0d15]/70 border border-[#1e2030] rounded-lg p-3 space-y-2">
                    <p className="font-mono text-[10px] text-[#f59e0b] uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      ACTIONABLE IMPROVEMENTS ({weaknesses.length || 0})
                    </p>
                    {weaknesses.length > 0 ? (
                      <ul className="space-y-1 font-sans text-xs text-[#9ca3af]">
                        {weaknesses.map((w: any, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-[#f59e0b] font-mono">•</span>
                            <span>
                              <strong className="text-white font-mono text-[11px]">{w.topic}:</strong>{' '}
                              {w.feedback || w.reason || 'Practice edge cases & implementation.'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] text-[#64748b] font-mono">Good performance, keep practicing!</p>
                    )}
                  </div>
                </div>

                {/* Read More Link */}
                <div className="flex justify-end pt-1">
                  <Link
                    href={`/dashboard/history/${interview.id}`}
                    className="font-mono text-[11px] text-[#818cf8] hover:text-white flex items-center gap-1 transition-colors group"
                  >
                    <span>Read Full Question-by-Question Deep Dive</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
