/* ==========================================================================
   PRSTNI REDI — traverso · kljunasta flavta · baročna oboa
   Gnano s konfiguracijo: vsak inštrument opiše svojo postavitev (vrstice
   elementov), ostalo (sestavljalnik, shranjevanje, izvoz) je skupno.
   ========================================================================== */

/* ----------------------------------------------------------------------- */
/*  Konfiguracija inštrumentov                                             */
/*                                                                         */
/*  Vsak inštrument = seznam vrstic (od zgoraj navzdol). Vsaka vrstica     */
/*  ima seznam elementov (od leve proti desni).                            */
/*                                                                         */
/*  Element:                                                               */
/*    id     — unikaten ključ (za shranjevanje stanja)                     */
/*    label  — oznaka ob elementu (npr. številka luknje); prazno = brez    */
/*    kind   — 'hole' (krog, privzeto) | 'key' (klapna) | 'square'         */
/*    size   — 'sm' za manjši element (npr. luknja za palec)               */
/*    back   — true: element je "zadaj" (leve strani), stolpec ostane      */
/*             poravnan s pomočjo nevidnega odmika na desni                */
/*                                                                         */
/*  Stanje: 'o' odprto · 'c' zaprto · 'h' polodprto (samo za 'hole').      */
/* ----------------------------------------------------------------------- */

const INSTRUMENTS = {
  traverso: {
    id: 'traverso',
    name: 'Traverso',
    hint: 'click: open → closed → half-open · keyboard: number + / for half-open',
    rows: [
      { els: [{ id: 'h1', label: '1' }] },
      { els: [{ id: 'h2', label: '2' }] },
      { els: [{ id: 'h3', label: '3' }] },
      { gap: true, els: [{ id: 'h4', label: '4' }] },
      { els: [{ id: 'h5', label: '5' }] },
      { els: [{ id: 'h6', label: '6' }] },
      { gap: true, els: [{ id: 'k7', label: '7', kind: 'key' }] },
    ],
  },

  recorder: {
    id: 'recorder',
    name: 'Recorder',
    hint: 'click: open → closed → half-open · thumb (0) is on the back · keyboard: 0–7 + / for half-open',
    rows: [
      // luknja za palec (zadaj, manjša) levo ob luknji 1
      { els: [{ id: 'h0', label: '0', size: 'sm', back: true }, { id: 'h1', label: '1' }] },
      { els: [{ id: 'h2', label: '2' }] },
      { els: [{ id: 'h3', label: '3' }] },
      { gap: true, els: [{ id: 'h4', label: '4' }] },
      { els: [{ id: 'h5', label: '5' }] },
      { els: [{ id: 'h6', label: '6' }] },
      { els: [{ id: 'h7', label: '7' }] },
    ],
  },

  oboe: {
    id: 'oboe',
    name: 'Baroque oboe',
    hint: 'click: open → closed → half-open · bottom: key (square) and small octave hole',
    rows: [
      { els: [{ id: 'h1', label: '1' }] },
      { els: [{ id: 'h2', label: '2' }] },
      { els: [{ id: 'h3', label: '3' }] },
      { gap: true, els: [{ id: 'h4', label: '4' }] },
      { els: [{ id: 'h5', label: '5' }] },
      { els: [{ id: 'h6', label: '6' }] },
      // spodaj: manjši krogec na levi, kvadratna klapna na sredini (rahlo dvignjena);
      // "back" krogec doda neviden odmik na desni, da kvadrat ostane poravnan z glavnim stolpcem
      { gap: true, els: [{ id: 'ho', label: '', size: 'sm', back: true, raise: true }, { id: 'ksq', label: '', kind: 'square', raise: true }] },
    ],
  },
};

/* ----------------------------------------------------------------------- */
/*  Pomožne funkcije za elemente                                           */
/* ----------------------------------------------------------------------- */

