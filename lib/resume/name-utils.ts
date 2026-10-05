/**
 * Utilities for extracting, validating, and resolving clean candidate names.
 * Prevents sentence fragments, resume summaries, job titles, or noise tokens
 * from being stored or displayed as candidate names.
 */

// Words and patterns that should NEVER appear in a legitimate person's name
const FORBIDDEN_WORDS = new Set([
  // Sentence / summary fragments
  'time', 'roles', 'role', 'india', 'globally', 'global', 'remote',
  'full-time', 'part-time', 'open', 'seeking', 'looking', 'available',
  'in', 'and', 'or', 'to', 'for', 'with', 'at', 'by', 'from', 'of', 'the',
  'a', 'an', 'is', 'as', 'on', 'all', 'any', 'such', 'into', 'over', 'after',
  // Resume sections & titles
  'experience', 'experienced', 'summary', 'overview', 'profile', 'resume',
  'curriculum', 'vitae', 'cv', 'page', 'candidate', 'developer', 'engineer',
  'software', 'frontend', 'backend', 'fullstack', 'full-stack', 'analyst',
  'skills', 'education', 'projects', 'work', 'history', 'responsibilities',
  'technologies', 'certifications', 'university', 'college', 'school',
  'degree', 'bachelor', 'master', 'contact', 'phone', 'email', 'address',
  'linkdin', 'linkedin', 'github', 'portfolio', 'unknown', 'n/a', 'null',
  'undefined', 'none', 'na', 'name', 'not', 'city', 'state', 'zip', 'country',
  'technical', 'professional', 'about', 'lead', 'architect', 'manager',
  'designer', 'specialist', 'consultant', 'intern', 'fresher', 'student'
])

/**
 * Validates whether a candidate name string is a genuine person name
 * and not a sentence fragment, role description, or noise.
 */
