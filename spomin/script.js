"use strict";

/* ==========================================================================
   GLASBENI SPOMIN — Nova akademija
   Samostojna igra teče povsem lokalno (tudi brez povezave), igra za dva se
   sinhronizira prek Firebase Firestore (nastavitve v firebase-config.js).
   Firebase se naloži šele ob prvem vstopu v večigralski način, da samostojna
   igra deluje tudi offline.
   ========================================================================== */

/* ==================== Nabor kartic ==================== */

const POOL = [
    // Skladatelji
    { t: "J. S. Bach", c: "skladatelj" },
    { t: "G. F. Händel", c: "skladatelj" },
    { t: "A. Vivaldi", c: "skladatelj" },
    { t: "C. Monteverdi", c: "skladatelj" },
    { t: "H. Purcell", c: "skladatelj" },
    { t: "G. Ph. Telemann", c: "skladatelj" },
    { t: "J.-Ph. Rameau", c: "skladatelj" },
    { t: "F. Couperin", c: "skladatelj" },
    { t: "A. Corelli", c: "skladatelj" },
    { t: "J. Dowland", c: "skladatelj" },
    { t: "Palestrina", c: "skladatelj" },
    { t: "Josquin des Prez", c: "skladatelj" },
    { t: "D. Buxtehude", c: "skladatelj" },
    { t: "J.-B. Lully", c: "skladatelj" },
    { t: "D. Scarlatti", c: "skladatelj" },
    { t: "G. Frescobaldi", c: "skladatelj" },
    // Inštrumenti
    { t: "čembalo", c: "inštrument" },
    { t: "klavikord", c: "inštrument" },
    { t: "orgle", c: "inštrument" },
    { t: "traverso", c: "inštrument" },
    { t: "kljunasta flavta", c: "inštrument" },
    { t: "baročna oboa", c: "inštrument" },
    { t: "baročni fagot", c: "inštrument" },
    { t: "cink", c: "inštrument" },
    { t: "naravna trobenta", c: "inštrument" },
    { t: "sakbut", c: "inštrument" },
    { t: "baročna violina", c: "inštrument" },
    { t: "viola da gamba", c: "inštrument" },
    { t: "baročno violončelo", c: "inštrument" },
    { t: "violone", c: "inštrument" },
    { t: "lutnja", c: "inštrument" },
    { t: "teorba", c: "inštrument" },
    // Pojmi
    { t: "basso continuo", c: "pojem" },
    { t: "kontrapunkt", c: "pojem" },
    { t: "ornamentika", c: "pojem" },
    { t: "madrigal", c: "pojem" },
    { t: "motet", c: "pojem" },
    { t: "toccata", c: "pojem" },
    { t: "preludij", c: "pojem" },
    { t: "fuga", c: "pojem" },
    { t: "suita", c: "pojem" },
    { t: "sonata", c: "pojem" },
    { t: "concerto grosso", c: "pojem" },
    { t: "čakona", c: "pojem" },
    { t: "kanon", c: "pojem" },
    { t: "kantata", c: "pojem" },
    { t: "opera", c: "pojem" },
    { t: "fantazija", c: "pojem" }
];

/* Koliko časa ostaneta neujemajoči kartici odprti (ms). */
const RESOLVE_MS = 1300;
/* Rezervni čas, po katerem potezo razreši tudi nasprotnikov odjemalec,
   če je igralec na potezi izgubil povezavo. */
const WATCHDOG_MS = 4500;

const CODE_CHARS = "ABCDEFGHJKLMNPRSTUVZ23456789";
const CODE_LEN = 4;

/* ==================== Pomožne funkcije ==================== */

const $ = (id) => document.getElementById(id);

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function buildDeck(nPairs) {
    const chosen = shuffle([...POOL]).slice(0, nPairs);
    const deck = [];
    chosen.forEach((item, i) => {
        deck.push({ p: i, t: item.t, c: item.c });
        deck.push({ p: i, t: item.t, c: item.c });
    });
    return shuffle(deck);
}

function colsFor(cardCount) {
    if (cardCount >= 32) return 8;
    if (cardCount >= 24) return 6;
    return 4;
}

function randomCode() {
    let code = "";
    for (let i = 0; i < CODE_LEN; i++) {
        code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
    return code;
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (ch) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[ch]));
}

