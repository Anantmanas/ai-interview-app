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
  href: string
  accent: string
  bg: string
  border: string
}

function getBannerConfig({
  hasResume,
  hasInterviews,
  avgScore,
  hasRoadmap,
  topRoadmapItem,
  weaknessCount,
}: NextStepBannerProps): BannerConfig {
  // Priority 1 — No resume yet
  if (!hasResume) {
    return {
      icon: Upload,
      label: 'Personalize your interviews',
      cta: 'Upload your resume to get questions tailored to your experience',
      href: '/dashboard/resume',
      accent: '#2447FF',
      bg: 'rgba(36,71,255,0.06)',
      border: 'rgba(36,71,255,0.2)',
    }
  }

  // Priority 2 — No interviews yet
  if (!hasInterviews) {
    return {
      icon: Mic,
      label: 'Start practicing',
      cta: 'Launch your first mock interview — it takes about 15 minutes',
      href: '/interview/new',
      accent: '#2447FF',
      bg: 'rgba(36,71,255,0.06)',
      border: 'rgba(36,71,255,0.2)',
    }
  }

  // Priority 3 — Weak areas detected and score is low
  if (weaknessCount > 0 && avgScore < 60) {
    return {
      icon: Map,
      label: `${weaknessCount} weak area${weaknessCount > 1 ? 's' : ''} detected`,
      cta: 'Generate your personalized study plan to fix them',
      href: '/dashboard/roadmap',
      accent: '#f59e0b',
      bg: 'rgba(245,158,11,0.06)',
      border: 'rgba(245,158,11,0.2)',
    }
  }

  // Priority 4 — Has roadmap, show current item
  if (hasRoadmap && topRoadmapItem) {
    return {
      icon: BookOpen,
      label: 'Continue your study plan',
      cta: `Next up: ${topRoadmapItem}`,
      href: '/dashboard/roadmap',
      accent: '#10b981',
      bg: 'rgba(16,185,129,0.06)',
      border: 'rgba(16,185,129,0.2)',
    }
  }

  // Default — keep practicing
  return {
    icon: Mic,
    label: 'Keep the momentum going',
    cta: 'Run another mock interview to sharpen your performance',
    href: '/interview/new',
    accent: '#2447FF',
    bg: 'rgba(36,71,255,0.06)',
    border: 'rgba(36,71,255,0.2)',
  }
}

export function NextStepBanner(props: NextStepBannerProps) {
  const config = getBannerConfig(props)
  const Icon = config.icon

  return (
    <Link
      href={config.href}
      className="group block w-full rounded-2xl transition-all duration-200 hover:scale-[1.005]"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
      }}
    >
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Icon */}
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
          style={{ background: `${config.accent}18`, border: `1px solid ${config.accent}30` }}
        >
          <Icon className="h-5 w-5" style={{ color: config.accent }} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.14em] font-semibold mb-0.5"
            style={{ color: config.accent }}
          >
            Next Step
          </p>
          <p className="font-mono text-[11px] text-[#8C8C88] uppercase tracking-[0.06em] font-semibold">
            {config.label}
          </p>
          <p className="font-body text-sm text-[#F4F2EC] mt-0.5 truncate">
            {config.cta}
          </p>
        </div>

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
