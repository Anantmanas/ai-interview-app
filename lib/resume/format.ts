import type { ExperienceLevel } from '@/lib/types'
import type { StructuredResumeData } from '@/lib/resume/types'

const allowedExperienceLevels: ExperienceLevel[] = ['junior', 'mid', 'senior', 'staff', 'principal']

export function normalizeExperienceLevel(value: unknown): ExperienceLevel {
  return allowedExperienceLevels.includes(value as ExperienceLevel) ? value as ExperienceLevel : 'mid'
}

export function formatResumeMarkdown(data: StructuredResumeData) {
  const experienceJson = data.experience && data.experience.length > 0 ? JSON.stringify(data.experience) : ''
  const educationJson = data.education && data.education.length > 0 ? JSON.stringify(data.education) : ''

  return `# ${data.name || 'Resume Profile'}
**Target Role / Position:** ${data.position || 'N/A'}
**Experience Level:** ${data.experience_level || 'N/A'}

## Professional Overview
${data.overview_summarized || 'N/A'}

## Key Skills & Technologies
${Array.isArray(data.key_skills) && data.key_skills.length > 0 ? data.key_skills.map((skill) => `- ${skill}`).join('\n') : 'N/A'}

## Professional Experience
${Array.isArray(data.experience) && data.experience.length > 0 ? data.experience.map((exp) => `- **${exp.role}** at ${exp.company}${exp.duration ? ` (${exp.duration})` : ''}`).join('\n') : 'N/A'}

## Education & Certifications
${Array.isArray(data.education) && data.education.length > 0 ? data.education.map((edu) => `- ${edu}`).join('\n') : 'N/A'}

<!-- META_DATA_EXP:${experienceJson} -->
<!-- META_DATA_EDU:${educationJson} -->

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
  const skillsSectionMatch = markdown.match(/## Key Skills & Technologies\s*\n+([\s\S]*?)\n*(?=## Professional Experience|\n*---)/)
  const rawTextMatch = markdown.match(/### Raw Parsed Resume Text\s*\n([\s\S]*)$/)

  const expMetaMatch = markdown.match(/<!-- META_DATA_EXP:(.*?) -->/)
  const eduMetaMatch = markdown.match(/<!-- META_DATA_EDU:(.*?) -->/)

  let experience: any[] = []
  if (expMetaMatch?.[1]) {
    try {
      experience = JSON.parse(expMetaMatch[1])
    } catch {}
  }

  let education: string[] = []
  if (eduMetaMatch?.[1]) {
    try {
      education = JSON.parse(eduMetaMatch[1])
    } catch {}
  }

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
    experience: experience.length > 0 ? experience : undefined,
    education: education.length > 0 ? education : undefined,
    raw_text: rawTextMatch?.[1]?.trim(),
  }
}

export function structuredToDashboardResume(structured: StructuredResumeData) {
  return {
    name: structured.name || '',
    skills: structured.key_skills || [],
    experience: structured.experience || [],
    education: structured.education || [],
    targetRole: structured.position || undefined,
    summary: structured.overview_summarized || undefined,
  }
}

export function getResumeContext(markdown: string | null, structuredData?: StructuredResumeData | null) {
  if (markdown) return markdown
  if (!structuredData) return ''

  return formatResumeMarkdown(structuredData)
}

