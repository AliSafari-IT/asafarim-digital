# Vionto Mobile Issue 5 - Story, Subtitle, and Audio Editing

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `vionto`, `mobile`, `story`, `audio`, `ux`

## Objective

Create a mobile editing flow that lets users review the generated story, adjust subtitles, choose narration voice, and add background music before rendering.

## Source Review Notes

- `docs/vionto-project-plan.md` defines script editing, SRT generation, TTS, MP3 upload, and ducking.
- `apps/vionto` currently displays static placeholder story/audio UI.
- No Vionto API routes exist yet for story generation, SRT, TTS, or audio mixing.

## Scope

- [ ] Add mobile story review screen with editable narration text.
- [ ] Add subtitle segment view with timings and validation.
- [ ] Add voice selection UI with preview clips.
- [ ] Add background MP3 picker/import flow.
- [ ] Add ducking and narration/music balance controls.
- [ ] Add autosave draft behavior for mobile interruptions.
- [ ] Add warnings for edits that make subtitle timing unrealistic.
- [ ] Support regenerate-story action with explicit overwrite confirmation.

## Acceptance Criteria

- Users can edit and save story text on mobile.
- Subtitle timings remain valid after edits or are flagged before render.
- Voice and music choices are reflected in the render manifest.
- Draft edits survive app backgrounding.
- All editing UI is reachable with one-handed mobile ergonomics.

## Test Plan

- Add mobile component tests for editor state and validation.
- Add API contract tests for saving script and audio preferences.
- Manual QA with long text, empty text, and locale-specific characters.
- Verify render manifest contains the selected voice/music values.
