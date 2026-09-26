import { NextRequest, NextResponse } from 'next/server'
import { createChatCompletion } from '@/lib/ai/client'

const DEFAULT_POPULAR_ROLES = [
  'Full Stack Developer',
  'Frontend Engineer',
  'Backend Engineer',
  'Software Engineer',
  'DevOps Engineer',
  'AI / ML Engineer',
  'Data Engineer',
  'Mobile Developer (iOS/Android)',
  'Cloud Solutions Architect',
  'QA Automation Engineer',
]

function getRuleBasedRoles(skills: string[] = []): string[] {
  const lower = skills.map((s) => s.toLowerCase())
  const suggestions = new Set<string>()

  const hasFrontend = lower.some((s) => ['react', 'next.js', 'vue', 'angular', 'svelte', 'tailwind', 'javascript', 'typescript', 'css', 'html'].includes(s))
  const hasBackend = lower.some((s) => ['node.js', 'express', 'python', 'django', 'fastapi', 'java', 'spring', 'go', 'golang', 'c#', '.net', 'sql', 'postgresql', 'mongodb', 'redis'].includes(s))
  const hasDevops = lower.some((s) => ['docker', 'kubernetes', 'aws', 'gcp', 'azure', 'ci/cd', 'linux', 'terraform'].includes(s))
  const hasAI = lower.some((s) => ['pytorch', 'tensorflow', 'openai', 'langchain', 'machine learning', 'deep learning', 'pandas', 'numpy'].includes(s))
  const hasMobile = lower.some((s) => ['react native', 'flutter', 'swift', 'kotlin', 'android', 'ios'].includes(s))

  if (hasFrontend && hasBackend) {
    suggestions.add('Full Stack Engineer')
    suggestions.add('Full Stack Developer')
  }
  if (hasFrontend) {
    suggestions.add('Frontend Engineer')
    suggestions.add('React Developer')
  }
  if (hasBackend) {
    suggestions.add('Backend Engineer')
    suggestions.add('Node.js / Python Developer')
  }
  if (hasDevops) {
    suggestions.add('DevOps / Cloud Engineer')
    suggestions.add('Site Reliability Engineer (SRE)')
  }
  if (hasAI) {
    suggestions.add('AI / ML Engineer')
    suggestions.add('Data Scientist')
  }
  if (hasMobile) {
    suggestions.add('Mobile App Developer')
  }

  // Always fill with popular fallbacks if list is short
  for (const r of DEFAULT_POPULAR_ROLES) {
    if (suggestions.size >= 8) break
    suggestions.add(r)
  }

  return Array.from(suggestions)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { skills = [], summary = '', currentInput = '' } = body

    // 1. If we have skills or summary, try Free AI model to generate hyper-personalized roles
    if ((Array.isArray(skills) && skills.length > 0) || summary || currentInput) {
      try {
        const prompt = `Based on the following candidate profile, suggest the 6 most relevant and high-demand tech job roles/titles.
Candidate Skills: ${skills.join(', ') || 'N/A'}
Summary/Context: ${summary || 'N/A'}
Current Search/Interest: ${currentInput || 'N/A'}

Respond with ONLY a JSON object in this exact format:
{
  "roles": ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5", "Title 6"],
  "recommended": "Top Title"
}`

        const res = await createChatCompletion({
          messages: [
            {
              role: 'system',
              content: 'You are an expert career and tech recruitment advisor. Return strictly valid JSON containing role title suggestions.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          responseFormat: { type: 'json_object' },
          maxTokens: 300,
        })

        const content = res.choices[0]?.message?.content
        if (content) {
          const parsed = JSON.parse(content)
          if (Array.isArray(parsed.roles) && parsed.roles.length > 0) {
            return NextResponse.json({
              roles: parsed.roles.slice(0, 8),
              recommended: parsed.recommended || parsed.roles[0],
            })
          }
        }
      } catch (aiErr) {
        console.warn('[suggest-roles] AI prompt failed, falling back to rule-based suggestions:', aiErr)
      }
    }

    // 2. Rule-based / default instant fallback (always free, 0 latency, 0 cost)
    const ruleBased = getRuleBasedRoles(skills)
    return NextResponse.json({
      roles: ruleBased.slice(0, 8),
      recommended: ruleBased[0] || 'Software Engineer',
    })
  } catch (error) {
    console.error('[suggest-roles] error:', error)
    return NextResponse.json({
      roles: DEFAULT_POPULAR_ROLES.slice(0, 8),
      recommended: 'Software Engineer',
    })
  }
}
