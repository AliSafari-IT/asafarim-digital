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
  Mic,
  Play,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
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
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [voices, setVoices] = useState<Array<{ id: string; name: string; locale: string; gender?: string }>>([]);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Project state
  const [projects, setProjects] = useState<Array<{ id: string; title: string; status: string; createdAt: string }>>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // Upload state
  const [uploadSessionId, setUploadSessionId] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Array<{
    file: File;
    key: string;
    status: "pending" | "uploading" | "complete" | "error";
    progress: number;
    error?: string;
  }>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Assets state (persisted)
  const [projectAssets, setProjectAssets] = useState<Array<{
    id: string;
    originalUrl: string;
    thumbnailUrl: string | null;
    width: number | null;
    height: number | null;
    orderIndex: number;
  }>>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);

  const ACCEPTED = [".jpg", ".jpeg", ".png", ".heic", ".webp", ".zip"];
  const acceptedMime = "image/jpeg,image/png,image/heic,image/webp,application/zip,.heic,.zip";

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Load assets when project is selected
  useEffect(() => {
    if (selectedProjectId) {
      loadProjectAssets(selectedProjectId);
      loadProjectScripts(selectedProjectId);
      loadProjectAudioSettings(selectedProjectId);
      loadVoices(locale.split("-")[0] ?? "en");
    } else {
      setProjectAssets([]);
      setVersions([]);
      setSelectedVoice(null);
    }
  }, [selectedProjectId, locale]);

  async function loadProjects() {
    setIsLoadingProjects(true);
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) return;
      const data = await res.json();
      setProjects(data.data || []);
    } catch (error) {
      console.error("Failed to load projects", error);
    } finally {
      setIsLoadingProjects(false);
    }
  }

  async function loadProjectAssets(projectId: string) {
    setIsLoadingAssets(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/assets`);
      if (!res.ok) return;
      const data = await res.json();
      setProjectAssets(data.assets || []);
    } catch (error) {
      console.error("Failed to load assets", error);
    } finally {
      setIsLoadingAssets(false);
    }
  }

  async function loadProjectScripts(projectId: string) {
    try {
      const res = await fetch(`/api/projects/${projectId}/scripts`);
      if (!res.ok) return;
      const data = await res.json();
      setVersions(data.scripts || []);
    } catch (error) {
      console.error("Failed to load scripts", error);
    }
  }

  async function loadProjectAudioSettings(projectId: string) {
    try {
      const res = await fetch(`/api/audio/tracks?projectId=${projectId}`);
      if (!res.ok) return;
      const data = await res.json();
      const tracks = data.tracks || [];
      const narrationTrack = tracks.find((t: any) => t.type === "narration");
      if (narrationTrack?.voiceId) {
        setSelectedVoice(narrationTrack.voiceId);
      }
    } catch (error) {
      console.error("Failed to load audio settings", error);
    }
  }

  async function loadVoices(locale: string) {
    try {
      const res = await fetch(`/api/audio/voices?locale=${locale}`);
      if (!res.ok) return;
      const data = await res.json();
      setVoices(data.voices || []);
    } catch (error) {
      console.error("Failed to load voices", error);
    }
  }

  async function saveVoiceSelection(voiceId: string) {
    if (!selectedProjectId) return;
    try {
      const res = await fetch("/api/audio/tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          type: "narration",
          source: "tts",
          voiceId,
        }),
      });
      if (!res.ok) {
        console.error("Failed to save voice selection");
      }
    } catch (error) {
      console.error("Failed to save voice selection", error);
    }
  }

  async function deleteAsset(assetId: string) {
    if (!selectedProjectId) return;
    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/assets?assetId=${assetId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        alert("Failed to delete asset");
        return;
      }
      await loadProjectAssets(selectedProjectId);
    } catch (error) {
      console.error("Failed to delete asset", error);
      alert("Failed to delete asset");
    }
  }

  async function createProject() {
    if (!newProjectTitle.trim()) return;
    setIsCreatingProject(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newProjectTitle.trim(), mode: "story", locale: locale.split("-")[0] ?? "en" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to create project" }));
        alert(data.error);
        return;
      }
      const project = await res.json();
      await loadProjects();
      setSelectedProjectId(project.id);
      setNewProjectTitle("");
    } catch (error) {
      console.error("Failed to create project", error);
      alert("Failed to create project");
    } finally {
      setIsCreatingProject(false);
    }
  }

  function addFiles(files: FileList | null) {
    if (!files) return;
    const valid = Array.from(files).filter((f) => {
      const ext = "." + f.name.split(".").pop()?.toLowerCase();
      return ACCEPTED.includes(ext);
    });
    setUploadingFiles((prev) => {
      const names = new Set(prev.map((f) => f.file.name));
      return [...prev, ...valid.filter((f) => !names.has(f.name)).map((f) => ({
        file: f,
        key: "",
        status: "pending" as const,
        progress: 0,
      }))];
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
      icon: Mic,
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

  async function startUploads() {
    if (!selectedProjectId) {
      alert("Please select or create a project first");
      return;
    }
    if (uploadingFiles.length === 0) return;

    setIsUploading(true);

    // Create upload session
    try {
      const sessionRes = await fetch("/api/uploads/session", { method: "POST" });
      if (!sessionRes.ok) {
        alert("Failed to create upload session");
        setIsUploading(false);
        return;
      }
      const sessionData = await sessionRes.json();
      setUploadSessionId(sessionData.sessionId);
      let completedUploads = 0;

      // Upload each file
      for (let i = 0; i < uploadingFiles.length; i++) {
        const fileUpload = uploadingFiles[i];
        if (fileUpload.status === "complete") {
          completedUploads += 1;
          continue;
        }

        setUploadingFiles((prev) => {
          const updated = [...prev];
          updated[i] = { ...updated[i], status: "uploading", progress: 0 };
          return updated;
        });

        try {
          // Presign
          const presignRes = await fetch("/api/uploads/presign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: fileUpload.file.name,
              contentType: fileUpload.file.type || "image/jpeg",
              sizeBytes: fileUpload.file.size,
              sessionId: sessionData.sessionId,
            }),
          });
          if (!presignRes.ok) {
            throw new Error("Presign failed");
          }
          const presignData = await presignRes.json();

          // Upload to storage via proxy to handle authentication properly
          const form = new FormData();
          form.append("key", presignData.key);
          form.append("file", fileUpload.file);
          const uploadRes = await fetch("/api/uploads/proxy", {
            method: "POST",
            body: form,
          });
          if (!uploadRes.ok) {
            const message = await uploadRes.text().catch(() => "");
            throw new Error(message || "Storage upload failed");
          }

          // Complete
          const completeRes = await fetch("/api/uploads/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              key: presignData.key,
              sessionId: sessionData.sessionId,
              metadata: {
                filename: fileUpload.file.name,
                contentType: fileUpload.file.type || "image/jpeg",
                sizeBytes: fileUpload.file.size,
              },
            }),
          });
          if (!completeRes.ok) {
            const message = await completeRes.text().catch(() => "");
            throw new Error(message || "Upload completion failed");
          }

          setUploadingFiles((prev) => {
            const updated = [...prev];
            updated[i] = { ...updated[i], status: "complete", progress: 100, key: presignData.key };
            return updated;
          });
          completedUploads += 1;
        } catch (error) {
          console.error("Upload failed", error);
          setUploadingFiles((prev) => {
            const updated = [...prev];
            updated[i] = { ...updated[i], status: "error", error: error instanceof Error ? error.message : "Upload failed" };
            return updated;
          });
        }
      }

      if (completedUploads === 0) {
        alert("No files uploaded successfully. Check the failed file rows and retry.");
        return;
      }

      // Promote session to project assets
      const promoteRes = await fetch(`/api/projects/${selectedProjectId}/assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionData.sessionId, clearSession: true }),
      });
      if (promoteRes.ok) {
        await loadProjectAssets(selectedProjectId);
        setUploadingFiles([]);
        setUploadSessionId(null);
      }
    } catch (error) {
      console.error("Upload flow failed", error);
      alert("Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  function removeUpload(index: number) {
    setUploadingFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function retryUpload(index: number) {
    setUploadingFiles((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status: "pending", progress: 0, error: undefined };
      return updated;
    });
  }

  const handleGenerate = useCallback(async () => {
    if (!selectedProjectId) {
      alert("Please select or create a project first");
      return;
    }
    setIsGenerating(true);
    try {
      const apiMode = UI_MODE_TO_API_MODE[activeMode] ?? "story";
      const res = await fetch("/api/story/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
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
  }, [locale, activeMode, userNotes, selectedProjectId]);

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

              {/* Project picker */}
              <div className="mt-3">
                <label className="text-xs font-medium text-[var(--color-text-muted)]">Project</label>
                <div className="mt-1 flex gap-2">
                  <select
                    className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                    value={selectedProjectId ?? ""}
                    onChange={(e) => setSelectedProjectId(e.target.value || null)}
                    disabled={isLoadingProjects || isUploading}
                  >
                    <option value="">Select a project...</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsCreatingProject(true)}
                    disabled={isUploading}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-accent)]/90 disabled:opacity-50"
                  >
                    <Plus size={16} /> New
                  </button>
                </div>

                {/* Create project modal */}
                {isCreatingProject && (
                  <div className="mt-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                    <input
                      type="text"
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                      placeholder="Project title"
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && createProject()}
                      autoFocus
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => { setIsCreatingProject(false); setNewProjectTitle(""); }}
                        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-1.5 text-sm text-[var(--color-text)] transition hover:bg-[var(--color-surface)]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={createProject}
                        disabled={!newProjectTitle.trim() || isCreatingProject}
                        className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[var(--color-accent)]/90 disabled:opacity-50"
                      >
                        {isCreatingProject ? <RefreshCw size={14} className="animate-spin" /> : "Create"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload dropzone */}
              {selectedProjectId && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedMime}
                    multiple
                    className="hidden"
                    onChange={(e) => addFiles(e.target.files)}
                    disabled={isUploading}
                  />

                  <div
                    className="dropzone"
                    role="button"
                    tabIndex={0}
                    aria-label="Upload images or zip file"
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    onKeyDown={(e) => e.key === "Enter" && !isUploading && fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDropzoneDrop}
                    style={isDragging ? { borderColor: "var(--coral)", background: "rgba(243,111,86,0.12)" } : undefined}
                  >
                    <CloudUpload size={34} style={{ color: isDragging ? "var(--coral)" : undefined }} />
                    <strong>{uploadingFiles.length > 0 ? `${uploadingFiles.length} file${uploadingFiles.length > 1 ? "s" : ""} selected` : t("vionto.upload.dropzoneLabel")}</strong>
                    <span>{t("vionto.upload.dropzoneHint")}</span>
                  </div>

                  {/* Upload list with progress */}
                  {uploadingFiles.length > 0 && (
                    <ul className="mt-1 space-y-1">
                      {uploadingFiles.slice(0, 5).map((f, i) => (
                      <li key={i} className="flex items-center gap-2 rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs">
                        <span className="min-w-0 flex-1 truncate text-[var(--text)]">{f.file.name}</span>
                        {f.status === "uploading" && <RefreshCw size={14} className="animate-spin text-[var(--muted)]" />}
                        {f.status === "complete" && <span className="text-[var(--coral)]">✓</span>}
                        {f.status === "error" && (
                          <button
                            type="button"
                            onClick={() => retryUpload(i)}
                            className="text-[var(--muted)] hover:text-[var(--text)]"
                            aria-label="Retry"
                          >
                            <RefreshCw size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeUpload(i)}
                          disabled={f.status === "uploading"}
                          className="shrink-0 text-[var(--muted)] hover:text-[var(--coral)] transition-colors disabled:opacity-50"
                          aria-label={`Remove ${f.file.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </li>
                      ))}
                      {uploadingFiles.length > 5 && (
                        <li className="px-3 py-1 text-xs text-[var(--muted)]">+{uploadingFiles.length - 5} more</li>
                      )}
                    </ul>
                  )}

                  {/* Upload button */}
                  {uploadingFiles.length > 0 && (
                    <button
                      type="button"
                      onClick={startUploads}
                      disabled={isUploading || uploadingFiles.every((f) => f.status === "complete")}
                      className="mt-2 w-full rounded-lg bg-[var(--color-accent)] px-3 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-accent)]/90 disabled:opacity-50"
                    >
                      {isUploading ? <RefreshCw size={16} className="animate-spin" /> : "Upload"}
                    </button>
                  )}
                </>
              )}

              {/* Show persisted assets */}
              {selectedProjectId && projectAssets.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-[var(--color-text-muted)]">Project assets ({projectAssets.length})</p>
                  <ul className="mt-1 grid grid-cols-4 gap-2">
                    {projectAssets.slice(0, 8).map((a) => (
                      <li key={a.id} className="aspect-square rounded-lg bg-[var(--color-surface-soft)] border border-[var(--line)] overflow-hidden relative group">
                        <img src={a.thumbnailUrl ?? a.originalUrl} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => deleteAsset(a.id)}
                          className="absolute top-1 left-1 p-1.5 rounded-md bg-black/50 hover:bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Delete ${a.id}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </li>
                    ))}
                    {projectAssets.length > 8 && (
                      <li className="flex items-center justify-center aspect-square rounded-lg bg-[var(--color-surface-soft)] border border-[var(--line)] text-xs text-[var(--muted)]">
                        +{projectAssets.length - 8} more
                      </li>
                    )}
                  </ul>
                </div>
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
                projectId={selectedProjectId ?? ""}
                onGenerate={handleGenerate}
                onSave={handleSave}
                isGenerating={isGenerating}
              />
            </div>

            {selectedProjectId && (
              <div className="job-card" id="audio">
                <div className="section-heading">
                  <Mic size={20} />
                  <h2>{t("vionto.audio.title")}</h2>
                </div>
                <div className="flex flex-col gap-3">
                  {voices.length > 0 ? (
                    <>
                      <label htmlFor="voice-select" className="text-xs text-[var(--color-text-muted)]">
                        {t("vionto.audio.selectVoice")}
                      </label>
                      <select
                        id="voice-select"
                        className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                        value={selectedVoice ?? ""}
                        onChange={async (e) => {
                          const newVoice = e.target.value;
                          setSelectedVoice(newVoice);
                          if (newVoice) {
                            await saveVoiceSelection(newVoice);
                          }
                        }}
                      >
                        <option value="">{t("vionto.audio.defaultVoice")}</option>
                        {voices.map((voice) => (
                          <option key={voice.id} value={voice.id}>
                            {voice.name} ({voice.locale}){voice.gender ? ` · ${voice.gender}` : ""}
                          </option>
                        ))}
                      </select>
                      {selectedVoice && versions.length > 0 && (
                        <button
                          type="button"
                          onClick={async () => {
                            const activeVersion = versions[0];
                            if (!activeVersion?.narrationText) return;
                            setIsPreviewing(true);
                            try {
                              const res = await fetch("/api/audio/preview", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  text: activeVersion.narrationText,
                                  voiceId: selectedVoice,
                                  locale: locale.split("-")[0] ?? "en",
                                }),
                              });
                              if (!res.ok) {
                                alert("Failed to preview audio");
                                return;
                              }
                              const audioBlob = await res.blob();
                              const audioUrl = URL.createObjectURL(audioBlob);
                              const audio = new Audio(audioUrl);
                              audio.play();
                            } catch (error) {
                              console.error("Failed to preview audio", error);
                              alert("Failed to preview audio");
                            } finally {
                              setIsPreviewing(false);
                            }
                          }}
                          disabled={isPreviewing}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[var(--color-accent)]/90 disabled:opacity-50"
                        >
                          <Play size={16} />
                          {isPreviewing ? t("vionto.audio.previewing") : t("vionto.audio.preview")}
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-[var(--color-text-muted)]">{t("vionto.audio.noVoices")}</p>
                  )}
                </div>
              </div>
            )}

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
