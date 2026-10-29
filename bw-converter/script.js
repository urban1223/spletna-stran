pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

const WORKING_DPI = 300;  // polna delovna/izvozna ločljivost
const PREVIEW_DPI = 120;   // hitra začetna ločljivost ob uvozu (nadgradi se v ozadju do WORKING_DPI)
const PRESETS_KEY = 'cbPretvornikPresets_v1';
const INK_SMOOTHING_PX = 0.495; // 10 % več glajenja; izhod ostane brez sivin

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

// ── Samodejni prag in črno-bela obdelava ─────────────────────────────────

// Prag je občutljivost glede na lokalno ozadje, ne več absolutna svetlost.
// To odstrani vpliv rumenega papirja, senc in neenakomerne osvetlitve.
function computeAdaptiveThreshold(canvas, rect) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const x = rect ? rect.x : 0, y = rect ? rect.y : 0;
    const w = rect ? rect.w : canvas.width, h = rect ? rect.h : canvas.height;
    const d = ctx.getImageData(x, y, w, h).data;
    let sum = 0, sumSq = 0, count = 0;
    for (let i = 0; i < d.length; i += 4) {
        const v = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        sum += v; sumSq += v * v; count++;
    }
    const mean = sum / count;
    const stdDev = Math.sqrt(Math.max(0, sumSq / count - mean * mean));
    // Darker/less uniform pages need a slightly stronger local separation.
    return Math.round(Math.max(160, Math.min(215, 193 - (stdDev - 35) * 0.35)));
}

// `orig` privzeto pData.originalCanvas (delovna 300 DPI kopija) za predogled/avtomatsko
// občutljivost cone.
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
        const threshold = computeAdaptiveThreshold(previewCanvas); // občutljivost glede na lokalno ozadje
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
        adaptiveBinarize(gctx, rotated.width, rotated.height, z.threshold, { x: zx, y: zy, w: zw, h: zh });
        ctx.drawImage(rotated, zx, zy, zw, zh, zx, zy, zw, zh);
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

function buildLuminanceIntegral(imageData, width, height) {
    const integral = new Float64Array((width + 1) * (height + 1));
    const d = imageData.data;
    for (let y = 1; y <= height; y++) {
        let rowSum = 0;
        for (let x = 1; x <= width; x++) {
            const i = ((y - 1) * width + x - 1) * 4;
            rowSum += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            const p = y * (width + 1) + x;
            integral[p] = integral[p - (width + 1)] + rowSum;
        }
    }
    return integral;
}

