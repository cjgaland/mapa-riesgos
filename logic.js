// ============================================================
//  logic.js — Lógica PURA (sin DOM) · Mapa de Riesgos
//  NO repite el código de AMFE ni de Flujograma (decisión del autor): usa en vivo
//  su motor, que la página carga antes que este archivo:
//    ../amfe/logic.js        → window.LogicaAmfe
//    ../flujograma/logic.js  → window.LogicaFlujo
//  Un mapa ES un flujograma (mismos campos que en Flujograma: proceso, actores,
//  subprocesos, pasos, puntos críticos, vista, marco…) con los campos propios del
//  mapa añadidos. Así las funciones del motor de Flujograma se usan tal cual
//  (avisosPasos, disponer, dibujar, propuestasPuntos…). En la entrega 2 se
//  añaden los campos con forma de AMFE (equipo, sesiones, fallos…).
//  Este archivo exporta una FÁBRICA: crear(LogicaFlujo, LogicaAmfe) → API.
//  En el navegador: window.Logica = crear(window.LogicaFlujo, window.LogicaAmfe).
//  En Node (tests): module.exports = { crear, MOTORES }.
// ============================================================
(function (raiz) {
  "use strict";

  // Versión del contrato de cada motor con la que se ha construido esta app (ver Diseño, sección 6.2)
  const MOTORES = {
    flujo: { nombre: "Flujograma", global: "LogicaFlujo", motor: 1, ruta: "../flujograma/logic.js",
      usa: ["lleno", "corto", "normal", "plural", "listaY", "sinTildes", "TIPOS", "ORDEN_TIPOS", "ACTORES_SUG", "MARCO_SUG",
        "nuevoFlujo", "nuevoActor", "nuevoSubproceso", "nuevoPaso", "nuevaFlecha", "nuevoPunto", "siguienteNum", "colorLibre",
        "pasoDe", "actorDe", "buscaActor", "sugerirObjetivo", "avisosProceso", "avisosActores", "avisosPasos", "errores", "rolesSinCalle",
        "progreso", "resumen", "propuestasPuntos", "aceptarPropuesta", "leerPegado", "incorporarPasos", "insertarDespues", "quitarPaso",
        "cambiarTipo", "ponerSalida", "anadirActores", "disponer", "dibujar", "sanearFlujo", "leerIntercambio", "paqueteIntercambio",
        "NIVELES_IPR", "nivelDeIPR"] },
    amfe: { nombre: "AMFE", global: "LogicaAmfe", motor: 1, ruta: "../amfe/logic.js",
      usa: ["ESCALAS_CURSO", "ipr", "iprDe", "NIVELES_IPR", "nivelIPR", "zonaMatriz", "prioridad", "matriz"] }
  };
  // ¿Está el motor y es de la versión esperada? Devuelve "" si está bien o el problema explicado.
  function comprobarMotor(k, M) {
    const m = MOTORES[k];
    if (!M) return `No se ha podido cargar el motor de ${m.nombre}.`;
    if (M.MOTOR !== m.motor) return `El motor de ${m.nombre} es de otra versión (${M.MOTOR == null ? "sin número" : M.MOTOR}; esta app necesita la ${m.motor}).`;
    const faltan = m.usa.filter(f => !(f in M));
    return faltan.length ? `Al motor de ${m.nombre} le falta: ${faltan.join(", ")}.` : "";
  }

  function crear(LF, LA) {
    if (!LF) throw new Error("Falta el motor de Flujograma");
    const { lleno, corto, normal, plural, listaY, sinTildes } = LF;

    const URL_AMFE = "https://cjgaland.github.io/amfe/";
    const URL_FLUJO = "https://cjgaland.github.io/flujograma/";
    const URL_AUD = "https://cjgaland.github.io/auditorias/";
    const URL_IND = "https://cjgaland.github.io/indicadores-calidad/";
    const URL_TM = "https://cjgaland.github.io/tamano-muestral/";
    const URL_DAFO = "https://cjgaland.github.io/dafo/";
    const VERSION_DATOS = 1;

    // ---------- Fases y pasos del asistente ----------
    const FASES = [
      { k: "A", nom: "Conocer el proceso", pasos: [1, 2, 3, 4] },
      { k: "B", nom: "Analizar los riesgos", pasos: [5, 6, 7] },
      { k: "C", nom: "Mejorar", pasos: [8] },
      { k: "D", nom: "Representar y cerrar", pasos: [9, 10] }
    ];
    const PASOS = [
      { n: 1, fase: "A", corto: "Proceso", titulo: "El proceso", que: "Qué proceso analizáis, para qué sirve, dónde empieza y dónde acaba. O tráelo de Flujograma o de AMFE.", entrega: 1 },
      { n: 2, fase: "A", corto: "Subprocesos", titulo: "Subprocesos", que: "En qué fases se divide el proceso: cada una con su inicio, su fin y quién interviene.", entrega: 1 },
      { n: 3, fase: "A", corto: "Flujograma", titulo: "Flujograma", que: "Los pasos del proceso, quién los hace y en qué orden. La app dibuja el flujograma.", entrega: 1 },
      { n: 4, fase: "A", corto: "Puntos críticos", titulo: "Puntos críticos", que: "Dónde puede fallar el proceso, subproceso a subproceso. Serán los modos de fallo del AMFE.", entrega: 1 },
      { n: 5, fase: "B", corto: "Equipo", titulo: "Equipo y sesiones", que: "Quién hace el análisis, en cuántas sesiones y con qué técnicas.", entrega: 2 },
      { n: 6, fase: "B", corto: "Fallos", titulo: "Fallos: modo, efecto y causa", que: "Cada fallo con su efecto, su causa y los controles que ya existen (el AMFE).", entrega: 2 },
      { n: 7, fase: "B", corto: "Priorizar", titulo: "Puntuar y priorizar", que: "Gravedad, ocurrencia y detección, IPR, los fallos prioritarios y la matriz de riesgos.", entrega: 2 },
      { n: 8, fase: "C", corto: "Acciones", titulo: "Acciones de mejora", que: "Qué se hace con cada fallo prioritario (5W1H), con su indicador.", entrega: 3 },
      { n: 9, fase: "D", corto: "Mapa", titulo: "El mapa", que: "El flujograma con los fallos encima, coloreados por su IPR, dentro del marco de procesos.", entrega: 3 },
      { n: 10, fase: "D", corto: "Documento", titulo: "Documento final", que: "Conclusiones, control documental y el Documento Final en Word y PDF. Y llevarlo a Auditorías.", entrega: 4 }
    ];

    // ---------- Fábricas ----------
    // Un mapa = un flujograma del motor + lo propio del mapa
    function nuevoMapa(id, fecha) {
      return Object.assign(LF.nuevoFlujo(id, fecha), { ambito: "", descripcion: "", origen: nuevoOrigen() });
    }
    const nuevoOrigenRef = () => ({ id: "", titulo: "", appVersion: "", traido: "" });
    const nuevoOrigen = () => ({ flujo: nuevoOrigenRef(), amfe: nuevoOrigenRef(), dafo: nuevoOrigenRef() });
    const nuevoSubproceso = (id, color) => LF.nuevoSubproceso(id, color);
    // Punto crítico: el del motor de Flujograma más el subproceso (así puede existir aunque aún no haya flujograma)
    function nuevoPunto(id, num, subprocesoId = "") { return Object.assign(LF.nuevoPunto(id, num), { subprocesoId }); }

    // ---------- Consultas ----------
    const subDe = (m, id) => m.subprocesos.find(s => s.id === id) || null;
    // Subproceso de un punto crítico: el de su paso si está en el flujograma; si no, el suyo
    function subDePunto(m, x) {
      const p = x.pasoId ? LF.pasoDe(m, x.pasoId) : null;
      return (p && subDe(m, p.subprocesoId)) || subDe(m, x.subprocesoId) || null;
    }
    // Número del punto crítico dentro de su subproceso, como la tabla 4.1 del documento («2.3» = subproceso 2, punto 3)
    function idPunto(m, x) {
      const s = subDePunto(m, x); if (!s) return "–." + x.num;
      const l = puntosDeSub(m, s.id);
      return `${m.subprocesos.indexOf(s) + 1}.${l.indexOf(x) + 1}`;
    }
    function ordenPuntos(m) {
      const orden = new Map(m.pasos.map((p, i) => [p.id, i]));
      return m.puntos.slice().sort((a, b) => (orden.get(a.pasoId) ?? 1e9) - (orden.get(b.pasoId) ?? 1e9) || a.num - b.num);
    }
    // Dentro de cada subproceso, en el orden en que se añadieron (como la tabla del ejercicio 8)
    const puntosDeSub = (m, sid) => m.puntos.filter(x => { const s = subDePunto(m, x); return s && s.id === sid; }).sort((a, b) => a.num - b.num);
    // Tabla del ejercicio 8: puntos críticos agrupados por subproceso, en el orden del proceso
    function puntosPorSub(m) {
      const g = m.subprocesos.map(s => ({ sub: s, puntos: puntosDeSub(m, s.id) }));
      const resto = ordenPuntos(m).filter(x => !subDePunto(m, x));
      if (resto.length) g.push({ sub: null, puntos: resto });
      return g;
    }

    // ---------- Avisos (cada uno: nivel error | warn | nota, texto, y paso o punto si es de uno) ----------
    const PARECE_UNIDAD = /^(servicio|unidad|ugc|area|planta|urgencias|uci|quirofano|hospital|centro de salud|consulta)s?( de [a-z ]+)?$/;
    function avisosProceso(m) {
      const r = LF.avisosProceso(m).map(a => Object.assign({}, a, { texto: a.texto.replace("que vais a dibujar", "que vais a analizar") }));
      if (lleno(m.proceso) && PARECE_UNIDAD.test(normal(m.proceso)))
        r.push({ nivel: "warn", texto: `«${corto(m.proceso, 40)}» parece el nombre de una unidad, no de un proceso. Un proceso es lo que se hace: «Atención integral en el Servicio de Urgencias», «Administración de medicación en planta».` });
      if (lleno(m.proceso) && !lleno(m.incluye) && !lleno(m.excluye)) r.push({ nivel: "nota", texto: "Di qué queda dentro y qué fuera (el alcance): evita que el análisis crezca sin control." });
      return r;
    }
    function avisosSubprocesos(m) {
      const r = [], S = m.subprocesos;
      if (!S.length) r.push({ nivel: "warn", texto: "Divide el proceso en subprocesos: fases con su inicio, su fin y quién interviene (como el ejercicio 6). Así el análisis se hace por partes." });
      else if (S.length === 1) r.push({ nivel: "warn", texto: "Solo hay un subproceso. Seguramente es demasiado grande: divídelo en fases (de 3 a 8 suele ir bien)." });
      if (S.length > 10) r.push({ nivel: "warn", texto: `Hay ${S.length} subprocesos: demasiado detalle. ¿Podéis agrupar algunos?` });
      S.forEach((s, i) => {
        const nom = lleno(s.nombre) ? `«${corto(s.nombre, 50)}»` : `nº ${i + 1}`;
        if (!lleno(s.nombre)) r.push({ nivel: "warn", sub: s.id, texto: `El subproceso nº ${i + 1} no tiene nombre.` });
        if (!lleno(s.inicio) || !lleno(s.fin)) r.push({ nivel: "nota", sub: s.id, texto: `Al subproceso ${nom} le falta dónde empieza o dónde acaba.` });
        if (!lleno(s.roles)) r.push({ nivel: "nota", sub: s.id, texto: `El subproceso ${nom} no dice quién interviene. Te servirá para formar el equipo y para las calles del flujograma.` });
      });
      const nombres = new Map(); S.filter(s => lleno(s.nombre)).forEach(s => { const n = normal(s.nombre); nombres.set(n, (nombres.get(n) || 0) + 1); });
      [...nombres].filter(([, c]) => c > 1).forEach(([n]) => r.push({ nivel: "warn", texto: `El subproceso «${S.find(s => normal(s.nombre) === n).nombre}» está repetido.` }));
      return r;
    }
    // Paso 3: los avisos del motor de Flujograma (actores y pasos) tal cual
    function avisosFlujo(m) {
      const A = LF.avisosActores(m).filter(a => !/subproceso/i.test(a.texto) || a.k === "roles");
      return [...A, ...LF.avisosPasos(m)];
    }
    // Paso 4: puntos críticos (propios: pueden existir sin flujograma)
    const EFECTO_RE = /^(da[nñ]o|lesi[oó]n|muerte|fallecimiento|empeoramiento|insatisfacci[oó]n|ansiedad|reclamaci[oó]n)/;
    const SOLUCION_RE = /^(implantar|implementar|establecer|crear|elaborar|formar|formacion|revisar el protocolo|instalar|comprar|contratar|reforzar|mejorar|dotar|disenar|incluir|configurar|activar)\b/;
    function avisosPuntos(m) {
      const r = [];
      if (!m.subprocesos.length && !m.pasos.length) return [{ nivel: "nota", texto: "Primero describe los subprocesos (paso 2): los puntos críticos se buscan subproceso a subproceso." }];
      if (!m.puntos.length) r.push({ nivel: "nota", texto: "Aún no hay puntos críticos. Revisa las propuestas o añade uno en cada subproceso." });
      m.puntos.forEach(x => {
        const etq = `El punto crítico nº ${x.num}`;
        if (!lleno(x.titulo)) r.push({ nivel: "warn", punto: x.id, texto: `${etq} no tiene título: ¿qué puede salir mal?` });
        if (!subDePunto(m, x)) r.push({ nivel: "warn", punto: x.id, texto: `${etq} no está en ningún subproceso.` });
        if (lleno(x.titulo) && !lleno(x.descripcion)) r.push({ nivel: "nota", punto: x.id, texto: `${etq}: describe brevemente el error o el riesgo (como en la tabla del ejercicio 8).` });
        const t = sinTildes(x.titulo);
        if (EFECTO_RE.test(t)) r.push({ nivel: "nota", punto: x.id, texto: `${etq} parece un efecto («${corto(x.titulo, 40)}»). Un punto crítico es lo que puede salir mal; el daño es su consecuencia (irá en «efecto» del AMFE).` });
        if (SOLUCION_RE.test(t)) r.push({ nivel: "warn", punto: x.id, texto: `${etq} parece una solución («${corto(x.titulo, 40)}»), no un fallo. Escribe lo que puede salir mal; la solución irá en las acciones de mejora (paso 8).` });
        if (m.pasos.length && !x.pasoId) r.push({ nivel: "nota", punto: x.id, texto: `${etq} no está colocado en ningún paso del flujograma. Colócalo: el mapa sabrá dónde poner sus fallos.` });
      });
      m.subprocesos.forEach(s => { if (m.puntos.length && !puntosDeSub(m, s.id).length) r.push({ nivel: "nota", texto: `El subproceso «${corto(s.nombre || "sin nombre", 40)}» no tiene ningún punto crítico. ¿De verdad no puede fallar nada en él?` }); });
      const vistos = new Map(); m.puntos.filter(x => lleno(x.titulo)).forEach(x => { const n = normal(x.titulo); if (vistos.has(n)) r.push({ nivel: "nota", punto: x.id, texto: `El punto crítico nº ${x.num} repite el nº ${vistos.get(n).num}. Si son el mismo riesgo en dos subprocesos, está bien; si no, únelos.` }); else vistos.set(n, x); });
      return r;
    }
    const AVISOS = { 1: avisosProceso, 2: avisosSubprocesos, 3: avisosFlujo, 4: avisosPuntos };
    const avisosDe = (m, n) => (AVISOS[n] || (() => []))(m);

    // ---------- Progreso y «tu siguiente paso» ----------
    function progreso(m) {
      const pf = LF.progreso(m);
      return {
        1: lleno(m.proceso) && lleno(m.inicio) && lleno(m.fin),
        2: m.subprocesos.filter(s => lleno(s.nombre)).length >= 2,
        3: pf[3] && lleno(m.validado),
        4: m.puntos.some(x => lleno(x.titulo)) && m.puntos.every(x => lleno(x.titulo) && subDePunto(m, x)),
        5: false, 6: false, 7: false, 8: false, 9: false, 10: false
      };
    }
    function pasoPendiente(m, entrega) {
      const g = progreso(m);
      return PASOS.filter(p => p.entrega <= entrega).find(p => !g[p.n]) || null;
    }
    const TEXTO_PASO = {
      1: m => lleno(m.proceso) ? `escribe dónde empieza y dónde acaba «${corto(m.proceso, 50)}».` : "describe el proceso: nombre, dónde empieza y dónde acaba. O tráelo de Flujograma.",
      2: () => "divide el proceso en subprocesos, cada uno con su inicio, su fin y quién interviene.",
      3: m => !m.pasos.length ? "escribe los pasos del proceso (o pega una lista): la app dibuja el flujograma." : LF.errores(m).length ? "corrige los errores del flujograma (en rojo)." : "revisa el flujograma con el equipo y márcalo como validado.",
      4: m => m.puntos.length ? "completa los puntos críticos: cada uno con su título, su descripción y su subproceso." : "busca los puntos críticos: dónde puede fallar cada subproceso. La app te propone dónde mirar."
    };
    function siguientePaso(datos, entrega) {
      const L = datos.mapas;
      if (!L.length) return { k: "crear", texto: "Empieza tu primer mapa de riesgos: elige un proceso de tu unidad. La app te guía paso a paso hasta el documento final.", href: "#/mapa/nuevo", btn: "Crear un mapa de riesgos" };
      const m = L.slice().sort((x, y) => String(y.modificado).localeCompare(String(x.modificado)))[0];
      const p = pasoPendiente(m, entrega), nom = corto(m.titulo || m.proceso || "tu mapa", 50);
      if (p && TEXTO_PASO[p.n]) return { k: "paso" + p.n, texto: `«${nom}»: ${TEXTO_PASO[p.n](m)}`, href: `#/mapa/${m.id}/${p.n}`, btn: `Ir al paso ${p.n}` };
      return { k: "listo", texto: `«${nom}» ya tiene el proceso, sus subprocesos, el flujograma y los puntos críticos. El análisis AMFE (pasos 5 a 7) llegará en la próxima versión; mientras, puedes hacerlo en la app AMFE.`, href: `#/mapa/${m.id}/4`, btn: "Ver los puntos críticos" };
    }
    function resumen(m) {
      const r = LF.resumen(m);
      return Object.assign(r, { subprocesos: m.subprocesos.filter(s => lleno(s.nombre)).length, puntos: m.puntos.length });
    }

    // ---------- Puntos críticos ----------
    // Propuestas: las del motor de Flujograma (traspasos, decisiones, palabras de riesgo) sobre el flujograma
    const propuestas = m => m.pasos.length ? LF.propuestasPuntos(m) : [];
    function aceptarPropuesta(m, prop, genId) {
      const x = LF.aceptarPropuesta(m, prop, genId), p = LF.pasoDe(m, x.pasoId);
      x.subprocesoId = p ? p.subprocesoId : "";
      return x;
    }
    function anadirPunto(m, genId, subprocesoId, pasoId = "") {
      const p = pasoId ? LF.pasoDe(m, pasoId) : null;
      const x = nuevoPunto(genId(), LF.siguienteNum(m.puntos), (p && p.subprocesoId) || subprocesoId || "");
      x.pasoId = p ? p.id : "";
      m.puntos.push(x); return x;
    }
    // Al colocar un punto en un paso, toma el subproceso del paso
    function colocarPunto(m, x, pasoId) {
      const p = pasoId ? LF.pasoDe(m, pasoId) : null;
      x.pasoId = p ? p.id : "";
      if (p && p.subprocesoId) x.subprocesoId = p.subprocesoId;
    }

    // ---------- «Traer de Flujograma» (paquete «flujograma-procesos» v1, ver ECOSISTEMA.md, sección 4) ----------
    // Acepta el paquete de localStorage["flujograma-intercambio"] o la copia .json de la app Flujograma (clave «intercambio»)
    function leerFlujograma(o) {
      if (!o || typeof o !== "object") return null;
      const p = o.formato ? o : o.intercambio, l = LF.leerIntercambio(p);
      // Cada flujograma lleva la versión de la app que lo generó (se anota en el origen)
      return l && l.map(x => Object.assign({}, x, { appVersion: String(p.appVersion || "").slice(0, 20) }));
    }
    const resumenFlujo = x => `${x.proceso || x.titulo || "Flujograma sin nombre"} · ${plural((x.pasos || []).length, "paso", "pasos")} · ${plural((x.subprocesos || []).length, "subproceso", "subprocesos")} · ${plural((x.puntos || []).length, "punto crítico", "puntos críticos")}`;
    // Copia el flujograma traído en el mapa. Lo que ya hay no se borra; si el mapa ya tiene pasos, solo trae lo que falta
    // (proceso, subprocesos) y avisa. Devuelve lo que ha hecho.
    function traerDeFlujograma(m, fl, genId, appVersion, hoy) {
      const hecho = { proceso: false, subprocesos: 0, actores: 0, pasos: 0, puntos: 0, marco: false, pasosOmitidos: false };
      const t = (v, n) => String(v == null ? "" : v).slice(0, n);
      ["proceso", "titulo", "unidad", "objetivo", "inicio", "fin"].forEach(k => { if (!lleno(m[k]) && lleno(fl[k])) { m[k] = t(fl[k], k === "objetivo" ? 2000 : 300); hecho.proceso = true; } });
      // Subprocesos: se emparejan por origen o por nombre; los que faltan se crean
      const mapaSub = new Map();
      (fl.subprocesos || []).slice().sort((a, b) => (a.orden || 0) - (b.orden || 0)).forEach(x => {
        let s = m.subprocesos.find(y => (y.origenApp === "flujograma" && y.origenId === x.id) || (lleno(x.nombre) && normal(y.nombre) === normal(x.nombre)));
        if (!s) {
          s = nuevoSubproceso(genId(), LF.colorLibre(m));
          Object.assign(s, { nombre: t(x.nombre, 200), descripcion: t(x.descripcion, 1000), inicio: t(x.inicio, 300), fin: t(x.fin, 300), roles: t(x.roles, 500) });
          m.subprocesos.push(s); hecho.subprocesos++;
        }
        if (!s.origenApp) { s.origenApp = "flujograma"; s.origenId = t(x.id, 60); }
        mapaSub.set(x.id, s.id);
      });
      if (m.pasos.length) hecho.pasosOmitidos = true;
      else {
        const mapaAct = new Map();
        (fl.actores || []).slice().sort((a, b) => (a.orden || 0) - (b.orden || 0)).forEach(x => {
          let a = LF.buscaActor(m, x.nombre);
          if (!a) { a = LF.nuevoActor(genId(), t(x.nombre, 100)); m.actores.push(a); hecho.actores++; }
          mapaAct.set(x.id, a.id);
        });
        const mapaPaso = new Map((fl.pasos || []).map(x => [x.id, genId()]));
        (fl.pasos || []).forEach(x => {
          const p = LF.nuevoPaso(mapaPaso.get(x.id), Number(x.num) || LF.siguienteNum(m.pasos), LF.ORDEN_TIPOS.includes(x.tipo) ? x.tipo : "actividad");
          p.texto = t(x.texto, 300); p.actorId = mapaAct.get(x.actorId) || ""; p.subprocesoId = mapaSub.get(x.subprocesoId) || "";
          p.siguientes = (x.siguientes || []).filter(s => mapaPaso.has(s.a)).slice(0, 8).map(s => LF.nuevaFlecha(mapaPaso.get(s.a), ["si", "no"].includes(s.etiqueta) ? s.etiqueta : t(s.etiqueta, 30), s.estilo === "idavuelta" ? "idavuelta" : "normal"));
          p.con = mapaPaso.get(x.con) || "";
          m.pasos.push(p); hecho.pasos++;
        });
        (fl.puntos || []).forEach(x => {
          const pt = nuevoPunto(genId(), LF.siguienteNum(m.puntos), mapaSub.get(x.subprocesoId) || "");
          Object.assign(pt, { pasoId: mapaPaso.get(x.pasoId) || "", titulo: t(x.titulo, 300), descripcion: t(x.descripcion, 1500), fallos: (x.fallos || []).map(String).slice(0, 40), origen: "manual" });
          colocarPunto(m, pt, pt.pasoId);
          m.puntos.push(pt); hecho.puntos++;
        });
        const d = fl.dibujo || {};
        if (d.marco && !m.marco.estrategicos.length && !m.marco.soporte.length) {
          const cajas = k => (d.marco[k] && d.marco[k].cajas || []).map(c => t(c.texto, 120)).filter(lleno);
          m.marco = { estrategicos: cajas("estrategicos").slice(0, 12), soporte: cajas("soporte").slice(0, 16) };
          m.vista.marco = true; hecho.marco = true;
        }
        if (d.orientacion === "horizontal") m.vista.orientacion = "horizontal";
        if (lleno(fl.validado)) m.validado = t(fl.validado, 40);
      }
      m.origen.flujo = { id: t(fl.id, 60), titulo: t(fl.proceso || fl.titulo, 300), appVersion: t(appVersion, 20), traido: t(hoy, 10) };
      return hecho;
    }

    // ---------- Saneado (lo que se carga o se importa nunca se usa sin pasar por aquí) ----------
    const idValido = v => typeof v === "string" && /^[a-z0-9-]{1,40}$/i.test(v);
    const txt = (v, max) => (typeof v === "string" || typeof v === "number") ? String(v).slice(0, max) : "";
    function sanearOrigenRef(o) {
      const r = nuevoOrigenRef(); if (!o || typeof o !== "object") return r;
      Object.keys(r).forEach(k => { r[k] = txt(o[k], k === "titulo" ? 300 : 60); });
      return r;
    }
    // La parte de flujograma la sanea el motor de Flujograma; aquí, lo propio del mapa
    function sanearMapa(o, genId, fecha) {
      if (!o || typeof o !== "object" || Array.isArray(o)) return null;
      const m = LF.sanearFlujo(o, genId, fecha); if (!m) return null;
      m.ambito = txt(o.ambito, 300); m.descripcion = txt(o.descripcion, 3000);
      const og = o.origen && typeof o.origen === "object" ? o.origen : {};
      m.origen = { flujo: sanearOrigenRef(og.flujo), amfe: sanearOrigenRef(og.amfe), dafo: sanearOrigenRef(og.dafo) };
      // El motor no conoce el subproceso propio de cada punto crítico: se recupera del original
      const subs = new Set(m.subprocesos.map(s => s.id)), orig = new Map((Array.isArray(o.puntos) ? o.puntos : []).filter(x => x && idValido(x.id)).map(x => [x.id, x]));
      m.puntos.forEach(x => {
        const y = orig.get(x.id), s = y && idValido(y.subprocesoId) && subs.has(y.subprocesoId) ? y.subprocesoId : "";
        const p = x.pasoId ? LF.pasoDe(m, x.pasoId) : null;
        x.subprocesoId = (p && p.subprocesoId) || s;
      });
      return m;
    }
    function sanearDatos(o, genId, fecha) {
      if (!o || typeof o !== "object" || !Array.isArray(o.mapas)) return null;
      return { mapas: o.mapas.slice(0, 200).map(x => sanearMapa(x, genId, fecha)).filter(Boolean) };
    }
    // Fusiona sin duplicar: si un id ya existe se conserva el más reciente (así se trabaja en equipo)
    function fusionar(actual, nuevo) {
      const m = new Map(actual.mapas.map(x => [x.id, x]));
      nuevo.mapas.forEach(x => { const y = m.get(x.id); if (!y || String(x.modificado) > String(y.modificado)) m.set(x.id, x); });
      return { mapas: Array.from(m.values()) };
    }
    // Ids nuevos para todo (copiar un ejemplo o duplicar), con las referencias rehechas
    function renovarIds(c, genId) {
      const mp = new Map(), nuevo = id => { if (!id) return id; if (!mp.has(id)) mp.set(id, genId()); return mp.get(id); };
      c.id = genId();
      c.actores.forEach(a => { a.id = nuevo(a.id); }); c.subprocesos.forEach(s => { s.id = nuevo(s.id); });
      c.pasos.forEach(p => { p.id = nuevo(p.id); });
      c.pasos.forEach(p => { p.actorId = nuevo(p.actorId); p.subprocesoId = nuevo(p.subprocesoId); p.con = nuevo(p.con); p.siguientes.forEach(s => { s.a = nuevo(s.a); }); p.ajuste.lado = nuevo(p.ajuste.lado); });
      c.puntos.forEach(x => { x.id = genId(); x.pasoId = nuevo(x.pasoId); x.subprocesoId = nuevo(x.subprocesoId); });
      // Las claves de las propuestas («tras:idA:idB», «dec:id», «pal:id») llevan ids de pasos
      const clave = k => String(k || "").split(":").map((y, i) => i && mp.has(y) ? mp.get(y) : y).join(":");
      c.puntos.forEach(x => { x.clave = x.clave ? clave(x.clave) : ""; });
      c.descartes = (c.descartes || []).map(clave);
      c.anteriorId = "";
      return c;
    }
    const sugerirObjetivo = m => LF.sugerirObjetivo(m).replace("sin pérdidas de información entre profesionales", "minimizando los riesgos para el paciente");

    return {
      VERSION_DATOS, MOTORES, comprobarMotor, URL_AMFE, URL_FLUJO, URL_AUD, URL_IND, URL_TM, URL_DAFO,
      lleno, corto, normal, plural, listaY, sinTildes,
      FASES, PASOS, nuevoMapa, nuevoSubproceso, nuevoPunto,
      subDe, subDePunto, idPunto, ordenPuntos, puntosDeSub, puntosPorSub,
      avisosProceso, avisosSubprocesos, avisosFlujo, avisosPuntos, avisosDe,
      progreso, pasoPendiente, siguientePaso, resumen,
      propuestas, aceptarPropuesta, anadirPunto, colocarPunto,
      leerFlujograma, resumenFlujo, traerDeFlujograma,
      sanearMapa, sanearDatos, fusionar, renovarIds, sugerirObjetivo,
      LF, LA
    };
  }

  if (typeof module !== "undefined" && module.exports) module.exports = { crear, MOTORES, comprobarMotor };
  else {
    raiz.LogicaMapa = { crear, MOTORES, comprobarMotor };
    // Problemas con los motores (la app los muestra en lugar de calcular mal)
    raiz.MOTORES_PROBLEMAS = { flujo: comprobarMotor("flujo", raiz.LogicaFlujo), amfe: comprobarMotor("amfe", raiz.LogicaAmfe) };
    try { raiz.Logica = raiz.MOTORES_PROBLEMAS.flujo ? null : crear(raiz.LogicaFlujo, raiz.LogicaAmfe); } catch (e) { raiz.Logica = null; }
  }
})(typeof window !== "undefined" ? window : this);
