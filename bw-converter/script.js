pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

const WORKING_DPI = 300;  // polna delovna/izvozna ločljivost
const PREVIEW_DPI = 120;   // hitra začetna ločljivost ob uvozu (nadgradi se v ozadju do WORKING_DPI)
const PRESETS_KEY = 'cbPretvornikPresets_v1';

// ── Stanje ──────────────────────────────────────────────────────────────
let pagesData = [], activePageIndex = null, draggedIndex = null;
let zoneDrawMode = false, isDrawing = false, zoneStart = null, savedImageData = null;
let activeZoneIndex = null; // katera cona trenutne strani je izbrana za urejanje praga
let baseName = '';
let documentNativeDPI = null; // najnižja zaznana izvorna ločljivost med naloženimi stranmi (če je nižja od ~250 DPI)

// ── DOM refs ─────────────────────────────────────────────────────────────
const mainContent        = document.querySelector('.main-content');
const controlsPanelEl    = document.querySelector('.controls-panel');
const panelResizer       = document.getElementById('panelResizer');
const uploadSection      = document.getElementById('uploadSection');
const fileInput          = document.getElementById('fileInput');
const thumbContainer     = document.getElementById('thumbContainer');
const cropperViewport    = document.querySelector('.cropper-viewport');
const cropperBox         = document.querySelector('.cropper-box');
const mainCanvas         = document.getElementById('mainCanvas');
const mainCtx            = mainCanvas.getContext('2d', { willReadFrequently: true });
const statusDisplay      = document.getElementById('statusDisplay');
const thresholdCtrl      = document.getElementById('thresholdCtrl');
const thresholdNumInput  = document.getElementById('thresholdNumInput');
const zoneThresholdCtrl    = document.getElementById('zoneThresholdCtrl');
const zoneThresholdNum     = document.getElementById('zoneThresholdNum');
const zoneBtnEl       = document.getElementById('zoneBtn');
const zoneChipList    = document.getElementById('zoneChipList');
const pageRangeInput  = document.getElementById('pageRange');
const exportBtn       = document.getElementById('exportBtn');
const presetChipList  = document.getElementById('presetChipList');
const presetModalBg   = document.getElementById('presetModalBg');
const presetNameInput = document.getElementById('presetNameInput');
const presetCancelBtn = document.getElementById('presetCancelBtn');
const presetSaveBtn   = document.getElementById('presetSaveBtn');
const exportModalBg   = document.getElementById('exportModalBg');
const dpiOptionList   = document.getElementById('dpiOptionList');
const exportCancelBtn  = document.getElementById('exportCancelBtn');
const exportConfirmBtn = document.getElementById('exportConfirmBtn');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const previewWindow = document.getElementById('previewWindow');
const toggleColorBtn = document.getElementById('toggleColorBtn');
let showOriginalColor = false; // stikalo: prikaži originalno barvno sliko za primerjavo prej/potem

// ── Sync pomočniki ───────────────────────────────────────────────────────

// Odstotek se prikaže samo enkrat, v številčnem vnosu ob drsniku (ni podvojen v naslovu) —
// tako ostane tudi urejljiv (vpišeš natančno vrednost), ne le za branje.
function syncThresholdUI(val255) {
    thresholdNumInput.value = Math.round((val255 / 255) * 100);
}

function syncZoneUI(val255) {
    zoneThresholdNum.value = Math.round((val255 / 255) * 100);
}

// ── Dogodki kontrolnikov ─────────────────────────────────────────────────

thresholdCtrl.addEventListener('input', () => {
    const v = parseInt(thresholdCtrl.value);
    syncThresholdUI(v);
    if (activePageIndex !== null) {
        pagesData[activePageIndex].threshold = v;
        processPage(activePageIndex); updateThumbPreview(activePageIndex);
    }
});

thresholdNumInput.addEventListener('input', () => {
    const pct = Math.max(0, Math.min(100, parseInt(thresholdNumInput.value) || 0));
    const v = Math.round(pct / 100 * 255);
    thresholdCtrl.value = v;
    if (activePageIndex !== null) {
        pagesData[activePageIndex].threshold = v;
        processPage(activePageIndex); updateThumbPreview(activePageIndex);
    }
});

zoneThresholdCtrl.addEventListener('input', () => {
    const v = parseInt(zoneThresholdCtrl.value);
    syncZoneUI(v);
    const z = activeZone();
    if (z) { z.threshold = v; processPage(activePageIndex); }
});

zoneThresholdNum.addEventListener('input', () => {
    const pct = Math.max(0, Math.min(100, parseInt(zoneThresholdNum.value) || 0));
    const v = Math.round(pct / 100 * 255);
    zoneThresholdCtrl.value = v;
    const z = activeZone();
    if (z) { z.threshold = v; processPage(activePageIndex); }
});

// ── Samodejni prag (Otsu) ────────────────────────────────────────────────

function computeOtsuThreshold(canvas, rect) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const x = rect ? rect.x : 0, y = rect ? rect.y : 0;
    const w = rect ? rect.w : canvas.width, h = rect ? rect.h : canvas.height;
    const d = ctx.getImageData(x, y, w, h).data;
    const hist = new Array(256).fill(0);
    for (let i = 0; i < d.length; i += 4) {
        hist[Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2])]++;
    }
    const total = w * h;
    let sum = 0;
    for (let t = 0; t < 256; t++) sum += t * hist[t];
    let sumB = 0, wB = 0, maxVar = 0, threshold = 128;
    for (let t = 0; t < 256; t++) {
        wB += hist[t]; if (wB === 0) continue;
        const wF = total - wB; if (wF === 0) break;
        sumB += t * hist[t];
        const mB = sumB / wB, mF = (sum - sumB) / wF;
        const varBetween = wB * wF * (mB - mF) * (mB - mF);
        if (varBetween > maxVar) { maxVar = varBetween; threshold = t; }
    }
    return threshold;
}