function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m + ":" + String(s).padStart(2, "0");
}

/* ==================== Zasloni ==================== */

const SCREENS = ["menuScreen", "joinScreen", "lobbyScreen", "gameScreen"];

function showScreen(id) {
    SCREENS.forEach((s) => $(s).classList.toggle("hidden", s !== id));
    hideResult();
}

function showResult(title, text, canRematch) {
    $("resultTitle").textContent = title;
    $("resultText").textContent = text;
    $("rematchBtn").classList.toggle("hidden", !canRematch);
    $("resultModal").classList.remove("hidden");
}

function hideResult() {
    $("resultModal").classList.add("hidden");
}

function setStatus(id, msg, isInfo) {
    const el = $(id);
    el.textContent = msg || "";
    el.classList.toggle("hidden", !msg);
    el.classList.toggle("info", !!isInfo);
}

function playerName() {
    const name = $("nameInput").value.trim();
    if (!name) {
        setStatus("menuStatus", "Najprej vpiši svoje ime.");
        $("nameInput").focus();
        return null;
    }
    localStorage.setItem("spomin-ime", name);
    return name;
}

/* ==================== Igralna plošča ==================== */

let mode = null; // "solo" | "online"
let cardEls = [];

function renderBoard(deck) {
    const board = $("board");
    board.innerHTML = "";
    board.dataset.cols = colsFor(deck.length);
    cardEls = deck.map((card, i) => {
        const btn = document.createElement("button");
        btn.className = "card";
        btn.type = "button";
        btn.innerHTML =
            '<div class="card-inner">' +
                '<div class="card-face card-back">♪</div>' +
                '<div class="card-face card-front">' +
                    '<span class="card-cat">' + escapeHtml(card.c) + "</span>" +
                    '<span class="card-term">' + escapeHtml(card.t) + "</span>" +
                "</div>" +
            "</div>";
        btn.addEventListener("click", () => onCardClick(i));
        board.appendChild(btn);
        return btn;
    });
}

function paintBoard(flips, matched) {
    cardEls.forEach((el, i) => {
        const up = flips.includes(i) || matched.includes(i);
        el.classList.toggle("flipped", up);
        el.classList.toggle("matched", matched.includes(i));
    });
}

function onCardClick(i) {
    if (mode === "solo") soloClick(i);
    else if (mode === "online") onlineClick(i);
}

/* ==================== Samostojna igra ==================== */

const solo = { deck: [], flips: [], matched: [], moves: 0, lock: false, seconds: 0, timerId: null };

function startSolo() {
    if (!playerName()) return;
    mode = "solo";
    solo.deck = buildDeck(selectedPairs());
    solo.flips = [];
    solo.matched = [];
    solo.moves = 0;
    solo.lock = false;
    solo.seconds = 0;
    clearInterval(solo.timerId);
    solo.timerId = setInterval(() => { solo.seconds++; renderSoloStats(); }, 1000);

    renderBoard(solo.deck);
    paintBoard([], []);
    renderSoloStats();
    $("turnHint").textContent = "Poišči vse pare!";
    $("turnHint").classList.remove("mine");
    showScreen("gameScreen");
}

function renderSoloStats() {
    $("statusBar").innerHTML =
        '<div class="solo-stats">poteze: <b>' + solo.moves + "</b>" +
        " &nbsp;·&nbsp; pari: <b>" + solo.matched.length / 2 + "/" + solo.deck.length / 2 + "</b>" +
        " &nbsp;·&nbsp; čas: <b>" + formatTime(solo.seconds) + "</b></div>";
}

function soloClick(i) {
    if (solo.lock || solo.flips.includes(i) || solo.matched.includes(i)) return;
    if (solo.flips.length >= 2) return;
    solo.flips.push(i);
    paintBoard(solo.flips, solo.matched);
    if (solo.flips.length < 2) return;

    solo.moves++;
    const [a, b] = solo.flips;
    if (solo.deck[a].p === solo.deck[b].p) {
        solo.matched.push(a, b);
        solo.flips = [];
        paintBoard([], solo.matched);
        renderSoloStats();
        if (solo.matched.length === solo.deck.length) endSolo();
    } else {
        solo.lock = true;
        renderSoloStats();
        setTimeout(() => {
            solo.flips = [];
            solo.lock = false;
            paintBoard([], solo.matched);
        }, RESOLVE_MS);
    }
}

