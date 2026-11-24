### 🎓 Vista Estudiante (`index.html`)
* **Resumen Estadístico del Semestre:** Visualización rápida del total de evaluaciones activas, hitos en los próximos 7 días y evaluaciones reprogramadas.
* **Doble Modo de Visualización:** Conmutador dinámico entre **Vista de Lista** (tarjetas cronológicas con cuenta regresiva de días restantes) y **Vista de Calendario Mensual**.
* **Filtros Dinámicos y Buscador:** Búsqueda en tiempo real por asignatura o docente, además de filtros combinables por asignatura, sección (`01-V`, `02-D`, etc.) y tipo de evaluación.
* **Alertas de Reprogramación:** Distintivos y avisos destacados cuando una fecha oficial ha sido modificada por acuerdo docente.
* 
### 👨‍🏫 Panel Docente (`docente.html`)
* **Publicación y Edición de Evaluaciones:** Formulario intuitivo para registrar nuevas evaluaciones indicando asignatura, sección, tipo, fecha oficial, ponderación (%) y docente responsable.
* **Gestión de Reprogramaciones:** Opción dedicada para marcar una evaluación como *"Fecha Reprogramada"*, activando automáticamente la notificación visual en el portal estudiantil.
* **Tabla de Control:** Administración centralizada para editar fechas existentes o eliminar evaluaciones canceladas.

---

## 🛠️ Tecnologías Utilizadas

* **HTML:** Estructura semántica y accesible (`ARIA`).
* **CSS:** Diseño responsivo, variables institucionales (`IPVG`) y componentes visuales adaptables.
* **JavaScript (Vanilla JS):** Lógica de negocio, filtrado dinámico, renderizado de vistas y persistencia de datos (`js/evaltrack.js`).

---

## 📂 Estructura del Proyecto

```text
EvalTrack/
├── index.html          # Portal principal (Vista Estudiante)
├── docente.html        # Panel de administración (Modo Docente)
├── LogoIPVG.png        # Logotipo institucional completo
├── logo-ipvg.png       # Isotipo / escudo institucional
├── css/
│   └── styles.css      # Hoja de estilos institucional y responsiva
└── js/
    └── evaltrack.js    # Lógica de interactividad, filtros y persistencia
```

---

## 👥 Equipo de Desarrollo

* **Líder / Product Owner / Interactividad JS:** Manuel Castillo
* **Diseño UI / UX:** Cristopher Irribarra
* **Frontend / Maquetación:** Joaquín Pradenas
