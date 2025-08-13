// =========  VARIABLES GLOBALES =========
let allCombinations   = [];
let filteredCombinations = [];
let sommeSequence     = [];
let groupData         = [];
let groupGlobalMin    = 3;

const petitLimitInput = document.getElementById('petitLimit');

// =========  GÉNÉRATION DES COMBINAISONS =========
function generateCombinations() {
    const totalPartants = parseInt(document.getElementById('partantsSelect').value);
    const taille        = parseInt(document.getElementById('tailleSelect').value);

    // Non-partants : espaces, virgules ou tirets
    const nonPartantsRaw = document.getElementById('nonPartantsInput').value;
    const nonPartants = nonPartantsRaw
        .split(/[\s,\-]+/)
        .map(n => parseInt(n.trim()))
        .filter(n => !isNaN(n) && n >= 1 && n <= totalPartants);

    // Partants effectifs
    const partantsEffectifs = [];
    for (let i = 1; i <= totalPartants; i++) {
        if (!nonPartants.includes(i)) partantsEffectifs.push(i);
    }

    allCombinations.length = 0;

    const helper = (startIndex, combo) => {
        if (combo.length === taille) {
            allCombinations.push([...combo]);
            return;
        }
        for (let i = startIndex; i < partantsEffectifs.length; i++) {
            combo.push(partantsEffectifs[i]);
            helper(i + 1, combo);
            combo.pop();
        }
    };

    if (partantsEffectifs.length >= taille) {
        helper(0, []);
    }

    updateSommeSequence();
    applyFilters();
    updateDisplay();
    updateCounter();

    if (partantsEffectifs.length < taille) {
        alert(`Attention : seulement ${partantsEffectifs.length} partants pour une taille de ${taille}`);
    }
}

// =========  MISE À JOUR SÉQUENCE SOMME =========
function updateSommeSequence() {
    const partants = parseInt(document.getElementById('partantsSelect').value);
    sommeSequence = Array.from({ length: partants }, (_, i) => i + 1);
    document.getElementById('sommeSequence').value = sommeSequence.join(', ');
}

// =========  TOGGLE FILTRES =========
function toggleFilter(name) {
    const btn   = event.target;
    const range = document.getElementById(name + '-range');
    btn.classList.toggle('active');
    range?.classList.toggle('active');
    applyFilters();
}

// =========  MIN GLOBAL & INDIVIDUEL =========
function updateGlobalMin(val) {
    groupGlobalMin = parseInt(val) || 0;
    document.querySelectorAll('#groupe-filters input[data-group]').forEach(el => {
        el.value = groupGlobalMin;
        updateGroupMin(el);
    });
}

function updateGroupMin(input) {
    const id    = input.dataset.group;
    const group = groupData.find(g => g.id === id);
    if (group) {
        group.min = Math.max(0, Math.min(parseInt(input.value) || 0, group.numbers.length));
    }
    applyFilters();
}

// =========  ANALYSE TEXTE / IMAGE =========
function analyzeGroups() {
    const rawText = document.querySelector('#groupe-input textarea').value;
    const groupRegex = /([^\d\n:]+):?([\d\s\-,]+)/g;
    let match;
    groupData.length = 0;

    while ((match = groupRegex.exec(rawText)) !== null) {
        const label = match[1].trim() || `Groupe ${groupData.length + 1}`;
        const nums  = match[2].match(/\d+/g)?.map(Number).filter(n => n >= 1 && n <= 20);
        if (nums && nums.length) {
            groupData.push({
                id: `groupe-${Date.now()}-${groupData.length}`,
                label,
                numbers: [...new Set(nums)],
                min: groupGlobalMin
            });
        }
    }
    renderGroupList();
    autoSelectAllGroups();
    applyFilters();
}

// =========  AFFICHAGE LISTE DES GROUPES =========
function renderGroupList() {
    const list = document.getElementById('groupList');
    list.innerHTML = groupData.map(g => `<div class="group-item"><strong>${g.label}</strong>: ${g.numbers.join(' - ')}</div>`).join('');
}

// =========  CRÉATION DES INPUTS MIN PAR GROUPE =========
function autoSelectAllGroups() {
    const container = document.getElementById('groupe-filters');
    container.innerHTML = '';
    groupData.forEach(g => {
        const div = document.createElement('div');
        div.className = 'filter-instance';
        div.innerHTML = `
            <label>${g.label} – Min</label>
            <input type="number" min="0" max="${g.numbers.length}" value="${g.min}" data-group="${g.id}" oninput="updateGroupMin(this)" />
        `;
        container.appendChild(div);
    });
}