function endSolo() {
    clearInterval(solo.timerId);
    showResult(
        "Bravo!",
        "Vse pare si našel v " + solo.moves + " potezah\nin času " + formatTime(solo.seconds) + ".",
        true
    );
}

/* ==================== Igra za dva (Firestore) ==================== */

let fbRef = null;

async function initFirebase() {
    if (fbRef) return fbRef;
    const cfg = window.FIREBASE_CONFIG;
    if (!cfg || !cfg.apiKey || /PRILEPI/.test(cfg.apiKey)) {
        throw new Error("Večigralski način še ni nastavljen — v datoteko firebase-config.js je treba prilepiti Firebase konfiguracijo.");
    }
    const [appMod, fs] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js")
    ]);
    const app = appMod.initializeApp(cfg);
    const db = fs.getFirestore(app, window.FIRESTORE_DB_ID || "(default)");
    fbRef = { db, fs };
    return fbRef;
}

function explainError(e) {
    const msg = (e && e.message) || "";
    if (/firebase-config|kodo|ne obstaja|polna/.test(msg)) return msg;
    if (e && e.code === "permission-denied") return "Dostop do baze je zavrnjen — preverite Firestore pravila.";
    if (e && (e.code === "unavailable" || /network|fetch/i.test(msg))) return "Ni povezave s strežnikom. Preverite internetno povezavo.";
    return "Prišlo je do napake: " + msg;
}

const online = {
    code: null,
    myIdx: null,
    state: null,
    unsub: null,
    round: null,
    resolveTimer: null,
    resultShown: false
};

function gameRef() {
    return fbRef.fs.doc(fbRef.db, "games", online.code);
}

function clearOnlineTimers() {
    clearTimeout(online.resolveTimer);
    online.resolveTimer = null;
}

async function createGame() {
    const name = playerName();
    if (!name) return;
    setStatus("menuStatus", "Ustvarjam igro ...", true);
    try {
        const { db, fs } = await initFirebase();
        let code = null;
        for (let tries = 0; tries < 5 && !code; tries++) {
            const candidate = randomCode();
            const snap = await fs.getDoc(fs.doc(db, "games", candidate));
            if (!snap.exists()) code = candidate;
        }
        if (!code) throw new Error("Ne najdem proste kode — poskusite znova.");

        await fs.setDoc(fs.doc(db, "games", code), {
            createdAt: fs.serverTimestamp(),
            status: "waiting",
            players: [{ name, score: 0 }],
            deck: buildDeck(selectedPairs()),
            turn: 0,
            starter: 0,
            flips: [],
            matched: [],
            round: 1,
            abandoned: false
        });

        online.code = code;
        online.myIdx = 0;
        online.round = null;
        online.resultShown = false;
        setStatus("menuStatus", "");
        $("lobbyCode").textContent = code;
        setStatus("lobbyStatus", "");
        showScreen("lobbyScreen");
        subscribe();
    } catch (e) {
        setStatus("menuStatus", explainError(e));
    }
}

async function joinGame() {
    const name = playerName();
    if (!name) { showScreen("menuScreen"); return; }
    const code = $("codeInput").value.trim().toUpperCase();
    if (code.length !== CODE_LEN) {
        setStatus("joinStatus", "Vpiši " + CODE_LEN + "-mestno kodo igre.");
        return;
    }
    setStatus("joinStatus", "Pridružujem se ...", true);
    try {
        const { db, fs } = await initFirebase();
        const ref = fs.doc(db, "games", code);
        await fs.runTransaction(db, async (tx) => {
            const snap = await tx.get(ref);
            if (!snap.exists()) throw new Error("Igra s to kodo ne obstaja.");
            const g = snap.data();
            if (g.status !== "waiting" || g.players.length >= 2) {
                throw new Error("Igra je že polna ali se je že začela.");
            }
            tx.update(ref, {
                players: [...g.players, { name, score: 0 }],
                status: "playing"
            });
        });
        online.code = code;
        online.myIdx = 1;
        online.round = null;
        online.resultShown = false;
        setStatus("joinStatus", "");
        subscribe();
    } catch (e) {
        setStatus("joinStatus", explainError(e));
    }
}

