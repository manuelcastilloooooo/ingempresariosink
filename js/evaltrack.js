/**
 * EvalTrack - Sistema de Calendario y Seguimiento de Evaluaciones
 * Instituto Profesional Virginio Gómez
 * Lógica de negocio, persistencia en localStorage y CRUD docente (Avance 70%)
 * 
 * Equipo: Ingenieros Empresarios INC
 * Curso: Interfaz de Usuario
 */

const STORAGE_KEY = 'evaltrack_evaluaciones';

// Datos iniciales de demostración acordes al plan académico de IP Virginio Gómez
const DEFAULT_EVALUACIONES = [
  {
    id: "ev-1",
    asignatura: "Ingeniería de Software",
    seccion: "Sección 01-V",
    tipo: "Certamen",
    fecha: "2026-10-28",
    ponderacion: "30%",
    estado: "Reprogramada",
    autor: "Prof. Rodrigo Morales",
    notaReprogramacion: "Modificada por acuerdo docente para repaso de contenidos."
  },
  {
    id: "ev-2",
    asignatura: "Programación Web Frontend",
    seccion: "Sección 01-V",
    tipo: "Trabajo",
    fecha: "2026-10-30",
    ponderacion: "25%",
    estado: "Publicada",
    autor: "Prof. Marcela Soto",
    notaReprogramacion: ""
  },
  {
    id: "ev-3",
    asignatura: "Base de Datos II",
    seccion: "Sección 02-D",
    tipo: "Test",
    fecha: "2026-11-03",
    ponderacion: "15%",
    estado: "Publicada",
    autor: "Prof. Andrea Fuentes",
    notaReprogramacion: ""
  },
  {
    id: "ev-4",
    asignatura: "Redes y Telecomunicaciones",
    seccion: "Sección 01-V",
    tipo: "Certamen",
    fecha: "2026-11-12",
    ponderacion: "30%",
    estado: "Publicada",
    autor: "Prof. Carlos Henríquez",
    notaReprogramacion: ""
  }
];

// ============================================================================
// FUNCIONES DE ALMACENAMIENTO (localStorage)
// ============================================================================

function obtenerEvaluaciones() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_EVALUACIONES));
    return DEFAULT_EVALUACIONES;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Error al parsear evaluaciones de localStorage:", e);
    return DEFAULT_EVALUACIONES;
  }
}

function guardarEvaluaciones(evaluaciones) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(evaluaciones));
}

function guardarOEvaluarEvaluacion(evaluacion) {
  const evaluaciones = obtenerEvaluaciones();
  const index = evaluaciones.findIndex(item => item.id === evaluacion.id);

  if (index >= 0) {
    evaluaciones[index] = evaluacion;
  } else {
    evaluaciones.unshift(evaluacion);
  }

  guardarEvaluaciones(evaluaciones);
  return evaluacion;
}

function eliminarEvaluacionPorId(id) {
  const evaluaciones = obtenerEvaluaciones();
  const filtradas = evaluaciones.filter(item => item.id !== id);
  guardarEvaluaciones(filtradas);
  return filtradas;
}

function obtenerEvaluacionPorId(id) {
  const evaluaciones = obtenerEvaluaciones();
  return evaluaciones.find(item => item.id === id);
}

// ============================================================================
// SISTEMA DE NOTIFICACIONES (TOASTS)
// ============================================================================

function mostrarNotificacion(mensaje, tipo = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast-item toast-${tipo}`;
  
  const iconSvg = tipo === "success" 
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

  toast.innerHTML = `
    <span class="toast-icon">${iconSvg}</span>
    <span class="toast-text">${mensaje}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ============================================================================
// HELPERS DE FECHA Y DÍAS RESTANTES
// ============================================================================

function calcularDiasRestantes(fechaStr) {
  if (!fechaStr) return { texto: "--", clase: "" };
  
  const partes = fechaStr.split("-");
  const fechaEval = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const diffMs = fechaEval.getTime() - hoy.getTime();
  const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias < 0) {
    return { texto: `Finalizada (hace ${Math.abs(diffDias)} d)`, clase: "finalizada" };
  } else if (diffDias === 0) {
    return { texto: "¡Hoy es la entrega!", clase: "urgente" };
  } else if (diffDias === 1) {
    return { texto: "Mañana", clase: "urgente" };
  } else if (diffDias <= 7) {
    return { texto: `En ${diffDias} días`, clase: "urgente" };
  } else if (diffDias <= 14) {
    return { texto: `En ${diffDias} días`, clase: "proximo" };
  } else {
    return { texto: `En ${diffDias} días`, clase: "" };
  }
}

