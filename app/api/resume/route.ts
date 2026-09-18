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

function parseSkills(text: string): string[] {
  const sectionMatch = text.match(/(?:technical\s+)?skills?\s*[:\-]?\s*\n+([\s\S]*?)(?:\n{2,}|\n(?=[A-Z][^\n]{2,40}\n)|$)/i)
  if (sectionMatch) {
    return sectionMatch[1]
      .split(/[\n,|/•·]/)
      .map((s) => s.replace(/^[-•·]\s*/, '').trim())
      .filter((s) => s.length > 0 && s.length < 40)
      .slice(0, 24)
  }

  const inlineMatch = text.match(/skills?\s*[:\-]\s*([^\n]+)/i)
  if (!inlineMatch) return []
  return inlineMatch[1]
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

    // #region agent log
    fetch('http://127.0.0.1:7657/ingest/ebbc3a05-84d1-4f07-893b-01831b601aad',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bd394d'},body:JSON.stringify({sessionId:'bd394d',runId:'pre-fix',hypothesisId:'C',location:'app/api/resume/route.ts:POST:afterExtract',message:'PDF/text extraction result',data:{fileName:file.name,fileType:file.type,normalizedLen:normalized.length,textPreview:normalized.slice(0,120)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    if (normalized.length < 20) {
      const fallback = buildFallbackResumeData(normalized, file.name)
      // #region agent log
      fetch('http://127.0.0.1:7657/ingest/ebbc3a05-84d1-4f07-893b-01831b601aad',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bd394d'},body:JSON.stringify({sessionId:'bd394d',runId:'pre-fix',hypothesisId:'C',location:'app/api/resume/route.ts:POST:shortTextFallback',message:'Using short-text fallback path',data:{skillsCount:fallback.skills.length,name:fallback.name},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return NextResponse.json(fallback)
    }

    try {
      const parsingService = new ResumeParsingService()
      const parsed = await parsingService.parseFromText(normalized)
      const resumeData = mapStructuredToResumeData(parsed.structuredData, normalized, file.name)
      await persistResumeProfile(resumeData, parsed.markdown)
      // #region agent log
      fetch('http://127.0.0.1:7657/ingest/ebbc3a05-84d1-4f07-893b-01831b601aad',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bd394d'},body:JSON.stringify({sessionId:'bd394d',runId:'post-fix',hypothesisId:'B',location:'app/api/resume/route.ts:POST:deepseekSuccess',message:'DeepSeek parse success',data:{skillsCount:resumeData.skills.length,keySkillsCount:parsed.structuredData.key_skills?.length??0,name:resumeData.name||null},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
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
      // #region agent log
      fetch('http://127.0.0.1:7657/ingest/ebbc3a05-84d1-4f07-893b-01831b601aad',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bd394d'},body:JSON.stringify({sessionId:'bd394d',runId:'post-fix',hypothesisId:'B',location:'app/api/resume/route.ts:POST:modelFallback',message:'DeepSeek parse failed, using regex fallback',data:{error:String(modelError),skillsCount:fallback.skills.length,name:fallback.name},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
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

