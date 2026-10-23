// ============================================================
//  app.js — UI y estado · Mapa de Riesgos
//  Las reglas viven en logic.js (propio) y en los motores de AMFE y Flujograma,
//  que la página carga en vivo desde las apps hermanas (no se copian). El dibujo
//  es el de Flujograma (window.Dibujo). Los textos didácticos y los ejemplos, en
//  contenido.js. Aquí: datos en localStorage, enrutado por hash, inicio, lista
//  de mapas, asistente por pasos, visor del dibujo, ejemplos, Aprende, glosario,
//  vista para imprimir y copias de seguridad.
//  Base copiada de Flujograma (mismos patrones: data-k, refrescar sin perder el
//  foco, repintar conservando el scroll, borradores, ejemplos en memoria).
// ============================================================
(function () {
  "use strict";
  const L = window.Logica, C = window.Contenido, D = window.Dibujo;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const view = $("#view");
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ---------- Sin motor no se calcula nada (mejor un aviso claro que números equivocados) ----------
  if (!L || !D) {
    const P = window.MOTORES_PROBLEMAS || {};
    view.innerHTML = `<h1 class="page-title">No se ha podido abrir Mapa de Riesgos</h1>
      <div class="error-box">${esc(P.flujo || "")} ${D ? "" : "No se ha podido cargar el dibujo de Flujograma."}</div>
      <p class="page-lead">Mapa de Riesgos usa por dentro las apps hermanas <b>Flujograma</b> y <b>AMFE</b>. La primera vez hace falta conexión a internet para traerlas; después funciona sin conexión.</p>
      <div class="toolbar"><button class="btn btn--primary" onclick="location.reload()">Volver a intentarlo</button></div>
      <p class="field-sub">Tus datos no se han tocado: siguen guardados en este dispositivo.</p>`;
    return;
  }
  const LF = L.LF;

  // ---------- Versión y novedades ----------
  // Al publicar cambios: añadir una entrada AL PRINCIPIO de NOVEDADES, poner su versión en los ?v= de index.html, en
  // APP_VERSION y subir CACHE_NAME en sw.js. Formato de versión: AAAA.NN.
  const APP_VERSION = "2026.02";
  const NOVEDADES = [
    { version: "2026.02", fecha: "Octubre 2026", titulo: "El análisis AMFE, dentro del mapa", cambios: [
      "Paso 5, Equipo y sesiones: los perfiles del equipo con su papel, las sesiones de trabajo con sus asistentes y la metodología empleada.",
      "Paso 6, Fallos: con un botón, cada punto crítico pasa a ser un modo de fallo de su subproceso. Después se escriben su efecto, su causa y los controles actuales. También se puede pegar una tabla de Excel.",
      "Paso 7, Puntuar y priorizar: gravedad, ocurrencia y detección con la escala a la vista, IPR, los fallos prioritarios (los N de mayor IPR o un umbral, la gravedad 9–10, el fallo crítico y los cambios a mano con su motivo), la matriz de riesgos 10 × 10 o 5 × 5 y los riesgos por subproceso. Usa el motor de la app AMFE.",
      "«Traer de AMFE» en el paso 1: si ya hiciste el AMFE en su app, se trae con sus fallos, su puntuación, su prioridad y sus acciones.",
      "El ejemplo de Urgencias trae ya el equipo, las tres sesiones y los 49 fallos puntuados: salen los mismos 15 prioritarios que en el curso.",
      "Aprende: temas 5 (el AMFE) y 6 (priorizar). Glosario ampliado.",
      "Por dentro: la app deja preparados sus datos para que Auditorías pueda traer los riesgos clave del mapa."] },
    { version: "2026.01", fecha: "Octubre 2026", titulo: "Primera versión: conocer el proceso", cambios: [
      "Asistente en 10 pasos agrupados en cuatro fases, con «Tu siguiente paso» en la portada. En esta versión están disponibles los pasos 1 a 4 (conocer el proceso).",
      "El proceso: qué se analiza, para qué, dónde empieza y dónde acaba, con objetivo propuesto.",
      "Los subprocesos, como el ejercicio 6 del curso: descripción, inicio, fin y roles.",
      "El flujograma: escribe los pasos (o pega una lista) y la app lo dibuja sola, por calles y subprocesos, con el marco de procesos estratégicos, clave y de soporte. Usa el motor de la app Flujograma.",
      "Los puntos críticos, subproceso a subproceso, con propuestas de dónde buscar y colocados en su paso del flujograma.",
      "«Traer de Flujograma»: si ya dibujaste el proceso en la app Flujograma, se trae con un botón.",
      "Ejemplo completo de Urgencias (7 subprocesos, 33 pasos y 49 puntos críticos), Aprende (4 temas), glosario, vista para imprimir y copia de seguridad."] }
  ];
  const ENTREGA = 2;   // entrega construida: pasos con entrega ≤ ENTREGA (ver L.PASOS)

  // ---------- Utilidades ----------
  const hoy = () => new Date().toISOString();
  const hoyIso = () => new Date().toISOString().slice(0, 10);
  const fechaCorta = iso => { const d = new Date(iso); return isNaN(d) ? "" : d.toLocaleDateString("es-ES"); };
  const fmtFecha = s => /^\d{4}-\d{2}-\d{2}$/.test(s || "") ? s.split("-").reverse().join("/") : (s || "");
  const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const lleno = L.lleno, plural = L.plural;
  const clon = o => JSON.parse(JSON.stringify(o));
  const leer = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const escribir = (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } };

  // ---------- Datos (solo en este dispositivo) ----------
  const KEY_DATOS = "mapariesgos-datos", KEY_INTERCAMBIO = "mapariesgos-intercambio";
  let datos = { mapas: [], ultimaCopia: null };
  (function cargar() {
    const crudo = leer(KEY_DATOS); if (!crudo) return;
    try {
      const o = JSON.parse(crudo), s = L.sanearDatos(o, genId, hoy());
      if (s) datos = { mapas: s.mapas, ultimaCopia: typeof o.ultimaCopia === "string" ? o.ultimaCopia : null };
    } catch (e) { /* datos dañados: se empieza de cero sin borrar lo guardado */ }
  })();
  // Los datos del usuario son los únicos que se guardan. Los ejemplos viven aparte, en memoria
  // (ids «ej-…»): se pueden tocar, pero ni se guardan ni se mezclan con los suyos.
  const datosUsuario = datos;
  let datosEjemplo = null, modoEjemplo = false;
  const esIdEjemplo = id => /^ej-/.test(id || "");
  function ejemplos() {
    if (!datosEjemplo) datosEjemplo = { mapas: C.EJEMPLOS.mapas.map(m => L.sanearMapa(clon(m), genId, hoy())).filter(Boolean), ultimaCopia: null };
    return datosEjemplo;
  }
  let tGuardar = null, avisoSinEspacio = false;
  function guardar(inmediato) {
    clearTimeout(tGuardar);
    const fn = () => {
      const ok = escribir(KEY_DATOS, JSON.stringify({ app: "mapariesgos", v: L.VERSION_DATOS, ultimaCopia: datosUsuario.ultimaCopia, mapas: datosUsuario.mapas }));
      // Paquete con forma fija para que otras apps del mismo dominio lo lean (p. ej. Auditorías); nunca leen mapariesgos-datos
      try { escribir(KEY_INTERCAMBIO, JSON.stringify(L.paqueteIntercambio(datosUsuario.mapas, APP_VERSION, hoy()))); } catch (e) { /* */ }
      if (!ok && !avisoSinEspacio) { avisoSinEspacio = true; toast("No se ha podido guardar en este navegador (¿modo privado o sin espacio?). Haz una copia de seguridad.", 6000); }
    };
    if (inmediato) fn(); else tGuardar = setTimeout(fn, 250);
  }
  window.addEventListener("pagehide", () => guardar(true));
  const buscaMapa = id => datos.mapas.find(x => x.id === id);
  // Un mapa recién creado no se guarda hasta que se escribe algo
  const borradores = new Map();
  const esVacio = m => !m.pasos.length && !m.actores.length && !m.subprocesos.length && !m.puntos.length && !m.fallos.length && !m.equipo.length && !["titulo", "proceso", "unidad", "objetivo", "descripcion", "inicio", "fin", "responsable"].some(k => lleno(m[k]));

  // ---------- Textos de ayuda reutilizables ----------
  const box = (tipo, tag, html) => `<div class="box box--${tipo}"><span class="box-tag">${tag}</span>${html}</div>`;
  const idea = html => box("idea", "Idea clave", `<p>${html}</p>`);
  const trampa = html => box("trampa", "Ojo, trampa", `<p>${html}</p>`);
  const practica = html => box("practica", "En la práctica", `<p>${html}</p>`);
  const KEY_FACIL = "mapariesgos-facil-abierto";
  const facil = (html, titulo = "Explicado fácil") => `<details class="facil" data-recordar="1"${leer(KEY_FACIL) === "1" ? " open" : ""}><summary>${titulo}</summary><div class="facil-body">${html}</div></details>`;
  const conLienzo = () => (pasoActual === 3 && vista3 === "dibujo") || pasoActual === 4;
  const avisoHtml = a => {
    const ver = a.paso && conLienzo() ? ` <button type="button" class="link-btn" data-act="ver-paso" data-id="${a.paso}">Ver</button>` : "";
    return a.nivel === "nota" ? `<div class="note">ℹ ${esc(a.texto)}${ver}</div>` : a.nivel === "error" ? `<div class="aviso-error">✕ ${esc(a.texto)}${ver}</div>` : `<div class="warn">⚠ ${esc(a.texto)}${ver}</div>`;
  };

  // ---------- Campos ----------
  function getPath(o, path) { return path.split(".").reduce((a, k) => (a == null ? undefined : a[k]), o); }
  function setPath(o, path, v) {
    const ks = path.split("."), ult = ks.pop();
    let a = o; ks.forEach(k => { if (a[k] == null || typeof a[k] !== "object") a[k] = {}; a = a[k]; });
    a[ult] = v;
  }
  let nAyuda = 0;
  function ayudaBtn(help) {
    if (!help) return { btn: "", box: "" };
    const id = "h" + (++nAyuda);
    return { btn: `<button type="button" class="info-btn" data-info="${id}" aria-expanded="false" aria-label="Ayuda">i</button>`, box: `<p class="help" id="help-${id}" hidden>${help}</p>` };
  }
  function campo(obj, path, label, o = {}) {
    const v = getPath(obj, path) || "", a = ayudaBtn(o.help);
    const bind = o.bind || `data-k="${path}"`;
    const ctrl = o.area
      ? `<textarea class="txt-in" ${bind} rows="${o.rows || 2}" placeholder="${esc(o.ph || "")}">${esc(v)}</textarea>`
      : `<div class="input-wrap"><input class="txt-in" ${bind} value="${esc(v)}" placeholder="${esc(o.ph || "")}"${o.tipo ? ` type="${o.tipo}"` : ""} autocomplete="off" /></div>`;
    return `<div class="field${o.destacado ? " field--destacado" : ""}"><div class="field-head"><label class="field-label">${label}</label>${o.opt ? '<span class="field-opt">(opcional)</span>' : ""}${a.btn}</div>${a.box}${o.sub ? `<p class="field-sub">${o.sub}</p>` : ""}${ctrl}${o.extra || ""}</div>`;
  }
  function selector(label, bind, valor, opciones, o = {}) {
    const a = ayudaBtn(o.help);
    return `<div class="field${o.clase ? " " + o.clase : ""}"><div class="field-head"><label class="field-label">${label}</label>${a.btn}</div>${a.box}<div class="input-wrap"><select class="txt-in" ${bind}>${opciones.map(([v, t]) => `<option value="${esc(v)}"${v === valor ? " selected" : ""}>${esc(t)}</option>`).join("")}</select></div></div>`;
  }

  // ---------- Pasos del asistente ----------
  const disponible = p => p.entrega <= ENTREGA;
  const pasosDisp = () => L.PASOS.filter(disponible);
  function pasosHtml(m, actualN) {
    return `<ol class="wiz-steps wiz-steps--10 no-print" aria-label="Pasos del mapa de riesgos" data-zona="pasos">${pasosInner(m, actualN)}</ol>`;
  }
  function pasosInner(m, actualN, g = L.progreso(m)) {
    return L.PASOS.map(p => `<li class="wiz-fase--${p.fase}"><a href="#/mapa/${m.id}/${p.n}" class="wiz-step${p.n === actualN ? " actual" : g[p.n] ? " hecho" : ""}${disponible(p) ? "" : " prox"}"${p.n === actualN ? ' aria-current="step"' : ""} title="${esc(p.titulo + (disponible(p) ? "" : " (próximamente)"))}"><span class="wiz-num">${g[p.n] && p.n !== actualN ? "✓" : p.n}</span><span class="wiz-lbl">${p.corto}</span></a></li>`).join("");
  }
  const volver = (href, txt) => `<a class="volver-cuadro" href="${href}">← ${txt}</a>`;
  const nombreMapa = m => m.titulo || m.proceso || "";
  const subPunto = s => `<span class="sub-dot sub-c${s ? s.color : "x"}" aria-hidden="true"></span>`;
  const tipoChip = t => `<span class="tipo-chip tipo--${t}" aria-hidden="true"></span>`;
  const faseDe = n => L.FASES.find(f => f.pasos.includes(n));

  // ---------- Inicio ----------
  function renderHome() {
    const d = datosUsuario, sig = L.siguientePaso(d, ENTREGA), n = d.mapas.length;
    const np = d.mapas.reduce((s, m) => s + m.puntos.length, 0);
    const diasCopia = d.ultimaCopia ? Math.floor((Date.now() - new Date(d.ultimaCopia)) / 864e5) : null;
    const avisoCopia = n && (diasCopia === null || diasCopia > 30)
      ? `<div class="warn">⚠ ${diasCopia === null ? "Aún no has hecho ninguna copia de seguridad." : `Tu última copia de seguridad es de hace ${diasCopia} días.`} Tus datos solo están en este dispositivo: guarda una copia.</div>` : "";
    const ult = d.mapas.slice().sort((x, y) => String(y.modificado).localeCompare(String(x.modificado)))[0];
    view.innerHTML = `
      <section class="hero">
        <h1 class="hero-t"><span>Mapa de Riesgos</span></h1>
        <p class="hero-p">Elabora, <b>paso a paso</b>, el mapa de riesgos de <b>cualquier proceso sanitario</b>: el proceso y su flujograma, los puntos críticos, el análisis AMFE, las acciones de mejora y, al final, <b>el mapa</b>: el flujograma con los riesgos encima, coloreados por su prioridad, y el documento final.</p>
        <div class="hero-btns">
          <a class="btn btn--primary btn--grande" href="#/mapa/nuevo">+ Nuevo mapa de riesgos</a>
          <a class="btn btn--grande" href="#/mapa">Mis mapas${n ? ` <span class="contador">${n}</span>` : ""}</a>
        </div>
      </section>
      ${motorAmfeAviso()}
      <div class="siguiente">
        <span class="siguiente-tag">Tu siguiente paso</span>
        <p>${esc(sig.texto)}</p>
        <a class="btn btn--primary" href="${sig.href}">${esc(sig.btn)} →</a>
      </div>
      <h2 class="sec-t">El camino, en 10 pasos</h2>
      <p class="page-lead">Cuatro fases, como el documento final del curso: conocer el proceso, analizar sus riesgos, mejorar y representarlo todo en el mapa.</p>
      ${L.FASES.map(fa => `<h3 class="fase-t fase-t--${fa.k}">${esc(fa.nom)}</h3><ol class="fases">
        ${fa.pasos.map(k => L.PASOS[k - 1]).map(p => `<li><a class="fase fase--acc${disponible(p) ? "" : " prox"}" href="${ult ? `#/mapa/${ult.id}/${p.n}` : "#/mapa/nuevo"}">
          <span class="fase-cab"><span class="pdca-num">${p.n}</span><b>${p.titulo}</b></span>
          <span class="fase-que">${p.que}</span>
          ${disponible(p) ? "" : `<span class="fase-prox">Próximamente</span>`}
        </a></li>`).join("")}</ol>`).join("")}
      <h2 class="sec-t">Tus datos</h2>
      <div class="card datos-card">
        <div class="datos-cifras">
          <a href="#/mapa"><b>${n}</b><span>${n === 1 ? "mapa" : "mapas"}</span></a>
          <a href="#/mapa"><b>${d.mapas.reduce((s, m) => s + m.subprocesos.length, 0)}</b><span>subprocesos</span></a>
          <a href="#/mapa"><b>${np}</b><span>${np === 1 ? "punto crítico" : "puntos críticos"}</span></a>
          <a href="#/mapa"><b>${d.mapas.reduce((s, m) => s + m.fallos.length, 0)}</b><span>fallos</span></a>
        </div>
        ${avisoCopia}
        <p class="field-sub">Se guardan <b>solo en este dispositivo</b>. Para trabajar en equipo, pasa tu copia a los demás: al importarla se junta con lo suyo sin duplicar.${d.ultimaCopia ? ` Última copia: ${fechaCorta(d.ultimaCopia)}.` : ""}</p>
        <div class="toolbar"><button class="btn" data-act="copia">⬇ Copia de seguridad</button><button class="btn" data-act="importar">⬆ Importar copia</button></div>
      </div>
      <div class="guide">
        <a class="guide-card" href="#/ejemplos"><span class="guide-num">Ej</span><div><div class="guide-q">Ejemplo</div><div class="guide-a">El mapa de riesgos de la <b>atención en Urgencias</b> del curso: subprocesos, flujograma y puntos críticos.</div></div><span class="guide-go">›</span></a>
        <a class="guide-card" href="#/aprende"><span class="guide-num">?</span><div><div class="guide-q">Aprende</div><div class="guide-a">${C.TEMAS.length} temas <b>explicados fácil</b>: de la seguridad del paciente a los puntos críticos.</div></div><span class="guide-go">›</span></a>
        <a class="guide-card" href="#/glosario"><span class="guide-num">A–Z</span><div><div class="guide-q">Glosario</div><div class="guide-a">${C.GLOSARIO.length} términos <b>en lenguaje llano</b>, con buscador.</div></div><span class="guide-go">›</span></a>
        <a class="guide-card guide-card--hermana" href="${L.URL_FLUJO}" target="_blank" rel="noopener"><span class="guide-num">↓</span><div><div class="guide-q">Flujograma ↗</div><div class="guide-a">App hermana: <b>dibuja el proceso</b> por tu cuenta y tráelo aquí con un botón.</div></div><span class="guide-go">›</span></a>
        <a class="guide-card guide-card--hermana" href="${L.URL_AMFE}" target="_blank" rel="noopener"><span class="guide-num">!</span><div><div class="guide-q">AMFE ↗</div><div class="guide-a">App hermana: el <b>AMFE completo</b>, con lluvia de ideas, grupo nominal, votación e Ishikawa.</div></div><span class="guide-go">›</span></a>
        <a class="guide-card guide-card--hermana" href="${L.URL_AUD}" target="_blank" rel="noopener"><span class="guide-num">✓</span><div><div class="guide-q">Auditorías ↗</div><div class="guide-a">App hermana: los riesgos clave del mapa, <b>al Plan Anual de Auditorías</b>.</div></div><span class="guide-go">›</span></a>
        <a class="guide-card guide-card--hermana" href="${L.URL_IND}" target="_blank" rel="noopener"><span class="guide-num">%</span><div><div class="guide-q">Indicadores ↗</div><div class="guide-a">App hermana: <b>diseña los indicadores</b> de las acciones de mejora.</div></div><span class="guide-go">›</span></a>
        <a class="guide-card guide-card--hermana" href="${L.URL_DAFO}" target="_blank" rel="noopener"><span class="guide-num">D</span><div><div class="guide-q">DAFO · CAME ↗</div><div class="guide-a">App hermana: <b>analiza tu unidad</b> para decidir qué proceso conviene analizar.</div></div><span class="guide-go">›</span></a>
      </div>
      ${practica("<b>Protección de datos:</b> un mapa de riesgos describe un proceso, no a pacientes concretos. No escribas nombres de pacientes ni números de historia clínica; para el equipo bastan los perfiles y los cargos.")}`;
  }
  // El motor de AMFE se usa a partir del paso 5 (próxima versión); si no carga, se avisa sin bloquear lo demás
  function motorAmfeAviso() {
    const p = (window.MOTORES_PROBLEMAS || {}).amfe;
    return p ? `<div class="warn">⚠ ${esc(p)} Los pasos del AMFE no funcionarán hasta que se cargue (hace falta conexión la primera vez). El resto de la app funciona.</div>` : "";
  }

  // ---------- Lista ----------
  function renderLista() {
    const lista = datos.mapas.slice().sort((a, b) => String(b.modificado).localeCompare(String(a.modificado)));
    view.innerHTML = `
      <h1 class="page-title">Mis mapas de riesgos</h1>
      <p class="page-lead">Cada mapa analiza un proceso: sus subprocesos, su flujograma, sus puntos críticos y, más adelante, sus fallos priorizados.</p>
      ${facil(`<p>Un <b>mapa de riesgos</b> localiza en el proceso dónde puede fallar la atención al paciente, cuánto importa cada riesgo y qué se hace para reducirlo. El resultado final es el flujograma del proceso con los riesgos marcados encima y un documento para la Dirección y el equipo.</p>`)}
      <div class="toolbar no-print"><a class="btn btn--primary" href="#/mapa/nuevo">+ Nuevo mapa</a><a class="btn" href="#/mapa/ej-mapa-urgencias/1">Ver el ejemplo de Urgencias</a></div>
      ${lista.length ? `<div class="cuadro-lista">${lista.map(tarjeta).join("")}</div>`
        : `<div class="placeholder-box"><p><b>Todavía no tienes ningún mapa de riesgos.</b></p><p>Crea uno nuevo, o abre antes el ejemplo para ver cómo queda.</p></div>`}`;
  }
  function tarjeta(m) {
    const r = L.resumen(m), g = L.progreso(m), disp = pasosDisp(), hechos = disp.filter(p => g[p.n]).length;
    return `<div class="item-card">
      <a class="item-main" href="#/mapa/${m.id}">
        <b class="item-t">${lleno(nombreMapa(m)) ? esc(nombreMapa(m)) : '<span class="vacio">Mapa sin nombre</span>'}</b>
        <span class="item-s">${esc([m.unidad, m.titulo && m.proceso !== m.titulo ? m.proceso : ""].filter(lleno).join(" · ")) || "&nbsp;"}</span>
        <span class="badges">${r.subprocesos ? `<span class="badge">${plural(r.subprocesos, "subproceso", "subprocesos")}</span>` : ""}${r.pasos ? `<span class="badge">${plural(r.pasos, "paso", "pasos")}</span>` : ""}${r.puntos ? `<span class="badge">${plural(r.puntos, "punto crítico", "puntos críticos")}</span>` : ""}${r.fallos ? `<span class="badge">${plural(r.fallos, "fallo", "fallos")}</span>` : ""}${r.prioritarios ? `<span class="badge">${plural(r.prioritarios, "prioritario", "prioritarios")}</span>` : ""}${r.maxIPR ? iprBadge(r.maxIPR) : ""}${r.errores ? `<span class="badge badge--grave">${plural(r.errores, "error", "errores")} en el flujograma</span>` : ""}${lleno(m.validado) ? `<span class="badge badge--ok">Flujograma validado</span>` : ""}<span class="badge badge--prog">Pasos ${hechos}/${disp.length}</span></span>
      </a>
      <div class="item-pie"><span>Modificado: ${fechaCorta(m.modificado)}</span><span><button class="link-btn" data-act="m-dup" data-id="${m.id}">Duplicar</button> · <button class="link-btn link-btn--peligro" data-act="m-del" data-id="${m.id}">Borrar</button></span></div>
    </div>`;
  }

  // ---------- Ficha de un mapa: armazón común ----------
  let actual = null, pasoActual = 1;
  const abiertos = new Set();          // pasos del flujograma desplegados
  let pegarAbierto = false, selPaso = "";
  const KEY_VISTA3 = "mapariesgos-vista3";
  let vista3 = leer(KEY_VISTA3) === "dibujo" ? "dibujo" : "pasos";
  const avisosGenerales = (m, n) => L.avisosDe(m, n).filter(x => !x.paso && !x.punto && !x.sub).map(avisoHtml).join("");
  const avisosPaso = (m, id) => LF.avisosPasos(m).filter(x => x.paso === id).map(a => avisoHtml(Object.assign({}, a, { paso: "" }))).join("");
  const avisosSub = (m, id) => L.avisosSubprocesos(m).filter(x => x.sub === id).map(avisoHtml).join("");

  function renderMapa(m, n) {
    actual = m; pasoActual = n; nAyuda = 0;
    if (document.body.classList.contains("ver-informe")) { renderInforme(m); return; }
    const p = L.PASOS[n - 1], disp = pasosDisp(), fa = faseDe(n);
    const prev = disp.filter(x => x.n < n).pop(), next = disp.find(x => x.n > n);
    const cuerpo = !disponible(p) ? pasoProximo(m, p) : RENDER[n](m);
    view.innerHTML = `
      <div class="wiz-top no-print">${volver(modoEjemplo ? "#/ejemplos" : "#/mapa", modoEjemplo ? "Ejemplos" : "Mis mapas")}${pasosHtml(m, n)}</div>
      <div class="wiz-titulo"><span class="wiz-paso">Paso ${n} de 10 · ${esc(fa.nom)}${lleno(nombreMapa(m)) ? " · " + esc(L.corto(nombreMapa(m), 60)) : ""}</span><h1 class="page-title">${p.titulo}</h1></div>
      ${cuerpo}
      <div class="wiz-nav no-print">${prev ? `<a class="btn" href="#/mapa/${m.id}/${prev.n}">← ${prev.corto}</a>` : `<span></span>`}${next ? `<a class="btn btn--primary" href="#/mapa/${m.id}/${next.n}">${next.corto} →</a>` : `<a class="btn" data-act="informe">Ver para imprimir</a>`}</div>`;
    if (conLienzo() && m.pasos.length) iniciarLienzo();
  }
  function pasoProximo(m, p) {
    const amfe = p.n >= 5 && p.n <= 8;
    return `<p class="page-lead">${p.que}</p>
      <div class="placeholder-box"><p><b>Este paso llegará en una próxima versión.</b></p>
      ${amfe ? `<p>Mientras, puedes hacer el análisis en la app <a href="${L.URL_AMFE}" target="_blank" rel="noopener">AMFE</a>: cuando llegue este paso, lo traerás aquí con un botón.</p>` : "<p>Mientras, haz una copia de seguridad desde la portada: guarda todo tu trabajo.</p>"}
      <div class="toolbar" style="justify-content:center"><a class="btn btn--primary" href="#/mapa/${m.id}/4">Volver a los puntos críticos →</a></div></div>`;
  }

  // ---------- Paso 1 · El proceso ----------
  function paso1(m) {
    return `
      ${idea("Un mapa de riesgos se hace sobre <b>un proceso concreto y bien delimitado</b>: qué hecho lo abre y cuál lo cierra. Lo que pase antes o después queda fuera.")}
      ${facil(`<p>Elige un proceso <b>relevante para la seguridad del paciente</b>: con muchos profesionales, traspasos de información, decisiones rápidas o pacientes vulnerables. Por ejemplo, la atención en Urgencias, la administración de medicación o la preparación de quirófano.</p>
        <p>Escribe dónde <b>empieza</b> y dónde <b>acaba</b>, y qué queda dentro y fuera. Todo esto irá al apartado «Descripción del proceso» del documento final.</p>
        ${trampa("«Urgencias» no es un proceso, es una unidad. El proceso es lo que se hace: «Atención integral en el Servicio de Urgencias, desde la llegada hasta la decisión sobre el destino».")}`)}
      ${desdeHtml(m)}
      <div class="card">
        <h2 class="sub-h">Datos del proceso</h2>
        ${campo(m, "proceso", "Proceso que se analiza", { ph: "p. ej. Atención integral en el Servicio de Urgencias", help: "El proceso, con el nombre con el que lo conoce todo el mundo. Será el título del mapa." })}
        <div class="dos-col">
          ${campo(m, "unidad", "Unidad o servicio", { ph: "p. ej. Servicio de Urgencias" })}
          ${campo(m, "ambito", "Ámbito", { opt: true, ph: "p. ej. Área asistencial de Urgencias hospitalarias", help: "Dónde se aplica: área, centro o UGC. Sale en la portada del documento." })}
        </div>
        ${campo(m, "titulo", "Nombre corto de este mapa", { opt: true, ph: "p. ej. Mapa de Riesgos Urgencias 2026", help: "Para reconocerlo en tu lista. Si lo dejas vacío, se usa el nombre del proceso." })}
        <div class="dos-col">
          ${campo(m, "inicio", "El proceso empieza cuando…", { ph: "p. ej. El paciente llega a Urgencias" })}
          ${campo(m, "fin", "Y termina cuando…", { ph: "p. ej. Se decide y se hace efectivo su destino" })}
        </div>
        <div class="dos-col">
          ${campo(m, "incluye", "Qué queda dentro", { area: true, opt: true, ph: "p. ej. Pacientes adultos atendidos en Urgencias generales" })}
          ${campo(m, "excluye", "Qué queda fuera", { area: true, opt: true, ph: "p. ej. Urgencias pediátricas y obstétricas" })}
        </div>
        ${campo(m, "descripcion", "Descripción del proceso", { area: true, opt: true, rows: 3, ph: "p. ej. Comprende las actividades desde la llegada del paciente hasta la decisión sobre su destino…", help: "Qué abarca el proceso y por qué es importante analizar sus riesgos. Es el «objetivo general» del documento final." })}
        ${campo(m, "objetivo", "Objetivo del proceso", { area: true, opt: true, ph: "p. ej. Garantizar la atención segura, eficaz y continua del paciente…", help: "Para qué existe el proceso. Ayuda a ver dónde está el riesgo.", extra: `<div class="quick no-print"><button type="button" class="chip chip--accent" data-act="sug-objetivo">✎ Proponer objetivo</button></div>` })}
        <div class="dos-col">
          ${campo(m, "responsable", "Responsable del mapa", { opt: true, ph: "p. ej. Coordinación de Calidad y Seguridad del Paciente" })}
          ${campo(m, "fecha", "Fecha", { opt: true, ph: "p. ej. Octubre 2026" })}
        </div>
      </div>
      <div data-zona="avisos">${avisosGenerales(m, 1)}</div>
      ${lleno(m.notas) ? `<div class="card"><h2 class="sub-h">Notas</h2><p class="field-sub">${esc(m.notas)}</p></div>` : ""}`;
  }
  // «Desde dónde empiezo»: de cero o trayendo lo hecho en las apps hermanas
  let flujosLeidos = null, flujoElegido = "";
  function desdeHtml(m) {
    if (modoEjemplo) return "";
    if (amfesLeidos) return amfeHtml(m);
    const oa = m.origen.amfe, yaA = oa.id ? `<p class="field-sub">Traído de AMFE el ${esc(fmtFecha(oa.traido))}: «${esc(oa.titulo || "sin nombre")}».</p>` : "";
    const og = m.origen.flujo, ya = og.id ? `<p class="field-sub">Traído de Flujograma el ${esc(fmtFecha(og.traido))}: «${esc(og.titulo || "sin nombre")}». Si el flujograma cambia, vuelve a traerlo en un mapa nuevo.</p>` : "";
    if (flujosLeidos) {
      const F = flujosLeidos, f = F.find(x => x.id === flujoElegido) || F[0];
      return `<div class="card desde-card no-print"><h2 class="sub-h">Traer de Flujograma</h2>
        ${selector("Flujograma", 'data-flujosel="1"', f.id, F.map(x => [x.id, L.resumenFlujo(x)]))}
        <ul class="field-sub"><li>El proceso y sus subprocesos (los que ya tengas no se repiten).</li><li>${m.pasos.length ? "<b>Los pasos no</b>: este mapa ya tiene flujograma." : "Las calles, los pasos y sus flechas, el marco de procesos y los puntos críticos."}</li></ul>
        <div class="toolbar"><button class="btn btn--primary" data-act="flujo-traer">Traer</button><button class="btn" data-act="flujo-cancelar">Cancelar</button></div>
        <p class="field-sub">Se copia: si después cambias el flujograma en su app, vuelve a traerlo. Nada de lo que ya tienes se borra.</p></div>`;
    }
    return `<div class="card desde-card no-print"><h2 class="sub-h">¿Ya tienes hecho algo de este proceso?</h2>
      <p class="field-sub">Puedes hacerlo todo aquí. Pero si ya lo empezaste en otra app del conjunto, tráelo y sigue desde ahí.</p>${ya}${yaA}
      <div class="origenes">
        <button type="button" class="origen-btn" data-act="flujo-buscar"><b>⇩ Traer de Flujograma</b><span>El proceso dibujado: subprocesos, pasos y puntos críticos.</span></button>
        <button type="button" class="origen-btn" data-act="amfe-buscar"><b>⇩ Traer de AMFE</b><span>Los fallos con su efecto, su causa, su puntuación, su prioridad y sus acciones.</span></button>
        <div class="origen-btn origen-btn--prox"><b>⇩ Traer de DAFO</b><span>Un proceso marcado para analizar en tu DAFO. Próximamente.</span></div>
      </div></div>`;
  }

  // ---------- Paso 2 · Subprocesos ----------
  const bs = (s, k) => `data-s="${s.id}" data-f="${k}"`;
  function subCard(m, s, i, total) {
    const np = L.puntosDeSub(m, s.id).length, npa = m.pasos.filter(p => p.subprocesoId === s.id).length;
    return `<div class="sub-card sub-c${s.color}" data-sid="${s.id}">
      <div class="sub-cab">${subPunto(s)}<b>Subproceso ${i + 1}</b>${npa ? `<span class="badge">${plural(npa, "paso", "pasos")}</span>` : ""}${np ? `<span class="badge">${plural(np, "punto crítico", "puntos críticos")}</span>` : ""}
        <span class="sub-acc no-print"><button type="button" class="icon-mini" data-act="sub-subir" data-id="${s.id}" aria-label="Subir"${i === 0 ? " disabled" : ""}>↑</button><button type="button" class="icon-mini" data-act="sub-bajar" data-id="${s.id}" aria-label="Bajar"${i === total - 1 ? " disabled" : ""}>↓</button><button type="button" class="link-btn link-btn--peligro" data-act="sub-del" data-id="${s.id}">Quitar</button></span></div>
      <div data-zsub="${s.id}">${avisosSub(m, s.id)}</div>
      ${campo(s, "nombre", "Nombre", { bind: bs(s, "nombre"), ph: "p. ej. Triaje de enfermería" })}
      ${campo(s, "descripcion", "Qué se hace", { bind: bs(s, "descripcion"), area: true, opt: true, ph: "p. ej. Evaluación clínica inicial y asignación de prioridad" })}
      <div class="dos-col">
        ${campo(s, "inicio", "Empieza cuando…", { bind: bs(s, "inicio"), ph: "p. ej. Recepción por enfermería de triaje" })}
        ${campo(s, "fin", "Termina cuando…", { bind: bs(s, "fin"), ph: "p. ej. Derivación a sala de espera" })}
      </div>
      ${campo(s, "roles", "Quién interviene", { bind: bs(s, "roles"), ph: "p. ej. Enfermería de triaje, celador, paciente", help: "Separa los perfiles con comas. Te servirán para formar el equipo y como calles del flujograma." })}
    </div>`;
  }
  function paso2(m) {
    return `
      ${idea("Para analizar un proceso largo hay que <b>partirlo en fases</b>: los subprocesos. Cada uno con su inicio, su fin y quién interviene, como el ejercicio 6.")}
      ${facil(`<p>Un subproceso es una <b>unidad de trabajo</b> dentro del proceso: «Recepción y registro», «Triaje», «Valoración médica», «Gestión del ingreso»… Entre 3 y 8 suele ir bien.</p>
        <p>Los subprocesos son <b>la columna vertebral del mapa</b>: los usarán el flujograma (bandas de color), los puntos críticos (se buscan subproceso a subproceso), el AMFE y el documento final.</p>
        ${practica("Comprueba que el fin de cada subproceso enlaza con el inicio del siguiente: así no se queda ningún tramo del proceso sin analizar.")}`)}
      <div class="sub-lista">${m.subprocesos.map((s, i) => subCard(m, s, i, m.subprocesos.length)).join("") || `<div class="placeholder-box"><p><b>Aún no hay subprocesos.</b></p><p>Añade el primero con el botón de abajo.</p></div>`}</div>
      <div class="toolbar no-print"><button class="btn btn--primary" data-act="sub-add">+ Añadir subproceso</button></div>
      <div data-zona="avisos">${avisosGenerales(m, 2)}</div>`;
  }

  // ---------- Paso 3 · Flujograma (actores, pasos y dibujo) ----------
  function actorCard(m, a, i, total) {
    const n = m.pasos.filter(p => p.actorId === a.id).length;
    return `<div class="actor-fila">
      <span class="eq-n">${i + 1}</span>
      <div class="input-wrap"><input class="txt-in" data-ac="${a.id}" data-f="nombre" value="${esc(a.nombre)}" placeholder="p. ej. Enfermería" autocomplete="off" aria-label="Actor ${i + 1}" /></div>
      <span class="actor-n">${plural(n, "paso", "pasos")}</span>
      <span class="sub-acc no-print"><button type="button" class="icon-mini" data-act="ac-subir" data-id="${a.id}" aria-label="Subir"${i === 0 ? " disabled" : ""}>↑</button><button type="button" class="icon-mini" data-act="ac-bajar" data-id="${a.id}" aria-label="Bajar"${i === total - 1 ? " disabled" : ""}>↓</button><button type="button" class="link-btn link-btn--peligro" data-act="ac-del" data-id="${a.id}">Quitar</button></span>
    </div>`;
  }
  function actoresHtml(m) {
    const usados = new Set(m.actores.map(a => L.normal(a.nombre))), sin = LF.rolesSinCalle(m);
    return `<details class="card actores-card"${m.actores.length && m.pasos.length ? "" : " open"}><summary class="sub-h">Quién interviene: las calles del dibujo <span class="contador" data-zona="nact">${m.actores.length}</span></summary>
      <p class="field-sub">Cada actor (un profesional, un servicio o el paciente) tendrá su <b>calle</b>: una columna del dibujo. Escribe perfiles, no nombres de personas. El orden es el de las columnas.</p>
      <div class="quick no-print">${LF.ACTORES_SUG.map((x, i) => `<button type="button" class="chip${usados.has(L.normal(x)) ? " active" : ""}" data-act="ac-sug" data-i="${i}">+ ${esc(x)}</button>`).join("")}</div>
      <div class="actor-lista">${m.actores.map((a, i) => actorCard(m, a, i, m.actores.length)).join("")}</div>
      <div class="toolbar no-print"><button class="btn btn--sm" data-act="ac-add">+ Añadir actor</button>${sin.length ? `<button class="btn btn--sm" data-act="ac-roles">+ Añadir los roles de los subprocesos (${sin.length})</button>` : ""}</div></details>`;
  }
  const bp = (p, k) => `data-pa="${p.id}" data-f="${k}"`;
  const nomPaso = (q) => `${q.num}. ${L.corto(q.texto || "(sin texto)", 42)}`;
  function salidasTxt(m, p) {
    const n = id => { const q = LF.pasoDe(m, id); return q ? q.num : "?"; };
    const S = p.siguientes.filter(s => LF.pasoDe(m, s.a));
    if (p.tipo === "decision") return ["si", "no"].map(k => { const s = S.find(x => x.etiqueta === k); return `${k === "si" ? "Sí" : "No"} → ${s ? n(s.a) : "?"}`; }).join(" · ");
    if (!S.length) return p.tipo === "terminal" ? "Fin" : "→ ?";
    return S.map(s => `→ ${n(s.a)}${s.estilo === "idavuelta" ? " ⇄" : ""}`).join(" · ");
  }
  function pasoCabInner(m, p) {
    const a = LF.actorDe(m, p), err = LF.avisosPasos(m).some(x => x.paso === p.id && x.nivel === "error");
    return `<span class="rg-puesto">Nº ${p.num}</span>${tipoChip(p.tipo)}<span class="rg-txt"><b>${lleno(p.texto) ? esc(p.texto) : '<span class="vacio">Paso sin texto</span>'}</b><span>${a ? esc(a.nombre) : p.tipo === "terminal" || p.tipo === "externo" ? LF.TIPOS[p.tipo].nom : '<span class="falta">¿Quién?</span>'} · ${esc(salidasTxt(m, p))}${err ? ' <span class="falta">Revisar</span>' : ""}</span></span><span class="rg-flecha" aria-hidden="true">▾</span>`;
  }
  function salidasHtml(m, p) {
    const otros = m.pasos.filter(q => q.id !== p.id);
    const ops = [["", "— Ninguno —"], ...otros.map(q => [q.id, nomPaso(q)])];
    const sel = (lab, c, v, extra = "") => `<div class="sal-fila"><span class="sal-lab${c === "si" ? " sal--si" : c === "no" ? " sal--no" : ""}">${lab}</span><div class="input-wrap"><select class="txt-in" data-sal="${p.id}" data-c="${c}" aria-label="${esc(lab)}">${ops.map(([id, t]) => `<option value="${esc(id)}"${id === v ? " selected" : ""}>${esc(t)}</option>`).join("")}</select></div>${extra}</div>`;
    if (p.tipo === "decision") {
      const si = p.siguientes.find(s => s.etiqueta === "si"), no = p.siguientes.find(s => s.etiqueta === "no");
      return `<div class="field"><div class="field-head"><label class="field-label">Salidas</label></div>${sel("Sí →", "si", si ? si.a : "")}${sel("No →", "no", no ? no.a : "")}</div>`;
    }
    const filas = p.siguientes.map((s, i) => sel(i === 0 ? "Sigue a →" : "Y a →", String(i), s.a, `<button type="button" class="chip chip--mini${s.estilo === "idavuelta" ? " active" : ""}" data-act="p-ida" data-id="${p.id}" data-i="${i}" title="Flecha roja discontinua con punta en los dos extremos: algo que va y vuelve">⇄ ida y vuelta</button>`));
    if (!filas.length) filas.push(sel(p.tipo === "terminal" ? "Sigue a → (si es inicio)" : "Sigue a →", "0", ""));
    return `<div class="field"><div class="field-head"><label class="field-label">Sigue a</label>${ayudaBtn("El paso que viene después. Si algo sigue a dos pasos a la vez, añade otra flecha. Una «vuelta atrás» se hace eligiendo un paso anterior.").btn}</div>${filas.join("")}
      ${p.siguientes.length ? `<button type="button" class="link-btn no-print" data-act="p-flecha" data-id="${p.id}">+ Otra flecha</button>` : ""}</div>`;
  }
  function pasoCard(m, p, siempre) {
    const ab = siempre || abiertos.has(p.id), anfitriones = m.pasos.filter(q => q.id !== p.id && q.tipo !== "documento" && q.tipo !== "datos");
    return `<div class="rg paso-card tipo-borde--${p.tipo}" data-pid="${p.id}">
      <div class="rg-cab">${siempre ? `<div class="rg-toggle rg-toggle--fijo">${pasoCabInner(m, p)}</div>` : `<button type="button" class="rg-toggle" data-act="p-toggle" data-id="${p.id}" aria-expanded="${ab}">${pasoCabInner(m, p)}</button>`}</div>
      <div data-zav="${p.id}">${avisosPaso(m, p.id)}</div>
      <div class="rg-body"${ab ? "" : " hidden"}>
        <div class="field"><div class="field-head"><label class="field-label">Tipo</label>${ayudaBtn(LF.ORDEN_TIPOS.map(t => `<b>${LF.TIPOS[t].nom}</b> (${LF.TIPOS[t].forma.toLowerCase()}): ${LF.TIPOS[t].que}`).join("<br>")).btn}</div>
          <div class="tipos" role="group" aria-label="Tipo de paso">${LF.ORDEN_TIPOS.map(t => `<button type="button" class="tipo-btn${p.tipo === t ? " active" : ""}" data-act="p-tipo" data-id="${p.id}" data-v="${t}">${tipoChip(t)}<span>${LF.TIPOS[t].corto}</span></button>`).join("")}</div></div>
        ${campo(p, "texto", p.tipo === "decision" ? "Pregunta (se responde Sí o No)" : p.tipo === "terminal" ? "Qué pasa al empezar o al acabar" : "Qué se hace", { bind: bp(p, "texto"), area: true, ph: { decision: "p. ej. ¿Prioridad vital?", terminal: "p. ej. Llega el paciente a Urgencias", documento: "p. ej. Informe de alta", datos: "p. ej. Registra en la historia clínica", externo: "p. ej. Laboratorio" }[p.tipo] || "p. ej. Valora al paciente y asigna prioridad" })}
        <div class="dos-col">
          ${selector(p.tipo === "terminal" || p.tipo === "externo" ? "Calle (opcional)" : "Quién lo hace", bp(p, "actorId"), p.actorId, [["", p.tipo === "terminal" || p.tipo === "externo" ? "— Fuera de las calles —" : "— Sin asignar —"], ...m.actores.map(a => [a.id, a.nombre || "(actor sin nombre)"])], { help: "Elige un actor de la lista «Quién interviene», arriba." })}
          ${m.subprocesos.length ? selector("Subproceso", bp(p, "subprocesoId"), p.subprocesoId, [["", "— Ninguno —"], ...m.subprocesos.map((s, i) => [s.id, `${i + 1}. ${s.nombre || "Sin nombre"}`])]) : ""}
        </div>
        ${salidasHtml(m, p)}
        ${p.tipo === "documento" || p.tipo === "datos" ? selector("Va con (opcional)", bp(p, "con"), p.con, [["", "— Va suelto en el flujo —"], ...anfitriones.map(q => [q.id, nomPaso(q)])], { help: "Si es un papel o unos datos que acompañan a una actividad, se dibuja a su lado." }) : ""}
        ${campo(p, "nota", "Nota", { bind: bp(p, "nota"), area: true, opt: true, ph: "Aclaración que no sale en el dibujo" })}
        <div class="toolbar toolbar--paso no-print">
          <button type="button" class="btn btn--sm" data-act="p-debajo" data-id="${p.id}">+ Paso debajo</button>
          <button type="button" class="btn btn--sm" data-act="p-decision" data-id="${p.id}">+ Decisión debajo</button>
          ${siempre ? "" : `<button type="button" class="icon-mini" data-act="p-subir" data-id="${p.id}" aria-label="Subir en la lista">↑</button><button type="button" class="icon-mini" data-act="p-bajar" data-id="${p.id}" aria-label="Bajar en la lista">↓</button>`}
          <button type="button" class="link-btn link-btn--peligro" data-act="p-del" data-id="${p.id}">Quitar</button>
        </div>
      </div>
    </div>`;
  }
  function pegarHtml() {
    if (!pegarAbierto) return "";
    return `<div class="card pegar-card no-print">
      <h2 class="sub-h">Escribir o pegar los pasos</h2>
      <p class="field-sub">Una <b>lista</b>, un paso por línea, o una <b>tabla</b> copiada de Excel, Calc o Word con columnas Nº · Tipo · Paso · Quién · Sigue a.</p>
      <textarea class="txt-in" id="pegar-txt" rows="7" placeholder="1. Inicio: Llega el paciente a Urgencias.&#10;2. Administrativo registra los datos.&#10;3. Enfermera realiza el triaje.&#10;4. ¿Prioridad vital?&#10;5. Médico valora al paciente en consulta."></textarea>
      <div data-zona="pegar"></div>
      ${facil(`<ul><li>Si la línea empieza por un profesional («Enfermera…», «Médico…», «Celador…»), ese es el actor; si no, el de la línea anterior.</li><li>Las preguntas («¿…?») son decisiones; las frases con «si» se convierten en decisión + actividad.</li><li>«Inicio: …», «Fin: …», «Documento: …» y «Datos: …» al principio de la línea fijan el tipo.</li><li>Si no hay inicio o fin, se añaden.</li></ul>`, "Cómo lo entiende la app")}
      <div class="toolbar"><button class="btn btn--primary" data-act="pegar-ok" disabled>Añadir los pasos</button><button class="btn" data-act="pegar-cerrar">Cancelar</button></div>
    </div>`;
  }
  function paso3(m) {
    const seg = `<div class="seg vista3 no-print" role="group" aria-label="Vista"><button type="button" class="${vista3 === "pasos" ? "active" : ""}" data-act="v3" data-v="pasos">✎ Pasos</button><button type="button" class="${vista3 === "dibujo" ? "active" : ""}" data-act="v3" data-v="dibujo">▦ Dibujo</button></div>`;
    const err = LF.errores(m).length;
    return `
      ${idea("Escribe el proceso <b>paso a paso</b>: qué se hace, <b>quién</b> lo hace y <b>a qué paso sigue</b>. La app dibuja el flujograma, que será la base del mapa.")}
      ${facil(`<p>Cada paso tiene un <b>tipo</b>, que decide su símbolo:</p><div class="leyenda-wrap">${D.leyenda(LF.ORDEN_TIPOS.map(t => [t, LF.TIPOS[t].corto]))}</div>
        <p>Una <b>decisión</b> es una pregunta con dos salidas: Sí y No. El resto de pasos suelen tener una salida: el paso que viene después. Asigna cada paso a su <b>subproceso</b>: en el dibujo saldrán en bandas de color.</p>
        ${trampa("Lo más frecuente al empezar: decisiones sin la salida del No, pasos que no llevan a ningún sitio y actividades escritas como un papel («Hoja de tratamiento» es un documento; «Escribe la hoja de tratamiento», una actividad).")}
        ${practica(`¿Ya lo dibujaste en la app <a href="${L.URL_FLUJO}" target="_blank" rel="noopener">Flujograma</a>? Tráelo desde el paso 1 con «Traer de Flujograma».`)}`)}
      ${actoresHtml(m)}
      ${seg}
      ${vista3 === "dibujo" ? (m.pasos.length ? `${err ? `<div class="aviso-error">✕ El dibujo tiene ${plural(err, "error", "errores")} (en rojo). <a href="#avisos3">Ver cuáles</a></div>` : ""}
          ${lienzoHtml(m)}
          <div class="leyenda-wrap no-print">${D.leyenda(LF.ORDEN_TIPOS.map(t => [t, LF.TIPOS[t].corto]))}</div>` : sinPasos(m))
        : `<div class="toolbar no-print">
          <button class="btn btn--primary" data-act="p-add">+ Añadir paso</button>
          <button class="btn" data-act="pegar-abrir">✎ Escribir o pegar una lista</button>
          ${m.pasos.length ? `<button class="btn" data-act="p-todos">${abiertos.size ? "Cerrar todos" : "Abrir todos"}</button>` : ""}
        </div>
        ${pegarHtml()}
        <div class="pasos-lista">${m.pasos.map(p => pasoCard(m, p)).join("") || (pegarAbierto ? "" : `<div class="placeholder-box"><p><b>Aún no hay pasos.</b></p><p>Lo más rápido: «Escribir o pegar una lista». También puedes añadirlos uno a uno.</p></div>`)}</div>
        ${m.pasos.length ? `<div class="toolbar no-print"><button class="btn" data-act="p-add">+ Añadir paso al final</button></div>` : ""}`}
      <h2 class="sec-t" id="avisos3">¿Está bien hecho?</h2>
      <div data-zona="avisos3">${validadorHtml(m)}</div>
      ${m.pasos.length ? `<h2 class="sec-t">Revisión con el equipo</h2><div class="card" data-zona="validado">${validadoHtml(m)}</div>` : ""}`;
  }
  function validadorHtml(m) {
    const A = L.avisosFlujo(m), err = A.filter(a => a.nivel === "error").length, war = A.filter(a => a.nivel === "warn").length;
    if (!m.pasos.length) return A.map(avisoHtml).join("");
    const cab = !err && !war ? `<div class="ok-box">✓ El validador no encuentra errores. Revisa el dibujo con el equipo.</div>` : `<p class="field-sub">${err ? `<b>${plural(err, "error", "errores")}</b> que impiden dar el flujograma por bueno` : ""}${err && war ? " y " : ""}${war ? plural(war, "aviso", "avisos") : ""}.</p>`;
    return cab + A.map(avisoHtml).join("");
  }
  function validadoHtml(m) {
    const err = LF.errores(m).length;
    if (lleno(m.validado)) return `<p class="ok-box">✓ Validado con el equipo el <b>${esc(fmtFecha(m.validado))}</b>.</p><p class="field-sub">Si cambiáis el proceso, volved a revisarlo.</p><div class="toolbar no-print"><button class="btn btn--sm" data-act="validar-quitar">Quitar la validación</button></div>`;
    return `<p class="field-sub">El flujograma se <b>revisa y valida con todo el equipo</b> que hace el proceso, para que refleje lo que de verdad se hace.</p>
      <div class="toolbar no-print"><button class="btn btn--primary" data-act="validar"${err ? " disabled" : ""}>✓ Lo hemos revisado: marcar como validado hoy</button></div>${err ? `<p class="field-sub">Antes, corrige los errores del validador.</p>` : ""}`;
  }

  // ---------- El dibujo (pasos 3 y 4) ----------
  let zoom = null;   // null = ajustar a la pantalla
  const sinPasos = m => `<div class="placeholder-box"><p><b>Aún no hay nada que dibujar.</b></p><p>Escribe los pasos del proceso y vuelve aquí.</p><div class="toolbar" style="justify-content:center"><button class="btn btn--primary" data-act="v3" data-v="pasos">Escribir los pasos →</button></div></div>`;
  function lienzoHtml(m) {
    const V = m.vista;
    const seg = (act, val, ops) => `<div class="seg seg--sm" role="group">${ops.map(([v, t]) => `<button type="button" class="${val === v ? "active" : ""}" data-act="${act}" data-v="${v}">${t}</button>`).join("")}</div>`;
    return `<div class="lienzo-barra no-print">
        ${pasoActual === 3 ? seg("v-or", V.orientacion, [["vertical", "↓ De arriba abajo"], ["horizontal", "→ De izquierda a derecha"]]) : ""}
        <div class="lienzo-ops">
          ${m.subprocesos.length ? `<button type="button" class="chip${V.subprocesos ? " active" : ""}" data-act="v-sub">Subprocesos</button>` : ""}
          ${pasoActual === 3 ? `<button type="button" class="chip${V.calles === "turno" ? " active" : ""}" data-act="v-turno" title="Una calle nueva cada vez que el proceso vuelve a un profesional, como en las soluciones del curso">Calles por turnos</button>
          <button type="button" class="chip${V.marco ? " active" : ""}" data-act="v-marco" title="Procesos estratégicos, proceso clave y procesos de soporte, como en el Documento Final">Marco de procesos</button>` : ""}
          <button type="button" class="chip${V.numeros ? " active" : ""}" data-act="v-num">Números</button>
          <button type="button" class="chip${V.letra === "grande" ? " active" : ""}" data-act="v-letra">Letra grande</button>
        </div>
        <div class="zoom-btns"><button type="button" class="icon-mini" data-act="z-menos" aria-label="Reducir">−</button><button type="button" class="btn btn--sm" data-act="z-ajustar">Ajustar</button><button type="button" class="icon-mini" data-act="z-mas" aria-label="Ampliar">+</button></div>
      </div>
      <div class="lienzo" id="lienzo" tabindex="0" aria-label="Flujograma. Usa los botones para ampliar o reducir."><div class="lienzo-in" data-zona="lienzo">${svgActual(m)}</div></div>
      <div data-zona="panel">${panelHtml(m)}</div>
      ${V.marco && pasoActual === 3 ? marcoHtml(m) : ""}`;
  }
  // Marco del mapa de procesos: un proceso por línea
  function marcoHtml(m) {
    const area = (k, t, ph) => `<div class="field"><div class="field-head"><label class="field-label">${t}</label></div><textarea class="txt-in" data-marco="${k}" rows="4" placeholder="${esc(ph)}">${esc(m.marco[k].join("\n"))}</textarea></div>`;
    return `<div class="card no-print"><h2 class="sub-h">Marco de procesos</h2><p class="field-sub">Un proceso por línea. El proceso clave es el que analizas. Este marco rodeará también el mapa final.</p>
      <div class="dos-col">${area("estrategicos", "Procesos estratégicos (arriba)", "p. ej. Contrato programa")}${area("soporte", "Procesos de soporte (abajo)", "p. ej. Sistemas de información")}</div>
      ${!m.marco.estrategicos.length && !m.marco.soporte.length ? `<div class="toolbar"><button class="btn btn--sm" data-act="marco-sug">Proponer los habituales</button></div>` : ""}</div>`;
  }
  function svgActual(m) {
    const marcar = new Set(pasoActual === 3 ? LF.errores(m).map(a => a.paso).filter(Boolean) : []);
    // En el paso 3 no se pintan los avisos de los puntos críticos (son del paso 4)
    const g = pasoActual === 3 ? Object.assign({}, m, { puntos: [] }) : m;
    return D.svg(LF.dibujar(g), { marcar, sel: selPaso, numeros: m.vista.numeros, titulo: "Flujograma: " + (nombreMapa(m) || "sin nombre"), accesible: true });
  }
  function panelHtml(m) {
    const p = selPaso && LF.pasoDe(m, selPaso);
    if (pasoActual === 4) {
      if (!p) return `<p class="field-sub panel-pista no-print">Toca un paso del dibujo para ver sus puntos críticos o añadir uno.</p>`;
      const l = m.puntos.filter(x => x.pasoId === p.id);
      return `<div class="panel-paso no-print"><div class="panel-cab"><b>Paso nº ${p.num} · ${esc(L.corto(p.texto || "sin texto", 50))}</b><button type="button" class="link-btn" data-act="panel-cerrar">Cerrar ✕</button></div>
        ${l.map(x => puntoCard(m, x)).join("") || `<p class="field-sub">Este paso no tiene puntos críticos.</p>`}
        <div class="toolbar"><button class="btn btn--primary btn--sm" data-act="pc-add" data-paso="${p.id}">+ Punto crítico en este paso</button></div></div>`;
    }
    if (!p) return `<p class="field-sub panel-pista no-print">Toca un símbolo del dibujo para corregir su paso.</p>`;
    return `<div class="panel-paso no-print"><div class="panel-cab"><b>Paso nº ${p.num}</b><button type="button" class="link-btn" data-act="panel-cerrar">Cerrar ✕</button></div>${pasoCard(m, p, true)}${retoqueHtml(m, p)}</div>`;
  }
  // Retoques ligeros: bajar el paso unas filas o ponerlo al lado de otro. El resto se recoloca solo.
  function retoqueHtml(m, p) {
    const fila = parseInt(p.ajuste.fila, 10) || 0, otros = m.pasos.filter(q => q.id !== p.id && !(q.ajuste && q.ajuste.lado === p.id));
    return `<div class="card retoque"><h3 class="sub-h">Retoque del dibujo</h3>
      <div class="toolbar"><button type="button" class="btn btn--sm" data-act="aj-bajar" data-id="${p.id}"${p.ajuste.lado ? " disabled" : ""}>↓ Bajar una fila</button><button type="button" class="btn btn--sm" data-act="aj-subir" data-id="${p.id}"${fila ? "" : " disabled"}>↑ Subir</button>${fila ? `<span class="badge">${plural(fila, "fila de más", "filas de más")}</span>` : ""}</div>
      ${selector("Poner al lado de", `data-aj="${p.id}"`, p.ajuste.lado, [["", "— Donde lo pone la app —"], ...otros.map(q => [q.id, nomPaso(q)])], { help: "Lo coloca en la misma fila que el paso elegido." })}
      ${fila || p.ajuste.lado ? `<button type="button" class="link-btn" data-act="aj-quitar" data-id="${p.id}">Quitar los retoques de este paso</button>` : ""}</div>`;
  }
  // Zoom del lienzo: botones, Ctrl + rueda y pellizco con dos dedos (como Flujograma)
  function anchoSvg() { const s = $("#lienzo svg"); return s ? Number(s.getAttribute("width")) : 0; }
  function aplicarZoom() {
    const s = $("#lienzo svg"), l = $("#lienzo"); if (!s || !l) return;
    const w = Number(s.getAttribute("width")), h = Number(s.getAttribute("height"));
    const z = zoom == null ? Math.max(0.55, Math.min(1, ajusteAncho())) : zoom;
    s.style.width = Math.round(w * z) + "px"; s.style.height = Math.round(h * z) + "px";
  }
  function ajusteAncho() { const s = $("#lienzo svg"), l = $("#lienzo"); return s && l ? Math.min(1, (l.clientWidth - 4) / Number(s.getAttribute("width")), (l.clientHeight - 4) / Number(s.getAttribute("height"))) : 1; }
  function zoomActual() { const s = $("#lienzo svg"); return s ? parseFloat(s.style.width) / anchoSvg() : 1; }
  function ponerZoom(z, cx, cy) {
    const l = $("#lienzo"); if (!l) return;
    const antes = zoomActual(), nz = Math.max(0.2, Math.min(3, z));
    const px = (l.scrollLeft + (cx == null ? l.clientWidth / 2 : cx)) / antes, py = (l.scrollTop + (cy == null ? l.clientHeight / 2 : cy)) / antes;
    zoom = nz; aplicarZoom();
    l.scrollLeft = px * nz - (cx == null ? l.clientWidth / 2 : cx); l.scrollTop = py * nz - (cy == null ? l.clientHeight / 2 : cy);
  }
  function iniciarLienzo() {
    const l = $("#lienzo"); if (!l) return;
    aplicarZoom();
    const dedos = new Map(); let ini = null;
    l.addEventListener("pointerdown", e => { if (e.pointerType === "touch") dedos.set(e.pointerId, [e.clientX, e.clientY]); if (dedos.size === 2) { const [a, b] = [...dedos.values()]; ini = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), z: zoomActual() }; } });
    l.addEventListener("pointermove", e => {
      if (!dedos.has(e.pointerId)) return; dedos.set(e.pointerId, [e.clientX, e.clientY]);
      if (dedos.size === 2 && ini) { const [a, b] = [...dedos.values()], r = l.getBoundingClientRect(); ponerZoom(ini.z * Math.hypot(a[0] - b[0], a[1] - b[1]) / ini.d, (a[0] + b[0]) / 2 - r.left, (a[1] + b[1]) / 2 - r.top); }
    });
    const fuera = e => { dedos.delete(e.pointerId); if (dedos.size < 2) ini = null; };
    ["pointerup", "pointercancel", "pointerleave"].forEach(t => l.addEventListener(t, fuera));
    l.addEventListener("wheel", e => { if (!e.ctrlKey) return; e.preventDefault(); const r = l.getBoundingClientRect(); ponerZoom(zoomActual() * (e.deltaY < 0 ? 1.1 : 0.9), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
    l.addEventListener("keydown", e => { const g = e.target.closest && e.target.closest(".fl-nodo"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); seleccionar(g.dataset.paso); } });
  }
  function seleccionar(id) {
    selPaso = id; const m = actual; if (!m) return;
    const z = $("[data-zona='lienzo']"); if (z) { z.innerHTML = svgActual(m); aplicarZoom(); }
    const pz = $("[data-zona='panel']"); if (pz) { pz.innerHTML = panelHtml(m); if (id) pz.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
  }
  window.addEventListener("resize", () => { if (conLienzo() && zoom == null) aplicarZoom(); });

  // ---------- Paso 4 · Puntos críticos ----------
  const bpc = (x, k) => `data-pc="${x.id}" data-f="${k}"`;
  function puntoCard(m, x) {
    const s = L.subDePunto(m, x), pasosSub = m.pasos.filter(p => !s || p.subprocesoId === s.id || !p.subprocesoId);
    return `<div class="sub-card punto-card${s ? " sub-c" + s.color : ""}" data-ptid="${x.id}">
      <div class="sub-cab"><span class="pc-num" aria-hidden="true">⚠ ${x.num}</span><b>Punto crítico nº ${x.num}</b>${x.origen === "propuesta" ? `<span class="badge">Propuesto por la app</span>` : ""}
        <span class="sub-acc no-print"><button type="button" class="link-btn link-btn--peligro" data-act="pc-del" data-id="${x.id}">Quitar</button></span></div>
      <div data-zpc="${x.id}">${avisosPunto(m, x.id)}</div>
      ${campo(x, "titulo", "Error o punto crítico", { bind: bpc(x, "titulo"), area: true, ph: "p. ej. No colocación de la pulsera identificativa", help: "Lo que puede salir mal, en una frase. Será un modo de fallo del AMFE." })}
      ${campo(x, "descripcion", "Descripción del error o riesgo", { bind: bpc(x, "descripcion"), area: true, opt: true, ph: "p. ej. El paciente no recibe su identificación física, con riesgo de errores en pruebas o tratamientos" })}
      <div class="dos-col">
        ${selector("Subproceso", bpc(x, "subprocesoId"), s ? s.id : "", [["", "— Elige el subproceso —"], ...m.subprocesos.map((y, i) => [y.id, `${i + 1}. ${y.nombre || "Sin nombre"}`])])}
        ${m.pasos.length ? selector("En el paso del flujograma", bpc(x, "pasoId"), x.pasoId, [["", "— Sin colocar —"], ...pasosSub.map(q => [q.id, nomPaso(q)])], { help: "Dónde ocurre. Al final, el mapa pondrá aquí los fallos que salgan de este punto crítico." }) : ""}
      </div>
      ${x.pasoId && pasoActual === 4 ? `<button type="button" class="link-btn no-print" data-act="ver-paso" data-id="${x.pasoId}">Ver en el dibujo</button>` : ""}
    </div>`;
  }
  const avisosPunto = (m, id) => L.avisosPuntos(m).filter(a => a.punto === id).map(avisoHtml).join("");
  function propuestasHtml(m) {
    const P = L.propuestas(m), nd = m.descartes.length;
    if (!P.length) return `<p class="field-sub">No quedan propuestas.${nd ? ` <button type="button" class="link-btn" data-act="prop-recuperar">Recuperar las ${nd} descartadas</button>` : ""}</p>`;
    return `<div class="prop-lista">${P.map(x => { const p = LF.pasoDe(m, x.pasoId), s = p && L.subDe(m, p.subprocesoId); return `<div class="prop">
        <div class="prop-txt"><b>${esc(x.titulo)}</b><span>${s ? esc(s.nombre) + " · " : ""}Paso nº ${p.num} · ${esc(L.corto(p.texto, 50))}. ${esc(x.motivo)}</span></div>
        <div class="prop-acc no-print"><button type="button" class="btn btn--sm btn--primary" data-act="prop-ok" data-k="${esc(x.clave)}">Añadir</button><button type="button" class="btn btn--sm" data-act="prop-no" data-k="${esc(x.clave)}">Descartar</button><button type="button" class="link-btn" data-act="ver-paso" data-id="${p.id}">Ver</button></div>
      </div>`; }).join("")}</div>${nd ? `<p class="field-sub"><button type="button" class="link-btn" data-act="prop-recuperar">Recuperar las ${nd} descartadas</button></p>` : ""}`;
  }
  const KEY_PCSUB = "mapariesgos-pc-abiertos";
  let pcAbiertos = new Set((leer(KEY_PCSUB) || "").split(",").filter(Boolean));
  function tablaPuntosHtml(m) {
    const G = L.puntosPorSub(m);
    if (!m.subprocesos.length && !m.puntos.length) return `<div class="placeholder-box"><p><b>Primero, los subprocesos.</b></p><p>Los puntos críticos se buscan subproceso a subproceso.</p><div class="toolbar" style="justify-content:center"><a class="btn btn--primary" href="#/mapa/${m.id}/2">Ir al paso 2 →</a></div></div>`;
    return G.map(g => {
      const k = g.sub ? g.sub.id : "_sin", ab = pcAbiertos.has(k) || g.puntos.length <= 2;
      return `<details class="pc-grupo"${ab ? " open" : ""} data-pcg="${k}"><summary class="grupo-t">${g.sub ? subPunto(g.sub) + esc((m.subprocesos.indexOf(g.sub) + 1) + ". " + (g.sub.nombre || "Subproceso sin nombre")) : "Sin subproceso"}<span class="contador">${g.puntos.length}</span></summary>
        <div class="sub-lista">${g.puntos.map(x => puntoCard(m, x)).join("") || `<p class="field-sub">Aún no hay puntos críticos en este subproceso.</p>`}</div>
        ${g.sub ? `<div class="toolbar no-print"><button class="btn btn--sm" data-act="pc-add" data-sub="${g.sub.id}">+ Punto crítico en «${esc(L.corto(g.sub.nombre || "este subproceso", 40))}»</button></div>` : ""}</details>`;
    }).join("");
  }
  function paso4(m) {
    const nP = L.propuestas(m).length;
    return `
      ${idea("Un <b>punto crítico</b> es un momento del proceso donde puede producirse un fallo que dañe al paciente. Se buscan <b>subproceso a subproceso</b>, como el ejercicio 8, y cada uno será un <b>modo de fallo</b> del AMFE.")}
      ${facil(`<p>¿Dónde buscarlos? Donde más se falla:</p>
        <ul><li><b>Traspasos</b>: cuando el proceso pasa de un profesional a otro.</li><li><b>Decisiones</b>: si se decide mal, el paciente va por el camino equivocado.</li><li><b>Identificación</b> del paciente y de las muestras.</li><li><b>Registros</b>, <b>comunicación</b>, <b>traslados</b>, <b>medicación</b> y <b>esperas</b>.</li></ul>
        <p>Escribe cada uno como <b>lo que puede salir mal</b> («No colocación de la pulsera identificativa»), no como su consecuencia («Error de identidad») ni como su solución («Implantar un checklist»).</p>
        ${practica("Si tenéis el flujograma, colocad cada punto en su paso (tocando el dibujo). Así el mapa final sabrá dónde poner los riesgos.")}`)}
      ${m.pasos.length ? `${lienzoHtml(m)}
        <h2 class="sec-t">Propuestas de la app <span class="contador" data-zona="nprop">${nP}</span></h2>
        <p class="field-sub">Lugares del flujograma donde suele haber riesgo. Añade los que tengan sentido en tu unidad y descarta los demás.</p>
        <div data-zona="propuestas">${propuestasHtml(m)}</div>` : `<div class="note">ℹ Sin flujograma (paso 3) puedes escribir igualmente los puntos críticos de cada subproceso. Con él, la app te propone dónde buscar y el mapa final sabrá dónde colocarlos.</div>`}
      <h2 class="sec-t">Puntos críticos por subproceso <span class="contador" data-zona="npc">${m.puntos.length}</span></h2>
      <div data-zona="tablapc">${tablaPuntosHtml(m)}</div>
      <div data-zona="avisos">${avisosGenerales(m, 4)}</div>
      ${m.puntos.length ? practica(`Siguiente fase: el <b>AMFE</b> (pasos 5 a 7). Cada punto crítico pasará a ser un modo de fallo con su efecto, su causa y su puntuación (en el paso 6, con un botón).`) : ""}`;
  }

  // ======================= Fase B · el AMFE (motor de AMFE en vivo) =======================
  const A = window.LogicaAmfe;
  const sinMotorAmfe = () => `<div class="error-box">${esc((window.MOTORES_PROBLEMAS || {}).amfe || "No se ha podido cargar el motor de AMFE.")}</div><p class="page-lead">Este paso usa el motor de la app AMFE. Recarga la página con conexión a internet; tus datos no se han tocado.</p>`;
  const nivelTxt = v => { const n = A.nivelIPR(v); return n ? n.k : "sin"; };
  const iprBadge = v => v ? `<span class="ipr-badge niv--${nivelTxt(v)}">IPR ${v}</span>` : `<span class="ipr-badge niv--sin">Sin IPR</span>`;
  const subDeF = (m, f) => L.subDe(m, f.subprocesoId);
  const avisosFallo = (m, n, id) => L.avisosDe(m, n).filter(a => a.fallo === id).map(avisoHtml).join("");

  // ---------- Paso 5 · Equipo y sesiones ----------
  const bm = (x, f) => `data-m="${x.id}" data-f="${f}"`;
  const bx = (x, f) => `data-x="${x.id}" data-f="${f}"`;
  const etiquetaMiembro = x => lleno(x.nombre) ? x.nombre : lleno(x.perfil) ? x.perfil : "Sin perfil";
  function miembroCard(x, i) {
    return `<div class="sub-card sub-card--eq">
      <div class="sub-cab"><span class="eq-n">${i + 1}</span><b>${lleno(x.perfil) ? esc(x.perfil) : '<span class="vacio">Perfil sin escribir</span>'}</b><span class="badge">${esc(A.ROLES[x.rol].nom)}</span>
        <span class="sub-acc no-print"><button type="button" class="link-btn link-btn--peligro" data-act="eq-del" data-id="${x.id}">Quitar</button></span></div>
      <div class="dos-col">
        ${campo(x, "perfil", "Perfil profesional", { bind: bm(x, "perfil"), ph: "p. ej. Enfermero/a de Urgencias" })}
        ${campo(x, "cargo", "Cargo o puesto", { bind: bm(x, "cargo"), opt: true, ph: "p. ej. Supervisor/a de turno" })}
      </div>
      ${selector("Papel en el equipo", bm(x, "rol"), x.rol, Object.keys(A.ROLES).map(k => [k, A.ROLES[k].nom]), { help: Object.keys(A.ROLES).map(k => `<b>${A.ROLES[k].nom}</b>: ${A.ROLES[k].que}`).join("<br>") })}
      ${campo(x, "justificacion", "Por qué está en el equipo", { bind: bm(x, "justificacion"), area: true, opt: true, ph: "p. ej. Conoce el flujo asistencial y los protocolos de cuidados" })}
      ${campo(x, "nombre", "Nombre", { bind: bm(x, "nombre"), opt: true, ph: "Puedes dejarlo vacío", help: "Opcional. El documento final puede recoger solo el perfil y el cargo." })}
    </div>`;
  }
  function sesionCard(m, x, i) {
    return `<div class="sub-card sub-card--ses">
      <div class="sub-cab"><span class="eq-n">${i + 1}</span><b>Sesión ${i + 1}</b>${lleno(x.fecha) ? `<span class="badge">${esc(fmtFecha(x.fecha))}</span>` : ""}
        <span class="sub-acc no-print"><button type="button" class="link-btn link-btn--peligro" data-act="ses-del" data-id="${x.id}">Quitar</button></span></div>
      <div class="dos-col">
        ${campo(x, "fecha", "Fecha", { bind: bx(x, "fecha"), tipo: "date" })}
        ${campo(x, "duracion", "Duración", { bind: bx(x, "duracion"), opt: true, ph: "p. ej. 2 h" })}
      </div>
      ${campo(x, "actividad", "Actividad principal", { bind: bx(x, "actividad"), ph: "p. ej. Lluvia de ideas y técnica de grupo nominal" })}
      ${m.equipo.length ? `<div class="field"><div class="field-head"><label class="field-label">Asistentes</label></div><div class="quick">${m.equipo.map(y => `<button type="button" class="chip${x.asistentes.includes(y.id) ? " active" : ""}" data-asis="${x.id}" data-v="${y.id}">${esc(L.corto(etiquetaMiembro(y), 40))}</button>`).join("")}</div></div>` : ""}
      ${campo(x, "resultados", "Resultados", { bind: bx(x, "resultados"), area: true, opt: true, ph: "p. ej. 49 fallos potenciales consensuados" })}
    </div>`;
  }
  function paso5(m) {
    if (!A) return sinMotorAmfe();
    const ya = new Set([...m.equipo.map(x => L.normal(x.perfil)), ...m.equipo.map(x => A.estamentoDe(x.perfil + " " + x.cargo)).filter(Boolean)]);
    const yaEsta = p => ya.has(L.normal(p.perfil)) || ya.has(A.estamentoDe(p.perfil));
    const T = m.metodologia.tecnicas;
    return `
      ${idea("Nadie conoce solo todo el proceso. El análisis se hace en <b>equipo multidisciplinar</b>: al menos 6 perfiles, con quien hace el proceso a diario. Es el apartado «Composición del equipo de trabajo» del documento final.")}
      ${facil(`<p>Mira los <b>roles de cada subproceso</b> (paso 2): todos deberían estar representados. Añade a alguien que domine la <b>metodología</b> y, si se puede, una mirada <b>externa</b> (otra unidad que colabora).</p>
        <p>Cada miembro tiene un <b>papel</b>: la <b>coordinación</b> dirige y modera; la <b>secretaría</b> registra lo que se decide y prepara los documentos; los demás aportan su experiencia.</p>
        <p>Lo habitual son <b>tres sesiones</b> de unas dos horas: analizar el proceso y sus puntos críticos; buscar los fallos; puntuarlos.</p>
        ${practica(`¿Queréis hacer la lluvia de ideas, el grupo nominal, la votación por miembro o el Ishikawa? Están en la app <a href="${L.URL_AMFE}" target="_blank" rel="noopener">AMFE</a>; después traéis el resultado con «Traer de AMFE» (paso 1).`)}`)}
      <h2 class="sec-t">Equipo <span class="contador" data-zona="neq">${m.equipo.length}</span></h2>
      <div class="card no-print"><p class="field-sub">Añade con un toque los perfiles habituales y después ajústalos:</p>
        <div class="quick">${A.PERFILES_SUG.map((p, i) => `<button type="button" class="chip${yaEsta(p) ? " active" : ""}" data-act="eq-sug" data-i="${i}">+ ${esc(p.perfil)}</button>`).join("")}</div></div>
      <div class="sub-lista">${m.equipo.map(miembroCard).join("")}</div>
      <div class="toolbar no-print"><button class="btn btn--primary" data-act="eq-add">+ Añadir otro perfil</button></div>
      <h2 class="sec-t">Sesiones de trabajo <span class="contador" data-zona="nses">${m.sesiones.length}</span></h2>
      <div class="sub-lista">${m.sesiones.map((x, i) => sesionCard(m, x, i)).join("") || `<p class="placeholder-box">Aún no hay sesiones. Puedes proponer las tres habituales y ajustarlas.</p>`}</div>
      <div class="toolbar no-print"><button class="btn${m.sesiones.length ? "" : " btn--primary"}" data-act="ses-add">+ Añadir sesión</button>${m.sesiones.length ? "" : `<button class="btn" data-act="ses-tipo">Proponer las 3 sesiones habituales</button>`}</div>
      <h2 class="sec-t">Metodología empleada</h2>
      <div class="card"><p class="field-sub">¿Cómo habéis buscado los fallos? Sale en el documento final.</p>
        <div class="quick">${Object.keys(L.TECNICAS).map(k => `<button type="button" class="chip${T.includes(k) ? " active" : ""}" data-act="tec" data-v="${k}">${esc(L.TECNICAS[k])}</button>`).join("")}</div>
        <p class="field-sub" data-zona="metodo">${esc(L.textoMetodologia(m))}</p>
        ${campo(m, "metodologia.texto", "Algo más sobre cómo habéis trabajado", { area: true, opt: true, ph: "p. ej. Se partió de una historia clínica simulada representativa de la casuística habitual" })}</div>
      <div data-zona="avisos">${avisosGenerales(m, 5)}</div>`;
  }

  // ---------- Paso 6 · Fallos: modo, efecto, causa y controles ----------
  const abiertosF = new Set();
  let pegarFallos = false;
  const bf = (f, k) => `data-fa="${f.id}" data-f="${k}"`;
  function falloCabInner(m, f) {
    const faltan = ["efecto", "causa"].filter(k => !lleno(f[k]));
    return `<span class="rg-puesto">Nº ${f.num}</span><span class="rg-txt"><b>${lleno(f.fallo) ? esc(f.fallo) : '<span class="vacio">Fallo sin describir</span>'}</b><span>${lleno(f.efecto) ? "→ " + esc(L.corto(f.efecto, 90)) : ""}${faltan.length ? ` <span class="falta">Falta ${faltan.join(" y ")}</span>` : ""}</span></span><span class="rg-flecha" aria-hidden="true">▾</span>`;
  }
  function falloCard(m, f) {
    const ab = abiertosF.has(f.id), s = subDeF(m, f), pt = L.puntoDe(m, f);
    const ptsSub = m.puntos.filter(x => !s || L.subDePunto(m, x) === s);
    return `<div class="rg fallo sub-c${s ? s.color : "x"}" data-fid="${f.id}">
      <div class="rg-cab"><button type="button" class="rg-toggle" data-act="fa-toggle" data-id="${f.id}" aria-expanded="${ab}">${falloCabInner(m, f)}</button></div>
      <div data-zav="${f.id}">${avisosFallo(m, 6, f.id)}</div>
      <div class="rg-body"${ab ? "" : " hidden"}>
        ${pt && lleno(pt.descripcion) ? `<p class="field-sub pt-desc">Punto crítico nº ${pt.num}: ${esc(pt.descripcion)}</p>` : ""}
        <div class="dos-col">
          ${selector("Subproceso", bf(f, "subprocesoId"), f.subprocesoId, [["", "— Elige el subproceso —"], ...m.subprocesos.map((x, i) => [x.id, `${i + 1}. ${x.nombre || "Sin nombre"}`])])}
          ${m.puntos.length ? selector("Punto crítico del que sale", bf(f, "puntoId"), f.puntoId, [["", "— Ninguno —"], ...ptsSub.map(x => [x.id, `${x.num}. ${L.corto(x.titulo || "sin título", 50)}`])], { help: "Así el mapa (paso 9) sabrá en qué paso del flujograma poner este fallo." }) : ""}
        </div>
        ${campo(f, "fallo", "Modo de fallo: ¿qué puede salir mal?", { bind: bf(f, "fallo"), area: true, ph: "p. ej. No colocación de pulsera identificativa", help: "Un hecho concreto y observable, en una frase. No una causa («sobrecarga…») ni un efecto («daño al paciente»)." })}
        ${campo(f, "efecto", "Efecto: ¿qué pasaría si ocurre?", { bind: bf(f, "efecto"), area: true, ph: "p. ej. Error de identidad, confusión en pruebas o medicación", help: "La consecuencia en el paciente, el proceso o el sistema. De aquí sale la gravedad." })}
        ${campo(f, "causa", "Causa: ¿por qué podría ocurrir?", { bind: bf(f, "causa"), area: true, ph: "p. ej. Rutina interrumpida, recursos saturados", help: "Factores humanos, técnicos, organizativos o del entorno. Las acciones de mejora atacarán la causa." })}
        ${campo(f, "controles", "Controles actuales: ¿qué existe hoy para evitarlo o detectarlo?", { bind: bf(f, "controles"), area: true, opt: true, ph: "p. ej. Protocolo de identificación; pulsera impresa en triaje", help: "Protocolos, dobles chequeos, alertas informáticas, listas de verificación… Son la base para puntuar la detección." })}
        <div class="rg-pie no-print"><button type="button" class="link-btn link-btn--peligro" data-act="fa-del" data-id="${f.id}">Quitar este fallo</button><button type="button" class="link-btn" data-act="fa-toggle" data-id="${f.id}">Cerrar ▴</button></div>
      </div>
    </div>`;
  }
  function grupoFallos(m, s, i) {
    const lista = A.ordenarFallos(m.fallos.filter(f => s ? f.subprocesoId === s.id : !subDeF(m, f)), "num");
    if (!s && !lista.length) return "";
    return `<section class="grupo-sub">
      <h3 class="grupo-t">${subPunto(s)}${s ? `${i + 1}. ${lleno(s.nombre) ? esc(s.nombre) : '<span class="vacio">Subproceso sin nombre</span>'}` : "Sin subproceso"} <span class="contador">${lista.length}</span></h3>
      <div class="rg-lista">${lista.map(f => falloCard(m, f)).join("") || `<p class="field-sub">Sin fallos todavía.</p>`}</div>
      ${s ? `<button class="btn btn--sm no-print" data-act="fa-add" data-sub="${s.id}">+ Fallo en «${esc(L.corto(s.nombre || "este subproceso", 40))}»</button>` : ""}
    </section>`;
  }
  function pegarFallosHtml() {
    return `<div class="card pegar no-print">
      <h3 class="sub-h">Pegar fallos desde Excel, Calc o Word</h3>
      <p class="field-sub">Selecciona las filas de tu tabla (mejor con la fila de títulos), cópialas y pégalas aquí. Sin títulos, las columnas deben ir en este orden: <b>Subproceso · Fallo · Efecto · Causa · G · O · D</b>. Con títulos se reconoce también la columna de <b>controles</b>. Los subprocesos que no existan se crean.</p>
      <textarea class="txt-in" id="pegar-fallos" rows="6" placeholder="Pega aquí la tabla…"></textarea>
      <div data-zona="pegarf"></div>
      <div class="toolbar"><button class="btn btn--primary" data-act="pegarf-ok" disabled>Añadir los fallos</button><button class="btn" data-act="pegarf-cerrar">Cancelar</button></div>
    </div>`;
  }
  function paso6(m) {
    if (!A) return sinMotorAmfe();
    const sinPasar = m.puntos.filter(x => lleno(x.titulo) && !m.fallos.some(f => f.puntoId === x.id)).length;
    return `
      ${idea("Para cada punto crítico, preguntaos: <b>¿qué puede salir mal?</b> (modo de fallo), <b>¿qué pasaría?</b> (efecto) y <b>¿por qué?</b> (causa). Es la tabla del ejercicio 10.")}
      ${facil(`<div class="table-wrap"><table class="mini"><tr><th>Columna</th><th>Pregunta</th><th>Ejemplo</th></tr>
          <tr><td><b>Modo de fallo</b></td><td>¿Qué sale mal?</td><td>No colocación de pulsera identificativa</td></tr>
          <tr><td><b>Efecto</b></td><td>¿Qué pasaría?</td><td>Error de identidad, confusión en pruebas o medicación</td></tr>
          <tr><td><b>Causa</b></td><td>¿Por qué?</td><td>Rutina interrumpida, recursos saturados</td></tr>
          <tr><td><b>Controles</b></td><td>¿Qué hay hoy?</td><td>Protocolo de identificación; impresora de pulseras en triaje</td></tr></table></div>
        ${trampa("El error más frecuente es escribir una <b>causa</b> como fallo («sobrecarga asistencial», «falta de formación») o un <b>efecto</b> como fallo («daño al paciente»). La app te avisa cuando lo detecta.")}`)}
      ${sinPasar ? `<div class="card destacado no-print"><p><b>${plural(sinPasar, "punto crítico aún no ha pasado", "puntos críticos aún no han pasado")} al AMFE.</b> Con un toque, cada uno se convierte en un modo de fallo de su subproceso (con su mismo número); después escribís el efecto, la causa y los controles.</p><div class="toolbar"><button class="btn btn--primary" data-act="pasar-amfe">⇩ Pasar los puntos críticos al AMFE</button></div></div>` : ""}
      <div class="toolbar no-print"><button class="btn" data-act="pegarf-abrir">Pegar desde Excel</button>${m.fallos.length ? `<button class="btn" data-act="fa-abrir-todos">${abiertosF.size ? "Cerrar todos" : "Abrir todos"}</button>` : ""}</div>
      ${pegarFallos ? pegarFallosHtml() : ""}
      <div data-zona="avisos">${avisosGenerales(m, 6)}</div>
      ${m.subprocesos.length ? m.subprocesos.map((s, i) => grupoFallos(m, s, i)).join("") + grupoFallos(m, null, 0)
        : `<div class="placeholder-box"><p>Aún no hay subprocesos. <a href="#/mapa/${m.id}/2">Defínelos en el paso 2</a> o pega tu tabla: los subprocesos se crean solos.</p></div>${grupoFallos(m, null, 0)}`}`;
  }

  // ---------- Paso 7 · Puntuar y priorizar ----------
  const KEY_VISTA7 = "mapariesgos-vista7", KEY_MATRIZ = "mapariesgos-matriz";
  let vista7 = ["puntuar", "priorizar", "matriz"].includes(leer(KEY_VISTA7)) ? leer(KEY_VISTA7) : "puntuar";
  let tamMatriz = leer(KEY_MATRIZ) === "5" ? 5 : 10, soloPrio = true;
  const textoEscala = (m, k, v) => { const t = A.tramo(v); return t ? m.escalas[k][t - 1] : ""; };
  function escalaHtml(m) {
    return `<div class="table-wrap"><table class="mini facil-tabla tabla-escalas"><tr><th></th>${["g", "o", "d"].map(k => `<th>${A.ESCALA_NOM[k]}</th>`).join("")}</tr>
      ${A.TRAMOS.map((t, i) => `<tr><td><b>${t}</b></td>${["g", "o", "d"].map(k => `<td>${esc(m.escalas[k][i])}</td>`).join("")}</tr>`).join("")}</table></div>`;
  }
  const escFila = (m, f) => ["g", "o", "d"].filter(k => A.entero1a10(f[k])).map(k => `<b>${k.toUpperCase()} ${A.entero1a10(f[k])}</b> ${esc(textoEscala(m, k, f[k]).replace(/\.$/, ""))}`).join(" · ");
  function iprFila(f) {
    const v = A.iprDe(f);
    if (v) return iprBadge(v);
    if ([f.g, f.o, f.d].some(lleno)) return `<span class="ipr-falta">Enteros del 1 al 10</span>`;
    return `<span class="ipr-badge niv--sin">IPR</span>`;
  }
  function filaPuntuar(m, f) {
    return `<div class="punt" data-pid="${f.id}">
      <div class="punt-txt"><span class="rg-puesto">Nº ${f.num}</span><span><b>${lleno(f.fallo) ? esc(f.fallo) : '<span class="vacio">Fallo sin describir</span>'}</b>${lleno(f.efecto) ? `<span class="punt-ef">→ ${esc(L.corto(f.efecto, 110))}</span>` : ""}</span></div>
      <div class="punt-god">
        ${["g", "o", "d"].map(k => `<label class="god-c"><span>${A.ESCALA_NOM[k]}</span><input class="txt-in" data-fa="${f.id}" data-f="${k}" value="${esc(f[k])}" inputmode="numeric" maxlength="2" placeholder="1–10" aria-label="${A.ESCALA_NOM[k]} del fallo ${f.num}" /></label>`).join("")}
        <div class="punt-ipr" data-zipr="${f.id}">${iprFila(f)}</div>
      </div>
      <p class="punt-esc" data-zesc="${f.id}">${escFila(m, f)}</p>
      <div data-zav="${f.id}">${avisosFallo(m, 7, f.id)}</div>
    </div>`;
  }
  function resumen7(m) {
    const r = A.resumen(m); if (!r.n) return "";
    return `<span class="badge">${r.puntuados} de ${r.n} puntuados</span>${r.maxIPR ? iprBadge(r.maxIPR) : ""}${["muyalto", "alto", "medio", "bajo"].filter(k => r.porNivel[k]).map(k => `<span class="ipr-badge niv--${k}">${r.porNivel[k]} ${A.NIVELES_IPR.find(x => x.k === k).nom.toLowerCase()}</span>`).join("")}`;
  }
  const zonaBadge = z => z ? `<span class="zona-b zona--${z}" title="Zona ${z} de la matriz de riesgos: riesgo ${A.ZONAS[z].nom.toLowerCase()}, ${A.ZONAS[z].que}">Zona ${z}</span>` : "";
  function matrizHtml(m, tam = tamMatriz, solo = soloPrio, conControles = true) {
    const pr = A.prioridad(m), F = m.fallos.filter(f => lleno(f.fallo) && A.iprDe(f) && (!solo || pr[f.id].prio));
    const M = A.matriz(F, tam), etq = i => tam === 10 ? String(i) : A.TRAMOS[i - 1];
    const leyendaSub = m.subprocesos.filter(s => F.some(f => f.subprocesoId === s.id));
    return `${conControles ? `<div class="mz-ctl no-print"><div class="seg" role="group" aria-label="Tamaño de la matriz">${[[10, "10 × 10"], [5, "5 × 5"]].map(([v, t]) => `<button type="button" class="${tam === v ? "active" : ""}" data-act="mz-tam" data-v="${v}">${t}</button>`).join("")}</div><div class="seg" role="group" aria-label="Qué fallos se ven">${[[true, "Prioritarios"], [false, "Todos"]].map(([v, t]) => `<button type="button" class="${solo === v ? "active" : ""}" data-act="mz-solo" data-v="${v ? 1 : 0}">${t}</button>`).join("")}</div></div>` : ""}
      <div class="mz-wrap">
        <div class="mz-eje-g" aria-hidden="true">Gravedad</div>
        <div class="mz mz--${tam}" role="table" aria-label="Matriz de riesgos: gravedad (filas) por ocurrencia (columnas)">
          ${M.map(fila => `<div class="mz-n" role="rowheader">${etq(fila[0].g)}</div>${fila.map(cl => `<div class="mz-c mz--${cl.zona}" role="cell" title="G ${etq(cl.g)} · O ${etq(cl.o)} · zona ${cl.zona}${cl.fallos.length ? " · " + plural(cl.fallos.length, "fallo", "fallos") : ""}">${cl.fallos.map(f => { const s = subDeF(m, f); return `<button type="button" class="mz-f sub-c${s ? s.color : "x"}${pr[f.id].prio ? "" : " mz-f--no"}" data-act="ir-fallo" data-id="${f.id}" title="Nº ${f.num} · ${esc(L.corto(f.fallo, 80))} · IPR ${A.iprDe(f)}">${f.num}</button>`; }).join("")}</div>`).join("")}`).join("")}
          <div></div>${Array.from({ length: tam }, (_, i) => `<div class="mz-n mz-n--o">${etq(i + 1)}</div>`).join("")}
        </div>
        <div class="mz-eje-o" aria-hidden="true">Ocurrencia</div>
      </div>
      <div class="leyenda">${Object.keys(A.ZONAS).map(z => `<span><i class="mz--${z}"></i>${A.ZONAS[z].nom} (${A.ZONAS[z].que})</span>`).join("")}</div>
      ${leyendaSub.length ? `<div class="leyenda">${leyendaSub.map(s => `<span>${subPunto(s)}${esc(L.corto(s.nombre, 34))}</span>`).join("")}</div>` : ""}
      <p class="field-sub">${F.length ? `${plural(F.length, "fallo", "fallos")} en la matriz. Cada número es un fallo, del color de su subproceso${solo ? "" : "; los apagados no son prioritarios"}. Toca uno para ir a él.` : "No hay fallos que mostrar."}</p>`;
  }
  function criterioRes(m) {
    const pr = A.prioridad(m), l = Object.values(pr).filter(x => x.prio);
    const n = { criterio: l.filter(x => x.por === "criterio").length, critico: l.filter(x => x.por === "critico").length, manual: l.filter(x => x.por === "manual").length };
    const graves = Object.values(pr).filter(x => x.grave).length;
    return `<b>${plural(l.length, "fallo prioritario", "fallos prioritarios")}</b>: ${[n.criterio ? `${n.criterio} por IPR` : "", n.critico ? `${n.critico} ${n.critico === 1 ? "crítico" : "críticos"}` : "", n.manual ? `${n.manual} a mano` : ""].filter(Boolean).join(", ") || "ninguno"}.${graves ? ` ${plural(graves, "fallo tiene", "fallos tienen")} gravedad 9–10.` : ""}`;
  }
  function filaPrio(m, f, P, pr) {
    const e = pr[f.id], s = subDeF(m, f);
    const porTxt = e.prio ? (e.por === "criterio" ? (m.prioridad.modo === "umbral" ? "Supera el umbral de IPR" : `Entre los ${A.nPrioridad(m)} de mayor IPR`) : e.por === "critico" ? "Fallo crítico" : "Añadido a mano") : (f.manual === "no" ? "Quitado a mano" : "No prioritario");
    const bb = k => `data-fa="${f.id}" data-f="${k}"`;
    return `<div class="pf sub-c${s ? s.color : "x"}${e.prio ? " pf--on" : ""}" data-pf="${f.id}">
      <div class="pf-cab"><span class="rg-puesto">${P[f.id] ? "#" + P[f.id] : "–"}</span>
        <span class="pf-txt"><b>Nº ${f.num} · ${esc(f.fallo)}</b><span>${subPunto(s)}${esc(s ? s.nombre : "Sin subproceso")} · G ${esc(f.g)} · O ${esc(f.o)} · D ${esc(f.d)}</span></span>
        <span class="pf-badges">${iprBadge(A.iprDe(f))}${e.grave ? `<span class="badge badge--grave" title="Gravedad 9–10">Muy grave</span>` : ""}${zonaBadge(e.zona)}</span></div>
      <div class="pf-acc no-print">
        <button type="button" class="pf-btn${e.prio ? " on" : ""}" data-act="pf-prio" data-id="${f.id}" aria-pressed="${e.prio}" ${f.critico ? 'disabled title="Un fallo crítico siempre es prioritario"' : ""}>${e.prio ? "★ Prioritario" : "☆ No prioritario"}</button>
        <span class="pf-por">${porTxt}</span>
        <label class="pf-crit"><input type="checkbox" data-act="pf-critico" data-id="${f.id}"${f.critico ? " checked" : ""} /> Fallo crítico</label>
      </div>
      ${f.critico ? campo(f, "motivoCritico", "¿Por qué es crítico?", { bind: bb("motivoCritico"), area: true, ph: "p. ej. Evento centinela en el último año", extra: `<div class="quick no-print"><button type="button" class="chip chip--accent" data-act="pf-motivo" data-id="${f.id}" data-k="motivoCritico">✎ Proponer motivo</button></div>` }) : ""}
      ${f.manual ? campo(f, "motivo", f.manual === "si" ? "¿Por qué lo añadís a los prioritarios?" : "¿Por qué lo quitáis de los prioritarios?", { bind: bb("motivo"), area: true, ph: f.manual === "si" ? "p. ej. Gravedad 9 y ningún control actual" : "p. ej. Ya hay una acción en marcha", extra: f.manual === "si" ? `<div class="quick no-print"><button type="button" class="chip chip--accent" data-act="pf-motivo" data-id="${f.id}" data-k="motivo">✎ Proponer motivo</button></div>` : "" }) : ""}
      <div data-zav="${f.id}">${avisosFallo(m, 7, f.id)}</div>
    </div>`;
  }
  function listaPrio(m) {
    const P = A.puestos(m.fallos), pr = A.prioridad(m), F = A.ordenarFallos(m.fallos.filter(f => lleno(f.fallo) && A.iprDe(f)));
    return F.length ? F.map(f => filaPrio(m, f, P, pr)).join("") : `<p class="placeholder-box">Aún no hay fallos puntuados. Puntúalos en «Puntuar».</p>`;
  }
  function porSubHtml(m) {
    const S = A.porSubproceso(m).filter(s => s.n), max = Math.max(1, ...S.map(s => s.max));
    if (!S.length) return `<p class="field-sub">Aún no hay fallos en los subprocesos.</p>`;
    return `<div class="table-wrap"><table class="mini tabla-porsub"><thead><tr><th>Subproceso</th><th>Fallos</th><th>Prioritarios</th><th>IPR máx.</th><th>IPR medio</th><th class="col-barra">IPR máximo</th></tr></thead><tbody>
      ${S.map(s => `<tr><td>${subPunto(s)}${esc(s.nombre || "Sin nombre")}</td><td>${s.n}</td><td><b>${s.prio}</b></td><td>${s.max ? iprBadge(s.max) : "—"}</td><td>${s.media || "—"}</td><td class="col-barra"><span class="barra sub-c${s.color}"><i style="width:${Math.round(s.max / max * 100)}%"></i></span></td></tr>`).join("")}
    </tbody></table></div>`;
  }
  function paso7(m) {
    if (!A) return sinMotorAmfe();
    const F = m.fallos.filter(f => lleno(f.fallo)), umbral = m.prioridad.modo === "umbral";
    const seg = `<div class="seg vista3 no-print" role="group" aria-label="Vista">${[["puntuar", "1 · Puntuar G·O·D"], ["priorizar", "2 · Priorizar"], ["matriz", "3 · Matriz"]].map(([v, t]) => `<button type="button" class="${vista7 === v ? "active" : ""}" data-act="v7" data-v="${v}">${t}</button>`).join("")}</div>`;
    let cuerpo = "";
    if (!F.length) cuerpo = `<div class="placeholder-box"><p>Aún no hay fallos que puntuar. <a href="#/mapa/${m.id}/6">Escríbelos en el paso 6</a>.</p></div>`;
    else if (vista7 === "puntuar") cuerpo = `
      <div class="res-linea" data-zona="resumen7">${resumen7(m)}</div>
      ${m.subprocesos.map((s, i) => { const l = A.ordenarFallos(F.filter(f => f.subprocesoId === s.id), "num"); return l.length ? `<section class="grupo-sub"><h3 class="grupo-t">${subPunto(s)}${i + 1}. ${esc(s.nombre || "Subproceso sin nombre")}</h3><div class="punt-lista">${l.map(f => filaPuntuar(m, f)).join("")}</div></section>` : ""; }).join("")}
      ${F.some(f => !subDeF(m, f)) ? `<section class="grupo-sub"><h3 class="grupo-t">${subPunto(null)}Sin subproceso</h3><div class="punt-lista">${A.ordenarFallos(F.filter(f => !subDeF(m, f)), "num").map(f => filaPuntuar(m, f)).join("")}</div></section>` : ""}
      <div class="toolbar no-print"><button class="btn btn--primary" data-act="v7" data-v="priorizar">Priorizar →</button></div>`;
    else if (vista7 === "priorizar") cuerpo = `
      <div class="card">
        <h2 class="sub-h">Criterio de prioridad</h2>
        <div class="seg" role="group">${[["top", "Los N de mayor IPR"], ["umbral", "Umbral de IPR"]].map(([v, t]) => `<button type="button" class="${m.prioridad.modo === v ? "active" : ""}" data-act="prio-modo" data-v="${v}">${t}</button>`).join("")}</div>
        ${umbral ? campo(m, "prioridad.umbral", "Prioritarios los fallos con IPR igual o mayor que…", { ph: "p. ej. 200", help: "Un umbral acordado por el equipo. Como orientación: 300 o más es muy alto, de 200 a 299 alto y de 100 a 199 medio." })
          : campo(m, "prioridad.n", "¿Cuántos fallos de mayor IPR?", { ph: "15", help: "En el curso se eligen los 15 de mayor IPR. A igual IPR, la app pone antes el de más gravedad." })}
        <p class="criterio-res" data-zona="criterio">${criterioRes(m)}</p>
      </div>
      <h2 class="sec-t">Fallos por orden de IPR</h2>
      <p class="page-lead">Los marcados con ★ son los prioritarios: pasarán a las acciones de mejora y al mapa.</p>
      <div class="pf-lista" data-zona="lista7">${listaPrio(m)}</div>
      <div class="toolbar no-print"><button class="btn btn--primary" data-act="v7" data-v="matriz">Ver la matriz →</button></div>`;
    else cuerpo = `
      <div class="card chart-card" data-zona="matriz">${matrizHtml(m)}</div>
      <h2 class="sec-t">Priorización por subprocesos</h2>
      <p class="page-lead">Dónde se concentran los riesgos del proceso.</p>
      <div data-zona="porsub">${porSubHtml(m)}</div>`;
    return `
      ${idea("Cada fallo se puntúa de 1 a 10 en <b>gravedad</b>, <b>ocurrencia</b> y <b>detección</b>. <b>IPR = G × O × D</b>: cuanto mayor, antes hay que actuar. Después se eligen los <b>prioritarios</b>, que son los que irán al mapa.")}
      ${facil(`<p>Usad la misma escala en todo el análisis y ponedla a la vista en la reunión:</p>
        ${escalaHtml(m)}
        <div class="formula">IPR = Gravedad × Ocurrencia × Detección (de 1 a 1.000)</div>
        ${trampa("La <b>detección va al revés</b> que las otras dos: 1 = se descubre casi seguro antes de causar daño; 10 = casi imposible de detectar. Antes de puntuarla, mirad los controles actuales.")}
        <p>Lo habitual es quedarse con <b>los de mayor IPR</b> (en el curso, los 15 primeros) o con los que <b>superan un umbral</b>. Un fallo con <b>gravedad 9–10</b> merece atención aunque su IPR sea bajo; la marca <b>«fallo crítico»</b> lo sube a prioritario (escribid siempre el motivo).</p>`, "Explicado fácil: escalas y prioridad")}
      ${seg}
      <div data-zona="avisos">${avisosGenerales(m, 7)}</div>
      ${cuerpo}`;
  }

  // «Traer de AMFE» (paso 1)
  let amfesLeidos = null, amfeElegido = "";
  function amfeHtml(m) {
    const a = amfesLeidos.find(x => x.id === amfeElegido) || amfesLeidos[0];
    return `<div class="card desde-card no-print"><h2 class="sub-h">Traer de AMFE</h2>
      ${selector("AMFE", 'data-amfesel="1"', a.id, amfesLeidos.map(x => [x.id, L.resumenAmfe(x)]))}
      <ul class="field-sub"><li>El proceso y sus subprocesos (los que ya tengas no se repiten).</li><li>${m.fallos.length ? "<b>Los fallos no</b>: este mapa ya tiene fallos." : `Los ${plural((a.fallos || []).length, "fallo", "fallos")} con su efecto, su causa, sus controles, su puntuación, su prioridad y sus acciones de mejora. Si coinciden con un punto crítico de este mapa, quedan enlazados a él.`}</li><li>El equipo y las sesiones no viajan entre apps: escríbelos en el paso 5.</li></ul>
      <div class="toolbar"><button class="btn btn--primary" data-act="amfe-traer">Traer</button><button class="btn" data-act="amfe-cancelar">Cancelar</button></div>
      <p class="field-sub">Se copia: si después cambias el AMFE en su app, vuelve a traerlo. Nada de lo que ya tienes se borra.</p></div>`;
  }

  const RENDER = { 1: paso1, 2: paso2, 3: paso3, 4: paso4, 5: paso5, 6: paso6, 7: paso7 };

  // Refresca lo que depende de lo escrito sin repintar los campos (no se pierde el foco)
  let tLienzo = null;
  function refrescar(idFallo, todo) {
    const m = actual; if (!m) return;
    const n = pasoActual;
    const Z = { pasos: () => pasosInner(m, n), avisos: () => avisosGenerales(m, n), avisos3: () => validadorHtml(m), nact: () => String(m.actores.length), validado: () => validadoHtml(m),
      nprop: () => String(L.propuestas(m).length), npc: () => String(m.puntos.length),
      neq: () => String(m.equipo.length), nses: () => String(m.sesiones.length), metodo: () => esc(L.textoMetodologia(m)),
      resumen7: () => resumen7(m), criterio: () => criterioRes(m), matriz: () => matrizHtml(m), porsub: () => porSubHtml(m), lista7: () => listaPrio(m) };
    // La lista de prioridad solo se repinta si cambia el criterio (si se escribe un motivo dentro, se perdería el foco)
    if (!todo) delete Z.lista7;
    $$("[data-zona]").forEach(el => { const fn = Z[el.dataset.zona]; if (fn) el.innerHTML = fn(); });
    $$("[data-zav]").forEach(el => { el.innerHTML = n >= 5 ? avisosFallo(m, n, el.dataset.zav) : avisosPaso(m, el.dataset.zav); });
    if (idFallo && A) {
      const f = m.fallos.find(x => x.id === idFallo);
      if (f) {
        const tg = $(`.fallo[data-fid="${f.id}"] .rg-toggle`); if (tg) tg.innerHTML = falloCabInner(m, f);
        const zi = $(`[data-zipr="${f.id}"]`); if (zi) zi.innerHTML = iprFila(f);
        const ze = $(`[data-zesc="${f.id}"]`); if (ze) ze.innerHTML = escFila(m, f);
      }
    }
    $$("[data-zpc]").forEach(el => { el.innerHTML = avisosPunto(m, el.dataset.zpc); });
    $$("[data-zsub]").forEach(el => { el.innerHTML = avisosSub(m, el.dataset.zsub); });
    $$(".paso-card").forEach(el => { const p = LF.pasoDe(m, el.dataset.pid), t = $(".rg-toggle", el); if (p && t) t.innerHTML = pasoCabInner(m, p); });
    if (conLienzo() && m.pasos.length) { clearTimeout(tLienzo); tLienzo = setTimeout(() => { const z = $("[data-zona='lienzo']"); if (z) { z.innerHTML = svgActual(m); aplicarZoom(); } }, 150); }
  }
  function repintar() {
    const y = window.scrollY, l = $("#lienzo"), sx = l ? l.scrollLeft : 0, sy = l ? l.scrollTop : 0;
    renderMapa(actual, pasoActual); window.scrollTo(0, y);
    const l2 = $("#lienzo"); if (l2) { l2.scrollLeft = sx; l2.scrollTop = sy; }
  }

  // ---------- Aprende ----------
  function renderAprende(n) {
    const T = C.TEMAS, t = T.find(x => x.n === n);
    if (!t) {
      view.innerHTML = `
        <h1 class="page-title">Aprende</h1>
        <p class="page-lead">Temas explicados fácil para tener a mano mientras haces tu mapa de riesgos. Con cada versión de la app llegan los de la fase siguiente.</p>
        <div class="temas">${T.map(x => `<a class="tema-card pdca--${x.c}" href="#/aprende/${x.n}"><span class="tema-n">${x.n}</span><span><b>${x.titulo}</b><span>${x.sub}</span></span></a>`).join("")}
          ${C.TEMAS_PROX.map(x => `<div class="tema-card tema-card--prox"><span class="tema-n">${x.n}</span><span><b>${x.titulo}</b><span>${x.sub} · próximamente</span></span></div>`).join("")}</div>`;
      return;
    }
    const prev = T.find(x => x.n === n - 1), next = T.find(x => x.n === n + 1);
    view.innerHTML = `
      <div class="wiz-top no-print">${volver("#/aprende", "Aprende")}<div class="tema-pills">${T.map(x => `<a href="#/aprende/${x.n}" class="pdca--${x.c}${x.n === n ? " actual" : ""}">${x.n}</a>`).join("")}</div></div>
      <div class="wiz-titulo"><span class="wiz-paso">Tema ${n} de ${T.length + C.TEMAS_PROX.length}</span><h1 class="page-title">${t.titulo}</h1><p class="page-lead">${t.sub}</p></div>
      <div class="card minuto pdca--${t.c}"><h2 class="sub-h">En un minuto</h2><ul>${t.minuto.map(x => `<li>${x}</li>`).join("")}</ul></div>
      ${t.secciones.map((s, i) => `<details class="facil"${i === 0 ? " open" : ""}><summary>${s.t}</summary><div class="facil-body">${s.h}</div></details>`).join("")}
      ${box("ejemplo", "Minicaso", t.minicaso)}
      <div class="toolbar"><a class="btn btn--primary" href="${t.practica.href}">${t.practica.texto} →</a></div>
      <div class="wiz-nav no-print">${prev ? `<a class="btn" href="#/aprende/${prev.n}">← ${prev.titulo}</a>` : "<span></span>"}${next ? `<a class="btn" href="#/aprende/${next.n}">${next.titulo} →</a>` : "<span></span>"}</div>`;
  }

  // ---------- Ejemplos ----------
  function renderEjemplos() {
    const u = C.EJEMPLOS.urgencias;
    view.innerHTML = `
      <h1 class="page-title">Ejemplo</h1>
      <p class="page-lead">Para ver cómo queda antes de hacerlo tú. Está aparte: puedes tocarlo, pero <b>no se guarda ni se mezcla con tus datos</b>. Si te sirve de punto de partida, pulsa «Copiar a mis datos».</p>
      <h2 class="sec-t">Ejemplo completo: atención en Urgencias</h2>
      <div class="ej-grid"><a class="ej-card ej-card--grande" href="${u.href}"><b>${esc(u.t)}</b><span>${esc(u.s)}</span></a></div>
      <div class="toolbar"><a class="btn" href="#/mapa/ej-mapa-urgencias/2">Subprocesos</a><a class="btn" href="#/mapa/ej-mapa-urgencias/3">Flujograma</a><a class="btn" href="#/mapa/ej-mapa-urgencias/4">Puntos críticos</a><a class="btn" href="#/mapa/ej-mapa-urgencias/6">Fallos</a><a class="btn" href="#/mapa/ej-mapa-urgencias/7">Priorización</a><a class="btn" href="#/mapa/ej-mapa-urgencias/4?informe=1">Ver para imprimir</a></div>
      ${practica("El ejemplo reproduce el caso de Urgencias del curso, sin nombres de centro ni de personas. Lo que se ha adaptado se explica en las notas del paso 1. Los minicasos para practicar llegarán en una próxima versión.")}`;
  }

  // ---------- Glosario ----------
  function renderGlosario() {
    view.innerHTML = `<h1 class="page-title">Glosario</h1><p class="page-lead">${C.GLOSARIO.length} términos en lenguaje llano.</p>
      <div class="input-wrap glos-buscar"><input id="glos-q" type="search" placeholder="Buscar término…" autocomplete="off" /></div>
      <dl class="glos-lista" id="glos-lista"></dl>`;
    const pinta = q => {
      const t = L.sinTildes(q);
      const l = C.GLOSARIO.filter(([a, b]) => !t || L.sinTildes(a + " " + b).includes(t)).sort((x, y) => x[0].localeCompare(y[0], "es"));
      $("#glos-lista").innerHTML = l.length ? l.map(([a, b]) => `<div class="glos-item"><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join("") : `<p class="placeholder-box">Sin resultados.</p>`;
    };
    pinta(""); $("#glos-q").addEventListener("input", e => pinta(e.target.value));
  }

  // ---------- Avisos breves ----------
  function esIOS() { return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); }
  function toast(msg, ms) {
    let t = $("#toast");
    if (!msg) { if (t) t.hidden = true; return; }
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false; clearTimeout(toast.h);
    if (ms) toast.h = setTimeout(() => { t.hidden = true; }, ms);
  }
  function descargar(blob, nombre) {
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = nombre;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 200);
  }
  const rutaActual = () => location.hash.split("?")[0];
  const fechaArchivo = () => new Date().toLocaleDateString("es-ES").replace(/\//g, "-");
  function nombreArchivo(ext, m = actual) {
    const base = "Mapa de Riesgos " + (m ? (nombreMapa(m) || "").slice(0, 60) : "");
    return `${base.replace(/[\\/:*?"<>|%]/g, "").trim()} ${fechaArchivo()}.${ext}`;
  }

  // ---------- Vista para imprimir / PDF (lo hecho hasta ahora, en el orden del documento final) ----------
  function informeCab(titulo, sub) {
    return `<header class="print-head print-only"><h1>${esc(titulo)}</h1><p>${esc(sub ? sub + " · " : "")}Mapa de Riesgos · Calidad y seguridad del paciente · ${new Date().toLocaleDateString("es-ES")}</p></header>`;
  }
  function informePie() {
    return `<footer class="print-foot print-only">
      <span class="autor-titulo">Aplicación desarrollada por</span>
      <span class="autor"><b>Carlos J. Galán Doval</b> · Médico de Familia · Técnico en Calidad y Seguridad del Paciente</span>
      <span class="autor"><b>Rafael J. Romero de Castilla Gil</b> · Médico de Familia · Responsable del Área de Calidad y Seguridad del Paciente</span>
      <span class="autor-area">Área de Gestión Sanitaria Sur de Córdoba · Andalucía</span>
      <span class="autor-uso">De libre uso con fines docentes y divulgativos. No sustituye el criterio profesional.</span>
      <span class="footer-version">Mapa de Riesgos · versión ${APP_VERSION}</span>
    </footer>`;
  }
  function renderInforme(m) {
    const fila = (k, v) => lleno(v) ? `<tr><th>${k}</th><td>${esc(v)}</td></tr>` : "";
    let est = $("#estilo-pagina"); if (!est) { est = document.createElement("style"); est.id = "estilo-pagina"; document.head.appendChild(est); }
    est.textContent = "@page { size: A4 portrait; margin: 12mm; }";
    const G = L.puntosPorSub(m).filter(g => g.puntos.length), r = L.resumen(m), titulo = m.proceso || nombreMapa(m) || "Proceso sin nombre";
    view.innerHTML = `
      <div class="informe-bar informe-only"><button class="btn" data-act="volver">← Volver</button><span class="informe-acc"><button class="btn btn--primary" data-act="imprimir">Guardar / imprimir</button></span></div>
      ${informeCab("Mapa de Riesgos · " + titulo, m.unidad)}
      <div class="ficha">
        <div class="ficha-cab"><span class="wiz-paso">Mapa de Riesgos · borrador (pasos 1 a 7)</span><h2 class="ficha-nombre">${esc(titulo)}</h2></div>
        <table class="ficha-t">${fila("Unidad o servicio", m.unidad)}${fila("Ámbito", m.ambito)}${fila("Empieza", m.inicio)}${fila("Termina", m.fin)}${fila("Qué queda dentro", m.incluye)}${fila("Qué queda fuera", m.excluye)}${fila("Responsable", m.responsable)}${fila("Fecha", m.fecha)}
          <tr><th>Resumen</th><td>${plural(r.subprocesos, "subproceso", "subprocesos")} · ${plural(r.pasos, "paso", "pasos")} en el flujograma · ${plural(r.puntos, "punto crítico", "puntos críticos")}</td></tr></table>
      </div>
      <h2 class="sec-t">Descripción del proceso</h2>
      ${lleno(m.descripcion) ? `<p>${esc(m.descripcion)}</p>` : ""}
      ${lleno(m.objetivo) ? `<h3 class="sub-h">Objetivo del proceso</h3><p>${esc(m.objetivo)}</p>` : ""}
      ${m.subprocesos.length ? `<h3 class="sub-h">Subprocesos incluidos</h3><div class="table-wrap"><table class="mini tabla-riesgos"><thead><tr><th>Id</th><th>Subproceso</th><th>Descripción</th><th>Inicio</th><th>Fin</th><th>Roles implicados</th></tr></thead><tbody>${m.subprocesos.map((s, i) => `<tr><td>${i + 1}</td><td>${subPunto(s)} <b>${esc(s.nombre)}</b></td><td>${esc(s.descripcion)}</td><td>${esc(s.inicio)}</td><td>${esc(s.fin)}</td><td>${esc(s.roles)}</td></tr>`).join("")}</tbody></table></div>` : ""}
      ${m.pasos.length ? `<div class="doc-salto"></div><h2 class="sec-t">Flujograma del proceso</h2><div class="informe-graf informe-dib">${D.svg(LF.dibujar(Object.assign({}, m, { puntos: [] })), { numeros: m.vista.numeros, cabecera: "Proceso " + titulo, titulo: "Proceso " + titulo })}</div><div class="leyenda-wrap">${D.leyenda(LF.ORDEN_TIPOS.map(t => [t, LF.TIPOS[t].corto]))}</div>` : ""}
      ${G.length ? `<div class="doc-salto"></div><h2 class="sec-t">Identificación de puntos críticos</h2>${G.map(g => `<h3 class="sub-h">${g.sub ? esc(g.sub.nombre) : "Sin subproceso"}</h3><div class="table-wrap"><table class="mini tabla-riesgos"><thead><tr><th>Id</th><th>Error o punto crítico</th><th>Descripción del error o riesgo identificado</th>${m.pasos.length ? "<th>Paso</th>" : ""}</tr></thead><tbody>${g.puntos.map(x => { const p = LF.pasoDe(m, x.pasoId); return `<tr><td>${esc(L.idPunto(m, x))}</td><td><b>${esc(x.titulo)}</b></td><td>${esc(x.descripcion)}</td>${m.pasos.length ? `<td>${p ? p.num + ". " + esc(L.corto(p.texto, 30)) : ""}</td>` : ""}</tr>`; }).join("")}</tbody></table></div>`).join("")}` : ""}
      ${A && (m.equipo.length || m.fallos.length) ? informeAmfe(m) : ""}
      ${informePie()}`;
  }
  // Análisis AMFE en la vista para imprimir (apartado 5 del documento final y anexo II)
  function informeAmfe(m) {
    const F = m.fallos.filter(f => lleno(f.fallo)), Pr = A.prioritarios(m), sub = f => { const s = subDeF(m, f); return s ? s.nombre : ""; };
    const filaF = f => `<tr><td>${esc(sub(f))}</td><td>${f.num}</td><td><b>${esc(f.fallo)}</b></td><td>${esc(f.efecto)}</td><td>${esc(f.causa)}</td><td>${esc(f.g)}</td><td>${esc(f.o)}</td><td>${esc(f.d)}</td><td>${A.iprDe(f) ? iprBadge(A.iprDe(f)) : ""}</td></tr>`;
    const cabF = `<thead><tr><th>Subproceso</th><th>Id</th><th>Fallo</th><th>Efecto</th><th>Causa</th><th>G</th><th>O</th><th>D</th><th>IPR</th></tr></thead>`;
    return `<div class="doc-salto"></div><h2 class="sec-t">Análisis AMFE</h2>
      ${m.equipo.length ? `<h3 class="sub-h">Composición del equipo de trabajo</h3><div class="table-wrap"><table class="mini tabla-riesgos"><thead><tr><th>Id</th><th>Perfil profesional</th><th>Cargo</th><th>Rol</th><th>Justificación</th></tr></thead><tbody>${m.equipo.map((x, i) => `<tr><td>${i + 1}</td><td><b>${esc(x.perfil)}</b></td><td>${esc(x.cargo)}</td><td>${esc(A.ROLES[x.rol].nom)}</td><td>${esc(x.justificacion)}</td></tr>`).join("")}</tbody></table></div>` : ""}
      ${L.textoMetodologia(m) || lleno(m.metodologia.texto) ? `<h3 class="sub-h">Metodología empleada</h3><p>${esc([L.textoMetodologia(m), m.metodologia.texto].filter(lleno).join(" "))}</p>` : ""}
      ${m.sesiones.length ? `<div class="table-wrap"><table class="mini tabla-riesgos"><thead><tr><th>Sesión</th><th>Fecha</th><th>Actividad principal</th><th>Duración</th><th>Resultados alcanzados</th></tr></thead><tbody>${m.sesiones.map((x, i) => `<tr><td>${i + 1}</td><td>${esc(fmtFecha(x.fecha))}</td><td>${esc(x.actividad)}</td><td>${esc(x.duracion)}</td><td>${esc(x.resultados)}</td></tr>`).join("")}</tbody></table></div>` : ""}
      ${F.length ? `<h3 class="sub-h">Resultados del análisis</h3><p>Se identificaron ${plural(F.length, "fallo potencial", "fallos potenciales")} en ${plural(m.subprocesos.length, "subproceso", "subprocesos")}, priorizados según su IPR (gravedad × ocurrencia × detección).</p>` : ""}
      ${Pr.length ? `<h3 class="sub-h">Fallos con mayor criticidad</h3><div class="table-wrap"><table class="mini tabla-riesgos">${cabF}<tbody>${Pr.map(filaF).join("")}</tbody></table></div>
        <h3 class="sub-h">Matriz de riesgos</h3><div class="card chart-card">${matrizHtml(m, tamMatriz, true, false)}</div>` : ""}
      ${F.length ? `<div class="doc-salto"></div><h2 class="sec-t">Anexo II: tabla de fallos</h2><div class="table-wrap"><table class="mini tabla-riesgos">${cabF}<tbody>${A.ordenarFallos(F, "sub", m.subprocesos).map(filaF).join("")}</tbody></table></div>` : ""}`;
  }
  // ---------- PDF en iOS (sin librerías; mismo método que las apps hermanas) ----------
  // En iOS, window.print() no hace nada cuando la app está instalada en la pantalla de inicio.
  function pdfDesdeJPEGs(paginas, wPt, hPt) {
    const enc = new TextEncoder(), partes = [], offs = []; let pos = 0;
    const push = x => { const b = typeof x === "string" ? enc.encode(x) : x; partes.push(b); pos += b.length; };
    const obj = (n, cuerpo) => { offs[n] = pos; push(`${n} 0 obj\n`); cuerpo(); push("\nendobj\n"); };
    push("%PDF-1.4\n"); push(new Uint8Array([37, 226, 227, 207, 211, 10]));
    const n = paginas.length;
    obj(1, () => push("<< /Type /Catalog /Pages 2 0 R >>"));
    obj(2, () => push(`<< /Type /Pages /Kids [${paginas.map((_, i) => `${3 + i * 3} 0 R`).join(" ")}] /Count ${n} >>`));
    paginas.forEach((p, i) => {
      const pg = 3 + i * 3, cont = pg + 1, img = pg + 2, flujo = `q ${wPt} 0 0 ${hPt} 0 0 cm /Im${i} Do Q`;
      obj(pg, () => push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${wPt} ${hPt}] /Resources << /XObject << /Im${i} ${img} 0 R >> >> /Contents ${cont} 0 R >>`));
      obj(cont, () => { push(`<< /Length ${flujo.length} >>\nstream\n${flujo}\nendstream`); });
      obj(img, () => { push(`<< /Type /XObject /Subtype /Image /Width ${p.w} /Height ${p.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.bytes.length} >>\nstream\n`); push(p.bytes); push("\nendstream"); });
    });
    const total = 3 + n * 3, xref = pos;
    let x = `xref\n0 ${total}\n0000000000 65535 f \n`;
    for (let k = 1; k < total; k++) x += String(offs[k]).padStart(10, "0") + " 00000 n \n";
    push(x + `trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
    return new Blob(partes, { type: "application/pdf" });
  }
  async function generarPDF() {
    const ANCHO = 720, K = 2;
    const A4W = 595.28, A4H = 841.89, MARGEN_PT = 34;
    const PX = (A4W - 2 * MARGEN_PT) / ANCHO;
    const PW = A4W / PX, PH = A4H / PX, M = MARGEN_PT / PX, ALTO_UTIL = PH - 2 * M;
    const hoja = document.createElement("div");
    hoja.className = "view";
    hoja.style.cssText = `position:absolute;left:-20000px;top:0;width:${ANCHO}px;max-width:none;margin:0;padding:0;box-shadow:none;`;
    hoja.innerHTML = $("#view").innerHTML;
    $$(".informe-bar, [id]", hoja).forEach(el => { if (el.classList.contains("informe-bar")) el.remove(); else el.removeAttribute("id"); });
    $$("details", hoja).forEach(d => { d.open = true; });
    document.body.appendChild(hoja);
    try {
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      const R0 = hoja.getBoundingClientRect();
      const ops = [], cortes = [0], bloques = [];
      const SIN_CORTE = ".print-head, .chart-card, tr, .formula, .box, .print-foot, h1, h2, h3, .ficha-cab, .leyenda";
      const rel = r => ({ x: r.left - R0.left, y: r.top - R0.top, w: r.width, h: r.height });
      const hayColor = c => !!c && c !== "transparent" && !/rgba\([^)]*,\s*0\)$/.test(c);
      const LADOS = ["Top", "Right", "Bottom", "Left"];
      const texto = (n, cs) => {
        const t = n.textContent, re = /\S+/g, rg = document.createRange(); let mm;
        const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        while ((mm = re.exec(t))) {
          rg.setStart(n, mm.index); rg.setEnd(n, mm.index + mm[0].length);
          const rs = rg.getClientRects(); if (!rs.length) continue;
          ops.push({ t: "txt", s: cs.textTransform === "uppercase" ? mm[0].toUpperCase() : mm[0], r: rel(rs[0]), font, col: cs.color, ls: cs.letterSpacing });
        }
      };
      const recorre = el => {
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden") return;
        const r = rel(el.getBoundingClientRect());
        if (r.h > 0) cortes.push(r.y + r.h);
        if (el.matches(SIN_CORTE)) bloques.push([r.y, r.y + r.h]);
        if (el instanceof SVGSVGElement) { ops.push({ t: "svg", el, r }); return; }
        const bordes = LADOS.map(l => [parseFloat(cs[`border${l}Width`]) || 0, cs[`border${l}Color`]]);
        if (hayColor(cs.backgroundColor) || bordes.some(b => b[0] > 0 && hayColor(b[1]))) ops.push({ t: "caja", r, bg: cs.backgroundColor, rad: parseFloat(cs.borderTopLeftRadius) || 0, bordes });
        if (el.tagName === "LI") {
          const ol = el.parentElement.tagName === "OL", idx = Array.prototype.indexOf.call(el.parentElement.children, el) + 1;
          ops.push({ t: "txt", s: ol ? idx + "." : "•", r: { x: r.x - (ol ? 20 : 14), y: r.y, w: 16, h: parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4 }, font: `normal 700 ${cs.fontSize} ${cs.fontFamily}`, col: ol ? "#7a1424" : cs.color, ls: "normal" });
        }
        for (const n of el.childNodes) {
          if (n.nodeType === 1) recorre(n);
          else if (n.nodeType === 3 && n.textContent.trim()) texto(n, cs);
        }
      };
      recorre(hoja);
      for (const op of ops.filter(o => o.t === "svg")) {
        const cl = op.el.cloneNode(true), orig = [op.el, ...op.el.querySelectorAll("*")], copia = [cl, ...cl.querySelectorAll("*")];
        orig.forEach((o, i) => { const cs = getComputedStyle(o); copia[i].setAttribute("style", ["fill", "stroke", "stroke-width", "stroke-dasharray", "font-family", "font-size", "font-weight"].map(p => `${p}:${cs.getPropertyValue(p)}`).join(";")); });
        cl.setAttribute("xmlns", "http://www.w3.org/2000/svg"); cl.setAttribute("width", op.r.w); cl.setAttribute("height", op.r.h);
        op.img = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(cl)); });
      }
      const alto = Math.ceil(R0.height);
      const parte = y => bloques.some(([a, b]) => a < y - 0.5 && y + 0.5 < b && b - a < ALTO_UTIL);
      const cands = [...new Set(cortes.map(c => Math.ceil(c)))].sort((a, b) => a - b);
      const pags = []; let y0 = 0;
      while (y0 < alto - 1) {
        const lim = y0 + ALTO_UTIL;
        if (lim >= alto) { pags.push([y0, alto]); break; }
        const y = cands.filter(c => c > y0 + 80 && c <= lim && !parte(c)).pop() || Math.floor(lim);
        pags.push([y0, y]); y0 = y;
      }
      const ponFuente = (ctx, f) => { ctx.font = "10px serif"; ctx.font = f; if (ctx.font === "10px serif") ctx.font = f.replace(/^(.*?\d+(\.\d+)?px).*$/, "$1 sans-serif"); };
      const caja = (ctx, op) => {
        const { x, y, w, h } = op.r, rad = Math.min(op.rad, w / 2, h / 2);
        const camino = () => { ctx.beginPath(); if (rad > 0 && ctx.roundRect) ctx.roundRect(x, y, w, h, rad); else ctx.rect(x, y, w, h); };
        if (hayColor(op.bg)) { ctx.fillStyle = op.bg; camino(); ctx.fill(); }
        const [t, d, b, l] = op.bordes;
        if (op.bordes.every(z => z[0] === t[0] && z[1] === t[1]) && t[0] > 0 && hayColor(t[1])) { ctx.strokeStyle = t[1]; ctx.lineWidth = t[0]; ctx.beginPath(); if (rad > 0 && ctx.roundRect) ctx.roundRect(x + t[0] / 2, y + t[0] / 2, w - t[0], h - t[0], Math.max(0, rad - t[0] / 2)); else ctx.rect(x + t[0] / 2, y + t[0] / 2, w - t[0], h - t[0]); ctx.stroke(); return; }
        const lado = (z, rx, ry, rw, rh) => { if (z[0] > 0 && hayColor(z[1])) { ctx.fillStyle = z[1]; ctx.fillRect(rx, ry, rw, rh); } };
        lado(t, x, y, w, t[0]); lado(b, x, y + h - b[0], w, b[0]); lado(l, x, y, l[0], h); lado(d, x + w - d[0], y, d[0], h);
      };
      const dibujaPaginas = conSVG => pags.map(([a, b]) => {
        const cv = document.createElement("canvas"); cv.width = Math.round(PW * K); cv.height = Math.round(PH * K);
        const ctx = cv.getContext("2d");
        ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height);
        ctx.scale(K, K); ctx.translate(M, M - a);
        ctx.beginPath(); ctx.rect(-2, a, ANCHO + 4, b - a); ctx.clip();
        for (const op of ops) {
          if (op.r.y >= b || op.r.y + op.r.h <= a) continue;
          if (op.t === "caja") caja(ctx, op);
          else if (op.t === "svg") { if (conSVG && op.img) ctx.drawImage(op.img, op.r.x, op.r.y, op.r.w, op.r.h); }
          else {
            ponFuente(ctx, op.font); ctx.fillStyle = op.col; ctx.textBaseline = "alphabetic";
            if ("letterSpacing" in ctx) ctx.letterSpacing = op.ls && op.ls !== "normal" ? op.ls : "0px";
            const mt = ctx.measureText(op.s), asc = mt.fontBoundingBoxAscent || mt.actualBoundingBoxAscent || op.r.h * 0.8, desc = mt.fontBoundingBoxDescent || mt.actualBoundingBoxDescent || op.r.h * 0.2;
            ctx.fillText(op.s, op.r.x, op.r.y + (op.r.h - (asc + desc)) / 2 + asc);
          }
        }
        const url = cv.toDataURL("image/jpeg", 0.9), bin = atob(url.slice(url.indexOf(",") + 1)), bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return { bytes, w: cv.width, h: cv.height };
      });
      let paginas;
      try { paginas = dibujaPaginas(true); } catch (e) { paginas = dibujaPaginas(false); }
      return pdfDesdeJPEGs(paginas, A4W, A4H);
    } finally { hoja.remove(); }
  }
  let pdfListo = null;
  function prepararPDF() {
    pdfListo = null; const r = rutaActual();
    setTimeout(() => { if (rutaActual() === r && document.body.classList.contains("ver-informe")) generarPDF().then(b => { pdfListo = { r, blob: b }; }).catch(() => {}); }, 300);
  }
  async function guardarPDF() {
    if (!document.body.classList.contains("ver-informe")) { irInforme(); toast("Preparando el PDF… pulsa de nuevo «Guardar / imprimir» en un momento.", 4000); return; }
    let blob = pdfListo && pdfListo.r === rutaActual() ? pdfListo.blob : null;
    if (!blob) { toast("Preparando el PDF…"); try { blob = await generarPDF(); pdfListo = { r: rutaActual(), blob }; } catch (e) { toast("No se ha podido crear el PDF.", 4000); return; } }
    const file = new File([blob], nombreArchivo("pdf"), { type: "application/pdf" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: file.name }); toast(""); }
      catch (e) { if (e && e.name === "AbortError") { toast(""); return; } toast("PDF listo: pulsa otra vez «Guardar / imprimir».", 4000); }
      return;
    }
    descargar(blob, file.name); toast("PDF descargado.", 3000);
  }
  function irInforme() { location.hash = rutaActual() + "?informe=1"; }
  function imprimir() {
    if (esIOS()) { guardarPDF(); return; }
    if (!document.body.classList.contains("ver-informe")) { irInforme(); setTimeout(() => window.print(), 400); return; }
    window.print();
  }

  // ---------- Copia de seguridad e importar ----------
  async function copiaSeguridad() {
    const contenido = JSON.stringify({ app: "mapariesgos", v: L.VERSION_DATOS, exportado: hoy(), mapas: datosUsuario.mapas, intercambio: L.paqueteIntercambio(datosUsuario.mapas, APP_VERSION, hoy()) }, null, 1);
    const nombre = `Mapa de Riesgos copia ${new Date().toISOString().slice(0, 10)}.json`;
    const blob = new Blob([contenido], { type: "application/json" });
    const file = new File([blob], nombre, { type: "application/json" });
    if (esIOS() && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: nombre }); } catch (e) { if (e && e.name === "AbortError") return; }
    } else descargar(blob, nombre);
    datosUsuario.ultimaCopia = hoy(); guardar(true);
    toast("Copia guardada. Guárdala en un sitio seguro (Archivos, Drive, correo…).", 4500);
    if (rutaActual() === "#/" || rutaActual() === "") renderHome();
  }
  function importar(file) {
    const fr = new FileReader();
    fr.onload = () => {
      let o = null, s = null; try { o = JSON.parse(fr.result); s = L.sanearDatos(o, genId, hoy()); } catch (e) { /* */ }
      if (!s) {
        // ¿Es la copia de Flujograma? Entonces lo que se quiere es «Traer de Flujograma»
        const fl = L.leerFlujograma(o), am = L.leerAmfe(o);
        toast(fl ? "Esa es una copia de la app Flujograma: tráela desde el paso 1 de un mapa, con «Traer de Flujograma»." : am ? "Esa es una copia de la app AMFE: tráela desde el paso 1 de un mapa, con «Traer de AMFE»." : "Ese archivo no es una copia de Mapa de Riesgos.", 5000); return;
      }
      s.mapas.forEach(x => { if (esIdEjemplo(x.id)) x.id = genId(); });
      const aplicar = modo => {
        const r = modo === "sustituir" ? s : L.fusionar(datosUsuario, s);
        datosUsuario.mapas = r.mapas; guardar(true);
        toast(`Importados ${plural(s.mapas.length, "mapa", "mapas")}.`, 4000);
        location.hash = "#/"; route();
      };
      if (!datosUsuario.mapas.length) { aplicar("sustituir"); return; }
      confirmar(`<p>La copia tiene <b>${plural(s.mapas.length, "mapa", "mapas")}</b>.</p><p><b>Añadir</b> los junta con los tuyos (si uno está en los dos, se queda el más reciente): así se trabaja en equipo. Si prefieres <b>sustituir</b> todo lo tuyo por la copia, pulsa «Sustituir».</p>`, "Añadir a mis datos", () => aplicar("anadir"), { titulo: "Importar copia", peligro: false, otro: ["Sustituir", () => confirmar("<p>Se borrarán tus mapas actuales y se quedará solo lo de la copia. Esto no se puede deshacer.</p>", "Sustituir", () => aplicar("sustituir"))] });
    };
    fr.readAsText(file);
  }

  // ---------- Confirmación ----------
  function confirmar(html, siTxt, alSi, o = {}) {
    const mo = $("#modal-confirmar");
    $("#conf-titulo").textContent = o.titulo || "¿Seguro?";
    $("#conf-texto").innerHTML = html;
    const si = $("#btn-conf-si"), no = $("#btn-conf-no");
    si.textContent = siTxt; si.className = "btn " + (o.peligro === false ? "btn--primary" : "btn--peligro");
    let extra = $("#btn-conf-otro"); if (extra) extra.remove();
    if (o.otro) { extra = document.createElement("button"); extra.id = "btn-conf-otro"; extra.className = "btn"; extra.textContent = o.otro[0]; no.after(extra); extra.onclick = () => { mo.hidden = true; o.otro[1](); }; }
    si.onclick = () => { mo.hidden = true; alSi(); };
    no.onclick = () => { mo.hidden = true; };
    mo.hidden = false; si.focus();
  }

  // ---------- Copiar un ejemplo a mis datos ----------
  function copiarAMisDatos() {
    if (!actual || !esIdEjemplo(actual.id)) return;
    const c = L.renovarIds(clon(actual), genId); c.creado = hoy(); c.modificado = hoy();
    datosUsuario.mapas.push(c); guardar(true); location.hash = `#/mapa/${c.id}/${pasoActual}`;
    toast("Copiado a tus mapas. Ya es tuyo: cámbialo a tu gusto.", 4000);
  }

  // ---------- Enrutado ----------
  const NAV = [["", "Inicio"], ["mapa", "Mis mapas"], ["ejemplos", "Ejemplo"], ["aprende", "Aprende"], ["glosario", "Glosario"]];
  function buildNav() { $("#calc-nav").innerHTML = NAV.map(([r, t]) => `<a href="#/${r}" data-r="${r}">${t}</a>`).join(""); }
  function noEncontrado(que, href, txt) { view.innerHTML = `<div class="error-box">No se encuentra ${que} en este dispositivo.</div><p><a href="${href}">${txt}</a></p>`; }
  let previo = null;
  function route() {
    const [ruta, qs] = (location.hash.replace(/^#\/?/, "") || "").split("?");
    const partes = ruta.split("/"), q = new URLSearchParams(qs || ""), informe = q.get("informe") === "1";
    document.body.classList.toggle("ver-informe", informe);
    actual = null;
    const idR = partes[1] || "", ej = ejemplos();
    modoEjemplo = partes[0] === "ejemplos" || (esIdEjemplo(idR) && ej.mapas.some(x => x.id === idR));
    datos = modoEjemplo ? ej : datosUsuario;
    $("#banner-ejemplo").hidden = !modoEjemplo || informe || partes[0] === "ejemplos";
    let navR = partes[0];
    const reiniciar = id => { abiertos.clear(); abiertosF.clear(); pegarAbierto = false; pegarFallos = false; selPaso = ""; previo = id; zoom = null; flujosLeidos = null; amfesLeidos = null; };
    if (partes[0] === "mapa" && partes[1] === "nuevo") {
      const m = L.nuevoMapa(genId(), hoy()); borradores.set(m.id, m); reiniciar(m.id);
      history.replaceState(null, "", `#/mapa/${m.id}/1`); renderMapa(m, 1);
    } else if (partes[0] === "mapa" && partes[1]) {
      const m = buscaMapa(partes[1]) || borradores.get(partes[1]);
      if (!m) noEncontrado("ese mapa", "#/mapa", "Ir a mis mapas");
      else {
        if (previo !== m.id) reiniciar(m.id);
        let n = parseInt(partes[2], 10);
        if (n !== pasoActual) { selPaso = ""; zoom = null; }
        if (!(n >= 1 && n <= 10)) { const p = L.pasoPendiente(m, ENTREGA); n = p ? p.n : 4; history.replaceState(null, "", `#/mapa/${m.id}/${n}${informe ? "?informe=1" : ""}`); }
        renderMapa(m, n);
        if (informe && esIOS()) prepararPDF();
      }
      navR = "mapa";
    } else if (partes[0] === "mapa") renderLista();
    else if (partes[0] === "ejemplos") renderEjemplos();
    else if (partes[0] === "aprende") renderAprende(parseInt(partes[1], 10) || 0);
    else if (partes[0] === "glosario") renderGlosario();
    else { renderHome(); navR = ""; }
    if (modoEjemplo) navR = "ejemplos";
    $$("#calc-nav a").forEach(a => a.classList.toggle("active", a.dataset.r === navR));
    const act = $("#calc-nav a.active"); if (act && act.scrollIntoView) act.scrollIntoView({ block: "nearest", inline: "center" });
    window.scrollTo(0, 0);
  }

  // ---------- Eventos ----------
  function tocado(m) {
    m.modificado = hoy();
    if (m === actual && !esVacio(m) && !datos.mapas.includes(m)) { datos.mapas.push(m); borradores.delete(m.id); }
    guardar();
  }
  const buscaEn = (lista, id) => lista.find(x => x.id === id);
  function autoAlto(el) { el.style.height = "auto"; el.style.height = el.scrollHeight + 2 + "px"; }
  new MutationObserver(() => $$("textarea.txt-in", view).forEach(el => { if (!el.closest("[hidden]") && !el.closest("details:not([open])")) autoAlto(el); })).observe(view, { childList: true, subtree: true });

  function vistaPegado(txt) {
    const r = LF.leerPegado(txt), z = $("[data-zona='pegar']"), b = $("[data-act='pegar-ok']");
    if (!z || !b) return;
    const F = r.filas;
    z.innerHTML = !txt.trim() ? "" : F.length
      ? `<div class="note">ℹ Se ${F.length === 1 ? "ha reconocido 1 paso" : "han reconocido " + F.length + " pasos"} (${r.modo === "tabla" ? "tabla" + (r.cabecera ? " con fila de títulos" : "") : "lista"}).</div>
         <ol class="pegar-prev">${F.slice(0, 12).map(x => `<li>${tipoChip(x.tipo)} <b>${esc(L.corto(x.texto, 60))}</b>${x.actor ? ` <span class="badge">${esc(x.actor)}</span>` : ""}</li>`).join("")}${F.length > 12 ? `<li>…</li>` : ""}</ol>`
      : `<div class="warn">⚠ No se reconoce ningún paso.</div>`;
    b.disabled = !F.length; b.textContent = F.length ? `Añadir ${plural(F.length, "paso", "pasos")}` : "Añadir los pasos";
  }
  view.addEventListener("input", e => {
    const t = e.target, m = actual;
    if (t.matches("textarea.txt-in")) autoAlto(t);
    if (t.id === "pegar-txt") { vistaPegado(t.value); return; }
    if (t.dataset.flujosel) { flujoElegido = t.value; return; }
    if (t.dataset.amfesel) { amfeElegido = t.value; repintar(); return; }
    if (t.id === "pegar-fallos") {
      const p = A.parsearTabla(t.value), z = $("[data-zona='pegarf']"), b = $("[data-act='pegarf-ok']");
      z.innerHTML = t.value.trim() ? (p.filas.length ? `<div class="note">ℹ Se ${p.filas.length === 1 ? "ha reconocido 1 fallo" : "han reconocido " + p.filas.length + " fallos"}${p.cabecera ? " (con fila de títulos)" : ""}. Primero: «${esc(L.corto(p.filas[0].fallo, 70))}».</div>` : "") + p.errores.map(x => `<div class="warn">⚠ ${esc(x)}</div>`).join("") : "";
      b.disabled = !p.filas.length; b.textContent = p.filas.length ? `Añadir ${plural(p.filas.length, "fallo", "fallos")}` : "Añadir los fallos";
      return;
    }
    if (!m) return;
    const k = t.dataset.f, esSel = t.tagName === "SELECT";
    if (t.dataset.ac) { const a = buscaEn(m.actores, t.dataset.ac); if (!a) return; a[k] = t.value; tocado(m); refrescar(); return; }
    if (t.dataset.s) { const s = buscaEn(m.subprocesos, t.dataset.s); if (!s) return; s[k] = t.value; tocado(m); refrescar(); return; }
    if (t.dataset.pa) {
      const p = LF.pasoDe(m, t.dataset.pa); if (!p) return;
      p[k] = t.value; tocado(m);
      if (esSel) { if (conLienzo()) seleccionar(p.id); else repintar(); refrescar(); } else refrescar();
      return;
    }
    if (t.dataset.pc) {
      const x = buscaEn(m.puntos, t.dataset.pc); if (!x) return;
      if (k === "pasoId") L.colocarPunto(m, x, t.value);
      else if (k === "subprocesoId") { x.subprocesoId = t.value; const p = LF.pasoDe(m, x.pasoId); if (p && p.subprocesoId && p.subprocesoId !== t.value) x.pasoId = ""; }
      else x[k] = t.value;
      tocado(m);
      if (esSel) repintar(); else refrescar();
      return;
    }
    if (t.dataset.m) { const x = buscaEn(m.equipo, t.dataset.m); if (!x) return; x[k] = t.value; tocado(m); if (esSel) repintar(); else refrescar(); return; }
    if (t.dataset.x) { const x = buscaEn(m.sesiones, t.dataset.x); if (!x) return; x[k] = t.value; tocado(m); refrescar(); return; }
    if (t.dataset.fa) {
      const f = buscaEn(m.fallos, t.dataset.fa); if (!f) return;
      f[k] = ["g", "o", "d"].includes(k) ? t.value.trim() : t.value; tocado(m);
      if (esSel) { if (k === "puntoId" && t.value) { const pt = L.puntoDe(m, f); const s = pt && L.subDePunto(m, pt); if (s) f.subprocesoId = s.id; } abiertosF.add(f.id); repintar(); } else refrescar(f.id);
      return;
    }
    if (t.dataset.marco) { m.marco[t.dataset.marco] = t.value.split("\n").map(x => x.trim()).filter(Boolean).slice(0, t.dataset.marco === "soporte" ? 16 : 12); tocado(m); refrescar(); return; }
    if (t.dataset.aj) { const p = LF.pasoDe(m, t.dataset.aj); if (!p) return; p.ajuste.lado = t.value; if (t.value) p.ajuste.fila = ""; tocado(m); seleccionar(p.id); refrescar(); return; }
    if (t.dataset.sal) {
      const p = LF.pasoDe(m, t.dataset.sal); if (!p) return;
      LF.ponerSalida(p, t.dataset.c, t.value); tocado(m);
      if (conLienzo()) seleccionar(p.id); else repintar();
      refrescar(); return;
    }
    if (t.dataset.k) { setPath(m, t.dataset.k, t.value); tocado(m); refrescar(null, /^prioridad\./.test(t.dataset.k)); }
  });
  view.addEventListener("toggle", e => {
    const d = e.target;
    if (d.matches && d.matches("details[data-recordar]")) escribir(KEY_FACIL, d.open ? "1" : "0");
    if (d.matches && d.matches("details[data-pcg]")) { if (d.open) pcAbiertos.add(d.dataset.pcg); else pcAbiertos.delete(d.dataset.pcg); escribir(KEY_PCSUB, [...pcAbiertos].join(",")); if (d.open) $$("textarea.txt-in", d).forEach(autoAlto); }
  }, true);

  function nuevoPasoTras(m, ref, tipo) {
    const p = LF.nuevoPaso(genId(), LF.siguienteNum(m.pasos), tipo);
    if (ref) { p.actorId = tipo === "terminal" ? "" : ref.actorId; p.subprocesoId = ref.subprocesoId; LF.insertarDespues(m, ref, p); }
    else {
      // Al final: se une con el último paso que no lleva a ningún sitio
      const abierto = m.pasos.slice().reverse().find(q => !q.siguientes.length && q.tipo !== "terminal");
      const ultimo = m.pasos[m.pasos.length - 1];
      if (!m.pasos.length) { p.tipo = "terminal"; p.subprocesoId = m.subprocesos[0] ? m.subprocesos[0].id : ""; }
      else { p.actorId = ultimo.actorId || ""; p.subprocesoId = ultimo.subprocesoId; }
      m.pasos.push(p);
      if (abierto) abierto.siguientes.push(LF.nuevaFlecha(p.id, abierto.tipo === "decision" ? (abierto.siguientes.some(s => s.etiqueta === "si") ? "no" : "si") : ""));
    }
    return p;
  }
  function enfocarPaso(p) {
    abiertos.add(p.id);
    if (conLienzo()) { seleccionar(p.id); const el = $(`[data-pa="${p.id}"][data-f="texto"]`); if (el) el.focus(); return; }
    repintar();
    const el = $(`[data-pa="${p.id}"][data-f="texto"]`); if (el) { el.focus(); el.scrollIntoView({ block: "center" }); }
  }
  function enfocarPunto(x) {
    const s = L.subDePunto(m0(), x); if (s) { pcAbiertos.add(s.id); escribir(KEY_PCSUB, [...pcAbiertos].join(",")); }
    repintar();
    const el = $(`[data-zona='tablapc'] [data-pc="${x.id}"][data-f="titulo"]`) || $(`[data-pc="${x.id}"][data-f="titulo"]`); if (el) { el.focus(); el.scrollIntoView({ block: "center" }); }
  }
  const m0 = () => actual;

  view.addEventListener("click", e => {
    const t = e.target; let b;
    if ((b = t.closest(".info-btn"))) { const h = $("#help-" + b.dataset.info); if (!h) return; const open = h.hidden; h.hidden = !open; b.setAttribute("aria-expanded", String(open)); return; }
    const m = actual;
    if ((b = t.closest(".fl-nodo")) && m) { seleccionar(b.dataset.paso === selPaso ? "" : b.dataset.paso); return; }
    if ((b = t.closest("[data-asis]")) && m) {
      const x = buscaEn(m.sesiones, b.dataset.asis); if (!x) return;
      const i = x.asistentes.indexOf(b.dataset.v); if (i < 0) x.asistentes.push(b.dataset.v); else x.asistentes.splice(i, 1);
      b.classList.toggle("active", i < 0); tocado(m); return;
    }
    if (!(b = t.closest("[data-act]"))) return;
    const act = b.dataset.act, id = b.dataset.id;
    // --- Lista ---
    if (act === "m-dup") {
      const o = buscaMapa(id); if (!o) return;
      const c = L.renovarIds(clon(o), genId); Object.assign(c, { titulo: (nombreMapa(o) || "Mapa") + " (copia)", creado: hoy(), modificado: hoy() });
      datos.mapas.push(c); guardar(); renderLista(); toast("Mapa duplicado.", 2500);
    }
    else if (act === "m-del") {
      const o = buscaMapa(id); if (!o) return;
      confirmar(`<p>Se borrará «${esc(L.corto(nombreMapa(o) || "Mapa sin nombre", 80))}» con sus ${plural(o.subprocesos.length, "subproceso", "subprocesos")}, ${plural(o.pasos.length, "paso", "pasos")} y ${plural(o.puntos.length, "punto crítico", "puntos críticos")}. Esto no se puede deshacer${datosUsuario.ultimaCopia ? "" : " (y aún no tienes ninguna copia de seguridad)"}.</p>`, "Borrar", () => {
        datos.mapas = datos.mapas.filter(x => x.id !== id); if (!modoEjemplo) datosUsuario.mapas = datos.mapas; guardar(true); renderLista();
      });
    }
    // --- Paso 1 ---
    else if (act === "sug-objetivo" && m) {
      const s = L.sugerirObjetivo(m);
      if (!s) { toast("Escribe primero el nombre del proceso.", 3000); return; }
      const hacer = () => { m.objetivo = s; tocado(m); repintar(); };
      if (lleno(m.objetivo)) confirmar("<p>Se sustituirá el objetivo que has escrito por el propuesto.</p>", "Sustituir", hacer, { peligro: false }); else hacer();
    }
    else if (act === "flujo-buscar" && m) {
      let l = null; try { l = L.leerFlujograma(JSON.parse(leer("flujograma-intercambio") || "null")); } catch (er) { /* */ }
      if (l && l.length) { flujosLeidos = l; flujoElegido = l[0].id; repintar(); }
      else confirmar("<p>No hay ningún flujograma de la app <b>Flujograma</b> en este navegador.</p><p>Si lo tienes en otro dispositivo, carga su copia de seguridad (.json).</p>", "Cargar una copia", () => $("#input-flujo").click(), { titulo: "Traer de Flujograma", peligro: false });
    }
    else if (act === "flujo-cancelar") { flujosLeidos = null; repintar(); }
    else if (act === "flujo-traer" && m && flujosLeidos) {
      const fl = flujosLeidos.find(x => x.id === flujoElegido) || flujosLeidos[0];
      const r = L.traerDeFlujograma(m, fl, genId, (fl && fl.appVersion) || "", hoyIso()); flujosLeidos = null; tocado(m); repintar();
      const partes = [r.proceso && "el proceso", r.subprocesos && plural(r.subprocesos, "subproceso", "subprocesos"), r.actores && plural(r.actores, "calle", "calles"), r.pasos && plural(r.pasos, "paso", "pasos"), r.puntos && plural(r.puntos, "punto crítico", "puntos críticos")].filter(Boolean);
      toast(`${partes.length ? "Traído de Flujograma: " + L.listaY(partes) + "." : "No había nada nuevo que traer."}${r.pasosOmitidos ? " Los pasos no se han traído porque este mapa ya tenía flujograma." : ""}`, 5500);
    }
    // --- Paso 2 ---
    else if (act === "sub-add" && m) {
      const s = L.nuevoSubproceso(genId(), LF.colorLibre(m)); m.subprocesos.push(s); tocado(m); repintar();
      const el = $(`[data-s="${s.id}"][data-f="nombre"]`); if (el) { el.focus(); el.scrollIntoView({ block: "center" }); }
    }
    else if ((act === "sub-subir" || act === "sub-bajar" || act === "ac-subir" || act === "ac-bajar") && m) {
      const l = act.startsWith("ac") ? m.actores : m.subprocesos, i = l.findIndex(x => x.id === id), j = act.endsWith("subir") ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= l.length) return;
      [l[i], l[j]] = [l[j], l[i]]; tocado(m); repintar();
    }
    else if (act === "sub-del" && m) {
      const s = buscaEn(m.subprocesos, id); if (!s) return;
      const n = m.pasos.filter(p => p.subprocesoId === id).length, np = L.puntosDeSub(m, id).length;
      const hacer = () => { m.subprocesos = m.subprocesos.filter(x => x.id !== id); m.pasos.forEach(p => { if (p.subprocesoId === id) p.subprocesoId = ""; }); m.puntos.forEach(x => { if (x.subprocesoId === id) x.subprocesoId = ""; }); tocado(m); repintar(); };
      if (n || np || lleno(s.nombre)) confirmar(`<p>Se quitará el subproceso «${esc(L.corto(s.nombre || "sin nombre", 60))}».${n || np ? ` Sus ${[n && plural(n, "paso", "pasos"), np && plural(np, "punto crítico", "puntos críticos")].filter(Boolean).join(" y ")} no se borran: quedarán sin subproceso.` : ""}</p>`, "Quitar", hacer); else hacer();
    }
    // --- Paso 3 ---
    else if (act === "v3" && m) { vista3 = b.dataset.v === "dibujo" ? "dibujo" : "pasos"; escribir(KEY_VISTA3, vista3); selPaso = ""; zoom = null; repintar(); }
    else if (act === "ac-sug" && m) {
      const nom = LF.ACTORES_SUG[Number(b.dataset.i)]; if (!nom) return;
      if (LF.buscaActor(m, nom)) { toast("Ese actor ya está.", 2000); return; }
      m.actores.push(LF.nuevoActor(genId(), nom)); tocado(m); repintar();
    }
    else if (act === "ac-add" && m) {
      const a = LF.nuevoActor(genId()); m.actores.push(a); tocado(m); repintar();
      const el = $(`[data-ac="${a.id}"]`); if (el) el.focus();
    }
    else if (act === "ac-roles" && m) { const n = LF.anadirActores(m, LF.rolesSinCalle(m), genId); tocado(m); repintar(); toast(`${plural(n, "actor añadido", "actores añadidos")}. Revisa los nombres.`, 3000); }
    else if (act === "ac-del" && m) {
      const a = buscaEn(m.actores, id); if (!a) return;
      const n = m.pasos.filter(p => p.actorId === id).length;
      const hacer = () => { m.actores = m.actores.filter(x => x.id !== id); m.pasos.forEach(p => { if (p.actorId === id) p.actorId = ""; }); tocado(m); repintar(); };
      if (n) confirmar(`<p>Se quitará «${esc(a.nombre || "sin nombre")}». Sus ${plural(n, "paso", "pasos")} no se borran: quedarán «sin asignar».</p>`, "Quitar", hacer); else hacer();
    }
    else if (act === "p-toggle") {
      if (abiertos.has(id)) abiertos.delete(id); else abiertos.add(id);
      const card = $(`.paso-card[data-pid="${id}"]`); if (!card) return;
      const ab = abiertos.has(id);
      $(".rg-body", card).hidden = !ab; $(".rg-toggle", card).setAttribute("aria-expanded", ab);
      if (ab) $$("textarea.txt-in", card).forEach(autoAlto);
    }
    else if (act === "p-todos" && m) { if (abiertos.size) abiertos.clear(); else m.pasos.forEach(p => abiertos.add(p.id)); repintar(); }
    else if (act === "p-add" && m) { const p = nuevoPasoTras(m, null, "actividad"); tocado(m); enfocarPaso(p); }
    else if ((act === "p-debajo" || act === "p-decision") && m) {
      const ref = LF.pasoDe(m, id); if (!ref) return;
      const p = nuevoPasoTras(m, ref, act === "p-decision" ? "decision" : "actividad"); tocado(m); enfocarPaso(p);
    }
    else if (act === "p-tipo" && m) { const p = LF.pasoDe(m, id); if (!p) return; LF.cambiarTipo(p, b.dataset.v); tocado(m); if (conLienzo()) { seleccionar(p.id); refrescar(); } else { abiertos.add(p.id); repintar(); } }
    else if (act === "p-ida" && m) { const p = LF.pasoDe(m, id), s = p && p.siguientes[Number(b.dataset.i)]; if (!s) return; s.estilo = s.estilo === "idavuelta" ? "normal" : "idavuelta"; tocado(m); if (conLienzo()) seleccionar(p.id); else repintar(); }
    else if (act === "p-flecha" && m) {
      const p = LF.pasoDe(m, id); if (!p) return;
      const libre = m.pasos.find(q => q.id !== p.id && !p.siguientes.some(s => s.a === q.id));
      if (!libre) return; p.siguientes.push(LF.nuevaFlecha(libre.id, "")); tocado(m); if (conLienzo()) seleccionar(p.id); else repintar();
      toast("Elige en la lista a qué paso va la nueva flecha.", 3000);
    }
    else if ((act === "p-subir" || act === "p-bajar") && m) {
      const i = m.pasos.findIndex(p => p.id === id), j = act === "p-subir" ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= m.pasos.length) return;
      [m.pasos[i], m.pasos[j]] = [m.pasos[j], m.pasos[i]]; tocado(m); repintar();
    }
    else if (act === "p-del" && m) {
      const p = LF.pasoDe(m, id); if (!p) return;
      const llegan = m.pasos.filter(q => q.siguientes.some(s => s.a === id)).length, np = m.puntos.filter(x => x.pasoId === id).length;
      const hacer = () => { LF.quitarPaso(m, id); m.puntos.forEach(x => { if (x.pasoId === id) x.pasoId = ""; }); abiertos.delete(id); if (selPaso === id) selPaso = ""; tocado(m); repintar(); };
      if (lleno(p.texto) || llegan || np) confirmar(`<p>Se quitará el paso nº ${p.num} «${esc(L.corto(p.texto || "sin texto", 60))}».${llegan ? " Los pasos que llevaban a él pasarán a llevar a lo que venía después (si solo había un camino)." : ""}${np ? ` Sus ${plural(np, "punto crítico", "puntos críticos")} no se borran: quedarán sin colocar.` : ""}</p>`, "Quitar", hacer); else hacer();
    }
    else if (act === "pegar-abrir") { pegarAbierto = true; repintar(); const el = $("#pegar-txt"); if (el) { el.focus(); el.scrollIntoView({ block: "center" }); } }
    else if (act === "pegar-cerrar") { pegarAbierto = false; repintar(); }
    else if (act === "pegar-ok" && m) {
      const r = LF.leerPegado($("#pegar-txt").value, { terminales: !m.pasos.length }); if (!r.filas.length) return;
      const n = LF.incorporarPasos(m, r.filas, genId);
      pegarAbierto = false; tocado(m); repintar();
      toast(`Añadidos ${plural(n.pasos, "paso", "pasos")}${n.actores ? ` y ${plural(n.actores, "actor", "actores")}` : ""}. Asigna cada paso a su subproceso y mira el dibujo.`, 4500);
    }
    else if (act === "ver-paso" && m) {
      if (!conLienzo()) return;
      seleccionar(id);
      const s = $(`#lienzo .fl-nodo[data-paso="${id}"]`), l = $("#lienzo");
      if (s && l) { const r = s.getBoundingClientRect(), rl = l.getBoundingClientRect(); l.scrollLeft += r.left - rl.left - rl.width / 2 + r.width / 2; l.scrollTop += r.top - rl.top - rl.height / 2 + r.height / 2; l.scrollIntoView({ block: "nearest" }); }
    }
    else if (act === "panel-cerrar") seleccionar("");
    else if ((act === "aj-bajar" || act === "aj-subir" || act === "aj-quitar") && m) {
      const p = LF.pasoDe(m, id); if (!p) return;
      const n = parseInt(p.ajuste.fila, 10) || 0;
      if (act === "aj-quitar") { p.ajuste.fila = ""; p.ajuste.lado = ""; } else p.ajuste.fila = String(Math.max(0, Math.min(9, n + (act === "aj-bajar" ? 1 : -1)))).replace(/^0$/, "");
      tocado(m); seleccionar(p.id);
    }
    else if (act === "v-or" && m) { m.vista.orientacion = b.dataset.v; zoom = null; tocado(m); repintar(); }
    else if (act === "v-sub" && m) { m.vista.subprocesos = !m.vista.subprocesos; tocado(m); repintar(); }
    else if (act === "v-marco" && m) { m.vista.marco = !m.vista.marco; if (m.vista.marco && !m.marco.estrategicos.length && !m.marco.soporte.length) m.marco = clon(LF.MARCO_SUG); tocado(m); repintar(); }
    else if (act === "marco-sug" && m) { m.marco = clon(LF.MARCO_SUG); tocado(m); repintar(); }
    else if (act === "v-turno" && m) { m.vista.calles = m.vista.calles === "turno" ? "actor" : "turno"; tocado(m); repintar(); }
    else if (act === "v-num" && m) { m.vista.numeros = !m.vista.numeros; tocado(m); repintar(); }
    else if (act === "v-letra" && m) { m.vista.letra = m.vista.letra === "grande" ? "normal" : "grande"; tocado(m); repintar(); }
    else if (act === "z-mas") ponerZoom(zoomActual() * 1.25);
    else if (act === "z-menos") ponerZoom(zoomActual() / 1.25);
    else if (act === "z-ajustar") { zoom = ajusteAncho(); aplicarZoom(); }
    else if (act === "validar" && m) { if (LF.errores(m).length) return; m.validado = hoyIso(); tocado(m); refrescar(); toast("Marcado como validado con el equipo.", 2500); }
    else if (act === "validar-quitar" && m) { m.validado = ""; tocado(m); refrescar(); }
    // --- Paso 4 ---
    else if (act === "pc-add" && m) {
      const x = L.anadirPunto(m, genId, b.dataset.sub || "", b.dataset.paso || ""); tocado(m);
      if (b.dataset.paso) { seleccionar(b.dataset.paso); refrescar(); const z = $("[data-zona='tablapc']"); if (z) z.innerHTML = tablaPuntosHtml(m); const el = $(`.panel-paso [data-pc="${x.id}"][data-f="titulo"]`); if (el) el.focus(); }
      else enfocarPunto(x);
    }
    else if (act === "pc-del" && m) {
      const x = buscaEn(m.puntos, id); if (!x) return;
      const hacer = () => { m.puntos = m.puntos.filter(y => y.id !== id); tocado(m); repintar(); };
      if (lleno(x.titulo) || lleno(x.descripcion)) confirmar(`<p>Se quitará el punto crítico nº ${x.num} «${esc(L.corto(x.titulo || "sin título", 60))}».${x.clave ? " La propuesta volverá a la lista." : ""}</p>`, "Quitar", hacer); else hacer();
    }
    else if (act === "prop-ok" && m) {
      const pr = L.propuestas(m).find(x => x.clave === b.dataset.k); if (!pr) return;
      const x = L.aceptarPropuesta(m, pr, genId); tocado(m); repintar();
      toast(`Añadido el punto crítico nº ${x.num}. Ajusta el título y escribe la descripción.`, 3500);
    }
    else if (act === "prop-no" && m) { if (!m.descartes.includes(b.dataset.k)) m.descartes.push(b.dataset.k); tocado(m); repintar(); }
    else if (act === "prop-recuperar" && m) { m.descartes = []; tocado(m); repintar(); }
    // --- Paso 1 · Traer de AMFE ---
    else if (act === "amfe-buscar" && m) {
      let l = null; try { l = L.leerAmfe(JSON.parse(leer("amfe-intercambio") || "null")); } catch (er) { /* */ }
      if (l && l.length) { amfesLeidos = l; amfeElegido = l[0].id; repintar(); }
      else confirmar("<p>No hay ningún AMFE de la app <b>AMFE</b> en este navegador.</p><p>Si lo tienes en otro dispositivo, carga su copia de seguridad (.json).</p>", "Cargar una copia", () => $("#input-amfe").click(), { titulo: "Traer de AMFE", peligro: false });
    }
    else if (act === "amfe-cancelar") { amfesLeidos = null; repintar(); }
    else if (act === "amfe-traer" && m && amfesLeidos) {
      const a = amfesLeidos.find(x => x.id === amfeElegido) || amfesLeidos[0];
      const r = L.traerDeAmfe(m, a, genId, a.appVersion || "", hoyIso()); amfesLeidos = null; tocado(m); repintar();
      const partes = [r.proceso && "el proceso", r.subprocesos && plural(r.subprocesos, "subproceso", "subprocesos"), r.fallos && plural(r.fallos, "fallo", "fallos"), r.acciones && plural(r.acciones, "acción de mejora", "acciones de mejora")].filter(Boolean);
      toast(`${partes.length ? "Traído de AMFE: " + L.listaY(partes) + "." : "No había nada nuevo que traer."}${r.enlazados ? ` ${plural(r.enlazados, "fallo enlazado", "fallos enlazados")} con su punto crítico.` : ""}${r.fallosOmitidos ? " Los fallos no se han traído porque este mapa ya tenía fallos." : ""}`, 6000);
    }
    // --- Paso 5 ---
    else if (act === "eq-sug" && m) {
      const p = A.PERFILES_SUG[Number(b.dataset.i)]; if (!p) return;
      if (m.equipo.some(x => L.normal(x.perfil) === L.normal(p.perfil))) { toast("Ese perfil ya está en el equipo.", 2500); return; }
      m.equipo.push(Object.assign(A.nuevoMiembro(genId()), { perfil: p.perfil, rol: m.equipo.some(x => x.rol === p.rol && (p.rol === "coordinador" || p.rol === "secretario")) ? "miembro" : p.rol }));
      tocado(m); repintar();
    }
    else if (act === "eq-add" && m) {
      const x = A.nuevoMiembro(genId()); m.equipo.push(x); tocado(m); repintar();
      const el = $(`[data-m="${x.id}"][data-f="perfil"]`); if (el) { el.focus(); el.scrollIntoView({ block: "center" }); }
    }
    else if (act === "eq-del" && m) {
      const x = buscaEn(m.equipo, id); if (!x) return;
      const hacer = () => { m.equipo = m.equipo.filter(y => y.id !== id); m.sesiones.forEach(y => { y.asistentes = y.asistentes.filter(z => z !== id); }); tocado(m); repintar(); };
      if (lleno(x.perfil) || lleno(x.justificacion)) confirmar(`<p>Se quitará «${esc(L.corto(etiquetaMiembro(x), 60))}» del equipo.</p>`, "Quitar", hacer); else hacer();
    }
    else if (act === "ses-add" && m) { const x = A.nuevaSesion(genId()); m.sesiones.push(x); tocado(m); repintar(); }
    else if (act === "ses-tipo" && m) {
      A.SESIONES_TIPO.forEach(s => m.sesiones.push(Object.assign(A.nuevaSesion(genId()), s, { asistentes: m.equipo.map(x => x.id) })));
      tocado(m); repintar(); toast("Propuestas las 3 sesiones habituales. Pon las fechas y ajústalas.", 3500);
    }
    else if (act === "ses-del" && m) {
      const x = buscaEn(m.sesiones, id); if (!x) return;
      const hacer = () => { m.sesiones = m.sesiones.filter(y => y.id !== id); tocado(m); repintar(); };
      if (lleno(x.actividad) || lleno(x.resultados)) confirmar("<p>Se quitará esta sesión.</p>", "Quitar", hacer); else hacer();
    }
    else if (act === "tec" && m) {
      const T = m.metodologia.tecnicas, v = b.dataset.v, i = T.indexOf(v);
      if (i < 0) T.push(v); else T.splice(i, 1);
      b.classList.toggle("active", i < 0); tocado(m); refrescar();
    }
    // --- Paso 6 ---
    else if (act === "pasar-amfe" && m) {
      const n = L.pasarPuntosAlAmfe(m, genId); tocado(m); repintar();
      toast(`${plural(n, "punto crítico ha pasado", "puntos críticos han pasado")} al AMFE. Escribe ahora el efecto, la causa y los controles de cada fallo.`, 4500);
    }
    else if (act === "fa-toggle") {
      if (abiertosF.has(id)) abiertosF.delete(id); else abiertosF.add(id);
      const card = $(`.fallo[data-fid="${id}"]`); if (!card) return;
      const ab = abiertosF.has(id);
      $(".rg-body", card).hidden = !ab; $(".rg-toggle", card).setAttribute("aria-expanded", ab);
      if (ab) $$("textarea.txt-in", card).forEach(autoAlto); else if (card.getBoundingClientRect().top < 60) card.scrollIntoView({ block: "start" });
    }
    else if (act === "fa-abrir-todos" && m) { if (abiertosF.size) abiertosF.clear(); else m.fallos.forEach(f => abiertosF.add(f.id)); repintar(); }
    else if (act === "fa-add" && m) {
      const f = Object.assign(A.nuevoFallo(genId(), A.siguienteNum(m)), { subprocesoId: b.dataset.sub || "", puntoId: "" });
      m.fallos.push(f); abiertosF.add(f.id); tocado(m); repintar();
      const el = $(`[data-fa="${f.id}"][data-f="fallo"]`); if (el) { el.focus(); el.scrollIntoView({ block: "center" }); }
    }
    else if (act === "fa-del" && m) {
      const f = buscaEn(m.fallos, id); if (!f) return;
      const hacer = () => { m.fallos = m.fallos.filter(x => x.id !== id); abiertosF.delete(id); tocado(m); repintar(); };
      if ([f.fallo, f.efecto, f.causa, f.controles].some(lleno)) confirmar(`<p>Se quitará el fallo nº ${f.num} «${esc(L.corto(f.fallo || "sin describir", 60))}».${f.acciones.length ? ` También sus ${plural(f.acciones.length, "acción de mejora", "acciones de mejora")}.` : ""}</p>`, "Quitar", hacer); else hacer();
    }
    else if (act === "pegarf-abrir") { pegarFallos = true; repintar(); const el = $("#pegar-fallos"); if (el) el.focus(); }
    else if (act === "pegarf-cerrar") { pegarFallos = false; repintar(); }
    else if (act === "pegarf-ok" && m) {
      const p = A.parsearTabla($("#pegar-fallos").value); if (!p.filas.length) return;
      const ns = A.incorporarFilas(m, p.filas, genId);
      m.fallos.forEach(f => { if (f.puntoId === undefined) f.puntoId = ""; });
      pegarFallos = false; tocado(m); repintar();
      toast(`Añadidos ${plural(p.filas.length, "fallo", "fallos")}${ns ? ` y ${plural(ns, "subproceso nuevo", "subprocesos nuevos")}` : ""}.`, 4000);
    }
    // --- Paso 7 ---
    else if (act === "v7" && m) { vista7 = b.dataset.v; escribir(KEY_VISTA7, vista7); repintar(); window.scrollTo(0, ($(".vista3") || { offsetTop: 0 }).offsetTop - 70); }
    else if (act === "prio-modo" && m) { m.prioridad.modo = b.dataset.v; tocado(m); repintar(); }
    else if (act === "mz-tam") { tamMatriz = Number(b.dataset.v) === 5 ? 5 : 10; escribir(KEY_MATRIZ, String(tamMatriz)); const z = $("[data-zona='matriz']"); if (z && m) z.innerHTML = matrizHtml(m); }
    else if (act === "mz-solo") { soloPrio = b.dataset.v === "1"; const z = $("[data-zona='matriz']"); if (z && m) z.innerHTML = matrizHtml(m); }
    else if (act === "ir-fallo" && m) {
      vista7 = "priorizar"; escribir(KEY_VISTA7, vista7); repintar();
      const el = $(`[data-pf="${id}"]`); if (!el) return;
      el.scrollIntoView({ block: "center" }); el.classList.remove("pf--flash"); void el.offsetWidth; el.classList.add("pf--flash");
    }
    else if (act === "pf-prio" && m) {
      const f = buscaEn(m.fallos, id); if (!f || f.critico) return;
      const e = A.prioridad(m)[f.id];
      f.manual = f.manual ? "" : (e.prio ? "no" : "si");
      if (f.manual === "si" && !lleno(f.motivo)) f.motivo = A.sugerirMotivo(m, f);
      tocado(m); repintar();
      if (f.manual) { const el = $(`[data-fa="${f.id}"][data-f="motivo"]`); if (el) el.focus(); }
    }
    else if (act === "pf-critico" && m) {
      const f = buscaEn(m.fallos, id); if (!f) return;
      f.critico = b.checked; tocado(m); repintar();
      if (f.critico) { const el = $(`[data-fa="${f.id}"][data-f="motivoCritico"]`); if (el) el.focus(); }
    }
    else if (act === "pf-motivo" && m) {
      const f = buscaEn(m.fallos, id), k = b.dataset.k; if (!f) return;
      const s = A.sugerirMotivo(m, f), hacer = () => { f[k] = s; tocado(m); repintar(); };
      if (lleno(f[k])) confirmar("<p>Se sustituirá el motivo que has escrito por el propuesto.</p>", "Sustituir", hacer, { peligro: false }); else hacer();
    }
    // --- Vista para imprimir ---
    else if (act === "informe") irInforme();
    else if (act === "volver") location.hash = rutaActual();
    else if (act === "imprimir") imprimir();
    // --- Generales ---
    else if (act === "copia") copiaSeguridad();
    else if (act === "importar") $("#input-importar").click();
  });
  $("#banner-copiar").addEventListener("click", copiarAMisDatos);
  // Copia de seguridad de la app Flujograma (para «Traer de Flujograma» desde otro dispositivo)
  $("#input-flujo").addEventListener("change", e => {
    const fl = e.target.files && e.target.files[0]; e.target.value = ""; if (!fl) return;
    const fr = new FileReader();
    fr.onload = () => {
      let l = null; try { l = L.leerFlujograma(JSON.parse(fr.result)); } catch (er) { /* */ }
      if (!l || !l.length) { toast("Ese archivo no es una copia de la app Flujograma (o es de una versión que no se reconoce).", 4500); return; }
      flujosLeidos = l; flujoElegido = l[0].id; if (actual) repintar();
    };
    fr.readAsText(fl);
  });
  // Copia de seguridad de la app AMFE (para «Traer de AMFE» desde otro dispositivo)
  $("#input-amfe").addEventListener("change", e => {
    const fl = e.target.files && e.target.files[0]; e.target.value = ""; if (!fl) return;
    const fr = new FileReader();
    fr.onload = () => {
      let l = null; try { l = L.leerAmfe(JSON.parse(fr.result)); } catch (er) { /* */ }
      if (!l || !l.length) { toast("Ese archivo no es una copia de la app AMFE (o es de una versión que no se reconoce).", 4500); return; }
      amfesLeidos = l; amfeElegido = l[0].id; if (actual) repintar();
    };
    fr.readAsText(fl);
  });
  $("#input-importar").addEventListener("change", e => { const fl = e.target.files && e.target.files[0]; if (fl) importar(fl); e.target.value = ""; });

  // ---------- Tema ----------
  function setTema(t) {
    document.documentElement.setAttribute("data-tema", t);
    const mt = $("#meta-theme-color"); if (mt) mt.content = t === "claro" ? "#f0f7fb" : "#0d1b2a";
  }
  setTema(document.documentElement.getAttribute("data-tema") || "claro");
  $("#btn-tema").addEventListener("click", () => {
    const t = document.documentElement.getAttribute("data-tema") === "oscuro" ? "claro" : "oscuro";
    setTema(t); escribir("mapariesgos-tema", t);
  });
  if (window.matchMedia) matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ev => { if (!leer("mapariesgos-tema")) setTema(ev.matches ? "oscuro" : "claro"); });

  // ---------- Modales ----------
  const KEY_BIENV = "mapariesgos-bienvenida-vista";
  const mb = $("#modal-bienvenida"), ma = $("#modal-acerca");
  const vista = leer(KEY_BIENV);
  if (!vista) mb.hidden = false;
  $("#btn-bienv-ok").addEventListener("click", () => { if ($("#modal-no-repetir").checked) escribir(KEY_BIENV, "1"); mb.hidden = true; });
  $("#btn-acerca").addEventListener("click", () => { ma.hidden = false; });
  $("#btn-acerca-cerrar").addEventListener("click", () => { ma.hidden = true; });
  ma.addEventListener("click", e => { if (e.target === ma) ma.hidden = true; });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { ma.hidden = true; $("#modal-confirmar").hidden = true; } });

  // ---------- Versiones y novedades ----------
  const KEY_VERSION = "mapariesgos-version-vista";
  const listaCambios = n => `<div class="version-item"><div class="version-cab"><b>${esc(n.titulo)}</b><span class="version-tag">v${esc(n.version)} · ${esc(n.fecha)}</span></div><ul>${n.cambios.map(c => `<li>${esc(c)}</li>`).join("")}</ul></div>`;
  $("#historial-versiones").innerHTML = NOVEDADES.map(listaCambios).join("");
  $("#about-version").textContent = $("#footer-version").textContent = `Versión ${APP_VERSION}`;
  const mn = $("#modal-novedades");
  $("#btn-novedades-ok").addEventListener("click", () => { mn.hidden = true; escribir(KEY_VERSION, APP_VERSION); });
  (function gestionarNovedades() {
    const vistaV = leer(KEY_VERSION);
    if (vistaV === APP_VERSION) return;
    if (!vistaV && !vista) { escribir(KEY_VERSION, APP_VERSION); return; }
    const idx = NOVEDADES.findIndex(n => n.version === vistaV);
    const nuevas = idx > 0 ? NOVEDADES.slice(0, idx) : [NOVEDADES[0]];
    $("#novedades-sub").textContent = nuevas.length > 1 ? "Esto es lo nuevo desde tu última visita" : "Gracias por mantener la app al día";
    $("#novedades-body").innerHTML = nuevas.map(listaCambios).join("");
    if (mb.hidden) mn.hidden = false;
  })();

  // ---------- Service worker y aviso de nueva versión ----------
  let actualizando = false;
  function avisoActualizacion(reg) {
    if ($("#update-banner")) return;
    const bn = document.createElement("div");
    bn.id = "update-banner"; bn.className = "update-banner no-print"; bn.setAttribute("role", "status");
    bn.innerHTML = "<span>Nueva versión disponible</span><button type=\"button\">Actualizar</button>";
    bn.querySelector("button").addEventListener("click", () => { guardar(true); actualizando = true; if (reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" }); bn.remove(); });
    document.body.appendChild(bn);
  }
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").then(reg => {
      if (reg.waiting && navigator.serviceWorker.controller) avisoActualizacion(reg);
      reg.addEventListener("updatefound", () => {
        const nw = reg.installing; if (!nw) return;
        nw.addEventListener("statechange", () => { if (nw.state === "installed" && navigator.serviceWorker.controller) avisoActualizacion(reg); });
      });
    }).catch(() => {});
    let recargando = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => { if (recargando || !actualizando) return; recargando = true; location.reload(); });
  }

  // ---------- Instalar como aplicación ----------
  let avisoInstalar = null;
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); avisoInstalar = e; const bi = $("#btn-instalar"); if (bi) bi.hidden = false; });
  $("#btn-instalar").addEventListener("click", async () => { if (!avisoInstalar) return; avisoInstalar.prompt(); try { await avisoInstalar.userChoice; } catch (e) { /* */ } avisoInstalar = null; $("#btn-instalar").hidden = true; });
  window.addEventListener("appinstalled", () => { const bi = $("#btn-instalar"); if (bi) bi.hidden = true; });
  if (matchMedia("(display-mode: standalone)").matches || navigator.standalone) { const i = $("#instalar-bloque"); if (i) i.classList.add("instalada"); }

  window.MAPARIESGOS = { datos: () => datos, generarPDF };   // solo para pruebas desde la consola

  // ---------- Arranque ----------
  buildNav();
  window.addEventListener("hashchange", route);
  route();
})();
