import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const localDatabasePath = fileURLToPath(new URL("../data/events.sqlite", import.meta.url));
const databasePath = process.env.DATABASE_PATH || localDatabasePath;

mkdirSync(dirname(databasePath), { recursive: true });

const database = new DatabaseSync(databasePath);

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
`);

export { database, databasePath };
