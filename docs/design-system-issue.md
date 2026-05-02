# ASafariM Digital — Design System

> **Tagline:** AI-Empowered Digital Craftsmanship
> **Positioning:** One partner for interface, architecture, and intelligent workflows.

ASafariM Digital is a full-stack SaaS + AI product engineering studio (Ali Safari & co.). The brand sits where **design-forward frontend**, **durable backend architecture**, and **applied AI** meet — and the visual system reflects that triad with a deep midnight surface, an electric-azure → neon-mint signature gradient, and clipped headline type.

## Source

- **GitHub:** [AliSafari-IT/asafarim-digital](https://github.com/AliSafari-IT/asafarim-digital) (Turbo + pnpm monorepo)
- **Live:** `portal-qa.asafarim.com`, `content-generator-qa.asafarim.com` 
- **Key files referenced**
  - `packages/ui/src/brand-tokens.ts` — canonical brand tokens
  - `packages/ui/src/theme.ts` — light/dark theme handling
  - `apps/portal/app/globals.css` — portal CSS variables (canonical)
  - `apps/content-generator/app/globals.css` — content-generator CSS variables
  - `apps/portal/app/home-content.tsx` — hero + sections layout reference
  - `apps/content-generator/components/{Header,Footer,Logo,ContentForm,OutputCard}.tsx` 
  - `packages/ui/src/{button,common-navbar,common-sidebar,nav-icons}.tsx` 

## Products

The monorepo ships **two production apps** plus several in-flight ones:

| App | Surface | Status |
|---|---|---|
| **Portal** (`apps/portal`) | Marketing site + admin shell — the brand's front door | Live |
| **Content Generator** (`apps/content-generator`) | AI content generation tool (blog, email, social, summary) | Live |
| Ops Hub, EduMatch, Marketing-Content, Mobile | Showcase concepts | In-flight |

The studio's three pillars (also drive the home-page tile grid):
- **Frontend Systems** — Next.js App Router, design systems, dashboard UX
- **Backend Platforms** — TypeScript APIs, C#/.NET, PostgreSQL, queues
- **Applied Intelligence** — RAG pipelines, tool-enabled agents, workflow orchestration

---

## Content Fundamentals

**Voice:** Confident, practical, premium. Engineering-credible without being dry. Reads like a senior engineer who can ship — never a marketer.

**Person:** Mostly third-person product voice ("ASafariM Digital ships…", "One partner for…"). Drops to second-person ("your team ships", "your goal, audience, tone") in product UX prompts. Avoids "I/we" outside contact/about.

**Sentence shape:** Short, declarative, em-dash-friendly. Lists trios where possible. "Frontend · Backend · AI" — the middot is a recurring rhythm marker.

**Casing:**
- **Eyebrow labels:** ALL CAPS, letter-spaced (`tracking: 0.22em`). Examples: `DELIVERY SNAPSHOT`, `FRONTEND · BACKEND · AI`, `AI CONTENT GENERATOR · LIVE`.
- **Headlines:** Sentence case. Tight tracking (`-0.04em` to `-0.05em`).
- **Body / button labels:** Sentence case. Verb-led CTAs ("Start generating", "Explore capabilities", "Generate Content").
- **Tags / chips:** Title Case ("Next.js", "Design systems", "RAG pipelines").

**Emoji:** Effectively never. The product uses Lucide-style stroked SVG icons instead. The only "emoji-adjacent" element is a status pulse dot before eyebrows.

**Vibe phrases (real, lifted from the codebase):**
- "AI-Empowered Digital Craftsmanship" *(brand essence)*
- "Ship full-stack SaaS with AI at the core."
- "Generate premium content across every format your team ships."
- "Fast ideation now, durable workflows later."
- "Premium UX, durable backends, and AI wired into real products."
- "Multi-provider fallback — OpenAI first, Anthropic as a safety net."
- "Format-aware prompts."

**Don'ts:** No exclamation marks. No "🚀 / ✨ / 🔥". No "delight", "magical", "supercharge", "revolutionary". No filler hype.

---

## Visual Foundations

**Surface — deep cool midnight.** Default theme is dark. Portal canvas is `#07111F` (Midnight Navy); brand-tokens reference `#0D0D0F` (Midnight Graphite). Light is supported but secondary.

**Backgrounds — layered radial mesh + grid.**
1. Body: subtle radial glow at top corners (azure top-left, mint top-right) over the deep navy.
2. Hero blocks: a stronger radial mesh (`var(--gradient-hero-mesh)`) — azure + violet + mint — fades center-out.
3. A faint grid pattern on hero panels: `48px × 48px` border-strong lines, masked to a center radial.
4. **Never full-bleed photography.** Imagery is geometric SVG, gradient mesh, or code-window mockups.

**Color story.**
- **Primary action:** Electric Azure `#3A7BFF` / portal `#4C7DFF`. Hover deepens to `#355FE0`.
- **Secondary accent:** Neon Mint `#4FF2C9` / `#5DE4C7`. Used for "Live" pills, success, and the second stop of the signature gradient.
- **Tertiary spark:** Violet `#C084FC` and Pink `#F472B6`, only inside the headline gradient and the AI-pillar tile.
- **Muted text:** Soft Slate `#A3A9B7` / portal `#9FB0CF` — wide use in body copy.
- **Borders:** Translucent slate (`rgba(129, 149, 181, 0.18)` regular, `0.34` strong). On dark, ~10% white-on-white also appears for hairlines.

**Signature gradient.** `linear-gradient(135deg, #3A7BFF 0%, #4FF2C9 100%)` — used on the primary "Back to Portal" pill, logo ring, output-format markers. The expanded headline gradient adds violet: `linear-gradient(120deg, #6AA3FF, #A78BFA, #5DE4C7)`.

**Typography.**
- Display & body: **Manrope** (portal) / **Geist** (content-generator). Both modern geometric sans.
- Mono: **IBM Plex Mono** (portal) / **JetBrains Mono** (tokens).
- Headlines are *tight* (`-0.04em` to `-0.05em` tracking) and *big* (clamps up to `5.25rem` / 84px on the hero).
- Eyebrows are tiny (`11px`), uppercase, letter-spaced (`0.22em`), and muted — they're everywhere.
- Body copy runs at 14–16px / `leading-7` (1.75) — luxuriously airy.
- Mono is used for proof-point numbers ("247ms p95") and code-window UI chrome.

**Spacing & layout.**
- Tailwind 4 base (`0.25rem`).
- Page max width: `max-w-7xl` (1280px), gutters `px-4 sm:px-6 lg:px-8`.
- Section spacing: `mt-24 scroll-mt-28`.
- Hero panel: `py-10 sm:py-20`, `rounded-[2rem] sm:rounded-[2.5rem]`.
- Card padding: `p-6` to `p-8`; nested cards `p-4`.

**Corner radii.** Almost everything is rounded.
- `0.5rem / 8px` — chips, mini-tags
- `0.75rem / 12px` — small buttons (`rounded-lg`)
- `1rem / 16px` — primary cards
- `1.5rem / 24px` — feature cards
- `2rem / 32px` — hero / showcase tiles
- `9999px / pill` — every CTA button, every status badge, every nav item

**Cards.** Translucent panel background (`rgba(11, 23, 42, 0.78)`), 1px translucent slate border, no drop shadow at rest. On hover: `-translate-y-1` lift + border-strong + soft `shadow-card`. Some "elevated" cards add the `shadow-brand-card` blue-tinted glow.

**Shadows.**
- `shadow-card`: `0 28px 80px -40px rgba(0, 0, 0, 0.72)` — generic deep cushion
- `shadow-glow`: `0 20px 40px -22px rgba(76, 125, 255, 0.75)` — primary CTA bloom
- `shadow-brand-card`: `0 16px 50px -28px rgba(58, 123, 255, 0.50)` — content-gen cards
- `shadow-brand-glow`: `0 0 0 1px rgba(58,123,255,0.35), 0 12px 36px -20px rgba(79,242,201,0.55)` — pillar icon ring

**Borders.** Strongly preferred over shadows. Always 1px. Frequently uses `border-white/10` for hairlines on dark surfaces.

**Animation.**
- `cubic-bezier(0.16, 1, 0.3, 1)` (`easeOutExpo`) — most transitions
- `cubic-bezier(0.22, 1, 0.36, 1)` (`easeSmooth`) — for color/opacity
- Durations: `180ms` fast, `300ms` base, `500ms` slow.
- Hover patterns: `-translate-y-1` lift + border-color shift, ~180–220ms.
- Press: no shrink — relies on color depth shift.
- Subtle pulse on "Live" status dots, breathing scale on logo orbits.
- No bounces, no spring overshoots. No long `easeInOut`.

**Hover / press states.**
- Buttons (primary): bg darkens (azure → primary-dark).
- Buttons (secondary): border shifts to `var(--color-primary)`.
- Cards: `-translate-y-1` + border-strong.
- Nav items: `bg-white/5` + brighter text.
- Press: relies on natural color compression — no `scale(0.98)` shrink.

**Transparency & blur.**
- Header: `bg-[var(--color-surface)]/70 backdrop-blur-xl` — translucent with frost.
- Panels (`var(--color-panel)`): translucent navy at ~78% — sits over the mesh background and lets a hint of color through.
- Pills/buttons over imagery: `bg-[var(--color-surface-glass)]` (~72% navy) + thin border.

**Iconography (preview).** Lucide-style stroked, `strokeWidth=2`, `strokeLinecap=round`, `strokeLinejoin=round`. 20×20 default. See [`ICONOGRAPHY`](#iconography) below.

---

## Iconography

**System: hand-rolled Lucide clones**, kept in `packages/ui/src/nav-icons.tsx` (we copied it inline-rendered into [`assets/icons.html`](assets/icons.html)). All inline SVG — no font, no PNG, no emoji.

- **Stroke:** `strokeWidth=2`, `strokeLinecap=round`, `strokeLinejoin=round`, `fill=none`.
- **Default size:** `20×20` viewBox `0 0 24 24`.
- **Color:** `stroke="currentColor"` — icons inherit text color. Active states swap to `--color-accent`.
- **Set covered:** `home, users, settings, analytics, billing, content, layers, security (shield), zap, layout, navigation, list, menu, help, education (graduation-cap), chat, sparkles, overview (4-square)` — see `nav-icons.tsx`.
- **Fallback:** `LayoutIcon` (4-pane window) is the default if a key is missing.

**For new screens, reuse from `nav-icons.tsx` first.** If we need an icon outside the existing set, we can ship more Lucide-derived SVGs at the same stroke weight and style — link them from CDN as a stop-gap (`https://unpkg.com/lucide-static@latest/icons/<name>.svg`).

**Logos & illustration.** Generic SVG only — see `assets/`:
- `logo-mark.svg` — primary mark (rounded square + brand gradient)
- `logo-concept-{monogram,neural,orbit}.svg` — exploration concepts
- `showcase-{1,2,3}.svg` — abstract product preview tiles
- `mesh-bg.svg` — content-generator radial-mesh backdrop
- `social-{github,linkedin,x,youtube}-banner.svg` — social hero banners
- `portal-favicon.svg`, `content-generator-favicon.svg` 

**Emoji / unicode characters?** Effectively no. The only unicode characters used decoratively are `→` (arrow in CTAs) and `·` (middot as separator: "Frontend · Backend · AI", "AI Content Generator · Live"). Apostrophes/em-dashes typeset properly.

> ⚠️ **Substitution note:** No font files were provided in the repo — both apps load Manrope, IBM Plex Mono, and Geist via Next.js's font system / Google Fonts. The design system also pulls from Google Fonts; if you have licensed copies of any of these (or wish to swap to self-hosted), drop the `.woff2` files into `fonts/` and they'll be picked up.

---

## Index

**Root files**
- `README.md` — this file
- `colors_and_type.css` — all design tokens, theme vars, semantic type styles
- `SKILL.md` — Claude Code / Agent Skills entrypoint

**Folders**
- `assets/` — logos, mesh backgrounds, showcase tiles, social banners, favicons, [`icons.html`](assets/icons.html) (live icon registry)
- `preview/` — small HTML cards rendered into the Design System tab (one per concept)
- `ui_kits/portal/` — Portal app UI kit (homepage hero/pillars/showcase/process)
- `ui_kits/content-generator/` — Content Generator UI kit (workspace, generator, output)

**External references** (not pre-loaded — request access if needed)
- GitHub: <https://github.com/AliSafari-IT/asafarim-digital>

---

## Working with this system

- **Always start dark.** Light theme is opt-in, not the default presentation.
- **Headlines do the talking.** Big, tight-tracked, with one accent word in the headline gradient.
- **Use the eyebrow.** Every section starts with an 11px uppercase letter-spaced label.
- **Pill everything actionable.** CTAs, status indicators, tags — all `border-radius: 9999px`.
- **Lift on hover, never scale on press.** Translate up 4px, swap border to strong, soften the shadow.
- **Stay restrained with the gradient.** Reserve the azure→mint gradient for the *one* hero word, the primary CTA, the logo ring. The instant it appears in two competing places, the brand looks generic.
