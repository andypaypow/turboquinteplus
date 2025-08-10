// Variables
let allCombinations = [];
let filteredCombinations = [];
let sommeSequence = [];
let groupData = [];
let groupGlobalMin = 3;

const petitLimitInput = document.getElementById('petitLimit');

// Génération
function generateCombinations() {
    const partants = parseInt(document.getElementById('partantsSelect').value);
    const taille = parseInt(document.getElementById('tailleSelect').value);
    allCombinations = [];
    const helper = (start, combo) => {
        if (combo.length === taille) { allCombinations.push([...combo]); return; }
        for (let i = start; i <= partants; i++) { combo.push(i); helper(i + 1, combo); combo.pop(); }
    };
    helper(1, []);
    updateSommeSequence();
    applyFilters();
    updateDisplay();
    updateCounter();
}

function updateSommeSequence() {
    const partants = parseInt(document.getElementById('partantsSelect').value);
    sommeSequence = Array.from({ length: partants }, (_, i) => i + 1);
    document.getElementById('sommeSequence').value = sommeSequence.join(', ');
}

function toggleFilter(name) {
    const btn = event.target;
    const range = document.getElementById(name + '-range');
    btn.classList.toggle('active');
    range?.classList.toggle('active');
    applyFilters();
}

function updateGlobalMin(val) {
    groupGlobalMin = parseInt(val);
    document.querySelectorAll('#groupe-filters input[data-group]').forEach(el => {
        el.value = val;
        updateGroupMin(el);
    });
}

function updateGroupMin(input) {
    const id = input.dataset.group;
    const group = groupData.find(g => g.id === id);
    if (group) group.min = parseInt(input.value);
    applyFilters();
}

function analyzeGroups() {
    const lines = document.querySelector('#groupe-input textarea').value.split('\n').filter(l => l.trim());
    groupData = [];
    lines.forEach((line, index) => {
        const nums = line.match(/\d+/g)?.map(Number);
        if (nums && nums.length === 8) {
            groupData.push({
                id: `groupe-${index}`,
                label: line.split(':')[0]?.trim() || `Groupe ${index + 1}`,
                numbers: [...new Set(nums)],
                min: groupGlobalMin
            });
        }
    });
    renderGroupList();
    autoSelectAllGroups();
    applyFilters();
}

function renderGroupList() {
    const list = document.getElementById('groupList');
    list.innerHTML = groupData.map(g => `<div class="group-item"><strong>${g.label}</strong>: ${g.numbers.join(' - ')}</div>`).join('');
}

function autoSelectAllGroups() {
    const container = document.getElementById('groupe-filters');
    container.innerHTML = '';
    groupData.forEach(g => {
        const div = document.createElement('div');
        div.className = 'filter-instance';
        div.innerHTML = `
            <label>${g.label} – Min</label>
            <input type="number" min="0" max="8" value="${g.min}" data-group="${g.id}" oninput="updateGroupMin(this)" />
        `;
        container.appendChild(div);
    });
}

function duplicateFilter(type) {
    if (type === 'somme') {
        const container = document.getElementById('somme-filters');
        const div = document.createElement('div');
        div.className = 'filter-instance';
        div.innerHTML = `
            <button class="remove-filter-btn" onclick="this.parentElement.remove();applyFilters()">×</button>
            <label>Somme – Min/Max</label>
            <div class="range-input-group"><label>Min</label><input type="number" min="0" oninput="applyFilters()" /></div>
            <div class="range-input-group"><label>Max</label><input type="number" min="0" oninput="applyFilters()" /></div>
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
            <input type="number" min="0" max="8" value="3" oninput="applyFilters()" />
        `;
        container.appendChild(div);
    }
}

