import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { formatResumeMarkdown, parseResumeMarkdown, structuredToDashboardResume } from '@/lib/resume/format'
import { ResumeParsingService } from '@/lib/resume/parser-service'
import { deleteFromUploadThing } from '@/lib/resume/storage'
import type { StructuredResumeData, StoredResumeItem } from '@/lib/resume/types'
import zlib from 'zlib'

type ResumeData = {
  name: string
  skills: string[]
  experience: { role: string; company: string; years?: number; duration?: string; highlights?: string[] }[]
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

function decodePdfHex(hex: string): string {
  const clean = hex.replace(/[^0-9a-fA-F]/g, '')
  let res = ''
  for (let i = 0; i < clean.length; i += 2) {
    const byte = parseInt(clean.substring(i, i + 2), 16)
    if (!isNaN(byte) && byte >= 32 && byte <= 126) {
      res += String.fromCharCode(byte)
    } else if (byte === 10 || byte === 13 || byte === 9) {
      res += ' '
    }
  }
  return res
}

/**
 * Pure Node/JS stream decompressor.
 * Extracts text from PDF content streams (BT...ET blocks, Tj, TJ, hex strings).
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
        text = match[1]
      }
    }

    if (text) {
      // 1. Text array operator: [(...) 10 (...) -20] TJ or [<48656c6c6f> 10 <576f726c64>] TJ
      const tjMatches = text.matchAll(/\[([\s\S]*?)\]\s*TJ/gi)
      for (const m of tjMatches) {
        const parts = m[1].matchAll(/\((.*?)(?<!\\)\)|<([0-9a-fA-F]+)>/g)
        const combined = Array.from(parts, (p) => {
          if (p[1] !== undefined) return cleanPdfString(p[1])
          if (p[2] !== undefined) return decodePdfHex(p[2])
          return ''
        }).join('')
        if (combined.trim()) chunks.push(combined)
      }

      // 2. Single string operators: (string) Tj or <hex> Tj
      const singleMatches = text.matchAll(/(?:\((.*?)(?<!\\)\)|<([0-9a-fA-F]+)>)\s*(?:Tj|'|")/gi)
      for (const m of singleMatches) {
        let cleaned = ''
        if (m[1] !== undefined) cleaned = cleanPdfString(m[1])
        else if (m[2] !== undefined) cleaned = decodePdfHex(m[2])
        if (cleaned.trim()) chunks.push(cleaned)
      }

      // 3. Plain text inside text blocks
      const btMatches = text.matchAll(/BT\s+([\s\S]*?)\s+ET/gi)
      for (const m of btMatches) {
        const innerStrings = m[1].matchAll(/\((.*?)(?<!\\)\)|<([0-9a-fA-F]+)>/g)
        for (const s of innerStrings) {
          let cleaned = ''
          if (s[1] !== undefined) cleaned = cleanPdfString(s[1])
          else if (s[2] !== undefined) cleaned = decodePdfHex(s[2])
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

  for (const tech of KNOWN_TECH_SKILLS) {
    const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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
    experience: structured.experience && structured.experience.length > 0 ? structured.experience : fallback.experience,
    education: structured.education && structured.education.length > 0 ? structured.education : fallback.education,
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

    // Stage 1: Try native zlib PDF stream extraction (pure JS, 0 native dependencies, fast & reliable)
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

    return ''
  }

  // Text/Markdown files
  return await file.text()
}

function sanitizeFullName(raw: string): string {
  if (!raw) return ''

  const PDF_ARTIFACTS = [
    'endobj', 'endstream', 'stream', 'xref', 'trailer',
    'startxref', 'obj', '>>', 'BT', 'ET', 'Tf', 'Td', 'Tj',
  ]

  const lower = raw.toLowerCase().trim()
  if (PDF_ARTIFACTS.some(token => lower === token.toLowerCase())) return ''
  if (/^\d+\s+\d+\s+obj/.test(raw)) return ''
  if (/^%PDF/.test(raw)) return ''
  if (raw.length < 2 || raw.length > 80) return ''

  const cleaned = raw.replace(/[^a-zA-Z\s\-'.]/g, '').trim()
  if (cleaned.length < 2) return ''
  if (/\d{3,}/.test(cleaned)) return ''

  return cleaned
}

/**
 * Loads all stored resumes for a user (up to 2).
 */
async function fetchUserResumes(supabase: any, userId: string): Promise<StoredResumeItem[]> {
  try {
    const { data: versions, error: versionsError } = await supabase
      .from('resume_versions')
      .select('id, resume_id, file_url, file_name, created_at, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(2)

    if (!versionsError && versions && versions.length > 0) {
      const items: StoredResumeItem[] = []

      for (const v of versions) {
        const { data: parsed } = await supabase
          .from('parsed_resume_data')
          .select('structured_data, markdown')
          .eq('resume_version_id', v.id)
          .maybeSingle()

        const { data: parentResume } = await supabase
          .from('resumes')
          .select('is_active')
          .eq('id', v.resume_id)
          .maybeSingle()

        const structured = parsed?.structured_data || (parsed?.markdown ? parseResumeMarkdown(parsed.markdown) : null)
        const dashboardData = structured ? structuredToDashboardResume(structured) : {
          name: '',
          skills: [],
          experience: [],
          education: [],
          targetRole: undefined,
          summary: undefined,
        }

        items.push({
          id: v.resume_id || v.id,
          versionId: v.id,
          fileName: v.file_name || 'Uploaded Resume.pdf',
          fileUrl: v.file_url,
          uploadedAt: v.created_at,
          isActive: Boolean(parentResume?.is_active),
          skillsCount: dashboardData.skills.length,
          targetRole: dashboardData.targetRole,
          candidateName: dashboardData.name,
          data: dashboardData,
        })
      }

      // If at least one resume exists but none is marked active, mark the first as active
      if (items.length > 0 && !items.some(i => i.isActive)) {
        items[0].isActive = true
      }

      return items
    }
  } catch (err) {
    console.warn('[api/resume] fetchUserResumes db query failed:', err)
  }

  // Fallback: Check profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('resume_text, resume_url, full_name, target_role, updated_at')
    .eq('id', userId)
    .single()

  if (profile?.resume_text) {
    const structured = parseResumeMarkdown(profile.resume_text)
    if (structured) {
      const dashboardData = structuredToDashboardResume(structured)
      if (!dashboardData.name && profile.full_name) dashboardData.name = profile.full_name
      if (!dashboardData.targetRole && profile.target_role) dashboardData.targetRole = profile.target_role

      return [
        {
          id: 'primary-resume',
          fileName: 'Primary Resume.pdf',
          fileUrl: profile.resume_url || null,
          uploadedAt: profile.updated_at || new Date().toISOString(),
          isActive: true,
          skillsCount: dashboardData.skills.length,
          targetRole: dashboardData.targetRole,
          candidateName: dashboardData.name,
          data: dashboardData,
        }
      ]
    }
  }

  return []
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const resumes = await fetchUserResumes(supabase, user.id)
  const activeResume = resumes.find(r => r.isActive) || resumes[0] || null

  return NextResponse.json({
    resumes,
    activeResume,
    resume: activeResume?.data || null,
    meta: activeResume ? {
      uploadedAt: activeResume.uploadedAt,
      fileName: activeResume.fileName,
      source: 'dashboard' as const,
    } : null,
  })
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check existing count — limit is strictly 2 resumes
    const existingResumes = await fetchUserResumes(supabase, user.id)
    if (existingResumes.length >= 2) {
      return NextResponse.json(
        {
          error: 'Resume limit reached (2/2). Please remove at least 1 previous resume to upload a new one.',
          limitReached: true,
          currentCount: existingResumes.length,
        },
        { status: 400 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const ALLOWED_TYPES = ['application/pdf', 'text/plain']
    const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.md']
    const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase()

    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: 'Only PDF and text files are supported' }, { status: 415 })
    }

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
    let resumeData: ResumeData
    let markdown = ''

    if (normalized.length < 20) {
      resumeData = buildFallbackResumeData(normalized, file.name)
      markdown = formatResumeMarkdown({
        name: resumeData.name,
        position: resumeData.targetRole || null,
        experience_level: null,
        overview_summarized: resumeData.summary || null,
        key_skills: resumeData.skills,
        experience: resumeData.experience,
        education: resumeData.education,
        raw_text: normalized,
      })
    } else {
      try {
        const parsingService = new ResumeParsingService()
        const parsed = await parsingService.parseFromText(normalized)
        resumeData = mapStructuredToResumeData(parsed.structuredData, normalized, file.name)
        markdown = parsed.markdown
      } catch (modelError) {
        console.warn('[api/resume] model parse failed, using fallback:', modelError)
        resumeData = buildFallbackResumeData(normalized, file.name)
        markdown = formatResumeMarkdown({
          name: resumeData.name,
          position: resumeData.targetRole || null,
          experience_level: null,
          overview_summarized: resumeData.summary || null,
          key_skills: resumeData.skills,
          experience: resumeData.experience,
          education: resumeData.education,
          raw_text: normalized,
        })
      }
    }

    // Persist into DB: mark previous resumes inactive so new one is active
    try {
      await supabase.from('resumes').update({ is_active: false }).eq('user_id', user.id)

      const { data: newResume, error: resumeErr } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          is_active: true,
          status: 'READY',
        })
        .select('id')
        .single()

      if (newResume?.id) {
        const { data: newVersion } = await supabase
          .from('resume_versions')
          .insert({
            resume_id: newResume.id,
            user_id: user.id,
            file_url: 'local-upload',
            file_name: file.name,
            file_size: file.size,
            version_number: 1,
            status: 'READY',
            parsed_at: new Date().toISOString(),
          })
          .select('id')
          .single()

        if (newVersion?.id) {
          await supabase.from('resumes').update({ active_version_id: newVersion.id }).eq('id', newResume.id)

          await supabase.from('parsed_resume_data').insert({
            resume_version_id: newVersion.id,
            user_id: user.id,
            raw_text: normalized,
            structured_data: {
              name: resumeData.name,
              position: resumeData.targetRole || null,
              experience_level: null,
              overview_summarized: resumeData.summary || null,
              key_skills: resumeData.skills,
              experience: resumeData.experience,
              education: resumeData.education,
            },
            markdown,
          })
        }
      }
    } catch (dbErr) {
      console.warn('[api/resume] direct table insert error:', dbErr)
    }

    // Sync profile as active grounding
    const safeName = sanitizeFullName(resumeData.name || '')
    await supabase
      .from('profiles')
      .update({
        resume_text: markdown,
        full_name: safeName || null,
        target_role: resumeData.targetRole || null,
      })
      .eq('id', user.id)

    const updatedResumes = await fetchUserResumes(supabase, user.id)

    return NextResponse.json({
      ...resumeData,
      resumes: updatedResumes,
    })
  } catch (err) {
    console.error('[api/resume] POST error:', err)
    return NextResponse.json({ error: 'Resume extraction failed' }, { status: 500 })
  }
}

