---
name: asafarim-digital-design
description: Use this skill to generate well-branded interfaces and assets for ASafariM Digital — Ali Safari's full-stack SaaS + AI product engineering studio (portal + content-generator + future apps). Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping or production.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. The brand is dark-first (deep midnight `#07111F`), with an electric-azure → neon-mint signature gradient, Manrope display type, IBM Plex Mono numerics, tight-tracked headlines (`-0.04em`), 11px uppercase eyebrows, pill-shaped CTAs, and Lucide-style stroked SVG icons. **No emoji.** Imagery is geometric SVG / gradient mesh — never photographic.

If working on production code, copy `colors_and_type.css` (or its tokens) and read the rules in `README.md` and `ui_kits/*/README.md` to become an expert in designing with this brand. The canonical token source is `packages/ui/src/brand-tokens.ts` in the upstream repo.

If the user invokes this skill without any other guidance, ask them what they want to build or design (slide deck? landing page? a new app screen? marketing collateral? an internal dashboard?), ask follow-up questions about audience, surface, density, and tone, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

**Core constraints to never violate:**
- Dark surface first (`#07111F` portal / `#0D0D0F` brand-tokens). Light is opt-in.
- Headlines are tight-tracked, one word lit by `--gradient-headline` only.
- Eyebrows: 11px, uppercase, `letter-spacing: 0.22em`, muted.
- All buttons and status indicators are pill-shaped (`border-radius: 9999px`).
- Hover = `translate-y(-4px)` + border shift. Never scale shrink.
- Icons are Lucide-style stroked (`strokeWidth=2`, round caps).
- No emoji, no exclamation marks, no "delight"/"magical"/"supercharge".
- The signature gradient (`#3A7BFF → #4FF2C9`) is precious — at most 2 places per screen.
