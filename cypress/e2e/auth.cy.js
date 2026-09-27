// ─────────────────────────────────────────────────────────────────────────────
// cypress/e2e/auth.cy.js
// Deep E2E: Authentication — Login, Sign-Up, Validation, Navigation
// ─────────────────────────────────────────────────────────────────────────────

describe('Authentication — Login Flow', () => {
  beforeEach(() => {
    // Block Supabase token endpoint to prevent any real auth side effects
    cy.intercept('POST', '**/auth/v1/token*', {
      statusCode: 400,
      body: {
        error: 'invalid_grant',
        error_description: 'Invalid login credentials',
        message: 'Invalid login credentials',
      },
    }).as('authFail')
  })

  it('renders every UI element on the login page correctly', () => {
    cy.visit('/auth/login')

    // Brand mark
    cy.contains('InterviewAI').should('be.visible')
    cy.contains('// ACCESS TERMINAL').should('be.visible')
    cy.contains('h1', 'Sign in to Console').should('be.visible')
    cy.contains('Continue your interview preparation').should('be.visible')

    // OAuth buttons
    cy.contains('button', 'Continue with Google').should('be.visible').and('not.be.disabled')
    cy.contains('button', 'Continue with GitHub').should('be.visible').and('not.be.disabled')

    // Email & password inputs
    cy.get('input#email')
      .should('be.visible')
      .and('have.attr', 'type', 'email')
      .and('have.attr', 'required')

    cy.get('input#password')
      .should('be.visible')
      .and('have.attr', 'type', 'password')
      .and('have.attr', 'required')

    // Submit button with exact text
    cy.get('button[type="submit"]').should('be.visible').contains('Access Console')

    // Helper navigation links
    cy.contains('a', 'Forgot?')
      .should('have.attr', 'href', '/auth/forgot-password')
    cy.contains('a', 'Create account')
      .should('have.attr', 'href', '/auth/sign-up')
  })

  it('shows error banner on failed login with invalid credentials', () => {
    cy.visit('/auth/login')

    cy.get('input#email').type('hacker@evil.io')
    cy.get('input#password').type('wrongpassword')
    cy.get('button[type="submit"]').click()

    cy.wait('@authFail')

    // Error banner must appear with the error message from Supabase
    cy.contains('Invalid login credentials', { timeout: 8000 }).should('be.visible')

    // The form must NOT redirect — user stays on login page
    cy.url().should('include', '/auth/login')
  })

  it('blocks form submission when fields are empty (HTML5 required validation)', () => {
    cy.visit('/auth/login')

    // Attempt to submit with empty fields — HTML5 required blocks it
    // The form submit should not call the API
    cy.get('button[type="submit"]').click()

    // Email input should show validation — URL stays on login
    cy.url().should('include', '/auth/login')
    cy.get('input#email:invalid').should('exist')
  })

  it('navigates to sign-up page from the login footer link', () => {
    cy.visit('/auth/login')

    cy.contains('a', 'Create account').click()
    cy.url().should('include', '/auth/sign-up')
    cy.contains('h1', 'Create Account').should('be.visible')
  })

  it('navigates to forgot password from the Forgot link', () => {
    cy.visit('/auth/login')

    cy.contains('a', 'Forgot?').click()
    cy.url().should('include', '/auth/forgot-password')
  })
})

describe('Authentication — Sign-Up Flow', () => {
  it('renders sign-up form with all required fields', () => {
    cy.visit('/auth/sign-up')

    cy.contains('h1', 'Create Account').should('be.visible')
    cy.contains('button', 'Continue with Google').should('be.visible')
    cy.contains('button', 'Continue with GitHub').should('be.visible')

    cy.get('input#fullName').should('be.visible').and('have.attr', 'type', 'text')
    cy.get('input#email').should('be.visible').and('have.attr', 'type', 'email')
    cy.get('input#password').should('be.visible').and('have.attr', 'type', 'password')
    cy.get('input#confirmPassword').should('be.visible').and('have.attr', 'type', 'password')

    cy.get('button[type="submit"]').contains('Create Account')
    cy.contains('a', 'Terms of Service').should('have.attr', 'href', '/terms')
    cy.contains('a', 'Privacy Policy').should('have.attr', 'href', '/privacy')
    cy.contains('a', 'Sign in').should('have.attr', 'href', '/auth/login')
  })

  it('shows "Passwords do not match" error when passwords differ', () => {
    cy.visit('/auth/sign-up')

    cy.get('input#fullName').type('Ada Lovelace')
    cy.get('input#email').type('ada@engineer.io')
    cy.get('input#password').type('SecurePass123!')
    cy.get('input#confirmPassword').type('DifferentPass456!')
    cy.get('button[type="submit"]').click()

    cy.contains('Passwords do not match').should('be.visible')
    cy.url().should('include', '/auth/sign-up')
  })

  it('shows "Password must be at least 6 characters" when password too short', () => {
    cy.visit('/auth/sign-up')

    cy.get('input#fullName').type('Ada Lovelace')
    cy.get('input#email').type('ada@engineer.io')
    cy.get('input#password').type('abc')
    cy.get('input#confirmPassword').type('abc')
    cy.get('button[type="submit"]').click()

    cy.contains('Password must be at least 6 characters').should('be.visible')
    cy.url().should('include', '/auth/sign-up')
  })

  it('does not show password errors for a valid password pair', () => {
    // Mock successful Supabase sign-up to avoid creating real accounts
    cy.intercept('POST', '**/auth/v1/signup', {
      statusCode: 200,
      body: {
        user: { id: 'mock-user-id', email: 'ada@engineer.io' },
        session: null, // triggers email confirmation flow
      },
    }).as('mockSignup')

    cy.visit('/auth/sign-up')

    cy.get('input#fullName').type('Ada Lovelace')
    cy.get('input#email').type('ada@engineer.io')
    cy.get('input#password').type('SecurePass123!')
    cy.get('input#confirmPassword').type('SecurePass123!')

    // Should NOT contain any pre-existing password errors
    cy.contains('Passwords do not match').should('not.exist')
    cy.contains('Password must be at least 6 characters').should('not.exist')
  })

  it('navigates back to login from sign-up page footer link', () => {
    cy.visit('/auth/sign-up')

    cy.contains('a', 'Sign in').click()
    cy.url().should('include', '/auth/login')
  })
})

describe('Authentication — Route Protection (Middleware)', () => {
  it('blocks /interview/new and redirects to login', () => {
    cy.visit('/interview/new')
    cy.url().should('include', '/auth/login')
    cy.contains('h1', 'Sign in to Console').should('be.visible')
  })

  it('blocks /dashboard and redirects to login', () => {
    cy.visit('/dashboard')
    cy.url().should('include', '/auth/login')
  })

  it('blocks all dashboard sub-routes and redirects to login', () => {
    const protected_routes = [
      '/dashboard/profile',
      '/dashboard/resume',
      '/dashboard/roadmap',
      '/dashboard/history',
      '/dashboard/billing',
    ]

    protected_routes.forEach((route) => {
      cy.visit(route)
      cy.url().should('include', '/auth/login')
    })
  })
})