// `orig` privzeto pData.originalCanvas (delovna 300 DPI kopija) za predogled/Auto-prag cone.
// Izvoz pa MORA podati svoj (morda drugače-DPI) `orig`, sicer se cone vzorčijo iz napačno
// velikega platna kadar je DPI izvoza različen od delovne ločljivosti (300).
function renderRotatedGrayscale(pData, orig = pData.originalCanvas) {
    const w = pData.rotation % 180 === 0 ? orig.width : orig.height;
    const h = pData.rotation % 180 === 0 ? orig.height : orig.width;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate((pData.rotation * Math.PI) / 180);
    ctx.drawImage(orig, -orig.width / 2, -orig.height / 2);
    ctx.restore();
    return c;
}

// ── Prednastavitve (localStorage) ────────────────────────────────────────

function loadPresets() {
    try { return JSON.parse(localStorage.getItem(PRESETS_KEY)) || {}; } catch { return {}; }
}
function savePresetsToStorage(p) { localStorage.setItem(PRESETS_KEY, JSON.stringify(p)); }

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function applyPreset(name) {
    if (activePageIndex === null) { statusDisplay.innerText = 'Load a PDF and select a page first.'; return; }
    const p = loadPresets()[name]; if (!p) return;
    const pData = pagesData[activePageIndex];
    pData.threshold = p.threshold;
    thresholdCtrl.value = p.threshold; syncThresholdUI(p.threshold);
    processPage(activePageIndex); updateThumbPreview(activePageIndex);
    statusDisplay.innerText = `Preset "${name}" applied.`;
}

// Prednastavitve so prikazane kot klikljivi "chipi" (klik = takoj uporabi na trenutni strani,
// × = izbriši) — isti vzorec kot seznam con, brez ločenih gumbov Uporabi/Shrani/Izbriši.
function renderPresetList() {
    const presets = loadPresets();
    presetChipList.innerHTML = '';
    Object.keys(presets).sort().forEach(name => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'chip';
        chip.title = 'Click to apply to the current page';
        chip.innerHTML = `${escapeHtml(name)} <span class="chip-del">×</span>`;
        chip.querySelector('.chip-del').addEventListener('click', ev => {
            ev.stopPropagation();
            const p = loadPresets(); delete p[name]; savePresetsToStorage(p);
            renderPresetList();
            statusDisplay.innerText = `Preset "${name}" deleted.`;
        });
        chip.addEventListener('click', () => applyPreset(name));
        presetChipList.appendChild(chip);
    });
    const addChip = document.createElement('button');
    addChip.type = 'button';
    addChip.className = 'chip chip-add';
    addChip.textContent = '+ New';
    addChip.title = 'Save the current threshold as a new preset';
    addChip.addEventListener('click', openPresetModal);
    presetChipList.appendChild(addChip);
}

renderPresetList();

// Namenski dialog namesto window.prompt() — prompt() je znotraj vdelanih/iframe
// predogledov pogosto tiho onemogočen (brskalnik ga prezre brez opozorila), poleg
// tega je za javno izdano orodje bolj primeren temiran dialog kot sistemsko pojavno okno.
function openPresetModal() {
    presetNameInput.value = '';
    presetModalBg.classList.remove('hidden');
    presetNameInput.focus();
}
function closePresetModal() { presetModalBg.classList.add('hidden'); }
function savePresetFromModal() {
    const name = presetNameInput.value.trim();
    if (!name) { presetNameInput.focus(); return; }
    const p = loadPresets();
    p[name] = { threshold: parseInt(thresholdCtrl.value) };
    savePresetsToStorage(p);
    renderPresetList();
    statusDisplay.innerText = `Preset "${name}" saved.`;
    closePresetModal();
}
presetCancelBtn.addEventListener('click', closePresetModal);
presetModalBg.addEventListener('click', e => { if (e.target === presetModalBg) closePresetModal(); });
presetSaveBtn.addEventListener('click', savePresetFromModal);
presetNameInput.addEventListener('keydown', e => { if (e.key === 'Enter') savePresetFromModal(); });

// ── Velikost kontrolnega panela (ročka na desnem robu) ───────────────────
// Kontrolniki so vedno ob desnem robu (ne glede na obliko strani), zato ročka
// vedno spreminja ŠIRINO panela.

let controlsWidthPx = 340;

function applyControlsSize() {
    controlsPanelEl.style.width = controlsWidthPx + 'px';
}

panelResizer.addEventListener('mousedown', e => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = controlsPanelEl.getBoundingClientRect().width;
    panelResizer.classList.add('dragging');

    function onMove(ev) {
        controlsWidthPx = Math.max(220, Math.min(window.innerWidth * 0.7, startW + (startX - ev.clientX)));
        controlsPanelEl.style.width = controlsWidthPx + 'px';
        if (activePageIndex !== null) fitPreviewBox();
    }
    function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        panelResizer.classList.remove('dragging');
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
});

applyControlsSize();

// ── Risanje cone ─────────────────────────────────────────────────────────

zoneBtnEl.addEventListener('click', () => {
    zoneDrawMode = !zoneDrawMode;
    if (zoneDrawMode) {
        zoneBtnEl.classList.add('active');
        mainCanvas.style.cursor = 'crosshair';
        statusDisplay.innerText = 'Draw a zone with the mouse on the preview...';
    } else {
        resetZoneBtn();
    }
});

function activeZone() {
    if (activePageIndex === null || activeZoneIndex === null) return null;
    return pagesData[activePageIndex].zones[activeZoneIndex] || null;
}

function syncZoneControlsToActiveZone() {
    const z = activeZone();
    zoneThresholdCtrl.disabled = !z;
    zoneThresholdNum.disabled = !z;
    const t = z ? z.threshold : 191;
    zoneThresholdCtrl.value = t;
    syncZoneUI(t);
}

