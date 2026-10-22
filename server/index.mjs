import { createReadStream } from "node:fs";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { access, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { database } from "./db.mjs";
import "./db.mjs";

const port = Number(process.env.PORT || 8080);
const publicDirectory = fileURLToPath(new URL("../dist/", import.meta.url));
const indexFile = join(publicDirectory, "index.html");
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

const sendJson = (response, statusCode, body) => {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
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
    if (Buffer.byteLength(body) > 64 * 1024) {
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

const server = createServer(async (request, response) => {
  const allowedMethods = request.method === "GET" || request.method === "POST" || request.method === "PUT";
  if (!allowedMethods) {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  if (requestUrl.pathname === "/api/health") {
    sendJson(response, 200, { status: "ok" });
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
