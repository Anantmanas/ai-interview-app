# Progress Report

Date: May 24, 2026
Project: InterviewAI / AI Interview Preparation Platform

## Current Build Summary

The current build is a Next.js 16 application for AI-powered interview preparation. It includes Supabase authentication, dashboard pages, resume upload and AI resume analysis, AI interview setup, a chat-based interview room, voice input, text-to-speech output, interview history, roadmap generation, and profile/settings screens.

TypeScript verification was run with `npx tsc --noEmit` and currently passes. The existing `tsc-output.txt` file appears to be stale because it still lists older type errors that are no longer present.

## Completed So Far

- Landing page with product positioning, feature sections, call-to-action links, and auth entry points.
- Supabase login, signup, auth callback, protected dashboard routing, and sign-out flow.
- Dashboard home with interview stats, average score, practice time, active weaknesses, recent interviews, resume insight card, and roadmap progress.
- Resume upload via UploadThing with PDF handling.
- Resume analysis API that downloads the uploaded PDF, extracts text with `pdf-parse`, sends it to the NVIDIA-hosted DeepSeek model, and stores structured resume details in Supabase.
- Interview setup flow with session title, interview type, difficulty, resume-aware profile preview, and interview record creation.
- Interview room with AI chat streaming through the AI SDK, timer, manual text answers, browser speech recognition, and OpenAI TTS playback.
- Interview history page listing previous sessions, status, duration, score, type, and difficulty.
- Roadmap page that reads `roadmap_items`, shows progress, allows completion toggles, and can generate a new plan from user weaknesses.
- Profile page with profile fields and resume analysis entry points.
- Settings page shell with notification, privacy, and password-related controls.
- Reusable UI component foundation using shadcn/Radix-style components and lucide icons.

## Pending Tasks

- Save full interview conversation history. The chat route currently streams responses but does not persist user and assistant messages into `interview_questions` or another transcript table.
- Trigger interview evaluation when a user ends an interview. `app/api/interviews/[id]/evaluate/route.ts` exists, but `InterviewRoom` currently only marks the interview as completed and redirects.
- Fix the end-interview redirect. The current code sends users to `/history/${interview.id}`, but the visible history route is `/dashboard/history`; there is no confirmed detail review page at `/history/[id]`.
- Build an interview detail/review page that shows transcript, score, strengths, weaknesses, and individual question feedback.
- Connect profile form saving. The Profile page has editable fields and a Save Profile button, but no update handler is wired.
- Complete onboarding. The onboarding questions page currently simulates resume upload with `URL.createObjectURL` and console logs for navigation instead of using UploadThing/Supabase and a full multi-step flow.
- Add forgot-password/reset-password pages or remove the link until the flow exists.
- Resolve duplicate or inconsistent routes such as `app/(dashboard)/history/page.tsx` and `app/dashboard/history/page.tsx` if both are not intentionally used.
- Align TypeScript interfaces in `lib/types.ts` with the actual Supabase columns used by pages and API routes, especially weaknesses, roadmap resources, interview questions, and profile target companies.
- Remove or refresh stale generated files such as `tsc-output.txt` once they are no longer useful.

## Pending API Integrations

- Add all required environment variables to `.env.example`. The app currently uses `OPENAI_API_KEY`, `DEEPSEAK_API_KEY`, and UploadThing credentials, but `.env.example` only documents Supabase values.
- Harden OpenAI API usage. Roadmap generation, interview chat, evaluation, and TTS depend on `OPENAI_API_KEY`; routes should validate missing keys and return clearer setup errors.
- Confirm AI SDK/OpenAI provider setup for `app/api/interview/chat/route.ts`. It uses `model: 'openai/gpt-4o'`; verify this is supported by the installed AI SDK/provider configuration in deployment.
- Complete NVIDIA/DeepSeek integration documentation. The resume analyzer uses `DEEPSEAK_API_KEY` with `https://integrate.api.nvidia.com/v1`, but the error message and env naming should be made consistent.
- Add UploadThing env documentation and production callback/domain checks.
- Persist AI interview messages/questions so the evaluation API has real `interview_questions` data to evaluate.
- Decide whether roadmap generation should clear, update, or deduplicate existing pending roadmap items before inserting new ones.
- Add API validation with shared schemas, especially for resume analysis, roadmap generation, interview evaluation, and TTS payloads.
- Add rate limits or abuse protection to AI-heavy routes.