// =========  AJOUT MANUEL D’UN GROUPE =========
function addManualGroup() {
    const label   = prompt("Nom du groupe (ex: Favoris) :");
    if (!label) return;

    const numbers = prompt("Numéros (séparés par espaces, tirets ou virgules) :");
    if (!numbers) return;

    const nums = numbers.split(/[\s,\-]+/).map(Number).filter(n => !isNaN(n) && n >= 1 && n <= 20);
    if (!nums.length) return;

    groupData.push({
        id: `groupe-manuel-${Date.now()}`,
        label,
        numbers: [...new Set(nums)],
        min: groupGlobalMin
    });

    renderGroupList();
    autoSelectAllGroups();
    applyFilters();
}

// =========  IMPORT IMAGE (Android / Desktop) =========
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    Tesseract.recognize(file, 'eng+fra', { logger: () => {} })
        .then(({ data: { text } }) => {
            document.querySelector('#groupe-input textarea').value = text;
            analyzeGroups();
        });
}

// =========  DUPLICATION DE FILTRES =========
function duplicateFilter(type) {
    if (type === 'somme') {
        const container = document.getElementById('somme-filters');
        const div = document.createElement('div');
        div.className = 'filter-instance';
        div.innerHTML = `
            <button class="remove-filter-btn" onclick="this.parentElement.remove();applyFilters()">×</button>
            <label>Somme – Min/Max</label>
            <div class="range-input-group">
                <label>Min</label><input type="number" min="0" oninput="applyFilters()" />
            </div>
            <div class="range-input-group">
                <label>Max</label><input type="number" min="0" oninput="applyFilters()" />
            </div>
        `;
        container.appendChild(div);
    }
    if (type === 'groupe') {
        const container = document.getElementById('groupe-filters');
        const div = document.createElement('div');
        div.className = 'filter-instance';
        div.innerHTML = `
            <button class="remove-filter-btn" onclick="this.parentElement.remove();applyFilters()">×</button>
            <label>Groupe – Min à conserver</label>
            <input type="number" min="0" max="8" value="${groupGlobalMin}" oninput="applyFilters()" />
        `;
        container.appendChild(div);
    }
}

// =========  APPLICATION DES FILTRES =========
function applyFilters() {
    filteredCombinations = [...allCombinations];
    const petitLimit = parseInt(petitLimitInput.value);
    const seq = document.getElementById('sommeSequence')?.value.split(',').map(Number) || sommeSequence;

    // Somme numérique
    if (document.getElementById('somme-range')?.classList.contains('active')) {
        const min = parseInt(document.getElementById('sommeMin')?.value || 0);
        const max = parseInt(document.getElementById('sommeMax')?.value || 0);
        filteredCombinations = filteredCombinations.filter(c => {
            const sum = c.reduce((a, b) => a + (seq[b - 1] || b), 0);
            return sum >= min && sum <= max;
        });
    }
    document.querySelectorAll('#somme-filters .filter-instance').forEach(div => {
        const min = parseInt(div.querySelector('input:nth-of-type(1)')?.value || 0);
        const max = parseInt(div.querySelector('input:nth-of-type(2)')?.value || 0);
        filteredCombinations = filteredCombinations.filter(c => {
            const sum = c.reduce((a, b) => a + (seq[b - 1] || b), 0);
            return sum >= min && sum <= max;
        });
    });

    // Pairs / Impairs / Petits / Grands
    ['pairs', 'impairs', 'petits', 'grands'].forEach(id => {
        if (document.getElementById(id + '-range')?.classList.contains('active')) {
            const min = parseInt(document.getElementById(id + 'Min')?.value || 0);
            const max = parseInt(document.getElementById(id + 'Max')?.value || 8);
            let fn;
            switch (id) {
                case 'pairs':   fn = c => c.filter(n => n % 2 === 0).length; break;
                case 'impairs': fn = c => c.filter(n => n % 2 === 1).length; break;
                case 'petits':  fn = c => c.filter(n => n <= petitLimit).length; break;
                case 'grands':  fn = c => c.filter(n => n > petitLimit).length; break;
            }
            filteredCombinations = filteredCombinations.filter(c => fn(c) >= min && fn(c) <= max);
        }
    });

    // Tri par groupes
    if (groupData.length) {
        filteredCombinations = filteredCombinations.filter(combo =>
            groupData.every(group => combo.filter(n => group.numbers.includes(n)).length >= group.min)
        );
    }

    updateDisplay();
    updateCounter();
}

