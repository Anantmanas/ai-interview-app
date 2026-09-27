// ─────────────────────────────────────────────────────────────────────────────
// cypress/e2e/onboarding.cy.js
// Deep E2E: Onboarding Questions — Role Selection, Custom Input, 3-Role Limit
// ─────────────────────────────────────────────────────────────────────────────

describe('Onboarding — Target Role Setup', () => {
  beforeEach(() => {
    // Block AI role suggestion endpoint so default popular roles are shown
    cy.intercept('POST', '/api/ai/suggest-roles', {
      statusCode: 200,
      body: { roles: ['Full Stack Developer', 'Cloud Architect', 'Security Engineer', 'Data Engineer'] },
    }).as('mockSuggestRoles')

    cy.visit('/auth/onboarding/questions')
  })

  it('renders the onboarding page with header and role section', () => {
    cy.contains('h1', 'Target Roles & Setup').should('be.visible')
    cy.contains('Select up to 3 target roles').should('be.visible')
    cy.contains('Selected Target Roles').should('be.visible')
    cy.contains('0 / 3 Selected').should('be.visible')

    // Resume dropzone should be present
    cy.contains('Resume Document (Optional)').should('be.visible')
    cy.get('input[type="file"]').should('exist')

    // Submit button should be initially DISABLED (no roles selected)
    cy.contains('button', /Complete Setup/).should('be.disabled')
  })

  it('shows default popular role suggestion chips', () => {
    // Default suggestions from the component DEFAULT_POPULAR_ROLES constant
    cy.contains('Full Stack Developer').should('be.visible')
    cy.contains('Frontend Engineer').should('be.visible')
    cy.contains('Backend Engineer').should('be.visible')
    cy.contains('AI / ML Engineer').should('be.visible')
  })

  it('selects a role chip and updates the counter and selected badge area', () => {
    cy.contains('button', 'Full Stack Developer').click()

    // Counter updates
    cy.contains('1 / 3 Selected').should('be.visible')

    // Badge appears in the selected roles area
    cy.get('[class*="min-h-[46px]"]').contains('Full Stack Developer').should('be.visible')

    // Submit button is now ENABLED
    cy.contains('button', /Complete Setup \(1\)/).should('not.be.disabled')
  })

  it('deselects a role chip by clicking it again', () => {
    cy.contains('button', 'Backend Engineer').click()
    cy.contains('1 / 3 Selected').should('be.visible')

    // Click again to deselect
    cy.contains('button', 'Backend Engineer').click()
    cy.contains('0 / 3 Selected').should('be.visible')
  })

  it('enforces maximum of 3 roles — 4th chip is disabled when at limit', () => {
    cy.contains('button', 'Full Stack Developer').click()
    cy.contains('button', 'Backend Engineer').click()
    cy.contains('button', 'Frontend Engineer').click()

    cy.contains('3 / 3 Selected').should('be.visible')

    // 4th suggestion chip should be disabled (opacity change, cursor-not-allowed)
    cy.contains('button', 'AI / ML Engineer').should('be.disabled')

    // Custom input should also be disabled at limit
    cy.get('input[placeholder*="Maximum 3 roles selected"]').should('exist').and('be.disabled')
  })

  it('removes a selected role using the X button on the badge', () => {
    cy.contains('button', 'Full Stack Developer').click()
    cy.contains('1 / 3 Selected').should('be.visible')

    // Find and click the X (remove) button within the selected role badge
    cy.get('[class*="min-h-[46px]"]')
      .contains('Full Stack Developer')
      .closest('[class*="inline-flex"]')
      .find('button[title="Remove role"]')
      .click()

    cy.contains('0 / 3 Selected').should('be.visible')
    cy.contains('button', /Complete Setup/).should('be.disabled')
  })

  it('adds a custom role via text input and Enter key', () => {
    cy.get('input[placeholder*="Type a custom role"]').type('Staff AI Platform Engineer')
    cy.get('input[placeholder*="Type a custom role"]').type('{enter}')

    cy.contains('Staff AI Platform Engineer').should('be.visible')
    cy.contains('1 / 3 Selected').should('be.visible')
  })

  it('adds a custom role via the Add button', () => {
    cy.get('input[placeholder*="Type a custom role"]').type('Principal MLOps Engineer')
    cy.contains('button', 'Add').click()

    cy.contains('Principal MLOps Engineer').should('be.visible')
  })

  it('does not add duplicate roles (case-insensitive)', () => {
    cy.contains('button', 'Full Stack Developer').click()
    cy.contains('1 / 3 Selected').should('be.visible')

    // Try adding same role via input
    cy.get('input[placeholder*="Type a custom role"]').type('full stack developer')
    cy.contains('button', 'Add').click()

    // Counter must still show 1
    cy.contains('1 / 3 Selected').should('be.visible')
  })

  it('Clear All button resets all selected roles to zero', () => {
    cy.contains('button', 'Full Stack Developer').click()
    cy.contains('button', 'Backend Engineer').click()
    cy.contains('2 / 3 Selected').should('be.visible')

    // Clear All button appears when at least 1 role selected
    cy.contains('button', 'Clear All').should('be.visible').click()

    cy.contains('0 / 3 Selected').should('be.visible')
    cy.contains('No roles selected yet').should('be.visible')
  })

  it('pre-populates role from localStorage resume data (targetRole auto-fill)', () => {
    const mockResume = {
      name: 'Priya Sharma',
      targetRole: 'DevOps Engineer',
      skills: ['Kubernetes', 'Terraform', 'Docker', 'CI/CD'],
      experience: [],
      education: [],
      summary: '',
    }

    cy.visit('/auth/onboarding/questions', {
      onBeforeLoad(win) {
        win.localStorage.setItem('interviewai_resume_data', JSON.stringify(mockResume))
        win.localStorage.setItem('interviewai_resume_meta', JSON.stringify({
          uploadedAt: new Date().toISOString(),
          fileName: 'priya_resume.pdf',
          source: 'onboarding',
        }))
      },
    })

    // The component useEffect reads resumeData?.targetRole and auto-selects it
    cy.contains('DevOps Engineer', { timeout: 4000 }).should('be.visible')
    cy.contains('1 / 3 Selected').should('be.visible')
  })
})
