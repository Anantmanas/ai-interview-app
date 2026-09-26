import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Clock, 
  Calendar, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  BrainCircuit,
  User,
  Star,
  Trophy
} from 'lucide-react'
import { MacTrafficLights } from '@/components/ui/terminal-card'
import { QuestionEvalCard } from '@/components/history/question-eval-card'

export default async function InterviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: interview } = await supabase
    .from('interviews')
    .select('*')
    .eq('id', id)
    .single()

  if (!interview) {
    notFound()
  }

  const { data: questions } = await supabase
    .from('interview_questions')
    .select('*')
    .eq('interview_id', id)
    .order('sequence_order', { ascending: true })

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-[1300px] space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/history"
          className="inline-flex items-center gap-1.5 font-mono text-[12px] uppercase text-[#9ca3af] hover:text-[#818cf8] transition-colors py-1 px-2.5 rounded-[4px] hover:bg-[#09090e]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to History
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1e1e2f] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display text-[28px] sm:text-[34px] font-bold text-white">{interview.title}</h1>
            <span className="font-mono text-[10px] uppercase text-[#818cf8] bg-[#4f46e5]/15 border border-[#4f46e5]/30 rounded-[4px] px-2.5 py-0.5">
              {interview.type.replace('_', ' ')}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-[#9ca3af]">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-[#64748b]" />
              {new Date(interview.created_at).toLocaleDateString('en-US', {
                month: 'long',
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
            <span className="capitalize text-[#9ca3af]">
              Difficulty: {interview.difficulty}
            </span>
          </div>
        </div>
        
        {interview.overall_score !== null && (
          <div className="flex items-center gap-4 bg-[#09090e] border border-[#3730a3] rounded-[8px] p-4 pr-8 shadow-[0_0_20px_rgba(79,70,229,0.2)]">
            <div className="bg-[#14142b] p-3 rounded-[6px] border border-[#3730a3]">
              <Trophy className="h-7 w-7 text-[#818cf8]" />
            </div>
            <div>
              <div className="font-display text-[32px] font-bold bg-gradient-to-r from-[#6366f1] to-[#818cf8] bg-clip-text text-transparent leading-none">
                {interview.overall_score}%
              </div>
              <div className="font-mono text-[10px] uppercase text-[#64748b] mt-1">Overall Score</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-mono text-[12px] uppercase tracking-[0.1em] text-[#818cf8] font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#6366f1]" />
            Question-by-Question Assessment
          </h2>
          
          {questions && questions.length > 0 ? (
            <div className="space-y-4">
              {questions.map((q, i) => (
                <QuestionEvalCard
                  key={q.id}
                  question={q}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-[#1e2030] bg-[#09090f] p-12 text-center">
              <p className="font-mono text-[12px] text-[#64748b] uppercase">// NO QUESTIONS RECORDED</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Strengths & Weaknesses */}
          <div className="rounded-xl border border-[#1e2030] bg-[#09090f] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden">
            <div className="flex items-center gap-2.5 px-4 h-9 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
              <MacTrafficLights size="sm" />
              <span className="font-mono text-[10px] text-[#9ca3af]">
                diagnostics.summary — bash
              </span>
            </div>
            <div className="p-5 space-y-6">
            <div className="border-b border-[#1e1e2f] pb-3">
              <h4 className="font-mono text-[11px] text-white uppercase tracking-[0.08em] font-semibold">
                Performance Diagnostics
              </h4>
            </div>

            {interview.strengths && interview.strengths.length > 0 && (
              <div className="space-y-2.5">
                <h5 className="font-mono text-[11px] font-bold uppercase text-[#818cf8] flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5" /> Key Strengths
                </h5>
                <ul className="space-y-2">
                  {interview.strengths.map((s: string, i: number) => (
                    <li key={i} className="font-body text-[13px] text-[#9ca3af] flex gap-2">
                      <span className="text-[#6366f1] font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {interview.weaknesses && interview.weaknesses.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-[#1e1e2f]">
                <h5 className="font-mono text-[11px] font-bold uppercase text-[#f87171] flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" /> Identified Weaknesses
                </h5>
                <ul className="space-y-2">
                  {interview.weaknesses.map((w: any, i: number) => (
                    <li key={i} className="font-body text-[13px] text-[#9ca3af] flex gap-2">
                      <span className="text-[#f87171] font-bold">•</span>
                      <div>
                        <strong className="text-white font-medium">{w.topic}:</strong> {w.feedback}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!interview.strengths && !interview.weaknesses && (
              <div className="font-mono text-[11px] text-[#64748b] italic text-center py-4">
                Complete an evaluation to see strengths and weaknesses.
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
