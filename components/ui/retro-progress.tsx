import * as React from "react"
import { cn } from "@/lib/utils"

interface RetroProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max: number
  color?: "yellow" | "green" | "red" | "cyan"
}

const colorMap = {
  yellow: "bg-retro-yellow",
  green: "bg-retro-green",
  red: "bg-retro-red",
  cyan: "bg-retro-cyan"
}

export function RetroProgress({ 
  value, 
  max, 
  color = "cyan",
  className, 
  ...props 
}: RetroProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  return (
    <div 
      className={cn("relative w-full h-8 border-2 border-black bg-background flex items-center p-1", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      {...props}
    >
      <div 
        className={cn("h-full border-2 border-black transition-all duration-500 ease-in-out", colorMap[color])}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
