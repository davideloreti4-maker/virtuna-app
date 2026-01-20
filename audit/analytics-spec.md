# Virtuna Analytics Specification

## Aha Moment Definition

### Primary Aha Moment
**"The moment a user sees their first viral score with actionable AI suggestions"**

**Trigger:** User completes their first video analysis and sees:
1. A viral score (0-100) with clear rating (Good/Viral Potential/Needs Work)
2. Score breakdown by category (Hook, Trend, Audio, Timing, Hashtags)
3. Personalized AI suggestions for improvement

**Why this is the Aha Moment:**
- Delivers immediate, tangible value
- Shows the product "working" - AI analyzing their specific content
- Provides actionable next steps (not just a score, but HOW to improve)
- Creates emotional response (validation or motivation to improve)

### Secondary Aha Moments
1. **First Viral Hit (80+ score):** User achieves validation that their content has viral potential
2. **Script Generated:** User gets a complete video script they can use immediately
3. **Trend Discovery:** User finds a trending sound perfect for their niche

---

## Activation Events

### Critical Path Events (Must Track)

| Event Name | Trigger | Properties | Priority |
|------------|---------|------------|----------|
| `user_signed_up` | Account created | source, referrer | P0 |
| `user_logged_in` | Successful login | method (email/social) | P0 |
| `analysis_started` | User clicks "Analyze Video" | input_type (url/upload) | P0 |
| `analysis_completed` | Analysis results displayed | score, video_id, processing_time | P0 |
| `first_analysis_completed` | First ever analysis for user | score, days_since_signup | P0 |
| `viral_hit_achieved` | Score >= 80 | score, video_id | P0 |
| `upgrade_initiated` | User clicks upgrade CTA | plan, source_page | P0 |
| `upgrade_completed` | Payment successful | plan, billing_cycle, revenue | P0 |

### Engagement Events (Should Track)

| Event Name | Trigger | Properties | Priority |
|------------|---------|------------|----------|
| `script_generated` | Script generation complete | niche, style, duration | P1 |
| `trend_copied` | User copies trend name | trend_id, trend_score | P1 |
| `hook_saved` | User saves a hook | hook_id, category | P1 |
| `suggestion_viewed` | User expands AI suggestion | suggestion_type, score_context | P1 |
| `library_viewed` | User visits library | analysis_count | P1 |
| `analysis_detail_viewed` | User views full analysis | analysis_id, score | P1 |
| `competitor_added` | User adds competitor | competitor_username | P1 |
| `calendar_event_created` | User schedules content | content_type, scheduled_date | P1 |
| `quick_analyze_completed` | Niche analysis done | niche, sub_niche | P1 |

### Feature Discovery Events (Nice to Track)

| Event Name | Trigger | Properties | Priority |
|------------|---------|------------|----------|
| `page_viewed` | Any page load | page_name, referrer | P2 |
| `feature_discovered` | First visit to feature page | feature_name | P2 |
| `empty_state_cta_clicked` | Click on empty state CTA | page, cta_type | P2 |
| `error_encountered` | Any error shown to user | error_type, page | P2 |
| `session_started` | New session begins | days_since_last_session | P2 |

---

## Activation Funnel

### Primary Funnel: Signup → First Analysis

```
Step 1: Landing/Signup Page Visit
    ↓ (Target: 30% conversion)
Step 2: Account Created
    ↓ (Target: 80% - email confirmed)
Step 3: Email Confirmed & Logged In
    ↓ (Target: 70% same-session)
Step 4: First Analysis Started
    ↓ (Target: 95% completion)
Step 5: First Analysis Completed (AHA MOMENT)
    ↓ (Target: 40% return within 7 days)
Step 6: Second Analysis (Habit Formation)
```

### Activation Definition
**User is "Activated" when they have:**
1. Completed at least 1 analysis AND
2. Returned to the app within 7 days AND
3. Completed at least 2 total analyses

### Time to Value (TTV) Target
- **Optimal TTV:** < 5 minutes from signup to first analysis completion
- **Current Estimated TTV:** ~10-15 minutes (due to email confirmation)

---

## Key Metrics to Track

### North Star Metric
**Weekly Active Analyzers (WAA):** Users who complete at least 1 analysis per week

### Supporting Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| Signup → First Analysis Rate | % of signups completing 1 analysis | >60% |
| Time to First Analysis | Median time from signup to first analysis | <10 min |
| Analysis Completion Rate | Started vs Completed analyses | >95% |
| Viral Hit Rate | % of analyses scoring 80+ | 15-20% |
| Weekly Retention | % returning within 7 days | >40% |
| Free → Pro Conversion | % of free users upgrading | >5% |
| Analyses per User (Weekly) | Avg analyses per active user | >3 |

---

## Cohort Definitions

### By Activation Status
- **New:** Signed up, no analyses
- **Activated:** 1+ analyses, returned within 7 days
- **Power User:** 5+ analyses per week
- **At Risk:** No activity in 14+ days
- **Churned:** No activity in 30+ days

### By Plan
- **Free:** 5 analyses/month limit
- **Pro:** Unlimited analyses
- **Agency:** Team features

---

## Event Implementation Priority

### Phase 1 (MVP Analytics)
1. `user_signed_up`
2. `analysis_started`
3. `analysis_completed`
4. `first_analysis_completed`
5. `upgrade_initiated`
6. `page_viewed`

### Phase 2 (Growth Analytics)
1. `script_generated`
2. `trend_copied`
3. `viral_hit_achieved`
4. `suggestion_viewed`
5. All engagement events

### Phase 3 (Optimization)
1. A/B test events
2. Feature flag events
3. Performance metrics
4. Error tracking

---

## Recommended Analytics Stack

### Option A: Product Analytics Focus
- **Mixpanel** or **Amplitude** for event tracking
- **Segment** for data routing (optional)
- **Hotjar** for session recordings

### Option B: Full-Stack (Budget)
- **PostHog** (open-source, self-hosted option)
- Includes analytics, session replay, feature flags

### Option C: Simple Start
- **Google Analytics 4** for basics
- Custom events via `gtag()`
- Graduate to Mixpanel when needed
