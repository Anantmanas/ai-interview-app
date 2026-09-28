import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createChatCompletion, streamChatCompletion, EVALUATION_MODEL } from '@/lib/ai/client'
import { updateWeaknessScores } from '@/lib/ai/weakness-tracker'
import { checkRateLimit } from '@/lib/middleware/rate-limit'

function isNonAnswer(text?: string | null): boolean {
  if (!text) return true
  const trimmed = text.trim()
  if (trimmed.length === 0) return true
  const cleaned = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '')
  const nonAnswerKeywords = [
    '',
    'na',
    'none',
    'no',
    'idk',
    'dontknow',
    'donotknow',
    'skip',
    'pass',
    'noidea',
    'nothing',
    'nil',
    'null',
    'undefined',
    'blank',
    'asdf',
    'test',
    'nope',
    'notanswered',
    'noanswer',
    'idontknow',
  ]
  if (cleaned.length <= 2) return true
  if (nonAnswerKeywords.includes(cleaned)) return true
  if (trimmed.length < 5 && !/[0-9]/.test(trimmed)) return true
  return false
}

const EVALUATION_SYSTEM_PROMPT = `
You are a rigorous technical interviewer and engineering leader.
Evaluate the candidate's answer with precise, objective feedback.

SCORING CRITERIA:
- 0: Unanswered, "NA", "skip", gibberish, or irrelevant dismissal.
- 1-25: Fundamentally incorrect with major misconceptions.
- 26-50: Minimal understanding, poor complexity, or critical omissions.
- 51-69: Partially correct but suboptimal or missing key edge cases.
- 70-84: Good passing solution with sound reasoning and minor gaps.
- 85-100: Senior/Staff level mastery with optimal time/space complexity, clean architecture, and robust edge-case handling.
BE HONEST AND CRITICAL. NEVER give passing scores (70+) to low-effort, incomplete, or incorrect answers.

Always respond in valid JSON format only with the following keys:
{
  "score": number (0 to 100),
  "caveman_feedback": "Ultra-short, punchy summary (10-15 words max). Format: 'Good: [points]. Bad: [gap]. Fix: [action]'",
  "feedback": "Concise analysis of what was good and what was missing",
  "technicalAccuracy": "Assessment of technical correctness and depth",
  "improvements": "Specific actionable points to improve this answer",
  "topic": "The core topic or skill tested"
}
`

