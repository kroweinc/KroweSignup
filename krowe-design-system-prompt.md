# Krowe Design System — Figma Make Prompt

Generate a complete design system and prototype surfaces for **Krowe**, an AI business-validation platform. Follow every section below carefully. The output should feel like it came from a single studio — warm, editorial, confident, restrained. Users should never mistake a Krowe surface for ChatGPT, Linear, Notion, or a Tailwind starter kit.

---

## About Krowe

Krowe is an AI business-validation platform. Entrepreneurs describe their idea across ~10 guided signup steps and receive a full report: market size (TAM/SAM/SOM), competitor analysis, MVP cost breakdown, required resources, and a verdict (Proceed / Refine / Pivot / Rethink). Post-signup, users return to a platform with a persistent left sidebar to manage multiple ideas, reports, and resources.

## Brand voice

The senior friend who's already built three companies and now wants to help you stress-test yours. Plainspoken, warm, honest, a little editorial. Not hype-y, not corporate, not cutesy. "Let's see if this holds up" — never "Supercharge your entrepreneurial journey." Every piece of UI copy should sound like advice from someone who believes in you but won't let you fool yourself.

## Emotional target

The sunrise on the day someone decides to start their business. Warm, ambitious, calm. Think *New York Times* business section meets a trusted advisor's leather notebook — not another AI SaaS dashboard.

## What Krowe is NOT

- ChatGPT-cold monochrome gray
- Blue-accent enterprise SaaS
- Cutesy illustration-heavy
- Gradient-everywhere "make it pop" tutorial aesthetic
- Stock Tailwind starter kit
- "Supercharge / unleash / revolutionize" marketing language

---

## Color system (LOCKED — do not change these)

**Primary orange**
- `--primary`: `#f97316`
- `--primary-hover`: `color-mix(in oklch, #f97316 88%, black)`
- `--primary-soft`: `color-mix(in oklch, #f97316 12%, white)` — active-state fills
- `--primary-accent`: `#ff6a4d` — reserved for platform dashboard accents

**Warm neutrals (never cold gray)**
- `--background`: `oklch(99% 0.003 60)` — main canvas
- `--surface-subtle`: `oklch(98% 0.005 60)` — sidebar background, hint boxes
- `--foreground`: `oklch(20% 0.01 60)` — primary text
- `--muted-foreground`: `oklch(50% 0.01 60)` — secondary text
- `--border`: `oklch(92% 0.005 60)` — soft warm borders

**Semantic**
- Success `#15803d` with soft fill `#dcfce7`
- Warning `#b45309` with soft fill `#fef3c7`
- Danger `#b91c1c` with soft fill `#fee2e2`

**Rule: one orange accent per screen.** Orange is reserved for active nav states, primary CTAs, data-viz primary series, and the progress-complete pulse. Every other surface stays warm-neutral. Never use orange as a decorative background wash except on the landing hero.

---

## Typography

- **UI & body**: Geist Sans — buttons, inputs, labels, nav, dashboard text
- **Display & editorial**: Instrument Serif — hero headlines, platform page titles, report section headers, verdict statements
- **Mono**: Geist Mono — code snippets, numeric data in tables

Never mix sans and serif within the same button, input, or label. Serif appears only at "editorial moments."

Generate a type scale with font-family, size, line-height, letter-spacing, and weight for: Display XL, Display L, Display M, H1, H2, H3, Body L, Body, Body S, Caption.

---

## Spacing, radius, shadow

- **Spacing (4pt grid)**: 2, 4, 8, 12, 16, 24, 32, 48, 64, 96
- **Radius**: sm 6px (chips), md 10px (utility buttons, small cards), lg 16px (cards), xl 24px (modals, hero cards), full 9999px (pill buttons)
- **Shadows (warm-tinted, not pure black)**: 4 levels. Shadow color should mix ~8% primary orange into near-black. Level 1 resting cards, Level 2 hover, Level 3 modals, Level 4 primary-button hover glow (~30% orange tint).

---

## Motion

- **Signature easing**: `cubic-bezier(0.16, 1, 0.3, 1)`
- **Durations**: instant 100ms, fast 180ms, normal 280ms, slow 500ms, hero 850ms
- **Stagger**: 85ms between sequential items
- Honor `prefers-reduced-motion` — reduce all motion to fade-only

---

## Signature visual motifs

1. **Ember/spark glyph** — a small 12–16px mark based on a golden-spiral dot arrangement. Used next to the logo, active sidebar items, AI-suggestion cards, report section headers, and as the loading animation inside primary buttons. Recurring but never overused.

2. **Blueprint grid background** — very faint orange dotted grid on workspace and canvas surfaces only. Never on the sidebar or auth pages.
   `background-image: radial-gradient(circle, color-mix(in oklch, var(--primary) 6%, transparent) 1px, transparent 1px); background-size: 28px 28px;`

