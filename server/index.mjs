import { createReadStream } from "node:fs";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { access, mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { database } from "./db.mjs";
import "./db.mjs";

const port = Number(process.env.PORT || 8080);
const publicDirectory = fileURLToPath(new URL("../dist/", import.meta.url));
const indexFile = join(publicDirectory, "index.html");
const galleryDirectory = process.env.GALLERY_DIRECTORY || fileURLToPath(new URL("../data/gallery/", import.meta.url));
const adminUsername = process.env.ADMIN_USERNAME || "urban";
const adminPassword = process.env.ADMIN_PASSWORD;
const sessions = new Map();

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
};

const publicBaseUrl = (process.env.PUBLIC_BASE_URL || "https://nova-akademija.si").replace(/\/$/, "");

const sendJson = (response, statusCode, body) => {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
};

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const sendSitemap = (response) => {
  const events = database
    .prepare("SELECT slug, iso_date, past FROM events WHERE published = 1 ORDER BY iso_date ASC, slug ASC")
    .all();
  const staticUrls = [
    { path: "/", lastmod: new Date().toISOString().slice(0, 10), changefreq: "weekly", priority: "1.0" },
    { path: "/dogodki", lastmod: new Date().toISOString().slice(0, 10), changefreq: "weekly", priority: "0.9" },
    { path: "/galerija", lastmod: new Date().toISOString().slice(0, 10), changefreq: "weekly", priority: "0.8" },
    { path: "/pogoji-uporabe", lastmod: "2026-10-26", changefreq: "yearly", priority: "0.2" },
    { path: "/zasebnost", lastmod: "2026-10-26", changefreq: "yearly", priority: "0.2" },
    { path: "/piskotki", lastmod: "2026-10-26", changefreq: "yearly", priority: "0.2" },
  ];
  const urls = [
    ...staticUrls,
    ...events.map((event) => ({
      path: `/dogodki/${event.slug}`,
      lastmod: event.iso_date,
      changefreq: Boolean(event.past) ? "never" : "monthly",
      priority: Boolean(event.past) ? "0.4" : "0.95",
    })),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(`${publicBaseUrl}${url.path}`)}</loc>
    <lastmod>${escapeXml(url.lastmod)}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
  response.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
  response.end(body);
};

const parseCookies = (header = "") =>
  Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim().split("="))
      .filter(([name, value]) => name && value)
      .map(([name, ...value]) => [name, decodeURIComponent(value.join("="))]),
  );

const isAuthenticated = (request) => {
  const sessionId = parseCookies(request.headers.cookie).nova_admin_session;
  const expiresAt = sessionId ? sessions.get(sessionId) : undefined;
  if (!expiresAt) return false;
  if (expiresAt <= Date.now()) {
    sessions.delete(sessionId);
    return false;
  }
  return true;
};

const setSessionCookie = (response, sessionId, request) => {
  const secure = request.headers["x-forwarded-proto"] === "https" ? "; Secure" : "";
  response.setHeader(
    "Set-Cookie",
    `nova_admin_session=${encodeURIComponent(sessionId)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${secure}`,
  );
};

const clearSessionCookie = (response) => {
  response.setHeader("Set-Cookie", "nova_admin_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0");
};

const safeEqual = (actual, expected) => {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
};

const readJsonBody = async (request) => {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > 512 * 1024) {
      throw new Error("Request body too large");
    }
  }
  return JSON.parse(body || "{}");
};

const validateEvent = (body) => {
  const requiredFields = ["slug", "title", "date", "isoDate", "time", "location", "cta"];
  if (
    !body ||
    typeof body !== "object" ||
    requiredFields.some((field) => typeof body[field] !== "string" || !body[field].trim())
  ) {
    return "Missing required event fields";
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug)) return "Invalid slug";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.isoDate)) return "Invalid date";
  for (const field of ["description", "program", "conductor", "admission", "link"]) {
    if (body[field] !== null && body[field] !== undefined && typeof body[field] !== "string") {
      return `Invalid ${field}`;
    }
  }
  return null;
};

const eventValues = (body) => [
  body.slug.trim(),
  body.title.trim(),
  body.date.trim(),
  body.isoDate.trim(),
  body.time.trim(),
  body.location.trim(),
  (body.description || "").trim(),
  (body.program || "").trim(),
  (body.conductor || "").trim(),
  (body.admission || "").trim(),
  body.cta.trim(),
  body.link?.trim() || null,
  body.reservation ? 1 : 0,
  body.past ? 1 : 0,
];

