'use client'

interface RoadmapCTAProps {
  interview: {
    weaknesses?: unknown
    status?: string
  }
}

export function RoadmapCTA({ interview }: RoadmapCTAProps) {
  const weaknesses = Array.isArray(interview.weaknesses) ? interview.weaknesses : []
  if (weaknesses.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-[#0E0E1A]/95 backdrop-blur border-t border-[rgba(255,255,255,0.08)]">
      <div className="max-w-[600px] mx-auto flex items-center justify-between gap-4">
        <div>
          <p className="text-[#FF6B9D] text-[12px] font-mono uppercase tracking-[0.06em] mb-0.5">
            {weaknesses.length} weak area{weaknesses.length !== 1 ? 's' : ''} identified
          </p>
          <p className="text-[#B8B8D4] text-[13px]">
            Generate your study plan to fix them.
          </p>
        </div>
        <a
          href="/dashboard/roadmap"
          className="flex-shrink-0 font-mono text-[12px] bg-gradient-to-r from-[#00D4AA] to-[#7B6FFF] text-[#080810] font-semibold px-5 py-2.5 rounded-lg whitespace-nowrap"
        >
          Build roadmap →
        </a>
      </div>
    </div>
  )
}