function subscribe() {
    mode = "online";
    if (online.unsub) online.unsub();
    online.unsub = fbRef.fs.onSnapshot(gameRef(), (snap) => {
        if (!snap.exists()) { handleGameGone(); return; }
        applyState(snap.data());
    }, (e) => {
        setStatus("lobbyStatus", explainError(e));
    });
}

function handleGameGone() {
    // Nasprotnik je pospravil končano igro — rezultat naj ostane viden.
    if (online.state && online.state.status === "finished") {
        $("rematchBtn").classList.add("hidden");
        return;
    }
    leaveOnline(false);
    showScreen("menuScreen");
    setStatus("menuStatus", "Igra je bila prekinjena.");
}

function applyState(g) {
    online.state = g;

    if (g.status === "waiting") return; // čakalnica je že prikazana

    // Nova plošča (prva runda ali revanša)
    if (online.round !== g.round) {
        online.round = g.round;
        online.resultShown = false;
        hideResult();
        renderBoard(g.deck);
        showScreen("gameScreen");
    }

    paintBoard(g.flips, g.matched);
    renderOnlineStatus(g);

    clearOnlineTimers();
    if (g.status === "playing" && !g.abandoned && g.flips.length === 2) {
        // Potezo razreši igralec na potezi; nasprotnik je rezerva ob izpadu.
        const delay = g.turn === online.myIdx ? RESOLVE_MS : WATCHDOG_MS;
        online.resolveTimer = setTimeout(resolveFlips, delay);
    }

    if (g.abandoned && !online.resultShown) {
        online.resultShown = true;
        showResult("Igra je prekinjena", "Nasprotnik je zapustil igro.", false);
    } else if (g.status === "finished" && !online.resultShown) {
        online.resultShown = true;
        setTimeout(() => showFinished(g), 700);
    }
}

function renderOnlineStatus(g) {
    $("statusBar").innerHTML = g.players.map((p, i) =>
        '<div class="player-chip' +
            (i === g.turn && g.status === "playing" ? " active" : "") +
            (i === online.myIdx ? " me" : "") + '">' +
            '<span class="name">' + escapeHtml(p.name) + "</span>" +
            '<span class="score">' + p.score + "</span>" +
        "</div>"
    ).join("");

    const hint = $("turnHint");
    if (g.status !== "playing") {
        hint.textContent = "";
    } else if (g.turn === online.myIdx) {
        hint.textContent = "Ti si na potezi!";
        hint.classList.add("mine");
    } else {
        hint.textContent = "Na potezi je " + g.players[g.turn].name + " ...";
        hint.classList.remove("mine");
    }
}

function onlineClick(i) {
    const g = online.state;
    if (!g || g.status !== "playing" || g.abandoned) return;
    if (g.turn !== online.myIdx) return;
    if (g.flips.length >= 2) return;
    if (g.flips.includes(i) || g.matched.includes(i)) return;

    const flips = [...g.flips, i];
    online.state = { ...g, flips };
    paintBoard(flips, g.matched); // takojšen odziv, Firestore potrdi za tem
    fbRef.fs.updateDoc(gameRef(), { flips }).catch(() => {});

    if (flips.length === 2) {
        clearOnlineTimers();
        online.resolveTimer = setTimeout(resolveFlips, RESOLVE_MS);
    }
}

async function resolveFlips() {
    try {
        const { db, fs } = await initFirebase();
        await fs.runTransaction(db, async (tx) => {
            const snap = await tx.get(gameRef());
            if (!snap.exists()) return;
            const g = snap.data();
            if (g.status !== "playing" || g.flips.length !== 2) return;
            const [a, b] = g.flips;
            if (g.deck[a].p === g.deck[b].p) {
                const players = g.players.map((p, i) =>
                    i === g.turn ? { name: p.name, score: p.score + 1 } : p
                );
                const matched = [...g.matched, a, b];
                tx.update(gameRef(), {
                    matched,
                    players,
                    flips: [],
                    status: matched.length === g.deck.length ? "finished" : "playing"
                });
            } else {
                tx.update(gameRef(), { flips: [], turn: 1 - g.turn });
            }
        });
    } catch (e) {
        // Prehodna napaka — razrešitev bo ob naslednjem posnetku poskusil
        // tudi nasprotnikov odjemalec.
    }
}

