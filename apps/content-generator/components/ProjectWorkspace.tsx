"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  chatsApi,
  projectsApi,
  promptsApi,
  type ChatSession,
  type ProjectFolder,
  type SavedPromptDto,
} from "@/lib/client/api";

type ProjectWorkspaceProps = {
  selectedFolderId: string | null;
  selectedSessionId: string | null;
  onFolderChange: (folderId: string | null) => void;
  onSessionChange: (sessionId: string | null) => void;
  onApplyPrompt: (prompt: SavedPromptDto) => void;
  refreshKey: number;
};

export function ProjectWorkspace({
  selectedFolderId,
  selectedSessionId,
  onFolderChange,
  onSessionChange,
  onApplyPrompt,
  refreshKey,
}: ProjectWorkspaceProps) {
  const [folders, setFolders] = useState<ProjectFolder[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [prompts, setPrompts] = useState<SavedPromptDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [foldersResponse, sessionsResponse, promptsResponse] = await Promise.all([
        projectsApi.list(),
        chatsApi.list(selectedFolderId ? { folderId: selectedFolderId } : undefined),
        promptsApi.list(selectedFolderId ? { folderId: selectedFolderId } : undefined),
      ]);
      setFolders(foldersResponse.folders);
      setSessions(sessionsResponse.sessions);
      setPrompts(promptsResponse.prompts);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load workspace.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedFolderId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll, refreshKey]);

  const activeFolders = useMemo(() => folders.filter((f) => !f.isArchived), [folders]);

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) return;
    setIsCreatingFolder(true);
    setError(null);
    try {
      const { folder } = await projectsApi.create({ name });
      setNewFolderName("");
      setFolders((prev) => [...prev, folder]);
      onFolderChange(folder.id);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create project.");
    } finally {
      setIsCreatingFolder(false);
    }
  };

  return (
    <aside className="flex flex-col gap-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5">
      <header>
        <h3 className="text-sm font-semibold tracking-tight">Projects</h3>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          Group your generations into projects. History is saved to your account.
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={newFolderName}
          onChange={(event) => setNewFolderName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleCreateFolder();
            }
          }}
          placeholder="New project name"
          className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          disabled={isCreatingFolder}
          maxLength={120}
        />
        <button
          type="button"
          onClick={handleCreateFolder}
          disabled={isCreatingFolder || !newFolderName.trim()}
          className="cursor-pointer rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCreatingFolder ? "..." : "Add"}
        </button>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
          Active project
        </p>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onFolderChange(null)}
            className={`cursor-pointer rounded-lg px-3 py-2 text-left text-sm transition ${
              selectedFolderId === null
                ? "bg-[var(--color-primary)]/15 text-[var(--color-text)]"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
            }`}
          >
            All generations
          </button>
          {activeFolders.map((folder) => (
            <button
              key={folder.id}
              type="button"
              onClick={() => onFolderChange(folder.id)}
              className={`cursor-pointer truncate rounded-lg px-3 py-2 text-left text-sm transition ${
                selectedFolderId === folder.id
                  ? "bg-[var(--color-primary)]/15 text-[var(--color-text)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
              }`}
              title={folder.name}
            >
              {folder.name}
            </button>
          ))}
          {activeFolders.length === 0 && !isLoading && (
            <p className="px-3 py-2 text-xs text-[var(--color-text-secondary)]">
              No projects yet.
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
            Recent sessions
          </p>
          <button
            type="button"
            onClick={() => onSessionChange(null)}
            className="cursor-pointer text-[11px] font-medium text-[var(--color-primary)] hover:underline"
          >
            New
          </button>
        </div>
        <div className="flex flex-col gap-1">
          {sessions.length === 0 && !isLoading && (
            <p className="px-3 py-2 text-xs text-[var(--color-text-secondary)]">
              No sessions yet.
            </p>
          )}
          {sessions.slice(0, 8).map((session) => (
            <button
              key={session.id}
              type="button"
              onClick={() => onSessionChange(session.id)}
              className={`cursor-pointer truncate rounded-lg px-3 py-2 text-left text-xs transition ${
                selectedSessionId === session.id
                  ? "bg-[var(--color-primary)]/15 text-[var(--color-text)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
              }`}
              title={session.title}
            >
              {session.title}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
          Saved prompts
        </p>
        <div className="flex flex-col gap-1">
          {prompts.length === 0 && !isLoading && (
            <p className="px-3 py-2 text-xs text-[var(--color-text-secondary)]">
              No saved prompts yet.
            </p>
          )}
          {prompts.slice(0, 6).map((prompt) => (
            <button
              key={prompt.id}
              type="button"
              onClick={() => onApplyPrompt(prompt)}
              className="cursor-pointer truncate rounded-lg px-3 py-2 text-left text-xs text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
              title={prompt.prompt}
            >
              <span className="font-medium text-[var(--color-text)]">{prompt.title}</span>
              <span className="ml-2 text-[10px] uppercase tracking-wide text-[var(--color-text-secondary)]">
                {prompt.contentType}
              </span>
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <p className="text-xs text-[var(--color-text-secondary)]">Loading…</p>
      )}
    </aside>
  );
}
