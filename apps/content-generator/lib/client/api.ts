const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export type ProjectFolder = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  parentId: string | null;
  position: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ChatSession = {
  id: string;
  title: string;
  contentType: string | null;
  status: string;
  folderId: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessage = {
  id: string;
  role: string;
  content: string;
  contentType: string | null;
  provider: string | null;
  model: string | null;
  createdAt: string;
};

export type SavedPromptDto = {
  id: string;
  title: string;
  contentType: string;
  prompt: string;
  systemPrompt: string | null;
  tags: string[];
  isFavorite: boolean;
  folderId: string | null;
  sessionId: string | null;
  createdAt: string;
  updatedAt: string;
};

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${basePath}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof (data as { error?: string }).error === "string"
        ? (data as { error: string }).error
        : `Request failed: ${response.status}`,
    );
  }
  return data as T;
}

export const projectsApi = {
  list: () => request<{ folders: ProjectFolder[] }>("GET", "/api/projects"),
  create: (input: { name: string; description?: string; color?: string; icon?: string; parentId?: string | null }) =>
    request<{ folder: ProjectFolder }>("POST", "/api/projects", input),
  update: (id: string, input: Partial<{ name: string; description: string | null; color: string | null; icon: string | null; isArchived: boolean; position: number; parentId: string | null }>) =>
    request<{ folder: ProjectFolder }>("PATCH", `/api/projects/${id}`, input),
  remove: (id: string) => request<{ ok: true }>("DELETE", `/api/projects/${id}`),
};

export const chatsApi = {
  list: (params?: { folderId?: string; includeArchived?: boolean }) => {
    const search = new URLSearchParams();
    if (params?.folderId) search.set("folderId", params.folderId);
    if (params?.includeArchived) search.set("includeArchived", "true");
    const qs = search.toString();
    return request<{ sessions: ChatSession[] }>("GET", `/api/chats${qs ? `?${qs}` : ""}`);
  },
  create: (input: { title?: string; contentType?: string; folderId?: string | null }) =>
    request<{ session: ChatSession }>("POST", "/api/chats", input),
  update: (id: string, input: Partial<{ title: string; status: string; folderId: string | null }>) =>
    request<{ session: ChatSession }>("PATCH", `/api/chats/${id}`, input),
  remove: (id: string) => request<{ ok: true }>("DELETE", `/api/chats/${id}`),
  messages: (id: string) => request<{ messages: ChatMessage[] }>("GET", `/api/chats/${id}/messages`),
};

export type ContentTypeDefinition = {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  promptInstructions: string | null;
  systemPrompt: string | null;
  isSystem: boolean;
  isActive: boolean;
};

export type ContentTypeCreateInput = {
  slug?: string;
  label: string;
  description?: string | null;
  promptInstructions?: string | null;
  systemPrompt?: string | null;
};

export type ContentTypeUpdateInput = Partial<{
  label: string;
  description: string | null;
  promptInstructions: string | null;
  systemPrompt: string | null;
  isActive: boolean;
}>;

export const contentTypesApi = {
  list: () =>
    request<{ contentTypes: ContentTypeDefinition[] }>("GET", "/api/content-types"),
  create: (input: ContentTypeCreateInput) =>
    request<{ contentType: ContentTypeDefinition }>("POST", "/api/content-types", input),
  update: (id: string, input: ContentTypeUpdateInput) =>
    request<{ contentType: ContentTypeDefinition }>(
      "PATCH",
      `/api/content-types/${id}`,
      input,
    ),
  remove: (id: string) =>
    request<{ ok: true }>("DELETE", `/api/content-types/${id}`),
};

export const promptsApi = {
  list: (params?: { folderId?: string; favorites?: boolean }) => {
    const search = new URLSearchParams();
    if (params?.folderId) search.set("folderId", params.folderId);
    if (params?.favorites) search.set("favorites", "true");
    const qs = search.toString();
    return request<{ prompts: SavedPromptDto[] }>("GET", `/api/prompts${qs ? `?${qs}` : ""}`);
  },
  create: (input: {
    title: string;
    contentType: string;
    prompt: string;
    systemPrompt?: string | null;
    tags?: string[];
    isFavorite?: boolean;
    folderId?: string | null;
    sessionId?: string | null;
  }) => request<{ prompt: SavedPromptDto }>("POST", "/api/prompts", input),
  update: (id: string, input: Partial<{ title: string; prompt: string; systemPrompt: string | null; tags: string[]; isFavorite: boolean; folderId: string | null }>) =>
    request<{ prompt: SavedPromptDto }>("PATCH", `/api/prompts/${id}`, input),
  remove: (id: string) => request<{ ok: true }>("DELETE", `/api/prompts/${id}`),
};

export type GenerateResponse = {
  output: string;
  sessionId: string;
  generationId: string;
  truncated?: boolean;
  stopReason?: string;
  messageId?: string;
  provider?: string;
  model?: string;
};

export async function generate(input: {
  type: string;
  input: string;
  folderId?: string | null;
  sessionId?: string | null;
}): Promise<GenerateResponse> {
  return request<GenerateResponse>("POST", "/api/generate", input);
}
