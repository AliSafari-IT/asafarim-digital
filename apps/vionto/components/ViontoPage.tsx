"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { NormalizedTrackMetadata } from "@/lib/server/pixabay-music";
import { useTranslation } from "@asafarim/shared-i18n";
import {
  ArrowRight,
  Captions,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  CloudUpload,
  Copy,
  Download,
  FileAudio,
  ImagePlus,
  ListChecks,
  Mic,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { ScriptEditor, type ScriptVersion } from "./ScriptEditor";
import { ViontoTopbarControls } from "./ViontoNav";
import { CountryLanguageSelector } from "@asafarim/country-language-selector";
import { DEFAULT_VISUAL_STYLE, VISUAL_STYLE_OPTIONS, normalizeVisualStyle, type VisualStyle } from "@/lib/visual-styles";

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

const API_MODE_TO_UI_MODE: Record<string, "cinematic" | "slideshow" | "social"> = {
  story: "cinematic",
  slideshow: "slideshow",
  documentary: "social",
};

const ASPECT_OPTIONS = [
  { labelKey: "vionto.aspect.landscape", value: "16:9", key: "landscape" },
  { labelKey: "vionto.aspect.portrait", value: "9:16", key: "portrait" },
  { labelKey: "vionto.aspect.square", value: "1:1", key: "1by1" },
] as const;

const STORY_MODE_OPTIONS = [
  { labelKey: "vionto.storyMode.memory_film", descriptionKey: "vionto.storyMode.memory_film.description", value: "memory_film" },
  { labelKey: "vionto.storyMode.travel_recap", descriptionKey: "vionto.storyMode.travel_recap.description", value: "travel_recap" },
  { labelKey: "vionto.storyMode.family_archive", descriptionKey: "vionto.storyMode.family_archive.description", value: "family_archive" },
  { labelKey: "vionto.storyMode.event_recap", descriptionKey: "vionto.storyMode.event_recap.description", value: "event_recap" },
  { labelKey: "vionto.storyMode.social_reel", descriptionKey: "vionto.storyMode.social_reel.description", value: "social_reel" },
  { labelKey: "vionto.storyMode.documentary", descriptionKey: "vionto.storyMode.documentary.description", value: "documentary" },
] as const;

const EMOTIONAL_TONE_OPTIONS = [
  { labelKey: "vionto.emotionalTone.nostalgic", descriptionKey: "vionto.emotionalTone.nostalgic.description", value: "nostalgic" },
  { labelKey: "vionto.emotionalTone.joyful", descriptionKey: "vionto.emotionalTone.joyful.description", value: "joyful" },
  { labelKey: "vionto.emotionalTone.calm", descriptionKey: "vionto.emotionalTone.calm.description", value: "calm" },
  { labelKey: "vionto.emotionalTone.epic", descriptionKey: "vionto.emotionalTone.epic.description", value: "epic" },
  { labelKey: "vionto.emotionalTone.funny", descriptionKey: "vionto.emotionalTone.funny.description", value: "funny" },
  { labelKey: "vionto.emotionalTone.romantic", descriptionKey: "vionto.emotionalTone.romantic.description", value: "romantic" },
  { labelKey: "vionto.emotionalTone.reflective", descriptionKey: "vionto.emotionalTone.reflective.description", value: "reflective" },
] as const;

type AspectRatio = (typeof ASPECT_OPTIONS)[number]["value"];
type UiMode = "cinematic" | "slideshow" | "social";

type ProjectSummary = {
  id: string;
  title: string;
  status: string;
  mode: string;
  storyMode?: string | null;
  emotionalTone?: string | null;
  visualStyle?: string | null;
  musicOption?: string | null;
  musicTrackId?: string | null;
  musicMetadata?: unknown;
  aspectRatio: AspectRatio | "4:3";
  createdAt: string;
};

function normalizeProjectMusicMetadata(metadata: unknown): NormalizedTrackMetadata[] {
  if (Array.isArray(metadata)) {
    return metadata.filter((track): track is NormalizedTrackMetadata => (
      !!track &&
      typeof track === "object" &&
      "trackId" in track &&
      "title" in track &&
      "artist" in track &&
      "downloadUrl" in track
    ));
  }

  if (
    metadata &&
    typeof metadata === "object" &&
    "trackId" in metadata &&
    "title" in metadata &&
    "artist" in metadata &&
    "downloadUrl" in metadata
  ) {
    return [metadata as NormalizedTrackMetadata];
  }

  return [];
}

type LibraryExport = {
  id: string;
  projectId: string;
  projectTitle: string;
  filename: string | null;
  mode: UiMode | null;
  storyMode: string | null;
  emotionalTone: string | null;
  visualStyle: string | null;
  aspectRatio: string | null;
  aspectLabel: string | null;
  keywords: string[];
  previewTitle: string | null;
  previewSubtitle: string | null;
  previewUrl: string;
  durationSeconds: number | null;
  fileSizeBytes: number | null;
  createdAt: string;
};

export function ViontoPage() {
  const { t, locale } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const applyCollapsed = () => {
      const w = window.innerWidth;
      if (w < 1024) {
        // Always collapse on tablet/mobile — user toggle only applies on desktop
        setCollapsed(true);
      } else {
        const saved = window.localStorage.getItem("vionto:sidebar");
        setCollapsed(saved === "collapsed");
      }
    };

    applyCollapsed();
    window.addEventListener("resize", applyCollapsed);
    const closeMobileMenu = () => { if (window.innerWidth >= 768) setMobileMenuOpen(false); };
    window.addEventListener("resize", closeMobileMenu);
    return () => {
      window.removeEventListener("resize", applyCollapsed);
      window.removeEventListener("resize", closeMobileMenu);
    };
  }, []);

  useEffect(() => {
    return () => {
      musicPreviewAudioRef.current?.pause();
      musicPreviewAudioRef.current = null;
    };
  }, []);

  const [versions, setVersions] = useState<ScriptVersion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userNotes, setUserNotes] = useState("");
  const [selectedStoryMode, setSelectedStoryMode] = useState<string>("memory_film");
  const [selectedEmotionalTone, setSelectedEmotionalTone] = useState<string>("nostalgic");
  const [selectedVisualStyle, setSelectedVisualStyle] = useState<VisualStyle>(DEFAULT_VISUAL_STYLE);
  const [selectedMusicTracks, setSelectedMusicTracks] = useState<NormalizedTrackMetadata[]>([]);
  const [musicBlobUrls, setMusicBlobUrls] = useState<Set<string>>(new Set());
  const [musicTracks, setMusicTracks] = useState<NormalizedTrackMetadata[]>([]);
  const [isMusicLoading, setIsMusicLoading] = useState(false);
  const [isMusicUploading, setIsMusicUploading] = useState(false);
  const [musicFilterQuery, setMusicFilterQuery] = useState("");
  const [musicFilterMinDuration, setMusicFilterMinDuration] = useState("");
  const [musicFilterMaxDuration, setMusicFilterMaxDuration] = useState("");
  const [showMusicSelector, setShowMusicSelector] = useState(false);
  const [musicPreviewTrackId, setMusicPreviewTrackId] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [voices, setVoices] = useState<Array<{ id: string; name: string; locale: string; gender?: string }>>([]);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const musicUploadInputRef = useRef<HTMLInputElement>(null);
  const musicPreviewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Render state
  const [renderJobId, setRenderJobId] = useState<string | null>(null);
  const [renderState, setRenderState] = useState<string>("idle");
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [exportId, setExportId] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [latestExport, setLatestExport] = useState<LibraryExport | null>(null);
  const [libraryExports, setLibraryExports] = useState<LibraryExport[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [libraryModeFilter, setLibraryModeFilter] = useState<"" | UiMode>("");
  const [libraryCreatedFrom, setLibraryCreatedFrom] = useState("");
  const [libraryCreatedTo, setLibraryCreatedTo] = useState("");
  const [librarySearch, setLibrarySearch] = useState("");
  const [libraryPage, setLibraryPage] = useState(1);
  const [libraryCursors, setLibraryCursors] = useState<(string | null)[]>([null]);
  const [libraryHasNext, setLibraryHasNext] = useState(false);
  const LIBRARY_PAGE_SIZE = 6;

  // Project state
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
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
  const dragAssetId = useRef<string | null>(null);
  const dragOverAssetId = useRef<string | null>(null);
  const [dragActiveId, setDragActiveId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const ACCEPTED = [".jpg", ".jpeg", ".png", ".heic", ".webp", ".zip"];
  const acceptedMime = "image/jpeg,image/png,image/heic,image/webp,application/zip,.heic,.zip";

  // Load projects on mount
  useEffect(() => {
    loadProjects();
    loadExportLibrary();
  }, []);

  // Load assets when project is selected
  useEffect(() => {
    if (selectedProjectId) {
      const selected = projects.find((project) => project.id === selectedProjectId);
      if (selected) {
        setActiveMode(API_MODE_TO_UI_MODE[selected.mode] ?? "cinematic");
        setSelectedStoryMode(selected.storyMode ?? "memory_film");
        setSelectedEmotionalTone(selected.emotionalTone ?? "nostalgic");
        setSelectedVisualStyle(normalizeVisualStyle(selected.visualStyle));
        setSelectedMusicTracks(normalizeProjectMusicMetadata(selected.musicMetadata));
        const supportedAspect = ASPECT_OPTIONS.some((option) => option.value === selected.aspectRatio);
        setActiveAspectRatio(supportedAspect ? selected.aspectRatio as AspectRatio : "16:9");
      }
      loadProjectAssets(selectedProjectId);
      loadProjectScripts(selectedProjectId);
      loadProjectAudioSettings(selectedProjectId);
      loadVoices(locale.split("-")[0] ?? "en");
      loadProjectExports(selectedProjectId);
      loadExportLibrary({ projectId: selectedProjectId });
    } else {
      setProjectAssets([]);
      setVersions([]);
      setSelectedVoice(null);
      setSelectedMusicTracks([]);
      setSelectedVisualStyle(DEFAULT_VISUAL_STYLE);
      setRenderJobId(null);
      setRenderState("idle");
      setRenderProgress(0);
      setRenderError(null);
      setExportId(null);
      setDownloadUrl(null);
      loadExportLibrary();
    }
  }, [selectedProjectId, locale, projects]);

  useEffect(() => {
    setLibraryPage(1);
    setLibraryCursors([null]);
    loadExportLibrary({ projectId: selectedProjectId, cursor: null });
  }, [libraryModeFilter, libraryCreatedFrom, libraryCreatedTo, librarySearch]);

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

  async function reorderAssets(newOrder: typeof projectAssets) {
    if (!selectedProjectId) return;
    setProjectAssets(newOrder);
    try {
      await fetch(`/api/projects/${selectedProjectId}/assets`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: newOrder.map((a) => a.id) }),
      });
    } catch (error) {
      console.error("Failed to persist asset order", error);
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

  async function removeLibraryExport(exportId: string) {
    if (!confirm("Remove this video from the library?")) return;
    try {
      const res = await fetch(`/api/exports/${exportId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setLibraryExports((prev) => prev.filter((e) => e.id !== exportId));
      if (exportId === latestExport?.id) setLatestExport(null);
    } catch (error) {
      console.error("Failed to remove export", error);
    }
  }

  async function loadExportLibrary(overrides: { projectId?: string | null; cursor?: string | null } = {}) {
    setIsLoadingLibrary(true);
    try {
      const params = new URLSearchParams();
      const projectId = overrides.projectId === undefined ? selectedProjectId : overrides.projectId;
      if (projectId) params.set("projectId", projectId);
      if (libraryModeFilter) params.set("mode", libraryModeFilter);
      if (libraryCreatedFrom) params.set("createdFrom", libraryCreatedFrom);
      if (libraryCreatedTo) params.set("createdTo", libraryCreatedTo);
      if (librarySearch.trim()) params.set("search", librarySearch.trim());
      const cursor = overrides.cursor !== undefined ? overrides.cursor : null;
      if (cursor) params.set("cursor", cursor);
      params.set("limit", String(LIBRARY_PAGE_SIZE));
      const res = await fetch(`/api/exports/library?${params.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      const items = (data.data || []) as LibraryExport[];
      setLibraryExports(items);
      setLibraryHasNext(!!data.nextCursor);
      if (items[0]) setLatestExport(items[0]);
      else if (!projectId) setLatestExport(null);
    } catch (error) {
      console.error("Failed to load export library", error);
    } finally {
      setIsLoadingLibrary(false);
    }
  }

  async function saveProjectSettings(): Promise<boolean> {
    if (!selectedProjectId) return false;
    try {
      const apiMode = UI_MODE_TO_API_MODE[activeMode] ?? "story";
      const res = await fetch(`/api/projects/${selectedProjectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: apiMode,
          storyMode: selectedStoryMode,
          emotionalTone: selectedEmotionalTone,
          visualStyle: selectedVisualStyle,
          musicOption: selectedMusicTracks.length > 0 ? "upload_own" : "no_music",
          musicTrackId: selectedMusicTracks.map((track) => track.trackId).join(",") || null,
          musicMetadata: selectedMusicTracks.length > 0 ? selectedMusicTracks : null,
          aspectRatio: activeAspectRatio,
        }),
      });
      if (!res.ok) {
        const message = await res.text().catch(() => "");
        throw new Error(message || "Failed to save project settings");
      }
      setProjects((prev) =>
        prev.map((project) =>
          project.id === selectedProjectId
            ? { ...project, mode: apiMode, storyMode: selectedStoryMode, emotionalTone: selectedEmotionalTone, visualStyle: selectedVisualStyle, musicOption: selectedMusicTracks.length > 0 ? "upload_own" : "no_music", aspectRatio: activeAspectRatio }
            : project
        )
      );
      return true;
    } catch (error) {
      console.error("Failed to save project settings", error);
      return false;
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
    const savedSettings = await saveProjectSettings();
    if (!savedSettings) {
      alert("Failed to save project settings before rendering");
      setRenderError("Failed to save project settings before rendering.");
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
        await loadExportLibrary({ projectId: selectedProjectId });
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
      setShowDownloadDialog(true);
    } catch (error) {
      console.error("Failed to get download URL", error);
      alert("Failed to get download URL");
    }
  }

  function copyToClipboard() {
    if (!downloadUrl) return;
    navigator.clipboard.writeText(downloadUrl);
    alert(t("vionto.downloadDialog.copied"));
  }

  async function createProject() {
    if (!newProjectTitle.trim()) return;
    setIsCreatingProject(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newProjectTitle.trim(),
          mode: UI_MODE_TO_API_MODE[activeMode] ?? "story",
          storyMode: selectedStoryMode,
          emotionalTone: selectedEmotionalTone,
          visualStyle: selectedVisualStyle,
          musicOption: selectedMusicTracks.length > 0 ? "upload_own" : "no_music",
          musicTrackId: selectedMusicTracks.map((track) => track.trackId).join(",") || null,
          musicMetadata: selectedMusicTracks.length > 0 ? selectedMusicTracks : null,
          aspectRatio: activeAspectRatio,
          locale: locale.split("-")[0] ?? "en",
        }),
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
  const [activeMode, setActiveMode] = useState<UiMode>("cinematic");
  const [activeAspectRatio, setActiveAspectRatio] = useState<AspectRatio>("16:9");

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
      await saveProjectSettings();
      const apiMode = UI_MODE_TO_API_MODE[activeMode] ?? "story";
      const res = await fetch("/api/story/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          locale: locale.split("-")[0] ?? "en",
          mode: apiMode,
          visualStyle: selectedVisualStyle,
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
  }, [locale, activeMode, selectedVisualStyle, userNotes, selectedProjectId]);

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


  // Handle music track selection
  const handleSelectMusicTrack = (track: NormalizedTrackMetadata) => {
    setSelectedMusicTracks((current) => (
      current.some((selected) => selected.trackId === track.trackId && selected.provider === track.provider)
        ? current
        : [...current, track]
    ));
    setShowMusicSelector(false);
  };

  function getAudioContentType(file: File): string {
    if (file.type) return file.type;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension === "mp3") return "audio/mpeg";
    if (extension === "wav") return "audio/wav";
    if (extension === "ogg") return "audio/ogg";
    if (extension === "m4a" || extension === "mp4") return "audio/mp4";
    if (extension === "webm") return "audio/webm";
    return "audio/mpeg";
  }

  async function uploadMusicFile(file: File): Promise<{ key: string; publicUrl?: string }> {
    const contentType = getAudioContentType(file);
    const presignRes = await fetch("/api/uploads/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType,
        sizeBytes: file.size,
      }),
    });

    if (!presignRes.ok) {
      const message = await presignRes.text().catch(() => "");
      throw new Error(message || "Failed to prepare music upload");
    }

    const presignData = (await presignRes.json()) as { key: string };
    const form = new FormData();
    form.append("key", presignData.key);
    form.append("file", file);

    const uploadRes = await fetch("/api/uploads/proxy", {
      method: "POST",
      body: form,
    });

    if (!uploadRes.ok) {
      const message = await uploadRes.text().catch(() => "");
      throw new Error(message || "Music upload failed");
    }

    const uploadData = (await uploadRes.json()) as { key: string; publicUrl?: string };
    return { key: uploadData.key, publicUrl: uploadData.publicUrl };
  }

  const clearMusicSelection = () => {
    musicPreviewAudioRef.current?.pause();
    musicPreviewAudioRef.current = null;
    setMusicPreviewTrackId(null);
    // Revoke all blob URLs
    musicBlobUrls.forEach((url) => URL.revokeObjectURL(url));
    setMusicBlobUrls(new Set());
    setSelectedMusicTracks([]);
    setShowMusicSelector(false);
  };

  const removeMusicTrack = (track: NormalizedTrackMetadata) => {
    if (musicPreviewTrackId === track.trackId) {
      musicPreviewAudioRef.current?.pause();
      musicPreviewAudioRef.current = null;
      setMusicPreviewTrackId(null);
    }
    // Revoke blob URL if this is an uploaded track
    if (track.provider === "upload" && track.downloadUrl.startsWith("blob:")) {
      URL.revokeObjectURL(track.downloadUrl);
      setMusicBlobUrls((prev) => {
        const next = new Set(prev);
        next.delete(track.downloadUrl);
        return next;
      });
    }
    setSelectedMusicTracks((current) =>
      current.filter((selected) => !(selected.trackId === track.trackId && selected.provider === track.provider))
    );
  };

  const openMoreMusic = () => {
    setShowMusicSelector(true);
  };

  const toggleMusicPreview = async (track: NormalizedTrackMetadata) => {
    if (musicPreviewTrackId === track.trackId) {
      musicPreviewAudioRef.current?.pause();
      musicPreviewAudioRef.current = null;
      setMusicPreviewTrackId(null);
      return;
    }

    const previewUrl = track.downloadUrl;

    // Clean up previous audio
    if (musicPreviewAudioRef.current) {
      musicPreviewAudioRef.current.pause();
      musicPreviewAudioRef.current.src = "";
      musicPreviewAudioRef.current.load();
    }

    const audio = new Audio(previewUrl);
    musicPreviewAudioRef.current = audio;
    setMusicPreviewTrackId(track.trackId);

    const handleEnded = () => {
      setMusicPreviewTrackId(null);
      audio.removeEventListener("ended", handleEnded);
    };

    audio.addEventListener("ended", handleEnded);

    try {
      // Wait for audio to be ready to play
      await new Promise<void>((resolve, reject) => {
        const handleCanPlay = () => {
          audio.removeEventListener("canplay", handleCanPlay);
          audio.removeEventListener("error", handleLoadError);
          resolve();
        };
        const handleLoadError = (e: Event) => {
          audio.removeEventListener("canplay", handleCanPlay);
          audio.removeEventListener("error", handleLoadError);
          reject((e.target as HTMLAudioElement)?.error || new Error("Failed to load audio"));
        };
        audio.addEventListener("canplay", handleCanPlay);
        audio.addEventListener("error", handleLoadError);
      });
      await audio.play();
    } catch (error) {
      console.error("Failed to play audio:", error);
      setMusicPreviewTrackId(null);
    }
  };

  return (
    <main className="min-h-screen text-[var(--text)]" style={{ background: 'var(--color-bg)' }}>
      <section className="workspace-shell">
        {/* ─── Sidebar ─────────────────────────────────────────────── */}
        <aside
          aria-label="Vionto workspace navigation"
          className={`sticky top-0 h-screen flex-shrink-0 flex flex-col border-r border-[var(--line)] backdrop-blur-[18px] transition-all duration-200 ${
            collapsed ? "w-[72px]" : "w-64"
          }`}
          style={{ background: "var(--color-panel-strong)", zIndex: 20 }}
        >
          {/* Logo + collapse toggle */}
          <div className={`flex h-14 items-center border-b border-[var(--line)] ${
            collapsed ? "justify-center px-2" : "justify-between px-4"
          }`}>
            <a href="/" className="flex items-center gap-2.5 overflow-hidden" aria-label="Vionto home">
              <ViontoMark className="h-8 w-8 shrink-0" />
              {!collapsed && (
                <div className="brand-text flex flex-col leading-tight max-sm:hidden">
                  <span className="text-sm font-bold tracking-tight" style={{ color: "var(--text)" }}>Vionto</span>
                  <span className="text-[10px]" style={{ color: "var(--muted)" }}>Vision + Canto</span>
                </div>
              )}
            </a>
            {!collapsed && (
              <button
                type="button"
                onClick={() => { window.localStorage.setItem("vionto:sidebar", "collapsed"); setCollapsed(true); }}
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
                className="collapse-toggle h-7 w-7 flex items-center justify-center rounded-md transition-colors max-sm:hidden"
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
                onClick={() => { window.localStorage.setItem("vionto:sidebar", "expanded"); setCollapsed(false); }}
                title="Expand sidebar"
                aria-label="Expand sidebar"
                className="collapse-toggle mt-1 h-7 w-7 flex items-center justify-center rounded-md transition-colors max-sm:hidden"
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
                    title={t(labelKey)}
                    className={`group flex items-center gap-3 rounded-lg py-2 text-sm transition-colors ${
                      collapsed ? "justify-center px-2" : "px-3"
                    } ${
                      idx === 0
                        ? "bg-[var(--color-primary-soft)] text-[var(--text)]"
                        : "text-[var(--muted)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--text)]"
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
            <div className="mx-3 mb-3 rounded-2xl border border-[var(--line)] p-3" style={{ background: "var(--color-panel)" }}>
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
              <span className="truncate font-medium text-[var(--text)]">{t("vionto.nav.create")}</span>
            </div>
            {/* Desktop controls — hidden below portrait tablet */}
            <div className="hidden md:flex items-center gap-2">
              <CountryLanguageSelector key={"language-selector"}/>
              <ViontoTopbarControls />
              <a className="portal-link" href={process.env.NEXT_PUBLIC_PORTAL_URL ?? "http://localhost:3000"}>
                ASafariM Portal <ArrowRight size={16} />
              </a>
            </div>
            {/* Hamburger — visible below portrait tablet */}
            <button
              type="button"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line)] transition hover:bg-white/[0.06]"
              style={{ color: "var(--text)" }}
            >
              {mobileMenuOpen ? (
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </header>
          {/* Mobile dropdown menu */}
          {mobileMenuOpen && (
            <div
              className="md:hidden flex flex-col gap-3 border-b border-[var(--line)] px-4 py-3"
              style={{ background: "var(--color-panel-strong)" }}
            >
              <ViontoTopbarControls />
              <a
                className="portal-link inline-flex w-full justify-center"
                href={process.env.NEXT_PUBLIC_PORTAL_URL ?? "http://localhost:3000"}
                onClick={() => setMobileMenuOpen(false)}
              >
                ASafariM Portal <ArrowRight size={16} />
              </a>
            </div>
          )}

          <div className="px-5 pt-5 pb-1">
            <p className="eyebrow">Photo-to-story video MVP</p>
            <h1 className="mt-1 text-2xl font-semibold" style={{ fontSize: "1.5rem", lineHeight: 1.25 }}>Turn memories into poetic motion.</h1>
          </div>

          <div className="creator-grid" id="create">
            <section className="upload-panel" id="uploads" aria-labelledby="upload-title">
              <div>
                <p className="eyebrow">{t("vionto.upload.eyebrow")}</p>
                <h2 id="upload-title">{t("vionto.upload.title")}</h2>
                <p>{t("vionto.upload.subtitle")}</p>
              </div>

              {/* Project picker */}
              <div className="mt-3">
                <label className="text-xs font-medium text-[var(--color-text-muted)]">{t("vionto.project.label")}</label>
                <div className="mt-1 flex gap-2">
                  <select
                    className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                    value={selectedProjectId ?? ""}
                    onChange={(e) => setSelectedProjectId(e.target.value || null)}
                    disabled={isLoadingProjects || isUploading}
                  >
                    <option value="">{t("vionto.project.selectPlaceholder")}</option>
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
                    <Plus size={16} /> {t("vionto.project.new")}
                  </button>
                </div>

                {/* Create project modal */}
                {isCreatingProject && (
                  <div className="mt-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                    <input
                      type="text"
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                      placeholder={t("vionto.project.titlePlaceholder")}
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
                        {t("common.cancel")}
                      </button>
                      <button
                        type="button"
                        onClick={createProject}
                        disabled={!newProjectTitle.trim() || isCreatingProject}
                        className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[var(--color-accent)]/90 disabled:opacity-50"
                      >
                        {isCreatingProject ? <RefreshCw size={14} className="animate-spin" /> : t("vionto.project.create")}
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
                  <p className="text-xs font-medium text-[var(--color-text-muted)]">
                    {t("vionto.project.assets")} ({projectAssets.length})
                  </p>
                  <ul className="mt-1 grid grid-cols-4 gap-2">
                    {projectAssets.map((a, idx) => (
                      <li
                        key={a.id}
                        draggable
                        onDragStart={() => {
                          dragAssetId.current = a.id;
                          setDragActiveId(a.id);
                        }}
                        onDragEnter={() => {
                          dragOverAssetId.current = a.id;
                          setDragOverId(a.id);
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDragEnd={() => {
                          const fromId = dragAssetId.current;
                          const toId = dragOverAssetId.current;
                          dragAssetId.current = null;
                          dragOverAssetId.current = null;
                          setDragActiveId(null);
                          setDragOverId(null);
                          if (!fromId || !toId || fromId === toId) return;
                          const from = projectAssets.findIndex((x) => x.id === fromId);
                          const to = projectAssets.findIndex((x) => x.id === toId);
                          if (from === -1 || to === -1) return;
                          const next = [...projectAssets];
                          const [moved] = next.splice(from, 1);
                          next.splice(to, 0, moved);
                          reorderAssets(next.map((x, i) => ({ ...x, orderIndex: i })));
                        }}
                        className={`aspect-square rounded-lg bg-[var(--color-surface-soft)] border overflow-hidden relative group cursor-grab active:cursor-grabbing transition-all ${
                          dragActiveId === a.id
                            ? "opacity-40 scale-95 border-[var(--color-accent)]"
                            : dragOverId === a.id
                            ? "border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/50 scale-105"
                            : "border-[var(--line)]"
                        }`}
                      >
                        <span className="absolute top-1 right-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-[9px] font-bold text-white">{idx + 1}</span>
                        <img src={a.thumbnailUrl ?? a.originalUrl} alt="" className="w-full h-full object-cover pointer-events-none" />
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
                    {false && projectAssets.length > 8 && (
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
                    className={`mode mode-${mode}${mode === activeMode ? " active" : ""}`}
                    type="button"
                    onClick={() => setActiveMode(mode)}
                  >
                    <span>{t(`vionto.mode.${mode}`)}</span>
                  </button>
                ))}
              </div>

              <div className="mt-3 flex gap-3" aria-label={t("vionto.storyMode.label")}>
                <div className="flex-1">
                  <p className="text-xs font-medium text-[var(--color-text-muted)]">{t("vionto.storyMode.label")}</p>
                  <select
                    value={selectedStoryMode}
                    onChange={(e) => setSelectedStoryMode(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-2 text-sm text-[var(--color-text)]"
                  >
                    {STORY_MODE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(option.labelKey)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-[var(--color-text-muted)]">{t("vionto.emotionalTone.label")}</p>
                  <select
                    value={selectedEmotionalTone}
                    onChange={(e) => setSelectedEmotionalTone(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-2 text-sm text-[var(--color-text)]"
                  >
                    {EMOTIONAL_TONE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(option.labelKey)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-3" aria-label={t("vionto.visualStyle.label")}>
                <p className="text-xs font-medium text-[var(--color-text-muted)]">{t("vionto.visualStyle.label")}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {VISUAL_STYLE_OPTIONS.map((option) => {
                    const active = selectedVisualStyle === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSelectedVisualStyle(option.value)}
                        className={`rounded-lg border p-3 text-left transition ${
                          active
                            ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-text)]"
                            : "border-[var(--color-border)] bg-[var(--color-surface-soft)] text-[var(--color-text)] hover:border-[var(--color-accent)]"
                        }`}
                      >
                        <span className="block text-sm font-semibold">{t(option.labelKey)}</span>
                        <span className="mt-1 block text-xs leading-snug text-[var(--color-text-muted)]">{t(option.descriptionKey)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3" aria-label={t("vionto.music.label")}>
                <p className="text-xs font-medium text-[var(--color-text-muted)]">{t("vionto.music.label")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={openMoreMusic}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-2 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  >
                    <Plus className="h-4 w-4" />
                    {t("vionto.music.more")}
                  </button>
                  <button
                    type="button"
                    onClick={clearMusicSelection}
                    disabled={selectedMusicTracks.length === 0}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:border-[var(--color-danger)] hover:text-[var(--color-danger)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t("vionto.music.removeAll")}
                  </button>
                </div>
                {selectedMusicTracks.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {selectedMusicTracks.map((track, index) => (
                      <div key={`${track.provider}-${track.trackId}`} className="flex items-center gap-2 rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent)]/10 p-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-semibold text-white">
                          {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleMusicPreview(track)}
                          className="text-[var(--color-accent)] hover:text-[var(--color-accent)]/80"
                          title={musicPreviewTrackId === track.trackId ? t("vionto.audio.previewing") : t("vionto.audio.preview")}
                        >
                          {musicPreviewTrackId === track.trackId ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--color-text)] truncate">{track.title}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">{track.artist}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMusicTrack(track)}
                          className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                          title={t("vionto.music.remove")}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Music Track Selector Modal */}
              {showMusicSelector && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="w-full max-w-3xl rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 max-h-[80vh] overflow-y-auto">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-[var(--color-text)]">
                        {t("vionto.music.upload_own")}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowMusicSelector(false)}
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Upload Own Music UI */}
                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-8 text-center">
                          <input
                            ref={musicUploadInputRef}
                            type="file"
                            accept="audio/*"
                            multiple
                            disabled={isMusicUploading}
                            onChange={async (e) => {
                              const files = Array.from(e.target.files ?? []);
                              if (files.length === 0) return;

                              setIsMusicUploading(true);
                              try {
                                const uploadedTracks = await Promise.all(files.map(async (file, index) => {
                                  const [{ key }, previewUrl] = await Promise.all([
                                    uploadMusicFile(file),
                                    Promise.resolve(URL.createObjectURL(file)),
                                  ]);

                                  return {
                                    provider: "upload",
                                    trackId: `upload_${Date.now()}_${index}`,
                                    title: file.name.replace(/\.[^/.]+$/, ""),
                                    artist: "Uploaded",
                                    artistId: "upload",
                                    duration: undefined,
                                    tags: ["uploaded"],
                                    sourceUrl: previewUrl,
                                    downloadUrl: previewUrl,
                                    storageKey: key,
                                    license: "uploaded",
                                    licenseInfo: t("vionto.music.uploadDisclaimer"),
                                    downloads: 0,
                                    likes: 0,
                                  } satisfies NormalizedTrackMetadata;
                                }));

                                setSelectedMusicTracks((current) => [...current, ...uploadedTracks]);
                                setMusicBlobUrls((prev) => {
                                  const next = new Set(prev);
                                  uploadedTracks.forEach((track) => next.add(track.downloadUrl));
                                  return next;
                                });
                                setShowMusicSelector(false);
                              } catch (error) {
                                console.error("Failed to upload music", error);
                                alert(error instanceof Error ? error.message : "Music upload failed");
                              } finally {
                                setIsMusicUploading(false);
                                // Reset input value to allow selecting the same file again
                                e.target.value = "";
                              }
                            }}
                            className="hidden"
                            id="music-upload"
                          />
                          <label
                            htmlFor="music-upload"
                            className={`flex flex-col items-center gap-2 ${isMusicUploading ? "cursor-wait opacity-70" : "cursor-pointer"}`}
                          >
                            {isMusicUploading ? (
                              <RefreshCw className="h-12 w-12 animate-spin text-[var(--color-text-muted)]" />
                            ) : (
                              <CloudUpload className="h-12 w-12 text-[var(--color-text-muted)]" />
                            )}
                            <p className="text-sm text-[var(--color-text)]">
                              {isMusicUploading ? t("vionto.music.uploading") : t("vionto.music.upload_own")}
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)]">
                              MP3, WAV, OGG, M4A
                            </p>
                          </label>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] text-center">
                          {t("vionto.music.uploadDisclaimer")}
                        </p>
                      </div>
                  </div>
                </div>
              )}

              <div className="mt-3" aria-label={t("vionto.aspect.aria")}>
                <p className="text-xs font-medium text-[var(--color-text-muted)]">{t("vionto.aspect.label")}</p>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {ASPECT_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm transition ${
                        activeAspectRatio === option.value
                          ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-text)]"
                          : "border-[var(--color-border)] bg-[var(--color-surface-soft)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="vionto-aspect-ratio"
                        className="sr-only"
                        value={option.value}
                        checked={activeAspectRatio === option.value}
                        onChange={() => setActiveAspectRatio(option.value)}
                      />
                      {t(option.labelKey)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-3">
                <label htmlFor="user-notes" className="text-xs font-medium text-[var(--color-text-muted)]">
                  {t("vionto.notes.label")}
                </label>
                <textarea
                  id="user-notes"
                  className="mt-1 min-h-[60px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder={t("vionto.notes.placeholder")}
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
                  {latestExport?.previewUrl ? (
                    <video
                      key={latestExport.id}
                      src={latestExport.previewUrl}
                      controls
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <>
                      <div className="sun" />
                      <div className="horizon" />
                    </>
                  )}
                  <p>{latestExport?.previewSubtitle ?? t("vionto.preview.empty")}</p>
                </div>
              </div>
              <div className="preview-copy">
                <p className="eyebrow">{t("vionto.preview.eyebrow")}</p>
                <h2 id="preview-title">{latestExport?.previewTitle ?? t("vionto.preview.draft", { mode: t(`vionto.mode.${activeMode}`) })}</h2>
                <p>
                  {latestExport?.filename ??
                    t("vionto.preview.formatSummary", { aspect: activeAspectRatio })}
                </p>
                <button
                  type="button"
                  onClick={startRender}
                  disabled={!selectedProjectId || projectAssets.length === 0 || !hasRenderableScript || renderState === "queued" || renderState === "running"}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[var(--color-accent)]/90 disabled:opacity-50"
                >
                  <Clapperboard size={16} />
                  {renderState === "queued" || renderState === "running" ? t("vionto.render.creating") : t("vionto.render.createVideo")}
                </button>
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
                  <button
                    type="button"
                    onClick={startRender}
                    disabled={!selectedProjectId || projectAssets.length === 0 || !hasRenderableScript}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-soft)] disabled:opacity-50"
                  >
                    <Clapperboard size={16} />
                    {t("vionto.render.createAnother")}
                  </button>
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

            <div className="job-card md:col-span-2" id="library">
              <div className="section-heading">
                <Clapperboard size={20} />
                <h2>{t("vionto.library.title")}</h2>
              </div>
              <div className="grid gap-2 md:grid-cols-3">
                <select
                  className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                  value={libraryModeFilter}
                  onChange={(e) => setLibraryModeFilter(e.target.value as "" | UiMode)}
                  aria-label={t("vionto.library.filterMode")}
                >
                  <option value="">{t("vionto.library.allModes")}</option>
                  {modes.map((mode) => (
                    <option key={mode} value={mode}>{t(`vionto.mode.${mode}`)}</option>
                  ))}
                </select>
                <input
                  type="date"
                  className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                  value={libraryCreatedFrom}
                  onChange={(e) => setLibraryCreatedFrom(e.target.value)}
                  aria-label={t("vionto.library.createdFrom")}
                />
                <input
                  type="date"
                  className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                  value={libraryCreatedTo}
                  onChange={(e) => setLibraryCreatedTo(e.target.value)}
                  aria-label={t("vionto.library.createdTo")}
                />
              </div>
              <div className="relative mt-2">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="search"
                  className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-soft)] py-2 pl-9 pr-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]"
                  {...{ placeholder: t("vionto.library.searchPlaceholder") }}
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  aria-label={t("vionto.library.search")}
                />
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {isLoadingLibrary ? (
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                    <RefreshCw size={16} className="animate-spin" />
                    {t("vionto.library.loading")}
                  </div>
                ) : libraryExports.length === 0 ? (
                  <p className="text-sm text-[var(--color-text-muted)]">{t("vionto.library.empty")}</p>
                ) : (
                  libraryExports.map((item, _idx) => (
                    <article
                      key={item.id}
                      className="flex flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)]"
                    >
                      <video
                        src={item.previewUrl}
                        controls
                        playsInline
                        preload="metadata"
                        className="aspect-video w-full bg-black object-cover"
                      />
                      <div className="flex flex-1 flex-col gap-1 p-3 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h3 className="truncate text-sm font-semibold text-[var(--color-text)]">
                            {item.previewTitle ?? item.projectTitle}
                          </h3>
                          {item.mode && (
                            <span className="shrink-0 rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[10px] text-[var(--color-text-muted)]">
                              {item.mode}
                            </span>
                          )}
                          {item.storyMode && (
                            <span className="shrink-0 rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)]/10 px-2 py-0.5 text-[10px] text-[var(--color-accent)]">
                              {t(`vionto.storyMode.${item.storyMode}`)}
                            </span>
                          )}
                          {item.emotionalTone && (
                            <span className="shrink-0 rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[10px] text-[var(--color-text-muted)]">
                              {t(`vionto.emotionalTone.${item.emotionalTone}`)}
                            </span>
                          )}
                          {item.aspectLabel && (
                            <span className="shrink-0 rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[10px] text-[var(--color-text-muted)]">
                              {item.aspectLabel}
                            </span>
                          )}
                        </div>
                        <p className="truncate text-[11px] text-[var(--color-text-muted)]">
                          {item.filename ?? t("vionto.library.untitled")}
                        </p>
                        {item.previewSubtitle && (
                          <p className="line-clamp-2 text-xs text-[var(--color-text-muted)]">{item.previewSubtitle}</p>
                        )}
                        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2 text-[11px] text-[var(--color-text-muted)]">
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          {item.durationSeconds != null && <span>{item.durationSeconds}s</span>}
                          {item.fileSizeBytes != null && <span>{(item.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB</span>}
                        </div>
                        <div className="mt-2 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(t("vionto.library.removeConfirm"))) {
                                removeLibraryExport(item.id);
                              }
                            }}
                            className="inline-flex items-center justify-center rounded-md border border-red-300 p-1.5 text-red-500 transition hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
                            aria-label={t("vionto.library.remove")}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>

              {/* Pagination */}
              {(libraryPage > 1 || libraryHasNext) && (
                <div className="mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    disabled={libraryPage <= 1 || isLoadingLibrary}
                    onClick={() => {
                      const prevPage = libraryPage - 1;
                      const prevCursor = libraryCursors[prevPage - 1] ?? null;
                      setLibraryPage(prevPage);
                      loadExportLibrary({ cursor: prevCursor });
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-soft)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                    {t("vionto.pagination.previous")}
                  </button>
                  <span className="text-sm text-[var(--color-text-muted)]">
                    {t("vionto.pagination.page", { page: libraryPage })}
                  </span>
                  <button
                    type="button"
                    disabled={!libraryHasNext || isLoadingLibrary}
                    onClick={() => {
                      const lastItem = libraryExports[libraryExports.length - 1];
                      if (!lastItem) return;
                      const nextCursors = [...libraryCursors];
                      nextCursors[libraryPage] = lastItem.id;
                      setLibraryCursors(nextCursors);
                      setLibraryPage(libraryPage + 1);
                      loadExportLibrary({ cursor: lastItem.id });
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-soft)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {t("vionto.pagination.next")}
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </section>
        </section>
      </section>

      {/* Download URL Dialog */}
      {showDownloadDialog && downloadUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t("vionto.downloadDialog.title")}</h3>
              <button
                type="button"
                onClick={() => setShowDownloadDialog(false)}
                className="rounded-lg p-1 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-text)]"
              >
                <X size={20} />
              </button>
            </div>
            <p className="mb-4 text-sm text-[var(--color-text-muted)]">
              {t("vionto.downloadDialog.description")}
            </p>
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                readOnly
                value={downloadUrl}
                className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-2 text-sm text-[var(--color-text)]"
              />
              <button
                type="button"
                onClick={copyToClipboard}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-soft)]"
              >
                <Copy size={16} />
                {t("vionto.downloadDialog.copy")}
              </button>
            </div>
            <div className="flex gap-2">
              <a
                href={downloadUrl}
                download
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-accent)]/90"
              >
                <Download size={16} />
                {t("vionto.export.downloadMp4")}
              </a>
              <button
                type="button"
                onClick={() => setShowDownloadDialog(false)}
                className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-soft)]"
              >
                {t("common.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
