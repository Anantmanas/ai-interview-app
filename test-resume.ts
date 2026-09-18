import fs from 'fs'
import path from 'path'
import { PDFParse } from 'pdf-parse'
import { openai, GENERATION_MODEL } from './lib/ai/client'

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

  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is not defined')
    return
  }
  
  console.log('3. Calling OpenAI for extraction...')
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
      model: GENERATION_MODEL,
      messages: [
        { role: 'system', content: 'You are a professional technical recruiter and resume analyzer. You only respond with JSON matching the specified schema.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    })

    const resultText = completion.choices[0]?.message?.content || '{}'
    console.log('Received raw response from OpenAI!')
    
    let content = resultText.trim()
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }
    
    const analysis = JSON.parse(content)
    console.log('\n--- SUCCESS: EXTRACTED DATA ---')
    console.log(JSON.stringify(analysis, null, 2))
    console.log('--------------------------------\n')

    console.log('--- TEST COMPLETED SUCCESSFULLY ---')
  } catch (err: any) {
    console.error('Failed to analyze with OpenAI:', err.message)
  }
}

testResumeAnalysis()