/**
 * DELETE /api/resume?id=...
 * Deletes from Supabase AND purges from UploadThing storage.
 */
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    let targetId = searchParams.get('id')

    if (!targetId) {
      try {
        const body = await req.json()
        targetId = body?.id
      } catch {}
    }

    if (!targetId) {
      return NextResponse.json({ error: 'No resume ID provided for deletion' }, { status: 400 })
    }

    // 1. Locate file_url to purge from UploadThing
    let fileUrl: string | null = null

    const { data: version } = await supabase
      .from('resume_versions')
      .select('id, file_url, resume_id')
      .or(`id.eq.${targetId},resume_id.eq.${targetId}`)
      .eq('user_id', user.id)
      .maybeSingle()

    if (version?.file_url) {
      fileUrl = version.file_url
    }

    // Also check profile's resume_url if matched
    const { data: profile } = await supabase
      .from('profiles')
      .select('resume_url, resume_text')
      .eq('id', user.id)
      .single()

    if (!fileUrl && profile?.resume_url) {
      fileUrl = profile.resume_url
    }

    // 2. Purge from UploadThing
    if (fileUrl && fileUrl.startsWith('http')) {
      await deleteFromUploadThing(fileUrl)
    }

    // 3. Delete from Supabase DB
    try {
      if (version?.id) {
        await supabase.from('parsed_resume_data').delete().eq('resume_version_id', version.id)
        await supabase.from('resume_versions').delete().eq('id', version.id)
      }
      if (version?.resume_id) {
        await supabase.from('resumes').delete().eq('id', version.resume_id)
      } else {
        await supabase.from('resumes').delete().eq('id', targetId).eq('user_id', user.id)
      }
    } catch (dbErr) {
      console.warn('[api/resume] db delete warning:', dbErr)
    }

    // 4. Update remaining resumes and profile
    const remaining = await fetchUserResumes(supabase, user.id)

    if (remaining.length > 0) {
      // Activate the first remaining resume
      const nextActive = remaining[0]
      try {
        await supabase.from('resumes').update({ is_active: true }).eq('id', nextActive.id)
        const activeData = nextActive.data
        const nextMarkdown = formatResumeMarkdown({
          name: activeData.name,
          position: activeData.targetRole || null,
          experience_level: null,
          overview_summarized: activeData.summary || null,
          key_skills: activeData.skills,
          experience: activeData.experience,
          education: activeData.education,
        })
        await supabase
          .from('profiles')
          .update({
            resume_text: nextMarkdown,
            resume_url: nextActive.fileUrl || null,
            full_name: sanitizeFullName(activeData.name) || null,
            target_role: activeData.targetRole || null,
          })
          .eq('id', user.id)
      } catch {}
    } else {
      // No resumes left — clear profile resume grounding
      await supabase
        .from('profiles')
        .update({
          resume_text: null,
          resume_url: null,
        })
        .eq('id', user.id)
    }

    const updatedResumes = await fetchUserResumes(supabase, user.id)

    return NextResponse.json({
      success: true,
      resumes: updatedResumes,
    })
  } catch (err) {
    console.error('[api/resume] DELETE error:', err)
    return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 })
  }
}

