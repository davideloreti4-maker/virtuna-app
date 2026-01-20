# Virtuna Page-by-Page Audit

## Audit Legend
- **CTA Clarity:** Is the primary action obvious? (1-5)
- **Value Prop:** Does user understand benefit? (1-5)
- **Friction:** Barriers to completing action (1-5, lower=less friction)
- **Empty State:** Quality of zero-data state (1-5)

---

## 1. Dashboard (/)

### Screenshot Analysis
- Avg Viral Score: 69 "Good" with trend line
- 4 stat cards: Total Analyses (4), Viral Hits (0), Analyses Left (1/5), Success Rate (Building baseline)
- Weekly Trend chart
- Monthly Performance bar chart
- Score Distribution donut chart
- Quick Actions: New Analysis, View History

### Audit Scores
| Criteria | Score | Notes |
|----------|-------|-------|
| CTA Clarity | 4/5 | "New Analysis" in Quick Actions is clear but not prominent enough |
| Value Prop | 4/5 | Shows performance metrics well |
| Friction | 2/5 | Low friction, good layout |
| Empty State | 3/5 | Shows zeros everywhere for new users - discouraging |

### Issues Found
1. **CRITICAL:** "Analyses Left: 1 of 5" creates urgency/scarcity but may feel limiting
2. **MEDIUM:** "Viral Hits: 0" shown prominently - demotivating for new users
3. **MEDIUM:** "Success Rate: Building baseline..." - unclear what this means
4. **LOW:** No onboarding tooltip or guided tour for new users
5. **LOW:** Quick Actions section below fold on smaller screens

### Recommendations
- Add prominent "Analyze Your First Video" CTA for users with 0 analyses
- Hide "Viral Hits" card until user has 3+ analyses
- Add tooltip explaining "Success Rate" metric
- Consider onboarding modal for first-time visitors

---

## 2. Analyze Video (/analyze)

### Screenshot Analysis
- Clean single-purpose page
- TikTok URL input with placeholder
- Purple "Analyze Video" CTA button
- "What We Analyze" section explaining 5 factors
- "Upload Your Video" option at bottom

### Audit Scores
| Criteria | Score | Notes |
|----------|-------|-------|
| CTA Clarity | 5/5 | Single clear action - paste URL, click analyze |
| Value Prop | 5/5 | "What We Analyze" explains value clearly |
| Friction | 2/5 | Minimal - just paste and click |
| Empty State | N/A | Not applicable |

### Issues Found
1. **LOW:** Placeholder shows generic URL format - could show real example
2. **LOW:** No indication of what URL formats are accepted (vm.tiktok.com, shortened links)
3. **LOW:** "Upload Your Video" option less prominent than URL analysis

### Recommendations
- Add URL format hints (supports tiktok.com, vm.tiktok.com)
- Show example viral video that users can analyze for free
- Add loading state preview so users know what to expect

---

## 3. Upload Video (/analyze/upload)

### Screenshot Analysis
- Drag & drop zone with clear instructions
- Supports MP4, MOV, WebM (max 100MB)
- "What We Analyze" cards: Hook Strength, Visual Quality, Audio Analysis, Pacing
- Recent Uploads sidebar (empty/loading)

### Audit Scores
| Criteria | Score | Notes |
|----------|-------|-------|
| CTA Clarity | 4/5 | Drag & drop or click to browse is clear |
| Value Prop | 4/5 | Shows what AI analyzes |
| Friction | 3/5 | File size limit (100MB) may be restrictive |
| Empty State | 3/5 | "Recent Uploads" shows loading spinner |

### Issues Found
1. **MEDIUM:** 100MB limit may exclude longer/higher quality videos
2. **MEDIUM:** No progress indicator during upload
3. **LOW:** Recent Uploads sidebar was loading indefinitely

### Recommendations
- Show upload progress with percentage
- Clarify if 100MB is per-file or total storage
- Add video preview before analysis starts

---

## 4. Quick Analyze (/quick-analyze)

### Screenshot Analysis
- Niche input with suggestions
- Sub-niche optional field
- Popular Niches chips (12 options)
- Purple "Analyze Niche" CTA

### Audit Scores
| Criteria | Score | Notes |
|----------|-------|-------|
| CTA Clarity | 5/5 | Clear single action |
| Value Prop | 3/5 | Unclear what user gets from niche analysis |
| Friction | 2/5 | Very low - click chip and go |
| Empty State | N/A | Not applicable |

### Issues Found
1. **MEDIUM:** Unclear what "Analyze Niche" produces - trends? strategy? tips?
2. **LOW:** No preview of output format
3. **LOW:** "Sub-niche (optional)" purpose unclear

### Recommendations
- Add subtitle explaining output: "Get trending topics, sounds, and content ideas for your niche"
- Show sample output preview
- Consider combining with /analyze page as a tab

---

## 5. Library (/library)

