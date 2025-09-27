/* app.js — estados disabled en lista y CTA, GIFs en team, max 6 con “listo”, y 151 por PokeAPI */

const MAX_TEAM = 6;

/* ===== Datos (desde js/data/pokedex.js o API) ===== */
let POKEDEX = Array.isArray(window.POKEDEX) ? window.POKEDEX : [];

/* ===== Estado & Storage ===== */
const LS_KEY = "pokeTeam:team";
let equipoPokemon = [];
let seleccionActual = null;

const $ = (s) => document.querySelector(s);
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
		msg("No se pudo cargar la Pokédex desde la API.");
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
function renderPokedex(lista) {
	const ul = $("#pokedex-list");
	if (!ul) return;
	ul.innerHTML = "";
	lista.forEach((p) => {
		const li = document.createElement("li");
		li.className = "card card-list clickable";
		li.dataset.id = p.id;
		const { gif, png } = spriteURLs(p.id);
		li.innerHTML = `
      <div class="thumb"><img class="poke-img" loading="lazy" alt="${
				p.nombre
			}"></div>
      <div class="content">
        <h3>${p.nombre}</h3>
        <div class="badge">#${p.id} · ${(p.tipos || []).join(" / ")}</div>
      </div>`;
		const img = li.querySelector("img");
		img.src = gif;
		img.addEventListener("error", () => (img.src = png));
		ul.appendChild(li);
	});

	// flags de disabled por pertenecer al team
	refreshListDisabledFlags();

	// Mantén highlight si aplica y no está in-team
	if (seleccionActual && !isInTeam(seleccionActual.id)) {
		const card = ul.querySelector(`.card[data-id="${seleccionActual.id}"]`);
		if (card) card.classList.add("selected");
		else seleccionActual = null;
	} else if (seleccionActual && isInTeam(seleccionActual.id)) {
		seleccionActual = getById(seleccionActual.id); // mantiene detalle, pero sin highlight en lista
	}
}

function renderTeam() {
	const ul = $("#team-list");
	if (!ul) return;
	ul.innerHTML = "";
	equipoPokemon.forEach((p) => {
		const li = document.createElement("li");
		li.className = "card team-item";
		const tipos = (p.tipos || [])
			.map((t) => `<span class="type-badge ${typeClass(t)}">${t}</span>`)
			.join(" ");
		const { gif, png } = spriteURLs(p.id);
		li.innerHTML = `
      <div class="thumb-sm"><img class="poke-img-sm" alt="${p.nombre}"></div>
      <div class="team-content">
        <h3>${p.nombre}</h3>
        <div class="badge">#${p.id}</div>
        <div class="types">${tipos}</div>
      </div>
      <button class="btn-x" data-id="${p.id}" title="Quitar">×</button>`;
		const img = li.querySelector("img");
		img.src = gif;
		img.addEventListener("error", () => (img.src = png));
		ul.appendChild(li);
	});
	guardarEquipo();
}

/* ===== Detalle ===== */
function renderDetail(p) {
	const card = $("#detail-card");
	if (!card) return;

	// Equipo completo: sin botón
	if (document.body.classList.contains("team-full")) {
		card.classList.remove("empty");
		card.innerHTML = `
      <div class="detail-head">
        <div class="detail-thumb" style="display:grid;place-items:center;font-size:42px;">🎉</div>
        <div class="detail-meta">
          <h3>¡Tu equipo está listo!</h3>
          <div class="badge">(${equipoPokemon.length}/${MAX_TEAM})</div>
          <p class="badge">Puedes empezar de nuevo.</p>
        </div>
      </div>`;
		return;
	}

	if (!p) {
		card.classList.add("empty");
		card.innerHTML = `
      <p>Selecciona un Pokémon de la lista para ver detalles.</p>
      <button id="detail-add" class="primary wide" type="button" disabled>Agregar</button>`;
		return;
	}

	const { gif, png } = spriteURLs(p.id);
	const tipos = (p.tipos || [])
		.map((t) => `<span class="type-badge ${typeClass(t)}">${t}</span>`)
		.join(" ");
	card.classList.remove("empty");
	card.innerHTML = `
    <div class="detail-head">
      <div class="detail-thumb"><img id="detail-img" alt="${p.nombre}"></div>
      <div class="detail-meta">
        <h3>${p.nombre}</h3>
        <div class="badge">Número #${p.id}</div>
        <div class="types">${tipos}</div>
      </div>
    </div>
    <button id="detail-add" class="primary wide" type="button">Agregar</button>`;
	const img = card.querySelector("#detail-img");
	img.src = gif;
	img.addEventListener("error", () => (img.src = png));

	actualizarBotonDetalle();
}

