import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Clock, 
  Calendar, 
  ArrowRight,
  Mic,
  History as HistoryIcon
} from 'lucide-react'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: interviews } = await supabase
    .from('interviews')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-[1200px] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] text-[#c084fc] uppercase tracking-[0.15em] mb-1 font-semibold">// SESSIONS ARCHIVE</p>
          <h1 className="font-display text-[32px] font-bold text-[#fdfcff] leading-[1.1] tracking-[-0.02em]">Interview History</h1>
          <p className="font-body text-[14px] text-[#c8c0e0] mt-1">
            Review your past interviews and track your progress over time.
          </p>
        </div>
        <Link 
          href="/interview/new" 
          className="inline-flex items-center gap-2 btn-neo-violet font-mono text-[12px] font-bold uppercase tracking-[0.05em] px-6 py-2.5 rounded-[6px]"
        >
          <Mic className="h-4 w-4" />
          New Interview
        </Link>
      </div>

      {interviews && interviews.length > 0 ? (
        <div className="grid gap-3.5">
          {interviews.map((interview) => (
            <div key={interview.id} className="card-console p-5 hover:border-[#a855f7] transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display font-semibold text-[16px] text-[#fdfcff]">{interview.title}</h3>
                    {interview.status === 'completed' ? (
                      <span className="font-mono text-[10px] text-[#c084fc] bg-[#201138] border border-[#4c1d95] rounded-[4px] px-2.5 py-0.5 uppercase tracking-[0.05em]">
                        completed
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-[#948bb0] bg-[#140e24] border border-[#291a45] rounded-[4px] px-2.5 py-0.5 uppercase tracking-[0.05em]">
                        in progress
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[12px] font-mono text-[#948bb0]">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-[#50446b]" />
                      {new Date(interview.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-[#50446b]" />
                      {formatDuration(interview.duration_seconds)}
                    </span>
                    <span>•</span>
                    <span className="bg-[#140e24] border border-[#291a45] rounded-[3px] px-2 py-0.5 uppercase text-[10px] text-[#c8c0e0]">
                      {interview.type.replace('_', ' ')}
                    </span>
                    <span className="bg-[#140e24] border border-[#291a45] rounded-[3px] px-2 py-0.5 uppercase text-[10px] text-[#c8c0e0]">
                      {interview.difficulty}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {interview.overall_score !== null && (
                    <div className="text-right">
                      <div className="font-display text-[26px] font-bold bg-gradient-to-r from-[#c084fc] to-[#a855f7] bg-clip-text text-transparent leading-none">
                        {interview.overall_score}%
                      </div>
                      <div className="font-mono text-[10px] text-[#50446b] uppercase mt-0.5">Score</div>
                    </div>
                  )}
                  <Link 
                    href={interview.status === 'completed' ? `/dashboard/history/${interview.id}` : `/interview/${interview.id}`}
                    className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.05em] text-[#c084fc] hover:text-[#fdfcff] transition-colors bg-[#140e24] border border-[#291a45] hover:border-[#4c1d95] px-3.5 py-2 rounded-[6px]"
                  >
                    {interview.status === 'completed' ? 'View Results' : 'Resume Interview'}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-console p-16 text-center">
          <HistoryIcon className="h-12 w-12 mx-auto mb-4 text-[#50446b]" />
          <p className="font-mono text-[12px] text-[#50446b] uppercase tracking-[0.05em]">// NO SESSIONS FOUND</p>
          <p className="font-body text-[14px] text-[#948bb0] mt-2 mb-6">
            Start your first practice interview to begin tracking your progress.
          </p>
          <Link 
            href="/interview/new" 
            className="inline-flex items-center gap-2 btn-neo-violet font-mono text-[12px] font-bold uppercase tracking-[0.05em] px-6 py-3 rounded-[6px]"
          >
            Start Your First Interview
          </Link>
        </div>
      )}
    </div>
  )
}
