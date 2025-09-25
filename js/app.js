const levelsBar = document.getElementById('levels');
const categoryList = document.getElementById('categoryList');
const listView = document.getElementById('listView');
const flashView = document.getElementById('flashView');
const mcqView = document.getElementById('mcqView');
const searchInput = document.getElementById('searchInput');
const currentPath = document.getElementById('currentPath');
const visibleCountEl = document.getElementById('visibleCount');
const totalCountEl = document.getElementById('totalCount');
const togglePLBtn = document.getElementById('togglePL');
const shuffleBtn = document.getElementById('shuffle');
const progressBar = document.getElementById('progressBar');
const filterAllBtn = document.getElementById('filterAll');
const filterUnknownBtn = document.getElementById('filterUnknown');
const filterKnownBtn = document.getElementById('filterKnown');
const filterWithExampleBtn = document.getElementById('filterWithExample');
const statTime = document.getElementById('statTime');
const statSeen = document.getElementById('statSeen');
const statCorrect = document.getElementById('statCorrect');
const statAcc = document.getElementById('statAcc');
const sessionStartBtn = document.getElementById('sessionStart');
const sessionPauseBtn = document.getElementById('sessionPause');
const sessionEndBtn = document.getElementById('sessionEnd');
const flashWord = document.getElementById('flashWord');
const flashTrans = document.getElementById('flashTrans');
const flashShow = document.getElementById('flashShow');
const flashNext = document.getElementById('flashNext');
const smAgain = document.getElementById('smAgain');
const smHard  = document.getElementById('smHard');
const smGood  = document.getElementById('smGood');
const smEasy  = document.getElementById('smEasy');
const flashFs = document.getElementById('flashFs');
const mcqFs = document.getElementById('mcqFs');
const mcqQuestion = document.getElementById('mcqQuestion');
const mcqOptions = document.getElementById('mcqOptions');
const mcqNext = document.getElementById('mcqNext');
const viewListBtn = document.getElementById('viewList');
const viewFlashBtn = document.getElementById('viewFlash');
const viewMCQBtn = document.getElementById('viewMCQ');
const exercisesBtn = document.getElementById('exercisesTab');
const exercisesSection = document.getElementById('exercisesSection');
const studySection = document.getElementById('studySection');
const backToStudy = document.getElementById('backToStudy');
const exerciseControls = document.getElementById('exerciseControls');
const exerciseContainer = document.getElementById('exerciseContainer');
const exerciseVisibleEl = document.getElementById('exerciseVisible');

let data = {}; // { level: { category: [ {en, pl}, ... ] } }
let samples = {}; // { level: { category: { enLower: { enSample, plSample } } } }

let currentLevel = 'A2';
let currentCategory = null;
let showPL = true;
let currentView = 'list';
let filterMode = 'all'; // 'all' | 'unknown' | 'known'
let filterExamplesOnly = false;

// Exercises state
let exerciseCatFilter = '__ALL__';
let exerciseQuery = '';
let exerciseShowPL = true;

// Sesja
let sessionTimer = null, sessionStart = null, sessionElapsed = 0;
let seenCount = 0, correctCount = 0;

// Fiszki (SM-2 light)
let flashIdx = 0; let flashItems = [];

// MCQ
let mcqPool=[]; let mcqIdx=0; let mcqCorrect='';

// LIST VIEW ordering
let listOrder = [];
function rebuildListOrder(){ const n = getFilteredItems().length; listOrder = Array.from({length:n}, (_,i)=>i); shuffleArray(listOrder); }

function resetUI() {
  levelsBar.innerHTML = '';
  ['A2','B1','B2'].forEach(lvl => {
    const btn = document.createElement('button');
    btn.className = 'level-btn';
    btn.textContent = lvl;
    btn.addEventListener('click', () => {
      currentLevel = lvl;
      document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCategories();
      selectFirstCategory();
      if (!exercisesSection.classList.contains('d-none')) renderExercises();
    });
    levelsBar.appendChild(btn);
  });
  const first = [...levelsBar.querySelectorAll('.level-btn')].find(b => b.textContent === currentLevel) || levelsBar.firstChild;
  if (first) first.classList.add('active');
  [filterAllBtn, filterUnknownBtn, filterKnownBtn, filterWithExampleBtn].forEach(b=>b.classList.remove('active'));
  filterAllBtn.classList.add('active');
  if (filterExamplesOnly) filterWithExampleBtn.classList.add('active');
}

