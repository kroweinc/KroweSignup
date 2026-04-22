# Krowe — Pass 4: Design System Showcase Website

Generate a **browsable multi-page website** documenting every detail of Krowe's design system. The site itself uses the Krowe system — a proof, not just a reference. Think Polaris or Radix UI docs, warmer and more editorial.

**Krowe**: AI business-validation platform. Voice = senior friend who's built three companies; plainspoken, warm, editorial. Never "supercharge/unleash." Feel = sunrise on the day someone starts a business. NOT cold gray, blue SaaS, cutesy, gradient-everywhere, Tailwind starter.

**Colors (LOCKED)**: `--primary` `#f97316` (hover mix 88% black, soft mix 12% white), `--primary-accent` `#ff6a4d`; `--background` `oklch(99% 0.003 60)`, `--surface-subtle` `oklch(98% 0.005 60)`, `--foreground` `oklch(20% 0.01 60)`, `--muted` `oklch(50% 0.01 60)`, `--border` `oklch(92% 0.005 60)`; Success `#15803d` / Warning `#b45309` / Danger `#b91c1c`. One orange per screen.

**Type**: Geist Sans (UI), Instrument Serif (display/titles), Geist Mono (numeric/code). **Motion**: `cubic-bezier(0.16, 1, 0.3, 1)`; 100/180/280/500/850ms; 85ms stagger. **Motifs**: ember glyph (12–16px golden-spiral dot); blueprint grid on canvas only; sunrise gradient on heroes only.

---

## Site shell (itself designed in Krowe's system)

Multi-page with routing, NOT a single scroll.

- **Left sidebar** 260px, collapsible to 64px, drawer below md. Top: wordmark + ember glyph. Sections: Home · Foundations · Components · Surfaces · Voice · Accessibility · Changelog. Active = soft-orange fill 8% + orange text + 2px orange left-border.
- **Canvas**: warm off-white with blueprint-grid background, generous padding.
- **Page header**: Instrument Serif 32–40px title + one-line muted Body L description + 1px border-bottom.
- **Top-right**: Cmd+K search palette, theme toggle (light default + dark), GitHub link.
- **Copy-to-clipboard** button on every token, class name, and code snippet.

---

## Pages

### Home
Hero: Instrument Serif *"The Krowe design system."* on ambient sunrise gradient. Subtitle: *"Every color, type choice, and component that makes Krowe feel like Krowe."* Four tile cards below linking to Foundations / Components / Surfaces / Voice.

### Foundations (one page, anchored subsections)
- **Colors** — every token as a large swatch with hex, oklch, Tailwind class, usage note. Grouped Primary / Warm Neutrals / Semantic. Contrast ratios shown.
- **Typography** — full scale (Display XL → Caption) at real size with samples. Each: font, size, line-height, letter-spacing, weight, class.
- **Spacing** — visual ruler 2/4/8/12/16/24/32/48/64/96 labeled + a contextual card example.
- **Radius** — five identical shapes showing sm/md/lg/xl/full.
- **Shadow** — four identical cards, one per level, hover to lift. Includes primary-button hover glow.
- **Motion** — interactive demos. Cards animating with each duration + signature easing. Curve visualized. Reduced-motion toggle.
- **Motifs** — ember glyph at 12/16/24/48px, blueprint-grid swatch, sunrise swatch. Do/don't notes.

### Components
One page per family: Buttons · Inputs · Selection Cards · Sidebar · Progress Indicator · AI Rewrite Panel · Verdict Card · Data Viz · Empty States · Error States · Modals.

Each page: every variant and state rendered **live** (hover/tab/click to trigger states), copyable React/Tailwind 4 snippet, short "when to use / when not to" note.

### Surfaces
Preview cards: Landing · Auth · Signup (three variants) · Dashboard · Report · Ideas List. Each = screenshot + caption on what makes it a Krowe surface. Click → zoomed detail with annotations.

### Voice
Manifesto paragraph in Krowe voice at top. Below: before/after microcopy pairs in two columns ("Generic" vs "Krowe") — "Continue" → "Next question", "Submit" → "Generate my report", "Something went wrong" → "Hmm, let's look at this again". Then side-by-side sample errors, empty states, and onboarding paragraphs — generic vs Krowe — with annotations on what changed and why.

### Accessibility
Live focus demos. Contrast-ratio checker with AA/AAA badges. ARIA patterns per component. Reduced-motion toggle.

### Changelog
Reverse-chronological updates in advisor voice ("April 21, 2026 — Introduced Instrument Serif for editorial moments.").

---

## Non-negotiables
- Components render live and interactively, not as static images
- Every token, class name, and code snippet is one-click copyable
- Cmd+K search jumps to any token or component
- Dark mode toggle with proper contrast
- Responsive: sidebar → drawer below md
- Code snippets toggle React/JSX ↔ raw CSS

## Feel
Polaris meets a letterpress journal. Warm, editorial, confident, generous whitespace. A visitor should think *"I want my product to feel like this."* If any page could appear on a generic Tailwind UI kit site, redesign it.

## Deliverables
Complete Next.js 16 + Tailwind 4 multi-page website. Every page populated, live component rendering, dark mode, Cmd+K search. Deploy-ready.
