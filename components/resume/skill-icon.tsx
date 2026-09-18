import React from 'react'
import { TechIcon } from '@/components/ui/tech-icons'

interface SkillIconProps {
  skill: string
  className?: string
  size?: number | string
}

export function SkillIcon({ skill, className = 'h-4 w-4', size = 16 }: SkillIconProps) {
  return (
    <TechIcon
      name={skill}
      size={size}
      className={className}
      useOriginalColor={true}
    />
  )
}
