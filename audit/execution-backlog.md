# Virtuna Execution Backlog

## Sprint Planning

### Sprint 1: Critical Fixes (Week 1)
**Goal:** Fix all broken features and critical bugs

| Task ID | Type | Title | Effort | Assignee |
|---------|------|-------|--------|----------|
| EXEC-001 | Bug Fix | Fix /api/hooks endpoint - Saved Hooks page broken | 4h | Backend |
| EXEC-002 | Bug Fix | Fix /api/leaderboard endpoint - page not loading | 4h | Backend |
| EXEC-003 | Bug Fix | Fix auth state detection in Leaderboard sidebar | 2h | Frontend |
| EXEC-004 | Bug Fix | Fix TikTok metadata fetching - showing @unknown | 8h | Backend |
| EXEC-005 | UX | Remove Analytics from main nav (or hide behind flag) | 1h | Frontend |

**Sprint 1 Total:** ~19 hours

**Acceptance Criteria:**
- [ ] /library/hooks loads without errors
- [ ] /leaderboard loads and shows data (even if empty)
- [ ] Leaderboard sidebar shows logged-in user's stats
- [ ] Analysis detail pages show actual TikTok author names
- [ ] Analytics not visible in navigation (or shows basic data)

---

### Sprint 2: Activation Quick Wins (Week 2)
**Goal:** Implement highest-impact, lowest-effort activation improvements

| Task ID | Type | Title | Effort | Assignee |
|---------|------|-------|--------|----------|
| EXEC-006 | Feature | Add "Try Sample Video" button on /analyze | 4h | Frontend |
| EXEC-007 | Feature | Curate 3-5 sample TikTok videos for demo | 2h | Product |
| EXEC-008 | UX | Create encouraging empty state for Dashboard | 6h | Frontend |
| EXEC-009 | UX | Hide "Viral Hits: 0" card for users with <3 analyses | 2h | Frontend |
| EXEC-010 | UX | Add "Analyze Your First Video" CTA to empty dashboard | 2h | Frontend |

**Sprint 2 Total:** ~16 hours

**Acceptance Criteria:**
- [ ] /analyze shows "Try with sample video" option
- [ ] Sample video analysis works end-to-end
- [ ] New users see encouraging message instead of zeros
- [ ] Clear path to first analysis from empty dashboard

---

### Sprint 3: Onboarding Flow (Week 3)
**Goal:** Guide new users to their first analysis

| Task ID | Type | Title | Effort | Assignee |
|---------|------|-------|--------|----------|
| EXEC-011 | Feature | Create OnboardingModal component | 8h | Frontend |
| EXEC-012 | Backend | Add has_seen_onboarding flag to user profile | 2h | Backend |
| EXEC-013 | Feature | Implement 3-step onboarding tour | 6h | Frontend |
| EXEC-014 | Feature | Add confetti celebration on first analysis | 2h | Frontend |
| EXEC-015 | Analytics | Track onboarding events (shown, completed, skipped) | 3h | Full Stack |

**Sprint 3 Total:** ~21 hours

**Acceptance Criteria:**
- [ ] New users see onboarding modal on first visit
- [ ] Modal can be skipped
- [ ] Modal completion tracked in analytics
- [ ] Celebration shown after first analysis

---

### Sprint 4: Analysis Improvements (Week 4)
**Goal:** Improve the core analysis experience

| Task ID | Type | Title | Effort | Assignee |
|---------|------|-------|--------|----------|
| EXEC-016 | UX | Add URL format hints to /analyze input | 1h | Frontend |
| EXEC-017 | UX | Add "Analyze Another Video" CTA to analysis detail | 2h | Frontend |
| EXEC-018 | Feature | Add share button for scores 70+ | 6h | Frontend |
| EXEC-019 | Feature | Generate OG image for shared analyses | 8h | Backend |
| EXEC-020 | UX | Add script generator CTA on analysis results | 3h | Frontend |

**Sprint 4 Total:** ~20 hours

**Acceptance Criteria:**
- [ ] URL input shows accepted format examples
- [ ] Easy path to next analysis after viewing results
- [ ] High scores can be shared to social media
- [ ] Users prompted to create script based on analysis

---

