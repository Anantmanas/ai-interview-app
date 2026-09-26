import { createChatCompletion, GENERATION_MODEL } from '@/lib/ai/client'
import { formatResumeMarkdown, normalizeExperienceLevel } from '@/lib/resume/format'
import type { StructuredResumeData } from '@/lib/resume/types'

export class ResumeParsingService {
  async parseFromText(rawText: string) {
    const structuredData = await this.extractStructuredData(rawText)

    return {
      rawText,
      structuredData,
      markdown: formatResumeMarkdown({ ...structuredData, raw_text: rawText }),
    }
  }

  async parseFromUrl(resumeUrl: string) {
    const rawText = await this.extractPdfText(resumeUrl)
    return this.parseFromText(rawText)
  }

  private async extractPdfText(resumeUrl: string) {
    const response = await fetch(resumeUrl)

    if (!response.ok) {
      throw new Error('Failed to download resume PDF')
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const { PDFParse } = await import('pdf-parse')
    const parser = new PDFParse({ data: buffer })

    try {
      const parsedData = await parser.getText()
      const resumeText = parsedData.text?.trim()

      if (!resumeText) {
        throw new Error('Failed to extract text from the PDF file')
      }

      return resumeText
    } finally {
      await parser.destroy()
    }
  }

  private async extractStructuredData(resumeText: string): Promise<StructuredResumeData> {
    const prompt = `
      You are an expert technical recruiter and resume analyzer.
      Analyze the following resume text and extract all details accurately into the requested JSON schema.
      You MUST return your response as a valid JSON object ONLY. Do not include markdown code block ticks or comments outside the JSON.

      JSON schema to return:
      {
        "name": "Candidate's real full name (letters and spaces only). If unclear, extract candidate name from header or contact info.",
        "position": "Current or target job title (e.g. Software Engineer, Full Stack Developer, Frontend Engineer)",
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
        .map((edu: any) => typeof edu === 'string' ? edu : edu.degree ? `${edu.degree}${edu.institution ? ` at ${edu.institution}` : ''}` : String(edu))
        .filter(Boolean)

      return {
        name: typeof analysis.name === 'string' ? analysis.name : null,
        position: typeof analysis.position === 'string' ? analysis.position : null,
        experience_level: normalizeExperienceLevel(analysis.experience_level),
        overview_summarized: typeof analysis.overview_summarized === 'string' ? analysis.overview_summarized : null,
        key_skills: Array.isArray(rawSkills)
          ? rawSkills.filter((skill: unknown) => typeof skill === 'string' && skill.trim().length > 0)
          : [],
        experience: cleanedExperience.length > 0 ? cleanedExperience : undefined,
        education: cleanedEducation.length > 0 ? cleanedEducation : undefined,
      }
    } catch (error) {
      console.error('[ResumeParsingService] Failed to parse resume analysis JSON response:', error)
      throw new Error('Failed to extract structured data from resume analysis response.')
    }
  }
}
