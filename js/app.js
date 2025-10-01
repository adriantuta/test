const levelsBar = document.getElementById('levels');
const categoryList = document.getElementById('categoryList');
const listView = document.getElementById('listView');
const flashView = document.getElementById('flashView');
const mcqView = document.getElementById('mcqView');
const inputView = document.getElementById('inputView');
const searchInput = document.getElementById('searchInput');
const currentPath = document.getElementById('currentPath');
const visibleCountEl = document.getElementById('visibleCount');
const totalCountEl = document.getElementById('totalCount');
const togglePLBtn = document.getElementById('togglePL');
const shuffleBtn = document.getElementById('shuffle');
const reverseModeBtn = document.getElementById('reverseMode');
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
const flashSpeakBtn = document.getElementById('flashSpeakBtn');
const smAgain = document.getElementById('smAgain');
const smHard  = document.getElementById('smHard');
const smGood  = document.getElementById('smGood');
const smEasy  = document.getElementById('smEasy');
const flashFs = document.getElementById('flashFs');
const mcqFs = document.getElementById('mcqFs');
const mcqQuestion = document.getElementById('mcqQuestion');
const mcqOptions = document.getElementById('mcqOptions');
const mcqNext = document.getElementById('mcqNext');
const mcqSpeakBtn = document.getElementById('mcqSpeakBtn');
const viewListBtn = document.getElementById('viewList');
const viewFlashBtn = document.getElementById('viewFlash');
const viewMCQBtn = document.getElementById('viewMCQ');
const viewInputBtn = document.getElementById('viewInput');
const inputQuestion = document.getElementById('inputQuestion');
const inputAnswer = document.getElementById('inputAnswer');
const inputCorrectAnswer = document.getElementById('inputCorrectAnswer');
const inputCheckBtn = document.getElementById('inputCheck');
const inputNextBtn = document.getElementById('inputNext');
const inputSpeakBtn = document.getElementById('inputSpeakBtn');
const inputFs = document.getElementById('inputFs');
const studyTab = document.getElementById('studyTab');
const exercisesTab = document.getElementById('exercisesTab');
const recruitmentTab = document.getElementById('recruitmentTab');

const studySection = document.getElementById('studySection');
const exercisesSection = document.getElementById('exercisesSection');
const recruitmentSection = document.getElementById('recruitmentSection');

const backToStudy = document.getElementById('backToStudy');
const backToStudyFromRecruitment = document.getElementById('backToStudyFromRecruitment');
const exerciseControls = document.getElementById('exerciseControls');
const exerciseContainer = document.getElementById('exerciseContainer');
const exerciseVisibleEl = document.getElementById('exerciseVisible');

// Recruitment elements
const recruitmentForm = document.getElementById('recruitmentForm');
const generateButton = document.getElementById('generateButton');
const savePdfButton = document.getElementById('savePdfButton');
const generatedContent = document.getElementById('generatedContent');
const searchHistory = document.getElementById('searchHistory');

let data = {}; // { level: { category: [ {en, pl}, ... ] } }
let samples = {}; // { level: { category: { enLower: { enSample, plSample } } } }

let currentLevel = 'A2';
let currentCategory = null;
let showPL = true;
let reverseMode = false; // false: EN->PL, true: PL->EN
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

