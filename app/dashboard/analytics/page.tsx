'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { BarChart3, TrendingUp, Target, Zap } from 'lucide-react'

import { MacTrafficLights } from '@/components/ui/terminal-card'

const TYPE_COLORS: Record<string, string> = {
  dsa: '#6366f1',
  system_design: '#818cf8',
  behavioral: '#a5b4fc',
  frontend: '#c7d2fe',
  backend: '#3730a3',
  technical: '#4f46e5',
}

interface AnalyticsData {
  scoreOverTime: Array<{ date: string; score: number; rollingAvg: number; type: string }>
  typeBreakdown: Array<{ name: string; value: number }>
  weaknesses: Array<{ topic: string; score: number; count: number }>
  totalInterviews: number
  avgScore: number
  bestScore: number
}

function StatCard({ label, value, icon: Icon, sub, terminalTitle }: { label: string; value: string | number; icon: React.ElementType; sub?: string; terminalTitle?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[#1e2030] bg-[#09090f] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-[#3730a3] transition-all overflow-hidden flex flex-col group"
    >
      <div className="flex items-center justify-between px-3.5 h-8 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
        <div className="flex items-center gap-2">
          <MacTrafficLights size="sm" />
          <span className="font-mono text-[10px] text-[#6b7280]">
            {terminalTitle || 'metric.stat'}
          </span>
        </div>
        <div className="p-1 rounded bg-[#14142b]/60 border border-[#1e1e2f] group-hover:border-[#3730a3] transition-colors">
          <Icon className="h-3 w-3 text-[#818cf8]" />
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <p className="font-mono text-[10px] text-[#64748b] uppercase tracking-[0.1em] mb-1">{label}</p>
          <p className="font-display text-[30px] font-bold text-[#ffffff] leading-none tracking-tight">{value}</p>
        </div>
        {sub && (
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#64748b] mt-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6366f1]/80" />
            <span className="truncate">{sub}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#09090e] border border-[#1e1e2f] rounded-md px-3 py-2 shadow-xl">
      <p className="font-mono text-[10px] text-[#64748b] mb-1">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <p key={p.name} className="font-mono text-[12px]" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full bg-[#6366f1]"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <div className="mb-8">
        <p className="font-mono text-[10px] text-[#818cf8] uppercase tracking-[0.2em] mb-1">// ANALYTICS</p>
        <h1 className="font-display text-[28px] font-bold text-[#ffffff] tracking-[-0.02em]">
          Performance Analytics
        </h1>
        <p className="font-body text-[14px] text-[#9ca3af] mt-1">Track your interview progress and improvement over time.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Interviews" value={data?.totalInterviews ?? 0} icon={BarChart3} />
        <StatCard label="Average Score" value={data?.avgScore ?? 0} icon={Target} sub="out of 100" />
        <StatCard label="Best Score" value={data?.bestScore ?? 0} icon={TrendingUp} sub="personal best" />
      </div>

      {/* Score over time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-[#1e2030] bg-[#09090f] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden mb-5"
      >
        <div className="flex items-center justify-between px-4 h-10 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
          <div className="flex items-center gap-3">
            <MacTrafficLights size="sm" />
            <span className="font-mono text-[11px] text-[#9ca3af] font-medium tracking-wide">
              score-telemetry.dat — bash
            </span>
          </div>
          <span className="font-mono text-[10px] text-[#818cf8] uppercase tracking-wider">
            7-session rolling
          </span>
        </div>
        <div className="p-6">
          <h2 className="font-mono text-[12px] font-bold text-[#ffffff] uppercase tracking-[0.1em] mb-5 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#818cf8]" /> Score Over Time
          </h2>
          {data?.scoreOverTime && data.scoreOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data.scoreOverTime}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2f" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" stroke="#6366f1" fill="url(#scoreGrad)" strokeWidth={2} name="Score" dot={{ fill: '#6366f1', r: 3 }} />
                <Line type="monotone" dataKey="rollingAvg" stroke="#818cf8" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="7-session avg" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-[#64748b] font-mono text-[12px]">
              Complete more interviews to see your progress
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Type breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-[#1e2030] bg-[#09090f] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 h-10 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
            <div className="flex items-center gap-3">
              <MacTrafficLights size="sm" />
              <span className="font-mono text-[11px] text-[#9ca3af] font-medium tracking-wide">
                type-distribution.pie — zsh
              </span>
            </div>
          </div>
          <div className="p-6">
            <h2 className="font-mono text-[12px] font-bold text-[#ffffff] uppercase tracking-[0.1em] mb-5 flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#818cf8]" /> Interview Type Breakdown
            </h2>
            {data?.typeBreakdown && data.typeBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={data.typeBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" nameKey="name">
                    {data.typeBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={TYPE_COLORS[entry.name] ?? '#9ca3af'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(v) => <span style={{ color: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-40 text-[#64748b] font-mono text-[12px]">No data yet</div>
            )}
          </div>
        </motion.div>

        {/* Weakness heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-[#1e2030] bg-[#09090f] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 h-10 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
            <div className="flex items-center gap-3">
              <MacTrafficLights size="sm" />
              <span className="font-mono text-[11px] text-[#9ca3af] font-medium tracking-wide">
                weakness-matrix.dat — bash
              </span>
            </div>
          </div>
          <div className="p-6">
            <h2 className="font-mono text-[12px] font-bold text-[#ffffff] uppercase tracking-[0.1em] mb-5 flex items-center gap-2">
              <Target className="h-4 w-4 text-[#818cf8]" /> Topic Weakness Map
            </h2>
            {data?.weaknesses && data.weaknesses.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.weaknesses} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2f" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis type="category" dataKey="topic" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'monospace' }} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" name="Weakness Score" radius={[0, 3, 3, 0]}>
                    {data.weaknesses.map((entry) => (
                      <Cell key={entry.topic} fill={entry.score < 40 ? '#f87171' : entry.score < 60 ? '#f59e0b' : '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-40 text-[#64748b] font-mono text-[12px]">No weakness data yet</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
