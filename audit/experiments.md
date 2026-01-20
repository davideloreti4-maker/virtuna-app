# Virtuna Experiment Plan

## Experiment Framework

### Prioritization Criteria
- **Impact:** Expected effect on North Star Metric (WAA)
- **Confidence:** How sure are we this will work?
- **Effort:** Engineering/design time required
- **ICE Score:** (Impact + Confidence + Ease) / 3

---

## High-Priority Experiments

### EXP-001: First-Time User Onboarding Modal
**Hypothesis:** Adding a guided onboarding modal for first-time users will increase first-analysis completion rate by 30%

| Metric | Current | Target |
|--------|---------|--------|
| Signup → First Analysis | ~40% (est) | 52% |

**Variant A (Control):** Current flow - user lands on dashboard with no guidance

**Variant B (Treatment):**
- Modal appears on first dashboard visit
- 3-step tour: "Welcome → Paste TikTok URL → Get your score"
- Skip option available
- Confetti/celebration on completion

**Implementation:**
1. Add `has_seen_onboarding` flag to user profile
2. Create OnboardingModal component
3. Show on dashboard when flag is false
4. Track: modal_shown, modal_completed, modal_skipped

**Effort:** Medium (3-5 days)
**ICE Score:** 8.3/10

---

### EXP-002: Sample Video Analysis
**Hypothesis:** Offering a "Try with sample video" option will increase first-analysis rate by 25% by reducing friction

| Metric | Current | Target |
|--------|---------|--------|
| Analyze page → Analysis started | ~60% (est) | 75% |

**Variant A (Control):** Current flow - user must have their own TikTok URL

**Variant B (Treatment):**
- Add "Try with a sample video" button below URL input
- Pre-loads a curated viral TikTok
- Shows full analysis flow
- CTA after: "Now analyze YOUR video"

**Implementation:**
1. Curate 3-5 sample videos
2. Add "Try Sample" button to /analyze
3. Track: sample_analysis_started, sample_analysis_completed, converted_to_own_video

**Effort:** Low (1-2 days)
**ICE Score:** 8.7/10

---

### EXP-003: Remove Analytics from Navigation
**Hypothesis:** Removing the broken "Analytics" page from nav will reduce user frustration and increase trust

| Metric | Current | Target |
|--------|---------|--------|
| Analytics page bounce rate | ~95% (est) | N/A |
| User trust score | Unknown | Improve |

**Variant A (Control):** Analytics link visible in sidebar

**Variant B (Treatment):**
- Remove Analytics from sidebar
- Add "Coming Soon" badge to a collapsed "Future Features" section
- Or replace with actual basic analytics

**Implementation:**
1. Update sidebar component
2. Optional: Build basic score trend chart from existing data

**Effort:** Low (1 day) or Medium (3-4 days with basic analytics)
**ICE Score:** 7.5/10

---

### EXP-004: Encouraging Empty State
**Hypothesis:** Changing dashboard empty state from showing "0" metrics to encouraging messaging will reduce new user churn by 20%

| Metric | Current | Target |
|--------|---------|--------|
| Day 1 retention | Unknown | +20% |

**Variant A (Control):** Shows "Viral Hits: 0", "Total Analyses: 0"

**Variant B (Treatment):**
- Hide metrics until user has 3+ analyses
- Show: "Ready to go viral? Analyze your first video to start tracking your journey"
- Prominent CTA to /analyze
- Progress indicator: "0/3 analyses to unlock your dashboard"

**Implementation:**
1. Conditional rendering based on analysis_count
2. New EmptyDashboard component
3. Track: empty_state_cta_clicked

**Effort:** Low (2 days)
**ICE Score:** 8.0/10

---

### EXP-005: Email Confirmation Bypass
**Hypothesis:** Allowing users to start with 1 free analysis before email confirmation will increase activation by 40%

| Metric | Current | Target |
|--------|---------|--------|
| Signup → First Analysis | ~40% (est) | 56% |
| Time to first analysis | ~10 min | <3 min |