3. **Warm sunrise gradient** — reserved for the landing hero and the post-signup "welcome to the platform" transition. Ambient, never a hard wash. Never on buttons or cards.

---

## Components — generate all variants and states

### Buttons
Variants: primary, secondary, ghost, destructive. States: default, hover, active/pressed, focused, loading, disabled.
- **Primary hover**: 1px lift + warm orange glow `0 8px 24px -8px color-mix(in oklch, var(--primary) 40%, transparent)`
- **Primary active**: snaps back down
- **Loading**: label replaced by an animated spark-dot spinner (NOT a generic spinner)
- **Ghost**: no background default, soft warm-neutral fill on hover
- Primary and secondary use pill radius; utility buttons use md radius

### Inputs
Text input, textarea, select, checkbox, radio, toggle. States: default, hover, focus, filled, error, success, disabled.
- **Focus**: 4px orange ring at 10% opacity + orange 1px border
- **Error**: amber border + amber inline icon + helper text (red is reserved for destructive/system errors)
- **Success**: small orange check fading in on the right inside the field
- **Textarea**: includes an auto-save indicator bottom-right — small green dot + "Saved"

### Selection cards (large "pick one" cards)
States: default, hover, selected, disabled.
- Default: warm-neutral background, subtle border, small custom illustration or icon, title, one-line description
- Hover: 1px lift + warm shadow + border darkens slightly
- Selected: unmistakable — orange border at 50% opacity, soft-orange fill at 8%, check badge in top-right in primary orange

### Sidebar navigation (the platform rail)
Left rail, 260px expanded, 64px collapsed, mobile drawer below `md`.
- Background: `--surface-subtle` (cooler than canvas)
- Top: Krowe wordmark + ember glyph
- Nav items: 36px tall, icon + 14px label, 8px gap
- **Active**: soft-orange fill at 8%, orange text, 2px orange left-border
- Hover: foreground at 4% fill
- Section headers: 11px uppercase tracking-wide muted
- Bottom: user pod — avatar + first name + caret → popover (Settings, Sign out, Help)
- Sections: Home, Ideas, Reports, Resources / divider / Settings, Help

### Platform content header
Sits at the top of each platform surface inside the main canvas.
- Page title in Instrument Serif (28–32px)
- Optional breadcrumb beneath
- Primary action(s) aligned right
- 1px border-bottom separator

### Designed progress indicator (signup flow)
Replaces the plain progress bar.
- Step count "4 of 12" on the left
- Section name in the center ("Understanding the problem")
- Estimated time remaining on the right ("about 6 minutes")
- Horizontal fill bar beneath, 3px tall
- **On step completion**: brief orange pulse across the bar
- Past steps become subtle clickable dots; hover reveals step name

### AI rewrite panel (signature Krowe moment)
Shown when the AI suggests a rewrite of the user's answer.
- Side-by-side: "Your answer" (muted gray, left) vs "A small nudge from Krowe" (warm card, right)
- Krowe card has a soft orange left-border and the ember glyph in the corner
- Three actions: "Use this" (primary), "Edit and use" (secondary), "Keep mine" (ghost)
- Enter animation: fade + slide from right
- Feels like a trusted advisor writing in the margin — not a system notification

### Verdict card (report hero)
- Center-stage at the top of every report
- Verdict word — Proceed / Refine / Pivot / Rethink — in Instrument Serif, 48–64px
- Subtle semantic-colored badge beneath (green for Proceed, amber for Refine, etc.)
- One-sentence plain-English summary: "This idea is worth pursuing, but narrow the target market first."
- PDF export and "Ask Krowe a follow-up" actions aligned right

### Data visualization
- **Market size** — concentric donut rings for TAM/SAM/SOM in warm-orange gradient shades, plain-English takeaway below
- **Competitor positioning** — 2x2 scatter plot, two labeled axes, competitors as warm-neutral dots, Krowe's idea as a slightly larger orange dot, quadrant labels in muted serif
- **MVP cost** — horizontal stacked bar in warm-orange gradient shades (NOT rainbow), total cost in serif on the right, plain-English takeaway below
- **Things needed** — grouped accordion checklist with check icons, cost estimates, and "why" tooltips

All charts include a plain-English one-sentence takeaway beneath. All color-coded signals also have text labels.

### Empty states
- Advisor voice: "No ideas yet. What are you thinking about?" with an inline text input (NOT a button that opens a wizard)
- Small ember glyph illustration above
- One primary action max

### Error states
- Warm card with amber (not red) border for recoverable errors
- Icon + plain-English message + retry action
- System errors (500, offline) use a distinct pattern with more context

