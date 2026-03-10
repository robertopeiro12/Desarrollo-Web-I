// ============== POKEMON BATTLE GAME ==============

// --- Constants ---
const MISS_CHANCE = 0.20;
const DEFENSE_FAIL_CHANCE = 0.25;
const SPECIAL_ATTACK_TURN = 4;   // Ataque especial disponible desde turno 4 (3 turnos deben pasar)
const SPECIAL_DEFENSE_TURN = 3;  // Defensa especial disponible desde turno 3 (2 turnos deben pasar)
const USE_SPECIAL_ATTACK_CHANCE = 0.4;
const USE_DEFENSE_CHANCE = 0.3;
const USE_SPECIAL_DEFENSE_CHANCE = 0.35;
const TURN_DELAY_MS = 1200;

// --- State ---
let selectedPokemon = [null, null];
let battleState = null;
let battleInterval = null;

// --- Helpers ---
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatMoveName(name) {
  return name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// --- Load Pokemon Lists ---
async function loadPokemonLists() {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
    const data = await response.json();

    const select1 = document.getElementById('select-pokemon1');
    const select2 = document.getElementById('select-pokemon2');
    select1.innerHTML = '<option value="">-- Elige un Pokemon --</option>';
    select2.innerHTML = '<option value="">-- Elige un Pokemon --</option>';

    data.results.forEach((pokemon, index) => {
      const id = index + 1;
      const name = formatMoveName(pokemon.name);
      const opt1 = document.createElement('option');
      opt1.value = id;
      opt1.textContent = name;
      select1.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = id;
      opt2.textContent = name;
      select2.appendChild(opt2);
    });
  } catch (error) {
    console.error('Error cargando Pokemon:', error);
  }
}

// --- Select Pokemon ---
async function selectPokemon(slot, id) {
  if (!id) {
    selectedPokemon[slot] = null;
    document.getElementById(`selected${slot + 1}-img`).style.display = 'none';
    document.getElementById(`selected${slot + 1}-name`).textContent = 'Sin seleccionar';
    checkStartButton();
    return;
  }
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const pokemon = await response.json();

    const allMoves = pokemon.moves.map(m => m.move.name);
    const shuffled = [...allMoves].sort(() => Math.random() - 0.5);
    const pickedMoves = shuffled.slice(0, Math.min(4, shuffled.length));

    selectedPokemon[slot] = {
      id: pokemon.id,
      name: formatMoveName(pokemon.name),
      sprite: pokemon.sprites.front_default,
      officialArt: pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default,
      stats: {
        attack: pokemon.stats[1].base_stat,
        defense: pokemon.stats[2].base_stat,
        spAttack: pokemon.stats[3].base_stat,
        spDefense: pokemon.stats[4].base_stat,
        speed: pokemon.stats[5].base_stat,
      },
      moves: pickedMoves,
    };

    const img = document.getElementById(`selected${slot + 1}-img`);
    img.src = pokemon.sprites.front_default;
    img.alt = selectedPokemon[slot].name;
    img.style.display = 'block';
    document.getElementById(`selected${slot + 1}-name`).textContent = selectedPokemon[slot].name;
    checkStartButton();
  } catch (error) {
    console.error('Error seleccionando Pokemon:', error);
  }
}

function checkStartButton() {
  document.getElementById('start-battle-btn').disabled = !(selectedPokemon[0] && selectedPokemon[1]);
}

// --- Start Battle ---
function startBattle() {
  if (!selectedPokemon[0] || !selectedPokemon[1]) return;

  // Higher speed goes first
  let first = 0, second = 1;
  if (selectedPokemon[1].stats.speed > selectedPokemon[0].stats.speed) {
    first = 1; second = 0;
  } else if (selectedPokemon[1].stats.speed === selectedPokemon[0].stats.speed) {
    if (Math.random() < 0.5) { first = 1; second = 0; }
  }

  battleState = {
    fighters: [
      { ...selectedPokemon[first], hp: 100 },
      { ...selectedPokemon[second], hp: 100 },
    ],
    turnNumber: 1,
    finished: false,
  };

  // Switch phases
  document.getElementById('selection-phase').style.display = 'none';
  document.getElementById('battle-phase').style.display = 'block';

  // Set up arena
  for (let i = 0; i < 2; i++) {
    const f = battleState.fighters[i];
    document.getElementById(`fighter${i + 1}-img`).src = f.sprite;
    document.getElementById(`fighter${i + 1}-img`).alt = f.name;
    document.getElementById(`fighter${i + 1}-name`).textContent = f.name;
    document.getElementById(`fighter${i + 1}-hp-fill`).style.width = '100%';
    document.getElementById(`fighter${i + 1}-hp-fill`).style.backgroundColor = '#4caf50';
    document.getElementById(`fighter${i + 1}-hp-text`).textContent = '100%';
  }

  document.getElementById('battle-log').innerHTML = '';
  addBattleLog(`La batalla comienza: <strong>${battleState.fighters[0].name}</strong> vs <strong>${battleState.fighters[1].name}</strong>`);
  addBattleLog(`${battleState.fighters[0].name} tiene mayor velocidad y ataca primero.`);

  // Turnos automaticos
  battleInterval = setInterval(() => {
    if (battleState.finished) {
      clearInterval(battleInterval);
      battleInterval = null;
      return;
    }
    executeTurn();
  }, TURN_DELAY_MS);
}

