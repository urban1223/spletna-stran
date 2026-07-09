/* ==========================================================================
   FIREBASE NASTAVITVE — potrebne samo za igro za dva (večigralski način).
   Samostojna igra deluje tudi brez teh nastavitev.

   Konfiguracijo najdete v Firebase konzoli:
   Project settings → Your apps → </> (Web app) → SDK setup → Config
   ========================================================================== */

window.FIREBASE_CONFIG = {
    apiKey: "PRILEPI-SVOJ-API-KEY",
    authDomain: "PROJEKT.firebaseapp.com",
    projectId: "PROJEKT",
    storageBucket: "PROJEKT.appspot.com",
    messagingSenderId: "0",
    appId: "PRILEPI-SVOJ-APP-ID"
};

/* ID Firestore baze. Če ste v konzoli ustvarili bazo z imenom "memory",
   pustite kot je; če uporabljate privzeto bazo, spremenite v "(default)". */
window.FIRESTORE_DB_ID = "memory";
