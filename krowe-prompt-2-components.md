# Krowe — Pass 2/3: Components

**Krowe**: AI business-validation platform. ~10-step signup → report (market, competitors, MVP cost, resources, verdict). Post-signup: left-sidebar platform.

**Voice**: senior friend who's built three companies — plainspoken, warm, honest, editorial. Never "supercharge/unleash." Say "Let's see if this holds up."

**Feel**: sunrise on the day someone starts a business. NYT business section × advisor's notebook. NOT cold gray, blue SaaS, cutesy, gradient-everywhere, Tailwind starter.

**Colors (LOCKED)**: `--primary` `#f97316` (hover mix 88% black, soft mix 12% white), `--primary-accent` `#ff6a4d`; `--background` `oklch(99% 0.003 60)`, `--surface-subtle` `oklch(98% 0.005 60)`, `--foreground` `oklch(20% 0.01 60)`, `--muted` `oklch(50% 0.01 60)`, `--border` `oklch(92% 0.005 60)`; Success `#15803d` / Warning `#b45309` / Danger `#b91c1c`. **One orange per screen**: active nav, primary CTA, data-viz primary, progress pulse only.

**Type**: Geist Sans (UI), Instrument Serif (display/titles/report headers/verdicts), Geist Mono (numeric).

**Motion**: `cubic-bezier(0.16, 1, 0.3, 1)`; 100/180/280/500/850ms; 85ms stagger.

**Motifs**: ember glyph (12–16px golden-spiral dot — logo, active sidebar, AI cards, button loaders); blueprint grid on canvas only; sunrise gradient on landing hero + post-signup transition only.

---

## This pass: component library (use Pass 1 tokens)

### Buttons
Variants: primary, secondary, ghost, destructive. States: default, hover, active, focus, loading, disabled.
- Primary hover: 1px lift + orange glow `0 8px 24px -8px color-mix(in oklch, var(--primary) 40%, transparent)`; active snaps down
- Loading: label replaced by animated ember-dot spinner — NEVER a generic spinner
- Primary/secondary: pill radius; utility: md radius

### Inputs
Text, textarea, select, checkbox, radio, toggle. States: default, hover, focus, filled, error, success, disabled.
- Focus: 4px orange ring at 10% opacity + 1px orange border
- Error: amber border + inline icon + helper text (red reserved for destructive/system errors)
- Success: small orange check fading in inside the field (right)
- Textarea: auto-save indicator bottom-right — green dot + "Saved"

### Selection cards
Large "pick one" cards. States: default, hover, selected, disabled.
- Default: warm-neutral bg, subtle border, small custom illustration, title, one-line description
- Hover: 1px lift + warm shadow
- Selected: orange border at 50%, soft-orange fill at 8%, orange check badge top-right

### Sidebar nav (platform rail)
260px expanded, 64px collapsed, mobile drawer below md.
- Background `--surface-subtle` (cooler than canvas); top: wordmark + ember glyph
- Nav items 36px, icon + 14px label; active = soft-orange fill 8% + orange text + 2px orange left-border; hover = foreground 4%
- Section headers: 11px uppercase tracking-wide muted
- Bottom: user pod — avatar + first name + caret → popover (Settings, Sign out, Help)
- Sections: Home, Ideas, Reports, Resources / divider / Settings, Help

### Content header
Instrument Serif 28–32px title + optional breadcrumb + actions right + 1px border-bottom.

### Designed progress indicator (signup)
Replaces plain bar. Left: "4 of 12" step count. Center: section name. Right: time remaining. 3px fill below. On step complete: brief orange pulse. Past steps = clickable dots; hover reveals name.

### AI rewrite panel (signature moment)
Side-by-side: "Your answer" (muted, left) vs "A small nudge from Krowe" (warm card with soft orange left-border + ember glyph, right). Actions: "Use this" (primary), "Edit and use" (secondary), "Keep mine" (ghost). Entry: fade + slide from right. Feels like an advisor writing in the margin, NOT a notification.

### Verdict card (report hero)
Center-stage at report top. Verdict word (Proceed/Refine/Pivot/Rethink) in Instrument Serif 48–64px. Semantic badge below. One-sentence plain-English summary. PDF export + "Ask Krowe a follow-up" aligned right.

### Data viz
- **Market size**: concentric donut rings (TAM/SAM/SOM) in warm-orange gradient
- **Competitor**: 2×2 scatter, axes labeled, competitors as warm dots, Krowe's idea as larger orange dot
- **MVP cost**: horizontal stacked bar in warm-orange shades (NOT rainbow) + total in serif
- **Things needed**: grouped accordion checklist with cost estimates + "why" tooltips

All charts: plain-English takeaway beneath; text labels on every color-coded element.

### Empty states
Advisor voice: "No ideas yet. What are you thinking about?" + inline input (NOT a wizard button). Ember glyph above. One primary action max.

### Error states
Warm card with amber border for recoverable errors — icon + plain-English message + retry. System errors use a distinct pattern.

### Modals
560px max, 24px radius. Warm backdrop (black 40%, never pure). Entry: fade + scale 0.98 → 1 over 280ms.

## Deliverables
Figma component library with all variants/states + exportable React components (Tailwind 4) + a component index page.