function renderZoneList() {
    const zones = activePageIndex !== null ? pagesData[activePageIndex].zones : [];
    zoneChipList.innerHTML = '';
    if (!zones || zones.length === 0) {
        zoneChipList.innerHTML = '<span class="chip-hint">No active zones.</span>';
    } else {
        zones.forEach((z, i) => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'chip' + (i === activeZoneIndex ? ' active' : '');
            chip.innerHTML = `Zone ${i + 1} <span class="chip-del">×</span>`;
            chip.querySelector('.chip-del').addEventListener('click', ev => {
                ev.stopPropagation();
                zones.splice(i, 1);
                if (activeZoneIndex === i) activeZoneIndex = null;
                else if (activeZoneIndex !== null && activeZoneIndex > i) activeZoneIndex--;
                renderZoneList();
                processPage(activePageIndex);
            });
            chip.addEventListener('click', () => {
                activeZoneIndex = i;
                renderZoneList();
                processPage(activePageIndex);
            });
            zoneChipList.appendChild(chip);
        });
    }
    syncZoneControlsToActiveZone();
}

function resetZoneBtn() {
    zoneDrawMode = false;
    zoneBtnEl.classList.remove('active');
    mainCanvas.style.cursor = 'default';
}

function getCanvasCoords(e) {
    const r = mainCanvas.getBoundingClientRect();
    // #mainCanvas ima "object-fit: contain" — če razmerje stranic okna predogleda ne
    // ustreza razmerju strani (pogosto pri pokončnih straneh), brskalnik pusti prazen
    // rob (letterbox) ob straneh ali zgoraj/spodaj znotraj r. Brez spodnjega popravka bi
    // klik/vlečenje blizu roba preslikali na napačno mesto na dejanskem platnu.
    const canvasRatio = mainCanvas.width / mainCanvas.height;
    const boxRatio = r.width / r.height;
    let contentW = r.width, contentH = r.height, offsetX = 0, offsetY = 0;
    if (boxRatio > canvasRatio) {
        contentW = r.height * canvasRatio;
        offsetX = (r.width - contentW) / 2;
    } else {
        contentH = r.width / canvasRatio;
        offsetY = (r.height - contentH) / 2;
    }
    const x = (e.clientX - r.left - offsetX) * (mainCanvas.width / contentW);
    const y = (e.clientY - r.top - offsetY) * (mainCanvas.height / contentH);
    return {
        x: Math.max(0, Math.min(mainCanvas.width, x)),
        y: Math.max(0, Math.min(mainCanvas.height, y))
    };
}

// Ročke za spreminjanje velikosti aktivne cone (na sredini vsake od 4 stranic) —
// tako jo lahko po risanju še povečaš/pomanjšaš, ne da bi jo morala znova narisati.
let isResizingZone = false, resizeHandleName = null;

function getZoneHandlePoints(z) {
    const x1 = z.x1 * mainCanvas.width, y1 = z.y1 * mainCanvas.height;
    const x2 = z.x2 * mainCanvas.width, y2 = z.y2 * mainCanvas.height;
    const midX = (x1 + x2) / 2, midY = (y1 + y2) / 2;
    return {
        top: { x: midX, y: y1 }, bottom: { x: midX, y: y2 },
        left: { x: x1, y: midY }, right: { x: x2, y: midY }
    };
}

function hitTestZoneHandle(pos) {
    const z = activeZone();
    if (!z) return null;
    const handles = getZoneHandlePoints(z);
    const r = Math.max(16, mainCanvas.width / 70);
    for (const name in handles) {
        const h = handles[name];
        if (Math.abs(pos.x - h.x) <= r && Math.abs(pos.y - h.y) <= r) return name;
    }
    return null;
}

function drawZoneHandles(z) {
    const handles = getZoneHandlePoints(z);
    const size = Math.max(10, mainCanvas.width / 130);
    mainCtx.save();
    mainCtx.fillStyle = '#f2cc5a';
    mainCtx.strokeStyle = '#000';
    mainCtx.lineWidth = 1;
    Object.values(handles).forEach(h => {
        mainCtx.beginPath();
        mainCtx.rect(h.x - size / 2, h.y - size / 2, size, size);
        mainCtx.fill();
        mainCtx.stroke();
    });
    mainCtx.restore();
}

mainCanvas.addEventListener('mousedown', e => {
    if (activePageIndex === null) return;
    const pos = getCanvasCoords(e);
    if (!zoneDrawMode) {
        const handle = hitTestZoneHandle(pos);
        if (handle) { isResizingZone = true; resizeHandleName = handle; return; }
        return;
    }
    zoneStart = pos;
    isDrawing = true;
    savedImageData = mainCtx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
});

// Kazalec kaže smer spreminjanja velikosti, ko miška lebdi nad eno od ročk (in se ne vleče).
mainCanvas.addEventListener('mousemove', e => {
    if (isDrawing || isResizingZone || zoneDrawMode || activePageIndex === null) return;
    const handle = hitTestZoneHandle(getCanvasCoords(e));
    mainCanvas.style.cursor = (handle === 'left' || handle === 'right') ? 'ew-resize'
        : (handle === 'top' || handle === 'bottom') ? 'ns-resize' : 'default';
});

// Na dokumentu (ne samo na canvasu), da risanje/spreminjanje cone ne prekine, če miška
// za trenutek zdrsne čez rob predogleda med vlečenjem ob robovih strani.
document.addEventListener('mousemove', e => {
    if (isResizingZone) {
        const z = activeZone(); if (!z) return;
        const pos = getCanvasCoords(e);
        const fx = pos.x / mainCanvas.width, fy = pos.y / mainCanvas.height;
        const MIN_SIZE = 0.02;
        if (resizeHandleName === 'left') z.x1 = Math.min(fx, z.x2 - MIN_SIZE);
        if (resizeHandleName === 'right') z.x2 = Math.max(fx, z.x1 + MIN_SIZE);
        if (resizeHandleName === 'top') z.y1 = Math.min(fy, z.y2 - MIN_SIZE);
        if (resizeHandleName === 'bottom') z.y2 = Math.max(fy, z.y1 + MIN_SIZE);
        processPage(activePageIndex);
        return;
    }
    if (!isDrawing) return;
    const cur = getCanvasCoords(e);
    mainCtx.putImageData(savedImageData, 0, 0);
    drawZoneOverlay(zoneStart.x, zoneStart.y, cur.x, cur.y);
});

