import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { initializeFirebase, getFirestore, profileUid } from "./firebase.mjs";

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDirectory = join(process.cwd(), ".backups", "composer-migration", timestamp);
await mkdir(backupDirectory, { recursive: true });

await initializeFirebase();
const firestore = await getFirestore();
const personalCollection = firestore.collection("profiles").doc(profileUid).collection("composers");
const sharedCollection = firestore.collection("musicians");

const snapshotToJson = async (collection, label) => {
  const snapshot = await collection.get();
  const records = [];
  for (const document of snapshot.docs) {
    const record = { id: document.id, data: document.data(), subcollections: {} };
    for (const subcollectionName of ["events"]) {
      const subcollection = await document.ref.collection(subcollectionName).get();
      record.subcollections[subcollectionName] = subcollection.docs.map((item) => ({
        id: item.id,
        data: item.data(),
      }));
    }
    records.push(record);
  }
  await writeFile(join(backupDirectory, `${label}.json`), JSON.stringify(records, null, 2));
  return records;
};

const personalBackup = await snapshotToJson(personalCollection, "personal-composers");
const sharedBackup = await snapshotToJson(sharedCollection, "musicians-before");

let transferred = 0;
let existingIdsMerged = 0;
let eventsMerged = 0;
let failed = 0;
const failures = [];

for (const personal of personalBackup) {
  const sharedReference = sharedCollection.doc(personal.id);
  const sharedDocument = await sharedReference.get();
  const personalEvents = Array.isArray(personal.data.events)
    ? personal.data.events
    : personal.subcollections.events.map((event) => event.data);
  try {
    if (!sharedDocument.exists) {
      await sharedReference.create({
        ...personal.data,
        id: personal.id,
        slug: personal.id,
        events: personalEvents,
        eventCount: personalEvents.length,
        profileUid,
        userId: personal.data.userId || personal.data.profileUid || profileUid,
        ownerId: personal.data.ownerId || personal.data.profileUid || profileUid,
        createdBy: personal.data.createdBy || personal.data.profileUid || profileUid,
        migratedFromPersonalCollection: true,
        migratedAt: new Date().toISOString(),
      });
      transferred += 1;
    } else {
      const sharedData = sharedDocument.data();
      const missingFields = {};
      for (const [key, value] of Object.entries(personal.data)) {
        if (
          sharedData[key] === undefined ||
          sharedData[key] === null ||
          sharedData[key] === "" ||
          (Array.isArray(sharedData[key]) && sharedData[key].length === 0)
        ) {
          missingFields[key] = value;
        }
      }
      if (!Array.isArray(sharedData.events) || sharedData.events.length === 0) {
        missingFields.events = personalEvents;
        missingFields.eventCount = personalEvents.length;
        eventsMerged += 1;
      }
      missingFields.migratedFromPersonalCollection = true;
      missingFields.migratedAt = sharedData.migratedAt || new Date().toISOString();
      if (Object.keys(missingFields).length > 1) {
        await sharedReference.set(missingFields, { merge: true });
        existingIdsMerged += 1;
      }
    }

    if (personal.subcollections.events.length > 0) {
      const sharedEventCollection = sharedReference.collection("events");
      for (const event of personal.subcollections.events) {
        await sharedEventCollection.doc(String(event.id)).set(
          { ...event.data, profileUid, migratedFromPersonalCollection: true },
          { merge: true },
        );
      }
    }
  } catch (error) {
    failed += 1;
    failures.push({ id: personal.id, error: error.message });
  }
}

const sharedAfter = await sharedCollection.get();
let eventCount = 0;
let subeventCount = 0;
const missingUid = [];
for (const document of sharedAfter.docs) {
  const data = document.data();
  if (Array.isArray(data.events)) eventCount += data.events.length;
  const subevents = await document.ref.collection("events").get();
  subeventCount += subevents.size;
  if (!data.profileUid && !data.userId && !data.ownerId && !data.createdBy && !data.vnesUID) {
    missingUid.push(document.id);
  }
}

await writeFile(
  join(backupDirectory, "migration-report.json"),
  JSON.stringify({
    timestamp,
    sourceProfileUid: profileUid,
    personalBefore: personalBackup.length,
    sharedBefore: sharedBackup.length,
    transferred,
    existingIdsMerged,
    eventsMerged,
    failed,
    failures,
    sharedAfter: sharedAfter.size,
    eventsInArrays: eventCount,
    eventsInSubcollections: subeventCount,
    missingUid,
    backupDirectory,
  }, null, 2),
);

console.log(JSON.stringify({
  backupDirectory,
  personalBefore: personalBackup.length,
  sharedBefore: sharedBackup.length,
  transferred,
  existingIdsMerged,
  eventsMerged,
  failed,
  sharedAfter: sharedAfter.size,
  eventsInArrays: eventCount,
  eventsInSubcollections: subeventCount,
}, null, 2));
