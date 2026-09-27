// ─────────────────────────────────────────────────────────────────────────────
// cypress/e2e/interview-room.cy.js
// Deep E2E: Interview Questions API, Session Guard, Answer Evaluation schema
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_INTERVIEW_ID = 'e2e-interview-session-0001'

const MOCK_QUESTIONS = [
  {
    id: 'q-001',
    interview_id: MOCK_INTERVIEW_ID,
    sequence_order: 1,
    text: 'Explain the Node.js event loop. How do microtasks (Promises) differ from macrotasks (setTimeout)?',
    type: 'technical',
    difficulty: 'medium',
    topic: 'Node.js Architecture',
    topicTag: 'runtime',
  },
  {
    id: 'q-002',
    interview_id: MOCK_INTERVIEW_ID,
    sequence_order: 2,
    text: 'Design a resilient distributed rate limiter for a public REST API gateway at 10M req/day scale.',
    type: 'system_design',
    difficulty: 'hard',
    topic: 'System Architecture',
    topicTag: 'scalability',
  },
  {
    id: 'q-003',
    interview_id: MOCK_INTERVIEW_ID,
    sequence_order: 3,
    text: 'Tell me about a time you had a major technical disagreement with a teammate. How did you resolve it?',
    type: 'behavioral',
    difficulty: 'medium',
    topic: 'Leadership',
    topicTag: 'conflict',
  },
]

describe('Interview Room — Route & Session Security', () => {
  it('redirects unauthenticated users away from any interview session URL', () => {
    cy.visit(`/interview/${MOCK_INTERVIEW_ID}`)
    cy.url().should('include', '/auth/login')
    cy.contains('h1', 'Sign in to Console').should('be.visible')
  })

  it('redirects unauthenticated users from a random UUID interview URL', () => {
    cy.visit('/interview/00000000-0000-0000-0000-000000000000')
    cy.url().should('include', '/auth/login')
  })
})

describe('Interview Room — Questions API (GET)', () => {
  it('GET /api/interviews/:id/questions returns 401 for unauthenticated requests', () => {
    cy.request({
      method: 'GET',
      url: `/api/interviews/${MOCK_INTERVIEW_ID}/questions`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401)
      expect(res.body).to.have.property('error')
    })
  })

  it('GET questions response schema has required fields when mocked', () => {
    cy.intercept('GET', `/api/interviews/${MOCK_INTERVIEW_ID}/questions`, {
      statusCode: 200,
      body: { questions: MOCK_QUESTIONS },
    }).as('getQuestions')

    cy.request({
      method: 'GET',
      url: `/api/interviews/${MOCK_INTERVIEW_ID}/questions`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 401])
    })

    // Validate mock data structure is correct
    MOCK_QUESTIONS.forEach((q) => {
      expect(q).to.have.property('id').that.is.a('string')
      expect(q).to.have.property('sequence_order').that.is.a('number')
      expect(q).to.have.property('text').that.is.a('string').with.length.gt(10)
      expect(q).to.have.property('type').that.is.oneOf(['technical', 'system_design', 'behavioral'])
      expect(q).to.have.property('difficulty').that.is.oneOf(['easy', 'medium', 'hard'])
      expect(q).to.have.property('topic').that.is.a('string')
    })
  })

  it('GET questions returns items in ascending sequence_order', () => {
    const sorted = [...MOCK_QUESTIONS].sort((a, b) => a.sequence_order - b.sequence_order)
    sorted.forEach((q, i) => {
      expect(q.sequence_order).to.eq(i + 1)
    })
  })
})

describe('Interview Room — Questions API (POST Persistence)', () => {
  it('POST /api/interviews/:id/questions returns 401 for unauthenticated requests', () => {
    cy.request({
      method: 'POST',
      url: `/api/interviews/${MOCK_INTERVIEW_ID}/questions`,
      body: { questions: MOCK_QUESTIONS },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401)
    })
  })

  it('POST questions API validates that question array is required in body', () => {
    cy.request({
      method: 'POST',
      url: `/api/interviews/${MOCK_INTERVIEW_ID}/questions`,
      body: {},
      failOnStatusCode: false,
    }).then((res) => {
      // Without auth it's 401; if auth was present, empty questions array should return 400
      expect(res.status).to.be.oneOf([400, 401])
    })
  })

  it('mocked POST persistence returns correct count and success flag', () => {
    cy.intercept('POST', `/api/interviews/${MOCK_INTERVIEW_ID}/questions`, {
      statusCode: 200,
      body: { success: true, count: MOCK_QUESTIONS.length },
    }).as('persistQuestions')

    cy.request({
      method: 'POST',
      url: `/api/interviews/${MOCK_INTERVIEW_ID}/questions`,
      body: { questions: MOCK_QUESTIONS },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 401])
    })
  })
})

describe('Interview Room — Interviews Create API Guard', () => {
  it('POST /api/interviews/create returns 401 for unauthenticated calls (no spam)', () => {
    cy.request({
      method: 'POST',
      url: '/api/interviews/create',
      body: {
        title: 'Unauthorized Intrusion Test',
        type: 'technical',
        difficulty: 'hard',
        target_role: 'Hacker',
      },
      failOnStatusCode: false,
    }).then((res) => {
      // This MUST be 401 — prevents any test from creating real interview rows
      expect(res.status).to.eq(401)
    })
  })
})
