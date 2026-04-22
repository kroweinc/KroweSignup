# Krowe — Pass 3/3: Surfaces, Voice, Deliverables

**Krowe**: AI business-validation platform. ~10-step signup → report (market, competitors, MVP cost, resources, verdict). Post-signup: left-sidebar platform.

**Voice**: senior friend who's built three companies — plainspoken, warm, honest, editorial. Never "supercharge/unleash." Say "Let's see if this holds up."

**Feel**: sunrise on the day someone starts a business. NYT business section × advisor's notebook. NOT cold gray, blue SaaS, cutesy, gradient-everywhere, Tailwind starter.

**Colors (LOCKED)**: `--primary` `#f97316` (hover mix 88% black, soft mix 12% white), `--primary-accent` `#ff6a4d`; `--background` `oklch(99% 0.003 60)`, `--surface-subtle` `oklch(98% 0.005 60)`, `--foreground` `oklch(20% 0.01 60)`, `--muted` `oklch(50% 0.01 60)`, `--border` `oklch(92% 0.005 60)`; Success `#15803d` / Warning `#b45309` / Danger `#b91c1c`. **One orange per screen**: active nav, primary CTA, data-viz primary, progress pulse only.

**Type**: Geist Sans (UI), Instrument Serif (display/titles/report headers/verdicts), Geist Mono (numeric).

**Motion**: `cubic-bezier(0.16, 1, 0.3, 1)`; 100/180/280/500/850ms; 85ms stagger.

**Motifs**: ember glyph (12–16px golden-spiral dot); blueprint grid on canvas only; sunrise gradient on landing hero + post-signup transition only.

---

## This pass: surfaces + voice + deliverables (use Pass 1 tokens + Pass 2 components)

### 1. Landing (`/`)
Hero: Instrument Serif headline *"Your idea deserves a real gut-check."* on ambient warm sunrise gradient (never a hard wash). One primary CTA "Start validating." Below fold: three annotated report screenshots (market donut, competitor 2×2, verdict card) with advisor-voice captions. Minimal footer. NO stock illustration, NO gradient buttons, NO "supercharge" language.

### 2. Auth
Centered 420px card. Wordmark + ember top. Editorial line: *"Welcome back — let's see where your ideas stand."* Google OAuth above divider, email form below. Warm tone, NOT stock starter-kit.

### 3. Signup flow — three layout variants, shared header/footer

**A. Open reflection** (Idea, Problem, Target Customer): single large textarea, generous whitespace, faded icon watermark + blueprint grid bg, advisor-voice hint in the margin (NOT a boxed "Examples"), subtle character count.

**B. Pick a card** (Product Type, Pricing Model): 2–3 large selection cards with small custom illustrations. Not cramped. Only one orange moment: the selected card.

**C. Quick input** (Age, Team Size, Hours): compact centered layout. Input styled to content (stepper for numeric).

All share: logo + designed progress indicator header, button system footer.

### 4. Signup → platform transition
One continuous 1.5–2s moment: final step submits → signup chrome dissolves → sidebar slides in from left → first report renders in main canvas as user's first Idea → brief editorial title: *"Your first read."*

### 5. Dashboard (Home)
Sidebar always visible. Canvas with blueprint-grid bg. Header: "Home" in Instrument Serif + primary CTA "Start a new idea." Most recent idea as large card (verdict + last updated). Grid of other ideas below. "Suggested next steps from Krowe" at bottom.

### 6. Report page
Inside sidebar shell. Verdict card at top. Four data-viz sections in 2-col desktop / stacked mobile. Each: chart + plain-English takeaway + expandable "learn more." Bottom: "Ask Krowe a follow-up" input. PDF export in header.

### 7. Ideas list
Table: title, verdict badge, last updated, actions. Filter chips top. Empty: *"No ideas yet. What are you thinking about?"* with inline input.

## Voice & microcopy

Replace throughout: "Continue" → "Next question" or content-specific; "Submit" → "Generate my report"; "Something went wrong" → "Hmm, let's look at this again"; "No data" → conversational prompts; "Auto-saved" → "Saved"; "Sign in with Email" → "Sign in"; "Get Started" → "Start validating."

Errors use advisor voice: *"The URL didn't load — try pasting it again, or skip and fill in manually."*

## Accessibility
- Visible focus: 4px orange ring at 10% opacity minimum
- Color-coded signals always paired with text label or icon — never color alone
- ARIA landmarks: `role="main"` canvas, `role="navigation"` sidebar, `role="banner"` header
- Progress: `aria-valuenow/valuemax/label`. Icon-only buttons: `aria-label`
- Contrast WCAG AA minimum, AAA for body

## Responsive
- Sidebar → mobile drawer below md
- Signup cards → single column below md; touch targets ≥ 44px
- Report grid: 2-col → single → stacked
- Type scales one step down on mobile
- Padding `px-8 py-6` desktop → `px-4 py-4` mobile

## Deliverables
Seven surfaces as interactive prototypes (Pass 1 tokens + Pass 2 components) + exportable React components (Tailwind 4, Next.js 16) + voice & motif do/don't reference.

Every surface should feel like it came from one studio — warm, editorial, confident, restrained. If anything could appear in a ChatGPT clone or generic SaaS starter, redesign it.