// vsi elementi vrstice; če ima "back" element, dodamo neviden odmik na desni,
// da glavni stolpec ostane vodoravno poravnan
function rowEls(row) {
  const els = row.els.slice();
  const back = els.find(e => e.back);
  if (back) {
    els.push({ ...back, id: '__spacer__' + back.id, label: '', spacer: true });
  }
  return els;
}

function elKindClass(el) {
  const kind = el.kind || 'hole';
  let cls = 'el el--' + kind;
  if (el.size === 'sm') cls += ' sm';
  if (el.raise) cls += ' raise';
  return cls;
}

function isHole(el) {
  return (el.kind || 'hole') === 'hole';
}

// naslednje stanje ob kliku
function nextState(el, cur) {
  if (isHole(el)) {
    if (cur === 'o') return 'c';
    if (cur === 'c') return 'h';
    return 'o';
  }
  // klapne / kvadrat: samo odprto ↔ zaprto
  return cur === 'o' ? 'c' : 'o';
}

function stateStyleClass(s) {
  if (s === 'c') return ' is-closed';
  if (s === 'h') return ' is-half';
  return '';
}

// vsi interaktivni elementi inštrumenta v vrstnem redu (za tipkovnico)
function allEls(inst) {
  const out = [];
  inst.rows.forEach(row => row.els.forEach(el => out.push(el)));
  return out;
}

/* ----------------------------------------------------------------------- */
/*  Izris prijema (DOM) — uporabljeno v sestavljalniku in seznamu          */
/* ----------------------------------------------------------------------- */

function buildFingering(inst, state, opts = {}) {
  const { interactive = false, mini = false, onChange = null } = opts;
  const wrap = document.createElement('div');
  wrap.className = 'fing' + (mini ? ' fing--mini' : '');

  inst.rows.forEach(row => {
    const r = document.createElement('div');
    r.className = 'row' + (row.gap ? ' row--gap' : '');

    rowEls(row).forEach(el => {
      const node = document.createElement('div');
      node.className = elKindClass(el);
      if (el.label) node.setAttribute('data-label', el.label);

      if (el.spacer) {
        node.classList.add('spacer');
      } else {
        const s = state[el.id] || 'o';
        node.className += stateStyleClass(s);
        if (interactive) {
          node.classList.add('interactive');
          node.addEventListener('click', () => {
            state[el.id] = nextState(el, state[el.id] || 'o');
            if (onChange) onChange(el);
          });
        }
      }
      r.appendChild(node);
    });

    wrap.appendChild(r);
  });

  return wrap;
}

/* ----------------------------------------------------------------------- */
/*  Shramba (localStorage) — ločen seznam za vsak inštrument               */
/* ----------------------------------------------------------------------- */

const STORAGE_KEY = 'prstni-redi-v2';
const LEGACY_KEY = 'traverso-fingerings';

function loadAll() {
  let data = {};
  try {
    data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    data = {};
  }

  // enkratna migracija starih zapisov (samo traverso, star format)
  if (!data.__migrated) {
    try {
      const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY));
      if (Array.isArray(legacy) && legacy.length) {
        data.traverso = data.traverso || [];
        legacy.forEach(old => {
          const holes = (old.holes || []).map(s => (s === true ? 'c' : s === false ? 'o' : s));
          const state = {};
          holes.forEach((s, i) => { state['h' + (i + 1)] = s; });
          state.k7 = old.key7 ? 'c' : 'o';
          data.traverso.push({ name: old.name, state });
        });
      }
    } catch (e) { /* brez migracije */ }
    data.__migrated = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  return data;
}

function loadEntries(instId) {
  const all = loadAll();
  return all[instId] || [];
}

