"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
import { ViontoTopbarControls } from "./ViontoNav";

function ViontoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="vm-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f36f56" />
          <stop offset="100%" stopColor="#e8b45d" />
        </linearGradient>
      </defs>
      <rect x="4" y="9" width="28" height="19" rx="3" stroke="url(#vm-g)" strokeWidth="1.8" />
      <rect x="4" y="11" width="3" height="2.5" rx="0.5" fill="url(#vm-g)" opacity="0.65" />
      <rect x="4" y="15.5" width="3" height="2.5" rx="0.5" fill="url(#vm-g)" opacity="0.65" />
      <rect x="29" y="11" width="3" height="2.5" rx="0.5" fill="url(#vm-g)" opacity="0.65" />
      <rect x="29" y="15.5" width="3" height="2.5" rx="0.5" fill="url(#vm-g)" opacity="0.65" />
      <path d="M14 14.5 L14 22 M18 12 L18 24 M22 14.5 L22 22" stroke="url(#vm-g)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "#create",  labelKey: "vionto.nav.create",  Icon: Wand2 },
  { href: "#uploads", labelKey: "vionto.nav.uploads", Icon: CloudUpload },
  { href: "#script",  labelKey: "vionto.nav.script",  Icon: Captions },
  { href: "#audio",   labelKey: "vionto.nav.audio",   Icon: FileAudio },
  { href: "#export",  labelKey: "vionto.nav.export",  Icon: Download },
] as const;

const UI_MODE_TO_API_MODE: Record<string, "story" | "slideshow" | "documentary"> = {
  cinematic: "story",
  slideshow: "slideshow",
  social: "documentary",
};