// Input
let inputPool=[]; let inputIdx=0; let inputCorrect='';

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

    const mainWord = reverseMode ? pl : en;
    const translation = reverseMode ? en : pl;

    left.innerHTML = `<div class="word-en"><span>${escapeHTML(mainWord)}</span></div>`+
                     `<div class="word-pl" style="display:${showPL?'block':'none'}">${escapeHTML(translation)}</div>`;

    const smp = getSample(currentLevel, currentCategory, en);
    if (smp){
      const ex = document.createElement('div'); ex.className = 'example-block';
      ex.innerHTML = `<div class="example-en">"${escapeHTML(smp.enSample)}"</div>`+
                     `<div class="example-pl" style="display:${showPL?'block':'none'}">"${escapeHTML(smp.plSample)}"</div>`;
      left.appendChild(ex);
    }

    const right = document.createElement('div'); right.className='d-flex gap-2 align-items-center';

    const speakBtn = document.createElement('button'); speakBtn.className = 'speak-btn'; speakBtn.innerHTML = '<i class="bi bi-volume-up"></i>'; speakBtn.title = 'Odsłuchaj';
    speakBtn.addEventListener('click', (e) => { e.stopPropagation(); speak(en); });

    const toggle = document.createElement('button'); toggle.className='pill'; toggle.innerHTML = showPL? '<i class="bi bi-eye-slash me-1"></i>Ukryj PL' : '<i class="bi bi-eye me-1"></i>Pokaż PL';
    toggle.addEventListener('click', ()=>{ const plEl=left.querySelector('.word-pl'); const plEx=left.querySelector('.example-pl'); const vis = !plEl || plEl.style.display!=='none'; if(plEl) plEl.style.display = vis? 'none':'block'; if(plEx) plEx.style.display = vis? 'none':'block'; toggle.innerHTML = vis? '<i class="bi bi-eye me-1"></i>Pokaż PL' : '<i class="bi bi-eye-slash me-1"></i>Ukryj PL'; });
    const mark = document.createElement('button'); mark.className='pill'; mark.innerHTML = known? '<i class="bi bi-check2-circle me-1"></i>Zapamiętane' : '<i class="bi bi-circle me-1"></i>Uczone';
    mark.addEventListener('click', ()=>{ const nowKnown=!localStorage.getItem(id); if(nowKnown) localStorage.setItem(id,'1'); else localStorage.removeItem(id); renderProgress(); mark.innerHTML = nowKnown? '<i class="bi bi-check2-circle me-1"></i>Zapamiętane' : '<i class="bi bi-circle me-1"></i>Uczone'; });
    right.appendChild(speakBtn);
    right.appendChild(toggle); right.appendChild(mark);
    card.appendChild(left); card.appendChild(right);
    card.addEventListener('dblclick', ()=> navigator.clipboard?.writeText(`${en} — ${pl}`));
    listView.appendChild(card);
  }
}

