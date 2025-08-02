// ------------------------------
// VARIABLES Y CONSTANTES INICIALES
// ------------------------------

const MAX_EQUIPO = 6;
let equipoPokemon = [];
const pokedex = ["Pikachu", "Charmander", "Bulbasaur", "Squirtle", "Eevee", "Snorlax", "Jigglypuff", "Psyduck"];

// ------------------------------
// FUNCIONES DEL SIMULADOR
// ------------------------------

// Función para mostrar la Pokédex disponible
function mostrarPokedex() {
  console.log("📘 Pokédex disponible:");
  pokedex.forEach((pokemon, index) => {
    console.log(`${index + 1}. ${pokemon}`);
  });
}

// Función para agregar un Pokémon al equipo
function agregarPokemon() {
  mostrarPokedex();

  while (equipoPokemon.length < MAX_EQUIPO) {
    let eleccion = prompt(`¿Qué Pokémon quieres agregar a tu equipo? (escribe su nombre o "salir")`);

    if (!eleccion) continue;
    eleccion = eleccion.trim();

    if (eleccion.toLowerCase() === "salir") {
      let confirmacion = confirm("¿Estás segur@ que quieres terminar?");
      if (confirmacion) break;
      else continue;
    }

    if (!pokedex.includes(eleccion)) {
      alert("❌ Ese Pokémon no está en la Pokédex.");
      continue;
    }

    if (equipoPokemon.includes(eleccion)) {
      alert("⚠️ Ese Pokémon ya está en tu equipo.");
      continue;
    }

    equipoPokemon.push(eleccion);
    alert(`✅ ${eleccion} fue agregado a tu equipo (${equipoPokemon.length}/${MAX_EQUIPO})`);
  }
}

// Función para mostrar el equipo final
function mostrarEquipoFinal() {
  if (equipoPokemon.length === 0) {
    alert("❌ No agregaste ningún Pokémon.");
  } else {
    alert("✅ Tu equipo está completo. Revisa la consola.");
    console.log("🔥 EQUIPO FINAL 🔥");
    equipoPokemon.forEach((poke, i) => {
      console.log(`${i + 1}. ${poke}`);
    });
  }
}

// ------------------------------
// INICIO DEL SIMULADOR
// ------------------------------

alert("¡Bienvenido/a al simulador de equipo Pokémon!");
agregarPokemon();
mostrarEquipoFinal();