async function upsertQuestionRecord(interviewId: string, sequenceOrder: number, data: any) {
  const { data: existing } = await supabaseAdmin
    .from('interview_questions')
    .select('id')
    .eq('interview_id', interviewId)
    .eq('sequence_order', sequenceOrder)
    .maybeSingle()

  if (existing) {
    const { data: updated, error } = await supabaseAdmin
      .from('interview_questions')
      .update(data)
      .eq('id', existing.id)
      .select()
      .single()
    if (error) console.error('[upsertQuestionRecord update error]:', error)
    return updated
  } else {
    const { data: inserted, error } = await supabaseAdmin
      .from('interview_questions')
      .insert({
        interview_id: interviewId,
        sequence_order: sequenceOrder,
        ...data,
      })
      .select()
      .single()
    if (error) console.error('[upsertQuestionRecord insert error]:', error)
    return inserted
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    const body = await req.json().catch(() => ({}))

    // 1. Fetch interview to verify ownership
    const { data: interview, error: interviewErr } = await supabaseAdmin
      .from('interviews')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (interviewErr || !interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 })
    }

    // Check if this is a single question evaluation call from interview room
    const isSingleQuestion = !!body.currentQuestion || (!!body.question && !body.finalize)

    if (isSingleQuestion) {
      const q = body.currentQuestion || body.question
      const questionText = q?.text || q?.question_text || ''
      const questionType = q?.type || q?.question_type || interview.type || 'technical'
      const topic = q?.topic || q?.topicTag || 'General'
      const difficulty = q?.difficulty || interview.difficulty || 'medium'
      const userAnswer = body.userAnswer || body.textAnswer || (body.codeAnswer ? `Code Answer:\n${body.codeAnswer}` : '') || ''
      const elapsedSeconds = Number(body.elapsedSeconds || body.time_taken_seconds || 0)
      const sequenceOrder = Number(body.sequence_order ?? body.sequenceOrder ?? body.questionIndex ?? 0)

      const userContent = `
Question: ${questionText}
Type: ${questionType}
Topic: ${topic}
Difficulty: ${difficulty}
Candidate Answer: ${userAnswer || '(No answer provided)'}
`

      // Strict validation: Non-answer / "NA" / empty detection -> Immediate 0 score
      if (isNonAnswer(userAnswer)) {
        const nonAnswerResult = {
          score: 0,
          caveman_feedback: 'Bad: No solution provided. Score: 0%. Fix: Attempt solution or explain thought process.',
          feedback: "No substantive answer or technical reasoning was provided for this question. In an interview, submitting 'NA', skipping, or giving non-answers yields 0 points.",
          technicalAccuracy: 'Unanswered / Zero technical concepts demonstrated.',
          improvements: 'Always attempt the problem. Even if unsure, clarify requirements, state edge cases, or write a naive brute-force solution. An interviewer can only score what you communicate.',
          topic,
        }

        await upsertQuestionRecord(id, sequenceOrder, {
          question_text: questionText,
          question_type: questionType,
          topic,
          difficulty,
          user_answer: userAnswer || '(No answer provided)',
          ai_evaluation: nonAnswerResult,
          time_taken_seconds: elapsedSeconds,
        })

        try {
          await updateWeaknessScores(user.id, [
            {
              topic,
              score: 0,
              feedback: nonAnswerResult.feedback,
            },
          ])
        } catch {}

        if (body.stream) {
          const encoder = new TextEncoder()
          const stream = new ReadableStream({
            start(controller) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: nonAnswerResult.feedback })}\n\n`))
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, evaluation: nonAnswerResult })}\n\n`))
              controller.close()
            },
          })
          return new Response(stream, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          })
        }

        return NextResponse.json({ evaluation: nonAnswerResult, mode: 'evaluate' })
      }

      if (body.stream) {
        const encoder = new TextEncoder()
        const stream = new ReadableStream({
          async start(controller) {
            let accumulated = ''
            try {
              const tokenGenerator = streamChatCompletion({
                system: EVALUATION_SYSTEM_PROMPT,
                messages: [{ role: 'user', content: userContent }],
                model: EVALUATION_MODEL,
                maxTokens: 1000,
              })

              for await (const token of tokenGenerator) {
                accumulated += token
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: token })}\n\n`))
              }

              // Parse final evaluation payload
              let evalData: any = {}
              try {
                evalData = JSON.parse(accumulated)
              } catch {
                const match = accumulated.match(/\{[\s\S]*\}/)?.[0]
                if (match) {
                  try {
                    evalData = JSON.parse(match)
                  } catch {
                    evalData = {}
                  }
                }
              }

              // Extract parsed feedback safely, never leaking raw JSON into the text
              let cleanFeedback = evalData.feedback
              if (typeof cleanFeedback === 'object' && cleanFeedback !== null) {
                cleanFeedback = cleanFeedback.feedback || cleanFeedback.text || ''
              } else if (typeof cleanFeedback === 'string' && cleanFeedback.trim().startsWith('{')) {
                try {
                  const nested = JSON.parse(cleanFeedback)
                  cleanFeedback = nested.feedback || nested.caveman_feedback || ''
                } catch {}
              }
              if (!cleanFeedback || cleanFeedback.includes('{"score":')) {
                cleanFeedback = isNonAnswer(userAnswer)
                  ? 'Candidate submitted an empty or skipped response. Practice attempting all questions.'
                  : 'Answer recorded and evaluated against technical requirements.'
              }

              const parsedScore = Number(evalData?.score)
              const score = Math.max(0, Math.min(100, !isNaN(parsedScore) ? parsedScore : (isNonAnswer(userAnswer) ? 0 : 35)))
              const evaluationResult = {
                score,
                caveman_feedback: evalData.caveman_feedback || (score === 0 ? 'Bad: no solution. Score: 0%.' : `Score: ${score}%. Fix: elaborate on edge cases.`),
                feedback: cleanFeedback,
                technicalAccuracy: evalData.technicalAccuracy || evalData.technical_accuracy || '',
                improvements: evalData.improvements || evalData.improvement || '',
                topic: evalData.topic || topic,
              }

              // Persist to database via upsert
              await upsertQuestionRecord(id, sequenceOrder, {
                question_text: questionText,
                question_type: questionType,
                topic: evaluationResult.topic,
                difficulty,
                user_answer: userAnswer,
                ai_evaluation: evaluationResult,
                time_taken_seconds: elapsedSeconds,
              })

              try {
                await updateWeaknessScores(user.id, [
                  {
                    topic: evaluationResult.topic,
                    score: evaluationResult.score,
                    feedback: evaluationResult.feedback,
                  },
                ])
              } catch {}

              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, evaluation: evaluationResult })}\n\n`))
              controller.close()
            } catch (err: any) {
              console.error('[evaluate streaming] Error:', err)
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err.message })}\n\n`))
              controller.close()
            }
          },
        })

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        })
      }

      const rawContent = await createChatCompletion({
        system: EVALUATION_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userContent }],
        model: EVALUATION_MODEL,
        responseFormat: { type: 'json_object' },
      })
      let evalData: any = {}
      try {
        evalData = JSON.parse(rawContent)
      } catch {
        const match = rawContent.match(/\{[\s\S]*\}/)?.[0]
        if (match) {
          try {
            evalData = JSON.parse(match)
          } catch {
            evalData = {}
          }
        }
      }

      // Extract parsed feedback safely, never leaking raw JSON into the text
      let cleanFeedback = evalData.feedback
      if (typeof cleanFeedback === 'object' && cleanFeedback !== null) {
        cleanFeedback = cleanFeedback.feedback || cleanFeedback.text || ''
      } else if (typeof cleanFeedback === 'string' && cleanFeedback.trim().startsWith('{')) {
        try {
          const nested = JSON.parse(cleanFeedback)
          cleanFeedback = nested.feedback || nested.caveman_feedback || ''
        } catch {}
      }
      if (!cleanFeedback || cleanFeedback.includes('{"score":')) {
        cleanFeedback = isNonAnswer(userAnswer)
          ? 'Candidate submitted an empty or skipped response. Practice attempting all questions.'
          : 'Answer recorded and evaluated against technical requirements.'
      }

      const parsedScore = Number(evalData?.score)
      const score = Math.max(0, Math.min(100, !isNaN(parsedScore) ? parsedScore : (isNonAnswer(userAnswer) ? 0 : 35)))
      const evaluationResult = {
        score,
        caveman_feedback: evalData.caveman_feedback || (score === 0 ? 'Bad: no solution. Score: 0%.' : `Score: ${score}%. Fix: elaborate on edge cases.`),
        feedback: cleanFeedback,
        technicalAccuracy: evalData.technicalAccuracy || evalData.technical_accuracy || '',
        improvements: evalData.improvements || evalData.improvement || '',
        topic: evalData.topic || topic,
      }

      // Persist to interview_questions table via upsert
      const savedQuestion = await upsertQuestionRecord(id, sequenceOrder, {
        question_text: questionText,
        question_type: questionType,
        topic: evaluationResult.topic,
        difficulty,
        user_answer: userAnswer,
        ai_evaluation: evaluationResult,
        time_taken_seconds: elapsedSeconds,
      })

      // Update weakness scores immediately
      await updateWeaknessScores(user.id, [
        {
          topic: evaluationResult.topic,
          score: evaluationResult.score,
          feedback: evaluationResult.feedback,
        },
      ])

      return NextResponse.json({
        success: true,
        evaluation: evaluationResult,
        question: savedQuestion,
      })
    }

    // =========================================================================
    // FULL SESSION FINAL EVALUATION & WEAKNESS SYNTHESIS
    // =========================================================================

    // If client supplied questions from client state, ensure they are stored
    if (Array.isArray(body.questions) && body.questions.length > 0) {
      for (let i = 0; i < body.questions.length; i++) {
        const q = body.questions[i]
        const order = q.sequence_order !== undefined ? q.sequence_order : i
        await upsertQuestionRecord(id, order, {
          question_text: q.text || q.question_text || '',
          question_type: q.type || q.question_type || interview.type || 'technical',
          topic: q.topic || q.topicTag || 'General',
          difficulty: q.difficulty || interview.difficulty || 'medium',
        })
      }
    }

    // Retrieve all recorded questions for this interview
    const { data: existingQuestions } = await supabaseAdmin
      .from('interview_questions')
      .select('*')
      .eq('interview_id', id)
      .order('sequence_order', { ascending: true })

    let allQuestions = existingQuestions || []

    // If still no questions in DB, check if title or body hints at topic
    if (allQuestions.length === 0) {
      const topicFromTitle = interview.title?.replace('Targeted: ', '').split('—')[0].split('[')[0].trim() || 'Software Engineer'
      const isBehavioral = interview.type === 'behavioral'
      const defaultQuestions = isBehavioral
        ? [
            {
              text: `Tell me about a high-impact technical project you led as a ${topicFromTitle}. What was the primary challenge, how did you drive execution, and what was the outcome?`,
              topic: 'Project Leadership & Ownership',
            },
            {
              text: `Describe a severe production incident or outage you encountered. How did you coordinate with stakeholders, triage the issue, and ensure it wouldn't happen again?`,
              topic: 'Incident Management & Triage',
            },
            {
              text: `Tell me about a time you strongly disagreed with a product decision or architectural proposal. How did you handle the discussion and reach alignment?`,
              topic: 'Constructive Disagreement & Collaboration',
            },
          ]
        : [
            {
              text: `Explain the fundamental principles of ${topicFromTitle} and walk through how you would apply it in a high-scale production system.`,
              topic: topicFromTitle,
            },
            {
              text: `What are the most common performance bottlenecks or edge-case failures when working with ${topicFromTitle}?`,
              topic: topicFromTitle,
            },
            {
              text: `Compare and contrast alternative approaches or paradigms to ${topicFromTitle}. What are the trade-offs?`,
              topic: topicFromTitle,
            },
          ]

      for (let i = 0; i < defaultQuestions.length; i++) {
        const q = defaultQuestions[i]
        const inserted = await upsertQuestionRecord(id, i, {
          question_text: q.text,
          question_type: interview.type || (isBehavioral ? 'behavioral' : 'technical'),
          topic: q.topic,
          difficulty: interview.difficulty || 'medium',
          user_answer: '(No answer provided)',
          ai_evaluation: {
            score: 0,
            caveman_feedback: isBehavioral
              ? 'Bad: Unanswered scenario. Score: 0%. Fix: Deliver structured STAR response.'
              : 'Bad: Unanswered question. Score: 0%. Fix: Attempt solution.',
            feedback: isBehavioral
              ? `Candidate did not submit an evaluation for ${q.topic}. Behavioral interviews assess ownership and structured problem solving.`
              : `Candidate did not provide an answer for ${q.topic} in this session.`,
            technicalAccuracy: 'Unanswered.',
            improvements: isBehavioral
              ? 'Use the STAR format (Situation, Task, Action, Result) detailing measurable impact.'
              : 'Answer all technical questions to demonstrate competency.',
            topic: q.topic,
          },
        })
        if (inserted) allQuestions.push(inserted)
      }
    }

    // Ensure all unattempted questions have an evaluation with score 0
    const weaknessRecordsToUpdate: any[] = []

    for (let i = 0; i < allQuestions.length; i++) {
      const q = allQuestions[i]
      if (!q.ai_evaluation || q.ai_evaluation.score === undefined) {
        const hasAnswer = (q.user_answer || '').trim().length > 0
        const isSkipped = !hasAnswer || isNonAnswer(q.user_answer)
        const unattemptedEval = {
          score: isSkipped ? 0 : 35,
          caveman_feedback: isSkipped ? 'Bad: Unanswered question. Score: 0%. Fix: Attempt solution.' : 'Score: 35%. Fix: Add technical depth.',
          feedback: isSkipped
            ? 'Candidate did not complete or submit this question before finishing the interview.'
            : 'Candidate attempted this question with partial technical depth.',
          technicalAccuracy: isSkipped ? 'Unanswered.' : 'Partially attempted.',
          improvements: 'Work through technical problems systematically under timed pressure.',
          topic: q.topic || 'General',
        }

        await supabaseAdmin
          .from('interview_questions')
          .update({
            user_answer: q.user_answer || '(No answer provided)',
            ai_evaluation: unattemptedEval,
          })
          .eq('id', q.id)

        q.user_answer = q.user_answer || '(No answer provided)'
        q.ai_evaluation = unattemptedEval

        weaknessRecordsToUpdate.push({
          topic: q.topic || 'General',
          score: unattemptedEval.score,
          feedback: unattemptedEval.feedback,
        })
      } else {
        weaknessRecordsToUpdate.push({
          topic: q.topic || 'General',
          score: Number(q.ai_evaluation.score) || 0,
          feedback: q.ai_evaluation.feedback || '',
        })
      }
    }

    // Compute actual overall score from all questions
    const totalScore = allQuestions.reduce((sum, q) => sum + (Number(q.ai_evaluation?.score) || 0), 0)
    const computedOverallScore = allQuestions.length > 0 ? Math.round(totalScore / allQuestions.length) : 0

    // Construct Context for Strengths, Weaknesses and Overall Summary
    const interviewContext = `
Interview Title: ${interview.title}
Interview Type: ${interview.type}
Difficulty: ${interview.difficulty}
Computed Score: ${computedOverallScore}%

Questions & Evaluations:
${allQuestions.map((q, i) => `
Q${i + 1} [Topic: ${q.topic}]: ${q.question_text}
Candidate Answer: ${q.user_answer}
Score: ${q.ai_evaluation?.score}%
Feedback: ${q.ai_evaluation?.feedback}
`).join('\n')}
`

    const batchPrompt = `
You are a senior engineering manager conducting a technical debrief.
Analyze this candidate's performance across all questions.
Identify key strengths (skills where they demonstrated competence, score >= 65),
and key weaknesses (skills where they struggled, lacked depth, or failed to answer).

CRITICAL REQUIREMENT:
For weaknesses, provide the specific technical topic (e.g. "JavaScript Data Types", "System Design", "Dynamic Programming"),
a weakness score (0-100 where higher means weaker, e.g. score of 0 gives weakness 100), and constructive actionable feedback.

Return valid JSON with:
{
  "overall_score": ${computedOverallScore},
  "strengths": string[],
  "weaknesses": [
    {
      "topic": string,
      "subtopic": string,
      "score": number,
      "feedback": string
    }
  ],
  "summary": string
}
`

    let evaluation: any = null

    try {
      const rawEvaluation = await createChatCompletion({
        system: 'You are an expert technical interviewer and engineering career coach.',
        messages: [{ role: 'user', content: batchPrompt + '\n\n' + interviewContext }],
        model: EVALUATION_MODEL,
        responseFormat: { type: 'json_object' },
        maxTokens: 1200,
      })

      const cleaned = (rawEvaluation || '').replace(/```json/gi, '').replace(/```/g, '').trim()
      const match = cleaned.match(/\{[\s\S]*\}/)?.[0] || cleaned
      evaluation = JSON.parse(match || '{}')
    } catch (err) {
      console.warn('[Full Session Evaluate] AI completion failed, using deterministic summary:', err)
    }

    // Deterministic fallback if AI response missing or failed
    if (!evaluation || !Array.isArray(evaluation.weaknesses)) {
      const weakTopics = allQuestions
        .filter((q) => (Number(q.ai_evaluation?.score) || 0) < 70)
        .map((q) => ({
          topic: q.topic || 'General',
          subtopic: 'Core Principles & Edge Cases',
          score: Math.max(40, 100 - (Number(q.ai_evaluation?.score) || 0)),
          feedback: q.ai_evaluation?.feedback || `Candidate demonstrated weakness in ${q.topic}. Further practice recommended.`,
        }))

      const strongTopics = allQuestions
        .filter((q) => (Number(q.ai_evaluation?.score) || 0) >= 70)
        .map((q) => `${q.topic}: Demonstrated solid technical foundation.`)

      evaluation = {
        overall_score: computedOverallScore,
        strengths: strongTopics.length > 0 ? strongTopics : ['Demonstrated willingness to tackle technical interview challenges under timed constraints.'],
        weaknesses: weakTopics.length > 0 ? weakTopics : [{
          topic: allQuestions[0]?.topic || 'Technical Fundamentals',
          subtopic: 'General Mastery',
          score: 80,
          feedback: 'Candidate needs to practice answering under timed interview conditions with concrete examples.',
        }],
        summary: `Candidate completed interview with an overall score of ${computedOverallScore}%. Identified key focus areas for targeted improvement.`,
      }
    }

    const strengths = Array.isArray(evaluation.strengths) ? evaluation.strengths : []
    const weaknesses = Array.isArray(evaluation.weaknesses) ? evaluation.weaknesses : []

    // Update interview record
    await supabaseAdmin
      .from('interviews')
      .update({
        overall_score: computedOverallScore,
        feedback_summary: evaluation.summary || null,
        strengths,
        weaknesses,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', id)

    // Update weakness tracking table (user_weaknesses) for roadmap generation!
    const weaknessEvaluations = weaknesses.map((w: any) => ({
      topic: w.topic || 'General',
      subtopic: w.subtopic || undefined,
      score: 100 - (Number(w.score) || 50),
      feedback: w.feedback || '',
    }))

    // Also include any individually scored questions
    for (const wr of weaknessRecordsToUpdate) {
      if (!weaknessEvaluations.some((we: any) => we.topic.toLowerCase() === wr.topic.toLowerCase())) {
        weaknessEvaluations.push({
          topic: wr.topic,
          subtopic: undefined,
          score: wr.score,
          feedback: wr.feedback,
        })
      }
    }

    if (weaknessEvaluations.length > 0) {
      await updateWeaknessScores(user.id, weaknessEvaluations)
    }

    return NextResponse.json({
      success: true,
      overall_score: computedOverallScore,
      strengths,
      weaknesses,
      summary: evaluation.summary,
      questions: allQuestions,
    })
  } catch (error: any) {
    console.error('[POST /api/interviews/[id]/evaluate] Error:', error)
    return NextResponse.json({ error: error.message || 'Evaluation failed' }, { status: 500 })
  }
}
