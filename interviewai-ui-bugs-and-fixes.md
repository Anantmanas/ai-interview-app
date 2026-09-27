# InterviewAI — UI bugs and recommended fixes

**Application:** https://ai-interview-app-virid.vercel.app/  
**Scope:** Public pages and the test user's signed-in interface, including desktop and mobile viewports.  
**Findings:** 22 retained findings (14 interaction/state defects and 8 visible-copy/layout flags).  
**Note:** Fixes below are implementation guidance inferred from observed behavior, not a diagnosis from source-code inspection. Re-test each reproduction path after changing the app. No credentials or session tokens are included.

## Interview session and results

### 1. Mobile interview cockpit clips the answer workspace
- **Where / reproduce:** At 390×844, open an in-progress interview and choose **Continue on mobile anyway (Limited UX)**. The question pane occupies nearly the whole width; the answer editor and TEXT/CODE/VOICE controls are inaccessible by scrolling.
- **Fix:** At the mobile breakpoint, replace the desktop three-column cockpit with vertically stacked or explicitly switchable question, answer, and coach panels. Remove fixed/minimum widths that exceed the viewport (`min-width: 0` on grid/flex children), keep the answer editor and Submit action reachable, and ensure the coach cannot cover response controls. If a usable mobile layout is not supported, do not offer a continuation path that implies the session can be answered.
- **Verify:** At 320px and 390px, all question, editor, mode, and submit controls can be seen and activated without horizontal clipping.

### 2. Completed report changes from five evaluated answers to one while scrolling
- **Where / reproduce:** Finish a five-answer interview. An initial report showed 5/5 completed and five question entries, then changed on the same page to 1/5, 0% accuracy, and no evaluated answers after scrolling.
- **Fix:** Render summary metrics from the persisted evaluated-answer collection, not the current question index or an interim/default state. Reconcile asynchronous report fetches before replacing an already populated result; keep one authoritative immutable report snapshot per session and prevent stale responses from overwriting it.
- **Verify:** Score, completed count, accuracy, and question breakdown remain consistent after scrolling, waiting, and refreshing.

### 3. Early-ended zero-answer interview reports one completed question
- **Where / reproduce:** In a mobile interview with 0/5 completed, select **END SESSION → END & VIEW RESULTS**. The settled report says 1/5 completed while also showing zero evaluated answers.
- **Fix:** Define `completedCount` as the number of submitted/evaluated answers, not the ordinal of the current question. Use that same count in the termination prompt, report summary, and breakdown; handle zero answers explicitly.
- **Verify:** Ending before any submission consistently shows 0/5 and an empty breakdown after reload.

### 4. Detailed Analysis displays raw JSON and a conflicting score
- **Where / reproduce:** After an evaluated answer, the scorecard and Quick Evaluation showed 30, while Detailed Analysis rendered a raw object beginning with a different `score` of 68.
- **Fix:** Parse and validate the structured evaluation response before display. Render named feedback fields as readable UI rather than serializing JSON, and use a single canonical score for all panels (or clearly label any genuinely different metrics). Reject or safely fall back on malformed response shapes.
- **Verify:** Each answer displays human-readable analysis and the same score wherever that score appears.

### 5. History suggestions contradict a poor detailed assessment
- **Where / reproduce:** On the completed **Momentic UI Explore 2026-09-27** card, Suggestions says “Good performance, keep practicing!” despite zero recorded strengths/improvements; its Details page shows 0% question scores and a severe skill gap.
- **Fix:** Generate the summary from the same assessment/diagnostics data as the detail page. For zero or incomplete answers, show an appropriate not-enough-data or improvement message instead of the generic positive fallback. Validate that strengths, improvement counts, and sentiment agree with the scores.
- **Verify:** Summary and Details tell a consistent story for unanswered, low-scoring, and high-scoring sessions.

### 6. Behavioral scorecard contains malformed technical prompts
- **Where / reproduce:** A scorecard labeled **BEHAVIORAL** asks for “the fundamental principles of Full Stack Developer,” and an expanded analysis calls it a technical interview.
- **Fix:** Constrain question generation and evaluation templates by interview track. Treat “Full Stack Developer” as a role, not a technical concept. Validate generated prompts for track mismatch and malformed role substitution before presenting them; regenerate or use a track-specific fallback.
- **Verify:** Behavioral sessions contain behavioral prompts and matching assessment language.

