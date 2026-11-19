export type ComposerEvent = {
  id?: number;
  type: "birth" | "death" | "education" | "employment" | "composition" | "premiere" | "travel" | "award" | "other";
  year: number | null;
  yearEnd: number | null;
  dateText: string;
  place: string;
  title: string;
  description: string;
  sourceExcerpt: string;
  confidence: "high" | "medium" | "low";
  verified: boolean;
  sortOrder: number;
};

export type Composer = {
  id: number;
  slug: string;
  name: string;
  birthYear: number | null;
  deathYear: number | null;
  birthPlace: string;
  deathPlace: string;
  biography: string;
  sourceUrl: string;
  sourceText: string;
  status: "draft" | "in-progress" | "review" | "complete";
  eventCount?: number;
  updatedAt?: string;
  events?: ComposerEvent[];
};

export type ExtractedComposer = {
  birthYear: number | null;
  deathYear: number | null;
  birthPlace: string;
  deathPlace: string;
  events: ComposerEvent[];
  provider: "openai" | "gemini";
};

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(path, { ...options, credentials: "same-origin" });
  const body = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) throw new Error(body.error || `Request failed with status ${response.status}`);
  return body;
};

export const getComposers = () => request<Composer[]>("/api/composers");
export const getComposer = (slug: string) => request<Composer>(`/api/composers/${encodeURIComponent(slug)}`);
export const createComposer = (composer: Partial<Composer>) =>
  request<{ composer: Composer }>("/api/composers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(composer),
  });
export const updateComposer = (slug: string, composer: Composer) =>
  request<{ composer: Composer }>(`/api/composers/${encodeURIComponent(slug)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(composer),
  });
export const deleteComposer = (slug: string) =>
  request<{ deleted: boolean }>(`/api/composers/${encodeURIComponent(slug)}`, { method: "DELETE" });
export const extractComposer = (name: string, sourceText: string) =>
  request<ExtractedComposer>("/api/composer-extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, sourceText }),
  });
export const backupComposerData = () =>
  request<{ backedUp: boolean; database: string }>("/api/admin/backup", { method: "POST" });

export type ComposerCatalogItem = { name: string; slug?: string };

export type ComposerSettings = {
  openAiConfigured: boolean;
  geminiConfigured: boolean;
  openAiKeyMasked: string;
  geminiKeyMasked: string;
  provider: "openai" | "gemini" | "none";
};

export const getComposerCatalog = () => request<ComposerCatalogItem[]>("/api/composer-catalog");
export const getComposerSettings = () => request<ComposerSettings>("/api/composer-settings");
export const updateComposerSettings = (openAiKey: string, geminiKey: string) =>
  request<ComposerSettings>("/api/composer-settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ openAiKey, geminiKey }),
  });
