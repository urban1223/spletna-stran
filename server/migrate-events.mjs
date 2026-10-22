import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { database, databasePath } from "./db.mjs";

const sourcePath = new URL("../src/data/events-data.ts", import.meta.url);
const source = await readFile(sourcePath, "utf8");
const executableSource = source
  .replace(/export interface Event \{[\s\S]*?\}\s*/, "")
  .replace("export const upcomingEvents: Event[] =", "const upcomingEvents =")
  .replace("export const pastEvents: Event[] =", "const pastEvents =")
  .replace("export const allEvents = [...upcomingEvents, ...pastEvents];", "")
  .concat("\nglobalThis.eventData = { upcomingEvents, pastEvents };");

const context = {};
vm.runInNewContext(executableSource, context, { filename: "events-data.ts" });

const events = [
  ...context.eventData.upcomingEvents.map((event) => ({ ...event, past: Boolean(event.past) })),
  ...context.eventData.pastEvents.map((event) => ({ ...event, past: true })),
];

const insertEvent = database.prepare(`
  INSERT OR IGNORE INTO events (
    slug, title, date, iso_date, time, location, description, program,
    conductor, admission, cta, link, reservation, past, published
  ) VALUES (
    :slug, :title, :date, :isoDate, :time, :location, :description, :program,
    :conductor, :admission, :cta, :link, :reservation, :past, 1
  )
`);

let inserted = 0;

for (const event of events) {
  if (!event.slug || !event.title || !event.date || !event.isoDate || !event.time || !event.location || !event.cta) {
    throw new Error(`Invalid event data for slug: ${event.slug || "(missing)"}`);
  }

  const result = insertEvent.run({
    slug: event.slug,
    title: event.title,
    date: event.date,
    isoDate: event.isoDate,
    time: event.time,
    location: event.location,
    description: event.description || "",
    program: event.program || "",
    conductor: event.conductor || "",
    admission: event.admission || "",
    cta: event.cta,
    link: event.link || null,
    reservation: event.reservation ? 1 : 0,
    past: event.past ? 1 : 0,
  });

  inserted += Number(result.changes);
}

console.log(`Imported ${inserted} of ${events.length} events into ${databasePath}`);
