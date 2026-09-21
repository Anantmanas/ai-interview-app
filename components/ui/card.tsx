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
        'bg-[#09090f] text-[#f8fafc] flex flex-col rounded-xl border border-[#1e2030] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden transition-all duration-200 hover:border-[#2b2d42]',
        className,
      )}
      {...props}
    >
      {(showTrafficLights || terminalTitle) && (
        <div className="flex items-center justify-between px-4 h-9 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
          <div className="flex items-center gap-2.5">
            <MacTrafficLights size="sm" />
            {terminalTitle && (
              <span className="font-mono text-[11px] text-[#9ca3af] font-medium tracking-wide">
                {terminalTitle}
              </span>
            )}
          </div>
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