function finishZone(e) {
    if (!isDrawing) return;
    isDrawing = false;
    const cur = getCanvasCoords(e);
    if (Math.abs(cur.x - zoneStart.x) > 10 && Math.abs(cur.y - zoneStart.y) > 10) {
        const pData = pagesData[activePageIndex];
        pData.zones.push({
            x1: Math.min(zoneStart.x, cur.x) / mainCanvas.width,
            y1: Math.min(zoneStart.y, cur.y) / mainCanvas.height,
            x2: Math.max(zoneStart.x, cur.x) / mainCanvas.width,
            y2: Math.max(zoneStart.y, cur.y) / mainCanvas.height,
            threshold: pData.threshold
        });
        activeZoneIndex = pData.zones.length - 1;
        renderZoneList();
        processPage(activePageIndex);
        statusDisplay.innerText = `Zone ${activeZoneIndex + 1} created. Set its threshold below.`;
    } else {
        if (savedImageData) mainCtx.putImageData(savedImageData, 0, 0);
    }
    resetZoneBtn();
}

document.addEventListener('mouseup', e => {
    if (isResizingZone) {
        isResizingZone = false; resizeHandleName = null;
        updateThumbPreview(activePageIndex);
        return;
    }
    if (isDrawing) finishZone(e);
});

function drawZoneOverlay(x1, y1, x2, y2, active = true) {
    const rx = Math.min(x1, x2), ry = Math.min(y1, y2);
    const rw = Math.abs(x2 - x1), rh = Math.abs(y2 - y1);
    const rgb = active ? '242, 204, 90' : '255, 100, 100';
    mainCtx.save();
    mainCtx.fillStyle = `rgba(${rgb}, 0.08)`;
    mainCtx.fillRect(rx, ry, rw, rh);
    mainCtx.strokeStyle = `rgba(${rgb}, 0.85)`;
    mainCtx.lineWidth = Math.max(2, mainCanvas.width / 500);
    mainCtx.setLineDash(active ? [] : [12, 6]);
    mainCtx.strokeRect(rx, ry, rw, rh);
    mainCtx.restore();
}

// ── Nalaganje datotek (eno ali več, klik ali vlečenje) ───────────────────

// Zazna izvorno ločljivost vdelane rastrske slike na strani (če obstaja), primerjano s
// fizično velikostjo strani. Če je stran čisti vektor (notni stavek), vrne null — takrat
// ni zgornje meje smiselne ločljivosti, saj se vektor renderira ostro pri poljubni DPI.
async function detectNativeDPI(page) {
    try {
        const viewport = page.getViewport({ scale: 1 }); // pt, 72 DPI referenca
        const opList = await page.getOperatorList();
        let best = null;
        for (let k = 0; k < opList.fnArray.length; k++) {
            const op = opList.fnArray[k];
            if (op === pdfjsLib.OPS.paintImageXObject || op === pdfjsLib.OPS.paintJpegXObject) {
                const img = page.objs.get(opList.argsArray[k][0]);
                if (img && img.width && img.height) {
                    const dpi = Math.min(img.width / (viewport.width / 72), img.height / (viewport.height / 72));
                    if (best === null || dpi > best) best = dpi;
                }
            }
        }
        return best ? Math.round(best) : null;
    } catch {
        return null;
    }
}

function renderPageToCanvas(page, dpi) {
    const viewport = page.getViewport({ scale: dpi / 72 });
    const c = document.createElement('canvas');
    c.width = viewport.width; c.height = viewport.height;
    return page.render({ canvasContext: c.getContext('2d', { willReadFrequently: true }), viewport }).promise.then(() => c);
}

// Uvoz v dveh fazah: najprej vsako stran hitro renderiramo pri PREVIEW_DPI, da je takoj
// uporabna (prag/zaznava izvorne ločljivosti sta neodvisna od ločljivosti), polno WORKING_DPI
// različico pa dorišemo v ozadju (upgradePagesInBackground) in neopazno zamenjamo.
async function loadPdfFile(file, onEarlyReady) {
    const buf = await file.arrayBuffer();
    const doc = await pdfjsLib.getDocument(new Uint8Array(buf)).promise;
    const earlyReadyAt = Math.min(2, doc.numPages);
    for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const previewCanvas = await renderPageToCanvas(page, PREVIEW_DPI);
        const nativeDPI = await detectNativeDPI(page);
        const threshold = computeOtsuThreshold(previewCanvas); // prag zaznamo enkrat ob uvozu (odvisen le od sivin, ne ločljivosti)
        pagesData.push({
            originalCanvas: previewCanvas, hiRes: false, rotation: 0, threshold,
            zones: [], sourceDoc: doc, pageNumber: i, nativeDPI
        });
        renderThumbCard(pagesData.length - 1);
        updateNavArrows();
        if (i === earlyReadyAt && onEarlyReady) onEarlyReady();
        else if (i > earlyReadyAt) statusDisplay.innerText = `Loading page ${i} of ${doc.numPages}...`;
    }
}

// Zaporedno v ozadju nadgradi vsako še-ne-polno stran do WORKING_DPI in zamenja platno.
// `find` ob vsaki iteraciji samodejno zajame tudi na novo dodane datoteke in prerazporeditve
// strani; teče naenkrat samo en primerek (varovano z zastavico `upgrading`).
let upgrading = false;
async function upgradePagesInBackground() {
    if (upgrading) return;
    upgrading = true;
    try {
        let pData;
        while ((pData = pagesData.find(p => !p.hiRes && p.sourceDoc))) {
            const page = await pData.sourceDoc.getPage(pData.pageNumber);
            const hi = await renderPageToCanvas(page, WORKING_DPI);
            pData.originalCanvas = hi;
            pData.hiRes = true;
            const idx = pagesData.indexOf(pData);
            if (idx !== -1) {
                updateThumbPreview(idx);
                if (idx === activePageIndex) processPage(idx); // če je stran ravno aktivna, osveži predogled v ostrejšo verzijo
            }
        }
    } finally {
        upgrading = false;
    }
}

