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
      terminalTitle: 'session.stat',
      command: 'sys:~$ query --total-sessions',
      label: 'TOTAL INTERVIEWS',
      display: `${totalCount}`,
      sub: `${completedCount} completed`,
      icon: Calendar,
      iconColor: 'text-[#818cf8]',
    },
    {
      terminalTitle: 'score.metric',
      command: 'sys:~$ eval --avg-score',
      label: 'AVERAGE SCORE',
      display: `${avgCount}%`,
      sub: 'Across completed sessions',
      icon: TrendingUp,
      iconColor: 'text-[#6366f1]',
    },
    {
      terminalTitle: 'uptime.log',
      command: 'sys:~$ get --practice-time',
      label: 'PRACTICE TIME',
      display: `${(hoursCount / 10).toFixed(1)}h`,
      sub: 'Total time spent practicing',
      icon: Clock,
      iconColor: 'text-[#a5b4fc]',
    },
    {
      terminalTitle: 'diagnostics.err',
      command: 'sys:~$ lint --weaknesses',
      label: 'ACTIVE WEAKNESSES',
      display: `${weakCount}`,
      sub: 'Areas to improve',
      icon: Target,
      iconColor: 'text-[#f87171]',
    },
  ]

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
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
          className="rounded-xl border border-[#1e2030] bg-[#09090f] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-[#3730a3] transition-all overflow-hidden flex flex-col group"
        >
          {/* macOS Terminal Titlebar */}
          <div className="flex items-center justify-between px-3.5 h-8 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#ff5f56] border border-[#e0443e]/50" />
                <span className="h-2 w-2 rounded-full bg-[#ffbd2e] border border-[#dea123]/50" />
                <span className="h-2 w-2 rounded-full bg-[#27c93f] border border-[#1aab29]/50" />
              </div>
              <span className="font-mono text-[10px] text-[#6b7280] font-medium tracking-wide">
                {stat.terminalTitle}
              </span>
            </div>
            <div className="p-1 rounded bg-[#14142b]/60 border border-[#1e1e2f] group-hover:border-[#3730a3] transition-colors">
              <stat.icon className={`h-3 w-3 ${stat.iconColor}`} />
            </div>
          </div>

          {/* Terminal Card Body */}
          <div className="p-4 flex-1 flex flex-col justify-between">
            <div className="font-mono text-[10px] text-[#64748b] truncate mb-2">
              <span className="text-[#38bdf8] font-semibold">$</span> {stat.command.replace('sys:~$ ', '')}
            </div>
            <div>
              <p className="font-display text-[32px] font-bold text-[#ffffff] leading-none tracking-[-0.02em] mb-1.5">
                {stat.display}
              </p>
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#64748b]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6366f1]/80" />
                <span className="truncate">{stat.sub}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