### Screenshot Analysis
- Stats bar: Total (4), Viral (0), Avg Score (69), Saved Hooks (View)
- Filter tabs: All, Viral (80+), Recent
- Search bar
- Analysis list with: video ID, author, timestamp, H/T/A scores, overall score

### Audit Scores
| Criteria | Score | Notes |
|----------|-------|-------|
| CTA Clarity | 3/5 | No clear primary CTA - viewing/browsing focused |
| Value Prop | 4/5 | Good overview of analysis history |
| Friction | 2/5 | Easy to browse and filter |
| Empty State | 4/5 | Would show "Analyze your first video" CTA |

### Issues Found
1. **MEDIUM:** "@unknown" shown for all videos - metadata not loading
2. **MEDIUM:** "Saved Hooks" link goes to broken page
3. **LOW:** H/T/A column headers cut off on right side
4. **LOW:** No bulk actions (delete multiple, export)

### Recommendations
- Fix TikTok metadata fetching to show actual author names
- Fix /library/hooks endpoint
- Add column tooltips for H/T/A abbreviations
- Add export to CSV functionality

---

## 6. Analysis Detail (/library/[id])

### Screenshot Analysis
- Large viral score display (71) with "GOOD POTENTIAL" label
- Author info (@unknown) with engagement metrics (all 0)
- Score Breakdown: Hook 90, Trend 56, Audio 75, Timing 77, Hashtags 56
- AI Suggestions with actionable tips

### Audit Scores
| Criteria | Score | Notes |
|----------|-------|-------|
| CTA Clarity | 4/5 | "View on TikTok" and "Delete" actions clear |
| Value Prop | 5/5 | This IS the value - detailed analysis |
| Friction | 2/5 | Low - all info visible |
| Empty State | N/A | N/A |

### Issues Found
1. **CRITICAL:** @unknown and all engagement metrics showing 0 - API issue
2. **MEDIUM:** No "Analyze Another" CTA to continue momentum
3. **LOW:** No share functionality to share results
4. **LOW:** No comparison to previous analyses

### Recommendations
- Fix TikTok metadata API integration
- Add "Analyze Another Video" CTA at bottom
- Add social sharing for high scores (brag-worthy)
- Add "improvement since last analysis" comparison

---

## 7. Saved Hooks (/library/hooks)

### Screenshot Analysis
- Page title and category filters visible
- **ERROR:** "Failed to load hooks. Please try again."

### Audit Scores
| Criteria | Score | Notes |
|----------|-------|-------|
| CTA Clarity | N/A | Page broken |
| Value Prop | N/A | Cannot evaluate |
| Friction | 5/5 | Complete blocker - page doesn't work |
| Empty State | 1/5 | Shows error instead of empty state |

### Issues Found
1. **CRITICAL:** API endpoint failing - page completely broken
2. **CRITICAL:** No retry button or helpful error message

### Recommendations
- Fix /api/hooks endpoint
- Add proper error handling with retry button
- Show empty state when no hooks saved

---

## 8. Trending Sounds (/trends)

### Screenshot Analysis
- Search bar with category filters (Music, Dance, Comedy, etc.)
- Stats: 6 Rising Sounds, 12 Total Results, 98 Top Score
- Sound cards with: name, author, plays, videos, duration, tags, score, "Copy Name" CTA

### Audit Scores
| Criteria | Score | Notes |
|----------|-------|-------|
| CTA Clarity | 4/5 | "Copy Name" is clear action |
| Value Prop | 5/5 | Excellent trend discovery tool |
| Friction | 2/5 | Easy to browse and copy |
| Empty State | N/A | Has sample data |

### Issues Found
1. **LOW:** No audio preview - users can't hear the sound
2. **LOW:** "Copy Name" less useful than deep link to TikTok sound
3. **LOW:** No "Use in Script" integration

### Recommendations
- Add audio preview snippets
- Link directly to TikTok sound page
- Add "Generate Script with this Sound" integration

---

## 9. Script Generator (/scripts)

### Screenshot Analysis
- Niche/Category input with suggestion chips
- Topic/Subject input
- Content Style selector: Educational, Entertaining, Promotional, Storytelling, Tutorial
- Video Duration: Short (15s), Medium (30s), Long (60s)
- Advanced Options expandable
- Purple "Generate Script" CTA

### Audit Scores
| Criteria | Score | Notes |
|----------|-------|-------|
| CTA Clarity | 5/5 | Single clear action |
| Value Prop | 4/5 | Good but could show output preview |
| Friction | 3/5 | Many inputs before generation |
| Empty State | N/A | N/A |

### Issues Found
1. **MEDIUM:** No preview of what generated script looks like
2. **LOW:** Niche chips don't auto-fill the input when clicked (UX expectation)
3. **LOW:** No history of previously generated scripts

### Recommendations
- Show sample generated script below the form
- Auto-fill input when niche chip clicked
- Add "My Scripts" history section

---

## 10. Content Calendar (/calendar)