// Application instantanée
function applyFilters() {
    filteredCombinations = [...allCombinations];
    const petitLimit = parseInt(petitLimitInput.value);
    const seq = document.getElementById('sommeSequence')?.value.split(',').map(Number) || sommeSequence;

    // Somme principale
    if (document.getElementById('somme-range')?.classList.contains('active')) {
        const min = parseInt(document.getElementById('sommeMin')?.value || 0);
        const max = parseInt(document.getElementById('sommeMax')?.value || 0);
        filteredCombinations = filteredCombinations.filter(c => {
            const sum = c.reduce((a, b) => a + (seq[b - 1] || b), 0);
            return sum >= min && sum <= max;
        });
    }

    // Sommes ajoutées
    document.querySelectorAll('#somme-filters .filter-instance').forEach(div => {
        const min = parseInt(div.querySelector('input:nth-of-type(1)')?.value || 0);
        const max = parseInt(div.querySelector('input:nth-of-type(2)')?.value || 0);
        filteredCombinations = filteredCombinations.filter(c => {
            const sum = c.reduce((a, b) => a + (seq[b - 1] || b), 0);
            return sum >= min && sum <= max;
        });
    });

    // Autres filtres
    ['pairs', 'impairs', 'petits', 'grands', 'consecutive'].forEach(id => {
        if (document.getElementById(id + '-range')?.classList.contains('active')) {
            const min = parseInt(document.getElementById(id + 'Min')?.value || 0);
            const max = parseInt(document.getElementById(id + 'Max')?.value || 8);
            let fn;
            switch (id) {
                case 'pairs': fn = c => c.filter(n => n % 2 === 0).length; break;
                case 'impairs': fn = c => c.filter(n => n % 2 === 1).length; break;
                case 'petits': fn = c => c.filter(n => n <= petitLimit).length; break;
                case 'grands': fn = c => c.filter(n => n > petitLimit).length; break;
                case 'consecutive': fn = c => {
                    let maxC = 0, cur = 1;
                    const sorted = [...c].sort((a, b) => a - b);
                    for (let i = 1; i < sorted.length; i++) {
                        if (sorted[i] === sorted[i - 1] + 1) cur++; else { maxC = Math.max(maxC, cur); cur = 1; }
                    }
                    return Math.max(maxC, cur);
                };
            }
            filteredCombinations = filteredCombinations.filter(c => fn(c) >= min && fn(c) <= max);
        }
    });

    // Groupe
    if (groupData.length) {
        filteredCombinations = filteredCombinations.filter(combo => {
            return groupData.every(group => {
                const matched = combo.filter(n => group.numbers.includes(n)).length;
                return matched >= group.min;
            });
        });
    }

    updateDisplay();
    updateCounter();
}

// Affichage stylisé
function updateDisplay() {
    const list = document.getElementById('combinationsList');
    list.innerHTML = '';
    const html = filteredCombinations.slice(0, 100).map(combo => {
        const formatted = combo.map(n => `<span class="large blue">${n}</span>`).join(' ');
        return `<div class="combination-item">${formatted}</div>`;
    }).join('');
    list.innerHTML = html;
    if (filteredCombinations.length > 100) {
        list.innerHTML += `<div style="text-align:center;color:#ffdd00;">... et ${filteredCombinations.length - 100} autres</div>`;
    }
}

// Recherche intelligente
function searchNumbers(query) {
    const nums = query.split(/\s+/).map(Number).filter(n => !isNaN(n));
    if (!nums.length) { updateDisplay(); return; }
    const list = document.getElementById('combinationsList');
    const filtered = allCombinations.filter(combo => nums.every(n => combo.includes(n)));
    list.innerHTML = filtered.slice(0, 100).map(combo => {
        const formatted = combo.map(n => `<span class="large blue">${n}</span>`).join(' ');
        return `<div class="combination-item">${formatted}</div>`;
    }).join('');
}

function updateCounter() {
    document.getElementById('counter').textContent = `${filteredCombinations.length}/${allCombinations.length}`;
}

// Statistiques enrichies
function showStats() {
    const modal = document.getElementById('statsModal');
    const content = document.getElementById('statsContent');

    const freq = {};
    filteredCombinations.flat().forEach(n => freq[n] = (freq[n] || 0) + 1);
    const sorted = Object.entries(freq).sort((a, b) => a[1] - b[1]);

    const groupFreq = {};
    groupData.flatMap(g => g.numbers).forEach(n => groupFreq[n] = (groupFreq[n] || 0) + 1);
    const groupSorted = Object.entries(groupFreq).sort((a, b) => a[1] - b[1]);

    let html = `<h4>📈 Arrivée générale (ordre croissant)</h4><ol>${sorted.map(([n, c]) => `<li>Cheval ${n}: ${c} fois</li>`).join('')}</ol>`;
    html += `<h4>📊 Chevaux présents dans les groupes</h4><ol>${groupSorted.map(([n, c]) => `<li>Cheval ${n}: ${c} fois</li>`).join('')}</ol>`;
    html += `<p>Total combinaisons: ${filteredCombinations.length}</p><p>Réduction: ${((1 - filteredCombinations.length / allCombinations.length) * 100).toFixed(1)}%</p>`;
    content.innerHTML = html;
    modal.style.display = 'block';
}

function closeStats() {
    document.getElementById('statsModal').style.display = 'none';
}

function resetAll() {
    location.reload();
}

generateCombinations();