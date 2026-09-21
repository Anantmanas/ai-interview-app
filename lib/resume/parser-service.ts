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
      You are a professional technical recruiter and resume analyzer.
      Analyze the following resume text and extract the key details as a JSON object.
      You MUST return your response as a valid JSON object ONLY. Do not include markdown code block ticks or comments outside the JSON.

      JSON schema to return:
      {
        "name": "Full Name — MUST be a human full name (2-4 words, letters only). If you cannot confidently identify a real human name from the text, return null for name.",
        "position": "Current or Target Professional Title/Position",
        "experience_level": "junior" | "mid" | "senior" | "staff" | "principal",
        "overview_summarized": "A 2-3 sentence overview of experience and career focus",
        "key_skills": ["List", "of", "top", "skills", "languages", "frameworks", "tools"]
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

      return {
        name: typeof analysis.name === 'string' ? analysis.name : null,
        position: typeof analysis.position === 'string' ? analysis.position : null,
        experience_level: normalizeExperienceLevel(analysis.experience_level),
        overview_summarized: typeof analysis.overview_summarized === 'string' ? analysis.overview_summarized : null,
        key_skills: Array.isArray(rawSkills)
          ? rawSkills.filter((skill: unknown) => typeof skill === 'string' && skill.trim().length > 0)
          : [],
      }
    } catch (error) {
      console.error('[ResumeParsingService] Failed to parse resume analysis JSON response:', error)
      throw new Error('Failed to extract structured data from resume analysis response.')
    }
  }
}
