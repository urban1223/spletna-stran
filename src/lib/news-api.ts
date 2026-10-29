export type NewsLink = {
  label: string;
  url: string;
};

export type NewsImage = {
  id: number;
  data: string;
  alt: string;
};

export type NewsItem = {
  id: number;
  title: string;
  description: string;
  detailDescription: string;
  heroData: string | null;
  heroAlt: string;
  images: NewsImage[];
  links: NewsLink[];
};

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(path, { ...options, credentials: "same-origin" });
  const body = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) throw new Error(body.error || `Request failed with status ${response.status}`);
  return body;
};

const isNewsItem = (value: unknown): value is NewsItem => {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<NewsItem>;
  return typeof item.id === "number" && typeof item.title === "string" && item.title.trim().length > 0;
};

export const getNews = () => request<NewsItem[]>("/api/news");

export const getNewsItem = async (id: number) => {
  const item = await request<NewsItem>(`/api/news/${id}`);
  if (!isNewsItem(item)) throw new Error("News not found");
  return item;
};

export const createNews = (news: Omit<NewsItem, "id" | "images">) =>
  request<{ news: NewsItem }>("/api/news", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(news),
  });

export const updateNews = (news: NewsItem) =>
  request<{ news: NewsItem }>(`/api/news/${news.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: news.title,
      description: news.description,
      detailDescription: news.detailDescription,
      heroData: news.heroData,
      heroAlt: news.heroAlt,
      links: news.links,
    }),
  });

export const deleteNews = (id: number) => request<{ deleted: boolean }>(`/api/news/${id}`, { method: "DELETE" });

export const addNewsImage = (newsId: number, data: string, alt: string) =>
  request<{ image: NewsImage }>(`/api/news/${newsId}/images`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, alt }),
  });

export const updateNewsImage = (newsId: number, image: NewsImage) =>
  request<{ updated: boolean }>(`/api/news/${newsId}/images/${image.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ alt: image.alt }),
  });

export const deleteNewsImage = (newsId: number, imageId: number) =>
  request<{ deleted: boolean }>(`/api/news/${newsId}/images/${imageId}`, { method: "DELETE" });
