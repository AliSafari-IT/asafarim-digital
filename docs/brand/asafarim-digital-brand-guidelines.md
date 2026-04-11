---
title: asafarim-digital Brand Guidelines
version: 1.0.0
owner: Ali Safari
updated: 2026-04-11
---

# asafarim-digital Brand Guidelines

## 1) Brand Core

### Brand Essence
**AI-Empowered Digital Craftsmanship**

### Brand Promise
Delivering future-ready SaaS platforms, automation systems, and intelligent web experiences with precision, speed, and elegance.

### Brand Personality
- Technical mastery
- Minimalist and premium
- Futuristic but grounded
- Reliable, structured, strategic
- Human-centered AI

### Brand Voice
- Confident, clear, expert
- Direct value, no fluff
- Friendly and professional
- Future-focused with practical outcomes

---

## 2) Visual Identity System

### Logo Concepts (generated)
Located at:
- `apps/portal/public/brand/logo-concept-neural.svg` (Concept A: Neural Ring)
- `apps/portal/public/brand/logo-concept-monogram.svg` (Concept B: AD Monogram Block)
- `apps/portal/public/brand/logo-concept-orbit.svg` (Concept C: Orbit Node)

### Primary Palette
- Midnight Graphite: `#0D0D0F`
- Electric Azure: `#3A7BFF`
- Soft Slate: `#A3A9B7`
- Neon Mint: `#4FF2C9`

### Supporting Colors
- Surface Elevated: `#14161C`
- Border Dark: `#2A2F3B`
- Text Light: `#F5F7FB`
- Warning: `#FFBE5B`
- Danger: `#FF6B7A`

### Brand Gradient
`linear-gradient(135deg, #3A7BFF 0%, #4FF2C9 100%)`

### Typography
- Headings: Geist, Inter Tight, Inter
- Body: Inter, Geist Sans, Segoe UI
- Code: JetBrains Mono, Consolas

### UI Style
- Rounded cards (`1rem` / `1.25rem` radius)
- Elevated dark surfaces with subtle borders
- Glass accent panels for AI-focused content
- Soft blue/mint glow shadows on important cards

---

## 3) Design Tokens + Tailwind Integration

Generated token file:
- `packages/ui/src/brand-tokens.ts`

Exports:
- `asafarimBrandTokens`
- `asafarimTailwindThemeExtension`

Use in shared UI package via:
- `packages/ui/src/index.ts`

### Token Categories
- Colors
- Gradients
- Typography stacks
- Border radius scale
- Shadow styles
- Motion curves and durations

---

## 4) Messaging Framework

### Tagline Options
1. AI-Empowered SaaS Engineering.
2. Where AI meets Product Craftsmanship.
3. Building the future of digital automation.

### Value Proposition
Ali builds scalable, AI-powered SaaS platforms using Next.js, TypeScript, PostgreSQL, and C# microservices, delivered through a unified monorepo architecture for speed, consistency, and long-term maintainability.

### Service Pillars
- AI-powered SaaS development
- Workflow automation
- Multi-tenant SaaS architecture
- Full-stack web apps
- AI agents and RAG pipelines
- Brand-aligned product strategy

---

## 5) Usage Rules

### Logo Do
- Keep clear space equal to 0.5x icon diameter around the mark.
- Use dark background variants on brand surfaces.
- Keep aspect ratio locked.

### Logo Don't
- Do not stretch or skew.
- Do not apply random gradients outside the approved palette.
- Do not place over low-contrast busy imagery.

### Color Do
- Use midnight as base surface for premium dark mode.
- Reserve mint accents for success states, highlights, and AI actions.
- Use azure for primary action and key links.

### Color Don't
- Avoid introducing purple/indigo as primary accents.
- Avoid low-contrast text combinations on dark backgrounds.

---

## 6) Social Banner Kit

Generated assets:
- `apps/portal/public/brand/social/github-banner.svg` (1280x640)
- `apps/portal/public/brand/social/linkedin-banner.svg` (1584x396)
- `apps/portal/public/brand/social/x-banner.svg` (1500x500)
- `apps/portal/public/brand/social/youtube-banner.svg` (2560x1440)

Recommended export format for publishing:
- SVG source retained in repo
- PNG export at 2x for platform upload compatibility

---

## 7) Homepage Branding Reference

Homepage implementation aligned to this pack:
- `apps/portal/app/page.tsx`
- `apps/portal/app/globals.css`

Includes:
- Brand essence-led hero
- Services and SaaS showcase
- Tech stack and about sections
- Contact CTA with copy-email interaction and mail client fallback

---

## 8) Future Extensions

- Animated logo opener for product splash screens
- Shared brand watermark component in `packages/ui`
- Token publication to Style Dictionary for app + service parity
- Motion primitives for stagger and page-enter transitions
