import { readFile } from "node:fs/promises";
import * as admin from "firebase-admin";

const profileUid = process.env.FIREBASE_PROFILE_UID || "1n5oETZv4lbPiM0kSISI3bmBMa43";
const projectId = process.env.FIREBASE_PROJECT_ID || "skladatelji";
let app;
let firestore;

const initializeFirebase = async () => {
  if (firestore) return firestore;

  let credential;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    credential = admin.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
  } else {
    const credentialPath =
      process.env.FIREBASE_CREDENTIALS_PATH ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      "/run/secrets/firebase-service-account.json";
    if (credentialPath) {
      try {
        const source = await readFile(credentialPath, "utf8");
        credential = admin.cert(JSON.parse(source));
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
  }

  app = admin.getApps().length
    ? admin.getApp()
    : admin.initializeApp({
        credential: credential || admin.applicationDefault(),
        projectId,
      });
  const { getFirestore } = await import("firebase-admin/firestore");
  firestore = getFirestore(app);
  firestore.settings({ ignoreUndefinedProperties: true });
  return firestore;
};

const getFirestore = async () => {
  await initializeFirebase();
  return firestore;
};

const composersCollection = async () => {
  await initializeFirebase();
  return firestore.collection("profiles").doc(profileUid).collection("composers");
};

export { initializeFirebase, getFirestore, firestore, composersCollection, profileUid };
