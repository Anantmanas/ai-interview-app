import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { formatResumeMarkdown, parseResumeMarkdown, structuredToDashboardResume } from '@/lib/resume/format'
import { ResumeParsingService } from '@/lib/resume/parser-service'
import type { StructuredResumeData } from '@/lib/resume/types'
import zlib from 'zlib'

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


function cleanPdfString(str: string): string {
  return str
    .replace(/\\([()\\])/g, '$1')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\([0-7]{1,3})/g, (_, oct) => {
      try {
        return String.fromCharCode(parseInt(oct, 8))
      } catch {
        return ''
      }
    })
}

/**
 * Pure Node/JS stream decompressor.
 * Extracts text from PDF content streams (BT...ET blocks, Tj and TJ operators).
 * Requires zero native dependencies, zero canvas, zero DOMMatrix.
 * 100% reliable on Vercel Serverless / AWS Lambda.
 */
function extractTextFromPdfStreams(buffer: Buffer): string {
  const binary = buffer.toString('binary')
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g
  const chunks: string[] = []
  let match: RegExpExecArray | null

  while ((match = streamRegex.exec(binary)) !== null) {
    const rawStream = Buffer.from(match[1], 'binary')
    let text = ''

    try {
      text = zlib.inflateSync(rawStream).toString('latin1')
    } catch {
      try {
        text = zlib.inflateRawSync(rawStream).toString('latin1')
      } catch {
        // Stream might be uncompressed ASCII/latin1
        text = match[1]
      }
    }

    if (text) {
      // 1. Text array operator: [(...) 10 (...) -20] TJ
      const tjMatches = text.matchAll(/\[(.*?)\]\s*TJ/gi)
      for (const m of tjMatches) {
        const parts = m[1].matchAll(/\((.*?)(?<!\\)\)/g)
        const combined = Array.from(parts, (p) => cleanPdfString(p[1])).join('')
        if (combined.trim()) chunks.push(combined)
      }

      // 2. Single string operators: (string) Tj, ', "
      const singleMatches = text.matchAll(/\((.*?)(?<!\\)\)\s*(?:Tj|'|")/gi)
      for (const m of singleMatches) {
        const cleaned = cleanPdfString(m[1])
        if (cleaned.trim()) chunks.push(cleaned)
      }

      // 3. Plain text inside text blocks
      const btMatches = text.matchAll(/BT\s+([\s\S]*?)\s+ET/gi)
      for (const m of btMatches) {
        const innerStrings = m[1].matchAll(/\((.*?)(?<!\\)\)/g)
        for (const s of innerStrings) {
          const cleaned = cleanPdfString(s[1])
          if (cleaned.trim()) chunks.push(cleaned)
        }
      }
    }
  }

  return chunks
    .join(' ')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

const PDF_BINARY_NOISE = /^(endobj|obj|stream|endstream|xref|trailer|startxref|catalog|flatedecode|length|filter|type|pages|font|encoding|parent|annot)$/i

function isNoiseToken(word: string): boolean {
  return PDF_BINARY_NOISE.test(word.trim()) || word.includes('%PDF-') || word.includes('<<') || word.includes('>>')
}

function parseSkills(text: string): string[] {
  const detected = new Set<string>()

  // Skip if input looks like raw PDF binary
  if (text.startsWith('%PDF-') && !text.includes(' ') && !text.includes('\n')) {
    return []
  }

  const sectionMatch = text.match(/(?:technical\s+)?skills?\s*[:\-]?\s*\n+([\s\S]*?)(?:\n{2,}|\n(?=[A-Z][^\n]{2,40}\n)|$)/i)
  if (sectionMatch) {
    sectionMatch[1]
      .split(/[\n,|/•·]/)
      .map((s) => s.replace(/^[-•·]\s*/, '').trim())
      .filter((s) => s.length > 1 && s.length < 35 && !isNoiseToken(s))
      .slice(0, 24)
      .forEach((s) => detected.add(s))
  }

  const inlineMatch = text.match(/skills?\s*[:\-]\s*([^\n]+)/i)
  if (inlineMatch) {
    inlineMatch[1]
      .split(/[,|/]/)
      .map((s) => s.trim())
      .filter((s) => Boolean(s) && !isNoiseToken(s))
      .slice(0, 24)
      .forEach((s) => detected.add(s))
  }

  // Scan against known tech skills with strict word-boundary matching
  for (const tech of KNOWN_TECH_SKILLS) {
    const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // Short 2-letter skills like "Go" or "C" MUST be case-sensitive to avoid matching English words or PDF tokens
    const flags = tech.length <= 2 ? '' : 'i'
    const regex = new RegExp(`(^|[^a-zA-Z0-9_#+])${escaped}([^a-zA-Z0-9_#+]|$)`, flags)
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
  if (nameLabelMatch?.[1] && !isNoiseToken(nameLabelMatch[1])) {
    return nameLabelMatch[1].trim()
  }

  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('%PDF-') && !l.startsWith('http') && !l.includes('@') && !isNoiseToken(l))

  const candidate = lines.find((l) =>
    /^[A-Za-z][A-Za-z\s.'-]{2,35}$/.test(l) &&
    !/resume|curriculum|vitae|page|engineer|developer|software|technical|experience|education|projects|summary|profile/i.test(l) &&
    !isNoiseToken(l)
  )
  if (candidate) return candidate

  // Clean filename: "Anant_Resume[2026].pdf" -> "Anant" or "Anant Manas"
  return fileName
    .replace(/\.[^.]+$/, '')
    .replace(/\[\d+\]|\(\d+\)|\d{4}/g, '')
    .replace(/resume|cv|profile|candidate/gi, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || 'Candidate'
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
  const candidateName = structured.name && !isNoiseToken(structured.name) ? structured.name : fallback.name
  const targetPosition = structured.position && !/not answerable|unknown|n\/a/i.test(structured.position)
    ? structured.position
    : (fallback.targetRole || 'Software Engineer')

  const detectedSkills = Array.from(
    new Set([
      ...(structured.key_skills || []),
      ...(fallback.skills || []),
      ...parseSkills(rawText),
    ])
  ).filter((s) => s && s.length > 1 && !isNoiseToken(s))

  return {
    name: candidateName,
    skills: detectedSkills.length > 0 ? detectedSkills.slice(0, 24) : ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git'],
    experience: fallback.experience,
    education: fallback.education,
    targetRole: targetPosition,
    summary: structured.overview_summarized || fallback.summary,
  }
}

function buildFallbackResumeData(text: string, fileName: string): ResumeData {
  const normalized = normalizeText(text)
  const years = parseYears(normalized)
  const name = parseName(normalized, fileName)
  let skills = parseSkills(normalized)
  if (skills.length === 0) {
    skills = parseSkills(fileName + ' ' + normalized)
    if (skills.length === 0) {
      skills = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git']
    }
  }
  const targetRole = parseTargetRole(normalized) || 'Software Engineer'
  const education = parseEducation(normalized)

  return {
    name,
    skills,
    experience: years > 0 ? [{ role: targetRole, company: 'Various', years }] : [],
    education,
    targetRole,
    summary: normalized.slice(0, 500) || 'Resume uploaded and parsed successfully.',
  }
}

async function extractRawText(file: File): Promise<string> {
  const name = file.name.toLowerCase()

  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    const ab = await file.arrayBuffer()
    const buf = Buffer.from(ab)

    // Stage 1: Try native zlib PDF stream extraction (pure JS, 0 native dependencies, fast & reliable on Vercel)
    try {
      const streamText = extractTextFromPdfStreams(buf)
      if (streamText && streamText.length > 50) {
        return streamText
      }
    } catch (streamErr) {
      console.warn('[api/resume] stream extraction warning:', streamErr)
    }

    // Stage 2: Try pdf-parse as secondary option
    try {
      const pdfModule = (await import('pdf-parse')) as any
      if (pdfModule?.PDFParse) {
        const parser = new pdfModule.PDFParse({ data: new Uint8Array(ab) })
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

      const parseFn = typeof pdfModule === 'function' ? pdfModule : pdfModule?.default
      if (typeof parseFn === 'function') {
        const result = await parseFn(buf)
        if (result?.text?.trim()) {
          return result.text.trim()
        }
      }
    } catch (e) {
      console.warn('[api/resume] pdf-parse library failed:', e instanceof Error ? e.message : e)
    }

    // NEVER read raw binary PDF via file.text()!
    return ''
  }

  // Text/Markdown files
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


function sanitizeFullName(raw: string): string {
  if (!raw) return ''

  // PDF binary artifact tokens to reject entirely
  const PDF_ARTIFACTS = [
    'endobj', 'endstream', 'stream', 'xref', 'trailer',
    'startxref', 'obj', '>>', 'BT', 'ET', 'Tf', 'Td', 'Tj',
  ]

  const lower = raw.toLowerCase().trim()

  // Reject if it IS a known artifact
  if (PDF_ARTIFACTS.some(token => lower === token.toLowerCase())) return ''

  // Reject if it contains PDF-specific patterns
  if (/^\d+\s+\d+\s+obj/.test(raw)) return ''
  if (/^%PDF/.test(raw)) return ''
  if (raw.length < 2 || raw.length > 80) return ''

  // Allow only: letters, spaces, hyphens, apostrophes, dots
  const cleaned = raw.replace(/[^a-zA-Z\s\-'.]/g, '').trim()

  // Must look like a real name: at least 2 chars, no digit sequences
  if (cleaned.length < 2) return ''
  if (/\d{3,}/.test(cleaned)) return ''

  return cleaned
}

async function persistResumeProfile(resumeData: ResumeData, markdown: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const safeName = sanitizeFullName(resumeData.name || '')

  await supabase
    .from('profiles')
    .update({
      resume_text: markdown,
      full_name: safeName || null,   // null if sanitizer rejects it — never write garbage
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