/* ===== List disabled flags ===== */
function markCardState(id) {
	const card = document.querySelector(`#pokedex-list .card[data-id="${id}"]`);
	if (!card) return;
	const inTeam = isInTeam(id);
	card.classList.toggle("in-team", inTeam);
	card.classList.toggle("clickable", !inTeam);
	card.setAttribute("aria-disabled", inTeam ? "true" : "false");
}

function refreshListDisabledFlags() {
	document.querySelectorAll("#pokedex-list .card").forEach((card) => {
		const id = Number(card.dataset.id);
		const inTeam = isInTeam(id);
		card.classList.toggle("in-team", inTeam);
		card.classList.toggle("clickable", !inTeam);
		card.setAttribute("aria-disabled", inTeam ? "true" : "false");
		// si quedó seleccionada pero ahora está in-team, quita highlight
		if (inTeam) card.classList.remove("selected");
	});
}

/* ===== Selección & estados ===== */
function selectPokemon(id) {
	if (document.body.classList.contains("team-full")) return;
	if (isInTeam(id)) return; // ya está deshabilitada, ignore
	const p = getById(id);
	seleccionActual = p || null;

	document
		.querySelectorAll("#pokedex-list .card")
		.forEach((c) => c.classList.remove("selected"));
	const card = document.querySelector(`#pokedex-list .card[data-id="${id}"]`);
	if (card) card.classList.add("selected");

	renderDetail(seleccionActual);
}

function actualizarBotonDetalle() {
	const addBtn = $("#detail-add");
	if (!addBtn) return;

	const full = equipoPokemon.length >= MAX_TEAM;
	const hasSel = !!seleccionActual;
	const duplicado = hasSel && isInTeam(seleccionActual.id);

	// label + disabled
	let label = "Agregar";
	let disabled = false;

	if (!hasSel) {
		disabled = true;
	}
	if (full) {
		disabled = true;
		label = "Equipo completo";
	} else if (duplicado) {
		disabled = true;
		label = "Ya esta en tu equipo";
	}

	// estados visuales para que funcionan para el CSS (verde, gris, vacío)
	addBtn.classList.toggle("is-in-team", !full && hasSel && duplicado);
	addBtn.classList.toggle("is-full", full);
	addBtn.classList.toggle("is-empty", !hasSel && !full);

	addBtn.disabled = disabled;
	addBtn.textContent = label;
}

function actualizarEstadoFull() {
	const full = equipoPokemon.length >= MAX_TEAM;
	document.body.classList.toggle("team-full", full);
	const clearBtn = $("#clear-team");
	if (clearBtn) clearBtn.textContent = full ? "Empezar de nuevo" : "Vaciar";
	if (full) {
		Swal.fire({
			icon: "success",
			title: "¡Tu equipo está listo!",
			text: `🎉 (${MAX_TEAM}/${MAX_TEAM}) Pokémons seleccionados.`,
		});
	} else {
		msg("");
	}
}

/* ===== Eventos ===== */
document.addEventListener("DOMContentLoaded", () => {
	cargarEquipo();
	renderPokedex(POKEDEX);
	renderTeam();
	renderDetail(null);
	actualizarEstadoFull();

	$("#pokedex-list")?.addEventListener("click", (e) => {
		const card = e.target.closest(".card");
		if (!card || card.classList.contains("in-team")) return; // lista disabled
		const id = Number(card.dataset.id);
		if (!id) return;
		selectPokemon(id);
	});

	$(".detail")?.addEventListener("click", (e) => {
		const add = e.target.closest("#detail-add");
		if (!add || !seleccionActual) return;
		agregarAlEquipoPorId(seleccionActual.id);
	});

	$("#team-list")?.addEventListener("click", (e) => {
		const x = e.target.closest(".btn-x");
		if (!x) return;
		if (document.body.classList.contains("team-full")) return;
		quitarDelEquipo(Number(x.dataset.id));
	});

	$("#clear-team")?.addEventListener("click", () => vaciarEquipo());

	$("#search-form")?.addEventListener("submit", (e) => {
		e.preventDefault();
		const q = ($("#search-input")?.value || "").trim();
		if (!q) {
			renderPokedex(POKEDEX);
			renderDetail(seleccionActual);
			return;
		}
		const nq = normalizarNombre(q);
		const results = POKEDEX.filter(
			(p) =>
				normalizarNombre(p.nombre).includes(nq) ||
				(p.tipos || []).some((t) => normalizarNombre(t).includes(nq))
		);
		renderPokedex(results);
		if (seleccionActual && !results.some((r) => r.id === seleccionActual.id)) {
			seleccionActual = null;
			renderDetail(null);
		}
		if (!results.length) {
			Swal.fire({
				icon: "info",
				title: "Sin resultados",
				text: "No encontramos Pokémon con ese nombre o tipo.",
			});
		} else {
			msg(`Resultados: ${results.length}`);
		}
	});
});