function formatearFechaLegible(fechaStr) {
  if (!fechaStr) return "";
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  
  const partes = fechaStr.split("-");
  const d = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
  
  const nombreDia = diasSemana[d.getDay()];
  const dia = d.getDate().toString().padStart(2, "0");
  const mes = meses[d.getMonth()];
  const anio = d.getFullYear();

  return `${nombreDia}, ${dia} ${mes} ${anio}`;
}

// ============================================================================
// LÓGICA VISTA DOCENTE (docente.html - CRUD COMPLETO)
// ============================================================================

function inicializarPanelDocente() {
  const form = document.getElementById("eval-form");
  const tablaBody = document.querySelector(".table-gestion tbody");
  const contadorEl = document.querySelector(".table-card .eval-counter");
  const btnSubmit = document.getElementById("btn-save-eval");

  if (!form || !tablaBody) return;

  function renderizarTabla() {
    const evaluaciones = obtenerEvaluaciones();
    if (contadorEl) {
      contadorEl.textContent = `${evaluaciones.length} asignadas`;
    }

    if (evaluaciones.length === 0) {
      tablaBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">
            No hay evaluaciones registradas actualmente. Usa el formulario para agregar la primera.
          </td>
        </tr>
      `;
      return;
    }

    tablaBody.innerHTML = evaluaciones.map(ev => {
      const tipoClass = `badge-tipo-${(ev.tipo || "certamen").toLowerCase()}`;
      const esReprog = ev.estado === "Reprogramada";
      const estadoBadge = esReprog
        ? `<span class="badge badge-reprogramada">Reprogramada</span>`
        : `<span class="badge" style="background: var(--badge-publicada-bg); color: var(--badge-publicada);">Publicada</span>`;

      return `
        <tr data-id="${ev.id}">
          <td data-label="Asignatura">
            <strong>${escapeHtml(ev.asignatura)}</strong>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(ev.autor || "Sin docente asignado")}</div>
          </td>
          <td data-label="Sección">${escapeHtml(ev.seccion)}</td>
          <td data-label="Tipo"><span class="badge ${tipoClass}">${escapeHtml(ev.tipo)}</span></td>
          <td data-label="Fecha"><span style="font-weight: 700;">${formatearFechaLegible(ev.fecha)}</span></td>
          <td data-label="Ponderación">${escapeHtml(ev.ponderacion || "--")}</td>
          <td data-label="Estado">${estadoBadge}</td>
          <td data-label="Acciones">
            <div class="action-buttons-group" style="justify-content: flex-end;">
              <button type="button" class="btn-action-icon btn-edit-eval" data-id="${ev.id}" title="Editar evaluación" aria-label="Editar">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                </svg>
              </button>
              <button type="button" class="btn-action-icon danger btn-delete-eval" data-id="${ev.id}" title="Eliminar evaluación" aria-label="Eliminar">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    tablaBody.querySelectorAll(".btn-delete-eval").forEach(btn => {
      btn.addEventListener("click", function(e) {
        e.stopPropagation();
        const id = this.getAttribute("data-id");
        if (confirm("¿Estás seguro de que deseas eliminar esta evaluación del cronograma oficial?")) {
          eliminarEvaluacionPorId(id);
          renderizarTabla();
          mostrarNotificacion("Evaluación eliminada correctamente.", "success");
        }
      });
    });

    tablaBody.querySelectorAll(".btn-edit-eval").forEach(btn => {
      btn.addEventListener("click", function(e) {
        e.stopPropagation();
        const id = this.getAttribute("data-id");
        const ev = obtenerEvaluacionPorId(id);
        if (!ev) return;

        document.getElementById("eval-id").value = ev.id;
        document.getElementById("eval-asignatura").value = ev.asignatura;
        document.getElementById("eval-seccion").value = ev.seccion;
        document.getElementById("eval-tipo").value = ev.tipo;
        document.getElementById("eval-fecha").value = ev.fecha;
        document.getElementById("eval-ponderacion").value = ev.ponderacion || "";
        document.getElementById("eval-autor").value = ev.autor || "";
        document.getElementById("eval-reprogramada").checked = ev.estado === "Reprogramada";

        btnSubmit.innerHTML = `<span>Actualizar Evaluación</span>`;
        mostrarNotificacion(`Modo edición activado para: ${ev.asignatura}`, "info");
      });
    });
  }

  form.addEventListener("submit", function(e) {
    e.preventDefault();

    const idInput = document.getElementById("eval-id").value;
    const asignatura = document.getElementById("eval-asignatura").value.trim();
    const seccion = document.getElementById("eval-seccion").value.trim();
    const tipo = document.getElementById("eval-tipo").value;
    const fecha = document.getElementById("eval-fecha").value;
    const ponderacion = document.getElementById("eval-ponderacion").value.trim();
    const autor = document.getElementById("eval-autor").value.trim();
    const esReprogramada = document.getElementById("eval-reprogramada").checked;

    if (!asignatura || !seccion || !tipo || !fecha) {
      mostrarNotificacion("Por favor completa los campos obligatorios.", "error");
      return;
    }

    const nuevaEvaluacion = {
      id: idInput ? idInput : `ev-${Date.now()}`,
      asignatura,
      seccion,
      tipo,
      fecha,
      ponderacion: ponderacion || "Sin ponderación",
      estado: esReprogramada ? "Reprogramada" : "Publicada",
      autor: autor || "Docente no especificado",
      notaReprogramacion: esReprogramada ? "Fecha actualizada oficialmente por coordinación académica." : ""
    };

    guardarOEvaluarEvaluacion(nuevaEvaluacion);
    renderizarTabla();
    form.reset();
    document.getElementById("eval-id").value = "";
    btnSubmit.innerHTML = `<span>Guardar Evaluación</span>`;
    mostrarNotificacion(idInput ? "Evaluación actualizada exitosamente." : "Nueva evaluación agregada al calendario.", "success");
  });

  renderizarTabla();
}