// Zabeleži najnižjo zaznano izvorno ločljivost med naloženimi stranmi — uporabljeno
// kasneje kot privzeto priporočilo v dialogu za izbiro ločljivosti izvoza.
function updateDpiHint() {
    const detected = pagesData.map(p => p.nativeDPI).filter(v => v != null);
    documentNativeDPI = detected.length ? Math.round(Math.min(...detected)) : null;
}

async function handleFiles(fileList) {
    const files = Array.from(fileList || []).filter(f =>
        f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (files.length === 0) return;
    statusDisplay.innerText = 'Loading at archival 1:1 quality and detecting threshold...';
    if (!baseName) baseName = files[0].name.replace(/\.pdf$/i, '');
    let activated = pagesData.length > 0;
    for (const f of files) {
        await loadPdfFile(f, () => {
            if (!activated) { activated = true; setActivePage(0); }
        });
    }
    updateDpiHint();
    statusDisplay.innerText = documentNativeDPI
        ? `Imported ${pagesData.length} pages · threshold auto-detected · source resolution ~${documentNativeDPI} DPI.`
        : `Imported ${pagesData.length} pages · threshold auto-detected for each page.`;
    upgradePagesInBackground(); // polna ločljivost se doriše seamless v ozadju
}

uploadSection.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', e => {
    handleFiles(e.target.files);
    fileInput.value = '';
});

['dragenter', 'dragover'].forEach(evt => uploadSection.addEventListener(evt, e => {
    e.preventDefault(); uploadSection.classList.add('dragover');
}));
['dragleave', 'drop'].forEach(evt => uploadSection.addEventListener(evt, e => {
    e.preventDefault(); uploadSection.classList.remove('dragover');
}));
uploadSection.addEventListener('drop', e => handleFiles(e.dataTransfer.files));
document.addEventListener('dragover', e => e.preventDefault());
document.addEventListener('drop', e => { if (e.target !== uploadSection) e.preventDefault(); });

// ── Sličice ──────────────────────────────────────────────────────────────

function renderThumbCard(index) {
    const card = document.createElement('div');
    card.className = 'thumb-card'; card.setAttribute('draggable', true); card.dataset.index = index;
    const wrapper = document.createElement('div'); wrapper.className = 'thumb-canvas-wrapper';
    const thumbCanvas = document.createElement('canvas');
    wrapper.appendChild(thumbCanvas); card.appendChild(wrapper);
    const info = document.createElement('div'); info.className = 'thumb-info';
    info.innerHTML = `<span>Page ${index + 1}</span><button class="secondary btn-sm">⟳ Rotate</button>`;
    card.appendChild(info);
    card.querySelector('button').onclick = e => { e.stopPropagation(); rotatePage(index); };
    card.onclick = () => setActivePage(index);
    card.addEventListener('dragstart', () => { draggedIndex = index; card.classList.add('dragging'); });
    card.addEventListener('dragend', () => card.classList.remove('dragging'));
    card.addEventListener('dragover', e => e.preventDefault());
    card.addEventListener('drop', () => {
        const ti = parseInt(card.dataset.index);
        if (draggedIndex !== null && draggedIndex !== ti) {
            const [el] = pagesData.splice(draggedIndex, 1);
            pagesData.splice(ti, 0, el);
            rebuildSidebar(); setActivePage(ti);
        }
    });
    thumbContainer.appendChild(card);
    updateThumbPreview(index, thumbCanvas);
}

function rebuildSidebar() {
    thumbContainer.innerHTML = "";
    for (let i = 0; i < pagesData.length; i++) renderThumbCard(i);
}

function updateThumbPreview(index, specCanvas = null) {
    const card = thumbContainer.children[index]; if (!card) return;
    const canvas = specCanvas || card.querySelector('canvas');
    const pData = pagesData[index];
    canvas.width = 240; canvas.height = 200;
    const ctx = canvas.getContext('2d');
    const temp = document.createElement('canvas');
    temp.width = pData.originalCanvas.width; temp.height = pData.originalCanvas.height;
    temp.getContext('2d').drawImage(pData.originalCanvas, 0, 0);
    applyFilter(temp, pData.threshold);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((pData.rotation * Math.PI) / 180);
    const scale = Math.max(canvas.width / pData.originalCanvas.width, canvas.height / pData.originalCanvas.height);
    ctx.drawImage(temp, -pData.originalCanvas.width * scale / 2, -pData.originalCanvas.height * scale / 2,
        pData.originalCanvas.width * scale, pData.originalCanvas.height * scale);
    ctx.restore();
}

function setActivePage(index) {
    activePageIndex = index;
    previewWindow.classList.add('has-page'); // pokaže osrednji del (kvadrat, puščice, glavo)
    Array.from(thumbContainer.children).forEach((c, i) => c.classList.toggle('active', i === index));
    const pData = pagesData[index];
    thresholdCtrl.value = pData.threshold;
    syncThresholdUI(pData.threshold);
    activeZoneIndex = pData.zones.length ? 0 : null;
    renderZoneList();
    processPage(index);
    updateNavArrows();
}

// Puščici za pomikanje med stranmi neposredno v osrednjem delu (brez klikanja sličic).
function updateNavArrows() {
    prevPageBtn.disabled = activePageIndex === null || activePageIndex <= 0;
    nextPageBtn.disabled = activePageIndex === null || activePageIndex >= pagesData.length - 1;
}
prevPageBtn.addEventListener('click', () => { if (activePageIndex > 0) setActivePage(activePageIndex - 1); });
nextPageBtn.addEventListener('click', () => { if (activePageIndex < pagesData.length - 1) setActivePage(activePageIndex + 1); });
updateNavArrows();

