# Content Generator Project Plan

**Author:** Ali Safari
**Created:** 2026-05-03
**Status:** Workspace MVP in progress
**Purpose:** Build a practical AI content workspace for ASafariM Digital while
practicing productized AI workflows, prompt operations, collaboration, and
creative production pipelines.

## 1. Vision

Content Generator should become a focused creative operating system for small
teams:

1. Capture a campaign brief or one-off prompt.
2. Select a content type or custom workflow.
3. Generate a strong first draft with provider fallback.
4. Refine the draft into variants for channels, audiences, tones, and locales.
5. Save winning prompts, reusable brand voice rules, and final assets.
6. Export or publish to the places where the content is used.

The app should not feel like a generic chat box. It should feel like a workspace
where strategy, drafts, reusable prompts, review, and publishing live together.

## 2. Current Implementation Snapshot

Current app: `apps/content-generator`

Implemented:

- Authenticated Next.js app using shared ASafariM auth.
- AI generation API with OpenAI primary provider and Anthropic fallback.
- Project folders for organizing generations.
- Chat sessions and chat messages persisted per user.
- Saved prompts.
- Custom content type definitions.
- Provider/model/token metadata on generation records.
- Prompt validation and ownership checks.
- Workspace UI with folders, recent sessions, saved prompts, content type
  selector, output card, command palette, app switcher, user menu, and theme
  toggle.
- SEO helpers, sitemap, robots, Open Graph image, Twitter image, and health API.
- Focused Vitest coverage for generation, validation, and content type behavior.

Known gaps:

- No streaming response UI.
- No structured draft editor.
- No version history or variant comparison.
- No brand voice/profile system.
- No campaign brief model.
- No team review workflow.
- No usage quota or cost reporting.
- No publish/export integrations.

## 3. Product Principles

- Make the first useful draft fast, but make the second and third iteration
  deliberate.
- Preserve context: project, campaign, audience, tone, brand voice, and content
  type should travel with the generation.
- Treat prompts as product assets, not throwaway text.
- Keep AI outputs reviewable, attributable, and easy to improve.
- Support small-team collaboration without turning the MVP into a full CMS.
- Prefer export-first integrations before deep publishing automation.

## 4. Target Users

- Founder/operator writing product updates, landing copy, and emails.
- Marketer managing campaign drafts across channels.
- Consultant creating repeatable client deliverables.
- Internal ASafariM operator producing docs, posts, summaries, and launches.

## 5. Architecture

```text
Content workspace UI (Next.js)
          |
          v
Content Generator API routes
          |
          +-- shared auth/session via @asafarim/auth
          +-- Prisma/Postgres via @asafarim/db
          +-- project folders
          +-- chat sessions and messages
          +-- saved prompts
          +-- content type definitions
          +-- generation records and provider metadata
          +-- OpenAI primary provider
          +-- Anthropic fallback provider
```

Future architecture additions:

- Streaming provider adapter.
- Brand voice and campaign brief models.
- Versioned draft document model.
- Review/comment model.
- Export job queue.
- Usage ledger for quota and cost controls.

## 6. Data Model Direction

Existing concepts:

- Project folder: groups related sessions and prompts.
- Chat session: one creative thread.
- Chat message: user/assistant messages in a session.
- Saved prompt: reusable prompt asset.
- Content type definition: system, tenant, or user-defined generation mode.
- Content generation: persisted generation result and provider metadata.

Planned concepts:

- Brand voice profile: tone, banned phrases, vocabulary, positioning, proof
  points, examples, and audience notes.
- Campaign brief: goal, audience, offer, channels, constraints, launch date,
  source links, and required assets.
- Draft document: editable generated content with version history.
- Variant set: channel/audience/tone variants linked to one source draft.
- Review item: comments, approvals, requested changes, and reviewer identity.
- Export job: markdown, HTML, PDF, docx, CMS payload, or social package.
- Usage ledger: provider, model, tokens, estimated cost, user, tenant, and
  project attribution.

## 7. Milestones

### Phase 0 - Workspace Baseline (Complete)

Deliverables:

- Next.js app scaffold.
- Authenticated shell.
- Health API.
- Provider fallback generation route.
- Basic prompt form and output card.

### Phase 1 - Persistence and Organization (Complete)

Deliverables:

- Project folders.
- Chat sessions.
- Chat messages.
- Saved prompts.
- Custom content type definitions.
- Ownership checks for all user-owned records.
- Tests for validation and server helpers.

### Phase 2 - Drafting Experience Upgrade (Next)

Goal: make the app feel like a writer's workspace instead of a response box.

Deliverables:

- Streaming response UI with cancel/retry behavior.
- Editable draft panel beside generation output.
- Save as draft from any generation.
- Draft autosave.
- Version history for regenerated drafts.
- Diff view between two draft versions.
- Copy/export actions for markdown, plain text, and HTML.
- Empty, loading, error, and truncated-output states polished.

Acceptance criteria:

- A user can generate, edit, save, regenerate, compare, and export a draft
  without leaving the workspace.
- Provider truncation is visible and offers a continuation action.

### Phase 3 - Brand Voice and Creative Memory

Goal: make outputs sound intentionally like the brand.

Deliverables:

- Brand voice profile CRUD.
- Voice profile fields for tone, audience, vocabulary, banned words, claims,
  differentiators, proof points, and examples.
- Prompt builder merges content type plus brand voice plus user prompt.
- Voice strength control: light, balanced, strict.
- Sample output preview for each brand voice profile.
- Tenant-level default voice and user-level personal voice.

Creative milestone:

- "Voice fingerprint" report: summarize a brand voice profile into strengths,
  risks, and consistency rules.

### Phase 4 - Campaign Briefs and Multi-Asset Generation

Goal: generate a coordinated campaign, not isolated text.

Deliverables:

- Campaign brief model and UI.
- Brief intake: objective, audience, pain points, offer, proof, CTA, channels,
  deadline, constraints, and source links.
- Multi-asset generation pack:
  - landing page section
  - announcement email
  - 5 social posts
  - SEO title/meta description
  - short sales blurb
  - FAQ block
- Asset checklist per campaign.
- Regenerate one asset without losing the rest.
- Campaign-level saved prompts and drafts.

Creative milestone:

- "Campaign remix" action that turns one brief into three angles: practical,
  emotional, and contrarian.

### Phase 5 - Review and Collaboration

Goal: support small team review without building a full enterprise CMS.

Deliverables:

- Share draft with tenant members.
- Comment threads on draft sections.
- Review states: draft, needs review, approved, archived.
- Change request summary.
- Activity timeline for draft changes and approvals.
- Role checks for owner, reviewer, and tenant admin.

Creative milestone:

- "Review digest" that asks AI to summarize unresolved comments and recommend
  the next editing pass.

### Phase 6 - Prompt Operations

Goal: turn prompts into measurable, reusable assets.

Deliverables:

- Prompt library with categories, tags, content type, owner, and usage count.
- Prompt version history.
- Prompt test bench with sample inputs and expected output rubric.
- Favorite and pin prompts.
- Prompt import/export as JSON.
- Prompt quality checklist before publishing to tenant users.

Creative milestone:

- "Prompt tournament" that runs two prompt versions against the same brief and
  compares clarity, specificity, structure, and brand fit.

### Phase 7 - Localization and Channel Variants

Goal: help content travel across audiences and markets.

Deliverables:

- Locale-aware generation with shared i18n package alignment.
- Tone and reading-level variants.
- Channel presets for LinkedIn, X, email, blog, landing page, docs, and support.
- Character/count constraints for social channels.
- Translation draft plus local adaptation notes.
- Country/language selector integration where useful.

Creative milestone:

- "Localization critic" that flags idioms, cultural assumptions, and claims that
  may not travel well.

### Phase 8 - Publishing and Export

Goal: move final content out of the workspace cleanly.

Deliverables:

- Export as markdown, HTML, plain text, PDF, and docx.
- Social pack ZIP export.
- Webhook-based publish target.
- Optional integrations plan for Notion, Google Docs, CMS, and email platforms.
- Export audit trail.
- Asset naming conventions by campaign and channel.

Creative milestone:

- "Launch packet" export: campaign brief, approved assets, social variants,
  metadata, and review summary in one package.

### Phase 9 - Usage, Cost, and Admin Controls

Goal: make AI usage visible and controllable.

Deliverables:

- Usage ledger by user, tenant, provider, model, project, and content type.
- Estimated cost dashboard.
- Quotas per user/tenant.
- Admin model selection defaults.
- Provider health dashboard.
- Redaction of sensitive prompt data from logs where needed.
- Retention controls for generations and drafts.

### Phase 10 - Creative Intelligence Layer

Goal: help users decide what to create next.

Deliverables:

- Content gap analyzer for a campaign or website section.
- Repurpose assistant: blog to email, email to social, webinar to article.
- SEO outline generator with search intent notes.
- A/B angle generator.
- Editorial calendar suggestions.
- Performance feedback import plan.

Creative milestone:

- "Content strategist mode" that proposes a 30-day campaign from one business
  objective and explains the sequencing.

## 8. Release Plan

1. Internal workspace release: current app plus docs and stable seed data.
2. Writer MVP: streaming, draft editor, save/export, and version history.
3. Brand voice beta: voice profiles and strict prompt composition.
4. Campaign beta: briefs plus multi-asset generation packs.
5. Team beta: comments, review states, and prompt library governance.
6. Public showcase: curated demo data, screenshots, architecture notes, and a
   short walkthrough from brief to launch packet.

## 9. Testing Plan

- Unit tests for validation, content type resolution, prompt construction, and
  provider response parsing.
- API tests for auth, ownership checks, folder/session/message lifecycle, and
  generation failure paths.
- UI tests for generation, project switching, saved prompts, and drafts.
- Snapshot-style tests for prompt builders once brand voice and campaign briefs
  exist.
- Manual QA for provider fallback, empty states, truncation, exports, and mobile
  viewport layout.

## 10. Operational Risks

- Generic output quality. Mitigation: brand voice, campaign context, rubrics,
  and prompt testing.
- Provider cost creep. Mitigation: usage ledger, quotas, model defaults, and
  cost dashboards.
- Prompt/data privacy. Mitigation: tenant boundaries, retention settings, and
  careful logging.
- Collaboration complexity. Mitigation: keep v1 review states simple.
- Export sprawl. Mitigation: start with file exports before direct publishing.

## 11. Out of Scope for v1

- Fully automated publishing to every channel.
- Enterprise approval chains.
- Real-time multiplayer editing.
- Long-form knowledge base ingestion.
- Plagiarism guarantees.
- Autonomous campaign execution.

## 12. Documentation Ownership

- App operations: `apps/content-generator/README.md`
- Product and milestone plan: this file
- Database truth: `packages/db/prisma/schema.prisma`
- Provider behavior: `apps/content-generator/lib/server/generation.ts`
- Prompt/content type behavior: `apps/content-generator/lib/server/content-types.ts`

Update this plan whenever a milestone moves from planned to complete or when the
creative workflow changes shape.
