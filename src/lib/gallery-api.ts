export type GalleryImage = {
  id: number;
  src: string;
  alt: string;
};

export type GalleryAlbum = {
  id: number;
  title: string;
  instagramLink: string | null;
  images: GalleryImage[];
};

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(path, { ...options, credentials: "same-origin" });
  const body = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) throw new Error(body.error || `Request failed with status ${response.status}`);
  return body;
};

export const getGallery = () => request<GalleryAlbum[]>("/api/gallery");

export const createGallery = (title: string, instagramLink: string) =>
  request<{ id: number }>("/api/gallery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, instagramLink }),
  });

export const updateGallery = (album: GalleryAlbum) =>
  request<{ updated: boolean }>(`/api/gallery/${album.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: album.title, instagramLink: album.instagramLink }),
  });

export const deleteGallery = (id: number) => request<{ deleted: boolean }>(`/api/gallery/${id}`, { method: "DELETE" });

export const uploadGalleryImage = (albumId: number, data: string, alt: string) =>
  request<{ id: number; src: string }>(`/api/gallery/${albumId}/images`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, alt }),
  });

export const deleteGalleryImage = (albumId: number, imageId: number) =>
  request<{ deleted: boolean }>(`/api/gallery/${albumId}/images/${imageId}`, { method: "DELETE" });
