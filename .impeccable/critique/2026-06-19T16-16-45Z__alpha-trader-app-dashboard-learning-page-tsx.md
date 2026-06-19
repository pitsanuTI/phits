---
timestamp: 2026-06-19T16-16-45Z
slug: alpha-trader-app-dashboard-learning-page-tsx
---
### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Toast feedback exists; no loading states, no card-grid empty state |
| 2 | Match System / Real World | 3 | Thai/English mix works; stage labels map naturally to learning cycles |
| 3 | User Control and Freedom | 2 | Delete has confirm modal; no undo after delete; no autosave warning on edit |
| 4 | Consistency and Standards | 3 | Consistent purple brand language; 9-tab bar and uppercase-eyebrow repeat undercut coherence |
| 5 | Error Prevention | 2 | Delete confirm exists; clipboard paste fails silently; no guard on navigating away mid-edit |
| 6 | Recognition Rather Than Recall | 2 | Stage labels good; card action buttons hover-only; logo upload entry point invisible |
| 7 | Flexibility and Efficiency | 1 | No keyboard shortcuts; no bulk card operations; no quick-capture shortcut |
| 8 | Aesthetic and Minimalist Design | 2 | Gradient density very high; same vivid-card KPI template on every tab; ambient-orb animation on daily-use banner |
| 9 | Error Recovery | 2 | Toast with suggestion on clipboard fail; deleted cards gone permanently |
| 10 | Help and Documentation | 1 | No onboarding for spaced-repetition; no tooltip for Clarity Score; no help access |
| **Total** | | **20/40** | **Acceptable — at the bottom of the range** |

### Anti-Patterns Verdict

**LLM assessment**: Not immediately AI at the micro level — Image First card is well-crafted, stage system is principled. Macro-level tells: every tab opens with the same vivid-card KPI row, every section wears the same font-black uppercase eyebrow, and the Due for Review banner layers blurred orbs + pulsing glow + stagger animation for a feature seen every morning.

**Deterministic scan (73 findings):**
- ai-color-palette: 50 — mostly false positives (purple is intentional brand primary), but density of 50 gradient declarations flattens hierarchy
- gray-on-color: 20 — real contrast issues; gray-500 on emerald-500 and gray-400 on amber-400 are WCAG AA failures
- side-tab: 2 — border-l-4 on understanding notes panel (line 4405) is the real AI side-stripe; blockquote border-left (line 270) is acceptable
- broken-image: 1 — false positive, comment text parsed as element

### Overall Impression

Genuine craft at the micro level; macro level tries to be comprehensive and ends up showing off. The single biggest opportunity: audit what belongs on the primary Overall view vs. secondary lookup, and fix the contrast violations.

### What's Working

1. **Image First card layout.** aspect-video image top, frosted hover-buttons, embedded image-position adjuster — genuinely premium. Gradient fallback with glassmorphic emoji is strong.
2. **Spaced repetition with reviewable content.** Due for Review chip expansion showing learning notes with เข้าใจแล้ว/ต้องเรียนซ้ำ actions is a real product insight, correctly implemented.
3. **Stage progress system.** Read → Recap → Apply → Review with computed percentages (30/25/25/20) is a principled learning model.

### Priority Issues

**[P1] Gray text on colored backgrounds — 20 confirmed instances**
- text-gray-500 on bg-emerald-500 (lines 2365, 2439) ~1.3:1 ratio. text-gray-400 on bg-amber-400 (line 2427) ~1.7:1 ratio. Both are WCAG AA failures.
- Fix: Use hue-matched dark text. text-emerald-800 on emerald-500, text-amber-900 on amber-400, text-violet-700 on violet-50.
- Suggested command: $impeccable audit learning page

**[P1] 9 tabs exceeds working memory**
- Overall | Skill Roadmap | Courses | Course Builder | Practice Lab | Resource Inbox | Schedule Planner | Exams & Certificates | Review & Portfolio
- Fix: Group into primary bar (4-5 tabs) + secondary More dropdown.
- Suggested command: $impeccable layout learning page

**[P1] Identical vivid-card KPI template on every tab**
- Same 5-6 gradient tile row (big number, gradient bg, sparkle dots) repeated across ~5 different tabs.
- Fix: Each tab's KPI row needs an architecturally distinct treatment matched to the tab's content.
- Suggested command: $impeccable distill learning page

**[P2] Uppercase-tracked eyebrows on every section**
- text-[10px] font-black uppercase tracking-wide on STATUS, NEXT REVIEW, NOTES, Reading Progress, ACTIVITY, QUOTES, LINES inside every colored section block.
- Fix: Reserve for 1-2 genuine primary categories; use normal-weight 11-12px labels for sub-labels.
- Suggested command: $impeccable typeset learning page

**[P2] Due for Review banner animation too heavy for daily use**
- blur-3xl ambient orbs x2, pulsing glow on icon, Framer Motion chip stagger, 3-stop gradient.
- Fix: One purposeful chip entrance animation. Remove ambient orbs. Static accent ring instead of pulsing glow.
- Suggested command: $impeccable animate learning page

**[P3] Logo upload has no persistent affordance**
- Camera icon visible only on hover over 28px circle — feature is undiscoverable.
- Fix: Add permanent ring + small camera badge in corner.
- Suggested command: $impeccable polish learning cards

### Persona Red Flags

**Alex (Power User — the primary user):** No keyboard shortcuts for any action. 9 tabs requires scanning each time. Quick-capture has no keyboard trigger.

**Sam (Accessibility):** text-gray-400 on bg-amber-400 is ~1.7:1 (WCAG needs 4.5:1). text-gray-500 on bg-emerald-500 is ~1.3:1. Both catastrophic. Hover-only card buttons invisible to keyboard users. Rich text editor has no ARIA role or announced formatting state.

**Riley (Stress Tester):** Empty card grid has no empty state or CTA. Broken external image URL shows broken-image box instead of gradient fallback. Clipboard paste shows toast but no retry path.

### Minor Observations

- document.execCommand() in RichTextEditor is deprecated — plan migration to Tiptap or similar
- rounded-3xl on cards (line 1041) is at the 32px over-rounded threshold — consider rounded-2xl
- from-violet-100 to-purple-100 on Focus Recommendation cards does no work vs flat bg-violet-50
- KPI subtitle delta text same size as body — consider weight differentiation
