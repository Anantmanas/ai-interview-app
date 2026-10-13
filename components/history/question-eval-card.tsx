'use client'

import { useState } from 'react'
import { BrainCircuit, User, Sparkles, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react'
import { MacTrafficLights } from '@/components/ui/terminal-card'
import { motion, AnimatePresence } from 'motion/react'

interface QuestionEvalCardProps {
  question: any
  index: number
}

function parseSuggestions(input?: string | string[]): string[] {
  if (!input) return []
  if (Array.isArray(input)) return input.filter(Boolean).map(s => String(s).trim())
  const trimmed = String(input).trim()
  if (!trimmed) return []

  // Handle sentences running together without spaces or standard delimiters
  // Split on newlines, numbered list markers (1. / 1) / (1)), bullets, or punctuation followed by capital letters
  const parts = trimmed
    .split(/(?:\r?\n)+|(?<=[.!?])\s*(?=\d+[\.\)])|(?<=[.!?])\s+(?=[A-Z])|(?<=\))\s*(?=[A-Z])/)
    .map(s => s.trim().replace(/^(?:\d+[\.\)]|•|\*|-)\s*/, ''))
    .filter(s => s.length > 0)

  return parts.length > 0 ? parts : [trimmed]
}

export function QuestionEvalCard({ question, index }: QuestionEvalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const evalData = question.ai_evaluation || {}
  const cavemanFeedback = evalData.caveman_feedback || evalData.feedback
  const fullFeedback = evalData.feedback || ''
  const improvements = evalData.improvements || evalData.improvement || ''
  const parsedImprovements = parseSuggestions(improvements)
  const technicalAccuracy = evalData.technicalAccuracy || evalData.technical_accuracy || ''
  const score = evalData.score !== undefined ? Number(evalData.score) : null

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0a0a0a] shadow-xl overflow-hidden">
      {/* Editorial Marker Header */}
      <div className="flex items-center justify-between px-6 sm:px-7 h-12 border-b border-white/10 bg-white/[0.02] select-none">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs font-semibold text-[#8052ff]">
            QUESTION {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-white/20">•</span>
          <span className="font-mono text-[10px] text-white/40 uppercase">
            {question.topic || question.question_type || 'TECHNICAL'}
          </span>
        </div>
        {score !== null && (
          <span
            className={`font-mono text-xs font-semibold px-3 py-0.5 rounded-full ${
              score >= 70
                ? 'text-[#15846e] bg-[#15846e]/20 border border-[#15846e]/40'
                : 'text-[#ffb829] bg-[#ffb829]/20 border border-[#ffb829]/40'
            }`}
          >
            {score}% SIGNAL
          </span>
        )}
      </div>

      <div className="p-6 sm:p-7 space-y-5">
        {/* Question Header */}
        <div className="flex items-start gap-3">
          <span className="h-7 w-7 rounded-full bg-white/5 border border-white/10 text-[#8052ff] font-mono text-xs font-semibold flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <div className="space-y-1.5">
            <h3 className="font-sans text-base sm:text-lg font-light text-white leading-snug">
              {question.question_text}
            </h3>
            {question.topic && (
              <span className="inline-block font-mono text-[10px] uppercase text-[#8052ff] bg-[#8052ff]/10 border border-[#8052ff]/30 px-2.5 py-0.5 rounded-full font-semibold">
                Topic: {question.topic}
              </span>
            )}
          </div>
        </div>

        {/* Candidate Answer */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-1.5">
          <p className="font-mono text-[10px] text-white/40 uppercase flex items-center gap-1.5 font-semibold">
            <User className="h-3 w-3 text-[#8052ff]" /> Candidate Answer
          </p>
          <p className="font-mono text-[12px] text-white/80 leading-relaxed whitespace-pre-wrap">
            {question.user_answer || '(No answer provided)'}
          </p>
        </div>

        {/* CAVEMAN QUICK TAKE (Always Visible for Instant Scan) */}
        {cavemanFeedback && (
          <div className="bg-white/[0.03] border border-[#8052ff]/30 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-semibold text-[#8052ff] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                ⚡ CAVEMAN QUICK TAKE
              </span>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="font-mono text-[10px] text-white/50 hover:text-white flex items-center gap-1 uppercase tracking-wider cursor-pointer transition-colors"
              >
                <span>{isExpanded ? 'Hide Deep Dive' : 'Read Full Analysis & Suggestions'}</span>
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>
            <p className="font-mono text-xs text-white leading-relaxed">
              {cavemanFeedback}
            </p>
          </div>
        )}

        {/* Collapsible Full Diagnostic & Suggestions Drawer */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="space-y-3.5 pt-2">
                {/* Full Analysis */}
                {fullFeedback && (
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-1.5">
                    <p className="font-mono text-[10px] text-[#8052ff] uppercase flex items-center gap-1.5 font-semibold">
                      <BrainCircuit className="h-3.5 w-3.5 text-[#8052ff]" /> Detailed Technical Evaluation
                    </p>
                    <p className="font-sans text-[13px] text-white/70 leading-relaxed font-light">
                      {fullFeedback}
                    </p>
                  </div>
                )}

                {/* Technical Accuracy */}
                {technicalAccuracy && (
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-1.5">
                    <p className="font-mono text-[10px] text-white/40 uppercase font-semibold">
                      Technical Accuracy Notes
                    </p>
                    <p className="font-sans text-[12px] text-white/70 leading-relaxed font-light">
                      {technicalAccuracy}
                    </p>
                  </div>
                )}

                {/* Key Suggestions / Improvements */}
                {parsedImprovements.length > 0 && (
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-2">
                    <p className="font-mono text-[10px] text-[#15846e] uppercase flex items-center gap-1.5 font-semibold">
                      <Lightbulb className="h-3.5 w-3.5 text-[#15846e]" /> Key Improvement Suggestions ({parsedImprovements.length})
                    </p>
                    <ul className="space-y-1.5 font-sans text-[12px] text-white/80 leading-relaxed font-light">
                      {parsedImprovements.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#8052ff] font-mono text-[11px] shrink-0 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
