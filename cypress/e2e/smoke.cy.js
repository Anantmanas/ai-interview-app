// ─────────────────────────────────────────────────────────────────────────────
// cypress/e2e/smoke.cy.js
// Fast server health — should complete in < 5 seconds total
// ─────────────────────────────────────────────────────────────────────────────

describe('Smoke — Server Health & Public Pages', () => {
  it('home landing page loads and renders hero content', () => {
    cy.visit('/')
    cy.get('body').should('be.visible')
    cy.get('body').should('not.contain.text', 'Application error')
    cy.get('body').should('not.contain.text', 'This page crashed')
    // Should NOT redirect unauthenticated visitors away from landing
    cy.url().should('eq', 'http://localhost:3000/')
  })

  it('pricing page loads without errors', () => {
    cy.visit('/pricing')
    cy.get('body').should('be.visible')
    cy.url().should('include', '/pricing')
    cy.get('body').should('not.contain.text', 'Application error')
  })

  it('login page is publicly accessible without redirect', () => {
    cy.visit('/auth/login')
    cy.get('body').should('be.visible')
    cy.url().should('include', '/auth/login')
  })

  it('sign-up page is publicly accessible without redirect', () => {
    cy.visit('/auth/sign-up')
    cy.get('body').should('be.visible')
    cy.url().should('include', '/auth/sign-up')
  })
})
