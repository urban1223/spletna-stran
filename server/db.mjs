import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const localDatabasePath = fileURLToPath(new URL("../data/events.sqlite", import.meta.url));
const databasePath = process.env.DATABASE_PATH || localDatabasePath;

mkdirSync(dirname(databasePath), { recursive: true });

const database = new DatabaseSync(databasePath);
database.exec("PRAGMA foreign_keys = ON;");

database.exec(`
  CREATE TABLE IF NOT EXISTS events (
    slug TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    iso_date TEXT NOT NULL,
    time TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    program TEXT NOT NULL DEFAULT '',
    conductor TEXT NOT NULL DEFAULT '',
    admission TEXT NOT NULL DEFAULT '',
    cta TEXT NOT NULL,
    link TEXT,
    reservation INTEGER NOT NULL DEFAULT 0,
    past INTEGER NOT NULL DEFAULT 0,
    published INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS gallery_albums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    instagram_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    published INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS gallery_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    album_id INTEGER NOT NULL REFERENCES gallery_albums(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    original_name TEXT NOT NULL,
    alt_text TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS members (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT '',
    instruments TEXT NOT NULL DEFAULT '',
    image_key TEXT NOT NULL DEFAULT '',
    image_url TEXT,
    image_data TEXT,
    short_bio TEXT NOT NULL DEFAULT '',
    full_bio TEXT NOT NULL DEFAULT '',
    is_mentor INTEGER NOT NULL DEFAULT 0,
    published INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

try {
  database.exec("ALTER TABLE members ADD COLUMN image_data TEXT");
} catch (error) {
  if (!String(error?.message || "").includes("duplicate column name")) throw error;
}

export { database, databasePath };
