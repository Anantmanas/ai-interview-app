import type { ExperienceLevel } from '@/lib/types'
import type { StructuredResumeData } from '@/lib/resume/types'

const allowedExperienceLevels: ExperienceLevel[] = ['junior', 'mid', 'senior', 'staff', 'principal']

export function normalizeExperienceLevel(value: unknown): ExperienceLevel {
  return allowedExperienceLevels.includes(value as ExperienceLevel) ? value as ExperienceLevel : 'mid'
}

export function formatResumeMarkdown(data: StructuredResumeData) {
  return `# ${data.name || 'Resume Profile'}
**Target Role / Position:** ${data.position || 'N/A'}
**Experience Level:** ${data.experience_level || 'N/A'}

## Professional Overview
${data.overview_summarized || 'N/A'}

## Key Skills & Technologies
${Array.isArray(data.key_skills) && data.key_skills.length > 0 ? data.key_skills.map((skill) => `- ${skill}`).join('\n') : 'N/A'}

---
### Raw Parsed Resume Text
${data.raw_text || ''}
`
}

export function parseResumeMarkdown(markdown: string | null): StructuredResumeData | null {
  if (!markdown) return null

  const nameMatch = markdown.match(/^#\s+(.+)$/m)
  const posMatch = markdown.match(/^\*\*Target Role \/ Position:\*\*\s*(.+)$/m)
  const levelMatch = markdown.match(/^\*\*Experience Level:\*\*\s*(.+)$/m)
  const overviewMatch = markdown.match(/## Professional Overview\s*\n+([\s\S]*?)\n*(?=## Key Skills|\n*---)/)
  const skillsSectionMatch = markdown.match(/## Key Skills & Technologies\s*\n+([\s\S]*?)\n*(?=---)/)
  const rawTextMatch = markdown.match(/### Raw Parsed Resume Text\s*\n([\s\S]*)$/)

  const skills = skillsSectionMatch
    ? skillsSectionMatch[1]
        .split('\n')
        .map((line) => line.replace(/^-\s*/, '').trim())
        .filter((line) => line.length > 0 && line !== 'N/A')
    : []

  return {
    name: nameMatch?.[1]?.trim() || null,
    position: posMatch?.[1]?.trim() || null,
    experience_level: levelMatch?.[1] ? normalizeExperienceLevel(levelMatch[1].trim()) : null,
    overview_summarized: overviewMatch?.[1]?.trim() || null,
    key_skills: skills,
    raw_text: rawTextMatch?.[1]?.trim(),
  }
}

export function structuredToDashboardResume(structured: StructuredResumeData) {
  return {
    name: structured.name || '',
    skills: structured.key_skills || [],
    experience: [] as { role: string; company: string; years: number }[],
    education: [] as string[],
    targetRole: structured.position || undefined,
    summary: structured.overview_summarized || undefined,
  }
}

export function getResumeContext(markdown: string | null, structuredData?: StructuredResumeData | null) {
  if (markdown) return markdown
  if (!structuredData) return ''

  return formatResumeMarkdown(structuredData)
}

