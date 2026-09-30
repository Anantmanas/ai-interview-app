import { NextRequest, NextResponse } from 'next/server'
import { createChatCompletion, GENERATION_MODEL, EVALUATION_MODEL } from '@/lib/ai/client'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/middleware/rate-limit'

type ChatMessage = { role: 'user' | 'assistant'; content: string }

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const rateLimit = await checkRateLimit(user.id)
      if (!rateLimit.allowed) {
        const plan = rateLimit.plan || 'free'
        return NextResponse.json(
          {
            error: 'Daily limit reached.',
            message: plan === 'free'
              ? 'You have used your 3 free AI sessions today. Upgrade to Pro for unlimited access.'
              : 'Daily session limit reached. Resets at midnight.',
            upgradeUrl: '/dashboard/billing',
          },
          {
            status: 429,
            headers: {
              'Retry-After': '86400',
              'X-RateLimit-Plan': plan,
            },
          }
        )
      }
    }

    const body = await req.json()
    const {
      mode,
      messages = [],
      resumeContext = '',
      sessionHistory = [],
      interviewType = 'technical',
      difficulty = 'medium',
      topic,
      answerType,
      prompt,
      question,
      textAnswer = '',
      codeAnswer = '',
    } = body

    if (mode === 'generate') {
      const isBehavioral = interviewType === 'behavioral'
      const isTechnicalDSA = interviewType === 'technical' || interviewType === 'dsa'
      const isSystemDesign = interviewType === 'system_design' || interviewType === 'system-design'
      const roleName = topic || 'Software Engineer'
      const topicFocus = topic ? `focused specifically on ${topic}` : ''

      let generationPrompt = prompt
      if (!generationPrompt) {
        if (isBehavioral) {
          generationPrompt = `Generate 5 behavioral interview questions for a ${roleName} role at ${difficulty} difficulty level. Resume context: ${resumeContext || 'Software Engineer'}.
CRITICAL REQUIREMENTS FOR BEHAVIORAL TRACK:
- Every question must be a situational behavioral scenario evaluating teamwork, ownership, incident triage, disagreement resolution, prioritization, and communication.
- Do NOT ask candidates to "explain fundamental principles of [Role]". Treat "${roleName}" as the candidate's professional job role, not a technical concept.
- Candidates will structure answers using the STAR format (Situation, Task, Action, Result).
Return ONLY a valid JSON object with key "questions" containing an array of 5 objects with structure:
{
  "questions": [
    {
      "id": "q1",
      "text": "Behavioral question prompt?",
      "type": "behavioral",
      "topic": "Leadership / Collaboration / Incident Response",
      "difficulty": "${difficulty}",
      "requiresCode": false
    }
  ]
}`
        } else if (isTechnicalDSA) {
          generationPrompt = `Generate 5 hands-on Algorithms & Data Structures coding interview questions at ${difficulty} difficulty level for a candidate with background: ${resumeContext || 'Software Engineer'}. ${topicFocus ? `Focus area: ${topic}.` : ''}
CRITICAL REQUIREMENTS FOR ALGORITHMS & DATA STRUCTURES:
- Every question MUST be a concrete algorithmic problem (e.g. Arrays/HashMaps, Sliding Window, Two Pointers, Trees/Graphs, Dynamic Programming, Heaps, or Monotonic Stacks).
- Do NOT ask generic essay questions like "Explain the fundamental principles of..." or "What are the common bottlenecks...".
- Each question MUST include:
  1. Clear problem statement and expected function signature.
  2. Input / Output examples with expected return values.
  3. Explicit Time and Space complexity requirements (e.g. "Achieve O(N) time and O(N) space").
  4. Notable edge cases to account for (empty input, negatives, duplicates, boundary overflows).
- All questions MUST set "requiresCode": true.
Return ONLY a valid JSON object with key "questions" containing an array of 5 objects:
{
  "questions": [
    {
      "id": "q1",
      "text": "Problem description with input/output examples and complexity constraints...",
      "type": "technical",
      "topic": "Data Structures & Algorithms",
      "difficulty": "${difficulty}",
      "requiresCode": true
    }
  ]
}`
        } else {
          generationPrompt = `Generate 5 distributed system design interview questions ${topicFocus} for a ${interviewType} interview at ${difficulty} difficulty level. Resume context: ${resumeContext || 'Software Engineer'}.
CRITICAL REQUIREMENTS FOR SYSTEM DESIGN:
- Focus on real-world architecture scenarios (e.g. Distributed Cache with Stampede Prevention, Rate Limiter, Idempotent Payment Processor, Message Queue, Sharded Database).
- Include expected throughput (QPS), latency requirements, consistency vs availability trade-offs, and failure recovery.
Return ONLY a valid JSON object with key "questions" containing an array of 5 objects:
{
  "questions": [
    {
      "id": "q1",
      "text": "Scenario-based system design prompt...",
      "type": "${interviewType}",
      "topic": "${topic || 'Distributed Systems'}",
      "difficulty": "${difficulty}",
      "requiresCode": false
    }
  ]
}`
        }
      }

      let questionsList: any[] = []

      try {
        const raw = await createChatCompletion({
          system: isBehavioral
            ? 'You are an engineering director conducting a behavioral interview. You assess communication, ownership, collaboration, and incident response through structured behavioral questions.'
            : isTechnicalDSA
            ? 'You are a principal staff software engineer conducting a rigorous Algorithms & Data Structures coding interview. You create clear, competitive coding problems with input/output examples and strict time/space complexity constraints.'
            : 'You are a principal systems architect conducting a technical system design interview. You generate structured scenarios evaluating scalability, reliability, and architectural trade-offs.',
          messages: [{ role: 'user', content: generationPrompt }],
          model: GENERATION_MODEL,
          responseFormat: { type: 'json_object' },
        })

        const cleaned = (raw || '').replace(/```json/gi, '').replace(/```/g, '').trim()
        const match = cleaned.match(/\{[\s\S]*\}/)?.[0] || cleaned
        const parsed = JSON.parse(match || '{}')
        questionsList = Array.isArray(parsed) ? parsed : (parsed.questions || [])
      } catch (genErr) {
        console.warn('[Interview Chat] Question generation error, using curated questions:', genErr)
      }

      // High-quality fallback if generation returned empty
      if (!Array.isArray(questionsList) || questionsList.length === 0) {
        const fallbackTopic = topic || 'Algorithms & Data Structures'
        if (isBehavioral) {
          questionsList = [
            {
              id: 'q1',
              text: `Tell me about a high-impact technical project you led as a ${fallbackTopic}. What was the primary challenge, how did you drive execution, and what was the outcome?`,
              type: 'behavioral',
              topic: 'Project Leadership & Ownership',
              difficulty,
              requiresCode: false,
            },
            {
              id: 'q2',
              text: `Describe a severe production incident or outage you encountered. How did you coordinate with stakeholders, triage the issue, and ensure it wouldn't happen again?`,
              type: 'behavioral',
              topic: 'Incident Management & Triage',
              difficulty,
              requiresCode: false,
            },
            {
              id: 'q3',
              text: `Tell me about a time you strongly disagreed with a product decision or an architectural proposal from a peer. How did you handle the discussion and reach alignment?`,
              type: 'behavioral',
              topic: 'Constructive Disagreement & Collaboration',
              difficulty,
              requiresCode: false,
            },
            {
              id: 'q4',
              text: `Describe a situation where you had to balance technical debt with tight delivery deadlines. What trade-offs did you make, and how did you communicate them to management?`,
              type: 'behavioral',
              topic: 'Prioritization & Tech Debt',
              difficulty,
              requiresCode: false,
            },
            {
              id: 'q5',
              text: `Tell me about a mistake you made or an assumption that turned out to be wrong in a critical system. What did you learn, and how did it change your engineering practices?`,
              type: 'behavioral',
              topic: 'Continuous Learning & Resilience',
              difficulty,
              requiresCode: false,
            },
          ]
        } else if (isTechnicalDSA) {
          questionsList = [
            {
              id: 'q1',
              text: `Given an integer array nums and an integer target, write a function that returns indices of the two numbers such that they add up to target. You may not use the same element twice. Provide an optimal O(N) time and O(N) space solution using a hash map, and discuss how you handle duplicate values and negative integers.\n\nExample:\nInput: nums = [2, 7, 11, 15], target = 9\nOutput: [0, 1]`,
              type: 'technical',
              topic: 'Arrays & Hash Maps',
              difficulty,
              requiresCode: true,
            },
            {
              id: 'q2',
              text: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if brackets close in the correct order with matching types. Implement an optimal O(N) time and O(N) auxiliary space solution using a stack data structure.\n\nExample:\nInput: s = "()[]{}"\nOutput: true\nInput: s = "(]"\nOutput: false`,
              type: 'technical',
              topic: 'Stacks & String Parsing',
              difficulty,
              requiresCode: true,
            },
            {
              id: 'q3',
              text: `Design and implement a data structure for a Least Recently Used (LRU) Cache. It should support:\n- get(key): Return the value of the key if it exists, otherwise return -1.\n- put(key, value): Update the value if key exists, or insert key-value pair. When capacity is exceeded, evict the least recently used key.\nBoth operations must run in O(1) average time complexity. Implement this using a doubly linked list combined with a hash map.`,
              type: 'technical',
              topic: 'Doubly Linked Lists & Hash Maps',
              difficulty,
              requiresCode: true,
            },
            {
              id: 'q4',
              text: `Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level). What is the time and space complexity of BFS using a queue versus DFS with recursion? Account for skewed trees and null root edge cases.\n\nExample:\nInput: root = [3, 9, 20, null, null, 15, 7]\nOutput: [[3], [9, 20], [15, 7]]`,
              type: 'technical',
              topic: 'Binary Trees & BFS',
              difficulty,
              requiresCode: true,
            },
            {
              id: 'q5',
              text: `Given a string s, find the length of the longest substring without repeating characters. Implement an optimal O(N) time and O(min(N, M)) space solution using the sliding window technique with two pointers. Walk through how your window expands and shrinks when duplicates are encountered.\n\nExample:\nInput: s = "abcabcbb"\nOutput: 3 (substring "abc")`,
              type: 'technical',
              topic: 'Sliding Window & Two Pointers',
              difficulty,
              requiresCode: true,
            },
          ]
        } else {
          questionsList = [
            {
              id: 'q1',
              text: `Design a high-throughput, low-latency URL shortening service (like Bitly) handling 500M new URLs per month with a 10:1 read/write ratio. Walk through your API contract, unique token generation scheme (Base62 vs KGS), database schema, caching strategy, and collision handling.`,
              type: interviewType,
              topic: 'Distributed Systems & URL Shortener',
              difficulty,
              requiresCode: false,
            },
            {
              id: 'q2',
              text: `Design a distributed rate limiter that can be deployed across multiple availability zones to throttle incoming API requests per user/IP. Compare token bucket, leaky bucket, and sliding window log algorithms in Redis, and discuss race condition prevention under concurrency.`,
              type: interviewType,
              topic: 'Rate Limiting & Concurrency',
              difficulty,
              requiresCode: false,
            },
            {
              id: 'q3',
              text: `How would you architect a distributed caching layer to prevent cache stampedes (thundering herd) and cache penetration during peak flash sale traffic? Explain the trade-offs of early probabilistic expiration (XFetch) vs distributed locking.`,
              type: interviewType,
              topic: 'Caching & Stampede Mitigation',
              difficulty,
              requiresCode: false,
            },
            {
              id: 'q4',
              text: `Design a resilient notification delivery system (SMS, Email, Push) that guarantees at-least-once delivery, respects user preferences, handles provider throttling, and deduplicates retry payloads.`,
              type: interviewType,
              topic: 'Message Queues & Event-Driven Architecture',
              difficulty,
              requiresCode: false,
            },
            {
              id: 'q5',
              text: `Describe a database sharding and replication strategy for a social feed system. How do you handle cross-shard queries, re-sharding when traffic surges, and eventual consistency lag across read replicas?`,
              type: interviewType,
              topic: 'Database Sharding & Replication',
              difficulty,
              requiresCode: false,
            },
          ]
        }
      }

      return NextResponse.json({ questions: questionsList, mode: 'generate' })
    }

    if (mode === 'evaluate') {
      const { language = 'javascript' } = body
      const combinedAnswer = (textAnswer || '') + (codeAnswer ? `\n${codeAnswer}` : '')
      const cleaned = combinedAnswer.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
      const isSkipped = !combinedAnswer.trim() || cleaned.length <= 2 || ['na', 'none', 'idk', 'skip', 'pass', 'nil', 'null'].includes(cleaned)

      if (isSkipped) {
        return NextResponse.json({
          evaluation: {
            score: 0,
            feedback: "No substantive answer or solution provided. In a technical interview, submitting 'NA' or skipping automatically results in a score of 0.",
            improvement: "Always state your initial assumptions, walk through a brute-force approach, or ask clarifying questions rather than skipping.",
            technicalAccuracy: "Unanswered.",
            topic: question?.topic || 'General',
          },
          mode: 'evaluate',
        })
      }

      const evalPrompt = `Question: ${question?.text || ''}
Topic: ${question?.topic || question?.topicTag || 'General'}
Difficulty: ${question?.difficulty || difficulty}
AnswerType: ${answerType || 'text'}
Language: ${language}
TextAnswer: ${textAnswer}
CodeAnswer:\n${codeAnswer}

STRICT SCORING RULES:
- 0: Unanswered, "NA", "skip", or irrelevant.
- 1-25: Fundamentally incorrect with major misconceptions.
- 26-50: Poor understanding or critical omissions.
- 51-69: Partially correct but suboptimal.
- 70-84: Good passing solution.
- 85-100: Senior/Staff level mastery with optimal time/space complexity and edge cases.

Return ONLY valid JSON:
{
  "score": number (0 to 100),
  "feedback": "Concise feedback on answer strengths and gaps",
  "improvement": "Actionable ways to improve",
  "technicalAccuracy": "Accuracy evaluation",
  "topic": "Topic tested"
}`

      const raw = await createChatCompletion({
        system: 'You are a strict technical interviewer evaluating candidate answers with rigorous grading standards.',
        messages: [{ role: 'user', content: evalPrompt }],
        model: EVALUATION_MODEL,
        responseFormat: { type: 'json_object' },
      })

      let parsed: any = {}
      try {
        parsed = JSON.parse(raw)
      } catch {
        const match = raw.match(/\{[\s\S]*\}/)?.[0]
        if (match) parsed = JSON.parse(match)
      }

      const parsedScore = Number(parsed?.score)
      const finalScore = Math.max(0, Math.min(100, !isNaN(parsedScore) ? parsedScore : (isSkipped ? 0 : 30)))

      return NextResponse.json({
        evaluation: {
          ...parsed,
          score: finalScore,
          feedback: parsed.feedback || (finalScore === 0 ? 'No substantive answer provided.' : 'Answer evaluated with gaps.'),
          improvement: parsed.improvement || '',
        },
        mode: 'evaluate',
      })
    }

    if (mode === 'report') {
      const reportPrompt = `Resume context:\n${resumeContext || 'none'}\n\nSession:\n${JSON.stringify(sessionHistory)}\n\nReturn valid JSON:
{
  "overallScore": number (0-100),
  "strongTopics": [{ "topic": string, "reason": string }],
  "weakTopics": [{ "topic": string, "reason": string }],
  "improvementPlan": [{ "topic": string, "action": string, "resources": string }],
  "summary": string
}`

      const raw = await createChatCompletion({
        system: 'Generate an interview performance report in valid JSON only.',
        messages: [{ role: 'user', content: reportPrompt }],
        model: GENERATION_MODEL,
        responseFormat: { type: 'json_object' },
      })

      let parsed = {}
      try {
        parsed = JSON.parse(raw)
      } catch {
        const match = raw.match(/\{[\s\S]*\}/)?.[0]
        if (match) parsed = JSON.parse(match)
      }

      return NextResponse.json({ report: parsed, mode: 'report' })
    }

    if (mode === 'chat') {
      const chatMessages: ChatMessage[] = Array.isArray(messages) ? messages : []
      const formattedMessages = chatMessages.map((m) => ({
        role: (m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
        content: m.content,
      }))

      const content = await createChatCompletion({
        system: `You are Alex, a supportive and insightful interview coach. Keep responses short, practical, and encouraging. Resume context: ${resumeContext || 'none'}`,
        messages: formattedMessages.length > 0 ? formattedMessages : [{ role: 'user', content: 'Hello' }],
        model: GENERATION_MODEL,
      })

      return NextResponse.json({ content: content || 'I am here to help you practice!', mode: 'chat' })
    }

    // Default conversational interview stream or response
    const content = await createChatCompletion({
      system: `You are a technical interviewer. Resume context: ${resumeContext || 'none'}`,
      messages: Array.isArray(messages) && messages.length > 0
        ? messages.map((m: ChatMessage) => ({
          role: (m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
          content: m.content,
        }))
        : [{ role: 'user' as const, content: 'Hello' }],
      model: GENERATION_MODEL,
    })

    return NextResponse.json({ content, mode: 'interview' })
  } catch (err: any) {
    console.error('[api/interview/chat] Error:', err)
    return NextResponse.json(
      { error: 'Interview AI request failed', detail: err?.message },
      { status: 500 }
    )
  }
}
