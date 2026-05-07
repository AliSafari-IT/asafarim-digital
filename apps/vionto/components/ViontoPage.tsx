"use client";

import { useState, useCallback } from "react";
import { useTranslation } from "@asafarim/shared-i18n";
import {
  ArrowRight,
  Captions,
  Clapperboard,
  CloudUpload,
  Download,
  FileAudio,
  ImagePlus,
  ListChecks,
  Mic2,
  Sparkles,
  Wand2,
} from "lucide-react";
import { ScriptEditor, type ScriptVersion } from "./ScriptEditor";

export function ViontoPage() {
  const { t } = useTranslation();

  const [versions, setVersions] = useState<ScriptVersion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const pipelineSteps = [
    {
      icon: ImagePlus,
      titleKey: "vionto.pipeline.ingest",
      detailKey: "vionto.pipeline.ingestDetail",
    },
    {
      icon: Sparkles,
      titleKey: "vionto.pipeline.write",
      detailKey: "vionto.pipeline.writeDetail",
    },
    {
      icon: Mic2,
      titleKey: "vionto.pipeline.narrate",
      detailKey: "vionto.pipeline.narrateDetail",
    },
    {
      icon: Clapperboard,
      titleKey: "vionto.pipeline.render",
      detailKey: "vionto.pipeline.renderDetail",
    },
  ];

  const modes = ["cinematic", "slideshow", "social"] as const;
  const [activeMode, setActiveMode] = useState<string>("cinematic");

  const queueItems = [
    ["Captioning", "12 images processed"],
    ["Script", "Narrative draft ready"],
    ["Voice", "Warm alto selected"],
    ["Render", "Preview MP4 queued"],
  ];

  const handleGenerate = useCallback(async (_projectId: string) => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/story/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: "demo-project",
          locale: "en",
          mode: "story",
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        alert(data.error ?? "Generation failed");
        return;
      }
      const data = (await res.json()) as {
        scriptId: string;
        narration: string;
        srt: string;
        provider: string;
        model: string;
      };
      setVersions((prev) => [
        {
          id: data.scriptId,
          narrationText: data.narration,
          srtText: data.srt,
          provider: data.provider,
          model: data.model,
          promptVersion: "vionto-story-v1",
          isUserEdited: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleSave = useCallback(async (scriptId: string, narration: string, srt: string) => {
    const res = await fetch(`/api/story/${scriptId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ narrationText: narration, srtText: srt }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      alert(data.error ?? "Save failed");
      return;
    }
    setVersions((prev) =>
      prev.map((v) => (v.id === scriptId ? { ...v, narrationText: narration, srtText: srt, isUserEdited: true } : v))
    );
  }, []);

  return (
    <main className="min-h-screen bg-[var(--surface)] text-[var(--text)]">
      <section className="workspace-shell">
        <aside className="sidebar" aria-label="Vionto workspace navigation">
          <div className="brand-lockup">
            <div className="brand-mark">Vi</div>
            <div>
              <p className="brand-name">Vionto</p>
              <p className="brand-subtitle">Vision + Canto</p>
            </div>
          </div>

          <nav className="nav-list" aria-label="Primary">
            <a className="nav-item active" href="#create">
              <Wand2 size={18} /> {t("vionto.nav.create")}
            </a>
            <a className="nav-item" href="#uploads">
              <CloudUpload size={18} /> {t("vionto.nav.uploads")}
            </a>
            <a className="nav-item" href="#script">
              <Captions size={18} /> {t("vionto.nav.script")}
            </a>
            <a className="nav-item" href="#audio">
              <FileAudio size={18} /> {t("vionto.nav.audio")}
            </a>
            <a className="nav-item" href="#export">
              <Download size={18} /> {t("vionto.nav.export")}
            </a>
          </nav>

          <div className="sidebar-panel">
            <p className="panel-label">MVP target</p>
            <strong>First MP4 in 10 minutes</strong>
            <span>For 30-60 images with a narrated story and subtitles.</span>
          </div>
        </aside>

        <section className="main-panel">
          <header className="topbar">
            <div>
              <p className="eyebrow">Photo-to-story video MVP</p>
              <h1>Turn memories into poetic motion.</h1>
            </div>
            <a className="portal-link" href={process.env.NEXT_PUBLIC_PORTAL_URL ?? "http://localhost:3000"}>
              ASafariM Portal <ArrowRight size={16} />
            </a>
          </header>

          <div className="creator-grid" id="create">
            <section className="upload-panel" id="uploads" aria-labelledby="upload-title">
              <div>
                <p className="eyebrow">{t("common.loading")}</p>
                <h2 id="upload-title">{t("vionto.upload.title")}</h2>
                <p>{t("vionto.upload.subtitle")}</p>
              </div>

              <div className="dropzone">
                <CloudUpload size={34} />
                <strong>{t("vionto.upload.dropzoneLabel")}</strong>
                <span>{t("vionto.upload.dropzoneHint")}</span>
              </div>

              <div className="mode-row" aria-label="Video mode presets">
                {modes.map((mode) => (
                  <button
                    key={mode}
                    className={mode === activeMode ? "mode active" : "mode"}
                    type="button"
                    onClick={() => setActiveMode(mode)}
                  >
                    {t(`vionto.mode.${mode}`)}
                  </button>
                ))}
              </div>
            </section>

            <section className="preview-panel" aria-labelledby="preview-title">
              <div className="preview-frame">
                <div className="film-strip">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <div className="video-stage">
                  <div className="sun" />
                  <div className="horizon" />
                  <p>Summer evening, narrated with warmth.</p>
                </div>
              </div>
              <div className="preview-copy">
                <p className="eyebrow">Preview</p>
                <h2 id="preview-title">Cinematic draft</h2>
                <p>16:9 MP4, H.264 video, AAC audio, subtitles burned in or exported as SRT.</p>
              </div>
            </section>
          </div>

          <section className="pipeline" aria-label="Vionto production pipeline">
            {pipelineSteps.map((step) => {
              const Icon = step.icon;
              return (
                <article className="pipeline-step" key={step.titleKey}>
                  <Icon size={20} />
                  <h3>{t(step.titleKey)}</h3>
                  <p>{t(step.detailKey)}</p>
                </article>
              );
            })}
          </section>

          <section className="status-grid">
            <div className="script-editor" id="script">
              <ScriptEditor
                versions={versions}
                projectId="demo-project"
                onGenerate={handleGenerate}
                onSave={handleSave}
                isGenerating={isGenerating}
              />
            </div>

            <div className="job-card" id="export">
              <div className="section-heading">
                <ListChecks size={20} />
                <h2>{t("vionto.render.title")}</h2>
              </div>
              <ul>
                {queueItems.map(([label, detail]) => (
                  <li key={label}>
                    <span>{label}</span>
                    <strong>{detail}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}