// ============================================================================
// LÓGICA VISTA ESTUDIANTE (index.html - FILTROS DINÁMICOS Y TARJETAS)
// ============================================================================

function inicializarPortalEstudiante() {
  const cardsContainer = document.getElementById("view-cards-container");
  const calendarContainer = document.getElementById("view-calendar-container");
  if (!cardsContainer) return;

  const cardsGrid = cardsContainer.querySelector(".eval-cards-grid");
  const counterTitle = cardsContainer.querySelector(".eval-counter");
  const statTotal = document.querySelector(".hero-stats .stat-card:nth-child(1) .stat-value");
  const statProximos = document.querySelector(".hero-stats .stat-card:nth-child(2) .stat-value");
  const statReprog = document.querySelector(".hero-stats .stat-card:nth-child(3) .stat-value");

  const searchInput = document.getElementById("search-input");
  const filterAsignatura = document.getElementById("filter-asignatura");
  const filterSeccion = document.getElementById("filter-seccion");
  const filterTipo = document.getElementById("filter-tipo");
  const btnResetFilters = document.getElementById("btn-reset-filters");

  function actualizarOpcionesFiltros(evaluaciones) {
    if (!filterAsignatura || !filterSeccion) return;

    const asignaturasUnicas = [...new Set(evaluaciones.map(e => e.asignatura))].sort();
    const seccionesUnicas = [...new Set(evaluaciones.map(e => e.seccion))].sort();

    const valorAsigPrevio = filterAsignatura.value;
    filterAsignatura.innerHTML = `<option value="all">Todas las asignaturas</option>` +
      asignaturasUnicas.map(asig => `<option value="${escapeHtml(asig)}">${escapeHtml(asig)}</option>`).join("");
    if (asignaturasUnicas.includes(valorAsigPrevio)) filterAsignatura.value = valorAsigPrevio;

    const valorSecPrevio = filterSeccion.value;
    filterSeccion.innerHTML = `<option value="all">Todas</option>` +
      seccionesUnicas.map(sec => `<option value="${escapeHtml(sec)}">${escapeHtml(sec)}</option>`).join("");
    if (seccionesUnicas.includes(valorSecPrevio)) filterSeccion.value = valorSecPrevio;
  }

  function actualizarMetricas(evaluaciones) {
    if (statTotal) statTotal.textContent = evaluaciones.length;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const proximos7 = evaluaciones.filter(e => {
      const p = e.fecha.split("-");
      const f = new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
      const diff = Math.round((f.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 7;
    }).length;
    if (statProximos) statProximos.textContent = proximos7;

    const reprogCount = evaluaciones.filter(e => e.estado === "Reprogramada").length;
    if (statReprog) statReprog.textContent = reprogCount;
  }

  function filtrarEvaluaciones() {
    const evaluaciones = obtenerEvaluaciones();
    const query = (searchInput?.value || "").toLowerCase().trim();
    const asig = filterAsignatura?.value || "all";
    const sec = filterSeccion?.value || "all";
    const tipo = filterTipo?.value || "all";

    return evaluaciones.filter(ev => {
      const matchQuery = !query || 
        ev.asignatura.toLowerCase().includes(query) ||
        (ev.autor && ev.autor.toLowerCase().includes(query)) ||
        ev.tipo.toLowerCase().includes(query);
      
      const matchAsig = asig === "all" || ev.asignatura === asig;
      const matchSec = sec === "all" || ev.seccion === sec;
      const matchTipo = tipo === "all" || ev.tipo === tipo;

      return matchQuery && matchAsig && matchSec && matchTipo;
    });
  }

  function renderizarTarjetas() {
    const filtradas = filtrarEvaluaciones();
    const todas = obtenerEvaluaciones();
    actualizarMetricas(todas);

    if (counterTitle) {
      counterTitle.textContent = `${filtradas.length} ${filtradas.length === 1 ? 'resultado' : 'resultados'}`;
    }

    if (filtradas.length === 0) {
      cardsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border-light);">
          <h4 style="color: var(--ipvg-blue-dark); font-size: 1.1rem; margin-bottom: 0.25rem;">No se encontraron evaluaciones</h4>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Prueba modificando los filtros de búsqueda o limpiando los criterios.</p>
        </div>
      `;
      return;
    }

    cardsGrid.innerHTML = filtradas.map(ev => {
      const tipoLower = (ev.tipo || "certamen").toLowerCase();
      const tipoClass = `tipo-${tipoLower}`;
      const badgeTipoClass = `badge-tipo-${tipoLower}`;
      const esReprogramada = ev.estado === "Reprogramada";
      const diasInfo = calcularDiasRestantes(ev.fecha);

      const noticeReprog = esReprogramada ? `
        <div class="reprogramada-notice">
          <span>${escapeHtml(ev.notaReprogramacion || "Atención: Fecha reprogramada oficialmente por el docente.")}</span>
        </div>
      ` : "";

      const badgeReprog = esReprogramada ? `
        <span class="badge badge-reprogramada">Fecha Reprogramada</span>
      ` : "";

      return `
        <article class="eval-card ${tipoClass}">
          <div>
            <div class="card-top">
              <div class="badges-group">
                <span class="badge ${badgeTipoClass}">${escapeHtml(ev.tipo)}</span>
                ${badgeReprog}
              </div>
              <span class="badge badge-ponderacion">${escapeHtml(ev.ponderacion || "--")}</span>
            </div>
            <h4 class="card-title">${escapeHtml(ev.asignatura)}</h4>
            ${noticeReprog}
            <div class="card-meta-list">
              <div class="meta-item"><span>Sección: <strong>${escapeHtml(ev.seccion)}</strong></span></div>
              <div class="meta-item"><span>Docente: <strong>${escapeHtml(ev.autor || "Sin asignar")}</strong></span></div>
            </div>
          </div>
          <div class="card-footer-info">
            <div class="fecha-box">
              <span class="fecha-label">Fecha Oficial</span>
              <span class="fecha-valor">${formatearFechaLegible(ev.fecha)}</span>
            </div>
            <div class="dias-restantes-pill ${diasInfo.clase}">${diasInfo.texto}</div>
          </div>
        </article>
      `;
    }).join("");
  }

  // Conmutador de vistas
  const btnViewList = document.getElementById("btn-view-list");
  const btnViewCal = document.getElementById("btn-view-cal");

  if (btnViewList && btnViewCal) {
    btnViewList.addEventListener("click", () => {
      btnViewList.classList.add("active");
      btnViewList.setAttribute("aria-selected", "true");
      btnViewCal.classList.remove("active");
      btnViewCal.setAttribute("aria-selected", "false");
      cardsContainer.style.display = "block";
      if (calendarContainer) calendarContainer.style.display = "none";
    });

    btnViewCal.addEventListener("click", () => {
      btnViewCal.classList.add("active");
      btnViewCal.setAttribute("aria-selected", "true");
      btnViewList.classList.remove("active");
      btnViewList.setAttribute("aria-selected", "false");
      cardsContainer.style.display = "none";
      if (calendarContainer) calendarContainer.style.display = "block";
      mostrarNotificacion("La vista de calendario interactivo mensual se integra en la entrega final (100%).", "info");
    });
  }

  // Listeners de filtros dinámicos
  function actualizarVistas() {
    renderizarTarjetas();
  }

  if (searchInput) searchInput.addEventListener("input", actualizarVistas);
  if (filterAsignatura) filterAsignatura.addEventListener("change", actualizarVistas);
  if (filterSeccion) filterSeccion.addEventListener("change", actualizarVistas);
  if (filterTipo) filterTipo.addEventListener("change", actualizarVistas);

  if (btnResetFilters) {
    btnResetFilters.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (filterAsignatura) filterAsignatura.value = "all";
      if (filterSeccion) filterSeccion.value = "all";
      if (filterTipo) filterTipo.value = "all";
      actualizarVistas();
      mostrarNotificacion("Filtros restablecidos.", "success");
    });
  }

  // Inicialización del portal
  const todasEvaluaciones = obtenerEvaluaciones();
  actualizarOpcionesFiltros(todasEvaluaciones);
  renderizarTarjetas();
}

// ============================================================================
// SEGURIDAD XSS Y INICIALIZACIÓN
// ============================================================================

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

document.addEventListener("DOMContentLoaded", function() {
  inicializarPanelDocente();
  inicializarPortalEstudiante();
});