function saveEntries(instId, entries) {
  const all = loadAll();
  all[instId] = entries;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

/* ----------------------------------------------------------------------- */
/*  Stanje aplikacije                                                      */
/* ----------------------------------------------------------------------- */

let currentInst = null;
let builderState = {};
let lastEl = null; // zadnji spremenjen element (za tipko '/')

const pageTitle = document.getElementById('pageTitle');
const selectScreen = document.getElementById('selectScreen');
const builderScreen = document.getElementById('builderScreen');
const instrumentGrid = document.getElementById('instrumentGrid');
const fluteMount = document.getElementById('fluteMount');
const hintEl = document.getElementById('hint');
const noteName = document.getElementById('noteName');
const addBtn = document.getElementById('addBtn');
const listEl = document.getElementById('list');
const backBtn = document.getElementById('backBtn');
const exportBtn = document.getElementById('exportBtn');

function freshState(inst) {
  const state = {};
  allEls(inst).forEach(el => { state[el.id] = 'o'; });
  return state;
}

/* ----------------------------------------------------------------------- */
/*  Izbirni zaslon                                                         */
/* ----------------------------------------------------------------------- */

function renderSelect() {
  instrumentGrid.innerHTML = '';
  Object.values(INSTRUMENTS).forEach(inst => {
    const card = document.createElement('button');
    card.className = 'instrument-card';
    card.appendChild(buildFingering(inst, freshState(inst), { mini: true }));
    const nm = document.createElement('div');
    nm.className = 'instrument-name';
    nm.textContent = inst.name;
    card.appendChild(nm);
    card.addEventListener('click', () => selectInstrument(inst.id));
    instrumentGrid.appendChild(card);
  });
}

function selectInstrument(id) {
  currentInst = INSTRUMENTS[id];
  builderState = freshState(currentInst);
  lastEl = null;

  pageTitle.textContent = 'Fingering Charts — ' + currentInst.name;
  hintEl.textContent = currentInst.hint || '';
  selectScreen.classList.add('hidden');
  builderScreen.classList.remove('hidden');

  renderBuilder();
  renderList();
}

function showSelect() {
  currentInst = null;
  pageTitle.textContent = 'Fingering Charts';
  builderScreen.classList.add('hidden');
  selectScreen.classList.remove('hidden');
}

/* ----------------------------------------------------------------------- */
/*  Sestavljalnik                                                          */
/* ----------------------------------------------------------------------- */

function renderBuilder() {
  fluteMount.innerHTML = '';
  const fing = buildFingering(currentInst, builderState, {
    interactive: true,
    onChange: (el) => { lastEl = el; renderBuilder(); },
  });
  fluteMount.appendChild(fing);
}

/* ----------------------------------------------------------------------- */
/*  Seznam shranjenih                                                      */
/* ----------------------------------------------------------------------- */

function renderList() {
  const entries = loadEntries(currentInst.id);
  listEl.innerHTML = '';
  if (entries.length === 0) {
    listEl.innerHTML = '<div class="empty">no saved fingerings yet</div>';
    return;
  }
  entries.forEach((entry, idx) => {
    const row = document.createElement('div');
    row.className = 'entry';

    row.appendChild(buildFingering(currentInst, entry.state, { mini: true }));

    const nameEl = document.createElement('div');
    nameEl.className = 'entry-name';
    nameEl.textContent = entry.name;
    row.appendChild(nameEl);

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.textContent = '×';
    delBtn.title = 'delete';
    delBtn.addEventListener('click', () => {
      const cur = loadEntries(currentInst.id);
      cur.splice(idx, 1);
      saveEntries(currentInst.id, cur);
      renderList();
    });
    row.appendChild(delBtn);

    listEl.appendChild(row);
  });
}

/* ----------------------------------------------------------------------- */
/*  Dodajanje / tipkovnica                                                 */
/* ----------------------------------------------------------------------- */

addBtn.addEventListener('click', () => {
  const name = noteName.value.trim();
  if (!name) { noteName.focus(); return; }
  const entries = loadEntries(currentInst.id);
  entries.push({ name, state: { ...builderState } });
  saveEntries(currentInst.id, entries);
  noteName.value = '';
  noteName.focus();
  renderList();
});

noteName.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addBtn.click();
});

backBtn.addEventListener('click', showSelect);

