import type { Event } from "@/data/events-data";

const getJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
};

const sendJson = async <T>(path: string, method: "POST" | "PUT" | "DELETE", body?: unknown): Promise<T> => {
  const response = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) {
    throw new Error(payload.error || `Request failed with status ${response.status}`);
  }
  return payload;
};

export const getEvents = () => getJson<Event[]>("/api/events");

export const getEvent = (slug: string) => getJson<Event>(`/api/events/${encodeURIComponent(slug)}`);

export const getAdminSession = () => getJson<{ authenticated: boolean }>("/api/auth/me");

export const loginAdmin = (username: string, password: string) =>
  sendJson<{ authenticated: boolean }>("/api/auth/login", "POST", { username, password });

export const logoutAdmin = () => sendJson<{ authenticated: boolean }>("/api/auth/logout", "POST");

export const saveEvent = (event: Event, editingSlug?: string) =>
  sendJson<{ event: Event }>(
    editingSlug ? `/api/events/${encodeURIComponent(editingSlug)}` : "/api/events",
    editingSlug ? "PUT" : "POST",
    event,
  );

export const deleteEvent = (slug: string) =>
  sendJson<{ deleted: boolean; slug: string }>(`/api/events/${encodeURIComponent(slug)}`, "DELETE");