const sendFile = async (response, filePath) => {
  const fileStats = await stat(filePath);
  if (!fileStats.isFile()) {
    return false;
  }

  response.writeHead(200, {
    "Content-Type": contentTypes[extname(filePath).toLowerCase()] || "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
  return true;
};

const isInsidePublicDirectory = (filePath) => {
  const normalizedDirectory = normalize(publicDirectory + sep);
  return normalize(filePath).startsWith(normalizedDirectory);
};

const serializeEvent = (event) => ({
  slug: event.slug,
  title: event.title,
  date: event.date,
  isoDate: event.iso_date,
  time: event.time,
  location: event.location,
  description: event.description,
  program: event.program,
  conductor: event.conductor,
  admission: event.admission,
  cta: event.cta,
  link: event.link,
  reservation: Boolean(event.reservation),
  past: Boolean(event.past),
});

const serializeGallery = (album) => ({
  id: Number(album.id),
  title: album.title,
  instagramLink: album.instagram_url,
  images: album.images.map((image) => ({
    id: Number(image.id),
    src: image.storage_path.startsWith("/images/")
      ? image.storage_path
      : image.storage_path.startsWith("/gallery-files/")
        ? image.storage_path
        : `/gallery-files/${image.storage_path}`,
    alt: image.alt_text,
  })),
});

const serializeMember = (member) => ({
  slug: member.slug,
  name: member.name,
  role: member.role,
  instruments: member.instruments,
  imageKey: member.image_key,
  imageUrl: member.image_data || member.image_url,
  imageData: member.image_data,
  shortBio: member.short_bio,
  fullBio: member.full_bio,
  isMentor: Boolean(member.is_mentor),
});

const parseNewsLinks = (value) => {
  try {
    const links = JSON.parse(value || "[]");
    return Array.isArray(links)
      ? links.filter((link) => link && typeof link.label === "string" && typeof link.url === "string")
      : [];
  } catch {
    return [];
  }
};

const getNews = () =>
  database
    .prepare(
      `SELECT n.id, n.title, n.description, n.detail_description, n.hero_data, n.hero_alt, n.links_json,
              i.id AS image_id, i.image_data, i.alt_text
       FROM news n
       LEFT JOIN news_images i ON i.news_id = n.id
       WHERE n.published = 1
       ORDER BY n.sort_order ASC, n.id ASC, i.sort_order ASC, i.id ASC`,
    )
    .all()
    .reduce((items, row) => {
      let item = items.find((news) => news.id === Number(row.id));
      if (!item) {
        item = {
          id: Number(row.id),
          title: row.title,
          description: row.description,
          detailDescription: row.detail_description || row.description,
          heroData: row.hero_data,
          heroAlt: row.hero_alt,
          links: parseNewsLinks(row.links_json),
          images: [],
        };
        items.push(item);
      }
      if (row.image_id !== null) {
        item.images.push({ id: Number(row.image_id), data: row.image_data, alt: row.alt_text });
      }
      return items;
    }, []);

const validateNews = (body) => {
  if (!body || typeof body !== "object" || typeof body.title !== "string" || !body.title.trim()) {
    return "News title is required";
  }
  if (typeof body.description !== "string") return "News description is invalid";
  if (typeof body.detailDescription !== "string") return "News detail description is invalid";
  if (body.heroData !== null && body.heroData !== undefined && typeof body.heroData !== "string") {
    return "News image is invalid";
  }
  if (body.heroData && Buffer.byteLength(body.heroData, "utf8") > 300 * 1024) return "News image is too large";
  if (body.heroAlt !== undefined && typeof body.heroAlt !== "string") return "News image description is invalid";
  if (!Array.isArray(body.links) || body.links.length > 10) return "News links are invalid";
  if (
    body.links.some(
      (link) =>
        !link ||
        typeof link.label !== "string" ||
        !link.label.trim() ||
        typeof link.url !== "string" ||
        !link.url.trim() ||
        (!/^https?:\/\//i.test(link.url.trim()) && !link.url.trim().startsWith("/")),
    )
  ) {
    return "News links are invalid";
  }
  return null;
};

const newsValues = (body) => [
  body.title.trim(),
  body.description.trim(),
  body.detailDescription.trim(),
  body.heroData || null,
  (body.heroAlt || "").trim(),
  JSON.stringify(body.links.map((link) => ({ label: link.label.trim(), url: link.url.trim() }))),
];

const validateMember = (body) => {
  const required = ["slug", "name"];
  if (!body || typeof body !== "object" || required.some((field) => typeof body[field] !== "string" || !body[field].trim())) {
    return "Member name and slug are required";
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug)) return "Invalid slug";
  for (const field of ["role", "instruments", "imageKey", "imageUrl", "imageData", "shortBio", "fullBio"]) {
    if (body[field] !== null && body[field] !== undefined && typeof body[field] !== "string") return `Invalid ${field}`;
  }
  if (body.imageData && !/^data:image\/(?:jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(body.imageData)) {
    return "Invalid image data";
  }
  if (body.imageData && Buffer.byteLength(body.imageData, "utf8") > 300 * 1024) return "Image must be smaller than 200 KB";
  return null;
};

const memberValues = (body) => [
  body.slug.trim(),
  body.name.trim(),
  (body.role || "").trim(),
  (body.instruments || "").trim(),
  (body.imageKey || "").trim(),
  body.imageUrl?.trim() || null,
  body.imageData || null,
  (body.shortBio || "").trim(),
  (body.fullBio || "").trim(),
  body.isMentor ? 1 : 0,
];

const getGallery = () =>
  database
    .prepare(
      `SELECT a.id, a.title, a.instagram_url, i.id AS image_id, i.storage_path, i.alt_text
       FROM gallery_albums a
       LEFT JOIN gallery_images i ON i.album_id = a.id
       WHERE a.published = 1
       ORDER BY a.sort_order ASC, a.id ASC, i.sort_order ASC, i.id ASC`,
    )
    .all()
    .reduce((albums, row) => {
      let album = albums.find((item) => item.id === Number(row.id));
      if (!album) {
        album = { id: Number(row.id), title: row.title, instagram_url: row.instagram_url, images: [] };
        albums.push(album);
      }
      if (row.image_id !== null) {
        album.images.push({
          id: row.image_id,
          storage_path: row.storage_path,
          alt_text: row.alt_text,
        });
      }
      return albums;
    }, []);

const server = createServer(async (request, response) => {
  const allowedMethods =
    request.method === "GET" || request.method === "POST" || request.method === "PUT" || request.method === "DELETE";
  if (!allowedMethods) {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  if (requestUrl.pathname === "/api/health") {
    sendJson(response, 200, { status: "ok" });
    return;
  }

  if (requestUrl.pathname === "/api/news" && request.method === "GET") {
    sendJson(response, 200, getNews());
    return;
  }

  if (requestUrl.pathname === "/api/news" && request.method === "POST") {
    if (!isAuthenticated(request)) {
      sendJson(response, 401, { error: "Authentication required" });
      return;
    }
    try {
      const body = await readJsonBody(request);
      const errorMessage = validateNews(body);
      if (errorMessage) {
        sendJson(response, 400, { error: errorMessage });
        return;
      }
      const newsCount = database.prepare("SELECT COUNT(*) AS count FROM news WHERE published = 1").get().count;
      if (newsCount >= 3) {
        sendJson(response, 400, { error: "At most three news items can be published" });
        return;
      }
      const result = database
        .prepare(
          "INSERT INTO news (title, description, detail_description, hero_data, hero_alt, links_json, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
        )
        .run(...newsValues(body), newsCount);
      sendJson(response, 201, { news: getNews().find((item) => item.id === Number(result.lastInsertRowid)) });
      return;
    } catch (error) {
      if (error instanceof SyntaxError) {
        sendJson(response, 400, { error: "Invalid JSON" });
        return;
      }
      console.error("News creation failed:", error);
      sendJson(response, 500, { error: "Unable to save news" });
      return;
    }
  }

  if (requestUrl.pathname.startsWith("/api/news/")) {
    if (!isAuthenticated(request) && request.method !== "GET") {
      sendJson(response, 401, { error: "Authentication required" });
      return;
    }
    const parts = requestUrl.pathname.split("/").filter(Boolean);
    const newsId = Number(parts[2]);
    const imageId = parts[4] ? Number(parts[4]) : null;
    try {
      if (request.method === "DELETE" && !imageId) {
        const result = database.prepare("DELETE FROM news WHERE id = ?").run(newsId);
        if (result.changes === 0) {
          sendJson(response, 404, { error: "News not found" });
          return;
        }
        sendJson(response, 200, { deleted: true });
        return;
      }
      if (request.method === "PUT" && !imageId) {
        const body = await readJsonBody(request);
        const errorMessage = validateNews(body);
        if (errorMessage) {
          sendJson(response, 400, { error: errorMessage });
          return;
        }
        const result = database
          .prepare(
            "UPDATE news SET title = ?, description = ?, detail_description = ?, hero_data = ?, hero_alt = ?, links_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          )
          .run(...newsValues(body), newsId);
        if (result.changes === 0) {
          sendJson(response, 404, { error: "News not found" });
          return;
        }
        sendJson(response, 200, { news: getNews().find((item) => item.id === newsId) });
        return;
      }
      if (request.method === "POST" && parts[3] === "images") {
        const body = await readJsonBody(request);
        const match = /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(body.data || "");
        if (!match || typeof body.alt !== "string" || !body.alt.trim()) {
          sendJson(response, 400, { error: "A valid image and description are required" });
          return;
        }
        const news = database.prepare("SELECT id FROM news WHERE id = ?").get(newsId);
        const imageCount = database.prepare("SELECT COUNT(*) AS count FROM news_images WHERE news_id = ?").get(newsId).count;
        if (!news) {
          sendJson(response, 404, { error: "News not found" });
          return;
        }
        if (imageCount >= 5) {
          sendJson(response, 400, { error: "At most five detail images can be added" });
          return;
        }
        if (Buffer.byteLength(body.data, "utf8") > 300 * 1024) {
          sendJson(response, 413, { error: "Image must be smaller than 200 KB" });
          return;
        }
        const result = database
          .prepare("INSERT INTO news_images (news_id, image_data, alt_text, sort_order) VALUES (?, ?, ?, ?)")
          .run(newsId, body.data, body.alt.trim(), imageCount);
        sendJson(response, 201, {
          image: { id: Number(result.lastInsertRowid), data: body.data, alt: body.alt.trim() },
        });
        return;
      }
      if (request.method === "PUT" && imageId) {
        const body = await readJsonBody(request);
        if (typeof body.alt !== "string" || !body.alt.trim()) {
          sendJson(response, 400, { error: "Image description is required" });
          return;
        }
        const result = database
          .prepare("UPDATE news_images SET alt_text = ? WHERE id = ? AND news_id = ?")
          .run(body.alt.trim(), imageId, newsId);
        if (result.changes === 0) {
          sendJson(response, 404, { error: "Image not found" });
          return;
        }
        sendJson(response, 200, { updated: true });
        return;
      }
      if (request.method === "DELETE" && imageId) {
        const result = database.prepare("DELETE FROM news_images WHERE id = ? AND news_id = ?").run(imageId, newsId);
        if (result.changes === 0) {
          sendJson(response, 404, { error: "Image not found" });
          return;
        }
        sendJson(response, 200, { deleted: true });
        return;
      }
      sendJson(response, 400, { error: "Invalid news request" });
    } catch (error) {
      if (error instanceof SyntaxError) {
        sendJson(response, 400, { error: "Invalid JSON" });
        return;
      }
      console.error("News request failed:", error);
      sendJson(response, 500, { error: "Unable to update news" });
    }
    return;
  }

  if (requestUrl.pathname === "/api/gallery" && request.method === "GET") {
    sendJson(response, 200, getGallery().map(serializeGallery));
    return;
  }

  if (requestUrl.pathname === "/api/members" && request.method === "GET") {
    const members = database.prepare("SELECT * FROM members WHERE published = 1 ORDER BY is_mentor ASC, name COLLATE NOCASE ASC").all();
    sendJson(response, 200, members.map(serializeMember));
    return;
  }

  if (requestUrl.pathname === "/api/members/migrate-images" && request.method === "POST") {
    if (!isAuthenticated(request)) {
      sendJson(response, 401, { error: "Authentication required" });
      return;
    }
    try {
      const membersDirectory = fileURLToPath(new URL("../src/assets/members/", import.meta.url));
      const files = await (await import("node:fs/promises")).readdir(membersDirectory);
      let migrated = 0;
      for (const file of files) {
        if (!/\.(?:jpg|jpeg|png|webp)$/i.test(file)) continue;
        const slug = file.replace(/\.[^.]+$/, "");
        const existing = database.prepare("SELECT image_data FROM members WHERE slug = ?").get(slug);
        if (!existing || existing.image_data) continue;
        const extension = file.split(".").pop().toLowerCase();
        const mime = extension === "jpg" ? "jpeg" : extension;
        const imageData = `data:image/${mime};base64,${(await readFile(join(membersDirectory, file))).toString("base64")}`;
        database.prepare("UPDATE members SET image_data = ?, updated_at = CURRENT_TIMESTAMP WHERE slug = ?").run(imageData, slug);
        migrated += 1;
      }
      sendJson(response, 200, { migrated });
    } catch (error) {
      console.error("Member image migration failed:", error);
      sendJson(response, 500, { error: "Unable to migrate member images" });
    }
    return;
  }

  if ((requestUrl.pathname === "/api/members" || requestUrl.pathname.startsWith("/api/members/")) && request.method !== "GET") {
    if (!isAuthenticated(request)) {
      sendJson(response, 401, { error: "Authentication required" });
      return;
    }
    try {
      const slug = requestUrl.pathname.startsWith("/api/members/") ? decodeURIComponent(requestUrl.pathname.slice("/api/members/".length)) : null;
      if (request.method === "DELETE" && slug) {
        const result = database.prepare("DELETE FROM members WHERE slug = ?").run(slug);
        if (result.changes === 0) {
          sendJson(response, 404, { error: "Member not found" });
          return;
        }
        sendJson(response, 200, { deleted: true });
        return;
      }
      const body = await readJsonBody(request);
      const errorMessage = validateMember(body);
      if (errorMessage) {
        sendJson(response, 400, { error: errorMessage });
        return;
      }
      if (request.method === "POST") {
        database.prepare(
          `INSERT INTO members
            (slug, name, role, instruments, image_key, image_url, image_data, short_bio, full_bio, is_mentor, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        ).run(...memberValues(body));
        const saved = database.prepare("SELECT * FROM members WHERE slug = ?").get(body.slug.trim());
        sendJson(response, 201, { member: serializeMember(saved) });
        return;
      }
      if (request.method === "PUT" && slug) {
        const result = database.prepare(
          `UPDATE members SET slug = ?, name = ?, role = ?, instruments = ?, image_key = ?, image_url = ?, image_data = ?,
            short_bio = ?, full_bio = ?, is_mentor = ?, updated_at = CURRENT_TIMESTAMP WHERE slug = ?`,
        ).run(...memberValues(body), slug);
        if (result.changes === 0) {
          database.prepare(
            `INSERT INTO members
              (slug, name, role, instruments, image_key, image_url, image_data, short_bio, full_bio, is_mentor, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          ).run(...memberValues(body));
        }
        const saved = database.prepare("SELECT * FROM members WHERE slug = ?").get(body.slug.trim());
        sendJson(response, 200, { member: serializeMember(saved) });
        return;
      }
      sendJson(response, 400, { error: "Invalid member request" });
    } catch (error) {
      if (error instanceof SyntaxError) {
        sendJson(response, 400, { error: "Invalid JSON" });
        return;
      }
      console.error("Member request failed:", error);
      sendJson(response, 500, { error: "Unable to update member" });
    }
    return;
  }

  if (requestUrl.pathname === "/api/gallery" && request.method === "POST") {
    if (!isAuthenticated(request)) {
      sendJson(response, 401, { error: "Authentication required" });
      return;
    }
    try {
      const body = await readJsonBody(request);
      if (typeof body.title !== "string" || !body.title.trim()) {
        sendJson(response, 400, { error: "Gallery title is required" });
        return;
      }
      const result = database
        .prepare("INSERT INTO gallery_albums (title, instagram_url, sort_order) VALUES (?, ?, ?)")
        .run(
          body.title.trim(),
          body.instagramLink?.trim() || null,
          (database.prepare("SELECT COALESCE(MIN(sort_order), 0) - 1 AS first FROM gallery_albums").get().first),
        );
      sendJson(response, 201, { id: Number(result.lastInsertRowid) });
      return;
    } catch (error) {
      sendJson(response, error instanceof SyntaxError ? 400 : 500, { error: "Unable to save gallery" });
      return;
    }
  }

  if (requestUrl.pathname.startsWith("/api/gallery/")) {
    if (!isAuthenticated(request)) {
      sendJson(response, 401, { error: "Authentication required" });
      return;
    }
    const parts = requestUrl.pathname.split("/").filter(Boolean);
    const albumId = Number(parts[2]);
    const imageId = parts[4] ? Number(parts[4]) : null;
    try {
      if (request.method === "DELETE" && imageId) {
        const image = database
          .prepare("SELECT storage_path FROM gallery_images WHERE id = ? AND album_id = ?")
          .get(imageId, albumId);
        if (!image) {
          sendJson(response, 404, { error: "Image not found" });
          return;
        }
        database.prepare("DELETE FROM gallery_images WHERE id = ? AND album_id = ?").run(imageId, albumId);
        if (image.storage_path.startsWith("/gallery-files/")) {
          await unlink(join(galleryDirectory, image.storage_path.slice("/gallery-files/".length))).catch(() => {});
        }
        sendJson(response, 200, { deleted: true });
        return;
      }
      if (request.method === "PUT" && imageId) {
        const body = await readJsonBody(request);
        if (typeof body.alt !== "string" || !body.alt.trim()) {
          sendJson(response, 400, { error: "Image description is required" });
          return;
        }
        const result = database
          .prepare("UPDATE gallery_images SET alt_text = ? WHERE id = ? AND album_id = ?")
          .run(body.alt.trim(), imageId, albumId);
        if (result.changes === 0) {
          sendJson(response, 404, { error: "Image not found" });
          return;
        }
        sendJson(response, 200, { updated: true });
        return;
      }
      if (request.method === "DELETE" && !imageId) {
        const images = database
          .prepare("SELECT storage_path FROM gallery_images WHERE album_id = ?")
          .all(albumId);
        database.prepare("DELETE FROM gallery_albums WHERE id = ?").run(albumId);
        await Promise.all(
          images
            .filter((image) => image.storage_path.startsWith("/gallery-files/"))
            .map((image) =>
              unlink(join(galleryDirectory, image.storage_path.slice("/gallery-files/".length))).catch(() => {}),
            ),
        );
        sendJson(response, 200, { deleted: true });
        return;
      }
      if (request.method === "POST" && parts[3] === "move") {
        const body = await readJsonBody(request);
        if (body.direction !== "up" && body.direction !== "down") {
          sendJson(response, 400, { error: "Gallery direction is invalid" });
          return;
        }
        const current = database
          .prepare("SELECT id, sort_order FROM gallery_albums WHERE id = ?")
          .get(albumId);
        if (!current) {
          sendJson(response, 404, { error: "Gallery not found" });
          return;
        }
        const comparison = body.direction === "up" ? "<" : ">";
        const ordering = body.direction === "up" ? "DESC" : "ASC";
        const neighbor = database
          .prepare(
            `SELECT id, sort_order FROM gallery_albums
             WHERE sort_order ${comparison} ?
             ORDER BY sort_order ${ordering}, id ${ordering}
             LIMIT 1`,
          )
          .get(current.sort_order);
        if (!neighbor) {
          sendJson(response, 200, { moved: false });
          return;
        }
        database.exec("BEGIN");
        try {
          database.prepare("UPDATE gallery_albums SET sort_order = -1, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(current.id);
          database
            .prepare("UPDATE gallery_albums SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
            .run(current.sort_order, neighbor.id);
          database
            .prepare("UPDATE gallery_albums SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
            .run(neighbor.sort_order, current.id);
          database.exec("COMMIT");
        } catch (error) {
          database.exec("ROLLBACK");
          throw error;
        }
        sendJson(response, 200, { moved: true });
        return;
      }
      if (request.method === "PUT" && !imageId) {
        const body = await readJsonBody(request);
        if (typeof body.title !== "string" || !body.title.trim()) {
          sendJson(response, 400, { error: "Gallery title is required" });
          return;
        }
        database
          .prepare("UPDATE gallery_albums SET title = ?, instagram_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
          .run(body.title.trim(), body.instagramLink?.trim() || null, albumId);
        sendJson(response, 200, { updated: true });
        return;
      }
      if (request.method === "POST" && parts[3] === "images") {
        const body = await readJsonBody(request);
        const match = /^data:image\/(jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(body.data || "");
        if (!match || typeof body.alt !== "string") {
          sendJson(response, 400, { error: "Only resized JPEG or WebP images are allowed" });
          return;
        }
        const buffer = Buffer.from(match[2], "base64");
        if (buffer.length > 200 * 1024) {
          sendJson(response, 413, { error: "Image must be smaller than 200 KB" });
          return;
        }
        const album = database.prepare("SELECT id FROM gallery_albums WHERE id = ?").get(albumId);
        if (!album) {
          sendJson(response, 404, { error: "Gallery not found" });
          return;
        }
        const next = database
          .prepare("SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM gallery_images WHERE album_id = ?")
          .get(albumId).next;
        const filename = `${next}.jpg`;
        await mkdir(join(galleryDirectory, String(albumId)), { recursive: true });
        const relativePath = `${albumId}/${filename}`;
        await writeFile(join(galleryDirectory, relativePath), buffer);
        const result = database
          .prepare(
            "INSERT INTO gallery_images (album_id, storage_path, original_name, alt_text, sort_order) VALUES (?, ?, ?, ?, ?)",
          )
          .run(albumId, `/gallery-files/${relativePath}`, filename, body.alt.trim() || filename, next);
        sendJson(response, 201, { id: Number(result.lastInsertRowid), src: `/gallery-files/${relativePath}` });
        return;
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        sendJson(response, 400, { error: "Invalid JSON" });
        return;
      }
      console.error("Gallery request failed:", error);
      sendJson(response, 500, { error: "Unable to update gallery" });
      return;
    }
  }

  if (requestUrl.pathname === "/sitemap.xml" && request.method === "GET") {
    sendSitemap(response);
    return;
  }

  if (requestUrl.pathname === "/api/auth/login" && request.method === "POST") {
    if (!adminPassword) {
      sendJson(response, 503, { error: "Admin authentication is not configured" });
      return;
    }
    try {
      const body = await readJsonBody(request);
      if (
        typeof body.username !== "string" ||
        typeof body.password !== "string" ||
        !safeEqual(body.username, adminUsername) ||
        !safeEqual(body.password, adminPassword)
      ) {
        sendJson(response, 401, { error: "Invalid credentials" });
        return;
      }
      const sessionId = randomBytes(32).toString("hex");
      sessions.set(sessionId, Date.now() + 8 * 60 * 60 * 1000);
      setSessionCookie(response, sessionId, request);
      sendJson(response, 200, { authenticated: true });
      return;
    } catch (error) {
      sendJson(response, error instanceof SyntaxError ? 400 : 413, { error: "Invalid request" });
      return;
    }
  }

  if (requestUrl.pathname === "/api/auth/me") {
    sendJson(response, 200, { authenticated: isAuthenticated(request) });
    return;
  }

  if (requestUrl.pathname === "/api/auth/logout" && request.method === "POST") {
    const sessionId = parseCookies(request.headers.cookie).nova_admin_session;
    if (sessionId) sessions.delete(sessionId);
    clearSessionCookie(response);
    sendJson(response, 200, { authenticated: false });
    return;
  }

  if ((requestUrl.pathname === "/api/events" || requestUrl.pathname.startsWith("/api/events/")) && request.method !== "GET") {
    if (!isAuthenticated(request)) {
      sendJson(response, 401, { error: "Authentication required" });
      return;
    }

    try {
      if (request.method === "DELETE" && requestUrl.pathname.startsWith("/api/events/")) {
        const slug = decodeURIComponent(requestUrl.pathname.slice("/api/events/".length));
        const result = database.prepare("DELETE FROM events WHERE slug = ?").run(slug);
        if (result.changes === 0) {
          sendJson(response, 404, { error: "Not found" });
          return;
        }
        sendJson(response, 200, { deleted: true, slug });
        return;
      }

      const body = await readJsonBody(request);
      const errorMessage = validateEvent(body);
      if (errorMessage) {
        sendJson(response, 400, { error: errorMessage });
        return;
      }

      if (request.method === "POST" && requestUrl.pathname === "/api/events") {
        database
          .prepare(
            `INSERT INTO events
              (slug, title, date, iso_date, time, location, description, program, conductor, admission, cta, link, reservation, past, published, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
          )
          .run(...eventValues(body));
        const savedEvent = database.prepare("SELECT * FROM events WHERE slug = ?").get(body.slug.trim());
        sendJson(response, 201, { event: serializeEvent(savedEvent) });
        return;
      }

      if (request.method === "PUT" && requestUrl.pathname.startsWith("/api/events/")) {
        const slug = decodeURIComponent(requestUrl.pathname.slice("/api/events/".length));
        const result = database
          .prepare(
            `UPDATE events SET title = ?, date = ?, iso_date = ?, time = ?, location = ?, description = ?,
              program = ?, conductor = ?, admission = ?, cta = ?, link = ?, reservation = ?, past = ?, updated_at = CURRENT_TIMESTAMP
             WHERE slug = ?`,
          )
          .run(
            body.title.trim(),
            body.date.trim(),
            body.isoDate.trim(),
            body.time.trim(),
            body.location.trim(),
            (body.description || "").trim(),
            (body.program || "").trim(),
            (body.conductor || "").trim(),
            (body.admission || "").trim(),
            body.cta.trim(),
            body.link?.trim() || null,
            body.reservation ? 1 : 0,
            body.past ? 1 : 0,
            slug,
          );
        if (result.changes === 0) {
          sendJson(response, 404, { error: "Not found" });
          return;
        }
        const savedEvent = database.prepare("SELECT * FROM events WHERE slug = ?").get(slug);
        sendJson(response, 200, { event: serializeEvent(savedEvent) });
        return;
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        sendJson(response, 400, { error: "Invalid JSON" });
        return;
      }
      if (error?.code === "SQLITE_CONSTRAINT_PRIMARYKEY") {
        sendJson(response, 409, { error: "An event with this slug already exists" });
        return;
      }
      console.error("Event write failed:", error);
      sendJson(response, 500, { error: "Unable to save event" });
      return;
    }
  }

  if (requestUrl.pathname === "/api/events") {
    const events = database
      .prepare("SELECT * FROM events WHERE published = 1 ORDER BY iso_date ASC, time ASC, slug ASC")
      .all()
      .map(serializeEvent);
    sendJson(response, 200, events);
    return;
  }

  if (requestUrl.pathname.startsWith("/api/events/")) {
    try {
      const slug = decodeURIComponent(requestUrl.pathname.slice("/api/events/".length));
      const event = database
        .prepare("SELECT * FROM events WHERE slug = ? AND published = 1")
        .get(slug);

      if (!event) {
        sendJson(response, 404, { error: "Not found" });
        return;
      }

      sendJson(response, 200, serializeEvent(event));
      return;
    } catch (error) {
      if (error instanceof URIError) {
        sendJson(response, 400, { error: "Invalid URL" });
        return;
      }
      throw error;
    }
  }

  if (requestUrl.pathname === "/api" || requestUrl.pathname.startsWith("/api/")) {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  try {
    if (requestUrl.pathname.startsWith("/gallery-files/")) {
      const relativePath = decodeURIComponent(requestUrl.pathname.slice("/gallery-files/".length));
      const requestedFile = join(galleryDirectory, relativePath);
      if (normalize(requestedFile).startsWith(normalize(galleryDirectory + sep)) && (await access(requestedFile).then(() => true).catch(() => false))) {
        if (await sendFile(response, requestedFile)) return;
      }
      sendJson(response, 404, { error: "Not found" });
      return;
    }
    const decodedPath = decodeURIComponent(requestUrl.pathname);
    const requestedFile = join(publicDirectory, decodedPath);

    if (isInsidePublicDirectory(requestedFile) && (await access(requestedFile).then(() => true).catch(() => false))) {
      if (await sendFile(response, requestedFile)) {
        return;
      }
    }

    if (!extname(decodedPath) && (await sendFile(response, indexFile))) {
      return;
    }

    sendJson(response, 404, { error: "Not found" });
  } catch (error) {
    if (error instanceof URIError) {
      sendJson(response, 400, { error: "Invalid URL" });
      return;
    }

    console.error("Request failed:", error);
    sendJson(response, 500, { error: "Internal server error" });
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Nova akademija server listening on port ${port}`);
});
