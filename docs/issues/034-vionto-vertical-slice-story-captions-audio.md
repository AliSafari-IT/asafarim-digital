# Vionto Vertical Slice Issue 2 - Vision Captions, Story Persistence, and Voice Selection

**Status:** Ready for development  
**Priority:** Critical  
**Assignee:** TBD  
**Labels:** `vionto`, `web`, `vertical-slice`, `ai`, `story`, `tts`, `mvp`

## Objective

Make Vionto generate an image-aware story from real project assets, persist script/SRT versions, and let the user choose narration voice with TTS preview before rendering.

This is the second step in the end-to-end MVP path:

```text
Persisted assets -> Vision captions + EXIF summary -> Story/SRT -> Voice + audio settings
```

## Source Review Notes

- `/api/story/generate` can accept `captions`, `exifSummary`, `mode`, `locale`, and `userNotes`.
- The UI does not currently pass real project asset captions or EXIF summary into story generation.
- `ViontoScript` exists in Prisma and `/api/story/[scriptId]` supports saved edits.
- `ScriptEditor` only receives client-created versions from the current browser session.
- `apps/vionto/lib/server/tts.ts` has a voice catalog and provider abstraction.
- Audio APIs exist for voices, previews, and tracks, but the main UI does not yet include voice selection or saved audio settings.

## Scope

- [ ] Add a vision-captioning service for each uploaded project image.
- [ ] Persist image captions and caption provider metadata on `ViontoAsset.metadata` or a dedicated caption field/model.
- [ ] Build a deterministic EXIF summary from project assets: date range, locations when available, camera/orientation hints, and image count.
- [ ] Update story generation to query project assets server-side instead of depending on client-supplied captions.
- [ ] Feed captions, EXIF summary, selected mode, selected locale, and user notes into the LLM prompt.
- [ ] Save generated narration and SRT as `ViontoScript` records.
- [ ] Make the script editor load persisted script versions on page load.
- [ ] Keep script edits persisted with `isUserEdited = true`.
- [ ] Add voice selection UI using `/api/audio/voices`.
- [ ] Add TTS preview using `/api/audio/preview`.
- [ ] Save selected voice/audio settings as `ViontoAudioTrack` or project audio preferences.

## Acceptance Criteria

- Story generation works from real project images after upload.
- Generated narration references visible image content, not only user notes.
- Generated SRT is valid and saved with the script.
- Refreshing the page preserves script versions and current edited script.
- Users can preview at least one voice and save a selected narration voice.
- The render step can identify the selected script and voice/audio settings from the database.
- Locale selection affects both UI and generated story language.

## Test Plan

- Add tests for caption prompt input and caption persistence.
- Add story-generation tests with multiple captions and EXIF summaries.
- Add SRT validation tests for generated/fallback SRT.
- Add API tests for loading, saving, and regenerating script versions.
- Add TTS preview tests for missing provider key, invalid voice id, and successful provider response.
- Manual QA: upload 3 distinct images, generate story, verify the text mentions image-specific content.

## Dependencies

- Issue `033` must provide persisted `ViontoAsset` records.
- At least one AI provider key must be configured for story generation.
- At least one TTS provider key must be configured for real preview audio.
