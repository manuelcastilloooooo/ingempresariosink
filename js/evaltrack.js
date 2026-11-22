/**
 * EvalTrack - Sistema de Calendario y Seguimiento de Evaluaciones
 * Instituto Profesional Virginio Gómez
 * Lógica de negocio, persistencia en localStorage y sincronización
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
  },
  {
    id: "ev-5",
    asignatura: "Programación Web Frontend",
    seccion: "Sección 01-V",
    tipo: "Trabajo",
    fecha: "2026-11-23",
    ponderacion: "35%",
    estado: "Publicada",
    autor: "Prof. Marcela Soto",
    notaReprogramacion: ""
  },
  {
    id: "ev-6",
    asignatura: "Ingeniería de Software",
    seccion: "Sección 01-V",
    tipo: "Examen",
    fecha: "2026-12-10",
    ponderacion: "40%",
    estado: "Publicada",
    autor: "Prof. Rodrigo Morales",
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

  // Animación de entrada
  setTimeout(() => toast.classList.add("show"), 10);

  // Auto-eliminación tras 3.5 segundos
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
// LÓGICA VISTA DOCENTE (docente.html)
// ============================================================================

function inicializarPanelDocente() {
  const form = document.getElementById("eval-form");
  const tablaBody = document.querySelector(".table-gestion tbody");
  const contadorEl = document.querySelector(".table-card .eval-counter");
  const btnSubmit = document.getElementById("btn-save-eval");

  if (!form || !tablaBody) return;

  function renderTabla() {
    const evaluaciones = obtenerEvaluaciones();
    if (contadorEl) {
      contadorEl.textContent = `${evaluaciones.length} asignadas`;
    }

    if (evaluaciones.length === 0) {
      tablaBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">
            No hay evaluaciones registradas actualmente. Usa el formulario de la izquierda para agregar la primera.
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
          <td data-label="Tipo">
            <span class="badge ${tipoClass}">${escapeHtml(ev.tipo)}</span>
          </td>
          <td data-label="Fecha">
            <span style="font-weight: 700;">${formatearFechaLegible(ev.fecha)}</span>
          </td>
          <td data-label="Ponderación">${escapeHtml(ev.ponderacion || "--")}</td>
          <td data-label="Estado">${estadoBadge}</td>
          <td data-label="Acciones">
            <div class="action-buttons-group" style="justify-content: flex-end;">
              <button type="button" class="btn-action-icon btn-edit-eval" data-id="${ev.id}" title="Editar evaluación" aria-label="Editar">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                </svg>
              </button>
              <button type="button" class="btn-action-icon danger btn-delete-eval" data-id="${ev.id}" title="Eliminar evaluación" aria-label="Eliminar">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    // Asignar listeners a botones de edición y eliminación
    tablaBody.querySelectorAll(".btn-edit-eval").forEach(btn => {
      btn.addEventListener("click", () => cargarEnFormulario(btn.getAttribute("data-id")));
    });

    tablaBody.querySelectorAll(".btn-delete-eval").forEach(btn => {
      btn.addEventListener("click", () => confirmarEliminacion(btn.getAttribute("data-id")));
    });
  }

  function cargarEnFormulario(id) {
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

    // Modificar botón de envío y encabezado
    document.getElementById("form-heading").textContent = "Modificar Evaluación";
    btnSubmit.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
      </svg>
      <span>Actualizar Evaluación</span>
    `;

    // Agregar botón de cancelar si no existe
    let btnCancel = document.getElementById("btn-cancel-edit");
    if (!btnCancel) {
      btnCancel = document.createElement("button");
      btnCancel.type = "button";
      btnCancel.id = "btn-cancel-edit";
      btnCancel.className = "btn-secondary";
      btnCancel.style.width = "100%";
      btnCancel.style.marginTop = "0.5rem";
      btnCancel.textContent = "Cancelar Edición";
      btnCancel.addEventListener("click", resetearFormulario);
      btnSubmit.parentNode.appendChild(btnCancel);
    }

    form.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("eval-asignatura").focus();
  }

  function resetearFormulario() {
    form.reset();
    document.getElementById("eval-id").value = "";
    document.getElementById("form-heading").textContent = "Publicar o Reprogramar";
    btnSubmit.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
      </svg>
      <span>Guardar Evaluación</span>
    `;
    const btnCancel = document.getElementById("btn-cancel-edit");
    if (btnCancel) btnCancel.remove();
  }

  function confirmarEliminacion(id) {
    const ev = obtenerEvaluacionPorId(id);
    if (!ev) return;

    if (confirm(`¿Estás seguro de eliminar la evaluación "${ev.asignatura} - ${ev.tipo}"?`)) {
      eliminarEvaluacionPorId(id);
      renderTabla();
      mostrarNotificacion("Evaluación eliminada correctamente.", "warning");
      if (document.getElementById("eval-id").value === id) {
        resetearFormulario();
      }
    }
  }

  // EVENTO PRINCIPAL: GUARDAR EVALUACIÓN
  form.addEventListener("submit", function(e) {
    e.preventDefault();

    const id = document.getElementById("eval-id").value.trim();
    const asignatura = document.getElementById("eval-asignatura").value.trim();
    const seccion = document.getElementById("eval-seccion").value.trim();
    const tipo = document.getElementById("eval-tipo").value;
    const fecha = document.getElementById("eval-fecha").value;
    const ponderacion = document.getElementById("eval-ponderacion").value.trim();
    const autor = document.getElementById("eval-autor").value.trim();
    const esReprogramada = document.getElementById("eval-reprogramada").checked;

    if (!asignatura || !seccion || !tipo || !fecha) {
      mostrarNotificacion("Por favor completa todos los campos obligatorios.", "warning");
      return;
    }

    const esEdicion = Boolean(id);
    const idFinal = esEdicion ? id : "ev-" + Date.now();
    const estadoFinal = esReprogramada ? "Reprogramada" : "Publicada";

    const nuevaEvaluacion = {
      id: idFinal,
      asignatura,
      seccion,
      tipo,
      fecha,
      ponderacion: ponderacion ? (ponderacion.includes("%") ? ponderacion : ponderacion + "%") : "",
      estado: estadoFinal,
      autor: autor || "Docente IPVG",
      notaReprogramacion: esReprogramada ? "Fecha actualizada en el sistema institucional." : ""
    };

    guardarOEvaluarEvaluacion(nuevaEvaluacion);
    renderTabla();
    resetearFormulario();

    mostrarNotificacion(
      esEdicion ? "¡Evaluación actualizada con éxito!" : "¡Evaluación publicada exitosamente para los estudiantes!",
      "success"
    );
  });

  // Render inicial
  renderTabla();
}

// ============================================================================
// LÓGICA VISTA ESTUDIANTE (index.html)
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

  // Filtros
  const searchInput = document.getElementById("search-input");
  const filterAsignatura = document.getElementById("filter-asignatura");
  const filterSeccion = document.getElementById("filter-seccion");
  const filterTipo = document.getElementById("filter-tipo");
  const btnResetFilters = document.getElementById("btn-reset-filters");

  // Poblar selectores de filtros dinámicamente con los datos de localStorage
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
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-light); margin-bottom: 0.75rem;">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
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

      const noticeHtml = esReprogramada ? `
        <div class="reprogramada-notice">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>${escapeHtml(ev.notaReprogramacion || "Fecha oficial reprogramada por el cuerpo docente.")}</span>
        </div>
      ` : "";

      const badgeReprogHtml = esReprogramada ? `
        <span class="badge badge-reprogramada">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Fecha Reprogramada
        </span>
      ` : "";

      const ponderacionHtml = ev.ponderacion ? `<span class="badge badge-ponderacion">${escapeHtml(ev.ponderacion)}</span>` : "";

      return `
        <article class="eval-card ${tipoClass}">
          <div>
            <div class="card-top">
              <div class="badges-group">
                <span class="badge ${badgeTipoClass}">${escapeHtml(ev.tipo)}</span>
                ${badgeReprogHtml}
              </div>
              ${ponderacionHtml}
            </div>

            <h4 class="card-title">${escapeHtml(ev.asignatura)}</h4>
            ${noticeHtml}

            <div class="card-meta-list">
              <div class="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span>Sección: <strong>${escapeHtml(ev.seccion)}</strong></span>
              </div>
              <div class="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>Docente: <strong>${escapeHtml(ev.autor || "Docente IPVG")}</strong></span>
              </div>
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

  // Conmutador de Vistas (Lista / Calendario - RF-07)
  const btnViewList = document.getElementById("btn-view-list");
  const btnViewCal = document.getElementById("btn-view-cal");
  if (btnViewList && btnViewCal && cardsContainer && calendarContainer) {
    btnViewList.addEventListener("click", () => {
      btnViewList.classList.add("active");
      btnViewList.setAttribute("aria-selected", "true");
      btnViewCal.classList.remove("active");
      btnViewCal.setAttribute("aria-selected", "false");
      cardsContainer.style.display = "block";
      calendarContainer.style.display = "none";
    });

    btnViewCal.addEventListener("click", () => {
      btnViewCal.classList.add("active");
      btnViewCal.setAttribute("aria-selected", "true");
      btnViewList.classList.remove("active");
      btnViewList.setAttribute("aria-selected", "false");
      cardsContainer.style.display = "none";
      calendarContainer.style.display = "block";
      renderizarCalendario();
    });
  }

  // Lógica del Calendario Dinámico
  let mesCalendario = new Date(2026, 9, 1); // Octubre 2026 por defecto (según contexto)

  function renderizarCalendario() {
    if (!calendarContainer) return;
    const grid = calendarContainer.querySelector(".calendar-grid");
    const titleEl = calendarContainer.querySelector(".calendar-month-title");
    if (!grid || !titleEl) return;

    const nombresMeses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const anio = mesCalendario.getFullYear();
    const mes = mesCalendario.getMonth();
    titleEl.textContent = `${nombresMeses[mes]} ${anio}`;

    const primerDiaMes = new Date(anio, mes, 1);
    const ultimoDiaMes = new Date(anio, mes + 1, 0);

    // Ajuste lunes = 0, domingo = 6
    let diaInicio = primerDiaMes.getDay() - 1;
    if (diaInicio === -1) diaInicio = 6;

    const totalDias = ultimoDiaMes.getDate();
    const diasMesAnterior = new Date(anio, mes, 0).getDate();

    const evaluacionesFiltradas = filtrarEvaluaciones();
    const hoy = new Date();

    let html = `
      <div class="calendar-day-header">Lun</div>
      <div class="calendar-day-header">Mar</div>
      <div class="calendar-day-header">Mié</div>
      <div class="calendar-day-header">Jue</div>
      <div class="calendar-day-header">Vie</div>
      <div class="calendar-day-header">Sáb</div>
      <div class="calendar-day-header">Dom</div>
    `;

    // Celdas mes anterior
    for (let i = diaInicio - 1; i >= 0; i--) {
      const num = diasMesAnterior - i;
      html += `<div class="calendar-day-cell other-month"><span class="day-number">${num}</span></div>`;
    }

    // Celdas del mes actual
    for (let d = 1; d <= totalDias; d++) {
      const diaStr = d.toString().padStart(2, "0");
      const mesStr = (mes + 1).toString().padStart(2, "0");
      const fechaIso = `${anio}-${mesStr}-${diaStr}`;

      const esHoy = hoy.getFullYear() === anio && hoy.getMonth() === mes && hoy.getDate() === d;
      const evsDelDia = evaluacionesFiltradas.filter(e => e.fecha === fechaIso);

      let eventosHtml = "";
      if (evsDelDia.length > 0) {
        eventosHtml = `<div class="day-events">` + evsDelDia.map(ev => {
          const tipoLower = (ev.tipo || "certamen").toLowerCase();
          const esReprog = ev.estado === "Reprogramada" ? "reprogramada" : "";
          const avisoReprog = ev.estado === "Reprogramada" ? "&#9888; " : "";
          return `
            <span class="cal-event-pill tipo-${tipoLower} ${esReprog}" title="${escapeHtml(ev.asignatura)} (${escapeHtml(ev.tipo)} - ${escapeHtml(ev.seccion)})">
              ${avisoReprog}${escapeHtml(ev.tipo)}: ${escapeHtml(ev.asignatura)}
            </span>
          `;
        }).join("") + `</div>`;
      }

      html += `
        <div class="calendar-day-cell ${esHoy ? 'is-today' : ''}">
          <div class="day-cell-top">
            <span class="day-number">${d}</span>
            ${esHoy ? '<small style="font-size: 0.65rem; color: #16a34a; font-weight:700;">HOY</small>' : ''}
          </div>
          ${eventosHtml}
        </div>
      `;
    }

    // Celdas mes siguiente para completar cuadrícula (múltiplo de 7)
    const celdasUsadas = diaInicio + totalDias;
    const restantes = (7 - (celdasUsadas % 7)) % 7;
    for (let j = 1; j <= restantes; j++) {
      html += `<div class="calendar-day-cell other-month"><span class="day-number">${j}</span></div>`;
    }

    grid.innerHTML = html;
  }

  // Controles de navegación de meses
  const btnPrevMes = calendarContainer?.querySelector(".cal-nav-btn:nth-child(1)");
  const btnHoyMes = calendarContainer?.querySelector(".cal-nav-btn:nth-child(2)");
  const btnNextMes = calendarContainer?.querySelector(".cal-nav-btn:nth-child(3)");

  if (btnPrevMes) {
    btnPrevMes.addEventListener("click", () => {
      mesCalendario.setMonth(mesCalendario.getMonth() - 1);
      renderizarCalendario();
    });
  }
  if (btnNextMes) {
    btnNextMes.addEventListener("click", () => {
      mesCalendario.setMonth(mesCalendario.getMonth() + 1);
      renderizarCalendario();
    });
  }
  if (btnHoyMes) {
    btnHoyMes.addEventListener("click", () => {
      mesCalendario = new Date();
      renderizarCalendario();
    });
  }

  // Listeners de filtros
  function actualizarVistas() {
    renderizarTarjetas();
    if (calendarContainer && calendarContainer.style.display !== "none") {
      renderizarCalendario();
    }
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

  // Inicialización
  const todasEvaluaciones = obtenerEvaluaciones();
  actualizarOpcionesFiltros(todasEvaluaciones);
  renderizarTarjetas();
  renderizarCalendario();

  // Sincronización en tiempo real si el docente modifica datos en otra pestaña
  window.addEventListener("storage", function(event) {
    if (event.key === STORAGE_KEY) {
      const nuevas = obtenerEvaluaciones();
      actualizarOpcionesFiltros(nuevas);
      actualizarVistas();
      mostrarNotificacion("Calendario sincronizado con nuevas evaluaciones.", "success");
    }
  });
}

// ============================================================================
// ESCAPE DE CARACTERES HTML (SEGURIDAD XSS)
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

// Inicialización automática según la página activa
document.addEventListener("DOMContentLoaded", function() {
  inicializarPanelDocente();
  inicializarPortalEstudiante();
});