// Stikalo za prikaz originalne barvne slike (primerjava prej/potem).
toggleColorBtn.addEventListener('click', () => {
    if (activePageIndex === null) return;
    showOriginalColor = !showOriginalColor;
    toggleColorBtn.textContent = showOriginalColor ? 'Show black & white' : 'Show original';
    toggleColorBtn.classList.toggle('active', showOriginalColor);
    processPage(activePageIndex);
});

function rotatePage(index) {
    pagesData[index].rotation = (pagesData[index].rotation + 90) % 360;
    pagesData[index].zones = []; // koordinate con po rotaciji ne veljajo
    if (index === activePageIndex) { activeZoneIndex = null; renderZoneList(); }
    updateThumbPreview(index);
    if (index === activePageIndex) processPage(index);
}

// ── Obdelava strani ──────────────────────────────────────────────────────

function renderToCtx(ctx, w, h, orig, pData, threshold) {
    const proc = document.createElement('canvas');
    proc.width = orig.width; proc.height = orig.height;
    proc.getContext('2d').drawImage(orig, 0, 0);
    applyFilter(proc, threshold);
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate((pData.rotation * Math.PI) / 180);
    ctx.drawImage(proc, -orig.width / 2, -orig.height / 2);
    ctx.restore();
}

// Rotirana stran brez praga (surovi piksli), enkrat izračunana in deljena med vsemi conami —
// da vsaka cona ne obdeluje cele strani, ampak samo svoj (običajno majhen) izrez.
function applyZones(ctx, w, h, orig, pData) {
    if (!pData.zones.length) return;
    const rotated = renderRotatedGrayscale(pData, orig);
    const gctx = rotated.getContext('2d', { willReadFrequently: true });
    for (const z of pData.zones) {
        const zx = Math.max(0, Math.round(z.x1 * w)), zy = Math.max(0, Math.round(z.y1 * h));
        const zw = Math.min(w, Math.round(z.x2 * w)) - zx, zh = Math.min(h, Math.round(z.y2 * h)) - zy;
        if (zw <= 0 || zh <= 0) continue;
        const imgData = gctx.getImageData(zx, zy, zw, zh);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
            const v = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            d[i] = d[i + 1] = d[i + 2] = v >= z.threshold ? 255 : 0;
            d[i + 3] = 255;
        }
        ctx.putImageData(imgData, zx, zy);
    }
}

function processPage(index) {
    const pData = pagesData[index], orig = pData.originalCanvas;
    mainCanvas.width = pData.rotation % 180 === 0 ? orig.width : orig.height;
    mainCanvas.height = pData.rotation % 180 === 0 ? orig.height : orig.width;
    if (showOriginalColor) {
        // Prikaz originalne barvne slike (za primerjavo prej/potem) — brez praga in con.
        const rotated = renderRotatedGrayscale(pData); // vrne rotirano ORIGINALNO (barvno) sliko
        mainCtx.drawImage(rotated, 0, 0);
    } else {
        renderToCtx(mainCtx, mainCanvas.width, mainCanvas.height, orig, pData, pData.threshold);
        if (pData.zones.length) {
            applyZones(mainCtx, mainCanvas.width, mainCanvas.height, orig, pData);
            pData.zones.forEach((z, i) => {
                drawZoneOverlay(z.x1 * mainCanvas.width, z.y1 * mainCanvas.height,
                    z.x2 * mainCanvas.width, z.y2 * mainCanvas.height, i === activeZoneIndex);
            });
            if (!zoneDrawMode && activeZoneIndex !== null && pData.zones[activeZoneIndex]) {
                drawZoneHandles(pData.zones[activeZoneIndex]);
            }
        }
    }
    fitPreviewBox();
}

// Črn okvir (.cropper-box) zmanjšamo na velikost, ki se v celoti prilega vidnemu delu,
// ob ohranjanju razmerja strani — tako je vedno vidna cela stran (ne odrezana). Platno
// samo ostane v polni ločljivosti (width/height atributa), CSS ga le prikaže manjšega.
function fitPreviewBox() {
    if (!mainCanvas.width || !mainCanvas.height) { cropperBox.style.width = ''; cropperBox.style.height = ''; return; }
    const ARROW_SPACE = 52; // rezerviran prostor ob straneh, da stran ne sega pod puščici
    const maxW = Math.max(1, cropperViewport.clientWidth - ARROW_SPACE * 2);
    const maxH = Math.max(1, cropperViewport.clientHeight - 4);
    const scale = Math.min(maxW / mainCanvas.width, maxH / mainCanvas.height);
    cropperBox.style.width = Math.max(1, Math.round(mainCanvas.width * scale)) + 'px';
    cropperBox.style.height = Math.max(1, Math.round(mainCanvas.height * scale)) + 'px';
}

// Ob spremembi velikosti okna (in ob vlečenju ročke panela) je treba prikaz na novo prilagoditi.
window.addEventListener('resize', () => { if (activePageIndex !== null) fitPreviewBox(); });

function applyFilter(canvas, threshold) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
        const v = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        d[i] = d[i + 1] = d[i + 2] = v >= threshold ? 255 : 0;
        d[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
}

// ── Izvoz ────────────────────────────────────────────────────────────────

async function getExportSourceCanvas(pData, dpi) {
    // Predpomnjeno platno uporabimo le, če je res polne (hi-res) kakovosti in ustreza zahtevani DPI.
    // Sicer VEDNO znova renderiramo iz PDF-ja — tako je izvoz polne kakovosti tudi, če ozadje
    // te strani še ni nadgradilo iz preview v WORKING_DPI (drugače bi izvozili mehko preview sliko).
    if (dpi === WORKING_DPI && pData.hiRes) return pData.originalCanvas;
    if (!pData.sourceDoc) return pData.originalCanvas;
    const page = await pData.sourceDoc.getPage(pData.pageNumber);
    return renderPageToCanvas(page, dpi);
}

