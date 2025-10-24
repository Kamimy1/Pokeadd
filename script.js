// script.js
const container = document.getElementById('pokemon-container');
const buttons = document.querySelectorAll('#generation-buttons button');
const pokedexType = document.getElementById('pokedex-type');

// Verificar si el usuario está logueado
const isLoggedIn = document.body.dataset.logged === "true";
const currentUser = document.body.dataset.usuario || "";
let pokemonsCapturados = [];

// Función para capitalizar
function capitalizar(texto) {
  return texto
    .split('-')
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

// Generaciones de Pokémon
const generationEndpoints = {
  1: 'https://pokeapi.co/api/v2/generation/1/',
  2: 'https://pokeapi.co/api/v2/generation/2/',
  3: 'https://pokeapi.co/api/v2/generation/3/'
};

// Manejar clics de botones de generación
buttons.forEach(button => {
  button.addEventListener('click', () => {
    buttons.forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    const gen = parseInt(button.getAttribute('data-gen'));
    loadGeneration(gen);
  });
});

// Cambiar tipo de Pokédex
pokedexType.addEventListener('change', () => {
  const active = document.querySelector('#generation-buttons button.active');
  const gen = active ? parseInt(active.dataset.gen) : 1;
  loadGeneration(gen);
});

// Cargar generación
function loadGeneration(genNumber) {
  container.innerHTML = 'Cargando...';
  const type = pokedexType.value;

  // Limpiar contenedor
  const gensToLoad = type === "nacional"
    ? Array.from({ length: genNumber }, (_, i) => i + 1)
    : [genNumber];

  // Obtener Pokémon capturados
  const queryCapturas = isLoggedIn
    ? fetch(`get_capturas.php?usuario=${currentUser}&generacion=${genNumber}&tipo=${type}`)
        .then(res => res.json())
    : Promise.resolve([]);

  queryCapturas.then(data => {
    if (Array.isArray(data)) {
      pokemonsCapturados = data;
    }

    // Carga de las generaciones
    Promise.all(
      gensToLoad.map(num => fetch(generationEndpoints[num]).then(res => res.json()))
    ).then(async generations => {
      // Obtener todos los Pokémon de las generaciones
      const allSpecies = generations.flatMap(g => g.pokemon_species);

      // Ordenar por ID
      allSpecies.sort((a, b) => {
        const idA = parseInt(a.url.split('/')[6]);
        const idB = parseInt(b.url.split('/')[6]);
        return idA - idB;
      });

      const pokemons = [];

      // Obtener datos de cada Pokémon
      for (let species of allSpecies) {
        try {
          const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${species.name}`);
          if (res.ok) {
            const data = await res.json();
            pokemons.push(data);
          }
        } catch (err) {
          console.warn("Error con " + species.name);
        }
      }

      container.innerHTML = '';
      // Crear tarjetas de Pokémon
      pokemons.forEach(pokemon => {
        const card = document.createElement('div');
        card.className = 'pokemon-card';

        const isCapturado = pokemonsCapturados.some(
          c => c.id_pokemon === pokemon.id && c.id_generacion === genNumber
        );

        const tipos = pokemon.types.map(t => capitalizar(t.type.name)).join(', ');

        const tipoPrincipal = pokemon.types[0].type.name.toLowerCase();
        card.classList.add(`tipo-${tipoPrincipal}`);

        // Crear el HTML de la tarjeta
        card.innerHTML = `
          <img src="${pokemon.sprites.front_default}" alt="${capitalizar(pokemon.name)}">
          <div>
            <a href="detalle_pokemon/pokemon.html?name=${pokemon.name}" class="nombre-link">
              <strong>${capitalizar(pokemon.name)}</strong>
            </a>
          </div>
          <div>${tipos}</div>
          ${isLoggedIn ? `
            <label>
              <input type="checkbox" class="captura-checkbox" data-id="${pokemon.id}" ${isCapturado ? 'checked' : ''}>
              Capturado
            </label>` : ''}
        `;



        container.appendChild(card);
      });
      // Agregar evento a los checkboxes
      if (isLoggedIn) {
        document.querySelectorAll('.captura-checkbox').forEach(cb => {
          cb.addEventListener('change', e => {
            const idPokemon = e.target.dataset.id;
            const capturado = e.target.checked;

            fetch('captura.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: `id_pokemon=${idPokemon}&capturado=${capturado}&id_generacion=${genNumber}`
            });
          });
        });
      }
    });
  });
}

// Inicializar con generación 1 por defecto
document.querySelector('button[data-gen="1"]').classList.add('active');
loadGeneration(1);
