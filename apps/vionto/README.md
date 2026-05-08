# Vionto

Vionto is the photo-to-story video app in the ASafariM Digital workspace. The MVP direction is an AI-assisted workflow that turns image collections into narrated MP4 videos with generated scripts, subtitles, TTS narration, optional background music, and FFmpeg rendering.

## Development

```bash
pnpm --filter vionto dev
```

Local URL: `http://localhost:3006`

For local upload testing without DigitalOcean Spaces credentials, set:

```bash
VIONTO_STORAGE_DRIVER=local
```

Unset that variable, or set it to `spaces`, when using real Spaces credentials.

## Current Scope

- Next.js app shell for the Vionto creator workspace.
- Upload, story, narration, render, and export UI placeholders.
- Health endpoint at `/api/health`.
- Docker build target for production deployment.

## Planned Integrations

- S3-compatible object storage for originals, thumbnails, and exports.
- Redis/BullMQ queue for async processing.
- Managed LLM and TTS vendors for story and narration generation.
- FFmpeg worker container for MP4 assembly.
