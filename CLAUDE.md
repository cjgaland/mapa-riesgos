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

Es una **superaplicación** del ecosistema, como Auditorías: se puede hacer entera dentro de ella. Además tendrá «Traer de AMFE», «Traer de Flujograma» (ya hecho), «Traer de DAFO» y «Llevar a Auditorías». Solo lee las claves de otras apps (`amfe-intercambio`, `flujograma-intercambio`, `dafo-intercambio`, `indicadores-datos`); nunca escribe en ellas.

Autoría (idéntica en el pie de index.html, «Acerca de», `informePie()` en app.js y el README; orden alfabético, sin centro de trabajo): Carlos J. Galán Doval (Médico de Familia · Técnico en Calidad y Seguridad del Paciente) y Rafael J. Romero de Castilla Gil (Médico de Familia · Responsable del Área de Calidad y Seguridad del Paciente), Área de Gestión Sanitaria Sur de Córdoba · Andalucía.

## 2. Arquitectura: motores en vivo, sin copiar código
**Decisión del autor: no se repite el código de AMFE ni de Flujograma.** `index.html` carga primero sus motores desde las apps hermanas (mismo dominio en GitHub Pages) y después lo propio:
1. `../amfe/logic.js` → `window.LogicaAmfe` (`MOTOR = 1`; contrato en el test `CONTRATO_MAPA` de AMFE).
2. `../flujograma/logic.js` → `window.LogicaFlujo` (`MOTOR = 1`; contrato en `LogicaFlujo.CONTRATO`).
3. `../flujograma/dibujo.js` → `window.Dibujo` (SVG, leyenda, draw.io).
4. `logic.js` (propio) → exporta la fábrica `crear(LogicaFlujo, LogicaAmfe)`; en el navegador deja `window.Logica` (o `null` si falta el motor de Flujograma) y `window.MOTORES_PROBLEMAS` (`{ flujo, amfe }`, texto del problema o `""`). `MOTORES` lista lo que se usa de cada motor; `comprobarMotor` comprueba versión y funciones.
5. `contenido.js`, `xlsx.js`, `docx.js` (identidad común: copiados de Flujograma con el color granate, como en todo el ecosistema), `app.js`.

**Si se usa una función nueva de un motor**: añadirla a `MOTORES.<motor>.usa` en logic.js y pedir a la sesión de esa app que la añada a su contrato (el test de aquí falla si no está). Sin motor de Flujograma la app muestra un aviso y no calcula nada; sin el de AMFE avisa en la portada (lo usará desde la entrega 2).

**Un mapa ES un flujograma** del motor de Flujograma (mismos campos: proceso, actores, subprocesos, pasos, puntos, vista, marco, validado, descartes…), más lo propio: `ambito`, `descripcion` (objetivo general del documento), `origen: { flujo, amfe, dafo: { id, titulo, appVersion, traido } }` y, en cada punto crítico, `subprocesoId` (así existe aunque aún no haya flujograma). Así las funciones del motor (`avisosPasos`, `dibujar`, `propuestasPuntos`, `leerPegado`…) se usan tal cual. En la entrega 2 se añadirán los campos con forma de AMFE (equipo, sesiones, fallos…) al mismo objeto.