### 7. Behavioral strategy hint recommends algorithm complexity
- **Where / reproduce:** On a behavioral production-incident question, Strategy Hint says to discuss “time/space complexity” and “core principles of Full Stack Developer.”
- **Fix:** Choose hint templates based on both track and question type. For this incident prompt, guide the candidate through situation, diagnosis, actions, trade-offs, and outcome, rather than algorithm analysis.
- **Verify:** Hints for behavioral, coding, and architecture prompts each use relevant guidance.

### 8. Key Suggestions sentences run together
- **Where / reproduce:** The post-answer Key Suggestions text concatenates adjacent suggestions without punctuation or spacing (for example `...budgets)Describe...projectDetail...`).
- **Fix:** Render suggestions as separate list items from the response array. If the backend supplies one string, normalize separators before display; do not concatenate strings without a delimiter. Use list spacing and semantic `<li>` elements.
- **Verify:** Multiple suggestions are visibly distinct and readable on desktop and mobile.

## Account and dashboard

### 9. Change Password button has no visible response
- **Where / reproduce:** Signed-in **Settings → Privacy & Security → CHANGE PASSWORD**. Clicking it leaves the page unchanged, with no dialog, form, navigation, or feedback.
- **Fix:** Wire the action to a password-change form or route with current/new/confirm fields and submission feedback. If password changes are unsupported for this account type, disable the action with an explanation rather than presenting a no-op button.
- **Verify:** Activating the control yields an accessible next step or an explicit reason it is unavailable.

### 10. Settings preference switches are visually invisible
- **Where / reproduce:** Email Notifications, Interview Reminders, and Public Profile rows expose switch controls in the page but their tracks/thumbs cannot be seen against the dark cards.
- **Fix:** Restore visible switch dimensions, track/thumb colors, and on/off contrast in both states; check clipping, opacity, and CSS layering. Give each row a visible state label if color alone would be ambiguous.
- **Verify:** All three switches and their states remain visible at 320px, 390px, and desktop widths without changing the settings.

### 11. Profile email is clipped and cannot be fully viewed
- **Where / reproduce:** The read-only EMAIL ADDRESS field shows only the address prefix; focusing it and pressing End does not reveal the remainder or domain.
- **Fix:** Display the full address in a wrapping, selectable text container or add an explicit copy/full-value affordance. Do not rely on horizontal scrolling inside a non-editable input that cannot expose its contents.
- **Verify:** A long test address can be fully read or copied at desktop and mobile widths.

### 12. Profile terminal-style header and command overflow at 320px
- **Where / reproduce:** On `/dashboard/profile` at 320×720, the panel header wraps awkwardly and the shell command extends beyond the card's right edge.
- **Fix:** Let the terminal header stack or wrap at narrow widths; set `min-width: 0` on flex children and allow long command text to wrap or scroll within the card, not past it.
- **Verify:** Header, badge, and full command are readable without page-level horizontal clipping.

### 13. Dashboard resume command wraps into a tiny mobile column
- **Where / reproduce:** On `/dashboard` at 390×844, the resume panel's terminal prompt consumes most of the row and the command breaks into short fragments on the right.
- **Fix:** Stack prompt and command at mobile widths, or let the command take a full-width row with sensible line breaks. Avoid competing fixed-width prompt and command columns.
- **Verify:** The full command reads in a natural sequence at 320px and 390px.

### 14. Resume upload badge misstates available slots
- **Where / reproduce:** An empty Resume account shows **STORAGE SLOTS: 0 / 2** and “No resumes stored yet,” while the upload panel says **0/2 SLOTS AVAILABLE**.
- **Fix:** If the badge means free capacity, compute `capacity - used` and show **2/2 slots available**. If it means usage, relabel it **0/2 slots used**. Use the same data source and terminology across the page.
- **Verify:** Empty, one-resume, and full-storage states display internally consistent counts.

## Responsive overlays and navigation