## Pending UI Modifications

- Add a real interview review UI after completing an interview.
- Improve the interview room mobile layout. The current layout is desktop-first with a hidden side panel and fixed viewport height.
- Replace static interview tips with contextual tips based on interview type, difficulty, and detected weaknesses.
- Make roadmap filters functional. The page shows filter badges for all topics, coding, and system design, but no filtering logic is implemented.
- Improve Settings so switches and password actions persist or clearly show disabled states.
- Add loading, empty, and error states to profile saving, roadmap generation, evaluation, and interview creation.
- Fix sidebar footer links. The dropdown links point to `/resume` and `/settings`, while dashboard routes are `/dashboard/resume` and `/dashboard/settings`.
- Avoid duplicated resume parsing logic in `ResumeUploadCard` and `InterviewSetup`; move it into a shared utility.
- Add user-facing status while interview evaluation is running.
- Add confirmation or warning for ending an interview before enough answers are collected.

## Pending Database / Supabase Work

- Confirm tables and columns exist for `profiles`, `interviews`, `interview_questions`, `user_weaknesses`, and `roadmap_items`.
- Ensure `profiles` includes fields used by UI, such as `target_companies`, or remove those UI references.
- Ensure `interviews` supports fields written by evaluation, including `strengths`, `weaknesses`, and possibly `feedback_summary`.
- Ensure `interview_questions` schema matches the evaluation API. The API expects `sequence_order`, `question_text`, `user_answer`, and `ai_evaluation`; `lib/types.ts` currently uses `order_index`, `ai_feedback`, `score`, `strengths`, and `weaknesses`.
- Add Row Level Security policies for all user-owned tables.
- Add database migrations or schema documentation so the project can be reproduced reliably.

## Testing / Quality Pending

- Add route-level tests for auth-protected API routes.
- Add integration tests for resume upload and analysis with mocked AI responses.
- Add tests for interview creation, chat persistence, ending interviews, and evaluation.
- Add tests for roadmap generation and duplicate handling.
- Add UI tests for dashboard navigation, interview setup, profile saving, and roadmap status toggling.
- Add production build verification with `next build` after API/env work is complete.
- Add error monitoring/logging strategy for AI and file parsing failures.

## Known Risks / Gaps

- Interview evaluation cannot produce useful results until the interview questions and answers are stored.
- The product promises weakness detection and AI scoring on the landing page, but the current user flow does not yet automatically connect completed interviews to evaluation and weakness updates.
- Some UI controls look functional but are not yet connected to persistence, especially Profile and Settings.
- Environment setup is under-documented, which can block local setup or deployment.
- Resume upload URL usage is inconsistent in places (`url` vs `ufsUrl`), so this should be verified against the installed UploadThing version.
- The app depends heavily on external AI providers, so missing keys, quota limits, model changes, or provider latency need graceful fallback states.

## Suggested Next Priorities

1. Persist interview messages/questions during chat.
2. Trigger evaluation when ending an interview and show an evaluation loading state.
3. Create the interview review/detail page.
4. Fix route/link mismatches in the end-interview redirect and sidebar dropdown.
5. Wire Profile save functionality.
6. Update `.env.example` with all required integrations.
7. Align Supabase schema/types and add migration documentation.
8. Make roadmap filters and Settings controls either functional or visibly disabled.

## Current Status

The application has a strong functional foundation and several major screens are already built. The main remaining work is connecting the AI interview lifecycle end to end: store the conversation, evaluate it, update weaknesses, generate a useful roadmap, and present feedback in a review UI. After that, the highest-value polish is profile/settings persistence, environment documentation, route cleanup, and test coverage.
