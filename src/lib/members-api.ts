import type { Member } from "@/data/members-data";

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(path, { ...options, credentials: "same-origin" });
  const body = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) throw new Error(body.error || `Request failed with status ${response.status}`);
  return body;
};

export type AdminMember = Member & { imageUrl: string | null; imageData?: string | null };

export const getMembers = () => request<AdminMember[]>("/api/members");
export const saveMember = (member: AdminMember, editingSlug?: string) =>
  request<{ member: AdminMember }>(editingSlug ? `/api/members/${encodeURIComponent(editingSlug)}` : "/api/members", {
    method: editingSlug ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(member),
  });
export const deleteMember = (slug: string) =>
  request<{ deleted: boolean }>(`/api/members/${encodeURIComponent(slug)}`, { method: "DELETE" });

export const migrateMemberImages = () =>
  request<{ migrated: number }>("/api/members/migrate-images", { method: "POST" });
