import { NextRequest, NextResponse } from 'next/server'

const RAPID_HOST = 'claude-haiku-4-5-fastest-ai-text-generator-by-anthropic.p.rapidapi.com'
const RAPID_URL = `https://${RAPID_HOST}/api/generate/text`

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

function safeJsonParse<T>(raw: string): T | null {
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned) as T
  } catch {
    return null
  }
}

function parseSkills(text: string): string[] {
  const skillsMatch = text.match(/skills?\s*[:\-]\s*([^\n]+)/i)
  if (!skillsMatch) return []
  return skillsMatch[1]
    .split(/[,|/]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 24)
}

function parseName(text: string, fileName: string): string {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('%PDF-'))

  const candidate = lines.find((l) => /^[A-Za-z][A-Za-z\s.'-]{2,40}$/.test(l))
  if (candidate) return candidate
  return fileName.replace(/\.[^.]+$/, '').slice(0, 60)
}

function parseYears(text: string): number {
  const m = text.match(/(\d{1,2})\+?\s*(years?|yrs?)\s*(of)?\s*experience/i)
  if (!m) return 0
  const n = Number.parseInt(m[1], 10)
  return Number.isFinite(n) ? n : 0
}

function parseTargetRole(text: string): string | undefined {
  const role = text.match(/(full stack engineer|software engineer|frontend engineer|backend engineer|qa engineer|devops engineer|data engineer|product manager|designer)/i)
  return role?.[1]
}

function parseEducation(text: string): string[] {
  const lines = text.split('\n').map((l) => l.trim())
  return lines
    .filter((l) => /(b\.tech|btech|m\.tech|mtech|bachelor|master|university|college)/i.test(l))
    .slice(0, 6)
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
    experience: years > 0 ? [{ role: targetRole || 'Professional', company: 'Various', years }] : [],
    education,
    targetRole,
    summary: normalized.slice(0, 500) || 'Resume uploaded successfully.',
  }
}

async function extractRawText(file: File): Promise<string> {
  const name = file.name.toLowerCase()

  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    const ab = await file.arrayBuffer()
    const buf = Buffer.from(ab)
    const mod = await import('pdf-parse')
    const PDFParse = (mod as any).PDFParse
    const parser = new PDFParse({ data: buf })
    const parsed = await parser.getText()
    await parser.destroy()
    return parsed?.text || ''
  }

  return await file.text()
}

async function callRapidForStructuredData(resumeText: string): Promise<ResumeData> {
  const rapidKey = process.env.RAPIDAPI_KEY || process.env.ANTHROPIC_API_KEY
  if (!rapidKey) throw new Error('Missing RAPIDAPI_KEY (or ANTHROPIC_API_KEY)')

  const prompt = [
    'Extract structured resume data.',
    'Return ONLY valid JSON with schema:',
    '{ name: string, skills: string[], experience: [{ role: string, company: string, years: number }], education: string[], targetRole: string, summary: string }',
    'If field missing, return empty string/array.',
    '',
    'Resume:',
    resumeText,
  ].join('\n')

  const response = await fetch(RAPID_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-key': rapidKey,
      'x-rapidapi-host': RAPID_HOST,
    },
    body: JSON.stringify({
      prompt,
      system: 'You are a strict JSON resume parser.',
      outputType: 'text',
    }),
  })

  if (!response.ok) {
    throw new Error(`RapidAPI error ${response.status}: ${await response.text()}`)
  }

  const data = await response.json()
  const raw = String(data?.text || data?.output || data?.result || '')
  const parsed = safeJsonParse<ResumeData>(raw)
  if (!parsed) throw new Error('Failed to parse model JSON')
  const suspiciousName = (parsed.name || '').trim().startsWith('%PDF-')
  const suspiciousSummary = (parsed.summary || '').includes('/Type/Catalog')
  if (suspiciousName || suspiciousSummary) {
    throw new Error('Model returned raw PDF syntax, rejecting parse')
  }
  return parsed
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    let resumeText = ''
    try {
      resumeText = await extractRawText(file)
    } catch (e) {
      console.warn('[api/resume] extractRawText failed:', e)
    }

    const normalized = normalizeText(resumeText)

    if (normalized.length < 20) {
      return NextResponse.json(buildFallbackResumeData(file.name, file.name))
    }

    try {
      const parsed = await callRapidForStructuredData(normalized)
      return NextResponse.json(parsed)
    } catch (modelError) {
      console.warn('[api/resume] model parse failed, fallback:', modelError)
      return NextResponse.json(buildFallbackResumeData(normalized, file.name))
    }
  } catch (err) {
    console.error('[api/resume] error:', err)
    return NextResponse.json({ error: 'Resume extraction failed' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}