### Sprint 5: Secondary Features (Week 5)
**Goal:** Improve supporting features

| Task ID | Type | Title | Effort | Assignee |
|---------|------|-------|--------|----------|
| EXEC-021 | UX | Add Quick Analyze output preview | 4h | Frontend |
| EXEC-022 | Feature | Add upload progress bar to video upload | 4h | Frontend |
| EXEC-023 | Feature | Add audio preview to trending sounds | 8h | Full Stack |
| EXEC-024 | UX | Make calendar days clickable to add events | 3h | Frontend |
| EXEC-025 | Feature | Add "My Scripts" history section | 6h | Full Stack |

**Sprint 5 Total:** ~25 hours

---

### Sprint 6: Conversion Optimization (Week 6)
**Goal:** Improve free-to-paid conversion

| Task ID | Type | Title | Effort | Assignee |
|---------|------|-------|--------|----------|
| EXEC-026 | Feature | Create upgrade modal for limit-hit users | 6h | Frontend |
| EXEC-027 | Feature | Add plan comparison to upgrade flow | 4h | Frontend |
| EXEC-028 | Feature | Implement limited-time upgrade discount | 6h | Full Stack |
| EXEC-029 | Analytics | Track upgrade funnel events | 3h | Full Stack |
| EXEC-030 | UX | Add inline upgrade prompts in Settings | 2h | Frontend |

**Sprint 6 Total:** ~21 hours

---

## Priority Matrix

### P0 - Do First (Blocking Issues)
- EXEC-001: Fix /api/hooks
- EXEC-002: Fix /api/leaderboard
- EXEC-003: Fix auth state
- EXEC-004: Fix TikTok metadata
- EXEC-005: Remove broken Analytics

### P1 - Do Soon (High Impact)
- EXEC-006: Sample video analysis
- EXEC-008: Encouraging empty state
- EXEC-011: Onboarding modal
- EXEC-018: Social sharing

### P2 - Do Later (Medium Impact)
- EXEC-016: URL hints
- EXEC-020: Script CTA
- EXEC-023: Audio preview
- EXEC-025: Script history

### P3 - Nice to Have
- EXEC-024: Calendar click
- EXEC-019: OG images
- EXEC-028: Discount system

---

## Dependency Graph

```
EXEC-001 (Fix Hooks API)
    └── No dependencies

EXEC-002 (Fix Leaderboard API)
    └── No dependencies

EXEC-004 (Fix TikTok Metadata)
    └── No dependencies

EXEC-006 (Sample Video)
    └── EXEC-007 (Curate samples)

EXEC-011 (Onboarding Modal)
    └── EXEC-012 (User flag)
    └── EXEC-008 (Empty state) - recommended before

EXEC-018 (Share button)
    └── EXEC-019 (OG images) - can be added later

EXEC-026 (Upgrade modal)
    └── EXEC-027 (Plan comparison)
```

---

## Success Metrics by Sprint

| Sprint | Primary Metric | Target |
|--------|---------------|--------|
| Sprint 1 | Error rate | 0% on fixed pages |
| Sprint 2 | First analysis rate | +20% |
| Sprint 3 | Signup → First analysis | +30% |
| Sprint 4 | Analyses per user | +15% |
| Sprint 5 | Feature adoption | +25% |
| Sprint 6 | Free → Pro conversion | +10% |

---

## Technical Notes

### Database Changes Needed
- Add `has_seen_onboarding: boolean` to users table
- Add `trial_analysis_used: boolean` if implementing email bypass

### API Endpoints to Fix/Create
- `GET /api/hooks` - Fix 500 error
- `GET /api/leaderboard` - Fix 500 error
- `GET /api/tiktok/metadata` - Fix or implement fallback
- `POST /api/share/og-image` - Generate shareable images

### Third-Party Integrations
- TikTok API: Review rate limits and fallback strategy
- Analytics: Implement event tracking (Mixpanel/PostHog recommended)
- Email: May need for streak notifications (future)

---

## Definition of Done

Each task is complete when:
1. Code is written and tested locally
2. PR created with description
3. Code review passed
4. Tests pass (if applicable)
5. Deployed to staging
6. QA verified
7. Analytics events firing (if applicable)
8. Deployed to production
9. Monitoring confirmed