### Modals & popovers
- Max-width 560px, 24px radius
- Soft backdrop (warm black at 40%, never pure black)
- Close on ESC and click-outside
- Entry: fade + subtle scale-up (0.98 → 1) over 280ms

---

## Key surfaces to generate as interactive prototypes

### 1. Landing page (`/`)
- Hero: Instrument Serif headline *"Your idea deserves a real gut-check."* on an ambient warm sunrise gradient (never a hard wash)
- One primary CTA: "Start validating"
- Below fold: three annotated report screenshots (market size, competitor 2x2, verdict) with plain-English captions in advisor voice
- Minimal footer
- No stock hero illustration, no gradient buttons, no "supercharge" language

### 2. Auth (sign-in / sign-up)
- Centered card, 420px max-width
- Krowe wordmark + ember glyph at the top
- One editorial line: "Welcome back — let's see where your ideas stand."
- Google OAuth above divider, email form below
- Warm tone, NOT stock starter-kit aesthetic

### 3. Signup flow — three layout variants

**Variant A — Open reflection** (Idea, Problem, Target Customer)
- Single large textarea, generous whitespace
- Background: large faded icon watermark + blueprint grid
- Advisor-voice hint placed in the margin (not a labeled "Examples" box)
- 20+ char minimum with a subtle count indicator

**Variant B — Pick a card** (Product Type, Pricing Model)
- 2–3 large selection cards, each with a small custom illustration
- Cards comfortable-sized, not cramped
- Only one orange moment: the selected card

**Variant C — Quick input** (Age, Team Size, Hours)
- Compact centered layout
- Feels like answering a question, not filling a form
- Input styled to match content (stepper for numeric, etc.)

All variants share the same header (logo + designed progress indicator) and button system at the bottom.

### 4. Signup-to-platform transition
One continuous 1.5–2 second moment:
- Final step submits
- Signup chrome dissolves
- Sidebar slides in from the left
- First generated report renders in the main canvas as the user's first "Idea"
- Brief editorial title appears: *"Your first read."*

### 5. Platform dashboard (Home)
- Sidebar always visible
- Main canvas with warm blueprint-grid background
- Header: "Home" in Instrument Serif + primary CTA "Start a new idea"
- Most recent idea as a large card at the top (verdict + last updated)
- Grid of other ideas as smaller cards below
- "Suggested next steps from Krowe" section at the bottom

### 6. Report page (authenticated)
- Rendered inside the sidebar shell
- Verdict card at the top
- Four data-viz sections in a 2-col grid on desktop, stacked on mobile
- Each section: chart + plain-English takeaway + expandable "learn more"
- Bottom: "Ask Krowe a follow-up" conversational input
- PDF export in the header

### 7. Ideas list
- Table-style list: title, verdict badge, last updated, actions menu
- Filter chips at the top (verdict, date range, search)
- Empty state: "No ideas yet. What are you thinking about?" with inline input

---

## Voice & microcopy rules

Replace generic labels throughout:

- "Continue" → "Next question" or content-specific ("Tell me about the problem →")
- "Submit" → "Generate my report"
- "Something went wrong" → "Hmm, let's look at this again"
- "No data" → conversational, content-specific prompts
- "Auto-saved" → "Saved"
- "Sign in with Email" → "Sign in"
- "Get Started" → "Start validating"

Error messages use advisor voice: *"The URL didn't load — try pasting it again, or skip and fill in manually."*

---

## Accessibility

- All focus states visible (4px orange ring at 10% opacity minimum)
- Color-coded signals (verdict, chart series, status badges) always paired with a text label or icon — never color alone
- ARIA landmarks: `role="main"` on canvas, `role="navigation"` on sidebar, `role="banner"` on header
- Progress indicator has `aria-valuenow`, `aria-valuemax`, `aria-label`
- All icon-only buttons have `aria-label`
- Contrast WCAG AA minimum, AAA for body text

---

## Responsive behavior

- Sidebar collapses to mobile drawer below `md`
- Signup cards collapse to single column below `md`; touch targets ≥ 44px
- Report grid: 2-col desktop → single-col tablet → stacked mobile
- Typography scales down one step on mobile (Display L → Display M, etc.)
- Padding scales: `px-8 py-6` desktop → `px-4 py-4` mobile

---

## Deliverables

Produce a cohesive output containing:

1. **Token library** — colors, typography, spacing, radius, shadow, motion — as Figma variables plus a CSS custom-properties export
2. **Component library** with every variant and state above
3. **Seven key surfaces** as interactive prototypes
4. **Style guide page** documenting voice rules, motif usage, and do/don'ts
5. **Exportable React components** with Tailwind 4 class names (the production codebase uses Tailwind 4 and Next.js 16)

Every output should feel like it came from the same studio. Warm, editorial, confident, a little restrained. If anything you generate could also appear in a ChatGPT clone or a generic SaaS starter kit, redesign it.
