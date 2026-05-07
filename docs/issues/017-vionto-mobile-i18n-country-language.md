# Vionto Mobile Issue 3 - Mobile i18n and Country/Language Selection

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `vionto`, `mobile`, `i18n`, `localization`, `shared-packages`

## Objective

Implement scalable mobile localization for Vionto using the shared ASafariM i18n packages and a country/language selection model that can expand beyond MVP locales.

## Source Review Notes

- `@asafarim/shared-i18n` exists locally in `packages/shared-i18n`.
- It exports `I18nProvider`, `useTranslation`, server locale helpers, dictionaries, and locale cookie utilities.
- `@asafarim/country-language-selector` exists locally in `packages/country-language-selector`.
- The selector currently targets web React UI, so mobile may need a native/mobile adapter over the same locale data.
- Existing locales include English, Dutch, French, and German base dictionaries.

## Scope

- [ ] Add Vionto mobile dictionary namespace for upload, story, audio, preview, export, account, errors, and quotas.
- [ ] Reuse locale types and dictionaries from `@asafarim/shared-i18n`.
- [ ] Add a mobile country/language selector that consumes the same country/locale data as `@asafarim/country-language-selector`.
- [ ] Persist locale in mobile storage and sync it to API requests.
- [ ] Define fallback behavior when a script is generated in one locale and UI is switched to another.
- [ ] Add locale-aware date, duration, currency, file size, and render-status formatting.

## Acceptance Criteria

- Vionto mobile can switch between supported locales without app restart.
- All mobile screens avoid hard-coded user-facing strings.
- API calls include the active locale when generating story and narration.
- Country/language state can scale to new locales without changing screen logic.
- Web and mobile share dictionary keys where possible.

## Test Plan

- Add dictionary completeness checks for Vionto mobile keys.
- Add unit tests for locale fallback.
- Manual QA for English, Dutch, French, and German.
- Verify generated SRT/narration language follows the selected locale.