function adaptiveBinarize(ctx, width, height, threshold, rect = null) {
    // Mehko predglajenje zmanjša stopničaste robove pri poševnih črtah in notah.
    // Binarizacija se izvede šele nato, zato izhod ostane čisto črn ali bel.
    const softened = document.createElement('canvas');
    softened.width = width;
    softened.height = height;
    const softenedCtx = softened.getContext('2d', { willReadFrequently: true });
    softenedCtx.filter = `blur(${INK_SMOOTHING_PX}px)`;
    softenedCtx.drawImage(ctx.canvas, 0, 0);
    const imageData = softenedCtx.getImageData(0, 0, width, height);
    const d = imageData.data;
    const integral = buildLuminanceIntegral(imageData, width, height);
    const stride = width + 1;
    const radius = Math.max(12, Math.round(Math.min(width, height) * 0.018));
    const x1 = rect ? Math.max(0, rect.x) : 0;
    const y1 = rect ? Math.max(0, rect.y) : 0;
    const x2 = rect ? Math.min(width, rect.x + rect.w) : width;
    const y2 = rect ? Math.min(height, rect.y + rect.h) : height;
    const ratio = Math.max(0.35, Math.min(0.95, threshold / 255));

    for (let y = y1; y < y2; y++) {
        const top = Math.max(0, y - radius);
        const bottom = Math.min(height, y + radius + 1);
        for (let x = x1; x < x2; x++) {
            const left = Math.max(0, x - radius);
            const right = Math.min(width, x + radius + 1);
            const area = (right - left) * (bottom - top);
            const localMean = (
                integral[bottom * stride + right] -
                integral[top * stride + right] -
                integral[bottom * stride + left] +
                integral[top * stride + left]
            ) / area;
            const i = (y * width + x) * 4;
            const luminance = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            // Saturated yellow/brown paper is treated as background unless it is
            // substantially darker than its local paper tone.
            const saturation = Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]);
            const colorPenalty = saturation > 28 ? Math.min(12, (saturation - 28) * 0.12) : 0;
            const cutoff = localMean * ratio - colorPenalty;
            const ink = luminance < cutoff;
            d[i] = d[i + 1] = d[i + 2] = ink ? 0 : 255;
            d[i + 3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

function applyFilter(canvas, threshold) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    adaptiveBinarize(ctx, canvas.width, canvas.height, threshold);
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

function packOneBitCanvas(canvas) {
    const { width, height } = canvas;
    const pixels = canvas.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, width, height).data;
    const rowBytes = Math.ceil(width / 8);
    const packed = new Uint8Array(rowBytes * height);
    for (let y = 0; y < height; y++) {
        const rowOffset = y * rowBytes;
        for (let x = 0; x < width; x++) {
            const pixelOffset = (y * width + x) * 4;
            if (pixels[pixelOffset] < 128) packed[rowOffset + (x >> 3)] |= 1 << (7 - (x & 7));
        }
    }
    return { width, height, packed };
}

async function deflateBytes(bytes) {
    if (!('CompressionStream' in window)) {
        throw new Error('This browser does not support fast lossless PDF compression.');
    }
    const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
}

function concatBytes(...parts) {
    const result = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
    let offset = 0;
    for (const part of parts) {
        result.set(part, offset);
        offset += part.length;
    }
    return result;
}

function pdfTextBytes(text) {
    return new TextEncoder().encode(text);
}

async function buildBitonalPdf(pages) {
    const objects = [];
    const pageRefs = [];
    const pageData = [];
    let nextObject = 3;

    for (const page of pages) {
        const imageObject = nextObject++;
        const contentObject = nextObject++;
        const pageObject = nextObject++;
        pageRefs.push(pageObject);
        pageData.push({ image: page.image, compressed: page.compressed, imageObject, contentObject, pageObject, widthPt: page.widthPt, heightPt: page.heightPt });
    }

    objects[1] = pdfTextBytes('<< /Type /Catalog /Pages 2 0 R >>');
    objects[2] = pdfTextBytes(`<< /Type /Pages /Kids [${pageRefs.map(ref => `${ref} 0 R`).join(' ')}] /Count ${pageRefs.length} >>`);
    for (const page of pageData) {
        const pageContent = pdfTextBytes(`q ${page.widthPt} 0 0 ${page.heightPt} 0 0 cm /Im1 Do Q`);
        objects[page.imageObject] = concatBytes(
            pdfTextBytes(`<< /Type /XObject /Subtype /Image /Width ${page.image.width} /Height ${page.image.height} /ColorSpace /DeviceGray /BitsPerComponent 1 /Decode [1 0] /Filter /FlateDecode /Length ${page.compressed.length} >>\nstream\n`),
            page.compressed,
            pdfTextBytes('\nendstream')
        );
        objects[page.contentObject] = concatBytes(
            pdfTextBytes(`<< /Length ${pageContent.length} >>\nstream\n`),
            pageContent,
            pdfTextBytes('\nendstream')
        );
        objects[page.pageObject] = pdfTextBytes(
            `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.widthPt} ${page.heightPt}] ` +
            `/Resources << /XObject << /Im1 ${page.imageObject} 0 R >> >> /Contents ${page.contentObject} 0 R >>`
        );
    }

    const header = pdfTextBytes('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    const chunks = [header];
    const offsets = new Array(objects.length).fill(0);
    let position = header.length;
    for (let i = 1; i < objects.length; i++) {
        const object = concatBytes(pdfTextBytes(`${i} 0 obj\n`), objects[i], pdfTextBytes('\nendobj\n'));
        offsets[i] = position;
        chunks.push(object);
        position += object.length;
    }
    const xrefOffset = position;
    const xref = [`xref\n0 ${objects.length}\n0000000000 65535 f \n`];
    for (let i = 1; i < objects.length; i++) xref.push(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
    xref.push(`trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
    chunks.push(pdfTextBytes(xref.join('')));
    return new Blob(chunks, { type: 'application/pdf' });
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

// Približna velikost za eno (reprezentativno) stran pri dani DPI — dejansko izriše
// in stisne stran skozi isti cevovod kot pravi izvoz.
async function estimatePageBytes(pData, dpi) {
    const orig = await getExportSourceCanvas(pData, dpi);
    const expW = pData.rotation % 180 === 0 ? orig.width : orig.height;
    const expH = pData.rotation % 180 === 0 ? orig.height : orig.width;
    const exp = document.createElement('canvas');
    exp.width = expW; exp.height = expH;
    const eCtx = exp.getContext('2d');
    renderToCtx(eCtx, expW, expH, orig, pData, pData.threshold);
    if (pData.zones.length) applyZones(eCtx, expW, expH, orig, pData);
    const oneBitBytes = Math.ceil(expW / 8) * expH;
    exp.width = 1;
    exp.height = 1;
    return oneBitBytes;
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
    const { sIdx, eIdx } = parsePageRange();
    const exportPages = [];

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
        const ptScale = 72 / dpi;
        const image = packOneBitCanvas(exp);
        const compressed = await deflateBytes(image.packed);
        exportPages.push({ image, compressed, widthPt: expW * ptScale, heightPt: expH * ptScale });
        exp.width = 1;
        exp.height = 1;
        await new Promise(requestAnimationFrame);
    }

    if (exportPages.length === 0) { statusDisplay.innerText = "Invalid page range."; return; }
    const pageCount = eIdx - sIdx + 1;
    let blob;
    try {
        blob = await buildBitonalPdf(exportPages);
    } catch (e) {
        statusDisplay.innerText = `Export failed: ${e.message || e}. Try a smaller page range (e.g. 10-20 pages at a time).`;
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
        title: "Global ink sensitivity",
        html: `<p>The converter estimates the paper tone around every pixel, removes yellow/uneven background, and keeps pixels that are substantially darker as <strong>black ink</strong>.</p>
               <p>Lower the value to keep faint strokes; raise it to remove stains, show-through and paper texture.</p>`
    },
    presets: {
        title: "Presets",
        html: `<p>Save the current threshold under a name (e.g. a paper type or scan batch) and re-apply it to any page or document with <strong>one click</strong>.</p>`
    },
    zone: {
        title: "Zone ink sensitivity",
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
