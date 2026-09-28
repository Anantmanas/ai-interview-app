import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  Target,
  AlertTriangle,
  ArrowRight,
  Mic,
  Code2,
  Network,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Compass,
} from 'lucide-react'
import { ResumeUploadCard } from '@/components/dashboard/resume-upload-card'
import { EditorialHeroMetric } from '@/components/dashboard/editorial-hero-metric'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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
    supabase
      .from('interviews')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('user_weaknesses')
      .select('*')
      .eq('user_id', user.id)
      .order('weakness_score', { ascending: false }),
    supabase.from('roadmap_items').select('*').eq('user_id', user.id),
  ])

  const completedInterviews = interviews?.filter((i) => i.status === 'completed') ?? []
  const averageScore =
    completedInterviews.length > 0
      ? Math.round(
          completedInterviews.reduce((sum, i) => sum + (i.overall_score ?? 0), 0) /
            completedInterviews.length,
        )
      : 0
  const totalPracticeTime =
    interviews?.reduce((sum, i) => sum + (i.duration_seconds ?? 0), 0) ?? 0
  const practiceHours = Math.round((totalPracticeTime / 3600) * 10) / 10

  const completedRoadmapItems =
    roadmapItems?.filter((r) => r.status === 'completed').length ?? 0
  const totalRoadmapItems = roadmapItems?.length ?? 0
  const roadmapProgress =
    totalRoadmapItems > 0
      ? Math.round((completedRoadmapItems / totalRoadmapItems) * 100)
      : 0

  const recentInterviews = interviews?.slice(0, 5) ?? []
  const name =
    profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Engineer'
  const targetRole = profile?.target_role || 'Staff / Senior Engineer'

  return (
    <div className="p-6 sm:p-10 md:p-12 max-w-[1400px] mx-auto space-y-12 select-text">
      {/* ── Large Editorial Welcome Statement (No terminal chrome) ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/10 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#8C8C88]">
              CONSOLE // OVERVIEW
            </span>
            <span className="text-white/20">•</span>
            <span className="font-mono text-xs text-[#2447FF] uppercase tracking-wider font-medium">
              {targetRole}
            </span>
          </div>

          <h1 className="display-statement text-[#F4F2EC] font-bold">
            Welcome back, {name}.
          </h1>

          <p className="font-body text-base sm:text-lg text-[#8C8C88] mt-3 max-w-2xl font-light">
            Telemetry synchronized. Review diagnosed blindspots or initiate a focused practice simulation.
          </p>
        </div>

        {/* Quick Launch Action & Mode Selectors */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
          <Link
            href="/interview/new"
            className="inline-flex items-center justify-center gap-2.5 bg-[#2447FF] hover:bg-[#1A3AE8] text-white font-mono text-xs uppercase tracking-[0.1em] font-semibold px-6 py-4 rounded-xl shadow-lg transition-all hover:scale-[1.01]"
          >
            <Mic className="h-4 w-4" />
            <span>Launch Simulation</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ── Dominant Metric & Asymmetric Telemetry Row ── */}
      <EditorialHeroMetric
        averageScore={averageScore}
        totalInterviews={interviews?.length ?? 0}
        completedCount={completedInterviews.length}
        practiceHours={practiceHours}
        weaknessCount={weaknesses?.length ?? 0}
      />

      {/* ── Candidate Resume Grounding Layer ── */}
      <ResumeUploadCard />

      {/* ── Asymmetric Dual Column: Editorial Timeline & Visual Signal Matrix ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column (7 cols): Recent Sessions as Editorial Timeline */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#2447FF]" />
              <h3 className="font-display text-xl font-bold text-[#F4F2EC]">
                Recent Sessions
              </h3>
            </div>
            <Link
              href="/dashboard/history"
              className="font-mono text-xs text-[#8C8C88] hover:text-white uppercase tracking-wider transition-colors inline-flex items-center gap-1"
            >
              <span>View full archive</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentInterviews.length > 0 ? (
            <div className="divide-y divide-white/[0.08]">
              {recentInterviews.map((interview, index) => {
                const isCompleted = interview.status === 'completed'
                const score = interview.overall_score
                return (
                  <Link
                    key={interview.id}
                    href={`/interview/${interview.id}`}
                    className="group py-5 flex items-center justify-between gap-4 transition-colors hover:bg-white/[0.02] px-2 rounded-lg"
                  >
                    <div className="flex items-baseline gap-4 min-w-0">
                      <span className="font-mono text-xs text-[#8C8C88] shrink-0">
                        0{index + 1}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-display text-base font-semibold text-[#F4F2EC] group-hover:text-[#2447FF] transition-colors truncate">
                          {interview.title}
                        </h4>
                        <div className="flex items-center gap-3 font-mono text-xs text-[#8C8C88] mt-1">
                          <span>{new Date(interview.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="uppercase">{interview.type || 'TECHNICAL'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isCompleted ? (
                        score !== null ? (
                          <span className="font-mono text-xs font-bold text-[#34d399] bg-[#34d399]/10 border border-[#34d399]/30 px-3 py-1 rounded-full">
                            {score}% SIGNAL
                          </span>
                        ) : (
                          <span className="font-mono text-xs text-[#8C8C88] bg-white/[0.05] border border-white/10 px-3 py-1 rounded-full">
                            EVALUATED
                          </span>
                        )
                      ) : (
                        <span className="font-mono text-xs text-[#fbbf24] bg-[#fbbf24]/10 border border-[#fbbf24]/30 px-3 py-1 rounded-full">
                          IN PROGRESS
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-[#8C8C88] group-hover:text-white transition-colors" />
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl">
              <span className="font-mono text-xs uppercase text-[#8C8C88] tracking-widest block mb-2">
                NO SESSIONS RECORDED
              </span>
              <p className="font-body text-sm text-[#8C8C88] mb-5">
                Launch your first simulation to generate multi-dimensional telemetry.
              </p>
              <Link
                href="/interview/new"
                className="bg-[#2447FF] hover:bg-[#1A3AE8] text-white font-mono text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg"
              >
                Launch Mock Session
              </Link>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Weaknesses as Visual Signals & Roadmap as a Journey */}
        <div className="lg:col-span-5 space-y-10">
          {/* Section A: Weaknesses as Visual Signals */}
          <div>
            <div className="flex items-baseline justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#f43f5e]" />
                <h3 className="font-display text-xl font-bold text-[#F4F2EC]">
                  Diagnosed Blindspots
                </h3>
              </div>
              <Link
                href="/dashboard/roadmap"
                className="font-mono text-xs text-[#8C8C88] hover:text-white uppercase tracking-wider transition-colors inline-flex items-center gap-1"
              >
                <span>Remediate</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {weaknesses && weaknesses.length > 0 ? (
              <div className="space-y-3">
                {weaknesses.slice(0, 4).map((weakness) => {
                  const isHigh = weakness.weakness_score > 70
                  const isMed = weakness.weakness_score > 40
                  return (
                    <div
                      key={weakness.id}
                      className="p-4 rounded-xl border border-white/10 bg-[#0D0D0D] flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isHigh ? 'bg-[#f43f5e]' : isMed ? 'bg-[#fbbf24]' : 'bg-[#34d399]'
                            }`}
                          />
                          <span className="font-mono text-[10px] uppercase tracking-wider text-[#8C8C88]">
                            {isHigh ? 'CRITICAL GAP' : isMed ? 'MODERATE' : 'MINOR'}
                          </span>
                        </div>
                        <h5 className="font-display text-sm font-bold text-[#F4F2EC] truncate">
                          {weakness.topic}
                        </h5>
                        <p className="font-mono text-xs text-[#8C8C88] truncate mt-0.5">
                          {weakness.subtopic}
                        </p>
                      </div>

                      <Link
                        href={`/interview/new?topic=${encodeURIComponent(weakness.topic)}`}
                        className="shrink-0 font-mono text-[11px] text-[#2447FF] hover:underline uppercase tracking-wider font-semibold"
                      >
                        Re-test →
                      </Link>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-white/10 bg-[#0D0D0D] text-center">
                <CheckCircle2 className="w-5 h-5 text-[#34d399] mx-auto mb-2" />
                <span className="font-mono text-xs text-[#34d399] uppercase font-semibold block">
                  All Systems Calibrated
                </span>
                <p className="font-body text-xs text-[#8C8C88] mt-1">
                  No active blindspots diagnosed yet.
                </p>
              </div>
            )}
          </div>

          {/* Section B: Roadmap as a Journey */}
          <div>
            <div className="flex items-baseline justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-[#2447FF]" />
                <h3 className="font-display text-xl font-bold text-[#F4F2EC]">
                  Mastery Journey
                </h3>
              </div>
              <Link
                href="/dashboard/roadmap"
                className="font-mono text-xs text-[#8C8C88] hover:text-white uppercase tracking-wider transition-colors inline-flex items-center gap-1"
              >
                <span>Curriculum</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-xl border border-white/10 bg-[#0D0D0D] space-y-6">
              {/* Stepped Journey Markers */}
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white font-semibold">01 DIAGNOSE</span>
                <span className="text-white/30">→</span>
                <span className="text-white font-semibold">02 LEARN</span>
                <span className="text-white/30">→</span>
                <span className="text-[#2447FF] font-bold">03 RE-TEST</span>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between font-mono text-xs mb-2">
                  <span className="text-[#8C8C88] uppercase">Completion Rate</span>
                  <span className="font-bold text-[#F4F2EC]">{roadmapProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2447FF] rounded-full transition-all duration-500"
                    style={{ width: `${roadmapProgress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-[#8C8C88] pt-2 border-t border-white/[0.08]">
                <span>{completedRoadmapItems} of {totalRoadmapItems} modules completed</span>
                <span className="text-[#34d399] font-semibold">
                  {roadmapProgress === 100 ? 'CONQUERED' : 'IN PROGRESS'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
