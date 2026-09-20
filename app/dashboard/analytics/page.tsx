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

const TYPE_COLORS: Record<string, string> = {
  dsa: '#71d083',
  system_design: '#70b8ff',
  behavioral: '#c084fc',
  frontend: '#f59e0b',
  backend: '#f87171',
  technical: '#71d083',
}

interface AnalyticsData {
  scoreOverTime: Array<{ date: string; score: number; rollingAvg: number; type: string }>
  typeBreakdown: Array<{ name: string; value: number }>
  weaknesses: Array<{ topic: string; score: number; count: number }>
  totalInterviews: number
  avgScore: number
  bestScore: number
}

function StatCard({ label, value, icon: Icon, sub }: { label: string; value: string | number; icon: React.ElementType; sub?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0c0c10] border border-[#2b292d] rounded-[8px] p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] text-[#49474e] uppercase tracking-[0.1em] mb-1">{label}</p>
          <p className="font-display text-[32px] font-bold text-[#e5e5e5] leading-none">{value}</p>
          {sub && <p className="font-mono text-[11px] text-[#49474e] mt-1">{sub}</p>}
        </div>
        <div className="h-9 w-9 rounded-full bg-[#71d083]/10 border border-[#71d083]/20 flex items-center justify-center">
          <Icon className="h-4 w-4 text-[#71d083]" />
        </div>
      </div>
    </motion.div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0c0c10] border border-[#2b292d] rounded-[6px] px-3 py-2 shadow-xl">
      <p className="font-mono text-[10px] text-[#49474e] mb-1">{label}</p>
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
              className="h-2 w-2 rounded-full bg-[#71d083]"
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
        <p className="font-mono text-[10px] text-[#71d083] uppercase tracking-[0.2em] mb-1">// ANALYTICS</p>
        <h1 className="font-display text-[28px] font-bold text-[#e5e5e5] tracking-[-0.02em]">
          Performance Analytics
        </h1>
        <p className="font-body text-[14px] text-[#7c7a85] mt-1">Track your interview progress and improvement over time.</p>
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
        className="bg-[#0c0c10] border border-[#2b292d] rounded-[8px] p-6 mb-5"
      >
        <h2 className="font-mono text-[12px] font-bold text-[#b5b2bc] uppercase tracking-[0.1em] mb-5 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#71d083]" /> Score Over Time
        </h2>
        {data?.scoreOverTime && data.scoreOverTime.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.scoreOverTime}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#71d083" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#71d083" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2b292d" />
              <XAxis dataKey="date" tick={{ fill: '#49474e', fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#49474e', fontSize: 10, fontFamily: 'monospace' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="score" stroke="#71d083" fill="url(#scoreGrad)" strokeWidth={2} name="Score" dot={{ fill: '#71d083', r: 3 }} />
              <Line type="monotone" dataKey="rollingAvg" stroke="#70b8ff" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="7-session avg" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-40 text-[#49474e] font-mono text-[12px]">
            Complete more interviews to see your progress
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Type breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[#0c0c10] border border-[#2b292d] rounded-[8px] p-6"
        >
          <h2 className="font-mono text-[12px] font-bold text-[#b5b2bc] uppercase tracking-[0.1em] mb-5 flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#71d083]" /> Interview Type Breakdown
          </h2>
          {data?.typeBreakdown && data.typeBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.typeBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" nameKey="name">
                  {data.typeBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={TYPE_COLORS[entry.name] ?? '#7c7a85'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ color: '#7c7a85', fontSize: 11, fontFamily: 'monospace' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-[#49474e] font-mono text-[12px]">No data yet</div>
          )}
        </motion.div>

        {/* Weakness heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0c0c10] border border-[#2b292d] rounded-[8px] p-6"
        >
          <h2 className="font-mono text-[12px] font-bold text-[#b5b2bc] uppercase tracking-[0.1em] mb-5 flex items-center gap-2">
            <Target className="h-4 w-4 text-[#71d083]" /> Topic Weakness Map
          </h2>
          {data?.weaknesses && data.weaknesses.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.weaknesses} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2b292d" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#49474e', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis type="category" dataKey="topic" tick={{ fill: '#7c7a85', fontSize: 10, fontFamily: 'monospace' }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" name="Weakness Score" radius={[0, 3, 3, 0]}>
                  {data.weaknesses.map((entry) => (
                    <Cell key={entry.topic} fill={entry.score < 40 ? '#f87171' : entry.score < 60 ? '#f59e0b' : '#71d083'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-[#49474e] font-mono text-[12px]">No weakness data yet</div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
