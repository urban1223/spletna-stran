const STORAGE_KEY = 'traverso-fingerings';

// stanje luknje: 'o' odprto, 'c' zaprto, 'h' polodprto
let holes = ['o','o','o','o','o','o'];
let key7 = false;
let lastHole = null; // za tipkovnico: zadnja pritisnjena luknja (za '/')

const holesRow = document.getElementById('holesRow');
const keyflap = document.getElementById('keyflap');
const noteName = document.getElementById('noteName');
const addBtn = document.getElementById('addBtn');
const listEl = document.getElementById('list');

function nextState(s){
  if(s === 'o') return 'c';
  if(s === 'c') return 'h';
  return 'o';
}

function stateClass(s){
  if(s === 'c') return ' closed';
  if(s === 'h') return ' half';
  return '';
}

function renderHoles(){
  holesRow.innerHTML = '';
  holes.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'hole' + stateClass(s) + (i === 3 ? ' gap-before' : '');
    div.setAttribute('data-n', i+1);
    div.addEventListener('click', () => {
      holes[i] = nextState(holes[i]);
      lastHole = i;
      renderHoles();
    });
    holesRow.appendChild(div);
  });
}

keyflap.addEventListener('click', () => {
  key7 = !key7;
  keyflap.classList.toggle('closed', key7);
});

function loadEntries(){
  try{
    const entries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    // pretvorba starih zapisov (true/false) v nov format ('o'/'c'/'h')
    entries.forEach(entry => {
      entry.holes = entry.holes.map(s => {
        if(s === true) return 'c';
        if(s === false) return 'o';
        return s;
      });
    });
    return entries;
  }catch(e){
    return [];
  }
}

function saveEntries(entries){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function buildMiniHoles(entry){
  const miniHoles = document.createElement('div');
  miniHoles.className = 'mini-holes';
  entry.holes.forEach((s, i) => {
    const h = document.createElement('div');
    h.className = 'mini-hole' + stateClass(s) + (i === 3 ? ' gap-before' : '');
    miniHoles.appendChild(h);
  });
  const miniKey = document.createElement('div');
  miniKey.className = 'mini-key' + (entry.key7 ? ' closed' : '');
  miniHoles.appendChild(miniKey);
  return miniHoles;
}

function renderList(){
  const entries = loadEntries();
  listEl.innerHTML = '';
  if(entries.length === 0){
    listEl.innerHTML = '<div class="empty">še ni shranjenih prstnih redov</div>';
    return;
  }
  entries.forEach((entry, idx) => {
    const row = document.createElement('div');
    row.className = 'entry';

    row.appendChild(buildMiniHoles(entry));

    const nameEl = document.createElement('div');
    nameEl.className = 'entry-name';
    nameEl.textContent = entry.name;
    row.appendChild(nameEl);

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.textContent = '×';
    delBtn.title = 'izbriši';
    delBtn.addEventListener('click', () => {
      const cur = loadEntries();
      cur.splice(idx, 1);
      saveEntries(cur);
      renderList();
    });
    row.appendChild(delBtn);

    listEl.appendChild(row);
  });
}

addBtn.addEventListener('click', () => {
  const name = noteName.value.trim();
  if(!name){
    noteName.focus();
    return;
  }
  const entries = loadEntries();
  entries.push({ name, holes: [...holes], key7 });
  saveEntries(entries);
  noteName.value = '';
  noteName.focus();
  renderList();
});

noteName.addEventListener('keydown', (e) => {
  if(e.key === 'Enter') addBtn.click();
});

document.addEventListener('keydown', (e) => {
  if(document.activeElement === noteName) return;
  if(e.key >= '1' && e.key <= '6'){
    const i = parseInt(e.key, 10) - 1;
    holes[i] = holes[i] === 'o' ? 'c' : 'o';
    lastHole = i;
    renderHoles();
  } else if(e.key === '7'){
    key7 = !key7;
    keyflap.classList.toggle('closed', key7);
    lastHole = null;
  } else if(e.key === '/'){
    if(lastHole !== null){
      holes[lastHole] = 'h';
      renderHoles();
    }
  }
});

const exportBtn = document.getElementById('exportBtn');
exportBtn.addEventListener('click', () => {
  const entries = loadEntries();
  if(entries.length === 0){
    alert('še ni shranjenih prstnih redov');
    return;
  }
  const tableName = prompt('Ime tabele:', 'traverso') || 'traverso';
  const cards = entries.map(entry => {
    const holesHtml = entry.holes.map((s, i) => {
      const gap = i === 3 ? ' style="margin-top:10px"' : '';
      const cls = s === 'c' ? ' full' : (s === 'h' ? ' half' : '');
      return `<div class="h${cls}"${gap}></div>`;
    }).join('');
    const keyHtml = `<div class="k${entry.key7 ? ' c' : ''}"></div>`;
    return `<div class="card">
      <div class="holes">${holesHtml}${keyHtml}</div>
      <div class="nm">${entry.name}</div>
    </div>`;
  }).join('');

  const doc = `<!DOCTYPE html>
<html lang="sl"><head><meta charset="UTF-8">
<title>${tableName}</title>
<style>
  body{ font-family: Georgia, serif; padding: 24px; color:#000; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }
  h1{ font-size: 1.3rem; text-align:center; margin-bottom: 24px; }
  .grid{ display:grid; grid-template-columns: repeat(12, 1fr); gap: 10px; }
  .card{ display:flex; flex-direction:column; align-items:center; min-width:0; }
  .holes{ display:flex; flex-direction:column; align-items:center; gap:6px; border:1px solid #000; border-radius:20px; padding:10px 6px; }
  .h{ width:14px; height:14px; border-radius:50%; border:1.5px solid #000; }
  .h.full{ background:#000; }
  .h.half{ background: linear-gradient(90deg, #000 50%, transparent 50%); }
  .k{ width:8px; height:14px; border-radius:2px; border:1.5px solid #000; margin-top:4px; }
  .k.c{ background:#000; }
  .nm{ margin-top:6px; font-size:0.75rem; text-align:center; word-break:break-word; }
  @media print{ body{ -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head>
<body>
  <h1>${tableName}</h1>
  <div class="grid">${cards}</div>
  <scr` + `ipt>window.onload = () => window.print();</scr` + `ipt>
</body></html>`;

  const win = window.open('', '_blank');
  if(!win){
    alert('Brskalnik je blokiral pojavno okno. Dovoli pojavna okna za to stran in poskusi znova.');
    return;
  }
  win.document.write(doc);
  win.document.close();
});

renderHoles();
renderList();
