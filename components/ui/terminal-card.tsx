'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface MacTrafficLightsProps {
  size?: 'sm' | 'md'
  className?: string
}

export function MacTrafficLights({ size = 'md', className }: MacTrafficLightsProps) {
  const dotSize = size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'
  const gapSize = size === 'sm' ? 'gap-1.5' : 'gap-2'

  return (
    <div className={cn('flex items-center', gapSize, className)} aria-hidden="true">
      <span
        className={cn(
          dotSize,
          'rounded-full bg-[#ff5f56] border border-[#e0443e]/50 shadow-[0_0_8px_rgba(255,95,86,0.3)] transition-transform duration-150 hover:scale-110'
        )}
      />
      <span
        className={cn(
          dotSize,
          'rounded-full bg-[#ffbd2e] border border-[#dea123]/50 shadow-[0_0_8px_rgba(255,189,46,0.3)] transition-transform duration-150 hover:scale-110'
        )}
      />
      <span
        className={cn(
          dotSize,
          'rounded-full bg-[#27c93f] border border-[#1aab29]/50 shadow-[0_0_8px_rgba(39,201,63,0.3)] transition-transform duration-150 hover:scale-110'
        )}
      />
    </div>
  )
}

export interface TerminalHeaderProps {
  title?: React.ReactNode
  action?: React.ReactNode
  size?: 'sm' | 'md'
  className?: string
  trafficLights?: boolean
}

export function TerminalHeader({
  title,
  action,
  size = 'md',
  className,
  trafficLights = true,
}: TerminalHeaderProps) {
  const height = size === 'sm' ? 'h-8 px-3' : 'h-10 px-4'

  return (
    <div
      className={cn(
        'flex items-center justify-between border-b border-[#1e2030] bg-[#11121b]/90 backdrop-blur-md rounded-t-xl select-none',
        height,
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {trafficLights && <MacTrafficLights size={size} />}
        {title && (
          <span className="font-mono text-[11px] text-[#9ca3af] font-medium tracking-wide truncate">
            {title}
          </span>
        )}
      </div>
      {action && <div className="ml-auto shrink-0">{action}</div>}
    </div>
  )
}

export interface TerminalPromptProps {
  user?: string
  host?: string
  path?: string
  command?: string
  className?: string
  cursor?: boolean
}

export function TerminalPrompt({
  user = 'engineer',
  host = 'interviewai',
  path = '~',
  command,
  className,
  cursor = false,
}: TerminalPromptProps) {
  return (
    <div className={cn('flex items-center gap-1.5 font-mono text-[12px] flex-wrap', className)}>
      <span className="text-[#38bdf8] font-semibold">{user}@{host}</span>
      <span className="text-[#94a3b8]">:</span>
      <span className="text-[#818cf8] font-medium">{path}</span>
      <span className="text-[#f8fafc] font-semibold">$</span>
      {command && <span className="text-[#22c55e] font-semibold">{command}</span>}
      {cursor && (
        <span className="inline-block w-2 h-4 bg-[#f8fafc] animate-pulse ml-0.5" />
      )}
    </div>
  )
}

export interface TerminalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode
  action?: React.ReactNode
  trafficLightSize?: 'sm' | 'md'
  glow?: boolean
  headerClassName?: string
  bodyClassName?: string
}

export function TerminalCard({
  title,
  action,
  trafficLightSize = 'md',
  glow = false,
  className,
  headerClassName,
  bodyClassName,
  children,
  ...props
}: TerminalCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-200 overflow-hidden',
        glow
          ? 'bg-[#09090f] border-[#3730a3] shadow-[0_0_30px_rgba(79,70,229,0.18),inset_0_1px_0_rgba(255,255,255,0.06)]'
          : 'bg-[#09090f] border-[#1e2030] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-[#2b2d42]',
        className
      )}
      {...props}
    >
      {(title !== undefined || action !== undefined) && (
        <TerminalHeader
          title={title}
          action={action}
          size={trafficLightSize}
          className={headerClassName}
        />
      )}
      <div className={cn('p-5', bodyClassName)}>{children}</div>
    </div>
  )
}
