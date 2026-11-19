import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { initializeFirebase, getFirestore, composersCollection, profileUid } from "./firebase.mjs";

const catalogPath = process.env.COMPOSER_CATALOG_PATH ||
  fileURLToPath(new URL("./catalog/composer-catalog.json", import.meta.url));
const catalog = JSON.parse(await readFile(catalogPath, "utf8"));

await initializeFirebase();
const firestore = await getFirestore();
const collection = await composersCollection();

const beforeSnapshot = await collection.get();
const existingBefore = new Set(beforeSnapshot.docs.map((document) => document.id));
const legacySnapshot = await firestore.collection("musicians").get();

const slugify = (name) =>
  String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "composer";

const integerOrNull = (value) => {
  const parsed = Number.parseInt(String(value ?? "").trim(), 10);
  return Number.isInteger(parsed) ? parsed : null;
};

const eventDateText = (event) => {
  if (!event?.date) return "";
  const year = event.date.year ?? event.year;
  const month = event.date.month;
  const day = event.date.day;
  if (day && month && year) return `${day}.${month}.${year}`;
  if (month && year) return `${month}.${year}`;
  return year ? String(year) : "";
};

const normalizeCatalogEvent = (event, index) => ({
  id: event.id ? String(event.id) : `event-${index + 1}`,
  type: "other",
  year: integerOrNull(event.year),
  yearEnd: null,
  dateText: eventDateText(event),
  place: event.location || "",
  title: event.text || "",
  description: event.text || "",
  sourceExcerpt: event.text || "",
  confidence: event.confidence || "medium",
  verified: event.confidence === "high",
  sortOrder: index,
  profileUid,
  sourceType: "wikidata-catalog",
});

const normalizeLegacyEvent = (event, index) => ({
  id: event.id ? String(event.id) : `event-${index + 1}`,
  type: "other",
  year: integerOrNull(event.year),
  yearEnd: null,
  dateText: event.year ? String(event.year) : "",
  place: event.location || "",
  title: event.text || "",
  description: event.text || "",
  sourceExcerpt: event.text || "",
  confidence: "medium",
  verified: false,
  sortOrder: index,
  profileUid,
  sourceType: "legacy-musicians-migration",
});

let catalogFound = catalog.length;
let transferred = 0;
let existing = 0;
let failed = 0;
let legacyFound = legacySnapshot.size;
let legacyTransferred = 0;
let eventCount = 0;

const createComposerAndEvents = async (slug, documentData, events) => {
  const composerReference = collection.doc(slug);
  try {
    if ((await composerReference.get()).exists) {
      existing += 1;
      return false;
    }
    await composerReference.create(documentData);
    transferred += 1;

    for (const [index, event] of events.entries()) {
      const eventId = event.id || `event-${index + 1}`;
      try {
        await composerReference.collection("events").doc(eventId).create(event);
        eventCount += 1;
      } catch (error) {
        failed += 1;
      }
    }
    return true;
  } catch (error) {
    if (error.code === 6 || error.code === "already-exists") {
      existing += 1;
      return false;
    }
    failed += 1;
    console.error(`Failed to migrate ${slug}:`, error.message);
    return false;
  }
};

for (const composer of catalog) {
  const slug = String(composer.id || slugify(composer.name));
  const events = Array.isArray(composer.events)
    ? composer.events.map(normalizeCatalogEvent)
    : [];
  await createComposerAndEvents(
    slug,
    {
      id: slug,
      slug,
      name: composer.name,
      birth: composer.birth || null,
      death: composer.death || null,
      birthYear: integerOrNull(composer.birth),
      deathYear: integerOrNull(composer.death),
      img: composer.img || "",
      imageUrl: composer.img || "",
      birthPlace: composer.birthPlace || "",
      deathPlace: composer.deathPlace || "",
      birthCountry: composer.birthCountry || "",
      deathCountry: composer.deathCountry || "",
      nationality: composer.birthCountry || "",
      gender: composer.gender || "",
      alternativeNames: composer.alternativeNames || [],
      wikidataQid: composer.wikidataQid || "",
      rismId: composer.rismId || "",
      viafId: composer.viafId || "",
      sources: composer.sources || [],
      dataQuality: composer.dataQuality || {},
      biography: "",
      sourceText: "",
      sourceUrl: composer.sources?.find((source) => source.url)?.url || "",
      status: "complete",
      eventCount: events.length,
      profileUid,
      userId: profileUid,
      ownerId: profileUid,
      createdBy: profileUid,
      sourceType: "wikidata-catalog",
      migratedAt: new Date().toISOString(),
    },
    events,
    "wikidata-catalog",
  );
}

for (const composer of catalog) {
  const slug = String(composer.id || slugify(composer.name));
  const composerReference = collection.doc(slug);
  const document = await composerReference.get();
  if (document.exists && !document.data().sourceType) {
    await composerReference.set({ sourceType: "wikidata-catalog" }, { merge: true });
  }
}

for (const legacyDocument of legacySnapshot.docs) {
  const legacy = legacyDocument.data();
  const slug = legacy.id || legacyDocument.id || slugify(legacy.name);
  const events = Array.isArray(legacy.events)
    ? legacy.events.map(normalizeLegacyEvent)
    : [];
  const created = await createComposerAndEvents(
    String(slug),
    {
      id: String(slug),
      slug: String(slug),
      name: legacy.name || slug,
      birth: legacy.birth || null,
      death: legacy.death || null,
      birthYear: integerOrNull(legacy.birth),
      deathYear: integerOrNull(legacy.death),
      img: legacy.img || "",
      imageUrl: legacy.img || "",
      birthPlace: "",
      deathPlace: "",
      alternativeNames: [],
      sources: [],
      dataQuality: {},
      biography: "",
      sourceText: "",
      sourceUrl: "",
      status: "complete",
      eventCount: events.length,
      profileUid,
      userId: profileUid,
      ownerId: profileUid,
      createdBy: legacy.vnesUID || profileUid,
      legacyCreatedBy: legacy.vnesUID || null,
      legacyOwnerFields: {
        vnesUID: legacy.vnesUID || null,
        vnesIme: legacy.vnesIme || null,
        vnesPriimek: legacy.vnesPriimek || null,
      },
      sourceType: "legacy-musicians-migration",
      migratedAt: new Date().toISOString(),
    },
    events,
    "legacy-musicians-migration",
  );
  if (created) legacyTransferred += 1;
}

const afterSnapshot = await collection.get();
const missingOwnership = afterSnapshot.docs.filter((document) => {
  const data = document.data();
  return data.profileUid !== profileUid &&
    data.userId !== profileUid &&
    data.ownerId !== profileUid &&
    data.createdBy !== profileUid;
});

console.log(JSON.stringify({
  catalogFound,
  legacyFound,
  alreadyExistingBefore: existingBefore.size,
  existingSkipped: existing,
  transferred,
  legacyTransferred,
  eventsTransferred: eventCount,
  failed,
  totalNow: afterSnapshot.size,
  missingOwnership: missingOwnership.length,
  profileUid,
}, null, 2));