document.addEventListener('keydown', (e) => {
  if (!currentInst) return;
  if (document.activeElement === noteName) return;

  if (e.key === '/') {
    if (lastEl && isHole(lastEl)) {
      builderState[lastEl.id] = 'h';
      renderBuilder();
    }
    return;
  }

  // preslikava številke tipke -> element z enako oznako
  const el = allEls(currentInst).find(x => x.label === e.key);
  if (el) {
    // z tipko preklapljamo odprto ↔ zaprto (polodprto le prek '/')
    builderState[el.id] = builderState[el.id] === 'o' ? 'c' : 'o';
    lastEl = el;
    renderBuilder();
  }
});

/* ----------------------------------------------------------------------- */
/*  Izvoz / tisk                                                           */
/* ----------------------------------------------------------------------- */

function fingeringHTMLExport(inst, state) {
  const rows = inst.rows.map(row => {
    const els = rowEls(row).map(el => {
      let cls = elKindClass(el);
      if (el.spacer) {
        cls += ' spacer';
      } else {
        cls += stateStyleClass(state[el.id] || 'o');
      }
      return `<div class="${cls}"></div>`;
    }).join('');
    return `<div class="row${row.gap ? ' row--gap' : ''}">${els}</div>`;
  }).join('');
  return `<div class="fing">${rows}</div>`;
}

exportBtn.addEventListener('click', () => {
  const entries = loadEntries(currentInst.id);
  if (entries.length === 0) {
    alert('no saved fingerings yet');
    return;
  }
  const tableName = prompt('Chart name:', currentInst.name) || currentInst.name;

  const cards = entries.map(entry => `<div class="card">
      ${fingeringHTMLExport(currentInst, entry.state)}
      <div class="nm">${entry.name}</div>
    </div>`).join('');

  const doc = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>${tableName}</title>
<style>
  body{ font-family: Georgia, serif; padding: 24px; color:#000; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }
  h1{ font-size: 1.3rem; text-align:center; margin-bottom: 24px; }
  .grid{ display:grid; grid-template-columns: repeat(12, 1fr); gap: 10px; }
  .card{ display:flex; flex-direction:column; align-items:center; min-width:0; }

  .fing{ display:flex; flex-direction:column; align-items:center; gap:6px;
         border:1px solid #000; border-radius:20px; padding:10px 8px;
         --hole:14px; --hole-sm:10px; --key-w:8px; --key-h:14px; --sq:12px; }
  .row{ display:flex; align-items:center; justify-content:center; gap:6px; }
  .row--gap{ margin-top:8px; }

  .el{ box-sizing:border-box; border:1.5px solid #000; background:transparent; }
  .el--hole{ width:var(--hole); height:var(--hole); border-radius:50%; }
  .el--hole.sm{ width:var(--hole-sm); height:var(--hole-sm); }
  .el--key{ width:var(--key-w); height:var(--key-h); border-radius:2px; }
  .el--square{ width:var(--sq); height:var(--sq); border-radius:2px; }
  .el.is-closed{ background:#000; }
  .el.is-half{ background: linear-gradient(90deg, #000 50%, transparent 50%); }
  .el.spacer{ border:none; visibility:hidden; }
  .el.raise{ transform:translateY(-8px); }

  .nm{ margin-top:6px; font-size:0.75rem; text-align:center; word-break:break-word; }
  @media print{ body{ -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head>
<body>
  <h1>${tableName}</h1>
  <div class="grid">${cards}</div>
  <scr` + `ipt>window.onload = () => window.print();</scr` + `ipt>
</body></html>`;

  const win = window.open('', '_blank');
  if (!win) {
    alert('The browser blocked the pop-up window. Allow pop-ups for this page and try again.');
    return;
  }
  win.document.write(doc);
  win.document.close();
});

/* ----------------------------------------------------------------------- */
/*  Zagon                                                                  */
/* ----------------------------------------------------------------------- */

renderSelect();
