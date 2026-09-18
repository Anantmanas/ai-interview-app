# Progress Report

Date: 14 Sep 2026
Project: InterviewAI / AI Interview Preparation Platform
Status: Functional prototype. Not production-grade SaaS.

## Snapshot

Next.js 16 app with Supabase auth, dashboard, resume upload/parse, AI interview room, history, and roadmap screens. Core product loop (practice → persist transcript → score → weaknesses → roadmap) is incomplete. AI providers are mixed (NVIDIA/DeepSeek, RapidAPI Gemini/GPT-4, OpenAI) and several env values are invalid or unused.

## Working now

- Landing page, login, signup, auth callback, sign-out, protected dashboard routing.
- Dashboard home: interview counts, average score, practice time, weakness count, recent interviews, resume insight card, roadmap progress.
- Resume upload from dashboard/onboarding via `POST /api/resume` (FormData + `pdf-parse`). Name and overview render on the dashboard card.
- Interview setup: title, type, difficulty; creates an `interviews` row and opens `/interview/[id]`.
- Interview room: generate questions, per-answer evaluate, chat, timer, text/code answers, speech + TTS hooks (session state is in-memory).
- History list (`/dashboard/history`) and detail UI (`/dashboard/history/[id]`). Completed rows link to the detail page.
- Roadmap page reads `roadmap_items` and can toggle completion. Generate API exists (`POST /api/roadmap/generate`).
- Onboarding questions: real `ResumeDropzone` plus `target_role` save to `profiles`.
- Sidebar routes to `/dashboard/resume` and `/dashboard/settings`.
- UploadThing resume uploader still exists as a second path (`app/api/uploadthing/core.ts`); dashboard upload does not use it.

## Debugged this cycle: empty Technical Skills

Symptom: after PDF parse, dashboard showed name/overview but Technical Skills was empty.

Evidence:

1. RapidAPI resume parser returned **403 You are not subscribed** → code fell back to regex.
2. Fallback matched only `skills?:[^\n]+`. Multi-line skill sections produced `skillsCount: 0`.
3. NVIDIA DeepSeek path then failed with **`TypeError: Invalid URL`** (`DEEPSEAK_API_URL` is not a valid URL).
4. Dashboard `ResumeProvider` hydrates from **localStorage**. Stale payload with empty skills kept the UI empty even after the API returned 21 skills (`skillsCount: 21` on fallback after regex fix).

Code changes (verify with a re-upload): `/api/resume` uses `ResumeParsingService` and maps `key_skills` → `skills`; stronger multi-line skill regex; skip stale localStorage; persist/hydrate via `profiles.resume_text`. NVIDIA base URL is sanitized when the env value is invalid.

## Needs debugging / not wired

- End interview redirects to `/interview-results?score=...`. That route does not exist (`components/interview/interview-room.tsx`). History detail is at `/dashboard/history/[id]`.
- Chat, questions, and answers are not written to `interview_questions`. Session scores live in React state only.
- `app/api/interviews/[id]/evaluate/route.ts` exists and is not called when the interview ends.
- Interview generate/evaluate/chat uses RapidAPI Gemini/GPT-4 (`app/api/interview/chat/route.ts`) — same subscription/URL failure mode as the old resume parser.
- Profile **Save Profile** has no update handler. Settings switches and Change Password do not persist.
- Login links to `/auth/forgot-password`; that page does not exist.
- Duplicate history pages: `app/(dashboard)/history/page.tsx` and `app/dashboard/history/page.tsx`.
- `schema.sql` and `roles.sql` are empty. `lib/types.ts` still diverges from columns used by APIs (`sequence_order` vs `order_index`, `target_companies`, evaluation fields).
- Roadmap generation requires `user_weaknesses` with score over 40. Weaknesses are not written if evaluation never runs, so generate often no-ops.
- No `.env.example`. `DEEPSEAK_API_URL` invalid. Keys mixed across NVIDIA, RapidAPI, OpenAI, UploadThing. Resume pipeline is split (`/api/resume` vs `/api/resume/analyze` vs UploadThing).

## Missing as core SaaS

These are not polish items. They are the product/ops surface a paid SaaS needs:

- Billing: plans, checkout, subscriptions, invoices, usage/quota on AI calls.
- Abuse control: rate limits, per-user AI spend caps, file size/type enforcement beyond UI copy.
- Auth completeness: password reset, email verification UX, session/device management.
- Data layer: checked-in migrations as source of truth, RLS on all user tables, backup/restore story.
- Compliance: privacy policy, ToS, data export/delete (GDPR).
- Reliability: error monitoring, structured logs (without leaking PII), alerting on AI/provider outages.
- Quality: automated tests for auth, resume parse, interview persist, evaluation, billing.
- Multi-tenant extras: orgs/teams, roles, admin console, feature flags.
- Support: transactional email, in-app errors that users can act on, status of failed parses/interviews.

## Next 5

1. Persist interview Q&A, call evaluate on end, redirect to `/dashboard/history/[id]`.
2. Finish resume hydrate (server + localStorage) and confirm skills stay on dashboard after refresh.
3. Replace RapidAPI interview calls with a configured provider (NVIDIA or OpenAI) and fail clearly when keys/URLs are bad.
4. Env contract: `.env.example`, valid `DEEPSEAK_API_URL`, one resume pipeline, RLS + real schema dump.
5. SaaS floor: rate limits, usage metering, billing stub, password reset, error monitoring, tests.
