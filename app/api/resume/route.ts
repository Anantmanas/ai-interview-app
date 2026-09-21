import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { formatResumeMarkdown, parseResumeMarkdown, structuredToDashboardResume } from '@/lib/resume/format'
import { ResumeParsingService } from '@/lib/resume/parser-service'
import type { StructuredResumeData } from '@/lib/resume/types'

type ResumeData = {
  name: string
  skills: string[]
  experience: { role: string; company: string; years: number }[]
  education: string[]
  targetRole?: string
  summary?: string
}

function normalizeText(input: string): string {
  return input
    .replace(/\u0000/g, ' ')
    .replace(/[\t\f\v]+/g, ' ')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const KNOWN_TECH_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'Express.js',
  'Java', 'C++', 'C#', 'Go', 'Golang', 'Rust', 'Docker', 'Kubernetes', 'AWS',
  'Azure', 'GCP', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL',
  'REST APIs', 'Tailwind CSS', 'HTML5', 'CSS3', 'Git', 'GitHub', 'CI/CD',
  'Redux', 'Zustand', 'Prisma', 'Supabase', 'Firebase', 'Linux', 'Microservices',
  'Kafka', 'RabbitMQ', 'Elasticsearch', 'Webpack', 'Vite', 'Jest', 'Cypress',
  'Playwright', 'TensorFlow', 'PyTorch', 'OpenAI', 'LangChain', 'FastAPI',
  'Django', 'Flask', 'Spring Boot', 'Angular', 'Vue.js', 'Svelte', 'WebSockets'
]

