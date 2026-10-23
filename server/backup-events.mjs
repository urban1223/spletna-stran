import { cp, mkdir } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { database, databasePath } from "./db.mjs";

const backupDirectory = process.env.BACKUP_DIR || join(dirname(databasePath), "backups");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = join(backupDirectory, `${basename(databasePath, ".sqlite")}-${timestamp}.sqlite`);
const gallerySource = process.env.GALLERY_DIRECTORY || join(dirname(databasePath), "gallery");
const galleryBackupPath = join(backupDirectory, `gallery-${timestamp}`);

await mkdir(backupDirectory, { recursive: true });
const escapedBackupPath = backupPath.replace(/'/g, "''");
database.exec(`VACUUM INTO '${escapedBackupPath}'`);
database.close();
await cp(gallerySource, galleryBackupPath, { recursive: true, force: true }).catch((error) => {
  if (error.code !== "ENOENT") throw error;
});
console.log(`SQLite backup created: ${backupPath}`);
console.log(`Gallery backup created: ${galleryBackupPath}`);
