import Link from 'next/link'
import { ArrowRight, Upload, Mic, Map, BookOpen } from 'lucide-react'

interface NextStepBannerProps {
  hasResume: boolean
  hasInterviews: boolean
  interviewCount: number
  avgScore: number
  hasRoadmap: boolean
  topRoadmapItem?: string | null
  weaknessCount: number
}

type BannerConfig = {
  icon: React.ElementType
  label: string
  cta: string
  ctaButton: string
  href: string
  accent: string
  bg: string
  border: string
}

function getBannerConfig({
  hasResume,
  hasInterviews,
  interviewCount,
  avgScore,
  hasRoadmap,
  topRoadmapItem,
  weaknessCount,
}: NextStepBannerProps): BannerConfig {
  // Priority 1 — No resume yet
  if (!hasResume) {
    return {
      icon: Upload,
      label: 'SETUP',
      cta: 'Upload your resume to get questions tailored to your background.',
      ctaButton: 'Upload Resume →',
      href: '/dashboard/resume',
      accent: '#ffb829',
      bg: 'rgba(255,184,41,0.06)',
      border: 'rgba(255,184,41,0.25)',
    }
  }

  // Priority 2 — No interviews yet
  if (!hasInterviews || interviewCount === 0) {
    return {
      icon: Mic,
      label: 'GET STARTED',
      cta: 'Run your first mock interview to establish your baseline score.',
      ctaButton: 'Start first interview →',
      href: '/interview/new',
      accent: '#8052ff',
      bg: 'rgba(128,82,255,0.06)',
      border: 'rgba(128,82,255,0.25)',
    }
  }

  // Priority 3 — Weak areas detected and no roadmap
  if (weaknessCount > 0 && !hasRoadmap) {
    return {
      icon: Map,
      label: 'ACTION REQUIRED',
      cta: `${weaknessCount} weak areas identified. Generate your personalized study plan.`,
      ctaButton: 'Generate roadmap →',
      href: '/dashboard/roadmap',
      accent: '#ffb829',
      bg: 'rgba(255,184,41,0.06)',
      border: 'rgba(255,184,41,0.25)',
    }
  }

  // Priority 4 — Low average score
  if (avgScore < 50 && interviewCount > 0) {
    return {
      icon: Mic,
      label: 'KEEP PRACTICING',
      cta: `Average score is ${avgScore}%. Practice more sessions to improve.`,
      ctaButton: 'Practice now →',
      href: '/interview/new',
      accent: '#8052ff',
      bg: 'rgba(128,82,255,0.06)',
      border: 'rgba(128,82,255,0.25)',
    }
  }

  // Priority 5 — Has roadmap, show current item
  if (hasRoadmap && topRoadmapItem) {
    return {
      icon: BookOpen,
      label: 'CONTINUE LEARNING',
      cta: `Your study plan is ready. Next up: ${topRoadmapItem}`,
      ctaButton: 'Open study plan →',
      href: '/dashboard/roadmap',
      accent: '#15846e',
      bg: 'rgba(21,132,110,0.06)',
      border: 'rgba(21,132,110,0.25)',
    }
  }

  // Default — keep practicing
  return {
    icon: Mic,
    label: 'READY',
    cta: 'Keep your streak going with another practice session.',
    ctaButton: 'Start interview →',
    href: '/interview/new',
    accent: '#8052ff',
    bg: 'rgba(128,82,255,0.06)',
    border: 'rgba(128,82,255,0.25)',
  }
}

export function NextStepBanner(props: NextStepBannerProps) {
  const config = getBannerConfig(props)
  const Icon = config.icon

  return (
    <Link
      href={config.href}
      className="group block w-full rounded-3xl transition-all duration-300 hover:scale-[1.005] relative overflow-hidden backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
      }}
    >
      {/* Top ambient accent highlight */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${config.accent}80, transparent)` }}
      />

      <div className="flex items-center gap-5 px-7 py-5">
        {/* Pulsing indicator + Icon */}
        <div
          className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 relative"
          style={{ background: `${config.accent}15`, border: `1px solid ${config.accent}35` }}
        >
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: config.accent }}
          />
          <Icon className="h-5 w-5" style={{ color: config.accent }} />
        </div>

        {/* Text details */}
        <div className="flex-1 min-w-0">
          <p
            className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-medium mb-1"
            style={{ color: config.accent }}
          >
            {config.label}
          </p>
          <p className="font-sans text-sm sm:text-base text-white truncate font-light">
            {config.cta}
          </p>
        </div>

        {/* Action Link text */}
        <span
          className="shrink-0 font-mono text-xs uppercase tracking-wider whitespace-nowrap ml-4 group-hover:translate-x-1 transition-transform font-medium"
          style={{ color: config.accent }}
        >
          {config.ctaButton}
        </span>

        {/* Arrow glyph */}
        <div className="shrink-0">
          <ArrowRight
            className="h-4 w-4 text-zinc-400 group-hover:text-white transition-all duration-200 group-hover:translate-x-1"
          />
        </div>
      </div>
    </Link>
  )
}
