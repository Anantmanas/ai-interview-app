# Runtime Error Log - Full Module Test

Timestamp: 2026-06-01T17:01:07.476Z
Environment: local dev (`next dev`) on http://localhost:3000

## Test Scope
- Landing/auth routes
- Onboarding route reachability
- Dashboard auth guard behavior
- Interview API runtime modes
- Resume extraction API with PDF upload

## Result Summary
- Total tests: 8
- Runtime bugs: 2
- Blocking bugs: 2

## Passing Checks
1. `GET /` -> 200
2. `GET /auth/login` -> 200
3. `GET /auth/sign-up` -> 200
4. `GET /dashboard` (unauth) -> 307 redirect `/auth/login` (expected)
5. `GET /auth/onboarding/welcome` -> 200
6. `POST /api/resume` with `Anant_Manas_Resume.pdf` -> 200
   - Extracted name: `Anant Manas`
   - Extracted experience years: `3`
   - Extracted education present

## Runtime Bugs Found

### BUG-001: Interview question generation fails at runtime
- Endpoint: `POST /api/interview/chat`
- Mode: `interview`
- HTTP: 500
- Error detail:
  - `RapidAPI error 429: You have exceeded the MONTHLY quota for Requests on your current plan, BASIC`
- Impact:
  - Interview room cannot load questions
  - User sees `API error 500` in `components/interview/interview-room.tsx`
- Repro:
  1. Open interview room
  2. Load questions triggers `callInterviewAPI('interview', ...)`
  3. API returns 500 due upstream 429

### BUG-002: Interview side-chat fails at runtime
- Endpoint: `POST /api/interview/chat`
- Mode: `chat`
- HTTP: 500
- Error detail:
  - `RapidAPI error 429: You have exceeded the MONTHLY quota for Requests on your current plan, BASIC`
- Impact:
  - Alex chat panel cannot respond
- Repro:
  1. Send any message in right panel
  2. API returns 500 due upstream 429

## Evidence
- Raw results file: `runtime-test-results.json`
- Server logs: `.next/dev-server.log`
- Server error logs: `.next/dev-server.err`

## Notes
- Dashboard `%PDF-...` corruption issue is not reproduced in current API test after parser correction.
- Resume API currently survives upstream 429 by fallback extraction, so upload still works.
- Interview API has no fallback path when upstream quota is exhausted, causing hard failures.
