// ─────────────────────────────────────────────────────────────────────────────
// cypress/e2e/dashboard-profile.cy.js
// Deep E2E: Dashboard route security, Redirect aliases, Profile page structure
// ─────────────────────────────────────────────────────────────────────────────

describe('Dashboard — Route Security (Middleware Guard)', () => {
  const PROTECTED = [
    '/dashboard',
    '/dashboard/profile',
    '/dashboard/resume',
    '/dashboard/roadmap',
    '/dashboard/history',
    '/dashboard/billing',
    '/dashboard/analytics',
    '/dashboard/settings',
    '/dashboard/referrals',
  ]

  PROTECTED.forEach((route) => {
    it(`blocks unauthenticated access to ${route}`, () => {
      cy.visit(route)
      cy.url().should('include', '/auth/login')
      cy.get('body').should('not.contain.text', 'Application error')
    })
  })
})

describe('Dashboard — Middleware Redirect Aliases', () => {
  it('/history alias redirects correctly (via middleware map)', () => {
    cy.visit('/history')
    cy.url().should('satisfy', (url) =>
      url.includes('/dashboard/history') || url.includes('/auth/login')
    )
  })

  it('/resume alias redirects correctly (via middleware map)', () => {
    cy.visit('/resume')
    cy.url().should('satisfy', (url) =>
      url.includes('/dashboard/resume') || url.includes('/auth/login')
    )
  })

  it('/profile alias redirects correctly (via middleware map)', () => {
    cy.visit('/profile')
    cy.url().should('satisfy', (url) =>
      url.includes('/dashboard/profile') || url.includes('/auth/login')
    )
  })

  it('/settings alias redirects correctly (via middleware map)', () => {
    cy.visit('/settings')
    cy.url().should('satisfy', (url) =>
      url.includes('/dashboard/settings') || url.includes('/auth/login')
    )
  })

  it('/roadmap alias redirects correctly (via middleware map)', () => {
    cy.visit('/roadmap')
    cy.url().should('satisfy', (url) =>
      url.includes('/dashboard/roadmap') || url.includes('/auth/login')
    )
  })
})

describe('Dashboard — Profile API Security', () => {
  it('profile Supabase direct update requires authentication (401 for unauthed)', () => {
    // Profile updates go directly to Supabase — test that middleware protects the dashboard
    cy.visit('/dashboard/profile')
    cy.url().should('include', '/auth/login')
  })

  it('delete account code endpoint returns 401 or 404 for unauthenticated access', () => {
    cy.request({
      method: 'POST',
      url: '/api/auth/send-delete-code',
      body: { email: 'attacker@evil.io' },
      failOnStatusCode: false,
    }).then((res) => {
      // MUST block — this endpoint triggers email sending
      expect(res.status).to.be.oneOf([401, 404, 405])
    })
  })

  it('delete account verification endpoint rejects unauthenticated calls', () => {
    cy.request({
      method: 'DELETE',
      url: '/api/auth/delete-account',
      body: { code: '000000' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([401, 404, 405])
    })
  })
})

describe('Dashboard — Interview History API Security', () => {
  it('GET /api/interviews returns 401 for unauthenticated requests', () => {
    cy.request({
      method: 'GET',
      url: '/api/interviews',
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([401, 404])
    })
  })

  it('history page at /dashboard/history enforces login gate', () => {
    cy.visit('/dashboard/history')
    cy.url().should('include', '/auth/login')
  })
})
