import * as React from 'react'
import { cn } from '@/lib/utils'
import { MacTrafficLights } from '@/components/ui/terminal-card'

interface CardProps extends React.ComponentProps<'div'> {
  showTrafficLights?: boolean
  terminalTitle?: string
}

function Card({ className, showTrafficLights, terminalTitle, children, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        'bg-[#0D0D0D] text-[#F4F2EC] flex flex-col rounded-xl border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-200 hover:border-white/[0.16]',
        className,
      )}
      {...props}
    >
      {terminalTitle && (
        <div className="flex items-center justify-between px-4 h-9 border-b border-white/[0.08] bg-white/[0.02] select-none">
          <span className="font-mono text-[11px] text-[#8C8C88] font-medium tracking-wider uppercase">
            {terminalTitle}
          </span>
        </div>
      )}
      {children}
    </div>
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 p-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-5',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-6', className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
