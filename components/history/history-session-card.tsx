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
    <div className="rounded-2xl border border-white/10 bg-[#0D0D0D] shadow-xl hover:border-white/20 transition-all overflow-hidden group">
      {/* Titlebar */}
      <div className="flex items-center justify-between px-6 h-11 border-b border-white/10 bg-white/[0.02] select-none">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[10px] text-[#8C8C88] font-semibold tracking-wider uppercase">
            SESSION // #{String(totalCount - index).padStart(2, '0')}
          </span>
        </div>
        <div>
          {interview.status === 'completed' ? (
            <span className="font-mono text-[9px] text-[#34d399] bg-[#052016] border border-[#065f46] rounded-md px-2 py-0.5 uppercase tracking-wider font-semibold">
              COMPLETED
            </span>
          ) : (
            <span className="font-mono text-[9px] text-[#8C8C88] bg-white/5 border border-white/10 rounded-md px-2 py-0.5 uppercase tracking-wider">
              IN_PROGRESS
            </span>
          )}
        </div>
      </div>

      {/* Main Card Content */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[12px] font-bold text-[#2447FF]">
                [{String(totalCount - index).padStart(2, '0')}]
              </span>
              <h3 className="font-display font-bold text-[18px] sm:text-[19px] text-[#F4F2EC] group-hover:text-[#2447FF] transition-colors">
                {interview.title}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[12px] font-mono text-[#8C8C88]">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#8C8C88]" />
                {formatSessionDate(interview.created_at)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#8C8C88]" />
                {formatDuration(interview.duration_seconds)}
              </span>
              <span>•</span>
              <span className="bg-white/5 border border-white/10 rounded-md px-2 py-0.5 uppercase text-[10px] text-white">
                {interview.type.replace('_', ' ')}
              </span>
              <span className="bg-white/5 border border-white/10 rounded-md px-2 py-0.5 uppercase text-[10px] text-[#8C8C88]">
                {interview.difficulty}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10">
            <div className="text-left sm:text-right mr-2">
              {interview.overall_score !== null && interview.overall_score > 0 ? (
                <>
                  <div className="font-display text-[28px] font-bold text-[#34d399] leading-none">
                    {interview.overall_score}%
                  </div>
                  <div className="font-mono text-[9px] text-[#8C8C88] uppercase mt-1">Accuracy</div>
                </>
              ) : interview.status === 'completed' ? (
                <span className="font-mono text-[10px] text-[#8C8C88] bg-white/5 border border-white/10 rounded-md px-2 py-1">
                  PENDING
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              {/* Collapsible Dropdown Toggle */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#8C8C88] hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-xl cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#2447FF]" />
                <span>{isExpanded ? 'Hide' : 'Analysis'}</span>
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>

              <Link
                href={interview.status === 'completed' ? `/dashboard/history/${interview.id}` : `/interview/${interview.id}`}
                className="bg-[#2447FF] hover:bg-[#1f3ce0] text-white inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider px-4 py-2 rounded-xl shadow-sm transition-all"
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
                  <div className="bg-[#141414] border border-white/10 rounded-xl p-4 space-y-1.5">
                    <p className="font-mono text-[10px] text-[#2447FF] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>EVALUATION SUMMARY</span>
                    </p>
                    <p className="text-xs text-[#8C8C88] font-sans leading-relaxed">
                      {summary}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {strengths.length > 0 && (
                    <div className="bg-[#141414] border border-white/10 rounded-xl p-4 space-y-2">
                      <p className="font-mono text-[10px] text-[#34d399] font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>CONFIRMED STRENGTHS</span>
                      </p>
                      <ul className="space-y-1.5 text-xs text-[#8C8C88] font-sans">
                        {strengths.map((str: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#34d399] font-mono text-[10px] mt-0.5">✓</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {weaknesses.length > 0 && (
                    <div className="bg-[#141414] border border-white/10 rounded-xl p-4 space-y-2">
                      <p className="font-mono text-[10px] text-[#f43f5e] font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>IDENTIFIED BLINDSPOTS</span>
                      </p>
                      <ul className="space-y-1.5 text-xs text-[#8C8C88] font-sans">
                        {weaknesses.map((weak: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#f43f5e] font-mono text-[10px] mt-0.5">!</span>
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
