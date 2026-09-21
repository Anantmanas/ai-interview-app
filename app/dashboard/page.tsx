import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar,
  TrendingUp,
  Clock,
  Target,
  AlertTriangle,
  ArrowRight,
  Mic,
} from 'lucide-react'
import { ResumeUploadCard } from '@/components/dashboard/resume-upload-card'
import { StatsCards } from '@/components/dashboard/stats-cards'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch dashboard stats
  const [
    { data: profile },
    { data: interviews },
    { data: weaknesses },
    { data: roadmapItems },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('interviews').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('user_weaknesses').select('*').eq('user_id', user.id).order('weakness_score', { ascending: false }),
    supabase.from('roadmap_items').select('*').eq('user_id', user.id),
  ])

  const completedInterviews = interviews?.filter(i => i.status === 'completed') ?? []
  const averageScore = completedInterviews.length > 0
    ? Math.round(completedInterviews.reduce((sum, i) => sum + (i.overall_score ?? 0), 0) / completedInterviews.length)
    : 0
  const totalPracticeTime = interviews?.reduce((sum, i) => sum + (i.duration_seconds ?? 0), 0) ?? 0
  const practiceHours = Math.round(totalPracticeTime / 3600 * 10) / 10

  const completedRoadmapItems = roadmapItems?.filter(r => r.status === 'completed').length ?? 0
  const totalRoadmapItems = roadmapItems?.length ?? 0
  const roadmapProgress = totalRoadmapItems > 0 ? Math.round((completedRoadmapItems / totalRoadmapItems) * 100) : 0

  const recentInterviews = interviews?.slice(0, 5) ?? []
  const name = profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Engineer'

  return (
    <div className="p-6 md:p-8 max-w-[1400px] space-y-6">
      {/* ── Header row ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] text-[#818cf8] uppercase tracking-[0.15em] mb-1 font-semibold">// DASHBOARD CONSOLE</p>
          <h1 className="font-display text-[32px] sm:text-[36px] font-bold text-[#ffffff] leading-[1.1] tracking-[-0.02em]">
            Welcome back, <span className="bg-gradient-to-r from-[#6366f1] to-[#818cf8] bg-clip-text text-transparent">{name}</span>
          </h1>
          <p className="font-body text-[14px] text-[#9ca3af] mt-1">Ready to practice? Start a new interview or review your progress.</p>
        </div>
        {/* Start Interview CTA */}
        <Link 
          href="/interview/new" 
          className="inline-flex items-center gap-2 bg-[#4f46e5] text-white hover:bg-[#5865f2] border border-[#6366f1]/40 shadow-[0_0_20px_rgba(79,70,229,0.35)] font-mono text-[12px] font-bold uppercase tracking-[0.05em] px-6 py-3 rounded-md transition-all"
        >
          <Mic className="h-4 w-4" />
          Start Interview
        </Link>
      </div>

      {/* ── AI Resume Upload & Insights with Original Brand Icons ── */}
      <ResumeUploadCard />

      {/* ── Stats cards row — animated count-up (client component) ── */}
      <StatsCards
        totalInterviews={interviews?.length ?? 0}
        completedCount={completedInterviews.length}
        averageScore={averageScore}
        practiceHours={practiceHours}
        weaknessCount={weaknesses?.length ?? 0}
      />

      {/* ── Two-column lower section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Interviews Panel (2/3 width) */}
        <div className="lg:col-span-2 card-console">
          <div className="flex items-center justify-between p-5 border-b border-[#1e1e2f]">
            <p className="font-mono text-[11px] text-[#ffffff] uppercase tracking-[0.08em] font-semibold">Recent Interviews</p>
            <Link href="/dashboard/history" className="font-mono text-[10px] text-[#818cf8] uppercase tracking-[0.05em] hover:text-white transition-colors">
              View all →
            </Link>
          </div>

          {recentInterviews.length > 0 ? (
            <div className="divide-y divide-[#1e1e2f]">
              {recentInterviews.map((interview) => (
                <Link
                  key={interview.id}
                  href={`/interview/${interview.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-[#0f0f18] hover:translate-x-1 transition-all duration-150 cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-md bg-[#14142b] border border-[#1e1e2f] group-hover:border-[#4f46e5] flex items-center justify-center flex-shrink-0 transition-colors">
                      <Clock className="h-4 w-4 text-[#818cf8]" />
                    </div>
                    <div>
                      <p className="font-display text-[14px] font-semibold text-[#f8fafc] group-hover:text-[#818cf8] transition-colors">{interview.title}</p>
                      <p className="font-mono text-[11px] text-[#64748b]">{new Date(interview.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {/* Status badge */}
                  {interview.status === 'completed' ? (
                    <span className="font-mono text-[10px] text-[#818cf8] bg-[#14142b] border border-[#3730a3] rounded-md px-2.5 py-1 uppercase tracking-[0.05em] shadow-[0_0_10px_rgba(79,70,229,0.25)]">
                      {interview.overall_score !== null ? `${interview.overall_score}% score` : 'completed'}
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-[#9ca3af] bg-[#09090e] border border-[#1e1e2f] rounded-md px-2.5 py-1 uppercase tracking-[0.05em]">
                      in progress
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <p className="font-mono text-[12px] text-[#64748b] uppercase tracking-[0.05em]">// NO SESSIONS FOUND</p>
              <p className="font-body text-[14px] text-[#9ca3af] mt-2 mb-4">No interviews yet — start your first practice session!</p>
              <Link
                href="/interview/new"
                className="inline-flex items-center gap-2 btn-neo-violet font-mono text-[11px] uppercase tracking-wider px-4 py-2 rounded-md"
              >
                Launch Interview
              </Link>
            </div>
          )}
        </div>

        {/* Right panels (1/3 width) */}
        <div className="lg:col-span-1 space-y-5">
          {/* Top Weaknesses */}
          <div className="card-console">
            <div className="flex items-center justify-between p-5 border-b border-[#1e1e2f]">
              <p className="font-mono text-[11px] text-[#ffffff] uppercase tracking-[0.08em] font-semibold">Top Weaknesses</p>
              <Link href="/dashboard/roadmap" className="font-mono text-[10px] text-[#818cf8] uppercase tracking-[0.05em] hover:text-white transition-colors">
                View all →
              </Link>
            </div>
            {weaknesses && weaknesses.length > 0 ? (
              <div className="divide-y divide-[#1e1e2f]">
                {weaknesses.slice(0, 4).map((weakness) => (
                  <div
                    key={weakness.id}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-[#0f0f18] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`h-4 w-4 shrink-0 ${
                        weakness.weakness_score > 70 
                          ? 'text-[#f87171]' 
                          : weakness.weakness_score > 40
                          ? 'text-[#818cf8]'
                          : 'text-[#9ca3af]'
                      }`} />
                      <div>
                        <p className="font-display text-[13px] font-semibold text-[#f8fafc]">{weakness.topic}</p>
                        <p className="font-mono text-[10px] text-[#64748b]">{weakness.subtopic}</p>
                      </div>
                    </div>
                    <span className={`font-mono text-[10px] rounded-md px-2 py-0.5 uppercase tracking-[0.05em] ${
                      weakness.weakness_score > 70
                        ? 'text-[#f87171] bg-[#2a0e15] border border-[#5c1d28]'
                        : weakness.weakness_score > 40
                        ? 'text-[#818cf8] bg-[#14142b] border border-[#3730a3]'
                        : 'text-[#9ca3af] bg-[#09090e] border border-[#1e1e2f]'
                    }`}>
                      {weakness.weakness_score > 70 ? 'Critical' : weakness.weakness_score > 40 ? 'Moderate' : 'Low'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="font-mono text-[12px] text-[#64748b] uppercase tracking-[0.05em]">// NO DATA</p>
                <p className="font-body text-[13px] text-[#9ca3af] mt-2">No weaknesses identified yet — complete an interview to begin tracking.</p>
              </div>
            )}
          </div>

          {/* Learning Progress */}
          <div className="card-console">
            <div className="flex items-center justify-between p-5 border-b border-[#1e1e2f]">
              <p className="font-mono text-[11px] text-[#ffffff] uppercase tracking-[0.08em] font-semibold">Learning Progress</p>
              <Link href="/dashboard/roadmap" className="font-mono text-[10px] text-[#818cf8] uppercase tracking-[0.05em] hover:text-white transition-colors">
                View roadmap →
              </Link>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between font-mono text-[12px]">
                <span className="text-[#9ca3af] uppercase">Overall Progress</span>
                <span className="font-semibold text-[#818cf8]">{roadmapProgress}%</span>
              </div>
              <div className="h-2 w-full bg-[#09090e] rounded-full overflow-hidden border border-[#1e1e2f]">
                <div
                  className="h-full bg-gradient-to-r from-[#4f46e5] to-[#818cf8] transition-all duration-300"
                  style={{ width: `${roadmapProgress}%` }}
                />
              </div>
              <p className="font-mono text-[10px] text-[#64748b]">
                {completedRoadmapItems} of {totalRoadmapItems} items completed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
