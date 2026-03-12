const MAX_POKEMON = 151;

function formatName(name) {
  return name.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function showPokemonInfo(id) {
  const status = document.getElementById('pokedex-status');
  const detail = document.getElementById('pokemon-detail');

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!response.ok) throw new Error();

    const pokemon = await response.json();
    const types = pokemon.types.map((item) => formatName(item.type.name)).join(', ');
    const abilities = pokemon.abilities.map((item) => formatName(item.ability.name)).join(', ');

    const hp = pokemon.stats.find((s) => s.stat.name === 'hp')?.base_stat || 0;
    const attack = pokemon.stats.find((s) => s.stat.name === 'attack')?.base_stat || 0;
    const defense = pokemon.stats.find((s) => s.stat.name === 'defense')?.base_stat || 0;
    const speed = pokemon.stats.find((s) => s.stat.name === 'speed')?.base_stat || 0;

    detail.innerHTML = `
      <img
        class="pokemon-detail-img"
        src="${pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default}"
        alt="${formatName(pokemon.name)}"
      />
      <div class="pokemon-detail-info">
        <h2>#${pokemon.id} ${formatName(pokemon.name)}</h2>
        <p><strong>Tipo:</strong> ${types}</p>
        <p><strong>Habilidades:</strong> ${abilities}</p>
        <div class="pokemon-detail-stats">
          <span>HP: ${hp}</span>
          <span>Ataque: ${attack}</span>
          <span>Defensa: ${defense}</span>
          <span>Velocidad: ${speed}</span>
        </div>
      </div>
    `;

    status.textContent = `Mostrando detalle de ${formatName(pokemon.name)}.`;
  } catch {
    detail.innerHTML = '';
    status.textContent = 'No se pudo cargar ese Pokemon.';
  }
}

async function initPokedex() {
  const status = document.getElementById('pokedex-status');
  const list = document.getElementById('pokedex-list');
  const detail = document.getElementById('pokemon-detail');

  status.textContent = 'Cargando Pokemon...';
  detail.innerHTML = '';

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON}`);
    const data = await response.json();

    list.innerHTML = data.results
      .map((pokemon, index) => {
        const id = index + 1;
        return `<button class="pokemon-name-item" type="button" data-id="${id}">#${id} ${formatName(pokemon.name)}</button>`;
      })
      .join('');

    status.textContent = `Mostrando ${data.results.length} Pokemon. Toca uno para ver su informacion.`;

    list.addEventListener('click', (event) => {
      const button = event.target.closest('.pokemon-name-item');
      if (!button) return;
      showPokemonInfo(button.dataset.id);
    });
  } catch {
    status.textContent = 'Error cargando la Pokedex. Intenta de nuevo.';
  }
}

document.addEventListener('DOMContentLoaded', initPokedex);