// ===== TTS =====
function speak(text) {
  if (typeof SpeechSynthesisUtterance === 'undefined' || typeof window.speechSynthesis === 'undefined') {
    alert('Twoja przeglądarka nie obsługuje syntezy mowy.');
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

// ===== FLASHCARDS (SM‑2) =====
function sm2GetMeta(level,cat,en){ const raw=localStorage.getItem(`voc:meta:${level}:${cat}:${en}`); if(!raw) return {ef:2.5,reps:0,interval:0,due:todayStr()}; try{ const o=JSON.parse(raw); return { ef:o.ef??2.5, reps:o.reps??0, interval:o.interval??0, due:o.due??todayStr() }; }catch{ return {ef:2.5,reps:0,interval:0,due:todayStr()}; }}
function sm2SaveMeta(level,cat,en,meta){ localStorage.setItem(`voc:meta:${level}:${cat}:${en}`, JSON.stringify(meta)); }
function todayStr(){ const d=new Date(); d.setHours(0,0,0,0); return d.toISOString().slice(0,10); }
function addDays(dateStr,days){ const d=new Date(dateStr); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10); }
function sm2Review(q){ const cur=flashItems[flashIdx % flashItems.length]; if(!cur) return; const id=storageId(currentLevel,currentCategory,cur.en); let {ef,reps,interval,due}=sm2GetMeta(currentLevel,currentCategory,cur.en); ef=Math.max(1.3, ef + (0.1 - (5-q)*(0.08 + (5-q)*0.02))); if(q<3){ reps=0; interval=1; } else { reps=reps+1; if(reps===1) interval=1; else if(reps===2) interval=6; else interval=Math.round(interval*ef); } due=addDays(todayStr(), interval); sm2SaveMeta(currentLevel,currentCategory,cur.en,{ef,reps,interval,due}); if(q>=4) localStorage.setItem(id,'1'); seenCount++; if(q>=4) correctCount++; updateStats(); }

// ===== MCQ =====
function startFlash(){ const all=getFilteredItems(); const today=todayStr(); const due=all.filter(({en})=> sm2GetMeta(currentLevel,currentCategory,en).due <= today ); flashItems = (due.length? due : all).slice(); shuffleArray(flashItems); flashIdx=0; flashTrans.style.display = showPL? 'block':'none'; showFlash(); }
function showFlash(){ const cur=flashItems[flashIdx % (flashItems.length||1)]; if(!cur){ flashWord.textContent='(brak fiszek)'; flashTrans.textContent=''; return; } flashWord.textContent = reverseMode ? cur.pl : cur.en; flashTrans.textContent = reverseMode ? cur.en : cur.pl; }

function startMCQ(){ mcqPool = getFilteredItems(); shuffleArray(mcqPool); mcqIdx=0; renderMCQ(); }
function renderMCQ(){ mcqOptions.innerHTML=''; const item=mcqPool[mcqIdx % (mcqPool.length||1)]; if(!item){ mcqQuestion.textContent='(brak pytań)'; return; } const {en,pl}=item; mcqQuestion.textContent = reverseMode ? pl : en; mcqCorrect = reverseMode ? en : pl; const distractors=pickDistractors(mcqCorrect, mcqPool, 3, reverseMode); const options=[mcqCorrect, ...distractors]; shuffleArray(options); options.forEach((opt,i)=>{ const btn=document.createElement('button'); btn.className='mcq-btn'; btn.textContent=opt; btn.dataset.index = String(i+1); btn.addEventListener('click', ()=>{ if(btn.dataset.answered) return; btn.dataset.answered='1'; seenCount++; if(opt===mcqCorrect){ btn.classList.add('correct'); correctCount++; markKnown(en); } else { btn.classList.add('wrong'); } [...mcqOptions.children].forEach(b=>{ if(b.textContent===mcqCorrect) b.classList.add('correct'); }); updateStats(); }); mcqOptions.appendChild(btn); }); }

function selectFirstCategory(){ const cats=Object.keys(data[currentLevel]||{}); currentCategory=cats[0]||null; rebuildListOrder(); renderView(); }

function renderView(){ renderCategories(); if(!currentCategory){ currentPath.textContent='Wybierz kategorię'; visibleCountEl.textContent='0'; totalCountEl.textContent='0'; return; } const total=(data[currentLevel]?.[currentCategory]||[]).length; currentPath.textContent=`${currentLevel} › ${currentCategory} • ${total} słów`; renderCounts(); renderProgress(); showView(currentView); }

function updateGlobalControlsVisibility(){
    const showListControls = currentView === 'list';
    togglePLBtn.style.display = showListControls ? '' : 'none';
    shuffleBtn.style.display = showListControls ? '' : 'none';
    filterWithExampleBtn.style.display = showListControls ? '' : 'none';
    const showReverse = ['list', 'flash', 'mcq', 'input'].includes(currentView);
    reverseModeBtn.style.display = showReverse ? '' : 'none';
}

function showView(view){ currentView=view; document.querySelectorAll('.view-tabs .pill').forEach(b=>b.classList.remove('active'));
    const views = {
        list: { btn: viewListBtn, el: listView },
        flash: { btn: viewFlashBtn, el: flashView },
        mcq: { btn: viewMCQBtn, el: mcqView },
        input: { btn: viewInputBtn, el: inputView }
    };
    for (const v in views) {
        views[v].el.classList.add('d-none');
    }
    if (views[view]) {
        views[view].btn.classList.add('active');
        views[view].el.classList.remove('d-none');
    }
    if (view === 'list') renderList();
    if (view === 'flash') startFlash();
    if (view === 'mcq') startMCQ();
    if (view === 'input') startInput();
    updateGlobalControlsVisibility();
}

function showStudy() {
    studySection.classList.remove('d-none');
    exercisesSection.classList.add('d-none');
    recruitmentSection.classList.add('d-none');
    studyTab.classList.add('active');
    exercisesTab.classList.remove('active');
    recruitmentTab.classList.remove('active');
}

function showExercises() {
    studySection.classList.add('d-none');
    exercisesSection.classList.remove('d-none');
    recruitmentSection.classList.add('d-none');
    studyTab.classList.remove('active');
    exercisesTab.classList.add('active');
    recruitmentTab.classList.remove('active');
    renderExercises();
}

function showRecruitment() {
    studySection.classList.add('d-none');
    exercisesSection.classList.add('d-none');
    recruitmentSection.classList.remove('d-none');
    studyTab.classList.remove('active');
    exercisesTab.classList.remove('active');
    recruitmentTab.classList.add('active');
    loadSearchHistory();
}

function shuffleArray(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } }
function pickDistractors(correct, items, n, isReverse) { const pool = items.map(x => (isReverse ? x.en : x.pl)).filter(p => p !== correct); shuffleArray(pool); return pool.slice(0, n); }

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

