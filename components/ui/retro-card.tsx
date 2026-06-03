import * as React from "react"
import { cn } from "@/lib/utils"

export interface RetroCardProps extends React.HTMLAttributes<HTMLDivElement> {
  accentColor?: "yellow" | "green" | "red" | "cyan" | "none"
  hoverEffect?: boolean
}

const colorMap = {
  yellow: "bg-retro-yellow",
  green: "bg-retro-green",
  red: "bg-retro-red",
  cyan: "bg-retro-cyan",
  none: "bg-transparent border-transparent"
}

const RetroCard = React.forwardRef<HTMLDivElement, RetroCardProps>(
  ({ className, accentColor = "yellow", hoverEffect = false, children, ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn(
          "group relative flex h-fit transform-gpu transition-transform duration-300 ease-in-out w-full max-w-none",
          hoverEffect && "hover:-translate-x-2 hover:-translate-y-2",
          className
        )}
        {...props}
      >
        <div 
          className={cn(
            "pointer-events-none absolute inset-0 z-0 border-2 border-black transform-gpu transition-transform duration-300 ease-in-out ease-out",
            colorMap[accentColor],
            hoverEffect ? "group-hover:translate-x-4 group-hover:translate-y-4 translate-x-2 translate-y-2" : "translate-x-2 translate-y-2"
          )} 
        />
        <div 
          className={cn(
            "pointer-events-none absolute inset-0 z-10 border-2 border-black bg-foreground transform-gpu transition-transform duration-300 ease-in-out",
            hoverEffect ? "group-hover:translate-x-2 group-hover:translate-y-2 translate-x-1 translate-y-1" : "translate-x-1 translate-y-1"
          )} 
        />
        <div className="inline-block rounded relative z-20 h-full w-full border-2 border-black bg-background p-0 shadow-none transform-gpu transition-transform duration-300 ease-in-out">
          {children}
        </div>
      </div>
    )
  }
)
RetroCard.displayName = "RetroCard"

const RetroCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6 border-b-2 border-black/10 dark:border-white/10", className)}
      {...props}
    />
  )
)
RetroCardHeader.displayName = "RetroCardHeader"

const RetroCardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("font-sans text-xl font-bold uppercase tracking-wide", className)}
      {...props}
    />
  )
)
RetroCardTitle.displayName = "RetroCardTitle"

const RetroCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-6", className)} {...props} />
  )
)
RetroCardContent.displayName = "RetroCardContent"

const RetroCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0 border-t-2 border-black/10 dark:border-white/10", className)}
      {...props}
    />
  )
)
RetroCardFooter.displayName = "RetroCardFooter"

export { RetroCard, RetroCardHeader, RetroCardTitle, RetroCardContent, RetroCardFooter }
