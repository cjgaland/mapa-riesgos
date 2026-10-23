# CLAUDE.md — Mapa de Riesgos

> Documento común a todas las apps (lista, carpetas, identidad visual e intercambio de datos): `/Users/Trabajo/Desktop/Ecosistema Calidad/ECOSISTEMA.md`.

Guía de referencia para el desarrollo asistido por IA. Léela antes de proponer cambios. Responder siempre en español y en lenguaje claro (el autor no es programador). El diseño completo, las decisiones del autor y el plan por entregas están en `/Users/Trabajo/Desktop/Mapa de Riesgos/Diseño/DISEÑO_MAPA_RIESGOS.md` (léelo también al empezar una sesión).

## 1. Descripción
PWA estática (sin build, sin dependencias, sin CDN) que guía **paso a paso y de forma didáctica** la elaboración del **Mapa de Riesgos de cualquier proceso sanitario**:
- proceso, subprocesos, flujograma y puntos críticos;
- equipo y AMFE (fallos, G·O·D, IPR, priorización y matriz);
- acciones de mejora 5W1H;
- **el mapa**: el flujograma con los fallos numerados encima, coloreados por nivel de IPR, dentro del marco de procesos estratégicos, clave y de soporte;
- Documento Final en Word y PDF con control documental, como el «Documento Final Mapa de Riesgos Urgencias» del curso (material en `../Curso Mapa de Riesgo/`).

Herramienta docente y de apoyo; no sustituye el criterio profesional.

Es una **superaplicación** del ecosistema, como Auditorías: se puede hacer entera dentro de ella. Además, «Traer de AMFE», «Traer de Flujograma», «Traer de DAFO» y «Llevar a Auditorías». Solo lee las claves de otras apps (`amfe-intercambio`, `flujograma-intercambio`, `dafo-intercambio`, `indicadores-datos`); nunca escribe en ellas.

**No repite el código de AMFE ni de Flujograma** (decisión del autor): carga en vivo su motor desde las apps hermanas (`../amfe/logic.js` → `window.LogicaAmfe`, `../flujograma/logic.js` → `window.LogicaFlujo`, `../flujograma/dibujo.js` → `window.Dibujo`). El contrato de funciones usadas está en el diseño, sección 6.2. Requiere la «entrega 0» en AMFE y Flujograma (sección 12 del diseño).

Autoría (idéntica en el pie de index.html, «Acerca de», `informePie()` en app.js y el README; orden alfabético, sin centro de trabajo): Carlos J. Galán Doval (Médico de Familia · Técnico en Calidad y Seguridad del Paciente) y Rafael J. Romero de Castilla Gil (Médico de Familia · Responsable del Área de Calidad y Seguridad del Paciente), Área de Gestión Sanitaria Sur de Córdoba · Andalucía.

## 2. Decisiones del autor (2026-10-22)
- Diseño aprobado con las **mejoras A–M**.
- Motor de AMFE y Flujograma **en vivo, sin copiar código**; pantallas propias.
- Iconos del mapa por **nivel de IPR**: ≥ 300 rojo, 200–299 naranja, 100–199 amarillo, < 100 verde. Borde negro para los fallos críticos y los de gravedad 9–10.
- Dentro va **el AMFE que pide el documento final**. La lluvia de ideas, el grupo nominal, la votación por miembro y el Ishikawa se quedan en la app AMFE.
- Acento **granate**. Propuesta: claro `#9f1239`, oscuro `#fb7185`, impreso `#881337`.
- Por defecto: nombre visible «Mapa de Riesgos · Procesos sanitarios», repositorio `cjgaland/mapa-riesgos`, prefijo de datos `mapariesgos-`, puerto local 8771.
- Heredadas: en pantalla no se menciona el curso (solo en «Acerca de» y en las notas del ejemplo); sin nombres de centro ni de personas en los ejemplos; trabajo en equipo con la copia `.json`; lenguaje inclusivo neutro.

## 3. Copias de seguridad locales
```
Desktop/Mapa de Riesgos/
├── Aplicación/            ← la app (este repositorio git, lo que se publica)
├── Backup/                ← 5 copias más recientes, fuera del repositorio
├── Curso Mapa de Riesgo/  ← material del curso
├── Diseño/                ← DISEÑO_MAPA_RIESGOS.md
└── Documentos de ejemplo/ ← documentos generados con la app
```
`bash ~/.claude/skills/app-copia_seguridad/scripts/copia_seguridad.sh --root "/Users/Trabajo/Desktop/Mapa de Riesgos" --name MapaRiesgos --exclude "Curso*" --exclude "Documentos*" --exclude "*.docx" --exclude .claude` (copia `Aplicación/` y `Diseño/`). Hacer una antes de cada publicación.

## 4. Publicación
Sin publicar. Repositorio previsto `cjgaland/mapa-riesgos` (GitHub Pages desde `main`, raíz → https://cjgaland.github.io/mapa-riesgos/, hermana de `/amfe/` y `/flujograma/`, de donde carga los motores). Publicar **solo cuando el autor lo pida**. Commits en español terminados en `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## 5. Estado y pendiente
- **Diseño aprobado** (2026-10-22). Estructura creada; solo este `CLAUDE.md`.
- **Entrega 0**, en las sesiones de AMFE y Flujograma: publicar `window.LogicaAmfe` / `window.LogicaFlujo` con `MOTOR = 1`; dibujo.js con color por icono; test de contrato y regla en sus `CLAUDE.md`. Pedida el 2026-10-22. **AMFE hecha** (commit 5c0f4a9, `window.LogicaAmfe`, `MOTOR = 1`, test `CONTRATO_MAPA`; sin publicar). Flujograma en curso.
- Siguiente: **entrega 1** (identidad, carga de motores, pasos 1–4, «Traer de Flujograma», ejemplo de Urgencias parte 1, Aprende 1–4, glosario, tests).