// ===== INPUT VIEW =====
function startInput() {
    inputPool = getFilteredItems();
    shuffleArray(inputPool);
    inputIdx = 0;
    renderInput();
}

function renderInput() {
    const item = inputPool[inputIdx % (inputPool.length || 1)];
    if (!item) {
        inputQuestion.textContent = '(brak pytań)';
        return;
    }
    const { en, pl } = item;
    inputQuestion.textContent = reverseMode ? pl : en;
    inputCorrect = reverseMode ? en : pl;

    inputAnswer.value = '';
    inputAnswer.disabled = false;
    inputAnswer.classList.remove('correct', 'wrong');
    inputCorrectAnswer.style.display = 'none';
    inputCheckBtn.style.display = '';
    inputNextBtn.style.display = 'none';
    inputAnswer.focus();
}

function checkInputAnswer() {
    const userAnswer = inputAnswer.value.trim();
    if (userAnswer === '') return;

    inputAnswer.disabled = true;
    inputCheckBtn.style.display = 'none';
    inputNextBtn.style.display = '';
    seenCount++;

    if (userAnswer.toLowerCase() === inputCorrect.toLowerCase()) {
        inputAnswer.classList.add('correct');
        correctCount++;
        const item = inputPool[inputIdx % inputPool.length];
        if (item) markKnown(item.en);
    } else {
        inputAnswer.classList.add('wrong');
        inputCorrectAnswer.textContent = `Poprawna odpowiedź: ${inputCorrect}`;
        inputCorrectAnswer.style.display = 'block';
    }
    updateStats();
    inputNextBtn.focus();
}

// View tabs
viewListBtn.addEventListener('click', ()=> showView('list'));
viewFlashBtn.addEventListener('click', ()=> showView('flash'));
viewMCQBtn.addEventListener('click', ()=> showView('mcq'));
viewInputBtn.addEventListener('click', () => showView('input'));

// MCQ next handler
mcqNext.addEventListener('click', ()=>{ if(!mcqPool || !mcqPool.length) return; mcqIdx = (mcqIdx+1) % mcqPool.length; renderMCQ(); });
mcqSpeakBtn.addEventListener('click', () => { const cur = mcqPool[mcqIdx % mcqPool.length]; if(cur) speak(cur.en); });

// Global controls
reverseModeBtn.addEventListener('click', () => {
  reverseMode = !reverseMode;
  reverseModeBtn.classList.toggle('active', reverseMode);
  renderView();
});
togglePLBtn.addEventListener('click', ()=>{ showPL = !showPL; togglePLBtn.classList.toggle('active', !showPL); if(currentView==='list') renderList(); if(currentView==='flash'){ flashTrans.style.display = showPL ? 'block':'none'; } });
shuffleBtn.addEventListener('click', ()=>{ if(currentView==='list'){ rebuildListOrder(); renderList(); } if(currentView==='flash'){ startFlash(); } if(currentView==='mcq'){ startMCQ(); } });

// Flash buttons
flashShow.addEventListener('click', ()=>{ flashTrans.style.display = (flashTrans.style.display==='none'?'block':'none'); });
flashSpeakBtn.addEventListener('click', () => { const cur = flashItems[flashIdx % flashItems.length]; if(cur) speak(cur.en); });
inputCheckBtn.addEventListener('click', checkInputAnswer);
inputNextBtn.addEventListener('click', () => {
    inputIdx = (inputIdx + 1) % (inputPool.length || 1);
    renderInput();
});
inputSpeakBtn.addEventListener('click', () => { const cur = inputPool[inputIdx % inputPool.length]; if (cur) speak(cur.en); });

smAgain.addEventListener('click', ()=>{ sm2Review(1); nextFlash(); renderCounts(); });
smHard .addEventListener('click', ()=>{ sm2Review(3); nextFlash(); renderCounts(); });
smGood .addEventListener('click', ()=>{ sm2Review(4); nextFlash(); renderCounts(); });
smEasy .addEventListener('click', ()=>{ sm2Review(5); nextFlash(); renderCounts(); });
flashNext.addEventListener('click', ()=>{ nextFlash(); renderCounts(); });
function nextFlash(){ flashIdx = (flashIdx+1) % (flashItems.length || 1); showFlash(); }

