/* ==========================================================================
   FIREBASE NASTAVITVE — potrebne samo za igro za dva (večigralski način).
   Samostojna igra deluje tudi brez teh nastavitev.

   Konfiguracija projekta iz Firebase konzole:
   Project settings → Your apps → </> (Web app) → SDK setup → Config
   ========================================================================== */

window.FIREBASE_CONFIG = {
    apiKey: "AIzaSyBDcXTmo9SbuVDjfjhMSSh78clEfOkCW48",
    authDomain: "memory-a098d.firebaseapp.com",
    databaseURL: "https://memory-a098d-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "memory-a098d",
    storageBucket: "memory-a098d.firebasestorage.app",
    messagingSenderId: "485243475958",
    appId: "1:485243475958:web:e2fdd72be1eab4471499d7",
    measurementId: "G-E6MEM28SQN"
};

/* ID Firestore baze ("(default)" = privzeta baza projekta). */
window.FIRESTORE_DB_ID = "(default)";
