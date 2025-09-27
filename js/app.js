/* app.js — con SweetAlert2 en feedback */

const MAX_TEAM = 6;

/* ===== Datos (desde js/data/pokedex.js o API) ===== */
let POKEDEX = Array.isArray(window.POKEDEX) ? window.POKEDEX : [];

/* ===== Estado & Storage ===== */
const LS_KEY = "pokeTeam:team";
let equipoPokemon = [];
let seleccionActual = null;

const $ = (s) => document.querySelector(s);

// ⚡️ ya no usamos msg() para feedback visible en <div id="msg">
// pero lo dejamos para casos neutros si quieres
const msg = (t) => {
	const m = $("#msg");
	if (m) m.textContent = t || "";
};

/* ===== Storage ===== */
function cargarEquipo() {
	try {
		const raw = localStorage.getItem(LS_KEY);
		equipoPokemon = raw ? JSON.parse(raw) : [];
		if (!Array.isArray(equipoPokemon)) equipoPokemon = [];
	} catch {
		equipoPokemon = [];
	}
	actualizarContador();
}
function guardarEquipo() {
	localStorage.setItem(LS_KEY, JSON.stringify(equipoPokemon));
	actualizarContador();
}
function actualizarContador() {
	const cur = $("#team-count");
	if (cur) cur.textContent = String(equipoPokemon.length);

	const max = $("#team-max");
	if (max) max.textContent = String(MAX_TEAM);
}

/* ===== Helpers ===== */
function normalizarNombre(str = "") {
	return String(str)
		.trim()
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]/g, "");
}
function getById(id) {
	const n = Number(id);
	return POKEDEX.find((p) => Number(p.id) === n) || null;
}
function isInTeam(id) {
	return equipoPokemon.some((x) => Number(x.id) === Number(id));
}
function typeClass(nombreTipo) {
	return `type--${normalizarNombre(nombreTipo)}`;
}
function spriteURLs(id) {
	const gid = Number(id);
	return {
		gif: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${gid}.gif`,
		png: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${gid}.png`,
	};
}

/* ===== Autocarga 151 si faltan ===== */
(async function autoLoadKanto() {
	try {
		if (!POKEDEX.length || POKEDEX.length < 151) {
			msg("Cargando Pokédex (151)…");
			const typeES = {
				normal: "Normal",
				fire: "Fuego",
				water: "Agua",
				grass: "Planta",
				electric: "Eléctrico",
				ice: "Hielo",
				fighting: "Lucha",
				poison: "Veneno",
				ground: "Tierra",
				flying: "Volador",
				psychic: "Psíquico",
				bug: "Bicho",
				rock: "Roca",
				ghost: "Fantasma",
				dragon: "Dragón",
				dark: "Siniestro",
				steel: "Acero",
				fairy: "Hada",
			};
			const list = await fetch(
				"https://pokeapi.co/api/v2/pokemon?limit=151"
			).then((r) => r.json());
			const datas = await Promise.all(
				list.results.map((x) => fetch(x.url).then((r) => r.json()))
			);
			POKEDEX = datas
				.map((d) => ({
					id: d.id,
					nombre: d.name.charAt(0).toUpperCase() + d.name.slice(1),
					tipos: d.types.map((t) => typeES[t.type.name] || t.type.name),
				}))
				.sort((a, b) => a.id - b.id);
			window.POKEDEX = POKEDEX;
			if (document.readyState !== "loading") {
				renderPokedex(POKEDEX);
				refreshListDisabledFlags();
			}
			msg("");
		}
	} catch (e) {
		console.warn("No se pudo cargar PokeAPI", e);
		Swal.fire({
			icon: "error",
			title: "Error",
			text: "No se pudo cargar la Pokédex desde la API.",
		});
	}
})();

/* ===== Equipo ===== */
function agregarAlEquipoPorId(id) {
	const p = getById(id);
	if (!p) {
		return Swal.fire({
			icon: "error",
			title: "Pokédex",
			text: "❌ Ese Pokémon no está en la Pokédex de Kanto.",
		});
	}
	if (isInTeam(p.id)) {
		return Swal.fire({
			icon: "warning",
			title: "Equipo",
			text: `⚠️ ${p.nombre} ya está en tu equipo.`,
		});
	}
	if (equipoPokemon.length >= MAX_TEAM) {
		return Swal.fire({
			icon: "error",
			title: "Equipo completo",
			text: `Solo puedes tener ${MAX_TEAM} Pokémon en tu equipo.`,
		});
	}

	equipoPokemon.push({ id: p.id, nombre: p.nombre, tipos: p.tipos || [] });
	Swal.fire({
		icon: "success",
		title: "¡Agregado!",
		text: `✅ ${p.nombre} fue agregado a tu equipo.`,
		timer: 1500,
		showConfirmButton: false,
	});

	renderTeam();
	actualizarEstadoFull();
	markCardState(p.id);
	const card = document.querySelector(`#pokedex-list .card[data-id="${p.id}"]`);
	if (card) card.classList.remove("selected");

	renderDetail(seleccionActual);
}

function quitarDelEquipo(id) {
	const idx = equipoPokemon.findIndex((p) => Number(p.id) === Number(id));
	if (idx === -1) return;

	Swal.fire({
		title: "¿Seguro?",
		text: "Este Pokémon será eliminado del equipo.",
		icon: "warning",
		showCancelButton: true,
		confirmButtonColor: "#3085d6",
		cancelButtonColor: "#d33",
		confirmButtonText: "Sí, eliminar",
	}).then((result) => {
		if (result.isConfirmed) {
			const [removed] = equipoPokemon.splice(idx, 1);
			Swal.fire({
				icon: "info",
				title: "Eliminado",
				text: `🗑️ ${removed.nombre} fue eliminado del equipo.`,
				timer: 1500,
				showConfirmButton: false,
			});
			renderTeam();
			actualizarEstadoFull();
			markCardState(id);
			renderDetail(seleccionActual);
		}
	});
}

function vaciarEquipo() {
	equipoPokemon = [];
	Swal.fire({
		icon: "info",
		title: "Equipo reiniciado",
		text: "🧹 Empezamos de nuevo.",
	});
	renderTeam();
	actualizarEstadoFull();
	refreshListDisabledFlags();
	renderDetail(null);
}

/* ===== Render Pokédex & Team ===== */
// ... (aquí no cambia nada de tu renderPokedex, renderTeam, renderDetail, etc.)

/* ===== Eventos ===== */
// ... (igual que tu versión original)