// Keyboard shortcuts
document.addEventListener('keydown', (e)=>{
  if (!document.body.contains(studySection) && !document.body.contains(recruitmentSection)) return;
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
    else if (e.key.toLowerCase()==='s'){ e.preventDefault(); flashSpeakBtn.click(); }
    else if (e.key.toLowerCase()==='f'){ e.preventDefault(); toggleFullscreen(document.getElementById('flashCard')); }
  } else if (currentView==='mcq'){
    if (e.key==='ArrowRight' || e.key==='Enter'){ e.preventDefault(); mcqNext.click(); }
    else if (['1','2','3','4'].includes(e.key)){
      const btn = [...mcqOptions.children].find(b=> b.dataset.index===e.key);
      if (btn) { e.preventDefault(); btn.click(); }
    } else if (e.key.toLowerCase()==='s'){ e.preventDefault(); mcqSpeakBtn.click(); }
    else if (e.key.toLowerCase()==='f'){ e.preventDefault(); toggleFullscreen(document.getElementById('mcqCard')); }
  } else if (currentView === 'input') {
      if (e.key === 'Enter') {
          e.preventDefault();
          if (inputCheckBtn.style.display !== 'none') {
              inputCheckBtn.click();
          } else {
              inputNextBtn.click();
          }
      } else if (e.key.toLowerCase() === 's') {
          e.preventDefault();
          inputSpeakBtn.click();
      } else if (e.key.toLowerCase() === 'f') {
          e.preventDefault();
          toggleFullscreen(document.getElementById('inputCard'));
      }
  }
});

// Fullscreen buttons
flashFs.addEventListener('click', ()=> toggleFullscreen(document.getElementById('flashCard')));
mcqFs.addEventListener('click', ()=> toggleFullscreen(document.getElementById('mcqCard')));
inputFs.addEventListener('click', () => toggleFullscreen(document.getElementById('inputCard')));

function toggleFullscreen(el){
  if (!document.fullscreenElement){ el.requestFullscreen?.(); el.classList.add('fs-active'); }
  else { document.exitFullscreen?.(); document.querySelectorAll('.fs-active').forEach(n=>n.classList.remove('fs-active')); }
}

document.addEventListener('fullscreenchange', ()=>{
  const inFs = !!document.fullscreenElement;
  const exitHTML = '<i class="bi bi-fullscreen-exit"></i> Wyjdź';
  const enterHTML = '<i class="bi bi-arrows-fullscreen"></i> Pełny ekran';
  flashFs.innerHTML = inFs ? exitHTML : enterHTML;
  mcqFs.innerHTML   = inFs ? exitHTML : enterHTML;
  inputFs.innerHTML = inFs ? exitHTML : enterHTML;
});

// Search
searchInput.addEventListener('input', ()=> renderCategories());

// Main panel tabs
studyTab.addEventListener('click', showStudy);
exercisesTab.addEventListener('click', showExercises);
recruitmentTab.addEventListener('click', showRecruitment);
backToStudy.addEventListener('click', showStudy);
backToStudyFromRecruitment.addEventListener('click', showStudy);

