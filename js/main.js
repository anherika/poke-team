// 🧠 Pokédex de la primera generación
const pokedex = [
  "Bulbasaur", "Ivysaur", "Venusaur", "Charmander", "Charmeleon", "Charizard",
  "Squirtle", "Wartortle", "Blastoise", "Caterpie", "Metapod", "Butterfree",
  "Weedle", "Kakuna", "Beedrill", "Pidgey", "Pidgeotto", "Pidgeot",
  "Rattata", "Raticate", "Spearow", "Fearow", "Ekans", "Arbok", "Pikachu",
  "Raichu", "Sandshrew", "Sandslash", "Nidoran♀", "Nidorina", "Nidoqueen",
  "Nidoran♂", "Nidorino", "Nidoking", "Clefairy", "Clefable", "Vulpix",
  "Ninetales", "Jigglypuff", "Wigglytuff", "Zubat", "Golbat", "Oddish",
  "Gloom", "Vileplume", "Paras", "Parasect", "Venonat", "Venomoth",
  "Diglett", "Dugtrio", "Meowth", "Persian", "Psyduck", "Golduck",
  "Mankey", "Primeape", "Growlithe", "Arcanine", "Poliwag", "Poliwhirl",
  "Poliwrath", "Abra", "Kadabra", "Alakazam", "Machop", "Machoke",
  "Machamp", "Bellsprout", "Weepinbell", "Victreebel", "Tentacool",
  "Tentacruel", "Geodude", "Graveler", "Golem", "Ponyta", "Rapidash",
  "Slowpoke", "Slowbro", "Magnemite", "Magneton", "Farfetch’d", "Doduo",
  "Dodrio", "Seel", "Dewgong", "Grimer", "Muk", "Shellder", "Cloyster",
  "Gastly", "Haunter", "Gengar", "Onix", "Drowzee", "Hypno", "Krabby",
  "Kingler", "Voltorb", "Electrode", "Exeggcute", "Exeggutor", "Cubone",
  "Marowak", "Hitmonlee", "Hitmonchan", "Lickitung", "Koffing", "Weezing",
  "Rhyhorn", "Rhydon", "Chansey", "Tangela", "Kangaskhan", "Horsea",
  "Seadra", "Goldeen", "Seaking", "Staryu", "Starmie", "Mr. Mime",
  "Scyther", "Jynx", "Electabuzz", "Magmar", "Pinsir", "Tauros", "Magikarp",
  "Gyarados", "Lapras", "Ditto", "Eevee", "Vaporeon", "Jolteon", "Flareon",
  "Porygon", "Omanyte", "Omastar", "Kabuto", "Kabutops", "Aerodactyl",
  "Snorlax", "Articuno", "Zapdos", "Moltres", "Dratini", "Dragonair",
  "Dragonite", "Mewtwo", "Mew"
];

// 🎒 Equipo Pokémon del jugador
let equipoPokemon = [];

// 🧼 Función para normalizar el texto (ignora tildes, mayúsculas, espacios)
function normalizarNombre(nombre) {
  return nombre
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, ""); // quita símbolos, espacios, comillas, etc.
}

// 🧩 Función para agregar un Pokémon al equipo
function agregarAlEquipo(nombre) {
  if (!nombre || typeof nombre !== "string") {
    alert("Por favor, ingresa un nombre válido.");
    return;
  }

  const entradaNormalizada = normalizarNombre(nombre);
  const pokemonValido = pokedex.find(p => normalizarNombre(p) === entradaNormalizada);

  if (!pokemonValido) {
    alert("❌ Ese Pokémon no está en la Pokédex de Kanto.");
    return;
  }

  if (equipoPokemon.includes(pokemonValido)) {
    alert("⚠️ Ese Pokémon ya está en tu equipo.");
    return;
  }

  if (equipoPokemon.length >= 6) {
    alert("🚫 Ya tienes 6 Pokémon en tu equipo.");
    return;
  }

  equipoPokemon.push(pokemonValido);
  alert(`✅ ${pokemonValido} fue agregado a tu equipo.`);
  console.log("📦 Equipo actual:", equipoPokemon);
}

// 📋 Función para mostrar el equipo final
function mostrarEquipoFinal() {
  if (equipoPokemon.length === 0) {
    alert("Aún no has agregado ningún Pokémon.");
  } else {
    alert("🎉 ¡Tu equipo está completo! Revisa la consola.");
    console.log("🔽 TU EQUIPO POKÉMON 🔽");
    equipoPokemon.forEach((poke, index) => {
      console.log(`${index + 1}. ${poke}`);
    });
  }
}

// 🧼 Función para reiniciar todo
function reiniciarEquipo() {
  equipoPokemon = [];
  alert("🔁 Has reiniciado tu equipo.");
  console.clear();
}

// 🎮 Función interactiva con prompt + confirm
function simuladorInteractivo() {
  alert("¡Bienvenido! Esta Pokédex contiene los 151 Pokémon de la primera generación.");

  while (equipoPokemon.length < 6) {
    const nombre = prompt("Ingresa el nombre de un Pokémon para agregar (o escribe 'salir'):");

    if (!nombre || nombre.toLowerCase() === "salir") {
      const salir = confirm("¿Quieres salir y mostrar tu equipo?");
      if (salir) break;
      else continue;
    }

    agregarAlEquipo(nombre);
  }

  mostrarEquipoFinal();
}

// 🟢 Mensaje inicial (por si no usan el modo interactivo)
alert("Usa la función agregarAlEquipo('nombre') en consola para armar tu equipo.\nTambién puedes ejecutar simuladorInteractivo() para usar el modo completo.");
simuladorInteractivo();