Archivos:
- `index.html` — esqueleto, cabecera (logo: flujograma con aviso), nav, franja de ejemplo, modales (bienvenida, Acerca de, novedades, confirmar), `#input-importar` y `#input-flujo` (copia .json de Flujograma).
- `styles.css` — el de Flujograma con el **acento granate** (la variable sigue llamándose `--cyan`: claro `#8b1a2b`, oscuro `#f2a6a6`, texto sobre acento en oscuro `#2b0a0f`, impreso `#7a1424`). Bloque final «Componentes propios de Mapa de Riesgos»: `.wiz-steps--10` (línea de 10 pasos con el color de su fase `.wiz-fase--A…D`), `.fase-t--A…D`, `.origenes`/`.origen-btn` (paso 1), `.actores-card`, `.vista3`, `.pc-grupo`, `.tema-card--prox`. Quedan reglas heredadas sin usar.
- `logic.js` — `FASES` (4) y `PASOS` (10, con la entrega en que se activa cada uno), `nuevoMapa`, `nuevoPunto` (con subproceso), consultas (`subDePunto`: el del paso si está colocado, si no el suyo; `idPunto` = «2.3», subproceso.orden dentro de él, como la tabla 4.1 del documento; `puntosDeSub`, `puntosPorSub`), avisos por paso (`avisosProceso` = los del motor + «parece una unidad» + alcance; `avisosSubprocesos` con `sub` = id; `avisosFlujo` = actores + pasos del motor; `avisosPuntos` propios: título, subproceso, efecto, **solución**, sin colocar, repetidos; `avisosDe(m, n)`), `progreso` (1: proceso+inicio+fin; 2: ≥ 2 subprocesos; 3: flujograma sin errores **y validado**; 4: puntos con título y subproceso), `pasoPendiente`, `siguientePaso`, `resumen`, puntos (`propuestas`, `aceptarPropuesta`, `anadirPunto`, `colocarPunto`), **Traer de Flujograma** (`leerFlujograma` acepta el paquete `flujograma-procesos` v1 o la copia .json de Flujograma y añade `appVersion` a cada flujo; `traerDeFlujograma(m, fl, genId, appVersion, hoy)`: proceso si está vacío, subprocesos emparejados por origen o nombre, y si el mapa no tiene pasos: calles, pasos con flechas rehechas, puntos críticos con sus `fallos`, marco y validación; traer dos veces no duplica), saneado (`sanearMapa` = `LF.sanearFlujo` + lo propio, recuperando el `subprocesoId` de cada punto), `sanearDatos`, `fusionar`, `renovarIds` (copiar ejemplo o duplicar; rehace también las claves de las propuestas y los descartes), `sugerirObjetivo`.
- `contenido.js` — `TEMAS` (Aprende 1–4: seguridad del paciente y riesgo, herramientas, procesos y subprocesos, puntos críticos), `TEMAS_PROX` (5–8, «próximamente»), `GLOSARIO` (31), `EJEMPLOS` (`miniMapa`; Urgencias `ej-mapa-urgencias`: 7 subprocesos del ejercicio 6, flujograma del ejercicio 7 ampliado a 33 pasos con espera de resultados y 5 destinos, marco, 49 puntos críticos del ejercicio 8 numerados 1–49 como los fallos del AMFE, con los de valoración médica tomados del AMFE (fallos 22–28) por la errata del curso; notas en el paso 1).
- `app.js` — UI: aviso si falta el motor; datos; enrutado; inicio (fases y pasos, «Tu siguiente paso», apps hermanas); lista; asistente (`RENDER` = pasos construidos; el resto `pasoProximo`); paso 1 con «Desde dónde empiezo» (Traer de Flujograma activo; AMFE y DAFO «próximamente»); paso 2 subprocesos; paso 3 con actores plegables y conmutador «Pasos / Dibujo» (`vista3`, recordado en `mapariesgos-vista3`): tarjetas de pasos, escritura rápida, validador y validación; dibujo con zoom, panel del paso tocado, retoques y marco; paso 4 con el dibujo (los avisos son los puntos), propuestas y puntos críticos por subproceso en desplegables (`mapariesgos-pc-abiertos`); vista para imprimir (`?informe=1`, borrador con descripción, subprocesos, flujograma y puntos críticos) y PDF en iOS; Aprende, ejemplo, glosario; copia/importar; tema; modales; SW. Enlaces en la UI como en Flujograma: `data-k`, actores `data-ac`, subprocesos `data-s`, pasos `data-pa`, salidas `data-sal`, puntos `data-pc` (+ `data-f`), marco `data-marco`, retoque `data-aj`. En el paso 3 el dibujo se pinta **sin** los puntos críticos (son del paso 4).
- `sw.js` — network-first; guarda también los tres motores (uno a uno, sin impedir la instalación si alguno falla). Sin `skipWaiting` al instalar.
- `tests/logic.test.mjs` — `node tests/logic.test.mjs` (65 comprobaciones): cargan los motores **de las carpetas hermanas del Escritorio** (`../../AMFE/Aplicación`, `../../Flujograma/Aplicación`); comprueban que lo usado está en el contrato de Flujograma y que no se ha copiado el motor; modelo, avisos, saneado, ejemplo (sin errores ni avisos, pasos 1–4 hechos, aviso «3, 5, 7» en la recepción), propuestas, Traer de Flujograma (con el paquete real que genera el motor), copiar.

### Rutas (hash)
`#/` inicio · `#/mapa` mis mapas · `#/mapa/nuevo` · `#/mapa/<id>` (primer paso pendiente) · `#/mapa/<id>/<1-10>` (`?informe=1` = vista para imprimir) · `#/ejemplos` · `#/aprende[/<1-4>]` · `#/glosario`.

### Datos
- `localStorage["mapariesgos-datos"]` = `{ app: "mapariesgos", v, ultimaCopia, mapas: [] }`. Guardado con 250 ms de retardo y al salir.
- Al cargar e importar se pasa SIEMPRE por `sanearDatos`. **Al añadir un campo propio**: fábrica (`nuevoMapa`/`nuevoPunto`) + `sanearMapa`. Los campos del flujograma los sanea el motor.
- Borradores: un mapa nuevo no se guarda hasta que se escribe algo (`esVacio`). Ejemplos en memoria (ids `ej-…`); «Copiar a mis datos» usa `renovarIds`. Nunca se importa un id `ej-`.
- Importar la copia de Flujograma por error: avisa de que se trae desde el paso 1.
- Aún no hay paquete `mapariesgos-intercambio` (llega en la entrega 2, formato `mapariesgos-mapas` v1, diseño 7.3).

