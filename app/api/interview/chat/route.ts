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
      targetRole,
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
      const effectiveRole = targetRole || topic || 'Software Engineer'
      const topicFocus = topic ? `focused specifically on "${topic}"` : ''

      const isFrontend =
        effectiveRole.toLowerCase().includes('front') ||
        effectiveRole.toLowerCase().includes('react') ||
        effectiveRole.toLowerCase().includes('web') ||
        (topic && (topic.toLowerCase().includes('react') || topic.toLowerCase().includes('front') || topic.toLowerCase().includes('javascript') || topic.toLowerCase().includes('css')));

      const isBackend =
        effectiveRole.toLowerCase().includes('back') ||
        effectiveRole.toLowerCase().includes('node') ||
        effectiveRole.toLowerCase().includes('go') ||
        effectiveRole.toLowerCase().includes('python') ||
        effectiveRole.toLowerCase().includes('java') ||
        effectiveRole.toLowerCase().includes('api') ||
        (topic && (topic.toLowerCase().includes('node') || topic.toLowerCase().includes('database') || topic.toLowerCase().includes('sql')));

      let generationPrompt = prompt
      if (!generationPrompt) {
        if (isBehavioral) {
          generationPrompt = `Generate 5 behavioral interview questions for a candidate targeting role: "${effectiveRole}" at ${difficulty} difficulty level. Resume background context: ${resumeContext || effectiveRole}.
CRITICAL REQUIREMENTS FOR BEHAVIORAL TRACK:
- Every question must be a situational scenario evaluating real-world ownership, leadership, technical disagreements, incident triage, and communication.
- Do NOT ask candidate to "explain fundamental principles of...". Treat "${effectiveRole}" as the candidate's professional career track.
- Questions should encourage structured answers (Situation, Task, Action, Result).
Return ONLY a valid JSON object with key "questions" containing an array of 5 objects:
{
  "questions": [
    {
      "id": "q1",
      "text": "Behavioral question prompt?",
      "type": "behavioral",
      "topic": "Leadership / Ownership / Incident Response",
      "difficulty": "${difficulty}",
      "requiresCode": false
    }
  ]
}`
        } else if (isTechnicalDSA) {
          generationPrompt = `Generate 5 hands-on technical coding interview challenges at ${difficulty} difficulty level for a candidate targeting role: "${effectiveRole}". Resume background: ${resumeContext || effectiveRole}. ${topicFocus ? `Focus area: ${topicFocus}.` : ''}
CRITICAL REQUIREMENTS FOR CODING INTERVIEW:
- Calibrate the coding problems directly to the candidate's chosen track "${effectiveRole}":
${isFrontend
  ? `  * CANDIDATE TRACK IS FRONTEND/WEB: Generate practical frontend & JavaScript/TypeScript programming challenges (e.g., custom debounce/throttle with cancellation, asynchronous promise pool with concurrency limit, virtualized list windowing computation, reactive event emitter, deep object clone with cycle handling, or DOM hierarchy operations).`
  : isBackend
  ? `  * CANDIDATE TRACK IS BACKEND: Generate practical backend algorithmic & concurrency problems (e.g., concurrent LRU cache with TTL eviction, token bucket rate limiter, trie for search autocomplete, query optimization / indexing simulation, or idempotent worker queue with retry backoff).`
  : `  * CANDIDATE TRACK IS SOFTWARE ENGINEERING: Generate concrete algorithmic challenges (e.g. Arrays/HashMaps, Sliding Window, Trees/Graphs, Dynamic Programming, Two Pointers, Heaps) with optimal time/space complexity.`}
- Every question MUST require writing executable code ("requiresCode": true). Do NOT ask essay or theoretical questions.
- Each question MUST include:
  1. Clear problem statement and expected function signature.
  2. Input / Output examples with expected return values.
  3. Explicit Time and Space complexity requirements (e.g. "O(N) time, O(1) auxiliary space").
  4. Notable edge cases to account for (empty inputs, negatives, boundary limits, duplicates).
Return ONLY a valid JSON object with key "questions" containing an array of 5 objects:
{
  "questions": [
    {
      "id": "q1",
      "text": "Clear problem description with function signature, input/output examples, and complexity bounds...",
      "type": "technical",
      "topic": "${topic || effectiveRole}",
      "difficulty": "${difficulty}",
      "requiresCode": true
    }
  ]
}`
        } else {
          generationPrompt = `Generate 5 real-world distributed system design interview scenarios ${topicFocus} for a "${effectiveRole}" interview at ${difficulty} difficulty level. Resume background: ${resumeContext || effectiveRole}.
CRITICAL REQUIREMENTS FOR SYSTEM DESIGN:
- Focus on the initial high-level architectural challenge (e.g. Designing a high-throughput URL shortener, distributed rate limiter, real-time telemetry pipeline, or notification delivery pipeline).
- PROGRESSIVE PROBING RULE: Do NOT dump huge multi-part questions asking for API contracts + database schema + caching + collision handling + scale all at once. State the high-level system goal and scale requirement clearly so the candidate can provide their foundational architecture before follow-up probing.
Return ONLY a valid JSON object with key "questions" containing an array of 5 objects:
{
  "questions": [
    {
      "id": "q1",
      "text": "Clear initial architectural scenario prompt...",
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
            ? `You are an engineering director conducting a behavioral interview for a ${effectiveRole} candidate. Assess communication, ownership, and engineering maturity.`
            : isTechnicalDSA
            ? `You are a principal staff engineer conducting a technical coding interview for a ${effectiveRole} candidate. Create rigorous, hands-on programming problems tailored specifically to this domain.`
            : `You are a principal systems architect conducting a system design interview for a ${effectiveRole} candidate. Formulate realistic high-scale architectural scenarios.`,
          messages: [{ role: 'user', content: generationPrompt }],
          model: GENERATION_MODEL,
          responseFormat: { type: 'json_object' },
        })

        const cleaned = (raw || '').replace(/```json/gi, '').replace(/```/g, '').trim()
        const match = cleaned.match(/\{[\s\S]*\}/)?.[0] || cleaned
        const parsed = JSON.parse(match || '{}')
        questionsList = Array.isArray(parsed) ? parsed : (parsed.questions || [])
        console.log(`[Interview Chat] Live generation succeeded with ${questionsList.length} questions for role "${effectiveRole}"`)
      } catch (genErr) {
        console.warn('[Interview Chat] Question generation error, using curated track fallback:', genErr)
      }

      // Dynamic role-calibrated fallback if generation returned empty
      if (!Array.isArray(questionsList) || questionsList.length === 0) {
        const fallbackTopic = topic || effectiveRole
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
              text: `Describe a severe production incident or outage you encountered in a ${fallbackTopic} system. How did you triage the issue under pressure, coordinate with stakeholders, and ensure prevention?`,
              type: 'behavioral',
              topic: 'Incident Management & Triage',
              difficulty,
              requiresCode: false,
            },
            {
              id: 'q3',
              text: `Tell me about a time you strongly disagreed with an architectural proposal or roadmap priority from a peer or tech lead. How did you handle the debate and reach alignment?`,
              type: 'behavioral',
              topic: 'Constructive Disagreement & Collaboration',
              difficulty,
              requiresCode: false,
            },
            {
              id: 'q4',
              text: `Describe a situation where you had to balance heavy technical debt with tight release deadlines. What trade-offs did you negotiate, and how did you communicate them to management?`,
              type: 'behavioral',
              topic: 'Prioritization & Tech Debt',
              difficulty,
              requiresCode: false,
            },
            {
              id: 'q5',
              text: `Tell me about an architectural mistake you made or an assumption that proved incorrect in a production system. What was the post-mortem, and how did it change your engineering practices?`,
              type: 'behavioral',
              topic: 'Continuous Learning & Resilience',
              difficulty,
              requiresCode: false,
            },
          ]
        } else if (isTechnicalDSA) {
          if (isFrontend) {
            questionsList = [
              {
                id: 'q1',
                text: `Implement a robust \`debounce\` function in TypeScript/JavaScript that supports leading edge execution (\`immediate: boolean\`) and a \`.cancel()\` method to abort pending calls.\n\nExample:\nconst debouncedFn = debounce(fn, 300, { immediate: false });\ndebouncedFn('data'); // Executes after 300ms inactivity\ndebouncedFn.cancel(); // Aborts timer immediately`,
                type: 'technical',
                topic: 'Async Utilities & Timers',
                difficulty,
                requiresCode: true,
              },
              {
                id: 'q2',
                text: `Implement an asynchronous concurrency limiter (\`asyncPool\` / \`pLimit\`) that takes an array of tasks and a maximum concurrency number \`limit\`. It must execute tasks in parallel without exceeding \`limit\` active promises at any moment, and return results in original order.\n\nFunction Signature:\nasync function asyncPool<T>(limit: number, tasks: (() => Promise<T>)[]): Promise<T[]>`,
                type: 'technical',
                topic: 'Promise Concurrency & Async Pools',
                difficulty,
                requiresCode: true,
              },
              {
                id: 'q3',
                text: `Implement a deep clone utility (\`deepClone\`) that handles nested objects and arrays, preserves Date and RegExp instances, and detects circular references without causing stack overflow errors.\n\nFunction Signature:\nfunction deepClone<T>(value: T, seen = new WeakMap()): T`,
                type: 'technical',
                topic: 'Object Traversal & Memory Safety',
                difficulty,
                requiresCode: true,
              },
              {
                id: 'q4',
                text: `Given a list of 10,000 items with fixed row height \`itemHeight\`, viewport height \`viewportHeight\`, and scroll position \`scrollTop\`, write a calculation function for a virtual list that returns the \`startIndex\`, \`endIndex\`, \`offsetY\`, and total container height, incorporating a 2-item buffer.\n\nFunction Signature:\nfunction computeVirtualWindow(totalCount: number, itemHeight: number, viewportHeight: number, scrollTop: number): { startIndex: number; endIndex: number; offsetY: number; totalHeight: number }`,
                type: 'technical',
                topic: 'DOM Virtualization & Rendering Performance',
                difficulty,
                requiresCode: true,
              },
              {
                id: 'q5',
                text: `Implement a typed \`EventEmitter\` class supporting \`.on(event, listener)\`, \`.off(event, listener)\`, \`.emit(event, ...args)\`, and \`.once(event, listener)\`. Ensure listeners can safely unsubscribe themselves during emission without index corruption.`,
                type: 'technical',
                topic: 'Event-Driven Architecture & PubSub',
                difficulty,
                requiresCode: true,
              },
            ]
          } else if (isBackend) {
            questionsList = [
              {
                id: 'q1',
                text: `Design and implement a Least Recently Used (LRU) Cache that supports item expiration TTL in milliseconds. Operations \`get(key)\` and \`put(key, value, ttlMs)\` must run in O(1) average time complexity. Expired keys must not be returned and should be evicted.\n\nMethods:\n- get(key): value or -1\n- put(key, value, ttlMs?): void`,
                type: 'technical',
                topic: 'LRU Cache & Expiration TTL',
                difficulty,
                requiresCode: true,
              },
              {
                id: 'q2',
                text: `Implement a Token Bucket rate limiter class in memory. The bucket has \`capacity\` and refills at \`refillRate\` tokens per second. Implement \`allowRequest(tokensRequired: number): boolean\` accounting for continuous fractional time elapsed without background timer drift.`,
                type: 'technical',
                topic: 'Rate Limiting Algorithms',
                difficulty,
                requiresCode: true,
              },
              {
                id: 'q3',
                text: `Implement a Trie (Prefix Tree) supporting \`insert(word)\`, \`search(word)\`, and \`startsWith(prefix)\`. Additionally, write a method \`findTopKWithPrefix(prefix: string, k: number): string[]\` that returns up to k lexicographically smallest words with that prefix.`,
                type: 'technical',
                topic: 'Prefix Trees & Autocomplete',
                difficulty,
                requiresCode: true,
              },
              {
                id: 'q4',
                text: `Given an array of server response times and a sliding time window in seconds, implement a rolling percentile calculator (P50, P95, P99) that efficiently adds new timestamped samples and evicts samples outside the active window.`,
                type: 'technical',
                topic: 'Sliding Window Telemetry & Quantiles',
                difficulty,
                requiresCode: true,
              },
              {
                id: 'q5',
                text: `Implement an idempotent task queue with exponential backoff and jitter. Tasks have a unique \`id\`, maximum retry count, and backoff multiplier. Ensure duplicate task submissions with identical \`id\` within a deduplication window are ignored.`,
                type: 'technical',
                topic: 'Idempotency & Retry Queues',
                difficulty,
                requiresCode: true,
              },
            ]
          } else {
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
          }
        } else {
          questionsList = [
            {
              id: 'q1',
              text: `Design a high-throughput, low-latency URL shortening service (like Bitly) handling 500M new URLs per month. How would you approach the high-level architecture and data flow?`,
              type: interviewType,
              topic: 'Distributed Systems & URL Shortener',
              difficulty,
              requiresCode: false,
            },
            {
              id: 'q2',
              text: `Design a distributed rate limiter that can be deployed across multiple availability zones to throttle incoming API requests per user/IP. What core architecture and algorithms would you choose?`,
              type: interviewType,
              topic: 'Rate Limiting & Concurrency',
              difficulty,
              requiresCode: false,
            },
            {
              id: 'q3',
              text: `How would you architect a distributed caching layer to prevent cache stampedes (thundering herd) and cache penetration during peak flash traffic?`,
              type: interviewType,
              topic: 'Caching & Stampede Mitigation',
              difficulty,
              requiresCode: false,
            },
            {
              id: 'q4',
              text: `Design a resilient notification delivery system (SMS, Email, Push) that guarantees at-least-once delivery and handles provider throttling. How would you structure the event pipeline?`,
              type: interviewType,
              topic: 'Message Queues & Event-Driven Architecture',
              difficulty,
              requiresCode: false,
            },
            {
              id: 'q5',
              text: `Describe a database sharding and replication strategy for a high-scale social feed system. How do you approach partition keys and eventual consistency across replicas?`,
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

    if (mode === 'probe' || mode === 'followup') {
      const { question: activeQ, textAnswer: candidateAnswer = '', difficulty: diff = 'medium', targetRole: roleTitle } = body
      const effectiveCandidateRole = roleTitle || 'Software Engineer'

      const probePrompt = `You are an intelligent, conversational technical interviewer conducting a mock interview with a ${effectiveCandidateRole} candidate at ${diff} seniority.
The candidate was presented with this initial problem:
"${activeQ?.text || 'Technical scenario'}"

The candidate provided this response:
"${candidateAnswer || '(Brief initial approach)'}"

INSTRUCTIONS FOR CONTEXTUAL PROBING:
1. Progressively probe based on their response:
   - If they gave a strong answer: ask a deeper follow-up probe (e.g. unique ID generation collisions, caching stampedes, high-concurrency race conditions, or scaling limits).
   - If they gave an incomplete or high-level answer: ask a clarifying probe to specify their data model, algorithm, or component interaction.
   - If they made an incorrect assumption: ask a gentle prompt testing an edge case or failure scenario.
2. Keep the probe direct, conversational, and natural (1-2 sentences maximum).
3. Do NOT provide the answer or solution.
4. Return ONLY a valid JSON object:
{
  "acknowledgment": "Short conversational phrase acknowledging their point (e.g. 'Good foundation on the service layout.', 'Understood.', 'Solid high-level design.') max 8 words.",
  "probe": "The follow-up probing question."
}`

      try {
        const raw = await createChatCompletion({
          system: 'You are an insightful, conversational technical interviewer.',
          messages: [{ role: 'user', content: probePrompt }],
          model: GENERATION_MODEL,
          responseFormat: { type: 'json_object' },
          maxTokens: 200,
        })

        const cleaned = (raw || '').replace(/```json/gi, '').replace(/```/g, '').trim()
        const match = cleaned.match(/\{[\s\S]*\}/)?.[0] || cleaned
        const parsed = JSON.parse(match || '{}')

        return NextResponse.json({
          probe: parsed.probe || 'How would your architecture scale to handle sudden 10x traffic spikes or failover?',
          acknowledgment: parsed.acknowledgment || 'Got it.',
          mode: 'probe',
        })
      } catch (err) {
        console.warn('[Interview Chat] Probe generation fallback:', err)
        return NextResponse.json({
          probe: 'How would your architecture handle high-concurrency race conditions or cache stampedes during peak load?',
          acknowledgment: 'Good approach.',
          mode: 'probe',
        })
      }
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
