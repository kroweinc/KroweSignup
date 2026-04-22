# Krowe — Pass 1/3: Tokens & Foundations

## About Krowe
Krowe is an AI business-validation platform. ~10-step signup → report (market size, competitors, MVP cost, resources, verdict: Proceed / Refine / Pivot / Rethink). Post-signup: platform with a persistent left sidebar.

## Voice
The senior friend who's built three companies — plainspoken, warm, honest, editorial. Never "supercharge / unleash / revolutionize." Say "Let's see if this holds up."

## Feel
Sunrise on the day someone decides to start their business. NYT business section × trusted advisor's notebook — NOT another AI SaaS dashboard.

## NOT
Cold gray, blue-accent SaaS, cutesy illustration-heavy, gradient-everywhere, stock Tailwind starter.

## Colors (LOCKED — do not change)
- `--primary` `#f97316`; `--primary-hover` = mix 88% with black; `--primary-soft` = mix 12% with white
- `--primary-accent` `#ff6a4d`
- `--background` `oklch(99% 0.003 60)` (warm off-white canvas)
- `--surface-subtle` `oklch(98% 0.005 60)` (sidebar, hint boxes)
- `--foreground` `oklch(20% 0.01 60)`; `--muted-foreground` `oklch(50% 0.01 60)`; `--border` `oklch(92% 0.005 60)`
- Success `#15803d` / Warning `#b45309` / Danger `#b91c1c` with soft fills
- **One orange accent per screen**: active nav, primary CTA, data-viz primary series, progress pulse only

## Signature motifs
1. **Ember glyph** — 12–16px golden-spiral dot mark. Appears at logo, active sidebar items, AI cards, report section headers, inside primary-button loaders
2. **Blueprint grid** (canvas surfaces only): `radial-gradient(circle, color-mix(in oklch, var(--primary) 6%, transparent) 1px, transparent 1px); background-size: 28px 28px`
3. **Sunrise gradient** — landing hero + post-signup welcome transition only. Ambient, never a hard wash.

---

## This pass: produce the token foundation ONLY

No components, no surfaces — tokens and a style-guide page. Later passes reference these.

### Type scale
Generate 10 styles with font-family, size, line-height, letter-spacing, weight:
- Display XL (landing hero) — Instrument Serif
- Display L (sub-hero) — Instrument Serif
- Display M (platform page titles, report section headers) — Instrument Serif
- H1, H2, H3 — Geist Sans
- Body L, Body, Body S — Geist Sans
- Caption — Geist Sans, tracking-wide, uppercase variant included

Rule: never mix sans + serif inside a single button, input, or label. Include usage notes per style.

### Spacing (4pt grid)
2, 4, 8, 12, 16, 24, 32, 48, 64, 96 — named xs / sm / md / lg / xl / 2xl / 3xl / 4xl / 5xl / 6xl

### Radius
- sm 6px (chips)
- md 10px (utility buttons, small cards)
- lg 16px (cards)
- xl 24px (modals, hero cards)
- full 9999px (pill buttons, badges)

### Shadow (warm-tinted — NOT pure black)
Shadow color mixes ~8% `--primary` into near-black:
- Level 1 — resting cards (subtle)
- Level 2 — card hover (lifted)
- Level 3 — modals (elevated)
- Level 4 — primary-button hover glow: `0 8px 24px -8px color-mix(in oklch, var(--primary) 40%, transparent)`

### Motion tokens
- Easing: `--ease-out-smooth: cubic-bezier(0.16, 1, 0.3, 1)` (signature)
- Durations: `--duration-instant` 100ms, `--duration-fast` 180ms, `--duration-normal` 280ms, `--duration-slow` 500ms, `--duration-hero` 850ms
- Stagger step: `--stagger-step` 85ms
- Honor `prefers-reduced-motion` — reduce to fade-only
- Demonstrate 3 reference transitions: button press (fast), page fade (normal), list stagger-in (hero + 85ms stagger)

### Style-guide page
A single Figma page showing every token in context:
- Color swatches with tokens, hex, and usage notes
- Full type scale with sample text
- Spacing ruler with labels
- Radius samples on identical shapes
- Shadow samples on identical cards
- Motion demos (hover the samples to trigger)
- Motif examples: ember glyph at three sizes, blueprint-grid swatch, sunrise-gradient swatch

## Deliverables for Pass 1
1. Figma variables for every token above
2. CSS `:root { ... }` custom-properties export (Tailwind 4 compatible)
3. One-page visual style guide
4. Do/don't reference: "one orange per screen," "warm not cold," "serif only at editorial moments"

Output nothing else. Components come in Pass 2, surfaces in Pass 3.
