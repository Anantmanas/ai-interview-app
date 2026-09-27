// ─────────────────────────────────────────────────────────────────────────────
// cypress/support/commands.js
// Global custom commands — used by every spec
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Safety guard: intercepts ALL outbound POST /api/** and Supabase calls
 * to prevent production data writes, AI quota consumption, or spam during tests.
 */
Cypress.Commands.add('setupSafetyGuards', () => {
  // Block direct Supabase REST mutations (insert / update / upsert)
  cy.intercept('POST', '**/rest/v1/**', (req) => {
    req.reply({ statusCode: 200, body: [] })
  }).as('supabaseRestBlock')

  cy.intercept('PATCH', '**/rest/v1/**', (req) => {
    req.reply({ statusCode: 200, body: {} })
  }).as('supabaseRestPatch')

  // Block Supabase Auth token endpoint (prevents real login/signup side effects)
  cy.intercept('POST', '**/auth/v1/token*', {
    statusCode: 400,
    body: {
      error: 'invalid_grant',
      error_description: 'Invalid login credentials',
      message: 'Invalid login credentials',
    },
  }).as('authTokenBlock')

  // Block all AI inference endpoints
  cy.intercept('POST', '/api/ai/**', {
    statusCode: 200,
    body: { success: true, message: 'AI endpoint mocked' },
  }).as('aiBlock')

  // Block OpenRouter / OpenAI / Anthropic outbound calls
  cy.intercept('POST', '**/openrouter.ai/**', {
    statusCode: 200,
    body: {},
  }).as('openRouterBlock')
})

/**
 * Seeds localStorage with a parsed resume so resume-dependent tests
 * don't need a real file upload.
 */
Cypress.Commands.add('seedResumeInStorage', (resumeData, metaData) => {
  const defaultResume = resumeData || {
    name: 'Alex Rivera',
    targetRole: 'Senior Full Stack Engineer',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
    experience: [
      {
        role: 'Senior Software Engineer',
        company: 'CloudScale Inc.',
        years: 4,
        highlights: [
          'Engineered microservices processing 50M daily events',
          'Reduced p99 query latency by 40% with Redis caching',
        ],
      },
    ],
    education: ['B.S. Computer Science - Tech University'],
    summary: 'Senior Full Stack Engineer with 6+ years building distributed applications at scale.',
  }

  const defaultMeta = metaData || {
    uploadedAt: new Date().toISOString(),
    fileName: 'alex_resume.pdf',
    source: 'dashboard',
  }

  window.localStorage.setItem('interviewai_resume_data', JSON.stringify(defaultResume))
  window.localStorage.setItem('interviewai_resume_meta', JSON.stringify(defaultMeta))
})
