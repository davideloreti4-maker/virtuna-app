You are running inside Claude Code with access to:
- The Virtuna repo (read/write)
- Claude Chrome (for real-user browsing on localhost)

Mission
Do a full, critical, page-by-page teardown of Virtuna to maximize trial → paid conversion by improving:
1) time-to-value, 2) perceived value, 3) trust, 4) clarity, 5) activation, 6) retention hooks.

Context (given)
- Environment: localhost (use Claude Chrome when needed)
- Repo access: yes
- Target user: aspiring TikTok creators
- Core workflow: viral scoring + analyzing/remixing videos
- Likely Aha moment: upload/paste a video → receive viral score + breakdown + generate hooks/scripts

Hard rules (no polite mode)
- Be skeptical: assume UX is wrong until proven.
- No generic praise. Every “good” needs explicit why + what metric would prove it.
- Every issue must include: evidence, user harm, severity (P0–P3), root-cause hypothesis, exact fix, and a test/metric.
- Prioritize ruthless value-delivery: anything not moving the user toward the Aha moment is suspect.

Frameworks you MUST use
1) Nielsen’s 10 usability heuristics as a checklist for each page/module. (visibility of system status, match to real world, user control/freedom, consistency, error prevention, recognition vs recall, flexibility/efficiency, minimalist design, error recovery, help/docs)  [Use this explicitly in your rubric.]
2) Fogg Behavior Model (Behavior = Motivation × Ability × Prompt) to diagnose why users do/don’t take key actions; categorize prompts as spark/facilitator/signal where relevant.
3) Activation/trial→paid measurement mindset: define activation event(s), time-to-value, onboarding completion, and trial-to-paid conversion instrumentation.

Before doing anything: create a task board
Maintain a living task board in your output and update it as you progress:
- [TODO]
- [DOING]
- [BLOCKED]
- [DONE]

Deliverables (write these files into /audit and also summarize in chat)
Create folder: /audit
Files required:
1) /audit/route-map.md
2) /audit/page-audits.md
3) /audit/issues-backlog.csv
4) /audit/experiments.md
5) /audit/analytics-spec.md
6) /audit/execution-backlog.md

Phase 0 — Get app running (BLOCK if impossible)
1) Detect package manager and runtime requirements.
2) Install deps.
3) Start localhost app.
4) Open Claude Chrome and confirm it renders.
If blocked, stop and list exactly what’s needed (env vars, commands, seed data, credentials).

Phase 1 — Inventory “every page” (Route Map)
Goal: enumerate every page/route including auth-only.
Repo-based discovery (do this first):
- If Next.js: inspect /app and/or /pages routes.
- Identify layouts, nav components, and conditional routes by role.
Runtime discovery:
- Use the running app + Chrome to navigate every reachable page.
Output /audit/route-map.md with columns:
Route | Page purpose | Primary CTA | Secondary CTAs | Requires auth? | Role | Notes (risks/ambiguity)

Phase 2 — Define the Aha moment & activation events (don’t assume)
Propose 2–3 candidate activation events for Virtuna and justify them.
Example candidates:
- A1: user completes first “viral score + breakdown” for a video
- A2: user generates at least 3 hooks/scripts from that analysis
- A3: user saves/exports/remixes and schedules a next action
For each candidate, define:
- event name
- properties (video_id, niche, score, time_to_result, etc.)
- why it predicts trial→paid
Write to /audit/analytics-spec.md

Phase 3 — Page-by-page teardown (repeat for each route)
For EVERY page in route-map, write a structured audit entry with:

A) Purpose & success criteria
- JTBD statement
- The ONE primary action that matters
- What “success in <3 minutes” should look like for a first-time user

B) Nielsen heuristic evaluation (mandatory)
Score each heuristic 0–2 (0 broken, 1 mixed, 2 good) with evidence.
List the top 3 heuristic failures and fixes.

C) UI & hierarchy
- Layout structure, spacing, typography, consistency
- Visual hierarchy correctness (what the eye sees first vs what should be first)
- Accessibility red flags (keyboard focus, labels, contrast, headings)

D) UX friction & flow breaks
- Time-to-value steps counted
- Where confusion happens (ambiguous labels, missing guidance, hidden requirements)
- Error states, empty states, loading states quality
- Mobile responsiveness sanity check

E) Value & “so what” (brutal)
For each major module/widget:
- Value score 0–10: what concrete user outcome it produces
- Actionability score 0–10: does it tell the user what to do next
- Trust score 0–10: does it feel credible (data sources, honesty, limitations)
If any score <7, propose an improved module spec (what changes, copy, interactions).

F) Behavioral psychology (Fogg MAP)
For each key action on the page:
- Motivation: what benefits are made vivid?
- Ability: what friction exists (time, complexity, uncertainty)?
- Prompt: where is the trigger and is it the right type (spark/facilitator/signal)?
Propose specific edits to raise Ability (reduce friction) and strengthen Prompt.

G) Product strategy & monetization ethics
- Is this page helping trial→paid or distracting?
- Where should paywalls/upsells be placed so they’re “value-backed”?
- Identify dark-pattern risk and trust killers.

H) Tests & metrics
- 2 usability test tasks for this page (task + what to observe)
- 1 A/B test hypothesis (change, expected outcome, success metric, guardrails)
- Event tracking needed

Write all page audits to /audit/page-audits.md

Phase 4 — Issues backlog (CSV)
As you audit, continuously add issues to /audit/issues-backlog.csv with columns:
ID, Page/Area, Problem, Evidence, User harm, Severity(P0-P3), Root cause hypothesis, Fix (specific), Effort(S/M/L), Expected impact, Test/Metric, Owner(Role)

Phase 5 — Experiment plan
Write /audit/experiments.md:
- 10 highest leverage experiments mapped to funnel stages:
  Landing → Signup → Onboarding → First analysis → Hook/script gen → Export/save → Upgrade
Each experiment must include: hypothesis, variant details, primary metric, guardrails, segment, and how long to run.

Phase 6 — Execution backlog with statuses
Write /audit/execution-backlog.md:
Format:
Epic | Task | Priority | Status(Todo/Doing/Blocked/Done) | Effort | Acceptance criteria | Metric
Rules:
- Convert every P0/P1 issue into a task.
- Acceptance criteria must be testable.
- Must include at least one metric tied to activation/time-to-value/trial→paid.

Stop conditions / blockers
If roles/credentials are required to access pages:
- Attempt guest flow first.
- Then inspect repo for auth seeding/dev login shortcuts.
- If still blocked, STOP and ask for credentials or a dev bypass.

Output in chat (strict order)
1) Task board (final state)
2) Key findings (top 10)
3) Aha moment proposal + activation events
4) Link-style list of created /audit files and what’s inside each
5) Top 15 backlog items (P0/P1 first) with clear next steps