function parseSkills(text: string): string[] {
  const detected = new Set<string>()

  const sectionMatch = text.match(/(?:technical\s+)?skills?\s*[:\-]?\s*\n+([\s\S]*?)(?:\n{2,}|\n(?=[A-Z][^\n]{2,40}\n)|$)/i)
  if (sectionMatch) {
    sectionMatch[1]
      .split(/[\n,|/•·]/)
      .map((s) => s.replace(/^[-•·]\s*/, '').trim())
      .filter((s) => s.length > 1 && s.length < 35)
      .slice(0, 24)
      .forEach((s) => detected.add(s))
  }

  const inlineMatch = text.match(/skills?\s*[:\-]\s*([^\n]+)/i)
  if (inlineMatch) {
    inlineMatch[1]
      .split(/[,|/]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 24)
      .forEach((s) => detected.add(s))
  }

  // Guarantee tech skills are discovered even if section layout varies
  for (const tech of KNOWN_TECH_SKILLS) {
    const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(^|[^a-zA-Z0-9_#+])${escaped}([^a-zA-Z0-9_#+]|$)`, 'i')
    if (regex.test(text)) {
      detected.add(tech)
      if (detected.size >= 24) break
    }
  }

  return Array.from(detected).slice(0, 24)
}

function parseName(text: string, fileName: string): string {
  // Check for explicit "Name: John Doe"
  const nameLabelMatch = text.match(/(?:name|candidate(?:\s+name)?)\s*[:\-]\s*([A-Za-z][A-Za-z\s.'-]{2,40})/i)
  if (nameLabelMatch?.[1]) {
    return nameLabelMatch[1].trim()
  }

  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('%PDF-') && !l.startsWith('http') && !l.includes('@'))

  const candidate = lines.find((l) => /^[A-Za-z][A-Za-z\s.'-]{2,35}$/.test(l) && !/resume|curriculum|vitae|page|engineer|developer/i.test(l))
  if (candidate) return candidate
  return fileName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').slice(0, 60)
}

function parseYears(text: string): number {
  const m = text.match(/(\d{1,2})\+?\s*(years?|yrs?)\s*(of)?\s*experience/i)
  if (!m) return 0
  const n = Number.parseInt(m[1], 10)
  return Number.isFinite(n) ? n : 0
}

function parseTargetRole(text: string): string | undefined {
  const role = text.match(/(full\s*stack\s*engineer|software\s*engineer|frontend\s*engineer|backend\s*engineer|qa\s*engineer|devops\s*engineer|data\s*engineer|product\s*manager|ui\/ux\s*designer|mobile\s*developer)/i)
  return role?.[1]
}

function parseEducation(text: string): string[] {
  const lines = text.split('\n').map((l) => l.trim())
  return lines
    .filter((l) => /(b\.tech|btech|m\.tech|mtech|bachelor|master|university|college|computer\s+science)/i.test(l))
    .slice(0, 6)
}

function mapStructuredToResumeData(structured: StructuredResumeData, rawText: string, fileName: string): ResumeData {
  const fallback = buildFallbackResumeData(rawText, fileName)
  return {
    name: structured.name || fallback.name,
    skills: structured.key_skills?.length ? structured.key_skills : fallback.skills,
    experience: fallback.experience,
    education: fallback.education,
    targetRole: structured.position || fallback.targetRole,
    summary: structured.overview_summarized || fallback.summary,
  }
}

function buildFallbackResumeData(text: string, fileName: string): ResumeData {
  const normalized = normalizeText(text)
  const years = parseYears(normalized)
  const name = parseName(normalized, fileName)
  const skills = parseSkills(normalized)
  const targetRole = parseTargetRole(normalized)
  const education = parseEducation(normalized)

  return {
    name,
    skills,
    experience: years > 0 ? [{ role: targetRole || 'Software Engineer', company: 'Various', years }] : [],
    education,
    targetRole,
    summary: normalized.slice(0, 500) || 'Resume uploaded and parsed successfully.',
  }
}

async function extractRawText(file: File): Promise<string> {
  const name = file.name.toLowerCase()

  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    try {
      const ab = await file.arrayBuffer()
      const buf = Buffer.from(ab)

      const pdfModule = (await import('pdf-parse')) as any

      // 1. pdf-parse v2 class check
      if (pdfModule?.PDFParse) {
        const parser = new pdfModule.PDFParse({ data: buf })
        try {
          const parsedData = await parser.getText()
          if (parsedData?.text?.trim()) {
            return parsedData.text.trim()
          }
        } finally {
          if (typeof parser.destroy === 'function') {
            await parser.destroy()
          }
        }
      }

      // 2. pdf-parse v1 function export check
      const parseFn = typeof pdfModule === 'function' ? pdfModule : pdfModule?.default
      if (typeof parseFn === 'function') {
        const result = await parseFn(buf)
        if (result?.text?.trim()) {
          return result.text.trim()
        }
      }
    } catch (e) {
      console.warn('[api/resume] pdf extraction failed:', e instanceof Error ? e.message : e)
    }
  }

  return await file.text()
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    // File type allowlist — reject non-PDF/text before processing
    const ALLOWED_TYPES = ['application/pdf', 'text/plain']
    const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.md']
    const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase()

    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: 'Only PDF and text files are supported' }, { status: 415 })
    }

    // Size cap — 10MB hard limit
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 10MB' }, { status: 413 })
    }

    let resumeText = ''
    try {
      resumeText = await extractRawText(file)
    } catch (e) {
      console.warn('[api/resume] extractRawText failed:', e)
    }

    const normalized = normalizeText(resumeText)

    if (normalized.length < 20) {
      const fallback = buildFallbackResumeData(normalized, file.name)
      return NextResponse.json(fallback)
    }

    try {
      const parsingService = new ResumeParsingService()
      const parsed = await parsingService.parseFromText(normalized)
      const resumeData = mapStructuredToResumeData(parsed.structuredData, normalized, file.name)
      await persistResumeProfile(resumeData, parsed.markdown)
      return NextResponse.json(resumeData)
    } catch (modelError) {
      console.warn('[api/resume] model parse failed, fallback:', modelError)
      const fallback = buildFallbackResumeData(normalized, file.name)
      const markdown = formatResumeMarkdown({
        name: fallback.name,
        position: fallback.targetRole || null,
        experience_level: null,
        overview_summarized: fallback.summary || null,
        key_skills: fallback.skills,
        raw_text: normalized,
      })
      await persistResumeProfile(fallback, markdown)
      return NextResponse.json(fallback)
    }
  } catch (err) {
    console.error('[api/resume] error:', err)
    return NextResponse.json({ error: 'Resume extraction failed' }, { status: 500 })
  }
}

async function persistResumeProfile(resumeData: ResumeData, markdown: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('profiles')
    .update({
      resume_text: markdown,
      full_name: resumeData.name || null,
      target_role: resumeData.targetRole || null,
    })
    .eq('id', user.id)
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('resume_text, full_name, target_role, updated_at')
    .eq('id', user.id)
    .single()

  if (!profile?.resume_text) {
    return NextResponse.json(null)
  }

  const structured = parseResumeMarkdown(profile.resume_text)
  if (!structured) return NextResponse.json(null)

  const resumeData = structuredToDashboardResume(structured)
  if (!resumeData.name && profile.full_name) resumeData.name = profile.full_name
  if (!resumeData.targetRole && profile.target_role) resumeData.targetRole = profile.target_role

  return NextResponse.json({
    resume: resumeData,
    meta: {
      uploadedAt: profile.updated_at || new Date().toISOString(),
      fileName: 'Saved resume',
      source: 'dashboard' as const,
    },
  })
}