function parsePageRange() {
    const rIn = pageRangeInput.value.trim();
    let start = 1, end = pagesData.length;
    if (rIn !== '') {
        if (rIn.includes('-')) { const p = rIn.split('-'); start = parseInt(p[0]) || 1; end = parseInt(p[1]) || pagesData.length; }
        else { const s = parseInt(rIn); if (!isNaN(s)) { start = s; end = s; } }
    }
    const sIdx = Math.max(1, Math.min(start, pagesData.length)) - 1;
    const eIdx = Math.max(1, Math.min(end, pagesData.length)) - 1;
    return { sIdx, eIdx };
}

function formatBytes(bytes) {
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

// Zgradi seznam ponujenih ločljivosti: standardne 150/300/600 + zaznana izvorna (če je nižja
// in se ne ujema z eno od standardnih), z eno izmed njih označeno kot privzeto priporočeno.
function getDpiCandidates() {
    const labels = { 150: 'draft', 300: 'archival', 600: 'highest quality' };
    const recommendedDpi = (documentNativeDPI && documentNativeDPI < 250) ? documentNativeDPI : 300;
    const dpis = new Set([150, 300, 600, recommendedDpi]);
    return [...dpis].sort((a, b) => a - b).map(dpi => ({
        dpi,
        recommended: dpi === recommendedDpi,
        label: labels[dpi] ? `${dpi} DPI · ${labels[dpi]}` : `${dpi} DPI · detected source resolution (no upscaling)`
    }));
}

// Približna velikost za eno (reprezentativno) stran pri dani DPI — dejansko izriše,
// upragovi in JPEG-stisne stran skozi isti cevovod kot pravi izvoz.
async function estimatePageBytes(pData, dpi) {
    const orig = await getExportSourceCanvas(pData, dpi);
    const expW = pData.rotation % 180 === 0 ? orig.width : orig.height;
    const expH = pData.rotation % 180 === 0 ? orig.height : orig.width;
    const exp = document.createElement('canvas');
    exp.width = expW; exp.height = expH;
    const eCtx = exp.getContext('2d');
    renderToCtx(eCtx, expW, expH, orig, pData, pData.threshold);
    if (pData.zones.length) applyZones(eCtx, expW, expH, orig, pData);
    const url = exp.toDataURL('image/jpeg', 0.9);
    return Math.round((url.length - url.indexOf(',') - 1) * 3 / 4);
}

async function openExportDialog() {
    if (pagesData.length === 0) return;
    const candidates = getDpiCandidates();
    const { sIdx, eIdx } = parsePageRange();
    const pageCount = eIdx - sIdx + 1;
    const samplePData = pagesData[sIdx];

    dpiOptionList.innerHTML = candidates.map(c => `
        <label class="dpi-option">
            <input type="radio" name="dpiChoice" value="${c.dpi}" ${c.recommended ? 'checked' : ''}>
            <span class="dpi-option-label">${c.label}${c.recommended ? '<span class="dpi-option-recommended">Recommended</span>' : ''}</span>
            <span class="dpi-option-size" data-dpi="${c.dpi}">calculating…</span>
        </label>
    `).join('');
    exportModalBg.classList.remove('hidden');

    for (const c of candidates) {
        try {
            const totalBytes = await estimatePageBytes(samplePData, c.dpi) * pageCount;
            const el = dpiOptionList.querySelector(`.dpi-option-size[data-dpi="${c.dpi}"]`);
            if (el) el.textContent = `~${formatBytes(totalBytes)}`;
        } catch {
            const el = dpiOptionList.querySelector(`.dpi-option-size[data-dpi="${c.dpi}"]`);
            if (el) el.textContent = '?';
        }
    }
}

function closeExportDialog() { exportModalBg.classList.add('hidden'); }

exportBtn.addEventListener('click', openExportDialog);
exportCancelBtn.addEventListener('click', closeExportDialog);
exportModalBg.addEventListener('click', e => { if (e.target === exportModalBg) closeExportDialog(); });
exportConfirmBtn.addEventListener('click', () => {
    const checked = dpiOptionList.querySelector('input[name="dpiChoice"]:checked');
    const dpi = checked ? parseInt(checked.value) : 300;
    closeExportDialog();
    exportCleanedPDF(dpi);
});

async function exportCleanedPDF(dpi) {
    if (pagesData.length === 0) return;

    // Lokacijo za shranjevanje vprašamo TAKOJ, dokler je klik na gumb še "svež" —
    // showSaveFilePicker po nekaj sekundah obdelave zavrne zahtevo (poteče aktivacija),
    // kar je prej po nepotrebnem prijavilo "Preklicano" po dolgi obdelavi.
    const suggestedEarly = (baseName || 'facsimile') + '_bw.pdf';
    let fileHandle = null;
    if ('showSaveFilePicker' in window) {
        try {
            fileHandle = await window.showSaveFilePicker({ suggestedName: suggestedEarly, types: [{ description: 'PDF', accept: { 'application/pdf': ['.pdf'] } }] });
        } catch (e) {
            statusDisplay.innerText = e && e.name === 'AbortError' ? 'Cancelled.' : `Error choosing save location: ${e.message || e}`;
            return;
        }
    }

    statusDisplay.innerText = "Exporting selected range...";
    const { jsPDF } = window.jspdf;
    const { sIdx, eIdx } = parsePageRange();
    let doc = null, isFirst = true;

    for (let i = sIdx; i <= eIdx; i++) {
        statusDisplay.innerText = `Exporting page ${i - sIdx + 1}/${eIdx - sIdx + 1}...`;
        await new Promise(r => setTimeout(r, 0)); // yield to the UI thread so status updates and the page doesn't look frozen
        const pData = pagesData[i];
        const orig = await getExportSourceCanvas(pData, dpi);
        const expW = pData.rotation % 180 === 0 ? orig.width : orig.height;
        const expH = pData.rotation % 180 === 0 ? orig.height : orig.width;
        const exp = document.createElement('canvas');
        exp.width = expW; exp.height = expH;
        const eCtx = exp.getContext('2d');
        renderToCtx(eCtx, expW, expH, orig, pData, pData.threshold);
        if (pData.zones.length) applyZones(eCtx, expW, expH, orig, pData);
        // (obroba con se NE izvozi)
        // JPEG: jsPDF vgradi JPEG skoraj neposredno (brez dekodiranja), PNG pa gre skozi
        // počasen čisto-JS dekodirnik in je za velike skene lahko 20-30x počasnejši.
        const url = exp.toDataURL('image/jpeg', 0.9);
        const orient = expW > expH ? 'l' : 'p';
        // jsPDF-jeva enota "px" NI 1px=1pt — interno jo pretvori v pt s faktorjem 96/72 (1.333×),
        // zato bi stran, "veliko" toliko pikslov, dobila napačno (napihnjeno) fizično velikost v PDF-ju.
        // Fizično pravilno velikost (v pt) izračunamo sami iz DPI, pri katerem smo dejansko renderirali:
        // pri 300 DPI je 1 pika = 72/300 pt, kar za izvirno 1000×1558pt stran znova da ~1000×1558pt.
        const ptScale = 72 / dpi;
        const expWpt = expW * ptScale, expHpt = expH * ptScale;
        if (isFirst) { doc = new jsPDF({ orientation: orient, unit: 'pt', format: [expWpt, expHpt], compress: true }); isFirst = false; }
        else { doc.addPage([expWpt, expHpt], orient); }
        doc.addImage(url, 'JPEG', 0, 0, expWpt, expHpt);
    }

    if (!doc) { statusDisplay.innerText = "Invalid page range."; return; }
    const pageCount = eIdx - sIdx + 1;
    let blob;
    try {
        blob = doc.output('blob');
    } catch (e) {
        statusDisplay.innerText = `Export is too large for a single PDF (${pageCount} pages at ${dpi} DPI exceeds the technical size limit). Lower the export resolution or export a smaller page range (e.g. 10-20 at a time).`;
        return;
    }
    if (fileHandle) {
        try {
            const w = await fileHandle.createWritable(); await w.write(blob); await w.close();
            statusDisplay.innerText = "Document saved successfully.";
        } catch (e) {
            statusDisplay.innerText = `Error while saving: ${e.message || e}`;
        }
    } else {
        const suggested = suggestedEarly;
        const l = document.createElement('a'); l.href = URL.createObjectURL(blob); l.download = suggested; l.click();
        statusDisplay.innerText = "Downloaded.";
    }
}

// ── Pomoč: ikone "?" + plavajoči oblaček ──────────────────────────────────
// Enaka zasnova kot v Obrezovalniku manuskriptov: oblaček je position:fixed (lego
// izračuna JS in jo omeji na vidno okno), odpre/zapre pa se s klikom na ikono "?".
const HELP_TEXTS = {
    threshold: {
        title: "Global threshold",
        html: `<p>The brightness cutoff for the whole page: pixels lighter than this turn <strong>white</strong>, darker ones turn <strong>black</strong>.</p>
               <p>Lower it to keep faint or grey strokes; raise it to drop yellowed paper, stains and show-through from the other side.</p>`
    },
    presets: {
        title: "Presets",
        html: `<p>Save the current threshold under a name (e.g. a paper type or scan batch) and re-apply it to any page or document with <strong>one click</strong>.</p>`
    },
    zone: {
        title: "Zone threshold",
        html: `<p>Apply a different threshold to just one rectangle of the page — handy when a stamp, a dark margin or a faded correction needs a stronger or gentler cutoff than the rest.</p>
               <p>Click <strong>+ Add Zone</strong>, draw the area, then adjust its slider.</p>`
    }
};

const helpBubble = document.getElementById('helpBubble');
let activeHelpIcon = null;

function positionHelpBubble(iconRect) {
    const b = helpBubble;
    const margin = 10;
    const bw = b.offsetWidth, bh = b.offsetHeight;
    // Oblaček po možnosti postavi LEVO od ikone (proti sredini zaslona, saj so ti
    // kontrolniki v desnem panelu); če tam zmanjka prostora, ga postavi desno.
    let left = iconRect.left - bw - margin;
    if (left < margin) left = iconRect.right + margin;
    let top = iconRect.top - 6;
    left = Math.max(margin, Math.min(left, window.innerWidth - bw - margin));
    top = Math.max(margin, Math.min(top, window.innerHeight - bh - margin));
    b.style.left = left + 'px';
    b.style.top = top + 'px';
}

function showHelp(icon) {
    const data = HELP_TEXTS[icon.dataset.help];
    if (!data) return;
    helpBubble.innerHTML = `<h4>${data.title}</h4>${data.html}`;
    helpBubble.classList.remove('hidden');
    positionHelpBubble(icon.getBoundingClientRect());
    icon.classList.add('active');
    activeHelpIcon = icon;
}

function hideHelp() {
    helpBubble.classList.add('hidden');
    if (activeHelpIcon) activeHelpIcon.classList.remove('active');
    activeHelpIcon = null;
}

document.querySelectorAll('.help-icon').forEach(icon => {
    icon.addEventListener('click', (e) => {
        e.stopPropagation();
        if (activeHelpIcon === icon) { hideHelp(); return; }
        showHelp(icon);
    });
});
// Zapri ob kliku drugam, tipki Escape ali spremembi velikosti okna.
document.addEventListener('click', (e) => {
    if (activeHelpIcon && !helpBubble.contains(e.target) && !e.target.classList.contains('help-icon')) hideHelp();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideHelp(); });
window.addEventListener('resize', () => { if (activeHelpIcon) positionHelpBubble(activeHelpIcon.getBoundingClientRect()); });