// --- Execute Turn ---
function executeTurn() {
  if (battleState.finished) return;

  const turn = battleState.turnNumber;
  const attackerIdx = (turn - 1) % 2;
  const defenderIdx = 1 - attackerIdx;
  const attacker = battleState.fighters[attackerIdx];
  const defender = battleState.fighters[defenderIdx];

  // Choose attack type
  let isSpecialAttack = false;
  if (turn >= SPECIAL_ATTACK_TURN && Math.random() < USE_SPECIAL_ATTACK_CHANCE) {
    isSpecialAttack = true;
  }

  const moveName = formatMoveName(
    attacker.moves[randomInt(0, attacker.moves.length - 1)]
  );
  const attackLabel = isSpecialAttack ? 'Ataque Especial' : 'Ataque';

  // Check miss
  if (Math.random() < MISS_CHANCE) {
    addBattleLog(
      `<strong>Turno ${turn}:</strong> Es turno de <strong>${attacker.name}</strong>. ` +
      `Uso <em>${moveName}</em> (${attackLabel})... pero fallo!`
    );
    battleState.turnNumber++;
    return;
  }

  // Calculate base damage
  let damage;
  if (isSpecialAttack) {
    const base = randomInt(18, 30);
    const mult = 0.5 + 0.5 * (attacker.stats.spAttack / (attacker.stats.spAttack + defender.stats.spDefense));
    damage = Math.round(base * mult);
  } else {
    const base = randomInt(8, 15);
    const mult = 0.5 + 0.5 * (attacker.stats.attack / (attacker.stats.attack + defender.stats.defense));
    damage = Math.round(base * mult);
  }

  // Check defense
  let defenseMsg = '';
  if (turn >= SPECIAL_DEFENSE_TURN && Math.random() < USE_SPECIAL_DEFENSE_CHANCE) {
    if (Math.random() < DEFENSE_FAIL_CHANCE) {
      defenseMsg = ` ${defender.name} intento usar <strong>Defensa Especial</strong> pero fallo!`;
    } else {
      damage = Math.max(1, Math.round(damage * 0.3));
      defenseMsg = ` ${defender.name} uso <strong>Defensa Especial</strong> y redujo mucho el dano.`;
    }
  } else if (Math.random() < USE_DEFENSE_CHANCE) {
    if (Math.random() < DEFENSE_FAIL_CHANCE) {
      defenseMsg = ` ${defender.name} intento defenderse pero fallo!`;
    } else {
      damage = Math.max(1, Math.round(damage * 0.5));
      defenseMsg = ` ${defender.name} se defendio y redujo el dano.`;
    }
  }

  // Apply damage
  damage = Math.min(damage, defender.hp);
  defender.hp -= damage;

  addBattleLog(
    `<strong>Turno ${turn}:</strong> Es turno de <strong>${attacker.name}</strong>. ` +
    `Uso <em>${moveName}</em> (${attackLabel}).${defenseMsg} ` +
    `Hizo <strong>${damage}</strong> de dano. ` +
    `${defender.name} tiene <strong>${defender.hp}%</strong> de vida.`
  );

  updateHPBars();

  // Check winner
  if (defender.hp <= 0) {
    battleState.finished = true;
    addBattleLog(`<br><strong>${attacker.name} ha ganado la batalla!</strong>`);
    setTimeout(() => showWinner(attacker), 1500);
    return;
  }

  battleState.turnNumber++;
}

// --- UI Helpers ---
function updateHPBars() {
  for (let i = 0; i < 2; i++) {
    const hp = battleState.fighters[i].hp;
    const fill = document.getElementById(`fighter${i + 1}-hp-fill`);
    const text = document.getElementById(`fighter${i + 1}-hp-text`);
    fill.style.width = `${hp}%`;
    text.textContent = `${hp}%`;

    if (hp > 50) fill.style.backgroundColor = '#4caf50';
    else if (hp > 25) fill.style.backgroundColor = '#ff9800';
    else fill.style.backgroundColor = '#f44336';
  }
}

function addBattleLog(message) {
  const log = document.getElementById('battle-log');
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = message;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

function showWinner(winner) {
  document.getElementById('battle-phase').style.display = 'none';
  const winnerPhase = document.getElementById('winner-phase');
  winnerPhase.style.display = 'flex';
  document.getElementById('winner-img').src = winner.officialArt || winner.sprite;
  document.getElementById('winner-name').textContent = winner.name;
}

function resetGame() {
  if (battleInterval) {
    clearInterval(battleInterval);
    battleInterval = null;
  }
  selectedPokemon = [null, null];
  battleState = null;

  document.getElementById('winner-phase').style.display = 'none';
  document.getElementById('battle-phase').style.display = 'none';
  document.getElementById('selection-phase').style.display = 'block';

  document.getElementById('select-pokemon1').value = '';
  document.getElementById('select-pokemon2').value = '';
  document.getElementById('selected1-img').style.display = 'none';
  document.getElementById('selected2-img').style.display = 'none';
  document.getElementById('selected1-name').textContent = 'Sin seleccionar';
  document.getElementById('selected2-name').textContent = 'Sin seleccionar';
  document.getElementById('start-battle-btn').disabled = true;
  document.getElementById('battle-log').innerHTML = '';
}

// --- Init ---
window.addEventListener('DOMContentLoaded', () => {
  loadPokemonLists();

  document.getElementById('select-pokemon1').addEventListener('change', (e) => selectPokemon(0, e.target.value));
  document.getElementById('select-pokemon2').addEventListener('change', (e) => selectPokemon(1, e.target.value));
  document.getElementById('start-battle-btn').addEventListener('click', startBattle);
  document.getElementById('new-battle-btn').addEventListener('click', resetGame);
});