function parseCSV(text){
  const lines = text.split(/\r?\n/).filter(l => l.trim().length);
  if (!lines.length) return {};
  const header = lines[0].trim();
  const expected = 'Poziom;Kategoria;English;Polski';
  let startIdx = 0;
  if (header.toLowerCase().replace(/\s+/g,'') === expected.toLowerCase().replace(/\s+/g,'')) startIdx = 1;
  const store = {};
  for (let i=startIdx;i<lines.length;i++){
    const row = safeSplit(lines[i]);
    if (row.length < 4) continue;
    const [lvl, cat, en, pl] = row.map(s=>s.trim());
    if (!['A2','B1','B2'].includes(lvl)) continue;
    store[lvl] = store[lvl] || {};
    store[lvl][cat] = store[lvl][cat] || [];
    store[lvl][cat].push({en,pl});
  }
  return store;
}

function parseSamples(text){
  const lines = text.split(/\r?\n/).filter(l => l.trim().length);
  if (!lines.length) return {};
  const header = lines[0].trim();
  let startIdx = 0;
  if (header.toLowerCase().includes('english sample')) startIdx = 1;
  const store = {};
  for (let i=startIdx; i<lines.length; i++){
    const row = safeSplit(lines[i]);
    if (row.length < 6) continue;
    const [lvl, cat, en, pl, enSample, plSample] = row.map(s=>s.trim());
    if (!['A2','B1','B2'].includes(lvl)) continue;
    const key = en.toLowerCase();
    store[lvl] = store[lvl] || {};
    store[lvl][cat] = store[lvl][cat] || {};
    store[lvl][cat][key] = { enSample, plSample };
  }
  return store;
}

function safeSplit(line){ const out=[]; let cur=''; let quoted=false; for(let i=0;i<line.length;i++){ const ch=line[i]; if(ch==='"'){ if(quoted && line[i+1]==='"'){ cur+='"'; i++; } else { quoted=!quoted; } } else if(ch===';' && !quoted){ out.push(cur); cur=''; } else { cur+=ch; } } out.push(cur); return out; }

function renderCategories(){
  categoryList.innerHTML='';
  const cats = Object.keys(data[currentLevel] || {}).sort((a,b)=>a.localeCompare(b,'pl'));
  const query = searchInput.value.trim().toLowerCase();
  const filtered = cats.filter(c=>c.toLowerCase().includes(query));
  filtered.forEach(cat=>{
    const count = data[currentLevel][cat]?.length || 0;
    const li = document.createElement('li'); li.className='cat-item';
    const btn = document.createElement('button'); btn.className='cat-btn';
    const learned = getLearnedCount(currentLevel, cat);
    const pct = count ? Math.round(learned/count*100) : 0;
    btn.innerHTML = `<div class="d-flex justify-content-between align-items-center"><div><strong>${cat}</strong> <span class="count">(${count})</span></div><div class="subtle small">${pct}%</div></div>`;
    btn.addEventListener('click', ()=>{ currentCategory = cat; resetSessionStats(); rebuildListOrder(); showStudy(); renderView(); });
    li.appendChild(btn); categoryList.appendChild(li);
  });
}

function renderCounts(){
  const total=(data[currentLevel]?.[currentCategory]||[]).length;
  const visible=getFilteredItems().length;
  totalCountEl.textContent = total;
  visibleCountEl.textContent = visible;
}

function renderProgress(){ const items=getFilteredItems(); const total=items.length; const learned=items.filter(({en})=>isKnown(currentLevel,currentCategory,en)).length; const pct = total? Math.round(learned/total*100) : 0; progressBar.style.width=pct+'%'; progressBar.textContent=pct+'%'; }

function getSample(level, category, en){ const m = samples[level]?.[category]; if (!m) return null; return m[en.trim().toLowerCase()] || null; }