export function ViontoPage() {
  const { t, locale } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage.getItem("vionto:sidebar") === "collapsed") {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("vionto:sidebar", collapsed ? "collapsed" : "expanded");
    }
  }, [collapsed]);

  const [versions, setVersions] = useState<ScriptVersion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userNotes, setUserNotes] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED = [".jpg", ".jpeg", ".png", ".heic", ".webp", ".zip"];
  const acceptedMime = "image/jpeg,image/png,image/heic,image/webp,application/zip,.heic,.zip";

  function addFiles(files: FileList | null) {
    if (!files) return;
    const valid = Array.from(files).filter((f) => {
      const ext = "." + f.name.split(".").pop()?.toLowerCase();
      return ACCEPTED.includes(ext);
    });
    setUploadedFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...valid.filter((f) => !names.has(f.name))];
    });
  }

  function handleDropzoneDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }

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
      const apiMode = UI_MODE_TO_API_MODE[activeMode] ?? "story";
      const res = await fetch("/api/story/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: "demo-project",
          locale: locale.split("-")[0] ?? "en",
          mode: apiMode,
          userNotes: userNotes.trim() || undefined,
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
  }, [locale, activeMode, userNotes]);

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
    <main className="min-h-screen text-[var(--text)]" style={{ background: 'var(--color-bg)' }}>
      <section className="workspace-shell">
        {/* ─── Sidebar ─────────────────────────────────────────────── */}
        <aside
          aria-label="Vionto workspace navigation"
          className={`sticky top-0 h-screen flex-shrink-0 flex flex-col border-r border-[var(--line)] backdrop-blur-[18px] transition-all duration-200 ${
            collapsed ? "w-[72px]" : "w-64"
          }`}
          style={{ background: "rgba(18,20,22,0.92)" }}
        >
          {/* Logo + collapse toggle */}
          <div className={`flex h-14 items-center border-b border-[var(--line)] ${
            collapsed ? "justify-center px-2" : "justify-between px-4"
          }`}>
            <a href="/" className="flex items-center gap-2.5 overflow-hidden" aria-label="Vionto home">
              <ViontoMark className="h-8 w-8 shrink-0" />
              {!collapsed && (
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-bold tracking-tight" style={{ color: "var(--text)" }}>Vionto</span>
                  <span className="text-[10px]" style={{ color: "var(--muted)" }}>Vision + Canto</span>
                </div>
              )}
            </a>
            {!collapsed && (
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
                className="h-7 w-7 flex items-center justify-center rounded-md transition-colors"
                style={{ color: "var(--muted)" }}
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            {collapsed && (
              <button
                type="button"
                onClick={() => setCollapsed(false)}
                title="Expand sidebar"
                aria-label="Expand sidebar"
                className="mt-1 h-7 w-7 flex items-center justify-center rounded-md transition-colors"
                style={{ color: "var(--muted)" }}
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Primary">
            <ul className="space-y-0.5">
              {NAV_ITEMS.map(({ href, labelKey, Icon }, idx) => (
                <li key={href}>
                  <a
                    href={href}
                    title={collapsed ? t(labelKey) : undefined}
                    className={`group flex items-center gap-3 rounded-lg py-2 text-sm transition-colors ${
                      collapsed ? "justify-center px-2" : "px-3"
                    } ${
                      idx === 0
                        ? "bg-[var(--color-primary-soft)] text-[var(--text)]"
                        : "text-[var(--muted)] hover:bg-white/[0.04] hover:text-[var(--text)]"
                    }`}
                  >
                    <Icon size={16} className="shrink-0" />
                    {!collapsed && <span>{t(labelKey)}</span>}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer MVP panel */}
          {!collapsed && (
            <div className="mx-3 mb-3 rounded-2xl border border-[var(--line)] p-3" style={{ background: "rgba(16,17,18,0.56)" }}>
              <p className="panel-label">MVP target</p>
              <strong className="text-xs" style={{ color: "var(--text)" }}>First MP4 in 10 minutes</strong>
              <span className="text-xs" style={{ color: "var(--muted)", lineHeight: 1.5, display: "block", marginTop: 2 }}>30–60 images → narrated story + subtitles.</span>
            </div>
          )}
        </aside>

        <section className="main-panel">
          <header className="topbar">
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <span className="hidden text-[var(--muted)] sm:inline">ASafariM</span>
              <span className="hidden text-[var(--muted)] sm:inline">/</span>
              <span className="hidden text-[var(--muted)] md:inline">Vionto</span>
              <span className="hidden text-[var(--muted)] md:inline">/</span>
              <span className="truncate font-medium text-[var(--text)]">Create</span>
            </div>
            <div className="flex items-center gap-2">
              <ViontoTopbarControls />
              <a className="portal-link" href={process.env.NEXT_PUBLIC_PORTAL_URL ?? "http://localhost:3000"}>
                ASafariM Portal <ArrowRight size={16} />
              </a>
            </div>
          </header>

          <div className="px-5 pt-5 pb-1">
            <p className="eyebrow">Photo-to-story video MVP</p>
            <h1 className="mt-1 text-2xl font-semibold" style={{ fontSize: "1.5rem", lineHeight: 1.25 }}>Turn memories into poetic motion.</h1>
          </div>

          <div className="creator-grid" id="create">
            <section className="upload-panel" id="uploads" aria-labelledby="upload-title">
              <div>
                <p className="eyebrow">{t("common.loading")}</p>
                <h2 id="upload-title">{t("vionto.upload.title")}</h2>
                <p>{t("vionto.upload.subtitle")}</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedMime}
                multiple
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />

              <div
                className="dropzone"
                role="button"
                tabIndex={0}
                aria-label="Upload images or zip file"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDropzoneDrop}
                style={isDragging ? { borderColor: "var(--coral)", background: "rgba(243,111,86,0.12)" } : undefined}
              >
                <CloudUpload size={34} style={{ color: isDragging ? "var(--coral)" : undefined }} />
                <strong>{uploadedFiles.length > 0 ? `${uploadedFiles.length} file${uploadedFiles.length > 1 ? "s" : ""} selected` : t("vionto.upload.dropzoneLabel")}</strong>
                <span>{t("vionto.upload.dropzoneHint")}</span>
              </div>

              {uploadedFiles.length > 0 && (
                <ul className="mt-1 space-y-1">
                  {uploadedFiles.slice(0, 5).map((f) => (
                    <li key={f.name} className="flex items-center justify-between rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs">
                      <span className="truncate text-[var(--text)]">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => setUploadedFiles((prev) => prev.filter((x) => x.name !== f.name))}
                        className="ml-2 shrink-0 text-[var(--muted)] hover:text-[var(--coral)] transition-colors"
                        aria-label={`Remove ${f.name}`}
                      >✕</button>
                    </li>
                  ))}
                  {uploadedFiles.length > 5 && (
                    <li className="px-3 py-1 text-xs text-[var(--muted)]">+{uploadedFiles.length - 5} more</li>
                  )}
                </ul>
              )}

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

              <div className="mt-3">
                <label htmlFor="user-notes" className="text-xs font-medium text-[var(--color-text-muted)]">
                  Notes for the narrator
                </label>
                <textarea
                  id="user-notes"
                  className="mt-1 min-h-[60px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="e.g. Focus on the sunset and family moments. Keep it nostalgic."
                  maxLength={2000}
                />
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
