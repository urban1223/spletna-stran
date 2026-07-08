// Sinhronizira skupni dizajn sistem v vsa orodja.
//
// Enotni vir resnice je `shared/shared-style.css`. Vsako orodje (bw-converter,
// manuscript-cropper, prstni-redi, ...) je samostojna offline PWA in mora imeti
// svojo lokalno kopijo datoteke (da jo service worker predpomni). Ta skripta
// prekopira master v vsako mapo v korenu, ki že vsebuje `shared-style.css`.
//
// Uporaba: uredi `shared/shared-style.css`, nato poženi `npm run sync:styles`.

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MASTER = join(ROOT, "shared", "shared-style.css");

const source = readFileSync(MASTER, "utf8");

const targets = readdirSync(ROOT)
  .filter((name) => name !== "shared" && name !== "node_modules")
  .map((name) => join(ROOT, name))
  .filter((dir) => {
    try {
      return statSync(dir).isDirectory() && existsSync(join(dir, "shared-style.css"));
    } catch {
      return false;
    }
  });

let updated = 0;
for (const dir of targets) {
  const dest = join(dir, "shared-style.css");
  if (readFileSync(dest, "utf8") !== source) {
    writeFileSync(dest, source);
    console.log("posodobljeno:", dest);
    updated++;
  }
}

console.log(
  `Sinhronizacija končana — ${targets.length} orodij pregledanih, ${updated} posodobljenih.`
);