// ===== LIST VIEW =====
function renderList(){
  listView.innerHTML='';
  const items = getFilteredItems();
  if (!listOrder || listOrder.length !== items.length){ rebuildListOrder(); }
  for (const idx of listOrder){
    const {en, pl} = items[idx];
    const card = document.createElement('div'); card.className='word-card';
    const left = document.createElement('div');
    const id = storageId(currentLevel,currentCategory,en);
    const known = !!localStorage.getItem(id);

    left.innerHTML = `<div class="word-en">${escapeHTML(en)}</div>`+
                     `<div class="word-pl" style="display:${showPL?'block':'none'}">${escapeHTML(pl)}</div>`;

    const smp = getSample(currentLevel, currentCategory, en);
    if (smp){
      const ex = document.createElement('div'); ex.className = 'example-block';
      ex.innerHTML = `<div class="example-en">"${escapeHTML(smp.enSample)}"</div>`+
                     `<div class="example-pl" style="display:${showPL?'block':'none'}">"${escapeHTML(smp.plSample)}"</div>`;
      left.appendChild(ex);
    }

    const right = document.createElement('div'); right.className='d-flex gap-2 align-items-center';
    const toggle = document.createElement('button'); toggle.className='pill'; toggle.innerHTML = showPL? '<i class="bi bi-eye-slash me-1"></i>Ukryj PL' : '<i class="bi bi-eye me-1"></i>Pokaż PL';
    toggle.addEventListener('click', ()=>{ const plEl=left.querySelector('.word-pl'); const plEx=left.querySelector('.example-pl'); const vis = !plEl || plEl.style.display!=='none'; if(plEl) plEl.style.display = vis? 'none':'block'; if(plEx) plEx.style.display = vis? 'none':'block'; toggle.innerHTML = vis? '<i class="bi bi-eye me-1"></i>Pokaż PL' : '<i class="bi bi-eye-slash me-1"></i>Ukryj PL'; });
    const mark = document.createElement('button'); mark.className='pill'; mark.innerHTML = known? '<i class="bi bi-check2-circle me-1"></i>Zapamiętane' : '<i class="bi bi-circle me-1"></i>Uczone';
    mark.addEventListener('click', ()=>{ const nowKnown=!localStorage.getItem(id); if(nowKnown) localStorage.setItem(id,'1'); else localStorage.removeItem(id); renderProgress(); mark.innerHTML = nowKnown? '<i class="bi bi-check2-circle me-1"></i>Zapamiętane' : '<i class="bi bi-circle me-1"></i>Uczone'; });
    right.appendChild(toggle); right.appendChild(mark);
    card.appendChild(left); card.appendChild(right);
    card.addEventListener('dblclick', ()=> navigator.clipboard?.writeText(`${en} — ${pl}`));
    listView.appendChild(card);
  }
}

// ===== FLASHCARDS (SM‑2) =====
function sm2GetMeta(level,cat,en){ const raw=localStorage.getItem(`voc:meta:${level}:${cat}:${en}`); if(!raw) return {ef:2.5,reps:0,interval:0,due:todayStr()}; try{ const o=JSON.parse(raw); return { ef:o.ef??2.5, reps:o.reps??0, interval:o.interval??0, due:o.due??todayStr() }; }catch{ return {ef:2.5,reps:0,interval:0,due:todayStr()}; }}
function sm2SaveMeta(level,cat,en,meta){ localStorage.setItem(`voc:meta:${level}:${cat}:${en}`, JSON.stringify(meta)); }
function todayStr(){ const d=new Date(); d.setHours(0,0,0,0); return d.toISOString().slice(0,10); }
function addDays(dateStr,days){ const d=new Date(dateStr); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10); }
function sm2Review(q){ const cur=flashItems[flashIdx % flashItems.length]; if(!cur) return; const id=storageId(currentLevel,currentCategory,cur.en); let {ef,reps,interval,due}=sm2GetMeta(currentLevel,currentCategory,cur.en); ef=Math.max(1.3, ef + (0.1 - (5-q)*(0.08 + (5-q)*0.02))); if(q<3){ reps=0; interval=1; } else { reps=reps+1; if(reps===1) interval=1; else if(reps===2) interval=6; else interval=Math.round(interval*ef); } due=addDays(todayStr(), interval); sm2SaveMeta(currentLevel,currentCategory,cur.en,{ef,reps,interval,due}); if(q>=4) localStorage.setItem(id,'1'); seenCount++; if(q>=4) correctCount++; updateStats(); }

