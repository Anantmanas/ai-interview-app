'use client'

import { useState } from 'react'
import { BrainCircuit, User, Sparkles, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react'
import { MacTrafficLights } from '@/components/ui/terminal-card'
import { motion, AnimatePresence } from 'motion/react'

interface QuestionEvalCardProps {
  question: any
  index: number
}

export function QuestionEvalCard({ question, index }: QuestionEvalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const evalData = question.ai_evaluation || {}
  const cavemanFeedback = evalData.caveman_feedback || evalData.feedback
  const fullFeedback = evalData.feedback || ''
  const improvements = evalData.improvements || evalData.improvement || ''
  const technicalAccuracy = evalData.technicalAccuracy || evalData.technical_accuracy || ''
  const score = evalData.score !== undefined ? Number(evalData.score) : null

  return (
    <div className="rounded-xl border border-[#1e2030] bg-[#09090f] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden">
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between px-4 h-9 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
        <div className="flex items-center gap-2.5">
          <MacTrafficLights size="sm" />
          <span className="font-mono text-[10px] text-[#9ca3af]">
            evaluation-q{index + 1}.json — bash
          </span>
        </div>
        {score !== null && (
          <span
            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
              score >= 70
                ? 'text-[#818cf8] bg-[#14142b] border border-[#3730a3]'
                : 'text-[#f87171] bg-[#2a0e15] border border-[#5c1d28]'
            }`}
          >
            {score}%
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Question Header */}
        <div className="flex items-start gap-2.5">
          <span className="h-6 w-6 rounded-[4px] bg-[#14142b] border border-[#3730a3] text-[#818cf8] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <div className="space-y-1">
            <h3 className="font-display text-[15px] font-semibold text-white leading-snug">
              {question.question_text}
            </h3>
            {question.topic && (
              <span className="inline-block font-mono text-[10px] uppercase text-[#818cf8] bg-[#14142b] border border-[#3730a3]/40 px-2 py-0.5 rounded">
                Topic: {question.topic}
              </span>
            )}
          </div>
        </div>

        {/* Candidate Answer */}
        <div className="bg-[#0c0d15] border border-[#1e1e2f] rounded-lg p-3.5 space-y-1">
          <p className="font-mono text-[10px] text-[#64748b] uppercase flex items-center gap-1 font-semibold">
            <User className="h-3 w-3 text-[#818cf8]" /> Candidate Answer
          </p>
          <p className="font-mono text-[12px] text-[#e2e8f0] leading-relaxed whitespace-pre-wrap">
            {question.user_answer || '(No answer provided)'}
          </p>
        </div>

        {/* CAVEMAN QUICK TAKE (Always Visible for Instant Scan) */}
        {cavemanFeedback && (
          <div className="bg-gradient-to-r from-[#14142b] to-[#1e1b4b] border border-[#6366f1]/40 rounded-lg p-3 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold text-[#818cf8] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                ⚡ CAVEMAN QUICK TAKE
              </span>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="font-mono text-[10px] text-[#818cf8] hover:text-white flex items-center gap-1 uppercase tracking-wider cursor-pointer"
              >
                <span>{isExpanded ? 'Hide Deep Dive' : 'Read Full Analysis & Suggestions'}</span>
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>
            <p className="font-mono text-xs text-white font-semibold leading-relaxed">
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
              <div className="space-y-3 pt-2">
                {/* Full Analysis */}
                {fullFeedback && (
                  <div className="bg-[#14142b]/40 border border-[#3730a3]/50 rounded-lg p-3.5 space-y-1">
                    <p className="font-mono text-[10px] text-[#818cf8] uppercase flex items-center gap-1 font-semibold">
                      <BrainCircuit className="h-3 w-3 text-[#6366f1]" /> Detailed Technical Evaluation
                    </p>
                    <p className="font-sans text-[13px] text-[#9ca3af] leading-relaxed">
                      {fullFeedback}
                    </p>
                  </div>
                )}

                {/* Technical Accuracy */}
                {technicalAccuracy && (
                  <div className="bg-[#0c0d15] border border-[#1e2030] rounded-lg p-3.5 space-y-1">
                    <p className="font-mono text-[10px] text-[#64748b] uppercase font-semibold">
                      Technical Accuracy Notes
                    </p>
                    <p className="font-sans text-[12px] text-[#9ca3af] leading-relaxed">
                      {technicalAccuracy}
                    </p>
                  </div>
                )}

                {/* Key Suggestions / Improvements */}
                {improvements && (
                  <div className="bg-[#0c0d15] border border-[#3730a3]/40 rounded-lg p-3.5 space-y-1">
                    <p className="font-mono text-[10px] text-[#22c55e] uppercase flex items-center gap-1 font-semibold">
                      <Lightbulb className="h-3 w-3" /> Key Improvement Suggestions
                    </p>
                    <p className="font-sans text-[12px] text-[#cbd5e1] leading-relaxed">
                      {improvements}
                    </p>
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