### Screenshot Analysis
- Monthly calendar view (January 2026)
- "Add Content" CTA button
- Stats footer: 0 Drafts, 0 Scheduled, 0 Published, 0 Total

### Audit Scores
| Criteria | Score | Notes |
|----------|-------|-------|
| CTA Clarity | 4/5 | "Add Content" clear |
| Value Prop | 3/5 | Value unclear until populated |
| Friction | 3/5 | Clicking to add on specific day not obvious |
| Empty State | 3/5 | Empty calendar is boring but functional |

### Issues Found
1. **MEDIUM:** No integration with analysis results
2. **LOW:** Clicking on day doesn't open "Add Content" modal
3. **LOW:** No posting time recommendations

### Recommendations
- Connect to analysis: "Schedule content based on Timing Score"
- Add click-to-add on calendar days
- Add best posting time suggestions

---

## 11. Competitor Tracking (/competitors)

### Screenshot Analysis
- Stats bar: 0 Tracked, 0 Avg Followers, 0% Avg Engagement, 0 Total Videos
- Search input
- Empty state: "No competitors tracked yet" with "Add Your First Competitor" CTA

### Audit Scores
| Criteria | Score | Notes |
|----------|-------|-------|
| CTA Clarity | 5/5 | Clear "Add Your First Competitor" CTA |
| Value Prop | 3/5 | Unclear what tracking provides |
| Friction | 3/5 | Need to know competitor usernames |
| Empty State | 4/5 | Good empty state with clear CTA |

### Issues Found
1. **MEDIUM:** No explanation of what competitor tracking shows
2. **LOW:** No discovery/suggestion of competitors in your niche

### Recommendations
- Add "What you'll see" preview in empty state
- Suggest competitors based on user's niche

---

## 12. Analytics (/analytics)

### Screenshot Analysis
- "Advanced Analytics Coming Soon" placeholder
- Feature preview cards: Score Trends, Score Breakdown, Goal Tracking, Comparisons
- "Notify Me When Available" CTA

### Audit Scores
| Criteria | Score | Notes |
|----------|-------|-------|
| CTA Clarity | 3/5 | "Notify Me" is secondary value |
| Value Prop | 2/5 | Promise without delivery |
| Friction | N/A | Nothing to do |
| Empty State | 2/5 | Coming Soon page is a dead end |

### Issues Found
1. **CRITICAL:** Dead-end page with no value - broken promise
2. **MEDIUM:** "Notify Me" button likely non-functional
3. **HIGH:** Should not be in main navigation if not ready

### Recommendations
- Remove from navigation until built
- Or show actual data from existing analyses (basic charts)
- Make "Notify Me" functional with email capture

---

## 13. Leaderboard (/leaderboard)

### Screenshot Analysis
- Tabs: XP Leaders, Streak Kings, Most Active, Viral Masters
- Table header: Rank, Creator, Level, XP
- **ERROR:** "Failed to load leaderboard"
- Sidebar: "Your Stats" shows "Log in to see your stats" (incorrect - user IS logged in)
- "How to Climb" tips visible

### Audit Scores
| Criteria | Score | Notes |
|----------|-------|-------|
| CTA Clarity | N/A | Page broken |
| Value Prop | N/A | Cannot evaluate |
| Friction | 5/5 | Complete blocker |
| Empty State | 1/5 | Error state, wrong auth message |

### Issues Found
1. **CRITICAL:** API endpoint failing
2. **CRITICAL:** "Log in to see your stats" shown to logged-in user
3. **MEDIUM:** No explanation of XP system

### Recommendations
- Fix /api/leaderboard endpoint
- Fix auth state detection in sidebar
- Add XP explainer modal

---

## 14. Settings (/settings)

### Screenshot Analysis
- User profile card with avatar initials
- Plan status: "Free Plan - 1 of 5 analyses remaining" with usage bar
- "Upgrade to Pro" prominent CTA
- Account section: Profile, Billing, Notifications
- Support section: Privacy Policy, Help Center
- Sign Out button

### Audit Scores
| Criteria | Score | Notes |
|----------|-------|-------|
| CTA Clarity | 5/5 | "Upgrade to Pro" is crystal clear |
| Value Prop | 4/5 | Clear plan limitations shown |
| Friction | 2/5 | Easy navigation |
| Empty State | N/A | N/A |

### Issues Found
1. **LOW:** Billing/Notifications/Privacy/Help links may be non-functional
2. **LOW:** No plan comparison shown inline

### Recommendations
- Ensure all settings links work
- Add mini plan comparison on upgrade section
- Add referral/invite friends option

---

## Summary: Critical Issues

| Page | Critical Issues |
|------|-----------------|
| /library/hooks | API broken - page doesn't load |
| /leaderboard | API broken + wrong auth state |
| /analytics | Dead-end "Coming Soon" page |
| /library/[id] | TikTok metadata not loading (all @unknown) |
| / (Dashboard) | Demotivating for new users (shows zeros) |