/**
 * PATCH /api/resume
 * Set active grounding resume.
 */
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const targetId = body?.id

    if (!targetId) {
      return NextResponse.json({ error: 'Target resume ID required' }, { status: 400 })
    }

    // Mark all inactive, then activate target
    await supabase.from('resumes').update({ is_active: false }).eq('user_id', user.id)
    await supabase.from('resumes').update({ is_active: true }).eq('id', targetId).eq('user_id', user.id)

    // Sync profile with the newly activated resume
    const allResumes = await fetchUserResumes(supabase, user.id)
    const active = allResumes.find(r => r.id === targetId || r.versionId === targetId)

    if (active) {
      const activeData = active.data
      const nextMarkdown = formatResumeMarkdown({
        name: activeData.name,
        position: activeData.targetRole || null,
        experience_level: null,
        overview_summarized: activeData.summary || null,
        key_skills: activeData.skills,
        experience: activeData.experience,
        education: activeData.education,
      })

      await supabase
        .from('profiles')
        .update({
          resume_text: nextMarkdown,
          resume_url: active.fileUrl || null,
          full_name: sanitizeFullName(activeData.name) || null,
          target_role: activeData.targetRole || null,
        })
        .eq('id', user.id)
    }

    return NextResponse.json({
      success: true,
      activeId: targetId,
      resumes: allResumes,
    })
  } catch (err) {
    console.error('[api/resume] PATCH error:', err)
    return NextResponse.json({ error: 'Failed to switch active resume' }, { status: 500 })
  }
}