// ===== MCQ =====
function startFlash(){ const all=getFilteredItems(); const today=todayStr(); const due=all.filter(({en})=> sm2GetMeta(currentLevel,currentCategory,en).due <= today ); flashItems = (due.length? due : all).slice(); shuffleArray(flashItems); flashIdx=0; flashTrans.style.display = showPL? 'block':'none'; showFlash(); }
function showFlash(){ const cur=flashItems[flashIdx % (flashItems.length||1)]; if(!cur){ flashWord.textContent='(brak fiszek)'; flashTrans.textContent=''; return; } flashWord.textContent=cur.en; flashTrans.textContent=cur.pl; }

function startMCQ(){ mcqPool = getFilteredItems(); shuffleArray(mcqPool); mcqIdx=0; renderMCQ(); }
function renderMCQ(){ mcqOptions.innerHTML=''; const item=mcqPool[mcqIdx % (mcqPool.length||1)]; if(!item){ mcqQuestion.textContent='(brak pytań)'; return; } const {en,pl}=item; mcqQuestion.textContent=en; mcqCorrect=pl; const distractors=pickDistractors(pl, mcqPool, 3); const options=[pl, ...distractors]; shuffleArray(options); options.forEach((opt,i)=>{ const btn=document.createElement('button'); btn.className='mcq-btn'; btn.textContent=opt; btn.dataset.index = String(i+1); btn.addEventListener('click', ()=>{ if(btn.dataset.answered) return; btn.dataset.answered='1'; seenCount++; if(opt===mcqCorrect){ btn.classList.add('correct'); correctCount++; markKnown(en); } else { btn.classList.add('wrong'); } [...mcqOptions.children].forEach(b=>{ if(b.textContent===mcqCorrect) b.classList.add('correct'); }); updateStats(); }); mcqOptions.appendChild(btn); }); }

function selectFirstCategory(){ const cats=Object.keys(data[currentLevel]||{}); currentCategory=cats[0]||null; rebuildListOrder(); renderView(); }

function renderView(){ renderCategories(); if(!currentCategory){ currentPath.textContent='Wybierz kategorię'; visibleCountEl.textContent='0'; totalCountEl.textContent='0'; return; } const total=(data[currentLevel]?.[currentCategory]||[]).length; currentPath.textContent=`${currentLevel} › ${currentCategory} • ${total} słów`; renderCounts(); renderProgress(); showView(currentView); }

function updateGlobalControlsVisibility(){ const showListControls = currentView === 'list'; togglePLBtn.style.display = showListControls ? '' : 'none'; shuffleBtn.style.display = showListControls ? '' : 'none'; filterWithExampleBtn.style.display = showListControls ? '' : 'none'; }

function showView(view){ currentView=view; document.querySelectorAll('.view-tabs .pill').forEach(b=>b.classList.remove('active')); if(view==='list'){ viewListBtn.classList.add('active'); listView.classList.remove('d-none'); flashView.classList.add('d-none'); mcqView.classList.add('d-none'); renderList(); } if(view==='flash'){ viewFlashBtn.classList.add('active'); listView.classList.add('d-none'); flashView.classList.remove('d-none'); mcqView.classList.add('d-none'); startFlash(); } if(view==='mcq'){ viewMCQBtn.classList.add('active'); listView.classList.add('d-none'); flashView.classList.add('d-none'); mcqView.classList.remove('d-none'); startMCQ(); } updateGlobalControlsVisibility(); }

function showExercises(){ studySection.classList.add('d-none'); exercisesSection.classList.remove('d-none'); renderExercises(); }
function showStudy(){ exercisesSection.classList.add('d-none'); studySection.classList.remove('d-none'); }

function shuffleArray(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } }
function pickDistractors(correct,items,n){ const pool=items.map(x=>x.pl).filter(p=>p!==correct); shuffleArray(pool); return pool.slice(0,n); }

function storageId(level,category,en){ return `voc:${level}:${category}:${en}`; }
function markKnown(en){ localStorage.setItem(storageId(currentLevel,currentCategory,en),'1'); renderProgress(); }
function isKnown(level,category,en){ return !!localStorage.getItem(storageId(level,category,en)); }
function getLearnedCount(level,category){ const items=(data[level]?.[category]||[]); let c=0; for(const {en} of items){ if(isKnown(level,category,en)) c++; } return c; }
function getFilteredItems(){ const items=(data[currentLevel]?.[currentCategory]||[]).slice(); return items.filter(({en})=>{ const known=isKnown(currentLevel,currentCategory,en); if(filterExamplesOnly && !getSample(currentLevel, currentCategory, en)) return false; if(filterMode==='known') return known; if(filterMode==='unknown') return !known; return true; }); }
function escapeHTML(s){ return s.replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }

