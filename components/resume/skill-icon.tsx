import React from 'react'
import { 
  Globe, 
  Database, 
  Cpu, 
  Layers, 
  Code2, 
  Server, 
  Smartphone, 
  Cloud,
  Terminal,
  Container,
  Layout,
  FileCode,
  Braces
} from 'lucide-react'

interface SkillIconProps {
  skill: string
  className?: string
}

export function SkillIcon({ skill, className = "h-4 w-4" }: SkillIconProps) {
  const s = skill.toLowerCase()

  // Mapping common skills to Lucide icons
  if (s.includes('react') || s.includes('next.js') || s.includes('vue') || s.includes('angular') || s.includes('frontend')) {
    return <Layout className={className} />
  }
  if (s.includes('node') || s.includes('express') || s.includes('backend') || s.includes('django') || s.includes('flask') || s.includes('spring')) {
    return <Server className={className} />
  }
  if (s.includes('database') || s.includes('sql') || s.includes('mongo') || s.includes('postgres') || s.includes('redis')) {
    return <Database className={className} />
  }
  if (s.includes('typescript') || s.includes('javascript') || s.includes('js') || s.includes('ts')) {
    return <FileCode className={className} />
  }
  if (s.includes('python') || s.includes('java') || s.includes('c++') || s.includes('rust') || s.includes('go')) {
    return <Code2 className={className} />
  }
  if (s.includes('aws') || s.includes('cloud') || s.includes('azure') || s.includes('gcp') || s.includes('docker') || s.includes('kubernetes')) {
    return <Cloud className={className} />
  }
  if (s.includes('mobile') || s.includes('react native') || s.includes('flutter') || s.includes('ios') || s.includes('android')) {
    return <Smartphone className={className} />
  }
  if (s.includes('devops') || s.includes('ci/cd') || s.includes('git') || s.includes('linux')) {
    return <Terminal className={className} />
  }
  if (s.includes('api') || s.includes('rest') || s.includes('graphql')) {
    return <Layers className={className} />
  }
  if (s.includes('css') || s.includes('tailwind') || s.includes('sass') || s.includes('html')) {
    return <Braces className={className} />
  }

  return <Globe className={className} />
}