## 3. Decisiones del autor (2026-10-22)
- Diseño aprobado con las **mejoras A–M**.
- Motor de AMFE y Flujograma **en vivo, sin copiar código**; pantallas propias.
- Iconos del mapa por **nivel de IPR**: ≥ 300 rojo, 200–299 naranja, 100–199 amarillo, < 100 verde; borde negro para críticos y gravedad 9–10.
- Dentro va **el AMFE que pide el documento final** (sin lluvia de ideas, grupo nominal, votación ni Ishikawa, que se quedan en la app AMFE).
- Acento **granate**.
- Por defecto: nombre visible «Mapa de Riesgos · Procesos sanitarios», repositorio `cjgaland/mapa-riesgos`, puerto local 8771.
- Heredadas: en pantalla no se menciona el curso (solo en «Acerca de» y en las notas del ejemplo); sin nombres de centro ni de personas en los ejemplos; trabajo en equipo con la copia `.json`; lenguaje inclusivo neutro.

## 4. Entorno y pruebas
- Node v26. `node tests/logic.test.mjs`.
- **Servir en local con las apps hermanas al lado**, como en GitHub Pages: la carpeta `../.claude/servidor/` tiene enlaces `amfe → AMFE/Aplicación`, `flujograma → Flujograma/Aplicación` y `mapa-riesgos → Aplicación`. Arrancar desde Bash en segundo plano: `cd "/Users/Trabajo/Desktop/Mapa de Riesgos/.claude/servidor" && python3 -m http.server 8771`, abrir la vista previa `app-mapa-riesgos` de `../.claude/launch.json` (solo URL `http://localhost:8771`) y navegar a `http://localhost:8771/mapa-riesgos/`. El navegador integrado no admite service workers.
- Revisar en escritorio y en móvil (360 px: `document.documentElement.scrollWidth === 360`) y en modo oscuro.
- Icono: `icon-512.svg` → `qlmanage -t -s 512` y tamaños con `sips -z`.

## 5. Versiones
`APP_VERSION` y `NOVEDADES` al principio de `app.js` (AAAA.NN). Claves: `mapariesgos-datos`, `mapariesgos-tema`, `mapariesgos-bienvenida-vista`, `mapariesgos-version-vista`, `mapariesgos-facil-abierto`, `mapariesgos-vista3`, `mapariesgos-pc-abiertos`.

## 6. Copias de seguridad locales
```
Desktop/Mapa de Riesgos/
├── Aplicación/            ← la app (este repositorio git, lo que se publica)
├── Backup/                ← 5 copias más recientes, fuera del repositorio
├── Curso Mapa de Riesgo/  ← material del curso
├── Diseño/                ← DISEÑO_MAPA_RIESGOS.md
└── Documentos de ejemplo/ ← documentos generados con la app
```
`bash ~/.claude/skills/app-copia_seguridad/scripts/copia_seguridad.sh --root "/Users/Trabajo/Desktop/Mapa de Riesgos" --name MapaRiesgos --exclude "Curso*" --exclude "Documentos*" --exclude "*.docx" --exclude .claude` (copia `Aplicación/` y `Diseño/`). Hacer una antes de cada publicación.

## 7. Publicación
Sin publicar. Repositorio previsto `cjgaland/mapa-riesgos` (GitHub Pages desde `main`, raíz → https://cjgaland.github.io/mapa-riesgos/, hermana de `/amfe/` y `/flujograma/`, de donde carga los motores). Publicar **solo cuando el autor lo pida**, y **antes, AMFE y Flujograma publicados con su entrega 0** (Flujograma 2026.06 ya lo está; su ampliación del contrato, commit 47f6924, solo cambia la lista y no hace falta publicarla para que funcione). Pasos por versión: copia de seguridad; `NOVEDADES` + `APP_VERSION`; mismos `?v=` en index.html; subir `CACHE_NAME` en sw.js; tests; commit en español terminado en `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; push.

## 8. Estado y pendiente
- **Diseño aprobado** (2026-10-22). **Entrega 0** hecha en AMFE (commit 5c0f4a9) y Flujograma (v2026.06, publicada; contrato ampliado en 47f6924).
- **Entrega 1 (hecha, 2026-10-23, v2026.01)**: identidad (granate, icono), carga de motores en vivo con comprobación de versión y aviso, datos y copias; pasos 1 (proceso, «Traer de Flujograma»), 2 (subprocesos), 3 (flujograma: actores, pasos, escritura rápida, dibujo, validación, marco) y 4 (puntos críticos por subproceso, propuestas, colocados en su paso); vista para imprimir; ejemplo de Urgencias (pasos 1–4); Aprende 1–4; glosario; 65 tests. Sin publicar.
- Siguiente: **entrega 2** (pasos 5–7 con el motor de AMFE: equipo y sesiones, fallos desde los puntos críticos, G·O·D, prioridad y matriz; «Traer de AMFE»; paquete `mapariesgos-mapas` v1; ejemplo con los 49 fallos; Aprende 5–6). Antes, comprobar qué funciones de AMFE harán falta y ampliar `MOTORES.amfe.usa` y el contrato de AMFE.