function resetSessionStats(){ clearInterval(sessionTimer); sessionTimer=null; sessionStart=null; sessionElapsed=0; seenCount=0; correctCount=0; updateStats(); }
function updateStats(){ statSeen.textContent=seenCount; statCorrect.textContent=correctCount; const acc=seenCount? Math.round(correctCount/seenCount*100):0; statAcc.textContent=acc+'%'; }
function tick(){ const now=Date.now(); const elapsed=sessionElapsed + (sessionStart? (now-sessionStart):0); statTime.textContent=formatTime(elapsed); }
function formatTime(ms){ const s=Math.floor(ms/1000); const m=Math.floor(s/60); const r=s%60; return `${m}:${String(r).padStart(2,'0')}`; }

sessionStartBtn.addEventListener('click', ()=>{ if(!sessionStart){ sessionStart=Date.now(); sessionTimer=setInterval(tick,250);} });
sessionPauseBtn.addEventListener('click', ()=>{ if(sessionStart){ sessionElapsed += (Date.now()-sessionStart); sessionStart=null; clearInterval(sessionTimer); sessionTimer=null; tick(); } });
sessionEndBtn.addEventListener('click', ()=>{ if(sessionStart){ sessionElapsed += (Date.now()-sessionStart); } sessionStart=null; clearInterval(sessionTimer); sessionTimer=null; tick(); saveSessionLog(); resetSessionStats(); });
function saveSessionLog(){ const log=JSON.parse(localStorage.getItem('voc:sessions')||'[]'); const ts=new Date().toISOString(); log.push({ ts, level:currentLevel, category:currentCategory, durationMs:sessionElapsed, seen:seenCount, correct:correctCount }); localStorage.setItem('voc:sessions', JSON.stringify(log)); }

// Filtry
filterAllBtn.addEventListener('click', ()=> setFilter('all'));
filterUnknownBtn.addEventListener('click', ()=> setFilter('unknown'));
filterKnownBtn.addEventListener('click', ()=> setFilter('known'));
filterWithExampleBtn.addEventListener('click', ()=>{ filterExamplesOnly = !filterExamplesOnly; filterWithExampleBtn.classList.toggle('active', filterExamplesOnly); renderCounts(); renderView(); });
function setFilter(m){ filterMode=m; [filterAllBtn,filterUnknownBtn,filterKnownBtn].forEach(b=>b.classList.remove('active')); if(m==='all') filterAllBtn.classList.add('active'); if(m==='unknown') filterUnknownBtn.classList.add('active'); if(m==='known') filterKnownBtn.classList.add('active'); renderCounts(); rebuildListOrder(); renderView(); }

// View tabs
viewListBtn.addEventListener('click', ()=> showView('list'));
viewFlashBtn.addEventListener('click', ()=> showView('flash'));
viewMCQBtn.addEventListener('click', ()=> showView('mcq'));

// MCQ next handler
mcqNext.addEventListener('click', ()=>{ if(!mcqPool || !mcqPool.length) return; mcqIdx = (mcqIdx+1) % mcqPool.length; renderMCQ(); });

// Global controls
togglePLBtn.addEventListener('click', ()=>{ showPL = !showPL; togglePLBtn.classList.toggle('active', showPL); togglePLBtn.innerHTML = showPL ? '<i class="bi bi-translate me-1"></i>Ukryj tłumaczenia' : '<i class="bi bi-translate me-1"></i>Pokaż tłumaczenia'; if(currentView==='list') renderList(); if(currentView==='flash'){ flashTrans.style.display = showPL ? 'block':'none'; } });
shuffleBtn.addEventListener('click', ()=>{ if(currentView==='list'){ rebuildListOrder(); renderList(); } if(currentView==='flash'){ startFlash(); } if(currentView==='mcq'){ startMCQ(); } });

