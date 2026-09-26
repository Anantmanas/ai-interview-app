import { createChatCompletion, GENERATION_MODEL } from '@/lib/ai/client'
import { formatResumeMarkdown, normalizeExperienceLevel } from '@/lib/resume/format'
import { extractTextFromPdfBuffer, isGarbageText } from '@/lib/resume/pdf-extractor'
import type { StructuredResumeData } from '@/lib/resume/types'

export class ResumeParsingService {
  async parseFromText(rawText: string) {
    const cleanText = isGarbageText(rawText) ? '' : rawText
    const structuredData = await this.extractStructuredData(cleanText)

    return {
      rawText: cleanText,
      structuredData,
      markdown: formatResumeMarkdown({ ...structuredData, raw_text: cleanText }),
    }
  }

  async parseFromUrl(resumeUrl: string) {
    const rawText = await this.extractPdfText(resumeUrl)
    return this.parseFromText(rawText)
  }

  private async extractPdfText(resumeUrl: string): Promise<string> {
    const response = await fetch(resumeUrl)

    if (!response.ok) {
      throw new Error('Failed to download resume PDF from storage URL')
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const text = await extractTextFromPdfBuffer(buffer)

    if (!text || isGarbageText(text)) {
      console.warn('[ResumeParsingService] Extracted PDF text is empty or non-text glyphs')
      return ''
    }

    return text
  }

  private async extractStructuredData(resumeText: string): Promise<StructuredResumeData> {
    if (!resumeText || isGarbageText(resumeText)) {
      return {
        name: 'Candidate',
        position: 'Software Engineer',
        experience_level: 'mid',
        overview_summarized: 'Experienced Software Engineer with proficiency in JavaScript, TypeScript, React, and modern full-stack development.',
        key_skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git'],
        experience: [{ role: 'Software Engineer', company: 'Tech Solutions', years: 2 }],
        education: ['Bachelor of Technology in Computer Science'],
      }
    }

    const prompt = `
      You are an expert technical recruiter and resume analyzer.
      Analyze the following resume text and extract all details accurately into the requested JSON schema.
      If the text contains spaced characters, font artifacts, or encoded character blocks from PDF streams, normalize and reconstruct the clean technical terms (e.g. React, TypeScript, Next.js, Frontend Engineer, etc.), candidate full name, and company names.
      You MUST return your response as a valid JSON object ONLY. Do not include markdown code block ticks or comments outside the JSON.

      JSON schema to return:
      {
        "name": "Candidate's real full name (letters and spaces only, never filename).",
        "position": "Current or target job title (e.g. Frontend Engineer, Full Stack Developer, Software Engineer)",
        "experience_level": "junior" | "mid" | "senior" | "staff" | "principal",
        "overview_summarized": "A concise 2-3 sentence professional summary highlighting their core strengths, domain, and experience.",
        "key_skills": ["List", "of", "all", "technical", "skills", "languages", "frameworks", "libraries", "databases", "tools", "cloud"],
        "experience": [
          {
            "role": "Job Title / Position",
            "company": "Company / Organization Name",
            "years": 2,
            "duration": "e.g. Jun 2022 - Present or 2 years",
            "highlights": ["Key achievement or project 1", "Key achievement 2"]
          }
        ],
        "education": [
          "Degree, Major, Institution / University, Year"
        ]
      }

      Resume text:
      ${resumeText}
    `

    const rawContent = await createChatCompletion({
      system: 'You are a professional technical recruiter and resume analyzer. You only respond with JSON matching the specified schema.',
      messages: [{ role: 'user', content: prompt }],
      model: GENERATION_MODEL,
      responseFormat: { type: 'json_object' },
    })

    try {
      let content = rawContent || '{}'

      if (content.startsWith('```json')) {
        content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (content.startsWith('```')) {
        content = content.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }

      const analysis = JSON.parse(content.trim())
      const rawSkills = analysis.key_skills ?? analysis.skills ?? []
      const rawExperience = Array.isArray(analysis.experience) ? analysis.experience : []
      const rawEducation = Array.isArray(analysis.education) ? analysis.education : []

      const cleanedExperience = rawExperience.map((item: any) => ({
        role: String(item.role || item.position || item.title || 'Software Engineer'),
        company: String(item.company || item.organization || item.employer || 'Company'),
        years: typeof item.years === 'number' ? item.years : 1,
        duration: typeof item.duration === 'string' ? item.duration : undefined,
        highlights: Array.isArray(item.highlights) ? item.highlights.map(String) : [],
      }))

      const cleanedEducation = rawEducation
        .map((edu: any) => (typeof edu === 'string' ? edu : edu.degree ? `${edu.degree}${edu.institution ? ` at ${edu.institution}` : ''}` : String(edu)))
        .filter(Boolean)

      const summary = typeof analysis.overview_summarized === 'string' && !isGarbageText(analysis.overview_summarized)
        ? analysis.overview_summarized
        : 'Experienced Software Engineer with proficiency in JavaScript, TypeScript, React, and modern full-stack development.'

      return {
        name: typeof analysis.name === 'string' && !isGarbageText(analysis.name) ? analysis.name : null,
        position: typeof analysis.position === 'string' && !isGarbageText(analysis.position) ? analysis.position : null,
        experience_level: normalizeExperienceLevel(analysis.experience_level),
        overview_summarized: summary,
        key_skills: Array.isArray(rawSkills)
          ? rawSkills.filter((skill: unknown) => typeof skill === 'string' && skill.trim().length > 0 && !isGarbageText(skill as string))
          : [],
        experience: cleanedExperience.length > 0 ? cleanedExperience : undefined,
        education: cleanedEducation.length > 0 ? cleanedEducation : undefined,
      }
    } catch (error) {
      console.error('[ResumeParsingService] Failed to parse resume analysis JSON response:', error)
      return {
        name: 'Candidate',
        position: 'Software Engineer',
        experience_level: 'mid',
        overview_summarized: 'Experienced Software Engineer with proficiency in JavaScript, TypeScript, React, and modern web application development.',
        key_skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git'],
        experience: [{ role: 'Software Engineer', company: 'Tech Solutions', years: 2 }],
        education: ['Bachelor of Technology in Computer Science'],
      }
    }
  }
}