// =========  AFFICHAGE & UTILITAIRES =========
function updateDisplay() {
    const list = document.getElementById('combinationsList');
    list.innerHTML = '';

    const html = filteredCombinations.slice(0, 1000)
        .map(combo => `<div class="combination-item">${combo.map(n => `<span class="large blue">${n}</span>`).join(' ')}</div>`)
        .join('');

    list.innerHTML = html;
    if (filteredCombinations.length > 1000) {
        list.innerHTML += `<div style="text-align:center;color:#ffdd00;">... et ${filteredCombinations.length - 1000} autres</div>`;
    }
}

function searchNumbers(query) {
    const nums = query.split(/\s+/).map(Number).filter(n => !isNaN(n));
    if (!nums.length) { updateDisplay(); return; }
    const list = document.getElementById('combinationsList');
    const filtered = allCombinations.filter(combo => nums.every(n => combo.includes(n)));
    list.innerHTML = filtered.slice(0, 100).map(combo => `<div class="combination-item">${combo.map(n => `<span class="large blue">${n}</span>`).join(' ')}</div>`).join('');
}

function updateCounter() {
    document.getElementById('counter').textContent = `${filteredCombinations.length}/${allCombinations.length}`;
}

function showStats() {
    const freq = {};
    filteredCombinations.flat().forEach(n => freq[n] = (freq[n] || 0) + 1);
    const sorted = Object.entries(freq).sort((a, b) => a[1] - b[1]);

    const groupFreq = {};
    groupData.flatMap(g => g.numbers).forEach(n => groupFreq[n] = (groupFreq[n] || 0) + 1);
    const groupSorted = Object.entries(groupFreq).sort((a, b) => a[1] - b[1]);

    alert(
        "📈 Arrivée générale (ordre croissant):\n" +
        sorted.map(([n, c]) => `Cheval ${n}: ${c} fois`).join('\n') +
        "\n\n📊 Chevaux présents dans les groupes:\n" +
        groupSorted.map(([n, c]) => `Cheval ${n}: ${c} fois`).join('\n') +
        `\n\nTotal combinaisons: ${filteredCombinations.length}\nRéduction: ${((1 - filteredCombinations.length / allCombinations.length) * 100).toFixed(1)}%`
    );
}

function resetAll() {
    location.reload();
}

// =========  INITIALISATIONS =========
window.addEventListener('load', () => {
    document.getElementById('logoCarousel').style.animationPlayState = 'running';
    generateCombinations();
});

// Sauvegarder les groupes actuels
function saveGroupSet() {
  const code = document.getElementById('courseCode').value.trim();
  const date = document.getElementById('courseDate').value;
  if (!code || !date) {
    alert("Veuillez entrer un code de course et une date.");
    return;
  }

  const key = `gosen-${code}-${date}`;
  const data = {
    code,
    date,
    groups: groupData,
    timestamp: Date.now()
  };

  localStorage.setItem(key, JSON.stringify(data));
  updateSavedGroupSelect();
  alert("Groupes sauvegardés avec succès !");
}

function groupDataToText(groups) {
  return groups.map(g => `${g.label}: ${g.numbers.join(' ')}`).join('\n');
}

// Charger une sauvegarde sélectionnée
function loadSelectedGroup() {
  const select = document.getElementById('savedGroupSelect');
  const key = select.value;
  if (!key) return;

  const data = JSON.parse(localStorage.getItem(key));
  if (!data) {
    alert("Aucune donnée trouvée.");
    return;
  }

  // ✅ Charger les groupes
  groupData = data.groups || [];
  renderGroupList();
  autoSelectAllGroups();
  applyFilters();

  // ✅ Remplir les champs
  document.getElementById('courseCode').value = data.code;
  document.getElementById('courseDate').value = data.date;

  // ✅ Réécrire dans la zone de texte
  const textarea = document.querySelector('#groupe-input textarea');
  textarea.value = groupDataToText(groupData);
}

// Mettre à jour la liste déroulante des sauvegardes
function updateSavedGroupSelect() {
  const select = document.getElementById('savedGroupSelect');
  select.innerHTML = '<option value="">-- Choisir une sauvegarde --</option>';

  const keys = Object.keys(localStorage).filter(k => k.startsWith("gosen-"));
  keys.sort((a, b) => {
    return JSON.parse(localStorage.getItem(b)).timestamp - JSON.parse(localStorage.getItem(a)).timestamp;
  });

  keys.forEach(key => {
    const data = JSON.parse(localStorage.getItem(key));
    const option = document.createElement("option");
    option.value = key;
    option.textContent = `${data.code} - ${data.date}`;
    select.appendChild(option);
  });
}

// Initialiser la liste au chargement
window.addEventListener("load", () => {
  document.getElementById("courseDate").valueAsDate = new Date();
  updateSavedGroupSelect();
});