### 15. Floating help obscures a Profile company suggestion
- **Where / reproduce:** On `/dashboard/profile` at 320×720, scroll to Target Companies. The fixed Get help bubble covers the trailing content of the Apple suggestion chip.
- **Fix:** Reposition or collapse the help launcher at narrow widths, reserve bottom/right safe space for page controls, and allow chips to wrap away from the launcher. Check actual pointer hit targets, not just text visibility.
- **Verify:** Every suggestion remains visible and selectable while the help launcher is present.

### 16. Floating help obscures the Resume ATS audit action
- **Where / reproduce:** On `/dashboard/resume` at 390×844, scroll to Target Job Description Matcher; Get help overlaps the right end of **AUDIT ATS MATCH**.
- **Fix:** Add sufficient bottom/right padding to the matcher section or relocate the help launcher outside action bounds at mobile breakpoints.
- **Verify:** The full audit label and button hit area remain unobstructed throughout scrolling.

### 17. Floating help covers a Roadmap skill-chip remove control
- **Where / reproduce:** On `/dashboard/roadmap` at 320×720, the fixed help control sits over the remove affordance on the final focus-skill chip.
- **Fix:** Reserve a safe inset around the floating launcher, reposition it on narrow screens, or move chip controls to a layout that never falls beneath fixed overlays.
- **Verify:** Each skill can be removed without dismissing or moving the help bubble.

### 18. Floating help covers the History deep-dive link
- **Where / reproduce:** On `/dashboard/history` at 390×844, expand Suggestions on the completed interview card and scroll to its bottom; Get help covers the end of **Read Full Question-by-Question Deep Dive**.
- **Fix:** Give the card/link adequate trailing and bottom clearance, or relocate the launcher at mobile widths. Ensure the link's entire label and hit target remain available.
- **Verify:** The deep-dive link is fully visible and tappable with Suggestions expanded.

### 19. Notification popover is clipped at 320px
- **Where / reproduce:** On `/dashboard/billing` at 320×720, click the notification bell. The popover extends left of the viewport, truncating “Notifications” to “TIFICATIONS.”
- **Fix:** Constrain the popover width to the viewport minus margins, and clamp its horizontal anchor or use a mobile full-width sheet. Test its placement when the sidebar is expanded and collapsed.
- **Verify:** The whole popover and heading fit at 320px without horizontal scrolling.

### 20. Terms header links collide at 320px
- **Where / reproduce:** Open `/terms` at 320×780. PRIVACY crowds the INTERVIEWAI brand, and SIGN IN and its arrow wrap over multiple lines. Similar crowding was observed on `/privacy`.
- **Fix:** At narrow breakpoints, move legal links into a menu or a second row, reduce nonessential spacing, and give the brand and link groups defined wrap behavior. Do not allow the sign-in control to break in the middle of its label.
- **Verify:** Brand, Privacy, Terms, and Sign In remain distinct at 320px and 390px on both legal pages.

## Legal and referral navigation

### 21. Browser Back shows Privacy content at a Terms URL
- **Where / reproduce:** At 390×844, open `/terms`, select contents **08 — CONTACT**, follow footer **PRIVACY POLICY**, then use browser Back. The URL returns to `/terms#contact`, but the Privacy Policy heading and sections remain rendered.
- **Fix:** On `popstate`/history navigation, derive the rendered document from the current pathname and hash rather than stale component state. Ensure the legal page component remounts or updates when pathname changes; restore the Terms anchor after rendering the Terms document.
- **Verify:** URL, title, and visible document agree after Back/Forward across `/terms#contact` and `/privacy`.

### 22. Referral link has a doubled slash before `/ref`
- **Where / reproduce:** On `/dashboard/referrals`, the generated link visibly contains `.app//ref/<code>`.
- **Fix:** Build the link with a URL resolver (for example, `new URL('/ref/' + code, origin)`) or normalize the base URL and path before concatenation. Apply the same canonical value to displayed and copied links.
- **Verify:** Referral links show exactly one slash after the host and the copied URL opens the intended referral page.

---

**Retest priorities:** Mobile interview usability and result integrity first; account security action and legal URL/content mismatch next; then responsive overlays, copy, and formatting. A separate microphone-recording path and paid checkout were not exercised in this UI review.