// Flash buttons
flashShow.addEventListener('click', ()=>{ flashTrans.style.display = (flashTrans.style.display==='none'?'block':'none'); });
smAgain.addEventListener('click', ()=>{ sm2Review(1); nextFlash(); renderCounts(); });
smHard .addEventListener('click', ()=>{ sm2Review(3); nextFlash(); renderCounts(); });
smGood .addEventListener('click', ()=>{ sm2Review(4); nextFlash(); renderCounts(); });
smEasy .addEventListener('click', ()=>{ sm2Review(5); nextFlash(); renderCounts(); });
flashNext.addEventListener('click', ()=>{ nextFlash(); renderCounts(); });
function nextFlash(){ flashIdx = (flashIdx+1) % (flashItems.length || 1); showFlash(); }

// Keyboard shortcuts
document.addEventListener('keydown', (e)=>{
  if (!document.body.contains(studySection)) return;
  if (!exercisesSection.classList.contains('d-none')){
    // exercises shortcuts (t to toggle PL)
    if (e.key.toLowerCase()==='t'){ exerciseShowPL = !exerciseShowPL; updateExercisePL(); }
    return;
  }
  if (currentView==='flash'){
    if (e.key==='ArrowRight' || e.key==='Enter'){ e.preventDefault(); flashNext.click(); }
    else if (e.key==='ArrowLeft'){ e.preventDefault(); flashShow.click(); }
    else if (e.key===' '){ e.preventDefault(); flashShow.click(); }
    else if (e.key==='1'){ e.preventDefault(); smAgain.click(); }
    else if (e.key==='2'){ e.preventDefault(); smHard.click(); }
    else if (e.key==='3'){ e.preventDefault(); smGood.click(); }
    else if (e.key==='4'){ e.preventDefault(); smEasy.click(); }
    else if (e.key.toLowerCase()==='f'){ e.preventDefault(); toggleFullscreen(document.getElementById('flashCard')); }
  } else if (currentView==='mcq'){
    if (e.key==='ArrowRight' || e.key==='Enter'){ e.preventDefault(); mcqNext.click(); }
    else if (['1','2','3','4'].includes(e.key)){
      const btn = [...mcqOptions.children].find(b=> b.dataset.index===e.key);
      if (btn) { e.preventDefault(); btn.click(); }
    } else if (e.key.toLowerCase()==='f'){ e.preventDefault(); toggleFullscreen(document.getElementById('mcqCard')); }
  }
});

// Fullscreen buttons
flashFs.addEventListener('click', ()=> toggleFullscreen(document.getElementById('flashCard')));
mcqFs.addEventListener('click', ()=> toggleFullscreen(document.getElementById('mcqCard')));

function toggleFullscreen(el){
  if (!document.fullscreenElement){ el.requestFullscreen?.(); el.classList.add('fs-active'); }
  else { document.exitFullscreen?.(); document.querySelectorAll('.fs-active').forEach(n=>n.classList.remove('fs-active')); }
}

document.addEventListener('fullscreenchange', ()=>{
  const inFs = !!document.fullscreenElement;
  flashFs.innerHTML = inFs ? '<i class="bi bi-fullscreen-exit"></i> Wyjdź' : '<i class="bi bi-arrows-fullscreen"></i> Pełny ekran';
  mcqFs.innerHTML   = inFs ? '<i class="bi bi-fullscreen-exit"></i> Wyjdź' : '<i class="bi bi-arrows-fullscreen"></i> Pełny ekran';
});

// Search
searchInput.addEventListener('input', ()=> renderCategories());

// Exercises
exercisesBtn.addEventListener('click', showExercises);
backToStudy.addEventListener('click', showStudy);

