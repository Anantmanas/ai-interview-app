import fs from 'fs'
import path from 'path'
import { PDFParse } from 'pdf-parse'
import OpenAI from 'openai'

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (!match) continue

    const key = match[1].trim()
    let value = match[2].trim()
    if (
      (value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"'))
    ) {
      value = value.slice(1, -1)
    }

    process.env[key] = value
  }
}

// Load environment variables from .env.local
loadEnvLocal()

async function testResumeAnalysis() {
  console.log('--- START RESUME ANALYSIS TEST ---')
  
  const resumePath = path.join(process.cwd(), 'Anant_Manas_Resume.pdf')
  if (!fs.existsSync(resumePath)) {
    console.error(`Error: Resume file not found at ${resumePath}`)
    return
  }

  console.log(`1. Reading local resume PDF: ${resumePath}`)
  const buffer = fs.readFileSync(resumePath)

  console.log('2. Parsing PDF content to text using pdf-parse...')
  let resumeText = ''
  try {
    const parser = new PDFParse({ data: buffer })
    const parsedData = await parser.getText()
    await parser.destroy()
    resumeText = parsedData.text
    console.log('Successfully extracted text from PDF!')
    console.log(`Extracted text length: ${resumeText.length} characters.`)
    console.log('Sample of extracted text:\n', resumeText.slice(0, 400), '...\n')
  } catch (err: any) {
    console.error('Failed to parse PDF:', err.message)
    return
  }

  const apiKey = process.env.DEEPSEAK_API_KEY
  if (!apiKey) {
    console.error('Error: DEEPSEAK_API_KEY environment variable is not defined in .env.local')
    return
  }
  
  console.log('3. Initializing OpenAI client with DeepSeek endpoint...')
  const openai = new OpenAI({
    apiKey,
    baseURL: process.env.DEEPSEAK_API_URL || 'https://integrate.api.nvidia.com/v1',
  })

  console.log('4. Calling deepseek-ai/deepseek-v4-flash for extraction...')
  const prompt = `
    You are a professional technical recruiter and resume analyzer.
    Analyze the following resume text and extract the key details as a JSON object.
    You MUST return your response as a valid JSON object ONLY. Do not include markdown code block ticks (\`\`\`json) or any comments outside the JSON.
    
    JSON schema to return:
    {
      "name": "Full Name",
      "position": "Current or Target Professional Title/Position (e.g. Senior Frontend Engineer)",
      "experience_level": "junior" | "mid" | "senior" | "staff" | "principal",
      "overview_summarized": "A beautiful 2-3 sentence overview of their experience and career focus",
      "key_skills": ["List", "of", "top", "skills", "coding languages", "frameworks", "and", "tools"]
    }

    Resume text:
    ${resumeText}
  `

  try {
    const completion = await openai.chat.completions.create({
      model: 'deepseek-ai/deepseek-v4-flash',
      messages: [
        { role: 'system', content: 'You are a professional technical recruiter and resume analyzer. You only respond with JSON matching the specified schema.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    })

    const resultText = completion.choices[0]?.message?.content || '{}'
    console.log('Received raw response from DeepSeek!')
    
    let content = resultText.trim()
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }
    
    const analysis = JSON.parse(content)
    console.log('\n--- SUCCESS: DEEPSEEK EXTRACTED DATA ---')
    console.log(JSON.stringify(analysis, null, 2))
    console.log('----------------------------------------\n')

    // Create Markdown format and verify
    console.log('5. Formatted Markdown representation preview:')
    const structuredResumeMarkdown = `# ${analysis.name || 'Resume Profile'}
**Target Role / Position:** ${analysis.position || 'N/A'}
**Experience Level:** ${analysis.experience_level || 'N/A'}

## Professional Overview
${analysis.overview_summarized || 'N/A'}

## Key Skills & Technologies
${analysis.key_skills && Array.isArray(analysis.key_skills) ? analysis.key_skills.map((skill: string) => `- ${skill}`).join('\n') : 'N/A'}
`
    console.log(structuredResumeMarkdown)
    console.log('--- TEST COMPLETED SUCCESSFULLY ---')

  } catch (err: any) {
    console.error('Failed to analyze with DeepSeek:', err.message)
  }
}

testResumeAnalysis()