function showFinished(g) {
    const [p0, p1] = g.players;
    const score = p0.name + " " + p0.score + " : " + p1.score + " " + p1.name;
    let title;
    if (p0.score === p1.score) title = "Neodločeno!";
    else {
        const winner = p0.score > p1.score ? 0 : 1;
        title = winner === online.myIdx ? "Zmagal si!" : "Zmagal je " + g.players[winner].name + "!";
    }
    showResult(title, score, true);
}

async function rematch() {
    if (mode === "solo") { startSolo(); return; }
    hideResult();
    try {
        const { db, fs } = await initFirebase();
        await fs.runTransaction(db, async (tx) => {
            const snap = await tx.get(gameRef());
            if (!snap.exists()) throw new Error("Igra ne obstaja več.");
            const g = snap.data();
            if (g.status !== "finished" || g.abandoned) return;
            const starter = 1 - g.starter;
            tx.update(gameRef(), {
                deck: buildDeck(g.deck.length / 2),
                matched: [],
                flips: [],
                players: g.players.map((p) => ({ name: p.name, score: 0 })),
                turn: starter,
                starter,
                status: "playing",
                round: g.round + 1
            });
        });
    } catch (e) {
        setStatus("menuStatus", explainError(e));
        showScreen("menuScreen");
    }
}

function leaveOnline(notifyOpponent) {
    clearOnlineTimers();
    if (online.unsub) { online.unsub(); online.unsub = null; }

    const g = online.state;
    if (fbRef && online.code && g && notifyOpponent) {
        const ref = gameRef();
        if (g.status === "waiting" || g.status === "finished" || g.abandoned) {
            fbRef.fs.deleteDoc(ref).catch(() => {}); // pospravi končano igro
        } else {
            fbRef.fs.updateDoc(ref, { abandoned: true }).catch(() => {});
        }
    }
    online.code = null;
    online.myIdx = null;
    online.state = null;
    online.round = null;
    mode = null;
}

/* ==================== Zapuščanje / navigacija ==================== */

function leaveGame() {
    clearInterval(solo.timerId);
    if (mode === "online") leaveOnline(true);
    mode = null;
    setStatus("menuStatus", "");
    showScreen("menuScreen");
}

/* ==================== Nastavitve v meniju ==================== */

function selectedPairs() {
    const active = document.querySelector(".size-btn.active");
    return active ? parseInt(active.dataset.pairs, 10) : 12;
}

function initMenu() {
    $("nameInput").value = localStorage.getItem("spomin-ime") || "";

    document.querySelectorAll(".size-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".size-btn").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });

    $("soloBtn").addEventListener("click", startSolo);
    $("createBtn").addEventListener("click", createGame);
    $("openJoinBtn").addEventListener("click", () => {
        if (!playerName()) return;
        setStatus("joinStatus", "");
        showScreen("joinScreen");
        $("codeInput").focus();
    });
    $("joinBackBtn").addEventListener("click", () => showScreen("menuScreen"));
    $("joinBtn").addEventListener("click", joinGame);
    $("codeInput").addEventListener("keydown", (e) => { if (e.key === "Enter") joinGame(); });

    $("lobbyCode").addEventListener("click", () => {
        navigator.clipboard && navigator.clipboard.writeText(online.code || "");
        setStatus("lobbyStatus", "Koda je kopirana.", true);
    });
    $("shareBtn").addEventListener("click", () => {
        const url = location.origin + location.pathname + "?igra=" + (online.code || "");
        if (navigator.share) {
            navigator.share({ title: "Glasbeni spomin", text: "Pridruži se mi v igri spomin!", url }).catch(() => {});
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(url);
            setStatus("lobbyStatus", "Povezava je kopirana.", true);
        }
    });
    $("cancelLobbyBtn").addEventListener("click", leaveGame);

    $("leaveBtn").addEventListener("click", leaveGame);
    $("resultLeaveBtn").addEventListener("click", leaveGame);
    $("rematchBtn").addEventListener("click", rematch);

    // Povezava s kodo (?igra=XXXX) odpre zaslon za pridružitev.
    const codeFromUrl = new URLSearchParams(location.search).get("igra");
    if (codeFromUrl) {
        $("codeInput").value = codeFromUrl.toUpperCase().slice(0, CODE_LEN);
        showScreen("joinScreen");
    }
}

initMenu();
