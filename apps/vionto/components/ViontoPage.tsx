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

  // Render state
  const [renderJobId, setRenderJobId] = useState<string | null>(null);
  const [renderState, setRenderState] = useState<string>("idle");
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [exportId, setExportId] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

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
      loadProjectExports(selectedProjectId);
    } else {
      setProjectAssets([]);
      setVersions([]);
      setSelectedVoice(null);
      setRenderJobId(null);
      setRenderState("idle");
      setRenderProgress(0);
      setRenderError(null);
      setExportId(null);
      setDownloadUrl(null);
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
      const tracks = data.tracks || data.data || [];
      const narrationTrack = tracks
        .filter((t: any) => t.type === "narration" && t.voiceId)
        .sort((a: any, b: any) => new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime())[0];
      setSelectedVoice(narrationTrack?.voiceId ?? null);
    } catch (error) {
      console.error("Failed to load audio settings", error);
    }
  }

  async function loadProjectExports(projectId: string) {
    try {
      const res = await fetch(`/api/exports?projectId=${projectId}`);
      if (!res.ok) return;
      const data = await res.json();
      const latestCompletedExport = (data.data || []).find((item: any) => item.renderJob?.state === "completed");
      if (latestCompletedExport) {
        setRenderJobId(latestCompletedExport.renderJobId ?? null);
        setRenderState("completed");
        setRenderProgress(100);
        setRenderError(null);
        setExportId(latestCompletedExport.id);
        setDownloadUrl(null);
      } else {
        setRenderJobId(null);
        setRenderState("idle");
        setRenderProgress(0);
        setRenderError(null);
        setExportId(null);
        setDownloadUrl(null);
      }
    } catch (error) {
      console.error("Failed to load exports", error);
    }
  }

  async function loadVoices(locale: string) {
    try {
      const res = await fetch(`/api/audio/voices?locale=${locale}`);
      if (!res.ok) return;
      const data = await res.json();
      const loadedVoices = data.voices || [];
      setVoices(loadedVoices);
      setSelectedVoice((current) => current ?? loadedVoices[0]?.id ?? null);
    } catch (error) {
      console.error("Failed to load voices", error);
    }
  }

  async function saveVoiceSelection(voiceId: string) {
    if (!selectedProjectId) return;
    const voice = voices.find((item) => item.id === voiceId);
    try {
      const res = await fetch("/api/audio/tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          type: "narration",
          source: "tts",
          voiceId,
          voiceName: voice?.name,
        }),
      });
      if (!res.ok) {
        console.error("Failed to save voice selection");
      }
    } catch (error) {
      console.error("Failed to save voice selection", error);
    }
  }

  function getVoicePreviewText() {
    const selectedVoiceLocale = voices.find((voice) => voice.id === selectedVoice)?.locale;
    const language = (selectedVoiceLocale ?? locale).split("-")[0] ?? "en";
    if (language === "nl") return "Dit is een voorbeeld van de gekozen vertelstem voor je Vionto verhaal.";
    if (language === "fr") return "Voici un aperçu de la voix choisie pour votre histoire Vionto.";
    if (language === "de") return "Dies ist eine Vorschau der ausgewaehlten Stimme fuer deine Vionto Geschichte.";
    if (language === "es") return "Esta es una vista previa de la voz narradora elegida para tu historia de Vionto.";
    if (language === "it") return "Questa è un'anteprima della voce narrante scelta per la tua storia Vionto.";
    if (language === "pt") return "Esta é uma prévia da voz de narração escolhida para a sua história Vionto.";
    return "This is a preview of the selected narration voice for your Vionto story.";
  }

  async function previewSelectedVoice() {
    if (!selectedVoice) return;
    setIsPreviewing(true);
    try {
      const res = await fetch("/api/audio/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: getVoicePreviewText(),
          voiceId: selectedVoice,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.audioBase64) {
        alert(data.error ?? "Failed to preview audio");
        return;
      }
      const audio = new Audio(`data:audio/mpeg;base64,${data.audioBase64}`);
      await audio.play();
    } catch (error) {
      console.error("Failed to preview audio", error);
      alert("Failed to preview audio");
    } finally {
      setIsPreviewing(false);
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

  async function startRender() {
    if (!selectedProjectId) {
      alert("Please select or create a project first");
      return;
    }
    if (projectAssets.length === 0) {
      alert("Please upload images before rendering");
      return;
    }
    if (!hasRenderableScript) {
      alert("Please generate a script before rendering");
      setRenderError("Generate or save a narration script before rendering.");
      return;
    }

    setRenderState("queued");
    setRenderProgress(0);
    setRenderError(null);
    setExportId(null);
    setDownloadUrl(null);

    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProjectId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to start render" }));
        const message = data.error ?? "Failed to start render";
        alert(message);
        setRenderError(message);
        setRenderState("idle");
        return;
      }
      const data = await res.json();
      setRenderJobId(data.jobId);
      pollRenderStatus(data.jobId);
    } catch (error) {
      console.error("Failed to start render", error);
      alert("Failed to start render");
      setRenderError("Failed to start render");
      setRenderState("idle");
    }
  }

  async function pollRenderStatus(jobId: string) {
    try {
      const res = await fetch(`/api/render/${jobId}`);
      if (!res.ok) {
        setRenderState("failed");
        setRenderError("Failed to poll render status");
        return;
      }
      const data = await res.json();
      setRenderState(data.state);
      setRenderProgress(data.progressPercent ?? 0);

      if (data.state === "completed") {
        setRenderError(null);
        // Load export record
        const exportRes = await fetch(`/api/exports?projectId=${selectedProjectId}`);
        if (exportRes.ok) {
          const exportData = await exportRes.json();
          if (exportData.data && exportData.data.length > 0) {
            const latestExport = exportData.data[0];
            setExportId(latestExport.id);
          }
        }
      } else if (data.state === "failed") {
        const message = data.errorSummary || "Unknown error";
        setRenderError(message);
        alert(`Render failed: ${message}`);
      } else if (data.state === "queued" || data.state === "running") {
        // Continue polling
        setTimeout(() => pollRenderStatus(jobId), 2000);
      }
    } catch (error) {
      console.error("Failed to poll render status", error);
      setRenderError("Failed to poll render status");
      setRenderState("failed");
    }
  }

  async function getDownloadUrl() {
    if (!exportId) return;
    try {
      const res = await fetch(`/api/exports/${exportId}/download`);
      if (!res.ok) {
        alert("Failed to get download URL");
        return;
      }
      const data = await res.json();
      setDownloadUrl(data.downloadUrl);
    } catch (error) {
      console.error("Failed to get download URL", error);
      alert("Failed to get download URL");
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
  const hasRenderableScript = versions.some((version) => version.narrationText?.trim());

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
                        {t("vionto.audio.voiceSelect")}
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
                      {selectedVoice && (
                        <button
                          type="button"
                          onClick={previewSelectedVoice}
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
              {renderState === "idle" ? (
                <button
                  type="button"
                  onClick={startRender}
                  disabled={!selectedProjectId || projectAssets.length === 0 || !hasRenderableScript}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[var(--color-accent)]/90 disabled:opacity-50"
                >
                  <Clapperboard size={16} />
                  {t("vionto.render.start")}
                </button>
              ) : renderState === "queued" || renderState === "running" ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <RefreshCw size={16} className="animate-spin" />
                    <span className="text-sm">
                      {renderState === "queued" ? t("vionto.render.queued") : t("vionto.render.running")}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[var(--color-border)]">
                    <div
                      className="h-full rounded-full bg-[var(--color-accent)] transition-all"
                      style={{ width: `${renderProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)]">{renderProgress}%</span>
                </div>
              ) : renderState === "completed" ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <ListChecks size={16} />
                    <span className="text-sm">{t("vionto.render.completed")}</span>
                  </div>
                  {exportId && (
                    <button
                      type="button"
                      onClick={getDownloadUrl}
                      disabled={!!downloadUrl}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[var(--color-accent)]/90 disabled:opacity-50"
                    >
                      <Download size={16} />
                      {downloadUrl ? t("vionto.render.downloading") : t("vionto.render.download")}
                    </button>
                  )}
                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      download
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-soft)]"
                    >
                      <Download size={16} />
                      {t("vionto.render.save")}
                    </a>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-red-600">
                    <Trash2 size={16} />
                    <span className="text-sm">{t("vionto.render.failed")}</span>
                  </div>
                  <button
                    type="button"
                    onClick={startRender}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-soft)]"
                  >
                    <RefreshCw size={16} />
                    {t("vionto.render.retry")}
                  </button>
                </div>
              )}
              {renderError && (
                <p className="text-sm text-red-500">{renderError}</p>
              )}
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}