function generateAIContent(position, requirements, pages) {
    // --- AI Analysis Simulation ---
    const keywords = [...new Set((requirements.match(/[a-zA-Z0-9\.\+#-]+/g) || []).map(k => k.toLowerCase().replace(/[.,:;]$/, '')))];

    const techDb = {
        react: { name: 'React', desc: 'Biblioteka JavaScript do budowy interfejsów użytkownika. Kluczowe koncepty: komponenty, JSX, stan, propsy, cykl życia, hooki (useState, useEffect).', type: 'framework' },
        angular: { name: 'Angular', desc: 'Kompleksowy framework od Google. Kluczowe koncepty: moduły, komponenty, serwisy, dependency injection, RxJS.', type: 'framework' },
        vue: { name: 'Vue.js', desc: 'Progresywny framework JavaScript. Kluczowe koncepty: dyrektywy (v-if, v-for), komponenty, computed properties, Vuex.', type: 'framework' },
        javascript: { name: 'JavaScript (ES6+)', desc: 'Podstawa web-developmentu. Kluczowe koncepty: asynchroniczność (Promises, async/await), domknięcia, prototypy, nowe składnie (let/const, arrow functions).', type: 'language' },
        typescript: { name: 'TypeScript', desc: 'Nadbudowa na JavaScript dodająca statyczne typowanie. Zwiększa bezpieczeństwo i czytelność kodu.', type: 'language' },
        python: { name: 'Python', desc: 'Wszechstronny język programowania. Kluczowe koncepty: struktury danych, programowanie obiektowe, generatory, dekoratory.', type: 'language' },
        django: { name: 'Django', desc: 'Wysokopoziomowy framework Python do szybkiego tworzenia bezpiecznych i skalowalnych aplikacji webowych. (MVT, ORM)', type: 'framework' },
        fastapi: { name: 'FastAPI', desc: 'Nowoczesny i szybki framework Python do budowania API, oparty o standardowe wskazówki typów Pythona.', type: 'framework' },
        nodejs: { name: 'Node.js', desc: 'Środowisko uruchomieniowe dla JavaScript po stronie serwera. Umożliwia budowanie szybkich i skalowalnych aplikacji sieciowych.', type: 'platform' },
        sql: { name: 'SQL', desc: 'Język zapytań do zarządzania relacyjnymi bazami danych. Kluczowe komendy: SELECT, JOIN, GROUP BY, INSERT, UPDATE.', type: 'database' },
        postgresql: { name: 'PostgreSQL', desc: 'Zaawansowana, obiektowo-relacyjna baza danych o otwartym kodzie źródłowym.', type: 'database' },
        docker: { name: 'Docker', desc: 'Platforma do konteneryzacji aplikacji, umożliwiająca ich uruchamianie w izolowanych środowiskach.', type: 'devops' },
        kubernetes: { name: 'Kubernetes (K8s)', desc: 'Platforma do automatyzacji, wdrażania i zarządzania skonteneryzowanymi aplikacjami.', type: 'devops' },
        git: { name: 'Git', desc: 'Rozproszony system kontroli wersji, niezbędny w pracy zespołowej. Kluczowe komendy: commit, push, pull, branch, merge.', type: 'tools' }
    };

    const identifiedTech = keywords.map(k => techDb[k]).filter(Boolean);

    // --- Content Generation ---
    let html = `<h3>Kompendium Wiedzy dla: ${position}</h3>`;
    html += `<p>Wygenerowano na podstawie Twoich wymagań. To ${pages}-stronicowe kompendium pomoże Ci usystematyzować naukę.</p>`;

    // 1. Analiza Wymagań
    html += `<h4>1. Kluczowe Technologie i Koncepty</h4>`;
    if (identifiedTech.length > 0) {
        html += `<p>Na podstawie analizy, główne obszary, na których należy się skupić, to:</p><ul>`;
        identifiedTech.forEach(t => {
            html += `<li><strong>${t.name}:</strong> ${t.desc}</li>`;
        });
        html += `</ul>`;
    } else {
        html += `<p>Nie zidentyfikowano konkretnych technologii w Twoich wymaganiach. Skup się na ogólnych podstawach dla stanowiska ${position}.</p>`;
    }

    // 2. Sugerowany Plan Nauki
    html += `<h4 class="mt-4">2. Sugerowany Plan Nauki (${Math.ceil(pages / 2)} dni)</h4>`;
    html += `<ol>`;
    const coreLangs = identifiedTech.filter(t => t.type === 'language');
    const frameworks = identifiedTech.filter(t => t.type === 'framework');
    const databases = identifiedTech.filter(t => t.type === 'database');
    const devops = identifiedTech.filter(t => t.type === 'devops');

    if (coreLangs.length > 0) html += `<li><strong>Dzień 1-2: Fundamenty Językowe.</strong> Odśwież i ugruntuj wiedzę z: ${coreLangs.map(t => t.name).join(', ')}. Skup się na zaawansowanych konceptach.</li>`;
    if (frameworks.length > 0) html += `<li><strong>Dzień 3-4: Frameworki.</strong> Głębokie zanurzenie w ${frameworks.map(t => t.name).join(', ')}. Zbuduj mały projekt, aby przećwiczyć kluczowe funkcje.</li>`;
    if (databases.length > 0) html += `<li><strong>Dzień 5: Bazy Danych.</strong> Przećwicz projektowanie schematów i pisanie złożonych zapytań w ${databases.map(t => t.name).join(', ')}.</li>`;
    if (devops.length > 0) html += `<li><strong>Dzień 6: DevOps i Narzędzia.</strong> Zrozumienie podstaw konteneryzacji (${devops.map(t => t.name).join(', ')}) i pracy z Git.</li>`;
    html += `<li><strong>Dzień 7: Przygotowanie do Rozmowy.</strong> Przejrzyj poniższe pytania i przygotuj odpowiedzi.</li>`;
    html += `</ol>`;

    // 3. Przykładowe Pytania Rekrutacyjne
    if (pages > 2) {
        html += `<h4 class="mt-4">3. Przykładowe Pytania Rekrutacyjne</h4>`;
        html += `<h5>Techniczne:</h5><ul>`;
        if (keywords.includes('react')) html += `<li>Jak działa wirtualny DOM w React?</li>`;
        if (keywords.includes('javascript')) html += `<li>Wyjaśnij różnicę między 'let', 'const' i 'var'.</li>`;
        if (keywords.includes('python')) html += `<li>Czym są dekoratory w Pythonie i do czego służą?</li>`;
        if (keywords.includes('sql')) html += `<li>Opisz różnicę między LEFT JOIN a INNER JOIN.</li>`;
        html += `<li>Jakie są zalety i wady mikroserwisów?</li>`;
        html += `</ul>`;

        html += `<h5>Behawioralne:</h5><ul>`;
        html += `<li>Opisz najtrudniejszy problem techniczny, z jakim się zmierzyłeś i jak go rozwiązałeś.</li>`;
        html += `<li>Jak podchodzisz do nauki nowych technologii?</li>`;
        html += `</ul>`;
    }

    html += `<p class="mt-4"><em>To kompendium zostało wygenerowane przez AI. Powodzenia na rozmowie!</em></p>`;
    return html;
}


// Recruitment Form Logic
recruitmentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const link = document.getElementById('jobOfferLink').value;
    const position = document.getElementById('jobPosition').value;
    const requirements = document.getElementById('jobRequirements').value;
    const pages = document.getElementById('pagesToGenerate').value;

    generatedContent.innerHTML = '<p>Generowanie treści... <i class="bi bi-robot"></i></p>';
    generateButton.disabled = true;
    savePdfButton.classList.add('d-none');

    // Symulacja opóźnienia, aby interfejs był bardziej responsywny
    setTimeout(() => {
        // Wywołanie nowego generatora AI
        const aiPoweredContent = generateAIContent(position, requirements, pages);
        generatedContent.innerHTML = aiPoweredContent;

        savePdfButton.classList.remove('d-none');
        generateButton.disabled = false;

        // Zapis do historii w localStorage
        const historyEntry = `${new Date().toLocaleString()} | ${position}`;
        let history = JSON.parse(localStorage.getItem('recruitmentHistory') || '[]');
        history.unshift(historyEntry); // Dodaj na początek
        if (history.length > 10) history.pop(); // Ogranicz do 10 wpisów
        localStorage.setItem('recruitmentHistory', JSON.stringify(history));
        loadSearchHistory();

    }, 500); // Krótkie opóźnienie dla UX
});

function loadSearchHistory() {
    const history = JSON.parse(localStorage.getItem('recruitmentHistory') || '[]');
    searchHistory.innerHTML = '';
    if (history.length === 0) {
        searchHistory.innerHTML = '<li class="list-group-item">Brak historii.</li>';
        return;
    }
    history.forEach(item => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = item;
        searchHistory.appendChild(li);
    });
}

savePdfButton.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const content = document.getElementById('generatedContent');
    const position = document.getElementById('jobPosition').value || 'dokument';
    const filename = `rekrutacja-${position.replace(/\s+/g, '-').toLowerCase()}.pdf`;

    doc.html(content, {
        callback: function (doc) {
            doc.save(filename);
        },
        x: 10,
        y: 10,
        width: 180,
        windowWidth: 800
    });
});


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