**Variant A (Control):** Must confirm email before accessing app

**Variant B (Treatment):**
- Grant 1 "trial" analysis immediately after signup
- Block further features until email confirmed
- Show banner: "Confirm email to unlock full access"

**Implementation:**
1. Modify auth middleware to allow limited access
2. Add trial_analysis_used flag
3. Implement access gating
4. Track: trial_analysis_completed, email_confirmed_after_trial

**Effort:** High (5-7 days)
**ICE Score:** 7.8/10

---

## Medium-Priority Experiments

### EXP-006: Upgrade Prompt After Limit Hit
**Hypothesis:** Showing contextual upgrade modal when user hits free limit will increase conversion by 15%

**Variant A:** Current - user sees "1 analysis remaining" text
**Variant B:** Modal with plan comparison + limited-time discount

**ICE Score:** 7.0/10
**Effort:** Medium

---

### EXP-007: Analysis Result Sharing
**Hypothesis:** Adding social sharing for high scores (70+) will drive referral traffic

**Variant A:** No sharing
**Variant B:** "Share your score" button with OG image generation

**ICE Score:** 6.5/10
**Effort:** Medium

---

### EXP-008: Script Generator on Analyze Page
**Hypothesis:** Promoting script generator after analysis will increase feature discovery by 50%

**Variant A:** User must navigate to /scripts manually
**Variant B:** "Create a script for this niche" CTA on analysis results

**ICE Score:** 6.8/10
**Effort:** Low

---

### EXP-009: Streak Notifications
**Hypothesis:** Daily streak reminders will increase weekly retention by 25%

**Variant A:** No notifications
**Variant B:** Push/email notification: "Don't break your streak! Analyze a video today"

**ICE Score:** 6.5/10
**Effort:** Medium-High

---

### EXP-010: Competitor Suggestions
**Hypothesis:** Suggesting competitors based on niche will increase competitor feature adoption by 40%

**Variant A:** Empty state with "add competitor" only
**Variant B:** "Suggested competitors in your niche" auto-populated

**ICE Score:** 6.0/10
**Effort:** High

---

## Experiment Prioritization Matrix

| Experiment | Impact | Confidence | Ease | ICE Score | Priority |
|------------|--------|------------|------|-----------|----------|
| EXP-002: Sample Video | 9 | 8 | 9 | 8.7 | 1 |
| EXP-001: Onboarding Modal | 9 | 8 | 8 | 8.3 | 2 |
| EXP-004: Encouraging Empty State | 8 | 8 | 8 | 8.0 | 3 |
| EXP-005: Email Bypass | 9 | 8 | 6 | 7.8 | 4 |
| EXP-003: Remove Analytics | 6 | 9 | 8 | 7.5 | 5 |
| EXP-006: Upgrade Prompt | 8 | 7 | 6 | 7.0 | 6 |
| EXP-008: Script CTA | 7 | 7 | 8 | 6.8 | 7 |
| EXP-007: Sharing | 7 | 6 | 7 | 6.5 | 8 |
| EXP-009: Streak Notifs | 7 | 6 | 5 | 6.5 | 9 |
| EXP-010: Competitor Suggest | 6 | 6 | 5 | 6.0 | 10 |

---

## Recommended First Sprint

### Week 1-2: Quick Wins
1. **EXP-002:** Sample Video Analysis (1-2 days)
2. **EXP-004:** Encouraging Empty State (2 days)
3. **EXP-003:** Remove/Fix Analytics (1 day)
4. Fix critical bugs: ISS-001, ISS-002, ISS-003

### Week 3-4: Core Improvements
1. **EXP-001:** Onboarding Modal (3-5 days)
2. **EXP-008:** Script CTA integration (1 day)
3. Fix ISS-004 (TikTok metadata)

### Week 5-6: Growth Features
1. **EXP-005:** Email Confirmation Bypass (5-7 days)
2. **EXP-006:** Upgrade Prompt (3 days)