export function isValidCandidateName(name: string | null | undefined): boolean {
  if (!name || typeof name !== 'string') return false
  const trimmed = name.trim()

  // Character length constraints (real names: 2 to 40 characters)
  if (trimmed.length < 2 || trimmed.length > 40) return false

  // Cannot end with sentence punctuation (e.g. "time roles in India and globally.")
  if (/[.,;!?]$/.test(trimmed)) return false

  // Cannot start with a lowercase letter
  if (/^[a-z]/.test(trimmed)) return false

  // Cannot contain URLs, emails, file extensions, or PDF markers
  if (/@|http|www\.|\.com|\.pdf|%PDF/i.test(trimmed)) return false

  // Cannot contain raw PDF or programming symbols
  if (/[\\/<>{}[\]|=+*^%$#@!~;:]/.test(trimmed)) return false

  // Split into words
  const words = trimmed.split(/\s+/).filter(Boolean)

  // Real person names are usually 1 to 4 words (e.g., "Anant", "Anant Manas")
  if (words.length < 1 || words.length > 4) return false

  // Check forbidden tokens
  for (const w of words) {
    const cleanWord = w.toLowerCase().replace(/[^a-z-]/g, '')
    if (FORBIDDEN_WORDS.has(cleanWord)) {
      return false
    }
  }

  // Must only consist of alphabetical characters, spaces, hyphens, and apostrophes
  if (!/^[A-Za-z][A-Za-z\s.'-]*$/.test(trimmed)) return false

  return true
}

/**
 * Extracts a candidate's name from their resume file name.
 * e.g., "Anant_Resume[2026].pdf" -> "Anant"
 *       "john_doe_cv.pdf" -> "John Doe"
 *       "Resume_2026.pdf" -> ""
 */
export function extractNameFromFileName(fileName: string | null | undefined): string {
  if (!fileName || typeof fileName !== 'string') return ''

  let base = fileName
    // Strip file extension
    .replace(/\.[^.]+$/, '')
    // Strip bracket/parenthesis contents e.g. [2026], (v2)
    .replace(/\[.*?\]|\(.*?\)/g, ' ')
    // Replace separators (underscores, dashes, dots) with spaces FIRST so word boundaries work
    .replace(/[-_.]+/g, ' ')
    // Strip standalone numbers / years
    .replace(/\b(19|20)?\d{2,4}\b/g, ' ')
    // Strip common resume keywords on word boundaries
    .replace(/\b(resume|cv|curriculum|vitae|profile|candidate|portfolio|document|doc|pdf|latest|final|draft|v\d+)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (base.length >= 2 && isValidCandidateName(base)) {
    // Format to Title Case
    return base
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
  }

  return ''
}

/**
 * Extracts candidate name from LinkedIn URL in resume text if present.
 * e.g., "linkedin.com/in/anant-manas" -> "Anant Manas"
 *       "linkedin.com/in/anantmanas" -> "Anant"
 */
export function extractNameFromLinkedIn(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') return ''

  const match = text.match(/linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i)
  if (!match?.[1]) return ''

  const handle = match[1]
    .replace(/[-_]+/g, ' ')
    .replace(/\d+/g, '')
    .trim()

  if (handle.length >= 2) {
    const words = handle
      .split(/\s+/)
      .filter((w) => w.length >= 2)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())

    const candidate = words.join(' ')
    if (isValidCandidateName(candidate)) {
      return candidate
    }

    if (words[0] && isValidCandidateName(words[0])) {
      return words[0]
    }
  }

  return ''
}

/**
 * Extracts candidate name from raw resume text using heuristics.
 */
export function extractNameFromText(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') return ''

  // 1. Look for explicit "Name:" or "Candidate Name:" label
  const nameLabelMatch = text.match(/(?:name|candidate(?:\s+name)?)\s*[:\-]\s*([A-Za-z][A-Za-z\s.'-]{2,35})/i)
  if (nameLabelMatch?.[1]) {
    const candidate = nameLabelMatch[1].trim()
    if (isValidCandidateName(candidate)) {
      return candidate
    }
  }

  // 2. Scan top lines of the resume (names are almost always in the first 5 lines)
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('%PDF-') && !l.startsWith('http') && !l.includes('@'))
    .slice(0, 8)

  for (const line of lines) {
    // Direct line match
    if (isValidCandidateName(line)) {
      return line
    }

    // Line with title separator, e.g. "Anant Manas | Full Stack Developer"
    if (/[|•·\-/]/.test(line)) {
      const part = line.split(/[|•·\-/]/)[0].trim()
      if (isValidCandidateName(part)) {
        return part
      }
    }
  }

  return ''
}

export interface ResolveCandidateNameParams {
  name?: string | null
  fileName?: string | null
  rawText?: string | null
  fallback?: string | null
}

/**
 * Multi-layer resolver that guarantees an authentic candidate name
 * or returns a clear fallback ('Candidate Profile').
 */
export function resolveCandidateName({
  name,
  fileName,
  rawText,
  fallback,
}: ResolveCandidateNameParams): string {
  // 1. If name is already valid, return it
  if (isValidCandidateName(name)) {
    return name!.trim()
  }

  // 2. Try raw text extraction
  if (rawText) {
    const textName = extractNameFromText(rawText)
    if (isValidCandidateName(textName)) {
      return textName
    }

    const linkedInName = extractNameFromLinkedIn(rawText)
    if (isValidCandidateName(linkedInName)) {
      return linkedInName
    }
  }

  // 3. Try filename extraction (e.g. "Anant_Resume[2026].pdf" -> "Anant")
  if (fileName) {
    const fileNameCandidate = extractNameFromFileName(fileName)
    if (isValidCandidateName(fileNameCandidate)) {
      return fileNameCandidate
    }
  }

  // 4. Try fallback (e.g. user's profile full_name)
  if (isValidCandidateName(fallback)) {
    return fallback!.trim()
  }

  // 5. Clean default fallback
  return 'Candidate Profile'
}
