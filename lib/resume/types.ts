import type { ExperienceLevel } from '@/lib/types'

export type ResumeLifecycleState = 'UPLOADING' | 'PARSING' | 'READY' | 'FAILED'

export interface StructuredResumeData {
  name: string | null
  position: string | null
  experience_level: ExperienceLevel | null
  overview_summarized: string | null
  key_skills: string[]
  raw_text?: string
}

export interface ResumeSnapshot {
  id: string | null
  versionId: string | null
  userId: string
  fileUrl: string | null
  fileName: string | null
  versionNumber: number
  status: ResumeLifecycleState
  structuredData: StructuredResumeData | null
  markdown: string | null
  createdAt: string | null
  updatedAt: string | null
  error: string | null
}

