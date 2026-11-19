import { database } from "./db.mjs";
import { initializeFirebase, composersCollection, profileUid } from "./firebase.mjs";

await initializeFirebase();
const collection = await composersCollection();
const rows = database
  .prepare("SELECT * FROM composers ORDER BY name COLLATE NOCASE ASC")
  .all();

let composersMigrated = 0;
let eventsMigrated = 0;

for (const composer of rows) {
  const slug = composer.slug;
  const composerReference = collection.doc(slug);
  await composerReference.set(
    {
      name: composer.name,
      birthYear: composer.birth_year,
      deathYear: composer.death_year,
      birthPlace: composer.birth_place || "",
      deathPlace: composer.death_place || "",
      biography: composer.biography || "",
      sourceUrl: composer.source_url || "",
      sourceText: composer.source_text || "",
      status: composer.status || "draft",
      profileUid,
      sourceType: "sqlite-migration",
      migratedAt: new Date().toISOString(),
      updatedAt: composer.updated_at,
    },
    { merge: true },
  );
  composersMigrated += 1;

  const eventRows = database
    .prepare("SELECT * FROM composer_events WHERE composer_id = ? ORDER BY sort_order ASC, year ASC, id ASC")
    .all(composer.id);

  for (const [index, event] of eventRows.entries()) {
    await composerReference
      .collection("events")
      .doc(event.id ? String(event.id) : `${slug}-${index + 1}`)
      .set(
        {
          type: event.event_type || "other",
          year: event.year,
          yearEnd: event.year_end,
          dateText: event.date_text || "",
          place: event.place || "",
          title: event.title || "",
          description: event.description || "",
          sourceExcerpt: event.source_excerpt || "",
          confidence: event.confidence || "medium",
          verified: Boolean(event.verified),
          sortOrder: event.sort_order ?? index,
          profileUid,
          sourceType: "sqlite-migration",
          updatedAt: event.updated_at,
        },
        { merge: true },
      );
    eventsMigrated += 1;
  }
}

console.log(`Migrated ${composersMigrated} composers and ${eventsMigrated} events to Firestore`);
