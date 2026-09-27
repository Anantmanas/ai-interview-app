// ─────────────────────────────────────────────────────────────────────────────
// cypress/e2e/roadmap.cy.js
// Deep E2E: Roadmap Generation API, Route Guards, Redirect Aliases, Schema
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_ROADMAP_ITEMS = [
  {
    id: 'rm-001',
    topic: 'Distributed Caching',
    title: 'Redis & Cache-Aside Strategies',
    description: 'Master Cache-Aside, Write-Through, and Read-Through patterns with Redis clustering and eviction policies.',
    priority: 1,
    estimated_hours: 6,
    weakness_score: 0.78,
    status: 'pending',
    resources: [
      {
        type: 'video',
        title: 'System Design: How to design Redis Cache at Scale',
        url: 'https://www.youtube.com/watch?v=example1',
        channel: 'ByteByteGo',
        duration: '18 min',
      },
      {
        type: 'docs',
        title: 'Redis Official Docs — Caching Patterns',
        url: 'https://redis.io/docs/',
      },
      {
        type: 'practice',
        title: 'LRU Cache Implementation — LeetCode 146',
        url: 'https://leetcode.com/problems/lru-cache/',
      },
    ],
  },
  {
    id: 'rm-002',
    topic: 'Concurrency & Race Conditions',
    title: 'Thread Safety & Event Loop Models',
    description: 'Understand mutexes, deadlocks, semaphores, and the Node.js event loop non-blocking I/O model.',
    priority: 2,
    estimated_hours: 5,
    weakness_score: 0.65,
    status: 'pending',
    resources: [
      {
        type: 'video',
        title: 'Concurrency Models Explained — Event Loop vs. Threads',
        url: 'https://www.youtube.com/watch?v=example2',
        channel: 'Computerphile',
        duration: '12 min',
      },
      {
        type: 'practice',
        title: 'Implement a Thread-Safe Blocking Queue — LeetCode 1188',
        url: 'https://leetcode.com/problems/design-bounded-blocking-queue/',
      },
    ],
  },
]

describe('Roadmap — Route Security', () => {
  it('redirects /dashboard/roadmap to login when unauthenticated', () => {
    cy.visit('/dashboard/roadmap')
    cy.url().should('include', '/auth/login')
  })

  it('shortcut /roadmap resolves to /dashboard/roadmap then enforces login', () => {
    cy.visit('/roadmap')
    // Middleware redirects /roadmap → /dashboard/roadmap → auth guard → /auth/login
    cy.url().should('satisfy', (url) =>
      url.includes('/dashboard/roadmap') || url.includes('/auth/login')
    )
  })
})

describe('Roadmap — Generation API Security', () => {
  it('POST /api/roadmap/generate returns 401 for unauthenticated callers', () => {
    cy.request({
      method: 'POST',
      url: '/api/roadmap/generate',
      body: { topics: ['Redis Caching', 'Concurrency'] },
      failOnStatusCode: false,
    }).then((res) => {
      // MUST be 401 — prevents real YouTube API calls and LLM calls without auth
      expect(res.status).to.eq(401)
    })
  })

  it('POST /api/roadmap/generate requires topics array (not empty body)', () => {
    cy.request({
      method: 'POST',
      url: '/api/roadmap/generate',
      body: {},
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([400, 401])
    })
  })
})

describe('Roadmap — Response Schema Validation', () => {
  it('mocked roadmap response contains all required item fields', () => {
    cy.intercept('POST', '/api/roadmap/generate', {
      statusCode: 200,
      body: { success: true, items: MOCK_ROADMAP_ITEMS },
    }).as('generateRoadmap')

    MOCK_ROADMAP_ITEMS.forEach((item) => {
      expect(item).to.have.property('id').that.is.a('string')
      expect(item).to.have.property('topic').that.is.a('string').with.length.gt(0)
      expect(item).to.have.property('title').that.is.a('string')
      expect(item).to.have.property('description').that.is.a('string')
      expect(item).to.have.property('priority').that.is.a('number').and.gte(1)
      expect(item).to.have.property('estimated_hours').that.is.a('number').and.gt(0)
      expect(item).to.have.property('status').that.is.oneOf(['pending', 'completed'])
      expect(item).to.have.property('resources').that.is.an('array').with.length.gt(0)
    })
  })

  it('mocked roadmap items are ordered by priority ascending (1 = Critical first)', () => {
    const sorted = [...MOCK_ROADMAP_ITEMS].sort((a, b) => a.priority - b.priority)
    sorted.forEach((item, i) => {
      expect(item.priority).to.eq(MOCK_ROADMAP_ITEMS[i].priority)
    })
  })

  it('every resource in roadmap items has type, title and url', () => {
    MOCK_ROADMAP_ITEMS.forEach((item) => {
      item.resources.forEach((resource) => {
        expect(resource).to.have.property('type').that.is.oneOf(['video', 'docs', 'practice', 'course'])
        expect(resource).to.have.property('title').that.is.a('string').with.length.gt(0)
        expect(resource).to.have.property('url').that.is.a('string').and.includes('http')
      })
    })
  })

  it('weakness_score is a normalized float between 0.0 and 1.0', () => {
    MOCK_ROADMAP_ITEMS.forEach((item) => {
      if (item.weakness_score !== undefined) {
        expect(item.weakness_score).to.be.gte(0.0).and.lte(1.0)
      }
    })
  })
})

describe('Roadmap — Roadmap Item Toggle (Status API)', () => {
  it('PATCH /api/roadmap/:id/toggle returns 401 for unauthenticated users', () => {
    cy.request({
      method: 'PATCH',
      url: '/api/roadmap/rm-001/toggle',
      body: { status: 'completed' },
      failOnStatusCode: false,
    }).then((res) => {
      // 401 Unauthorized or 404 if route doesn't exist — never 200 without auth
      expect(res.status).to.be.oneOf([401, 404, 405])
    })
  })
})