function buildExerciseControls(){
  exerciseControls.innerHTML='';
  // Category select
  const sel = document.createElement('select');
  sel.className = 'form-select form-select-sm';
  sel.style.maxWidth = '240px';
  sel.style.background = 'rgba(255,255,255,.04)';
  sel.style.border = '1px solid var(--panel-border)';
  sel.style.borderRadius = '12px';
  sel.style.color = 'var(--text)';
  sel.appendChild(new Option('Wszystkie kategorie', '__ALL__'));
  const cats = Object.keys(samples[currentLevel]||{}).sort((a,b)=>a.localeCompare(b,'pl'));
  cats.forEach(cat=> sel.appendChild(new Option(cat, cat)));
  if (!cats.includes(exerciseCatFilter)) exerciseCatFilter='__ALL__';
  sel.value = exerciseCatFilter;
  sel.addEventListener('change', ()=>{ exerciseCatFilter = sel.value; renderExercises(); });
  exerciseControls.appendChild(sel);

  // Search box
  const wrap = document.createElement('div'); wrap.className='position-relative'; wrap.style.minWidth='260px';
  const icon = document.createElement('i'); icon.className='bi bi-search'; icon.style.position='absolute'; icon.style.left='10px'; icon.style.top='8px'; icon.style.color='var(--muted)'; wrap.appendChild(icon);
  const inp = document.createElement('input'); inp.id='exerciseSearch'; inp.className='form-control form-control-sm'; inp.placeholder='Szukaj w ćwiczeniach…'; inp.style.paddingLeft='32px'; inp.style.background='rgba(255,255,255,.04)'; inp.style.border='1px solid var(--panel-border)'; inp.style.color='var(--text)';
  inp.value = exerciseQuery; inp.addEventListener('input', ()=>{ exerciseQuery = inp.value.trim().toLowerCase(); renderExercises(); });
  wrap.appendChild(inp); exerciseControls.appendChild(wrap);

  // Toggle PL
  const btn = document.createElement('button'); btn.className='pill'; btn.id='exerciseTogglePL'; btn.innerHTML = exerciseShowPL ? '<i class="bi bi-translate me-1"></i>Ukryj tłumaczenia' : '<i class="bi bi-translate me-1"></i>Pokaż tłumaczenia';
  btn.addEventListener('click', ()=>{ exerciseShowPL=!exerciseShowPL; btn.innerHTML = exerciseShowPL ? '<i class="bi bi-translate me-1"></i>Ukryj tłumaczenia' : '<i class="bi bi-translate me-1"></i>Pokaż tłumaczenia'; updateExercisePL(); });
  exerciseControls.appendChild(btn);
}

function updateExercisePL(){ document.querySelectorAll('#exerciseContainer .example-pl').forEach(el=> el.style.display = exerciseShowPL ? 'block':'none'); }

function renderExercises(){
  buildExerciseControls();
  const container = document.getElementById('exerciseContainer');
  container.innerHTML='';
  const catsAll = Object.keys(samples[currentLevel]||{}).sort((a,b)=>a.localeCompare(b,'pl'));
  const catsToShow = exerciseCatFilter==='__ALL__' ? catsAll : catsAll.filter(c=>c===exerciseCatFilter);
  let shown = 0;
  if (!catsToShow.length){ container.innerHTML = '<div class="subtle">Brak ćwiczeń dla wybranego poziomu.</div>'; exerciseVisibleEl.textContent='0'; return; }
  catsToShow.forEach(cat=>{
    const entries = samples[currentLevel][cat] ? Object.entries(samples[currentLevel][cat]) : [];
    const filtered = entries.filter(([enLower, obj])=>{
      if (!exerciseQuery) return true;
      const hay = `${enLower} ${obj.enSample} ${obj.plSample}`.toLowerCase();
      return hay.includes(exerciseQuery);
    });
    if (!filtered.length) return;
    const header = document.createElement('h5'); header.className='mt-3'; header.textContent = `${currentLevel} • ${cat}`; container.appendChild(header);
    filtered.forEach(([enLower, obj])=>{
      const card=document.createElement('div'); card.className='word-card my-2';
      card.innerHTML = `<div><div class='word-en'>${escapeHTML(enLower)}</div><div class='example-en'>"${escapeHTML(obj.enSample)}"</div><div class='example-pl'>"${escapeHTML(obj.plSample)}"</div></div>`;
      container.appendChild(card); shown++;
    });
  });
  exerciseVisibleEl.textContent = String(shown);
  updateExercisePL();
}

// Load words.txt and samples.txt
Promise.all([
  fetch('data/words.txt').then(r=> r.ok ? r.text() : Promise.reject(r.status)),
  fetch('data/samples.txt').then(r=> r.ok ? r.text() : Promise.resolve('')) // samples optional
])
.then(([wordsTxt, samplesTxt])=>{
  data = parseCSV(wordsTxt);
  samples = samplesTxt ? parseSamples(samplesTxt) : {};
  currentLevel = ['A2','B1','B2'].find(l=>data[l]) || 'A2';
  resetUI();
  renderCategories();
  selectFirstCategory();
  updateGlobalControlsVisibility();
  if (currentView==='list') renderList();
})
.catch(err=>{ currentPath.textContent='Błąd: nie udało się wczytać plików.'; console.error(err); });