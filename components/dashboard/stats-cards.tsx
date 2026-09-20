'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Calendar, TrendingUp, Clock, Target } from 'lucide-react'

/* ── Count-up animation hook ──────────────────────────────────── */

function useCountUp(target: number, duration = 1200, startDelay = 300) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (target === 0) return
    const delay = setTimeout(() => {
      const startTime = Date.now()
      const tick = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.round(eased * target))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, startDelay)
    return () => clearTimeout(delay)
  }, [target, duration, startDelay])

  return count
}

/* ── Component ────────────────────────────────────────────────── */

interface StatsCardsProps {
  totalInterviews: number
  completedCount: number
  averageScore: number
  practiceHours: number
  weaknessCount: number
}

export function StatsCards({
  totalInterviews,
  completedCount,
  averageScore,
  practiceHours,
  weaknessCount,
}: StatsCardsProps) {
  // practiceHours is a float like 1.3 — multiply by 10 to count up as integer, divide for display
  const practiceHoursTenths = Math.round(practiceHours * 10)

  const totalCount  = useCountUp(totalInterviews,    1000, 300)
  const avgCount    = useCountUp(averageScore,        1200, 500)
  const hoursCount  = useCountUp(practiceHoursTenths, 1000, 450)
  const weakCount   = useCountUp(weaknessCount,        800, 250)

  const stats = [
    {
      label: 'TOTAL INTERVIEWS',
      display: `${totalCount}`,
      sub: `${completedCount} completed`,
      icon: Calendar,
      iconColor: 'text-[#71d083]',
    },
    {
      label: 'AVERAGE SCORE',
      display: `${avgCount}%`,
      sub: 'Across completed sessions',
      icon: TrendingUp,
      iconColor: 'text-[#70b8ff]',
    },
    {
      label: 'PRACTICE TIME',
      display: `${(hoursCount / 10).toFixed(1)}h`,
      sub: 'Total time spent practicing',
      icon: Clock,
      iconColor: 'text-[#baa7ff]',
    },
    {
      label: 'ACTIVE WEAKNESSES',
      display: `${weakCount}`,
      sub: 'Areas to improve',
      icon: Target,
      iconColor: 'text-[#f87171]',
    },
  ]

  return (
    <motion.div
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08 } },
      }}
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          variants={{
            hidden:   { opacity: 0, y: 16 },
            visible:  { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
          }}
          className="card-console p-5 hover:border-[#4c1d95] transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-[10px] text-[#948bb0] uppercase tracking-[0.1em] font-semibold">
              {stat.label}
            </p>
            <div className="p-1.5 rounded-[4px] bg-[#140e24] border border-[#291a45]">
              <stat.icon className={`h-3.5 w-3.5 ${stat.iconColor}`} />
            </div>
          </div>
          <p className="font-display text-[32px] font-bold text-[#fdfcff] leading-[1] tracking-[-0.02em] mb-1">
            {stat.display}
          </p>
          <p className="font-mono text-[11px] text-[#948bb0]">{stat.sub}</p>
        </motion.div>
      ))}
    </motion.div>
  )
}
