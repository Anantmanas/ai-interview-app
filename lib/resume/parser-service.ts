import OpenAI from 'openai'
import { formatResumeMarkdown, normalizeExperienceLevel } from '@/lib/resume/format'
import type { StructuredResumeData } from '@/lib/resume/types'

export class ResumeParsingService {
  async parseFromUrl(resumeUrl: string) {
    const rawText = await this.extractPdfText(resumeUrl)
    const structuredData = await this.extractStructuredData(rawText)

    return {
      rawText,
      structuredData,
      markdown: formatResumeMarkdown({ ...structuredData, raw_text: rawText }),
    }
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
    const apiKey = process.env.DEEPSEAK_API_KEY

    if (!apiKey) {
      throw new Error('NVIDIA API key (DEEPSEAK_API_KEY) is not configured')
    }

    const openai = new OpenAI({
      apiKey,
      baseURL: process.env.DEEPSEAK_API_URL || 'https://integrate.api.nvidia.com/v1',
    })

    const prompt = `
      You are a professional technical recruiter and resume analyzer.
      Analyze the following resume text and extract the key details as a JSON object.
      You MUST return your response as a valid JSON object ONLY. Do not include markdown code block ticks or comments outside the JSON.

      JSON schema to return:
      {
        "name": "Full Name",
        "position": "Current or Target Professional Title/Position",
        "experience_level": "junior" | "mid" | "senior" | "staff" | "principal",
        "overview_summarized": "A 2-3 sentence overview of experience and career focus",
        "key_skills": ["List", "of", "top", "skills", "languages", "frameworks", "tools"]
      }

      Resume text:
      ${resumeText}
    `

    const completion = await openai.chat.completions.create({
      model: 'deepseek-ai/deepseek-v4-flash',
      messages: [
        { role: 'system', content: 'You are a professional technical recruiter and resume analyzer. You only respond with JSON matching the specified schema.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    })

    try {
      let content = completion.choices[0]?.message?.content || '{}'

      if (content.startsWith('```json')) {
        content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (content.startsWith('```')) {
        content = content.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }

      const analysis = JSON.parse(content.trim())

      return {
        name: typeof analysis.name === 'string' ? analysis.name : null,
        position: typeof analysis.position === 'string' ? analysis.position : null,
        experience_level: normalizeExperienceLevel(analysis.experience_level),
        overview_summarized: typeof analysis.overview_summarized === 'string' ? analysis.overview_summarized : null,
        key_skills: Array.isArray(analysis.key_skills) ? analysis.key_skills.filter((skill: unknown) => typeof skill === 'string') : [],
      }
    } catch (error) {
      console.error('Failed to parse resume analysis JSON response:', error)
      throw new Error('Failed to extract structured data from resume analysis response.')
    }
  }
}

