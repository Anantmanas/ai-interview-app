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
      accent: '#FFD700',
      bg: 'rgba(255,215,0,0.06)',
      border: 'rgba(255,215,0,0.2)',
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
      accent: '#00D4AA',
      bg: 'rgba(0,212,170,0.06)',
      border: 'rgba(0,212,170,0.2)',
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
      accent: '#FF6B9D',
      bg: 'rgba(255,107,157,0.06)',
      border: 'rgba(255,107,157,0.2)',
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
      accent: '#7B6FFF',
      bg: 'rgba(123,111,255,0.06)',
      border: 'rgba(123,111,255,0.2)',
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
      accent: '#00D4AA',
      bg: 'rgba(0,212,170,0.06)',
      border: 'rgba(0,212,170,0.2)',
    }
  }

  // Default — keep practicing
  return {
    icon: Mic,
    label: 'READY',
    cta: 'Keep your streak going with another practice session.',
    ctaButton: 'Start interview →',
    href: '/interview/new',
    accent: '#00D4AA',
    bg: 'rgba(0,212,170,0.06)',
    border: 'rgba(0,212,170,0.2)',
  }
}

export function NextStepBanner(props: NextStepBannerProps) {
  const config = getBannerConfig(props)
  const Icon = config.icon

  return (
    <Link
      href={config.href}
      className="group block w-full rounded-2xl transition-all duration-200 hover:scale-[1.005] relative overflow-hidden"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${config.accent}60, transparent)` }} />

      <div className="flex items-center gap-4 px-5 py-4">
        {/* Pulsing dot + Icon */}
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 relative"
          style={{ background: `${config.accent}18`, border: `1px solid ${config.accent}30` }}
        >
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: config.accent }} />
          <Icon className="h-5 w-5" style={{ color: config.accent }} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.14em] font-semibold mb-0.5"
            style={{ color: config.accent }}
          >
            {config.label}
          </p>
          <p className="font-body text-sm text-[#F4F2EC] mt-0.5 truncate">
            {config.cta}
          </p>
        </div>

        {/* CTA button */}
        <span
          className="shrink-0 font-mono text-[12px] whitespace-nowrap ml-4 group-hover:translate-x-0.5 transition-transform"
          style={{ color: config.accent }}
        >
          {config.ctaButton}
        </span>

        {/* Arrow */}
        <div className="shrink-0">
          <ArrowRight
            className="h-5 w-5 text-[#8C8C88] group-hover:text-white transition-all duration-200 group-hover:translate-x-0.5"
          />
        </div>
      </div>
    </Link>
  )
}
