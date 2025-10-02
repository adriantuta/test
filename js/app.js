document.addEventListener('DOMContentLoaded', () => {
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
    const recruitmentForm = document.getElementById('recruitmentForm');
    const generateButton = document.getElementById('generateButton');
    const savePdfButton = document.getElementById('savePdfButton');
    const generatedContent = document.getElementById('generatedContent');
    const searchHistory = document.getElementById('searchHistory');

    let data = {};
    let samples = {};
    let currentLevel = 'A2';
    let currentCategory = null;
    let showPL = true;
    let reverseMode = false;
    let currentView = 'list';
    let filterMode = 'all';
    let filterExamplesOnly = false;
    let exerciseCatFilter = '__ALL__';
    let exerciseQuery = '';
    let exerciseShowPL = true;
    let sessionTimer = null, sessionStart = null, sessionElapsed = 0;
    let seenCount = 0, correctCount = 0;
    let flashIdx = 0, flashItems = [];
    let mcqPool=[], mcqIdx=0, mcqCorrect='';
    let inputPool=[], inputIdx=0, inputCorrect='';
    let listOrder = [];

    function rebuildListOrder(){ const n = getFilteredItems().length; listOrder = Array.from({length:n}, (_,i)=>i); shuffleArray(listOrder); }
    function resetUI() { /* ... */ }
    function parseCSV(text){ /* ... */ }
    function parseSamples(text){ /* ... */ }
    function safeSplit(line){ /* ... */ }
    function renderCategories(){ /* ... */ }
    function renderCounts(){ /* ... */ }
    function renderProgress(){ /* ... */ }
    function getSample(level, category, en){ /* ... */ }
    function renderList(){ /* ... */ }
    function speak(text) { /* ... */ }
    function sm2GetMeta(level,cat,en){ /* ... */ }
    function sm2SaveMeta(level,cat,en,meta){ /* ... */ }
    function todayStr(){ /* ... */ }
    function addDays(dateStr,days){ /* ... */ }
    function sm2Review(q){ /* ... */ }
    function startFlash(){ /* ... */ }
    function showFlash(){ /* ... */ }
    function startMCQ(){ /* ... */ }
    function renderMCQ(){ /* ... */ }
    function selectFirstCategory(){ /* ... */ }
    function renderView(){ /* ... */ }
    function updateGlobalControlsVisibility(){ /* ... */ }
    function showView(view){ /* ... */ }
    function shuffleArray(arr){ /* ... */ }
    function pickDistractors(correct, items, n, isReverse) { /* ... */ }
    function storageId(level,category,en){ /* ... */ }
    function markKnown(en){ /* ... */ }
    function isKnown(level,category,en){ /* ... */ }
    function getLearnedCount(level,category){ /* ... */ }
    function getFilteredItems(){ /* ... */ }
    function escapeHTML(s){ /* ... */ }
    function resetSessionStats(){ /* ... */ }
    function updateStats(){ /* ... */ }
    function tick(){ /* ... */ }
    function formatTime(ms){ /* ... */ }
    function saveSessionLog(){ /* ... */ }
    function setFilter(m){ /* ... */ }
    function startInput() { /* ... */ }
    function renderInput() { /* ... */ }
    function checkInputAnswer() { /* ... */ }
    function nextFlash(){ /* ... */ }
    function toggleFullscreen(el){ /* ... */ }
    function buildExerciseControls(){ /* ... */ }
    function updateExercisePL(){ /* ... */ }
    function renderExercises(){ /* ... */ }

    // Minimal stubs for functions to be fully implemented later
    Object.assign(window, { rebuildListOrder, resetUI, parseCSV, parseSamples, safeSplit, renderCategories, renderCounts, renderProgress, getSample, renderList, speak, sm2GetMeta, sm2SaveMeta, todayStr, addDays, sm2Review, startFlash, showFlash, startMCQ, renderMCQ, selectFirstCategory, renderView, updateGlobalControlsVisibility, showView, shuffleArray, pickDistractors, storageId, markKnown, isKnown, getLearnedCount, getFilteredItems, escapeHTML, resetSessionStats, updateStats, tick, formatTime, saveSessionLog, setFilter, startInput, renderInput, checkInputAnswer, nextFlash, toggleFullscreen, buildExerciseControls, updateExercisePL, renderExercises });

    // Main navigation logic
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

    studyTab.addEventListener('click', showStudy);
    exercisesTab.addEventListener('click', showExercises);
    recruitmentTab.addEventListener('click', showRecruitment);
    backToStudy.addEventListener('click', showStudy);
    backToStudyFromRecruitment.addEventListener('click', showStudy);

    // Recruitment Feature Logic
    function generateAIContent(position, requirements, pages) {
        const keywords = [...new Set((requirements.match(/[a-zA-Z0-9\.\+#-]+/g) || []).map(k => k.toLowerCase().replace(/[.,:;]$/, '')))];
        const techDb = {
            react: { name: 'React', type: 'framework', desc: 'Biblioteka JavaScript...', details: 'Kluczowe koncepty: komponenty...', project: 'Zbuduj prostą aplikację...', resources: 'https://react.dev/' },
            python: { name: 'Python', type: 'language', desc: 'Wszechstronny język...', details: 'Kluczowe koncepty: typy danych...', project: 'Napisz skrypt, który pobiera dane...', resources: 'https://www.python.org/' },
            sql: { name: 'SQL', type: 'database', desc: 'Język zapytań...', details: 'Kluczowe komendy: SELECT...', project: 'Zaprojektuj schemat bazy danych...', resources: 'https://www.w3schools.com/sql/' },
            docker: { name: 'Docker', type: 'devops', desc: 'Platforma do konteneryzacji...', details: 'Kluczowe koncepty: obrazy...', project: 'Stwórz Dockerfile dla prostej aplikacji...', resources: 'https://docs.docker.com/' },
            git: { name: 'Git', type: 'tools', desc: 'Rozproszony system kontroli wersji.', details: 'Kluczowe komendy: `commit`...', project: 'Załóż nowe repozytorium...', resources: 'https://git-scm.com/doc' }
        };
        const identifiedTech = [...new Set(keywords.map(k => techDb[k]).filter(Boolean))];
        let html = `<h3>Kompendium Wiedzy dla: ${position}</h3><p>Wygenerowano na podstawie Twoich wymagań. To ${pages}-stronicowe kompendium pomoże Ci usystematyzować naukę.</p>`;
        html += `<h4>1. Kluczowe Technologie i Koncepty</h4>`;
        if (identifiedTech.length > 0) {
            html += `<ul>`;
            identifiedTech.forEach(t => { html += `<li><strong>${t.name}:</strong> ${pages <= 2 ? t.desc : t.details}</li>`; });
            html += `</ul>`;
        } else { html += `<p>Nie zidentyfikowano konkretnych technologii.</p>`; }
        if (pages >= 3) {
            html += `<h4 class="mt-4">2. Plan Nauki i Zadania Praktyczne</h4><ol>`;
            identifiedTech.forEach(t => { html += `<li><strong>${t.name}:</strong> ${t.project}</li>`; });
            html += `</ol>`;
        }
        if (pages >= 5) {
            html += `<h4 class="mt-4">3. Przykładowe Pytania Rekrutacyjne</h4><h5>Techniczne:</h5><ul>`;
            if (keywords.includes('react')) html += `<li>Jak działa wirtualny DOM w React?</li>`;
            if (keywords.includes('python')) html += `<li>Czym są dekoratory w Pythonie?</li>`;
            html += `</ul>`;
        }
        if (pages >= 7) {
            html += `<h4 class="mt-4">4. Dodatkowe Zasoby</h4><ul>`;
            identifiedTech.forEach(t => { html += `<li>Dokumentacja <strong>${t.name}</strong>: <a href="${t.resources}" target="_blank">${t.resources}</a></li>`; });
            html += `</ul>`;
        }
        html += `<p class="mt-4"><em>Powodzenia na rozmowie!</em></p>`;
        return html;
    }

    recruitmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const position = document.getElementById('jobPosition').value;
        const requirements = document.getElementById('jobRequirements').value;
        const pages = document.getElementById('pagesToGenerate').value;
        generatedContent.innerHTML = '<p>Generowanie treści...</p>';
        generateButton.disabled = true;
        savePdfButton.classList.add('d-none');
        setTimeout(() => {
            const aiPoweredContent = generateAIContent(position, requirements, pages);
            generatedContent.innerHTML = aiPoweredContent;
            savePdfButton.classList.remove('d-none');
            generateButton.disabled = false;
            const historyEntry = `${new Date().toLocaleString()} | ${position}`;
            let history = JSON.parse(localStorage.getItem('recruitmentHistory') || '[]');
            history.unshift(historyEntry);
            if (history.length > 10) history.pop();
            localStorage.setItem('recruitmentHistory', JSON.stringify(history));
            loadSearchHistory();
        }, 500);
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
            callback: function (doc) { doc.save(filename); },
            x: 10, y: 10, width: 180, windowWidth: 800
        });
    });

    // Initial load
    Promise.all([
      fetch('data/words.txt').then(r=> r.ok ? r.text() : Promise.reject(r.status)),
      fetch('data/samples.txt').then(r=> r.ok ? r.text() : Promise.resolve(''))
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
});