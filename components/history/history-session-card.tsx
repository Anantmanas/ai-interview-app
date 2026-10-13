'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { formatSessionDate } from '@/lib/utils'

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
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] hover:border-[#8052ff]/40 hover:shadow-[0_20px_60px_rgba(128,82,255,0.08)] transition-all overflow-hidden group">
      {/* Titlebar */}
      <div className="flex items-center justify-between px-6 sm:px-7 h-12 border-b border-white/10 bg-white/[0.02] select-none">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8052ff] shadow-[0_0_6px_#8052ff]" />
          <span className="font-mono text-[10px] text-white/50 font-semibold tracking-wider uppercase">
            SESSION // #{String(totalCount - index).padStart(2, '0')}
          </span>
        </div>
        <div>
          {interview.status === 'completed' ? (
            <span className="font-mono text-[9px] text-[#15846e] bg-[#15846e]/20 border border-[#15846e]/40 rounded-full px-2.5 py-0.5 uppercase tracking-wider font-semibold">
              COMPLETED
            </span>
          ) : (
            <span className="font-mono text-[9px] text-[#ffb829] bg-[#ffb829]/15 border border-[#ffb829]/30 rounded-full px-2.5 py-0.5 uppercase tracking-wider font-semibold">
              IN_PROGRESS
            </span>
          )}
        </div>
      </div>

      {/* Main Card Content */}
      <div className="p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-semibold text-[#8052ff]">
                [{String(totalCount - index).padStart(2, '0')}]
              </span>
              <h3 className="font-sans font-light text-lg sm:text-xl text-white group-hover:text-[#8052ff] transition-colors">
                {interview.title}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-white/50">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-white/40" />
                {formatSessionDate(interview.created_at)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-white/40" />
                {formatDuration(interview.duration_seconds)}
              </span>
              <span>•</span>
              <span className="bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5 uppercase text-[10px] text-white">
                {interview.type.replace('_', ' ')}
              </span>
              <span className="bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5 uppercase text-[10px] text-white/50">
                {interview.difficulty}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10">
            <div className="text-left sm:text-right mr-2">
              {interview.overall_score !== null && interview.overall_score !== undefined ? (
                <>
                  <div className={`font-sans text-3xl font-light leading-none ${interview.overall_score >= 70 ? 'text-[#15846e]' : interview.overall_score > 0 ? 'text-[#8052ff]' : 'text-zinc-400'}`}>
                    {interview.overall_score}%
                  </div>
                  <div className="font-mono text-[9px] text-white/40 uppercase mt-1">Accuracy</div>
                </>
              ) : (
                <span className="font-mono text-[10px] text-[#ffb829] bg-[#ffb829]/10 border border-[#ffb829]/30 rounded-full px-2.5 py-1">
                  PENDING
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Collapsible Dropdown Toggle */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-white/70 hover:text-white transition-all bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 px-4 py-2 rounded-full cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#8052ff]" />
                <span>{isExpanded ? 'Hide' : 'Analysis'}</span>
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>

              <Link
                href={interview.status === 'completed' ? `/dashboard/history/${interview.id}` : `/interview/${interview.id}`}
                className="btn-dala-primary inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider px-5 py-2 rounded-full text-white shadow-[0_0_20px_rgba(128,82,255,0.35)] transition-all cursor-pointer"
              >
                <span>{interview.status === 'completed' ? 'Details' : 'Resume'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
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
              <div className="mt-5 pt-5 border-t border-white/10 space-y-4">
                {summary && (
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-1.5">
                    <p className="font-mono text-[10px] text-[#8052ff] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>EVALUATION SUMMARY</span>
                    </p>
                    <p className="text-xs text-white/70 font-sans leading-relaxed font-light">
                      {summary}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {strengths.length > 0 && (
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-2">
                      <p className="font-mono text-[10px] text-[#15846e] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>CONFIRMED STRENGTHS</span>
                      </p>
                      <ul className="space-y-1.5 text-xs text-white/70 font-sans font-light">
                        {strengths.map((str: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#15846e] font-mono text-[10px] mt-0.5">✓</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {weaknesses.length > 0 && (
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-2">
                      <p className="font-mono text-[10px] text-[#ffb829] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>IDENTIFIED BLINDSPOTS</span>
                      </p>
                      <ul className="space-y-1.5 text-xs text-white/70 font-sans font-light">
                        {weaknesses.map((weak: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#ffb829] font-mono text-[10px] mt-0.5">!</span>
                            <span>{weak}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
