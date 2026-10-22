import { mkdir } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { database, databasePath } from "./db.mjs";

const backupDirectory = process.env.BACKUP_DIR || join(dirname(databasePath), "backups");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = join(backupDirectory, `${basename(databasePath, ".sqlite")}-${timestamp}.sqlite`);

await mkdir(backupDirectory, { recursive: true });
const escapedBackupPath = backupPath.replace(/'/g, "''");
database.exec(`VACUUM INTO '${escapedBackupPath}'`);
database.close();
console.log(`SQLite backup created: ${backupPath}`);
