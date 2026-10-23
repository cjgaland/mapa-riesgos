// ============================================================
//  logic.js — Lógica PURA (sin DOM) · Mapa de Riesgos
//  NO repite el código de AMFE ni de Flujograma (decisión del autor): usa en vivo
//  su motor, que la página carga antes que este archivo:
//    ../amfe/logic.js        → window.LogicaAmfe
//    ../flujograma/logic.js  → window.LogicaFlujo
//  Un mapa ES un flujograma (mismos campos que en Flujograma: proceso, actores,
//  subprocesos, pasos, puntos críticos, vista, marco…) con los campos propios del
//  mapa añadidos. Así las funciones del motor de Flujograma se usan tal cual
//  (avisosPasos, disponer, dibujar, propuestasPuntos…). Y lleva también los
//  campos de un AMFE de la app AMFE (equipo, sesiones, fallos, escalas,
//  prioridad…), así que las funciones del motor de AMFE (prioridad, matriz,
//  avisosFallos…) también lo reciben tal cual: un mapa es a la vez un
//  flujograma y un AMFE.
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
      usa: ["ESCALAS_CURSO", "ESCALA_NOM", "TRAMOS", "tramo", "entero1a10", "ipr", "iprDe", "NIVELES_IPR", "nivelIPR", "ZONAS", "zonaMatriz",
        "ordenarFallos", "puestos", "prioridad", "prioritarios", "nPrioridad", "sugerirMotivo", "matriz", "porSubproceso", "resumen", "progreso",
        "ROLES", "PERFILES_SUG", "SESIONES_TIPO", "estamentoDe", "nuevoAmfe", "nuevoMiembro", "nuevaSesion", "nuevoFallo", "siguienteNum",
        "tipoRedaccion", "avisosEquipo", "avisosFallos", "avisosPuntuar", "avisosPriorizar", "avisosMejorar",
        "TIPOS_ACCION", "CLASES_ACCION", "ACTUA", "ESTADOS_ACCION", "nuevaAccion", "fuerzaMedida", "accionCompleta", "iprResidual", "resumenMejora",
        "parsearTabla", "incorporarFilas", "sanearAmfe", "leerIntercambio", "paqueteIntercambio"] }
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
      return Object.assign(LF.nuevoFlujo(id, fecha), camposAmfe(), { ambito: "", descripcion: "", origen: nuevoOrigen(), metodologia: nuevaMetodologia() });
    }
    // Los campos de un AMFE (los mismos que crea el motor de AMFE en nuevoAmfe)
    function camposAmfe() {
      const a = LA ? LA.nuevoAmfe("x", "") : null;
      return { equipo: [], sesiones: [], fallos: [], escalas: a ? a.escalas : { g: [], o: [], d: [] }, prioridad: a ? a.prioridad : { modo: "top", n: "15", umbral: "200" },
        introduccion: "", conclusiones: "", proxRevision: "", ideas: [], bloques: [], tgn: a ? a.tgn : { modo: "321", votos: [] } };
    }
    const nuevaMetodologia = () => ({ tecnicas: [], texto: "" });
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
    const AVISOS = { 1: avisosProceso, 2: avisosSubprocesos, 3: avisosFlujo, 4: avisosPuntos, 5: m => avisosEquipo(m), 6: m => avisosFallos(m), 7: m => avisosAnalisis(m) };
    const avisosDe = (m, n) => (AVISOS[n] || (() => []))(m);

    // ---------- Progreso y «tu siguiente paso» ----------
    function progreso(m) {
      const pf = LF.progreso(m), pa = LA ? LA.progreso(m) : null;
      return {
        1: lleno(m.proceso) && lleno(m.inicio) && lleno(m.fin),
        2: m.subprocesos.filter(s => lleno(s.nombre)).length >= 2,
        3: pf[3] && lleno(m.validado),
        4: m.puntos.some(x => lleno(x.titulo)) && m.puntos.every(x => lleno(x.titulo) && subDePunto(m, x)),
        5: !!pa && pa[2],
        6: !!pa && pa[4],
        7: !!pa && pa[5] && pa[6],
        8: false, 9: false, 10: false
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
      4: m => m.puntos.length ? "completa los puntos críticos: cada uno con su título, su descripción y su subproceso." : "busca los puntos críticos: dónde puede fallar cada subproceso. La app te propone dónde mirar.",
      5: () => "forma el equipo que hará el análisis (al menos 6 perfiles) y planifica las sesiones.",
      6: m => !m.fallos.length && m.puntos.length ? "pasa los puntos críticos al AMFE y escribe el efecto y la causa de cada fallo." : "completa los fallos: cada uno en su subproceso, con su efecto, su causa y los controles actuales.",
      7: m => m.fallos.some(f => lleno(f.fallo) && !(LA && LA.iprDe(f))) ? "puntúa la gravedad, la ocurrencia y la detección de cada fallo." : "revisa los fallos prioritarios y la matriz de riesgos; escribe el motivo de los que cambiéis a mano."
    };
    function siguientePaso(datos, entrega) {
      const L = datos.mapas;
      if (!L.length) return { k: "crear", texto: "Empieza tu primer mapa de riesgos: elige un proceso de tu unidad. La app te guía paso a paso hasta el documento final.", href: "#/mapa/nuevo", btn: "Crear un mapa de riesgos" };
      const m = L.slice().sort((x, y) => String(y.modificado).localeCompare(String(x.modificado)))[0];
      const p = pasoPendiente(m, entrega), nom = corto(m.titulo || m.proceso || "tu mapa", 50);
      if (p && TEXTO_PASO[p.n]) return { k: "paso" + p.n, texto: `«${nom}»: ${TEXTO_PASO[p.n](m)}`, href: `#/mapa/${m.id}/${p.n}`, btn: `Ir al paso ${p.n}` };
      return { k: "listo", texto: entrega >= 2 ? `«${nom}» ya tiene el proceso, el flujograma, los puntos críticos y el AMFE con sus fallos priorizados. Las acciones de mejora y el mapa llegarán en la próxima versión.` : `«${nom}» ya tiene el proceso, sus subprocesos, el flujograma y los puntos críticos.`, href: `#/mapa/${m.id}/${entrega >= 2 ? 7 : 4}`, btn: entrega >= 2 ? "Ver la priorización" : "Ver los puntos críticos" };
    }
    function resumen(m) {
      const r = LF.resumen(m), F = m.fallos.filter(f => lleno(f.fallo));
      return Object.assign(r, { subprocesos: m.subprocesos.filter(s => lleno(s.nombre)).length, puntos: m.puntos.length,
        equipo: m.equipo.filter(x => lleno(x.perfil)).length, fallos: F.length, puntuados: LA ? F.filter(LA.iprDe).length : 0, prioritarios: LA && F.length ? LA.prioritarios(m).length : 0,
        maxIPR: LA ? F.reduce((x, f) => Math.max(x, LA.iprDe(f) || 0), 0) : 0 });
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

    // ¿Dos nombres dicen lo mismo? Iguales, o con al menos el 60 % de sus palabras con contenido en común
    // («Comunicación de resultados y decisión clínica» ≈ «… y decisión final»; «térmico/ambiental» ≈ «térmico o ambiental»)
    const palabras = s => new Set(normal(s).split(" ").filter(w => w.length > 3));
    function parecido(a, b) {
      if (!lleno(a) || !lleno(b)) return false;
      if (normal(a) === normal(b)) return true;
      const x = palabras(a), y = palabras(b); if (!x.size || !y.size) return false;
      const comunes = [...x].filter(w => y.has(w)).length;
      return comunes / (x.size + y.size - comunes) >= 0.6;
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
        let s = m.subprocesos.find(y => y.origenApp === "flujograma" && y.origenId === x.id) || m.subprocesos.find(y => parecido(y.nombre, x.nombre));
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

    // ---------- El AMFE dentro del mapa (pasos 5 a 7, motor de AMFE) ----------
    const sinPaso = l => l.map(a => { const r = Object.assign({}, a); delete r.paso; return r; });
    const avisosEquipo = m => LA ? sinPaso(LA.avisosEquipo(m)) : [];
    function avisosFallos(m) {
      if (!LA) return [];
      const r = sinPaso(LA.avisosFallos(m)).filter(a => !/Define primero los subprocesos/.test(a.texto));
      const sinFallo = m.puntos.filter(x => lleno(x.titulo) && !m.fallos.some(f => f.puntoId === x.id));
      if (m.puntos.length && sinFallo.length) r.unshift({ nivel: "nota", k: "puntos", texto: `${sinFallo.length === 1 ? "Un punto crítico no ha pasado" : sinFallo.length + " puntos críticos no han pasado"} al AMFE. Cada punto crítico suele ser, al menos, un modo de fallo.` });
      return r;
    }
    const avisosPuntuar = m => LA ? sinPaso(LA.avisosPuntuar(m)) : [];
    const avisosPriorizar = m => LA ? sinPaso(LA.avisosPriorizar(m)) : [];
    const avisosAnalisis = m => [...avisosPuntuar(m), ...avisosPriorizar(m)];
    // Técnicas para encontrar los fallos (apartado «Metodología empleada» del documento final)
    const TECNICAS = {
      lluvia: "Lluvia de ideas", tgn: "Técnica de grupo nominal", caso: "Análisis de un caso real o simulado", incidentes: "Revisión de incidentes notificados",
      entrevistas: "Entrevistas al personal", observacion: "Observación directa del proceso", ishikawa: "Diagrama de Ishikawa"
    };
    function textoMetodologia(m) {
      const T = m.metodologia.tecnicas.filter(k => TECNICAS[k]).map(k => TECNICAS[k].toLowerCase()), n = m.sesiones.length;
      if (!T.length && !n) return "";
      return `La recogida de fallos se realizó mediante ${T.length ? listaY(T) : "el trabajo del equipo"}${n ? `, en ${plural(n, "sesión de trabajo", "sesiones de trabajo")}` : ""}.`;
    }
    // Paso 4 → paso 6: cada punto crítico pasa a ser un modo de fallo (como entre los ejercicios 8 y 10 del curso)
    function pasarPuntosAlAmfe(m, genId) {
      if (!LA) return 0;
      let n = 0;
      ordenPuntos(m).forEach(x => {
        if (!lleno(x.titulo) || m.fallos.some(f => f.puntoId === x.id)) return;
        const usado = m.fallos.some(f => Number(f.num) === Number(x.num));
        const s = subDePunto(m, x), f = LA.nuevoFallo(genId(), usado ? LA.siguienteNum(m) : x.num);
        Object.assign(f, { subprocesoId: s ? s.id : "", fallo: x.titulo, puntoId: x.id });
        m.fallos.push(f); n++;
      });
      m.fallos.sort((a, b) => a.num - b.num);
      return n;
    }
    const puntoDe = (m, f) => m.puntos.find(x => x.id === f.puntoId) || null;

    // ---------- «Traer de AMFE» (paquete «amfe-fallos» v1, ver ECOSISTEMA.md, sección 4) ----------
    // Acepta el paquete de localStorage["amfe-intercambio"] o la copia .json de la app AMFE (clave «intercambio»)
    function leerAmfe(o) {
      if (!LA || !o || typeof o !== "object") return null;
      const p = o.formato ? o : o.intercambio, l = LA.leerIntercambio(p);
      return l && l.map(x => Object.assign({}, x, { appVersion: String(p.appVersion || "").slice(0, 20) }));
    }
    const resumenAmfe = a => `${a.titulo || a.proceso || "AMFE sin nombre"} · ${plural((a.subprocesos || []).length, "subproceso", "subprocesos")} · ${plural((a.fallos || []).length, "fallo", "fallos")}`;
    // Copia el AMFE traído en el mapa: proceso (si está vacío), subprocesos (emparejados por origen o nombre) y, si el mapa
    // aún no tiene fallos, los fallos con su puntuación, su prioridad, sus acciones y su residual. Lo que ya hay no se borra.
    function traerDeAmfe(m, a, genId, appVersion, hoy) {
      const hecho = { proceso: false, subprocesos: 0, fallos: 0, acciones: 0, enlazados: 0, fallosOmitidos: false };
      const t = (v, n) => String(v == null ? "" : v).slice(0, n), g = v => Number.isInteger(v) && v >= 1 && v <= 10 ? String(v) : "";
      [["proceso", a.proceso || a.titulo], ["unidad", a.unidad]].forEach(([k, v]) => { if (!lleno(m[k]) && lleno(v)) { m[k] = t(v, 300); hecho.proceso = true; } });
      const mapaSub = new Map();
      (a.subprocesos || []).slice().sort((x, y) => (x.orden || 0) - (y.orden || 0)).forEach(x => {
        let s = m.subprocesos.find(y => y.origenApp === "amfe" && y.origenId === x.id) || m.subprocesos.find(y => parecido(y.nombre, x.nombre));
        if (!s) {
          s = nuevoSubproceso(genId(), LF.colorLibre(m));
          Object.assign(s, { nombre: t(x.nombre, 200), inicio: t(x.inicio, 300), fin: t(x.fin, 300), roles: t(x.roles, 500) });
          m.subprocesos.push(s); hecho.subprocesos++;
        }
        if (!s.origenApp) { s.origenApp = "amfe"; s.origenId = t(x.id, 60); }
        mapaSub.set(x.id, s.id);
      });
      if (m.fallos.length) hecho.fallosOmitidos = true;
      else if (LA) {
        const c = a.criterio || {};
        m.prioridad = { modo: c.modo === "umbral" ? "umbral" : "top", n: c.n ? String(c.n) : "15", umbral: c.umbral ? String(c.umbral) : "200" };
        if (a.escalas && typeof a.escalas === "object") ["g", "o", "d"].forEach(k => { if (Array.isArray(a.escalas[k]) && a.escalas[k].length === 5) m.escalas[k] = a.escalas[k].map(x => t(x, 300)); });
        const usados = new Set();
        (a.fallos || []).forEach(x => {
          let num = Number(x.num); if (!Number.isInteger(num) || num < 1 || usados.has(num)) num = Math.max(0, ...usados) + 1; usados.add(num);
          const f = LA.nuevoFallo(genId(), num);
          Object.assign(f, { subprocesoId: mapaSub.get(x.subprocesoId) || "", fallo: t(x.fallo, 1000), efecto: t(x.efecto, 1000), causa: t(x.causa, 1000), controles: t(x.controles, 1000),
            g: g(x.g), o: g(x.o), d: g(x.d), critico: x.critico === true, motivoCritico: x.critico === true ? t(x.motivo, 1000) : "" });
          if (x.prioritario === true && x.motivoPrioridad === "manual") { f.manual = "si"; f.motivo = t(x.motivo, 1000); }
          f._prio = x.prioritario === true;
          f.acciones = (x.acciones || []).slice(0, 20).map(y => {
            const ac = LA.nuevaAccion(genId());
            ["que", "porque", "donde", "plazo", "fin", "quien", "como"].forEach(k => { ac[k] = t(y[k], k === "fin" ? 20 : 1500); });
            if (LA.TIPOS_ACCION[y.tipo]) ac.tipo = y.tipo; if (LA.CLASES_ACCION[y.clase]) ac.clase = y.clase;
            if (Array.isArray(y.actuaSobre)) ac.actuaSobre = y.actuaSobre.filter(k => LA.ACTUA[k]).slice(0, 3);
            if (y.indicador) ["nombre", "formula", "estandar", "fuente"].forEach(k => { ac.indicador[k] = t(y.indicador[k], 500); });
            if (LA.ESTADOS_ACCION[y.estado]) ac.estado = y.estado;
            hecho.acciones++; return ac;
          });
          if (x.residual) Object.assign(f.residual, { g: g(x.residual.g), o: g(x.residual.o), d: g(x.residual.d) });
          // Enlazar con el punto crítico del mismo subproceso que tenga el mismo título
          const pt = m.puntos.find(y => y.subprocesoId === f.subprocesoId && !m.fallos.some(z => z.puntoId === y.id) && parecido(y.titulo, f.fallo));
          if (pt) { f.puntoId = pt.id; hecho.enlazados++; }
          m.fallos.push(f); hecho.fallos++;
        });
        // Lo que el equipo quitó a mano de los prioritarios en AMFE se respeta
        const pr = LA.prioridad(m);
        m.fallos.forEach(f => { if (pr[f.id] && pr[f.id].prio && !f._prio && !f.critico) { f.manual = "no"; f.motivo = f.motivo || "Quitado de los prioritarios en el AMFE de origen."; } delete f._prio; });
      }
      m.origen.amfe = { id: t(a.id, 60), titulo: t(a.titulo || a.proceso, 300), appVersion: t(appVersion, 20), traido: t(hoy, 10) };
      return hecho;
    }

    // ---------- Paquete de intercambio «mapariesgos-mapas» v1 (Diseño, 7.3) ----------
    // Por dentro habla los mismos idiomas que las herramientas: un bloque `amfe` con la forma exacta de «amfe-fallos» v1 y
    // un bloque `flujo` con la de «flujograma-procesos» v1. Añadir campos no sube la versión; quitar o cambiar uno, sí.
    const FORMATO_INTERCAMBIO = "mapariesgos-mapas", VERSION_INTERCAMBIO = 1;
    // Frecuencia de auditoría proporcional al riesgo (la misma regla que el Plan Anual de Auditorías)
    function frecuenciaSugerida(ipr, g) {
      if (!ipr) return "";
      let k = ipr >= 250 ? "trimestral" : ipr >= 150 ? "semestral" : "anual";
      if (k === "anual" && g >= 9) k = "semestral";
      return k;
    }
    function hallazgos(m) {
      if (!LA) return [];
      return LA.prioritarios(m).map(f => {
        const v = LA.iprDe(f), s = subDe(m, f.subprocesoId), a1 = (f.acciones || [])[0], ai = (f.acciones || []).find(x => lleno(x.indicador.nombre)), nv = LA.nivelIPR(v);
        return { num: f.num, falloId: f.id, subproceso: s ? s.nombre : "", fallo: f.fallo, ipr: v, nivel: nv ? nv.k : "", g: Number(f.g) || null, critico: f.critico,
          accion: a1 ? a1.que : "", indicador: ai ? [ai.indicador.nombre, ai.indicador.estandar].filter(lleno).join(" · ") : "", frecuencia: frecuenciaSugerida(v, Number(f.g) || 0),
          motivo: f.critico ? f.motivoCritico : f.motivo || (LA.sugerirMotivo ? LA.sugerirMotivo(m, f) : "") };
      });
    }
    function paqueteIntercambio(mapas, appVersion, fecha) {
      return { formato: FORMATO_INTERCAMBIO, version: VERSION_INTERCAMBIO, app: "mapariesgos", appVersion, generado: fecha,
        mapas: mapas.filter(m => !/^ej-/.test(m.id)).map(m => ({
          id: m.id, titulo: m.titulo || m.proceso, proceso: m.proceso, unidad: m.unidad, fecha: m.fecha, edicion: m.edicion, proxRevision: m.proxRevision || "",
          amfe: LA ? LA.paqueteIntercambio([m], appVersion, fecha).amfes[0] : null,
          flujo: m.pasos.length ? (LF.paqueteIntercambio([m], appVersion, fecha).flujos[0] || null) : null,
          hallazgos: hallazgos(m)
        })) };
    }
    function leerIntercambio(o) {
      const p = o && typeof o === "object" && o.formato ? o : o && o.intercambio;
      if (!p || p.formato !== FORMATO_INTERCAMBIO || p.version !== VERSION_INTERCAMBIO || !Array.isArray(p.mapas)) return null;
      return p.mapas.filter(x => x && typeof x === "object");
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
      // La parte de AMFE la sanea el motor de AMFE (con los mismos subprocesos); si no se ha cargado, se conserva tal cual
      const a = LA ? LA.sanearAmfe(Object.assign({}, o, { subprocesos: m.subprocesos }), genId, fecha) : null, def = camposAmfe();
      Object.keys(def).forEach(k => { m[k] = a ? a[k] : (o[k] !== undefined ? o[k] : def[k]); });
      const mt = o.metodologia && typeof o.metodologia === "object" ? o.metodologia : {};
      m.metodologia = { tecnicas: Array.isArray(mt.tecnicas) ? [...new Set(mt.tecnicas.filter(k => TECNICAS[k]))] : [], texto: txt(mt.texto, 2000) };
      const og = o.origen && typeof o.origen === "object" ? o.origen : {};
      m.origen = { flujo: sanearOrigenRef(og.flujo), amfe: sanearOrigenRef(og.amfe), dafo: sanearOrigenRef(og.dafo) };
      // El motor no conoce el subproceso propio de cada punto crítico: se recupera del original
      const subs = new Set(m.subprocesos.map(s => s.id)), orig = new Map((Array.isArray(o.puntos) ? o.puntos : []).filter(x => x && idValido(x.id)).map(x => [x.id, x]));
      m.puntos.forEach(x => {
        const y = orig.get(x.id), s = y && idValido(y.subprocesoId) && subs.has(y.subprocesoId) ? y.subprocesoId : "";
        const p = x.pasoId ? LF.pasoDe(m, x.pasoId) : null;
        x.subprocesoId = (p && p.subprocesoId) || s;
      });
      // El motor de AMFE no conoce el punto crítico del que salió cada fallo: se recupera del original
      const pts = new Set(m.puntos.map(x => x.id)), origF = new Map((Array.isArray(o.fallos) ? o.fallos : []).filter(x => x && idValido(x.id)).map(x => [x.id, x]));
      m.fallos.forEach(f => { const y = origF.get(f.id); f.puntoId = y && idValido(y.puntoId) && pts.has(y.puntoId) ? y.puntoId : ""; });
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
      c.puntos.forEach(x => { x.id = nuevo(x.id); x.pasoId = nuevo(x.pasoId); x.subprocesoId = nuevo(x.subprocesoId); });
      // Las claves de las propuestas («tras:idA:idB», «dec:id», «pal:id») llevan ids de pasos
      const clave = k => String(k || "").split(":").map((y, i) => i && mp.has(y) ? mp.get(y) : y).join(":");
      c.puntos.forEach(x => { x.clave = x.clave ? clave(x.clave) : ""; });
      c.descartes = (c.descartes || []).map(clave);
      // La parte de AMFE: equipo, sesiones, fallos (con sus acciones, votos e Ishikawa) e ideas
      (c.equipo || []).forEach(x => { x.id = nuevo(x.id); });
      (c.sesiones || []).forEach(x => { x.id = genId(); x.asistentes = x.asistentes.map(nuevo); });
      (c.bloques || []).forEach(x => { x.id = nuevo(x.id); });
      (c.fallos || []).forEach(f => { f.id = nuevo(f.id); });
      (c.fallos || []).forEach(f => {
        f.subprocesoId = nuevo(f.subprocesoId); f.puntoId = nuevo(f.puntoId);
        (f.acciones || []).forEach(x => { x.id = genId(); }); (f.ishikawa || []).forEach(x => { x.id = genId(); });
        (f.votos || []).forEach(v => { v.miembroId = nuevo(v.miembroId); });
      });
      (c.ideas || []).forEach(x => { x.id = genId(); x.subprocesoId = nuevo(x.subprocesoId); x.bloqueId = nuevo(x.bloqueId); x.falloId = nuevo(x.falloId); });
      if (c.tgn) c.tgn.votos.forEach(v => { v.miembroId = nuevo(v.miembroId); v.bloqueId = nuevo(v.bloqueId); });
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
      avisosEquipo, avisosFallos, avisosPuntuar, avisosPriorizar, avisosAnalisis, TECNICAS, textoMetodologia, pasarPuntosAlAmfe, puntoDe,
      leerAmfe, resumenAmfe, traerDeAmfe, FORMATO_INTERCAMBIO, VERSION_INTERCAMBIO, frecuenciaSugerida, hallazgos, paqueteIntercambio, leerIntercambio,
      sanearMapa, sanearDatos, fusionar, renovarIds, sugerirObjetivo, parecido,
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
