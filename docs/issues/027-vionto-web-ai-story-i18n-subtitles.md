# Vionto Web Issue 5 - AI Story Generation, i18n, and Subtitles

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `vionto`, `web`, `ai`, `i18n`, `subtitles`

## Objective

Build the multilingual story-generation and subtitle pipeline for Vionto web using shared ASafariM i18n packages and provider metadata.

## Source Review Notes

- `@asafarim/shared-i18n` provides locale types, provider, server translator, dictionaries, and fallback behavior.
- `@asafarim/country-language-selector` provides country/language UI data for web React.
- Vionto currently has hard-coded English UI strings.
- The MVP plan requires LLM narrative generation and SRT subtitle generation.

## Scope

- [ ] Wrap Vionto layout with `I18nProvider`.
- [ ] Add Vionto dictionaries for upload, script, audio, render, export, billing, and errors.
- [ ] Add `CountryLanguageSelector` to Vionto web settings/header.
- [ ] Pass selected locale, mode, user notes, captions, and EXIF metadata into story prompts.
- [ ] Generate narration text and valid SRT output.
- [ ] Persist prompt version, provider, model, token counts, and latency.
- [ ] Add script editor with save/regenerate/version behavior.

## Acceptance Criteria

- Vionto web UI is localized through shared dictionary keys.
- Story generation follows selected locale and mode.
- SRT output validates against standard timing format.
- Users can edit script before TTS/render.
- Prompt/provider metadata is persisted for audit and quality analysis.

## Test Plan

- Add dictionary completeness tests.
- Add SRT generation tests for timing, escaping, and empty lines.
- Add prompt-input snapshot tests for each mode/locale.
- Manual QA for English, Dutch, French, and German.
