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
    flujo: { nombre: "Flujograma", global: "LogicaFlujo", motor: 1, ruta: /*[eco]*/"../flujograma/logic.js"/*[/eco]*//*[ind]"motores/flujograma/logic.js"[/ind]*/,
      usa: ["lleno", "corto", "normal", "plural", "listaY", "sinTildes", "TIPOS", "ORDEN_TIPOS", "ACTORES_SUG", "MARCO_SUG",
        "nuevoFlujo", "nuevoActor", "nuevoSubproceso", "nuevoPaso", "nuevaFlecha", "nuevoPunto", "siguienteNum", "colorLibre",
        "pasoDe", "actorDe", "buscaActor", "sugerirObjetivo", "nuevoControl", "avisosProceso", "avisosActores", "avisosPasos", "errores", "rolesSinCalle",
        "progreso", "resumen", "propuestasPuntos", "aceptarPropuesta", "leerPegado", "incorporarPasos", "insertarDespues", "quitarPaso",
        "cambiarTipo", "ponerSalida", "anadirActores", "disponer", "dibujar", "sanearFlujo", "leerIntercambio", "paqueteIntercambio",
        "NIVELES_IPR", "nivelDeIPR"] },
    amfe: { nombre: "AMFE", global: "LogicaAmfe", motor: 1, ruta: /*[eco]*/"../amfe/logic.js"/*[/eco]*//*[ind]"motores/amfe/logic.js"[/ind]*/,
      usa: ["ESCALAS_CURSO", "ESCALA_NOM", "TRAMOS", "tramo", "entero1a10", "ipr", "iprDe", "NIVELES_IPR", "nivelIPR", "ZONAS", "zonaMatriz",
        "ordenarFallos", "puestos", "prioridad", "prioritarios", "nPrioridad", "sugerirMotivo", "matriz", "porSubproceso", "resumen", "progreso",
        "ROLES", "PERFILES_SUG", "SESIONES_TIPO", "estamentoDe", "nuevoAmfe", "nuevoMiembro", "nuevaSesion", "nuevoFallo", "siguienteNum",
        "tipoRedaccion", "avisosEquipo", "avisosFallos", "avisosPuntuar", "avisosPriorizar", "avisosMejorar",
        "TIPOS_ACCION", "CLASES_ACCION", "ACTUA", "ESTADOS_ACCION", "nuevaAccion", "fuerzaMedida", "accionCompleta", "iprResidual", "resumenMejora",
        "accionesDe", "FUERZAS", "vencida", "COMPROBACION", "cuentaEstado", "sugerirPorque", "indicadoresDe",
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

    // [eco]
    const URL_AMFE = "https://cjgaland.github.io/amfe/";
    const URL_FLUJO = "https://cjgaland.github.io/flujograma/";
    const URL_AUD = "https://cjgaland.github.io/auditorias/";
    const URL_IND = "https://cjgaland.github.io/indicadores-calidad/";
    const URL_TM = "https://cjgaland.github.io/tamano-muestral/";
    const URL_DAFO = "https://cjgaland.github.io/dafo/";
    const URL_RONDAS = "https://cjgaland.github.io/rondas-seguridad/";
    const URL_LC = "https://cjgaland.github.io/lectura-critica/";
    const URL_ACR = "https://cjgaland.github.io/acr-ishikawa/";
    // [/eco]
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
      return Object.assign(LF.nuevoFlujo(id, fecha), camposAmfe(), { control: nuevoControl() }, { ambito: "", descripcion: "", origen: nuevoOrigen(), metodologia: nuevaMetodologia(), vistaMapa: nuevaVistaMapa(), textosMapa: nuevosTextosMapa(), criteriosAcciones: nuevosCriterios() });
    }
    // Control documental con la ubicación de cada persona, como el documento final del curso
    function nuevoControl() { const c = LF.nuevoControl(); ["elaborado", "revisado", "aprobado"].forEach(k => c[k].forEach(x => { x.ubicacion = ""; })); return c; }
    // Paso 9: qué fallos se ven en el mapa, calor por subproceso, título del mapa, orden de la leyenda
    const nuevaVistaMapa = () => ({ mostrar: "prioritarios", calor: false, titulo: "", leyenda: "num", despues: false });
    // Apartados 7.1 a 7.3 del documento final
    const nuevosTextosMapa = () => ({ objetivos: "", estructura: "", interpretacion: "" });
    // Apartado 6.1 del documento final: criterios con los que se han elegido las acciones
    const nuevosCriterios = () => ({ viabilidad: false, impacto: false, cultura: false, medible: false });
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
    const AVISOS = { 1: avisosProceso, 2: avisosSubprocesos, 3: avisosFlujo, 4: avisosPuntos, 5: m => avisosEquipo(m), 6: m => avisosFallos(m), 7: m => avisosAnalisis(m), 8: (m, hoy) => avisosAcciones(m, hoy), 9: m => avisosMapa(m), 10: m => avisosCierre(m) };
    const avisosDe = (m, n, hoy) => (AVISOS[n] || (() => []))(m, hoy);

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
        8: !!pa && pa[7],
        9: !!LA && LA.prioritarios(m).length > 0 && !sinUbicar(m).length && (m.pasos.length > 0 || m.subprocesos.length > 0),
        10: lleno(m.conclusiones) && /^\d{4}-\d{2}-\d{2}$/.test(m.proxRevision || "") && ((m.control.elaborado || []).some(x => lleno(x.cargo) || lleno(x.nombre)))
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
      7: m => m.fallos.some(f => lleno(f.fallo) && !(LA && LA.iprDe(f))) ? "puntúa la gravedad, la ocurrencia y la detección de cada fallo." : "revisa los fallos prioritarios y la matriz de riesgos; escribe el motivo de los que cambiéis a mano.",
      8: m => { const n = LA ? LA.prioritarios(m).filter(f => !LA.accionesDe(f).length).length : 0; return n ? `propón acciones de mejora para ${n === 1 ? "el fallo prioritario que queda" : "los " + n + " fallos prioritarios que quedan"}: qué, por qué, dónde, cuándo, quién y cómo.` : "completa las acciones: cada una con su responsable, su plazo y su indicador."; },
      9: m => sinUbicar(m).length ? "coloca en el mapa los fallos prioritarios que faltan: en qué paso del proceso ocurre cada uno." : "revisa el mapa y descarga la lámina para colgarla o proyectarla.",
      10: () => "escribe las conclusiones, el control documental y la fecha de revisión, y descarga el Documento Final."
    };
    function siguientePaso(datos, entrega) {
      const L = datos.mapas;
      if (!L.length) return { k: "crear", texto: "Empieza tu primer mapa de riesgos: elige un proceso de tu unidad. La app te guía paso a paso hasta el documento final.", href: "#/mapa/nuevo", btn: "Crear un mapa de riesgos" };
      const m = L.slice().sort((x, y) => String(y.modificado).localeCompare(String(x.modificado)))[0];
      const p = pasoPendiente(m, entrega), nom = corto(m.titulo || m.proceso || "tu mapa", 50);
      if (p && TEXTO_PASO[p.n]) return { k: "paso" + p.n, texto: `«${nom}»: ${TEXTO_PASO[p.n](m)}`, href: `#/mapa/${m.id}/${p.n}`, btn: `Ir al paso ${p.n}` };
      if (entrega >= 4) { const d = diasRevision(m); return { k: "listo", texto: d !== null && d <= 30 ? `«${nom}» tiene la revisión ${d < 0 ? "pasada desde el " : "prevista para el "}${fFecha(m.proxRevision)}: crea una edición nueva y revisad el mapa.` : `«${nom}» está completo: el mapa, el documento final y los hallazgos para Auditorías.`, href: `#/mapa/${m.id}/10`, btn: "Ir al documento final" }; }
      if (entrega >= 3) return { k: "listo", texto: `«${nom}» ya tiene el mapa: el flujograma con los fallos prioritarios encima. El documento final llegará en la próxima versión; mientras, descarga la lámina del mapa.`, href: `#/mapa/${m.id}/9`, btn: "Ver el mapa" };
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

    function avisosCierre(m) {
      const r = [], fallan = notaCalidad(m).filter(x => !x.ok);
      if (fallan.length) r.push({ nivel: "nota", texto: `La nota de calidad tiene ${plural(fallan.length, "punto pendiente", "puntos pendientes")}: míralos abajo antes de entregar el documento.` });
      const d = diasRevision(m);
      if (d !== null && d < 0) r.push({ nivel: "warn", texto: `La fecha de revisión (${fFecha(m.proxRevision)}) ya ha pasado: crea una edición nueva para revisar el mapa.` });
      if (LA && prioridadDe(m).some(f => lleno(f.residual.g) && lleno(f.residual.o) && Number(f.residual.g) < Number(f.g))) r.push({ nivel: "nota", texto: "Alguna acción baja la gravedad. Es raro: una acción suele bajar la ocurrencia o mejorar la detección; el daño que causaría el fallo suele ser el mismo." });
      return r;
    }
    // ---------- Paso 8 · Acciones de mejora (motor de AMFE) ----------
    const CRITERIOS_ACCIONES = { viabilidad: "La viabilidad de su implantación", impacto: "El grado de impacto esperado", cultura: "Su alineación con la cultura de seguridad del centro", medible: "La posibilidad de medirlas con indicadores" };
    const hoyIso = () => new Date().toISOString().slice(0, 10);
    // Además de los del motor de AMFE: un subproceso con riesgo alto y ninguna acción, cuando las acciones están en otros (minicaso de Atención Primaria)
    function avisosAcciones(m, hoy = hoyIso()) {
      if (!LA) return [];
      const r = sinPaso(LA.avisosMejorar(m, hoy)), P = LA.prioritarios(m);
      if (P.some(f => LA.accionesDe(f).length)) m.subprocesos.forEach(s => {
        const F = P.filter(f => f.subprocesoId === s.id), max = Math.max(0, ...F.map(f => LA.iprDe(f) || 0));
        if (F.length && max >= 200 && !F.some(f => LA.accionesDe(f).length)) r.push({ nivel: "warn", sub: s.id, texto: `El subproceso «${corto(s.nombre, 50)}» tiene ${plural(F.length, "fallo prioritario", "fallos prioritarios")} (IPR hasta ${max}) y ninguna acción de mejora. Empieza por los riesgos más altos, aunque sean los más difíciles de arreglar.` });
      });
      return r;
    }

    // ---------- Paso 9 · El mapa: los fallos encima del flujograma, coloreados por su IPR ----------
    // Dónde va cada fallo: los pasos que eligió el equipo o, si no eligió, el paso del punto crítico del que sale
    function ubicacion(m, f) {
      const ids = new Set(m.pasos.map(p => p.id)), l = (f.pasos || []).filter(id => ids.has(id));
      if (l.length) return l;
      const x = puntoDe(m, f);
      return x && ids.has(x.pasoId) ? [x.pasoId] : [];
    }
    const enMapa = m => !LA ? [] : m.vistaMapa.mostrar === "todos" ? LA.ordenarFallos(m.fallos.filter(f => lleno(f.fallo) && LA.iprDe(f)), "num") : LA.ordenarFallos(LA.prioritarios(m), "num");
    const nivelDe = f => LF.nivelDeIPR(LA ? LA.iprDe(f) : 0);
    // Mapa «después» (mejora D): el color sale del IPR esperado tras las acciones, si ya se ha vuelto a puntuar
    const iprMapa = (m, f) => !LA ? 0 : m.vistaMapa.despues && LA.iprResidual(f) ? LA.iprResidual(f) : LA.iprDe(f);
    const nivelMapa = (m, f) => LF.nivelDeIPR(iprMapa(m, f));
    const marcaCritico = f => f.critico === true || (LA && (LA.entero1a10(f.g) || 0) >= 9);
    // Sin flujograma (mejora G): un mapa por subprocesos, una caja por subproceso en fila, para no quedarse sin mapa
    function flujoBase(m) {
      if (m.pasos.length) return m;
      const pid = i => "sub-paso-" + i, S = m.subprocesos.filter(s => lleno(s.nombre));
      const pasos = [LF.nuevoPaso("sub-ini", 1, "terminal"), ...S.map((s, i) => LF.nuevoPaso(pid(i), i + 2, "actividad")), LF.nuevoPaso("sub-fin", S.length + 2, "terminal")];
      pasos[0].texto = corto(m.inicio || "Inicio", 40); pasos[pasos.length - 1].texto = corto(m.fin || "Fin", 40);
      S.forEach((s, i) => { pasos[i + 1].texto = s.nombre; pasos[i + 1].subprocesoId = s.id; });
      pasos[0].subprocesoId = S[0] ? S[0].id : ""; pasos[pasos.length - 1].subprocesoId = S.length ? S[S.length - 1].id : "";
      pasos.forEach((p, i) => { if (pasos[i + 1]) p.siguientes = [LF.nuevaFlecha(pasos[i + 1].id)]; });
      const calle = LF.nuevoActor("sub-calle", corto(m.unidad || m.proceso || "Proceso", 40));
      pasos.forEach(p => { if (p.tipo === "actividad") p.actorId = calle.id; });
      return Object.assign({}, m, { pasos, actores: [calle], vista: Object.assign({}, m.vista, { orientacion: "horizontal", subprocesos: true }), sinFlujo: true });
    }
    // En el mapa sin flujograma, cada fallo va en la caja de su subproceso
    function ubicacionMapa(m, b, f) {
      if (!b.sinFlujo) return ubicacion(m, f);
      const p = b.pasos.find(q => q.subprocesoId === f.subprocesoId && q.tipo === "actividad");
      return p ? [p.id] : [];
    }
    // Los fallos del mapa como «puntos críticos» del motor de Flujograma: un aviso por paso con sus números, del color del IPR más alto
    function puntosMapa(m, b = flujoBase(m)) {
      const r = [];
      enMapa(m).forEach(f => ubicacionMapa(m, b, f).forEach(pid => r.push({ id: f.id + "@" + pid, num: f.num, pasoId: pid, titulo: f.fallo, descripcion: "", fallos: [String(f.num)], origen: "manual", clave: "", nivel: nivelMapa(m, f), critico: marcaCritico(f) })));
      return r;
    }
    const COLOR_NIVEL = { muyalto: "#e51400", alto: "#f97316", medio: "#eab308", bajo: "#22c55e" };
    // Calor por subproceso (mejora E): la banda de cada subproceso, del color del IPR más alto de sus fallos
    function calorSub(m) {
      const r = {};
      if (!LA) return r;
      m.subprocesos.forEach(s => { const v = Math.max(0, ...m.fallos.filter(f => f.subprocesoId === s.id).map(f => LA.iprDe(f) || 0)); r[s.id] = { max: v, nivel: LF.nivelDeIPR(v) }; });
      return r;
    }
    function dibujoMapa(m, opc = {}) {
      const b = flujoBase(m);
      const d = LF.dibujar(Object.assign({}, b, { puntos: puntosMapa(m, b), vista: Object.assign({}, b.vista, opc.vista || {}) }), opc.dibujo || {});
      if (m.vistaMapa.calor) { const c = calorSub(m); d.bandas.forEach(x => { const k = c[x.subprocesoId]; if (k && k.nivel) { x.color = COLOR_NIVEL[k.nivel]; x.nombre = `${x.nombre} · IPR máx. ${k.max}`; } }); }
      return d;
    }
    const tituloMapa = m => (lleno(m.vistaMapa.titulo) ? m.vistaMapa.titulo : `Mapa de riesgo · ${m.proceso || m.titulo || "proceso sin nombre"}`) + (m.vistaMapa.despues ? " · tras las acciones" : "");
    // Leyenda (ejercicio 14): nº, fallo, subproceso, IPR, nivel y dónde está
    function leyendaMapa(m) {
      if (!LA) return [];
      const b = flujoBase(m), num = id => { const p = b.pasos.find(q => q.id === id); return p ? (b.sinFlujo ? p.texto : p.num) : ""; };
      const l = enMapa(m).map(f => ({ id: f.id, num: f.num, fallo: f.fallo, subproceso: (subDe(m, f.subprocesoId) || {}).nombre || "", ipr: iprMapa(m, f), nivel: nivelMapa(m, f), critico: marcaCritico(f), pasos: ubicacionMapa(m, b, f).map(num) }));
      return m.vistaMapa.leyenda === "ipr" ? l.sort((a, c) => c.ipr - a.ipr || a.num - c.num) : l;
    }
    const sinUbicar = m => LA ? LA.prioritarios(m).filter(f => !ubicacionMapa(m, flujoBase(m), f).length) : [];
    function avisosMapa(m) {
      const r = [];
      if (!LA) return r;
      const P = LA.prioritarios(m);
      if (!P.length) return [{ nivel: "nota", texto: "Aún no hay fallos prioritarios (paso 7): son los que se ponen en el mapa." }];
      if (!m.pasos.length) r.push({ nivel: "nota", texto: "Sin flujograma (paso 3), el mapa se dibuja por subprocesos: una caja por subproceso con sus fallos. Con el flujograma, cada fallo irá en el paso exacto donde ocurre." });
      const su = sinUbicar(m);
      if (su.length) r.push({ nivel: "warn", texto: `${su.length === 1 ? "Un fallo prioritario no está" : su.length + " fallos prioritarios no están"} en el mapa (nº ${su.map(f => f.num).join(", ")}). Elige en qué paso ocurre${su.length === 1 ? "" : " cada uno"}.` });
      const d = dibujoMapa(m), b = flujoBase(m);
      d.iconos.filter(i => i.nums.length > 6).forEach(i => { const p = b.pasos.find(q => q.id === i.pasoId); r.push({ nivel: "nota", paso: i.pasoId, texto: `El paso «${corto(p ? p.texto : "", 40)}» agrupa ${i.nums.length} fallos. Quizá es demasiado grande: valora dividirlo en el flujograma para que el mapa diga mejor dónde está cada riesgo.` }); });
      return r;
    }
    function sugerirTextoMapa(m, k) {
      const P = LA ? LA.prioritarios(m) : [], d = dibujoMapa(m), nIconos = d.iconos.length, S = m.subprocesos.filter(s => lleno(s.nombre));
      if (k === "objetivos") return "Representar de forma visual y estructurada los riesgos del proceso, para que sirva como herramienta de comunicación para los profesionales, recurso de apoyo en los planes de acogida y la formación interna, base para el seguimiento de las medidas de mejora y soporte en la planificación de auditorías clínicas.";
      if (k === "estructura") return `El mapa sigue el orden lógico del ${m.pasos.length ? "flujograma del proceso" : "proceso, subproceso a subproceso"} y representa los ${plural(S.length, "subproceso", "subprocesos")}${m.pasos.length ? `, las ${m.pasos.filter(p => p.tipo === "actividad" || p.tipo === "decision").length} actividades y decisiones principales` : ""} y ${plural(P.length, "fallo prioritario", "fallos prioritarios")} marcados con iconos numerados en ${plural(nIconos, "punto del proceso", "puntos del proceso")}. Cada icono lleva los números de los fallos del AMFE y su color indica el nivel de riesgo (IPR) más alto: rojo muy alto, naranja alto, amarillo medio y verde bajo.`;
      if (k === "interpretacion") {
        const c = calorSub(m), top = S.filter(s => c[s.id] && c[s.id].max).sort((a, b) => c[b.id].max - c[a.id].max).slice(0, 3);
        const porSub = S.map(s => ({ s, n: P.filter(f => f.subprocesoId === s.id).length })).filter(x => x.n).sort((a, b) => b.n - a.n);
        return `El mapa permite ver de un vistazo dónde se concentran los riesgos del proceso.${porSub.length ? ` La mayor parte de los fallos prioritarios están en ${listaY(porSub.slice(0, 2).map(x => `«${x.s.nombre}» (${x.n})`))}.` : ""}${top.length ? ` Los riesgos más altos aparecen en ${listaY(top.map(s => `«${s.nombre}» (IPR ${c[s.id].max})`))}.` : ""} Su uso se recomienda en sesiones clínicas de sensibilización, en los planes de acogida de los profesionales que se incorporan y en las presentaciones ante las comisiones de calidad y seguridad del paciente.`;
      }
      return "";
    }

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

    // ======================= Paso 10 · Documento final y cierre =======================
    const fFecha = s => /^\d{4}-\d{2}-\d{2}$/.test(s || "") ? s.split("-").reverse().join("/") : (s || "");
    const prioridadDe = m => LA ? LA.prioritarios(m) : [];
    function introduccionSugerida(m) {
      const p = m.proceso || "el proceso analizado";
      return `La gestión proactiva de la seguridad del paciente requiere identificar de forma sistemática los riesgos de los procesos asistenciales. El mapa de riesgos es una herramienta para analizar los procesos clave en profundidad, localizar los puntos críticos donde pueden surgir fallos, evaluar su impacto y priorizar las intervenciones preventivas. Además, facilita la formación de los equipos, la estandarización de los procedimientos y su inclusión en los planes de acogida de los nuevos profesionales.\n\nEste documento presenta el mapa de riesgos del proceso «${p}»: la delimitación del proceso y sus subprocesos, la identificación de los puntos críticos, el análisis mediante la metodología AMFE (Análisis Modal de Fallos y Efectos), la priorización de los riesgos, las acciones de mejora propuestas y, como resultado final, la representación visual del mapa de riesgos sobre el flujograma del proceso. La metodología es reproducible y adaptable a otros procesos clínicos o de soporte.`;
    }
    function conclusionesSugeridas(m) {
      if (!LA) return "";
      const F = m.fallos.filter(f => lleno(f.fallo)), P = prioridadDe(m), S = m.subprocesos.filter(s => lleno(s.nombre)), A = P.filter(f => LA.accionesDe(f).length);
      const V = P.map(LA.iprDe).filter(Boolean), r = LA.resumenMejora(m, hoyIso());
      const partes = [`El documento ha permitido desarrollar y representar de forma estructurada el mapa de riesgos del proceso «${m.proceso || "analizado"}». Entre los principales resultados destacan:`];
      const l = [];
      if (F.length) l.push(`La identificación sistemática de ${plural(F.length, "fallo potencial", "fallos potenciales")} distribuidos en ${plural(S.length, "subproceso", "subprocesos")}.`);
      if (P.length) l.push(`La priorización de los riesgos según su gravedad, su ocurrencia y su detección, con la selección de ${plural(P.length, "fallo prioritario", "fallos prioritarios")}${V.length ? ` (IPR de ${Math.max(...V)} a ${Math.min(...V)})` : ""}.`);
      if (A.length) l.push(`La formulación de acciones de mejora para ${A.length === P.length ? "todos ellos" : plural(A.length, "de ellos", "de ellos")}, con responsable, plazo e indicador de seguimiento${r.iprResidual && r.iprInicial ? `; si funcionan como se espera, el IPR conjunto bajaría un ${r.reduccion} %` : ""}.`);
      if (m.pasos.length || S.length) l.push("La elaboración del mapa visual del proceso, con los puntos críticos marcados y coloreados según su riesgo, útil como herramienta formativa y de gestión.");
      return partes[0] + "\n" + l.map(x => "• " + x).join("\n") + "\n\nEste trabajo es la base para diseñar auditorías internas que verifiquen la eficacia de las mejoras, para la formación de los equipos (especialmente en la acogida de nuevos profesionales) y para la toma de decisiones en las comisiones de calidad y seguridad del paciente.";
    }
    // Comprobaciones antes de entregar el documento (mejora C), cada una con el paso donde se arregla
    function notaCalidad(m) {
      const P = prioridadDe(m), F = m.fallos.filter(f => lleno(f.fallo)), E = m.equipo.filter(x => lleno(x.perfil)), C = m.control;
      const conCargo = l => (l || []).some(x => lleno(x.cargo) || lleno(x.nombre));
      return [
        { ok: lleno(m.proceso) && lleno(m.inicio) && lleno(m.fin), paso: 1, texto: "El proceso está delimitado: nombre, dónde empieza y dónde acaba." },
        { ok: m.subprocesos.filter(s => lleno(s.nombre)).length >= 2, paso: 2, texto: "El proceso está dividido en subprocesos." },
        { ok: m.pasos.length > 0 && lleno(m.validado), paso: 3, texto: "El flujograma está dibujado y validado con el equipo." },
        { ok: m.puntos.length > 0 && m.subprocesos.every(s => puntosDeSub(m, s.id).length), paso: 4, texto: "Cada subproceso tiene sus puntos críticos." },
        { ok: E.length >= 6 && E.some(x => x.rol === "coordinador") && E.some(x => x.rol === "secretario"), paso: 5, texto: "El equipo tiene al menos 6 perfiles, con coordinación y secretaría." },
        { ok: F.length > 0 && !!LA && F.every(LA.iprDe), paso: 7, texto: "Todos los fallos tienen su gravedad, su ocurrencia y su detección." },
        { ok: P.length > 0 && !avisosPriorizar(m).some(a => /motivo/.test(a.texto)), paso: 7, texto: "Hay fallos prioritarios y los cambios a mano o los críticos tienen su motivo." },
        { ok: P.length > 0 && !!LA && P.every(f => LA.accionesDe(f).length && LA.accionesDe(f).every(x => LA.accionCompleta(x) && lleno(x.indicador.nombre))), paso: 8, texto: "Cada fallo prioritario tiene acciones con responsable, plazo e indicador." },
        { ok: P.length > 0 && !sinUbicar(m).length, paso: 9, texto: "Todos los fallos prioritarios están en el mapa." },
        { ok: lleno(m.conclusiones), paso: 10, texto: "Las conclusiones están escritas." },
        { ok: conCargo(C.elaborado) && conCargo(C.aprobado), paso: 10, texto: "El control documental dice quién lo elabora y quién lo aprueba." },
        { ok: /^\d{4}-\d{2}-\d{2}$/.test(m.proxRevision || ""), paso: 10, texto: "Tiene fecha de próxima revisión." }
      ];
    }
    // Revisión periódica (mejora K): días que faltan para la próxima revisión (negativo = pasada)
    function diasRevision(m, hoy = hoyIso()) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(m.proxRevision || "")) return null;
      return Math.round((new Date(m.proxRevision) - new Date(hoy)) / 864e5);
    }
    // Nueva edición: copia completa con los mismos ids de fallos (para comparar con la anterior)
    function nuevaEdicion(m, genId, fecha) {
      const c = JSON.parse(JSON.stringify(m)), n = String((parseInt(m.edicion, 10) || 0) + 1).padStart(2, "0");
      Object.assign(c, { id: genId(), edicion: n, anteriorId: m.id, proxRevision: "", validado: "", creado: fecha, modificado: fecha, origen: m.origen });
      c.control.historial.push({ edicion: n, fecha: fecha.slice(0, 10), cambio: "Revisión del mapa de riesgos" });
      return c;
    }
    // Comparación con la edición anterior (por nº de fallo): IPR antes y ahora, nuevos y quitados
    function compararEdiciones(ant, m) {
      if (!LA) return null;
      const porNum = x => new Map(x.fallos.filter(f => lleno(f.fallo)).map(f => [f.num, f]));
      const A = porNum(ant), B = porNum(m), filas = [];
      B.forEach((f, n) => { const g = A.get(n); if (g) filas.push({ num: n, fallo: f.fallo, antes: LA.iprDe(g), ahora: LA.iprDe(f) }); });
      const suma = l => l.reduce((s, v) => s + (v || 0), 0);
      return { filas: filas.filter(x => x.antes !== x.ahora), nuevos: [...B.keys()].filter(n => !A.has(n)), quitados: [...A.keys()].filter(n => !B.has(n)),
        prioritarios: [prioridadDe(ant).length, prioridadDe(m).length], iprTotal: [suma([...A.values()].map(LA.iprDe)), suma([...B.values()].map(LA.iprDe))] };
    }

    // ---------- Documentos (bloques que docx.js convierte en Word y app.js en HTML para el PDF) ----------
    const FONDO_NIVEL = { muyalto: "FFE4E6", alto: "FFEDD5", medio: "FEF3C7", bajo: "DCFCE7" };
    const FONDO_ZONA = { verde: "BBF7D0", amarillo: "FEF08A", naranja: "FED7AA", rojo: "FCA5A5" };
    const celdaIpr = v => { const k = LF.nivelDeIPR(v); return v ? { texto: String(v), centro: true, negrita: true, fondo: FONDO_NIVEL[k] } : { texto: "", centro: true }; };
    const Ce = t => ({ texto: t == null ? "" : String(t), centro: true });
    function bloquesControl(m) {
      const C = m.control, pers = l => (l || []).filter(x => lleno(x.nombre) || lleno(x.cargo)), B = [], filas = [];
      [["Elaborado", C.elaborado], ["Revisado", C.revisado], ["Aprobado", C.aprobado]].forEach(([k, l]) => pers(l).forEach((x, i) => filas.push([i ? "" : { texto: k, negrita: true }, x.nombre, x.cargo, x.ubicacion || ""])));
      if (filas.length) B.push({ t: "tabla", cab: ["", "Nombre", "Cargo", "Ubicación"], filas, anchos: [14, 28, 30, 28], fuente: 9 });
      const H = (C.historial || []).filter(h => lleno(h.edicion) || lleno(h.cambio));
      if (H.length) { B.push({ t: "h2", texto: "Histórico de revisiones" }); B.push({ t: "tabla", cab: ["Edición", "Fecha", "Denominación"], filas: H.map(h => [Ce(h.edicion), fFecha(h.fecha), h.cambio]), anchos: [14, 20, 66], fuente: 9 }); }
      return B;
    }
    function bloqueMatriz(m, fallos, tam = 5) {
      const etq = i => tam === 10 ? String(i) : LA.TRAMOS[i - 1];
      return { t: "tabla", fuente: 8, cab: ["G \\ O", ...Array.from({ length: tam }, (_, i) => etq(i + 1))], anchos: [12, ...Array(tam).fill(88 / tam)],
        filas: LA.matriz(fallos, tam).map(fila => [{ texto: etq(fila[0].g), negrita: true, centro: true }, ...fila.map(cl => ({ texto: cl.fallos.map(f => f.num).join(", "), centro: true, negrita: true, fondo: FONDO_ZONA[cl.zona] }))]) };
    }
    const filaFallo = (m, f) => [(subDe(m, f.subprocesoId) || {}).nombre || "", Ce(f.num), { texto: f.fallo, negrita: true }, f.efecto, f.causa, Ce(f.g), Ce(f.o), Ce(f.d), celdaIpr(LA.iprDe(f))];
    const CAB_FALLO = ["Subproceso", "Id", "Fallo", "Efecto", "Causa", "G", "O", "D", "IPR"], ANCHO_FALLO = [14, 5, 20, 20, 21, 4, 4, 4, 8];
    // El Documento Final, en el orden y con los títulos del documento de Urgencias del curso
    function documentoFinal(m, fecha, img) {
      const nom = m.proceso || m.titulo || "Proceso sin nombre", B = [], P = prioridadDe(m), F = m.fallos.filter(f => lleno(f.fallo)), S = m.subprocesos;
      const parrafos = (txt, def) => String(lleno(txt) ? txt : def || "").split(/\n\s*\n/).map(x => x.trim()).filter(Boolean).forEach(x => {
        const lineas = x.split("\n"), items = lineas.filter(l => /^\s*[•\-]/.test(l)), resto = lineas.filter(l => !/^\s*[•\-]/.test(l)).join(" ");
        if (lleno(resto)) B.push({ t: "p", texto: resto });
        if (items.length) B.push({ t: "lista", items: items.map(l => l.replace(/^\s*[•\-]\s*/, "")) });
      });
      B.push({ t: "portada", titulo: "Mapa de Riesgos", sub: nom, extra: [m.unidad, m.ambito, m.fecha || fecha, `Edición ${m.edicion || "00"}`].filter(lleno) });
      const ctl = bloquesControl(m);
      if (ctl.length) { B.push({ t: "h1", texto: "Control del documento" }); B.push(...ctl); }
      B.push({ t: "salto" });
      B.push({ t: "h1", texto: "1. Índice" });
      B.push({ t: "lista", items: ["2. Introducción", "3. Descripción del proceso", "4. Identificación de puntos críticos", "5. Análisis AMFE", "6. Acciones de mejora", "7. Mapa de Riesgos", "8. Conclusiones", "9. Anexo I: Escalas de priorización en AMFE", "10. Anexo II: Tablas de fallos priorizados", "11. Matriz de riesgo"] });
      B.push({ t: "h1", texto: "2. Introducción" });
      parrafos(m.introduccion, introduccionSugerida(m));
      B.push({ t: "h1", texto: "3. Descripción del proceso" });
      if (lleno(m.descripcion)) B.push({ t: "p", runs: [{ texto: "Objetivo general: ", negrita: true }, { texto: m.descripcion }] });
      B.push({ t: "h2", texto: "3.1. Objetivo del proceso" });
      B.push({ t: "p", texto: lleno(m.objetivo) ? m.objetivo : sugerirObjetivo(m) || "—" });
      const lim = [lleno(m.inicio) && `Empieza: ${m.inicio}.`, lleno(m.fin) && `Termina: ${m.fin}.`, lleno(m.incluye) && `Incluye: ${m.incluye}.`, lleno(m.excluye) && `Queda fuera: ${m.excluye}.`].filter(Boolean);
      if (lim.length) B.push({ t: "lista", items: lim });
      B.push({ t: "h2", texto: "3.2. Subprocesos incluidos" });
      if (S.length) {
        B.push({ t: "p", texto: `Para facilitar su análisis, el proceso se ha desglosado en ${plural(S.length, "subproceso", "subprocesos")}:` });
        B.push({ t: "tabla", cab: ["Id", "Subproceso", "Descripción", "Inicio del subproceso", "Fin del subproceso", "Roles implicados"], filas: S.map((s, i) => [Ce(i + 1), { texto: s.nombre, negrita: true }, s.descripcion, s.inicio, s.fin, s.roles]), anchos: [5, 19, 24, 18, 18, 16], fuente: 8.5 });
      }
      B.push({ t: "h1", texto: "4. Identificación de puntos críticos" });
      B.push({ t: "p", texto: "Se ha analizado de forma sistemática cada subproceso para localizar los puntos críticos: los momentos en los que pueden producirse fallos con impacto en la seguridad del paciente o en la continuidad asistencial." });
      B.push({ t: "h2", texto: "4.1. Tabla de subprocesos y riesgos detectados" });
      puntosPorSub(m).filter(g => g.puntos.length).forEach(g => B.push({ t: "tabla", cab: ["Id", "Subproceso", "Error o punto crítico", "Descripción del error o riesgo identificado"], filas: g.puntos.map(x => [Ce(idPunto(m, x)), g.sub ? g.sub.nombre : "", { texto: x.titulo, negrita: true }, x.descripcion]), anchos: [7, 20, 30, 43], fuente: 8.5 }));
      if (!m.puntos.length) B.push({ t: "p", texto: "No se han registrado puntos críticos.", estilo: "nota" });
      B.push({ t: "h1", texto: "5. Análisis AMFE" });
      B.push({ t: "h2", texto: "5.1. Utilidad del AMFE en la gestión de riesgos" });
      B.push({ t: "p", texto: "El Análisis Modal de Fallos y Efectos (AMFE) es una herramienta de análisis proactivo que permite identificar, clasificar y priorizar los fallos potenciales de un proceso, considerando el impacto que tendrían sobre la seguridad del paciente, su frecuencia de aparición y la dificultad para detectarlos antes de que causen daño. Permite comprender mejor los puntos vulnerables del proceso, tomar decisiones basadas en el riesgo, planificar acciones preventivas eficaces y priorizar los esfuerzos de mejora de forma objetiva." });
      B.push({ t: "h2", texto: "5.2. Composición del equipo de trabajo" });
      const E = m.equipo.filter(x => lleno(x.perfil));
      if (E.length && LA) { B.push({ t: "p", texto: "Se constituyó un grupo de trabajo multidisciplinar, con conocimiento operativo del proceso y representación de los distintos perfiles implicados:" }); B.push({ t: "tabla", cab: ["Id", "Perfil profesional", "Cargo", "Rol", "Justificación"], filas: E.map((x, i) => [Ce(i + 1), { texto: x.perfil, negrita: true }, x.cargo, LA.ROLES[x.rol].nom, x.justificacion]), anchos: [5, 22, 22, 16, 35], fuente: 8.5 }); }
      else B.push({ t: "p", texto: "No se ha registrado el equipo de trabajo.", estilo: "nota" });
      B.push({ t: "h2", texto: "5.3. Metodología empleada" });
      const met = [textoMetodologia(m), m.metodologia.texto].filter(lleno).join(" ");
      if (met) B.push({ t: "p", texto: met });
      if (m.sesiones.length) B.push({ t: "tabla", cab: ["Sesión", "Fecha", "Actividad principal", "Duración", "Resultados alcanzados"], filas: m.sesiones.map((x, i) => [Ce(i + 1), fFecha(x.fecha), x.actividad, Ce(x.duracion), x.resultados]), anchos: [8, 13, 33, 10, 36], fuente: 8.5 });
      B.push({ t: "h2", texto: "5.4. Resultados del análisis" });
      if (F.length && LA) B.push({ t: "p", texto: `Se identificaron ${plural(F.length, "fallo potencial", "fallos potenciales")}, organizados según el subproceso al que pertenecen y priorizados según su Índice de Prioridad de Riesgo (IPR = gravedad × ocurrencia × detección). Las escalas se detallan en el Anexo I y el listado completo de fallos, primero por subproceso y luego por IPR, en el Anexo II. ${P.length ? `Los ${plural(P.length, "fallo prioritario se ha representado", "fallos prioritarios se han representado")} además en una matriz de riesgos (gravedad × ocurrencia) con zonas de color (apartado 11): no es el criterio de priorización, pero refuerza la comunicación del riesgo.` : ""}` });
      B.push({ t: "h2", texto: "5.5. Fallos con mayor criticidad (IPR más elevado)" });
      if (P.length) { B.push({ t: "p", texto: `${P.length === 1 ? "El fallo" : "Los " + P.length + " fallos"} con mayor IPR, ${P.length === 1 ? "considerado prioritario" : "considerados prioritarios"} para ser ${P.length === 1 ? "abordado" : "abordados"} con medidas correctoras o preventivas:` }); B.push({ t: "tabla", cab: CAB_FALLO, filas: P.map(f => filaFallo(m, f)), anchos: ANCHO_FALLO, fuente: 8 }); }
      B.push({ t: "h1", texto: "6. Acciones de mejora" });
      B.push({ t: "p", texto: "Una vez priorizados los riesgos, se diseñaron acciones de mejora para los fallos prioritarios, con la finalidad de reducir la probabilidad de que ocurran, mejorar su detección temprana y disminuir su impacto en la seguridad del paciente." });
      B.push({ t: "h2", texto: "6.1. Criterios para seleccionar acciones" });
      const crit = Object.keys(CRITERIOS_ACCIONES).filter(k => m.criteriosAcciones[k]).map(k => CRITERIOS_ACCIONES[k] + ".");
      B.push({ t: "lista", items: crit.length ? crit : Object.values(CRITERIOS_ACCIONES).map(x => x + ".") });
      B.push({ t: "h2", texto: "6.2. Tabla de acciones propuestas para los fallos con mayor IPR" });
      const AC = P.flatMap(f => (f.acciones || []).filter(x => lleno(x.que)).map(x => [Ce(f.num), (subDe(m, f.subprocesoId) || {}).nombre || "", f.fallo, { texto: x.que, negrita: true }, x.porque, x.donde, x.plazo || fFecha(x.fin), x.quien, x.como, [x.indicador.nombre, x.indicador.estandar].filter(lleno).join(" · ")]));
      if (AC.length) B.push({ t: "tabla", cab: ["Id", "Subproceso", "Fallo", "Acción de mejora (qué)", "¿Por qué?", "¿Dónde?", "Plazo", "Responsable", "¿Cómo?", "Indicador · estándar"], filas: AC, anchos: [4, 9, 10, 14, 11, 9, 7, 10, 14, 12], fuente: 7 });
      else B.push({ t: "p", texto: "Aún no se han propuesto acciones de mejora.", estilo: "nota" });
      const R = P.filter(f => LA && LA.iprResidual(f));
      if (R.length) { const rm = LA.resumenMejora(m, hoyIso()); B.push({ t: "p", texto: `Reevaluación esperada tras las acciones: en conjunto, el IPR de ${plural(R.length, "fallo", "fallos")} pasaría de ${rm.iprInicial} a ${rm.iprResidual} (${rm.reduccion} % menos).` }); B.push({ t: "tabla", cab: ["Id", "Fallo", "IPR antes", "G·O·D después", "IPR después"], filas: R.map(f => [Ce(f.num), f.fallo, celdaIpr(LA.iprDe(f)), Ce([f.residual.g, f.residual.o, f.residual.d].join(" · ")), celdaIpr(LA.iprResidual(f))]), anchos: [6, 50, 14, 16, 14], fuente: 8.5 }); }
      B.push({ t: "h2", texto: "6.3. Justificación y alineación con auditoría" });
      B.push({ t: "p", texto: "Las acciones se han diseñado a partir de los fallos de mayor criticidad y de su impacto esperado sobre la seguridad del paciente. Sus indicadores servirán de base para la auditoría de seguimiento que evaluará su grado de implantación y su efectividad real." });
      const H = hallazgos(m);
      if (H.length) B.push({ t: "tabla", cab: ["Id", "Hallazgo clave (fallo prioritario)", "IPR", "Frecuencia de auditoría propuesta"], filas: H.map(h => [Ce(h.num), h.fallo, celdaIpr(h.ipr), Ce(h.frecuencia)]), anchos: [6, 60, 12, 22], fuente: 8.5 });
      B.push({ t: "h1", texto: "7. Mapa de Riesgos" });
      B.push({ t: "p", texto: `Como resultado del trabajo, se ha elaborado el ${m.pasos.length ? "flujograma completo" : "esquema"} del proceso «${nom}», en el que se integran los subprocesos y las actividades clave, marcando de forma visual los puntos en los que se han identificado fallos potenciales a través del análisis AMFE.` });
      B.push({ t: "h2", texto: "7.1. Objetivos del mapa" });
      parrafos(m.textosMapa.objetivos, sugerirTextoMapa(m, "objetivos"));
      B.push({ t: "h2", texto: "7.2. Estructura del flujograma" });
      parrafos(m.textosMapa.estructura, sugerirTextoMapa(m, "estructura"));
      B.push({ t: "h2", texto: "7.3. Interpretación y utilidad" });
      parrafos(m.textosMapa.interpretacion, sugerirTextoMapa(m, "interpretacion"));
      B.push({ t: "salto" });
      B.push({ t: "h2", texto: "7.4. Mapa de Riesgo" });
      if (img) B.push({ t: "imagen", png: img.png, svg: img.svg, w: img.w, h: img.h, maxAlto: 23, pie: tituloMapa(m) + "." });
      const LY = leyendaMapa(m);
      if (LY.length) B.push({ t: "tabla", cab: ["Nº", "Fallo", "IPR"], filas: LY.map(x => [{ texto: String(x.num), centro: true, negrita: true, fondo: FONDO_NIVEL[x.nivel] }, x.fallo, celdaIpr(x.ipr)]), anchos: [8, 78, 14], fuente: 8 });
      B.push({ t: "h1", texto: "8. Conclusiones" });
      parrafos(m.conclusiones, conclusionesSugeridas(m));
      if (/^\d{4}-\d{2}-\d{2}$/.test(m.proxRevision || "")) B.push({ t: "p", texto: `Próxima revisión del mapa de riesgos: ${fFecha(m.proxRevision)}.` });
      if (LA) {
        B.push({ t: "salto" });
        B.push({ t: "h1", texto: "9. Anexo I: Escalas de priorización en AMFE" });
        ["g", "o", "d"].forEach(k => { B.push({ t: "h2", texto: `Escala de ${LA.ESCALA_NOM[k].toLowerCase()}` }); B.push({ t: "tabla", cab: ["Puntuación", LA.ESCALA_NOM[k]], filas: LA.TRAMOS.map((x, i) => [Ce(x), m.escalas[k][i]]), anchos: [18, 82], fuente: 9 }); });
        B.push({ t: "h1", texto: "10. Anexo II: Tablas de fallos priorizados" });
        if (F.length) {
          B.push({ t: "h2", texto: "Fallos por subproceso" }); B.push({ t: "tabla", cab: CAB_FALLO, filas: LA.ordenarFallos(F, "sub", S).map(f => filaFallo(m, f)), anchos: ANCHO_FALLO, fuente: 7.5 });
          B.push({ t: "h2", texto: "Fallos por IPR" }); B.push({ t: "tabla", cab: CAB_FALLO, filas: LA.ordenarFallos(F.filter(LA.iprDe)).map(f => filaFallo(m, f)), anchos: ANCHO_FALLO, fuente: 7.5 });
        }
        B.push({ t: "h1", texto: "11. Matriz de riesgo" });
        B.push({ t: "p", texto: "La matriz de riesgos representa el nivel de criticidad de cada fallo según su gravedad (filas) y su ocurrencia (columnas). La zona en la que cae indica su nivel de riesgo: verde, bajo (aceptable); amarillo, moderado (requiere vigilancia); naranja, alto (requiere intervención); rojo, muy alto (requiere intervención inmediata)." });
        if (P.length) B.push(bloqueMatriz(m, P, 5));
      }
      if (lleno(m.notas) && /^ej-/.test(m.id)) B.push({ t: "p", texto: m.notas, estilo: "nota" });
      B.push({ t: "p", texto: `Documento generado con la app Mapa de Riesgos el ${fecha}. Herramienta docente y de apoyo: no sustituye el criterio profesional.`, estilo: "nota" });
      return { titulo: "Mapa de Riesgos · " + nom, bloques: B };
    }
    // Resumen para la Dirección: una página con las cifras, los 5 de mayor IPR y sus acciones
    function documentoResumen(m, fecha, img) {
      const nom = m.proceso || m.titulo || "Proceso sin nombre", r = resumen(m), P = prioridadDe(m), B = [];
      // Sin portada (ocupa media página): título y datos en dos líneas, para que todo quepa en una página
      B.push({ t: "h1", texto: "Mapa de Riesgos · " + nom });
      B.push({ t: "p", texto: [m.unidad, fecha, `Edición ${m.edicion || "00"}`].filter(lleno).join(" · "), estilo: "nota" });
      B.push({ t: "tabla", sinCab: true, filas: [[{ texto: "Subprocesos", negrita: true }, String(r.subprocesos)], [{ texto: "Puntos críticos", negrita: true }, String(r.puntos)], [{ texto: "Fallos analizados", negrita: true }, String(r.fallos)], [{ texto: "Fallos prioritarios", negrita: true }, String(r.prioritarios)], [{ texto: "IPR máximo", negrita: true }, celdaIpr(r.maxIPR)]], anchos: [40, 60] });
      if (P.length && LA) {
        B.push({ t: "h2", texto: "Los riesgos más altos" });
        B.push({ t: "tabla", cab: ["Nº", "Fallo", "IPR", "Acción", "Responsable", "Plazo"], filas: LA.ordenarFallos(P).slice(0, 5).map(f => { const a = LA.accionesDe(f)[0]; return [Ce(f.num), { texto: f.fallo, negrita: true }, celdaIpr(LA.iprDe(f)), a ? a.que : "", a ? a.quien : "", a ? a.plazo || fFecha(a.fin) : ""]; }), anchos: [5, 26, 9, 32, 16, 12], fuente: 8.5 });
      }
      if (img) B.push({ t: "imagen", png: img.png, svg: img.svg, w: img.w, h: img.h, maxAlto: 8.5 });
      return { titulo: "Mapa de Riesgos · resumen · " + nom, bloques: B };
    }
    // Ficha de acogida (mejora J): una página por subproceso con sus riesgos principales y qué se hace
    function documentoAcogida(m, fecha) {
      const nom = m.proceso || m.titulo || "Proceso sin nombre", B = [];
      B.push({ t: "portada", titulo: "Riesgos del proceso para profesionales que se incorporan", sub: nom, extra: [m.unidad, fecha].filter(lleno) });
      B.push({ t: "p", texto: "Esta ficha resume, subproceso a subproceso, dónde puede fallar la atención al paciente y qué medidas se han puesto en marcha. Léela antes de empezar y pregunta cualquier duda a tu responsable." });
      const pr = LA ? LA.prioridad(m) : {};
      m.subprocesos.filter(s => lleno(s.nombre)).forEach((s, i) => {
        const F = LA ? LA.ordenarFallos(m.fallos.filter(f => f.subprocesoId === s.id && lleno(f.fallo) && LA.iprDe(f))) : [];
        if (i) B.push({ t: "salto" });
        B.push({ t: "h1", texto: `${i + 1}. ${s.nombre}` });
        const datos = [lleno(s.descripcion) && s.descripcion, lleno(s.inicio) && `Empieza: ${s.inicio}.`, lleno(s.fin) && `Termina: ${s.fin}.`, lleno(s.roles) && `Intervienen: ${s.roles}.`].filter(Boolean);
        if (datos.length) B.push({ t: "lista", items: datos });
        const top = F.filter(f => pr[f.id] && pr[f.id].prio).concat(F.filter(f => !(pr[f.id] && pr[f.id].prio))).slice(0, 5);
        if (top.length) {
          B.push({ t: "h2", texto: "Riesgos principales" });
          B.push({ t: "tabla", cab: ["Nº", "Qué puede fallar", "Qué pasaría", "IPR", "Qué se hace"], filas: top.map(f => [Ce(f.num), { texto: f.fallo, negrita: true }, f.efecto, celdaIpr(LA.iprDe(f)), LA.accionesDe(f).map(a => a.que).join(" · ") || f.controles]), anchos: [5, 26, 24, 9, 36], fuente: 8.5 });
        } else B.push({ t: "p", texto: "No hay fallos analizados en este subproceso.", estilo: "nota" });
      });
      return { titulo: "Ficha de acogida · " + nom, bloques: B };
    }
    // ---------- Excel ----------
    const ESTILOS_XLSX = {
      titulo: { negrita: true, tamano: 14, colorTexto: "FFFFFF", colorFondo: "7A1424", borde: false },
      sub: { cursiva: true, colorTexto: "444444", borde: false },
      cab: { negrita: true, colorTexto: "FFFFFF", colorFondo: "0D1B2A", alineacion: "center", ajustarTexto: true },
      celda: { ajustarTexto: true, vertical: "top" }, negrita: { negrita: true, ajustarTexto: true, vertical: "top" }, centro: { alineacion: "center", vertical: "top", ajustarTexto: true },
      n_muyalto: { negrita: true, alineacion: "center", colorFondo: "FFE4E6" }, n_alto: { negrita: true, alineacion: "center", colorFondo: "FFEDD5" }, n_medio: { negrita: true, alineacion: "center", colorFondo: "FEF3C7" }, n_bajo: { negrita: true, alineacion: "center", colorFondo: "DCFCE7" },
      si: { negrita: true, alineacion: "center", colorTexto: "15803D" }
    };
    function hojasExcel(m, fecha) {
      const T = (texto, estilo = "celda") => ({ texto: texto == null ? "" : String(texto), estilo }), N = v => v ? { numero: v, estilo: "n_" + LF.nivelDeIPR(v) } : T("");
      const nom = m.proceso || m.titulo || "Mapa de riesgos";
      const cab = (titulo, cols) => { const r = [[T(titulo, "titulo")], [T([m.unidad, "Exportado de la app Mapa de Riesgos · " + fecha].filter(lleno).join(" · "), "sub")], cols.map(x => T(x, "cab"))]; r[0][0].combinar = cols.length; return r; };
      const sub = f => (subDe(m, f.subprocesoId) || {}).nombre || "";
      const pr = LA ? LA.prioridad(m) : {}, P = LA ? LA.puestos(m.fallos) : {};
      const h1 = cab("Fallos · " + nom, ["Subproceso", "Nº", "Modo de fallo", "Efecto", "Causa", "Controles actuales", "G", "O", "D", "IPR", "Puesto", "Prioritario"]);
      (LA ? LA.ordenarFallos(m.fallos.filter(f => lleno(f.fallo)), "sub", m.subprocesos) : []).forEach(f => h1.push([T(sub(f)), T(f.num, "centro"), T(f.fallo, "negrita"), T(f.efecto), T(f.causa), T(f.controles), T(f.g, "centro"), T(f.o, "centro"), T(f.d, "centro"), N(LA.iprDe(f)), T(P[f.id] || "", "centro"), pr[f.id] && pr[f.id].prio ? T("Sí", "si") : T("")]));
      const h2 = cab("Acciones de mejora · " + nom, ["Nº", "Fallo", "IPR", "Qué", "Por qué", "Dónde", "Plazo", "Fin", "Quién", "Cómo", "Indicador", "Estándar", "Estado", "IPR después"]);
      prioridadDe(m).forEach(f => (f.acciones.length ? f.acciones : [null]).forEach(x => h2.push([T(f.num, "centro"), T(f.fallo, "negrita"), N(LA.iprDe(f)), T(x ? x.que : ""), T(x ? x.porque : ""), T(x ? x.donde : ""), T(x ? x.plazo : ""), T(x ? fFecha(x.fin) : ""), T(x ? x.quien : ""), T(x ? x.como : ""), T(x ? x.indicador.nombre : ""), T(x ? x.indicador.estandar : ""), T(x ? LA.ESTADOS_ACCION[x.estado] : ""), N(LA.iprResidual(f))])));
      const h3 = cab("Hallazgos para Auditorías · " + nom, ["Nº", "Subproceso", "Fallo", "IPR", "Gravedad", "Crítico", "Acción", "Indicador", "Frecuencia de auditoría", "Motivo"]);
      hallazgos(m).forEach(h => h3.push([T(h.num, "centro"), T(h.subproceso), T(h.fallo, "negrita"), N(h.ipr), T(h.g, "centro"), T(h.critico ? "Sí" : "", "centro"), T(h.accion), T(h.indicador), T(h.frecuencia, "centro"), T(h.motivo)]));
      const h4 = cab("Puntos críticos · " + nom, ["Id", "Subproceso", "Error o punto crítico", "Descripción", "Paso"]);
      puntosPorSub(m).forEach(g => g.puntos.forEach(x => { const p = LF.pasoDe(m, x.pasoId); h4.push([T(idPunto(m, x), "centro"), T(g.sub ? g.sub.nombre : ""), T(x.titulo, "negrita"), T(x.descripcion), T(p ? `${p.num}. ${p.texto}` : "")]); }));
      const h5 = cab("Proceso y equipo · " + nom, ["Dato", "Valor", "", ""]);
      [["Proceso", nom], ["Unidad", m.unidad], ["Objetivo", m.objetivo], ["Empieza", m.inicio], ["Termina", m.fin], ["Edición", m.edicion], ["Próxima revisión", fFecha(m.proxRevision)]].forEach(([k, v]) => h5.push([T(k, "negrita"), T(v)]));
      h5.push([]); h5.push(["Subproceso", "Inicio", "Fin", "Roles"].map(x => T(x, "cab")));
      m.subprocesos.forEach(s => h5.push([T(s.nombre, "negrita"), T(s.inicio), T(s.fin), T(s.roles)]));
      h5.push([]); h5.push(["Perfil", "Cargo", "Rol", "Justificación"].map(x => T(x, "cab")));
      m.equipo.forEach(x => h5.push([T(x.perfil, "negrita"), T(x.cargo), T(LA ? LA.ROLES[x.rol].nom : x.rol), T(x.justificacion)]));
      return { estilos: ESTILOS_XLSX, hojas: [
        { nombre: "Fallos", filas: h1, opciones: { anchoColumnas: [24, 6, 36, 32, 32, 30, 5, 5, 5, 8, 8, 10], congelar: { filas: 3, columnas: 0 }, altoFilas: { 1: 24 }, primera: true } },
        { nombre: "Acciones", filas: h2, opciones: { anchoColumnas: [6, 30, 8, 40, 30, 20, 12, 12, 22, 36, 30, 12, 12, 10], congelar: { filas: 3, columnas: 0 } } },
        { nombre: "Hallazgos Auditorías", filas: h3, opciones: { anchoColumnas: [6, 24, 36, 8, 9, 8, 36, 34, 14, 40], congelar: { filas: 3, columnas: 0 } } },
        { nombre: "Puntos críticos", filas: h4, opciones: { anchoColumnas: [7, 26, 40, 50, 30], congelar: { filas: 3, columnas: 0 } } },
        { nombre: "Proceso y equipo", filas: h5, opciones: { anchoColumnas: [30, 40, 30, 50] } }
      ] };
    }
    // «Llevar a Auditorías»: un archivo con la forma de «amfe-fallos» v1, que el «Traer de AMFE» de Auditorías ya acepta
    const paqueteAuditorias = (m, appVersion, fecha) => LA ? LA.paqueteIntercambio([m], appVersion, fecha) : null;

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
      const vm = o.vistaMapa && typeof o.vistaMapa === "object" ? o.vistaMapa : {};
      m.vistaMapa = { mostrar: vm.mostrar === "todos" ? "todos" : "prioritarios", calor: vm.calor === true, titulo: txt(vm.titulo, 200), leyenda: vm.leyenda === "ipr" ? "ipr" : "num", despues: vm.despues === true };
      // Control documental: el motor de Flujograma guarda nombre y cargo; el documento final lleva también la ubicación
      const oc = o.control && typeof o.control === "object" ? o.control : {};
      ["elaborado", "revisado", "aprobado"].forEach(k => m.control[k].forEach((x, i) => { const y = Array.isArray(oc[k]) ? oc[k][i] : null; x.ubicacion = y ? txt(y.ubicacion, 200) : ""; }));
      const tm = o.textosMapa && typeof o.textosMapa === "object" ? o.textosMapa : {};
      m.textosMapa = { objetivos: txt(tm.objetivos, 3000), estructura: txt(tm.estructura, 3000), interpretacion: txt(tm.interpretacion, 3000) };
      const ca = o.criteriosAcciones && typeof o.criteriosAcciones === "object" ? o.criteriosAcciones : {};
      m.criteriosAcciones = Object.fromEntries(Object.keys(CRITERIOS_ACCIONES).map(k => [k, ca[k] === true]));
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
      const pas = new Set(m.pasos.map(p => p.id));
      m.fallos.forEach(f => { const y = origF.get(f.id); f.puntoId = y && idValido(y.puntoId) && pts.has(y.puntoId) ? y.puntoId : ""; f.pasos = y && Array.isArray(y.pasos) ? [...new Set(y.pasos.filter(id => idValido(id) && pas.has(id)))].slice(0, 10) : []; });
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
        f.subprocesoId = nuevo(f.subprocesoId); f.puntoId = nuevo(f.puntoId); f.pasos = (f.pasos || []).map(nuevo);
        (f.acciones || []).forEach(x => { x.id = genId(); }); (f.ishikawa || []).forEach(x => { x.id = genId(); });
        (f.votos || []).forEach(v => { v.miembroId = nuevo(v.miembroId); });
      });
      (c.ideas || []).forEach(x => { x.id = genId(); x.subprocesoId = nuevo(x.subprocesoId); x.bloqueId = nuevo(x.bloqueId); x.falloId = nuevo(x.falloId); });
      if (c.tgn) c.tgn.votos.forEach(v => { v.miembroId = nuevo(v.miembroId); v.bloqueId = nuevo(v.bloqueId); });
      c.anteriorId = "";
      return c;
    }
    // ---------- «Traer de DAFO» (paquete «dafo-came» v1 de la app DAFO · CAME) ----------
    // Lista los factores que el DAFO marcó como candidatos a un mapa de riesgos (destino «mapa»). Acepta el paquete de
    // localStorage["dafo-intercambio"] o la copia .json de la app DAFO (clave «intercambio»). No usa código de DAFO.
    const TIPO_DAFO = { D: "Debilidad", A: "Amenaza", F: "Fortaleza", O: "Oportunidad" };
    function leerDafo(o) {
      if (!o || typeof o !== "object") return null;
      const p = o.formato ? o : o.intercambio;
      if (!p || typeof p !== "object" || p.formato !== "dafo-came" || p.version !== 1 || !Array.isArray(p.dafos)) return null;
      const t = (v, n) => typeof v === "string" ? v.slice(0, n) : "", r = [];
      p.dafos.forEach(d => {
        if (!d || typeof d !== "object" || !Array.isArray(d.candidatos)) return;
        d.candidatos.filter(c => c && c.destino === "mapa" && (lleno(c.texto) || lleno(c.proceso))).forEach(c => r.push({
          id: t(d.id, 60) + "|" + t(c.factorId, 60), dafoId: t(d.id, 60), dafo: t(d.titulo, 300) || t(d.objeto, 300), objeto: t(d.objeto, 300),
          codigo: t(c.codigo, 10), tipo: TIPO_DAFO[c.tipo] ? c.tipo : "", texto: t(c.texto, 1000), evidencia: t(c.evidencia, 1000), proceso: t(c.proceso, 300), motivo: t(c.motivo, 1000),
          appVersion: t(p.appVersion, 20) }));
      });
      return r;
    }
    const resumenDafo = c => `${c.codigo ? c.codigo + " · " : ""}${corto(c.proceso || c.texto, 70)}${c.dafo ? ` (DAFO «${corto(c.dafo, 40)}»)` : ""}`;
    // Rellena el nombre del proceso y su descripción (el porqué) si están vacíos. No toca nada de lo que ya hay.
    function traerDeDafo(m, c, hoy) {
      const hecho = { proceso: false, descripcion: false };
      if (!lleno(m.proceso) && lleno(c.proceso || c.texto)) { m.proceso = corto(c.proceso || c.texto, 300); hecho.proceso = true; }
      if (!lleno(m.descripcion)) {
        const factor = `${(TIPO_DAFO[c.tipo] || "Factor").toLowerCase()}${c.codigo ? " " + c.codigo : ""}`;
        m.descripcion = [`Se analiza a partir del DAFO${c.dafo ? ` «${c.dafo}»` : ""}, ${factor}: «${c.texto}».`, c.motivo, lleno(c.evidencia) ? `Datos que lo apoyan: ${c.evidencia}` : ""].filter(lleno).join(" ").slice(0, 3000);
        hecho.descripcion = true;
      }
      m.origen.dafo = { id: c.dafoId, titulo: corto([c.dafo, c.codigo].filter(lleno).join(" · "), 300), appVersion: c.appVersion, traido: String(hoy || "").slice(0, 10) };
      return hecho;
    }

    // ---------- «Traer de Rondas» (paquete «rondas-seguridad» v1 de la app Rondas de Seguridad) ----------
    // Lee localStorage["rondas-intercambio"] o la copia .json de Rondas (clave «intercambio»). De cada unidad interesan sus
    // puntos calientes: lo que no se cumple en 2 de las 3 últimas rondas («repetido») o en todas las de un turno («turno»).
    // Devuelve { unidades } o { error } (y entonces no se trae nada). No usa código de Rondas.
    const FORMATO_RONDAS = "rondas-seguridad", VERSION_RONDAS = 1;
    const TURNOS_RONDAS = { manana: "mañana", tarde: "tarde", noche: "noche", finde: "fin de semana" };
    const esObj = x => !!x && typeof x === "object" && !Array.isArray(x);
    function leerRondas(o) {
      const t = (v, n) => typeof v === "string" || typeof v === "number" ? String(v).slice(0, n) : "";
      const ent = v => Number.isInteger(v) && v >= 0 && v < 10000 ? v : 0;
      if (esObj(o) && o.intercambio !== undefined) o = o.intercambio;
      else if (esObj(o) && o.app === "rondas" && o.formato === undefined && Array.isArray(o.unidades)) return { error: "Esta copia de Rondas de Seguridad no trae los datos preparados para otras apps. Ábrela en la versión actual de Rondas de Seguridad, haz una copia nueva y vuelve a intentarlo." };
      if (!esObj(o)) return { error: "No se reconocen datos de Rondas de Seguridad. Usa la copia de seguridad (.json) que descarga la app Rondas de Seguridad." };
      if (o.formato !== FORMATO_RONDAS) return { error: `No son datos de Rondas de Seguridad (formato «${t(o.formato, 40) || "desconocido"}»; se espera «${FORMATO_RONDAS}»). No se ha traído nada.` };
      if (o.version !== VERSION_RONDAS) return { error: `Los datos de Rondas de Seguridad vienen en la versión ${t(o.version, 10) || "?"} del formato y esta versión de Mapa de Riesgos lee la ${VERSION_RONDAS}. Actualiza las dos apps (recarga la página) y vuelve a intentarlo. No se ha traído nada.` };
      if (!Array.isArray(o.unidades)) return { error: "El paquete de Rondas de Seguridad no trae ninguna lista de unidades. No se ha traído nada." };
      const unidades = o.unidades.filter(esObj).slice(0, 200).map((u, i) => {
        const items = (Array.isArray(u.items) ? u.items : []).filter(esObj);
        const hechas = (Array.isArray(u.rondas) ? u.rondas : []).filter(r => esObj(r) && r.estado === "hecha");
        const fechas = hechas.map(r => t(r.fecha, 10)).filter(f => /^\d{4}-\d{2}-\d{2}$/.test(f)).sort();
        const calientes = (Array.isArray(u.puntosCalientes) ? u.puntosCalientes : []).filter(x => esObj(x) && lleno(t(x.texto, 400))).slice(0, 80).map(x => {
          const it = items.find(y => y.id === x.itemId) || {}, por = x.por === "turno" && TURNOS_RONDAS[x.turno] ? "turno" : "repetido";
          return { itemId: t(x.itemId, 40), texto: t(x.texto, 400).trim(), bloque: t(it.bloqueNombre, 100), por, turno: por === "turno" ? x.turno : "", fallos: ent(x.fallos), evaluadas: ent(x.evaluadas) };
        });
        return { id: t(u.id, 60) || "u" + (i + 1), unidad: t(u.unidad, 200).trim(), rondas: hechas.length, ultima: fechas[fechas.length - 1] || "", calientes, appVersion: t(o.appVersion, 20) };
      });
      return { unidades, generado: t(o.generado, 40) };
    }
    // «no se ha cumplido en 2 de las últimas 3 rondas» · «no se ha cumplido en ninguna de las 3 rondas de noche»
    const datoCaliente = p => p.por === "turno" ? `no se ha cumplido en ninguna de las ${p.evaluadas} rondas de ${TURNOS_RONDAS[p.turno]}` : `no se ha cumplido en ${p.fallos} de las últimas ${p.evaluadas} rondas`;
    const falloCaliente = p => `No se cumple: «${p.texto.replace(/\.$/, "")}»`;
    const resumenRondas = u => `${u.unidad || "Unidad sin nombre"} · ${plural(u.calientes.length, "punto caliente", "puntos calientes")}`;
    // Cada punto caliente elegido (ids) → un modo de fallo del AMFE del mapa, en el subproceso elegido (o sin subproceso), con
    // el dato de las rondas en «controles» (la ronda es el control que lo está detectando). Sin puntuar: G·O·D las pone el
    // equipo. Si ya hay un fallo igual, no se repite. Si coincide con un punto crítico de ese subproceso, quedan enlazados.
    function traerDeRondas(m, u, ids, subprocesoId, genId, hoy) {
      const hecho = { fallos: 0, repetidos: 0, enlazados: 0 };
      if (!LA) return hecho;
      const sub = m.subprocesos.some(s => s.id === subprocesoId) ? subprocesoId : "";
      const fecha = /^\d{4}-\d{2}-\d{2}/.test(hoy || "") ? String(hoy).slice(0, 10).split("-").reverse().join("/") : "";
      u.calientes.filter(p => !Array.isArray(ids) || ids.includes(p.itemId)).forEach(p => {
        const texto = falloCaliente(p);
        if (m.fallos.some(f => normal(f.fallo) === normal(texto))) { hecho.repetidos++; return; }
        const f = LA.nuevoFallo(genId(), m.fallos.reduce((x, y) => Math.max(x, Number(y.num) || 0), 0) + 1);
        Object.assign(f, { subprocesoId: sub, fallo: texto.slice(0, 1000),
          controles: `Rondas de seguridad${u.unidad ? ` (${u.unidad})` : ""}: ${datoCaliente(p)}${u.ultima ? `; última ronda el ${u.ultima.split("-").reverse().join("/")}` : ""}. Traído de la app Rondas de Seguridad${fecha ? " el " + fecha : ""}.`.slice(0, 1000) });
        const pt = m.puntos.find(y => y.subprocesoId === sub && sub && !m.fallos.some(z => z.puntoId === y.id) && parecido(y.titulo, p.texto));
        if (pt) { f.puntoId = pt.id; hecho.enlazados++; }
        m.fallos.push(f); hecho.fallos++;
      });
      return hecho;
    }

    // ---------- Ponte a prueba: test inicial y final (mejora M, solo en el dispositivo y sin nombres) ----------
    // resp = { índice de la pregunta: índice de la opción elegida }
    function resultadoTest(T, resp) {
      const porTema = {}; let bien = 0, hechas = 0;
      T.forEach((q, i) => {
        const x = porTema[q.t] || (porTema[q.t] = { bien: 0, total: 0, hechas: 0 }); x.total++;
        if (resp && Number.isInteger(resp[i])) { hechas++; x.hechas++; if (resp[i] === q.ok) { bien++; x.bien++; } }
      });
      return { bien, total: T.length, hechas, completo: hechas === T.length, pct: T.length ? Math.round(bien / T.length * 100) : 0, porTema };
    }
    // Lo guardado: { inicial: { fecha, resp }, final: { fecha, resp } }; respuestas fuera de rango, fuera
    function sanearTests(o, T) {
      const r = {};
      if (!o || typeof o !== "object") return r;
      ["inicial", "final"].forEach(k => {
        const x = o[k]; if (!x || typeof x !== "object" || !x.resp || typeof x.resp !== "object") return;
        const resp = {};
        Object.keys(x.resp).forEach(i => { const n = Number(i), v = x.resp[i]; if (T[n] && Number.isInteger(v) && v >= 0 && v < T[n].o.length) resp[n] = v; });
        r[k] = { fecha: typeof x.fecha === "string" ? x.fecha.slice(0, 30) : "", resp };
      });
      return r;
    }

    // ---------- Modo presentación (mejora I): lo que se ve al tocar un paso del mapa ----------
    function fallosDelPaso(m, pasoId) {
      if (!LA) return [];
      const b = flujoBase(m);
      return LA.ordenarFallos(enMapa(m).filter(f => ubicacionMapa(m, b, f).includes(pasoId))).map(f => ({
        id: f.id, num: f.num, fallo: f.fallo, efecto: f.efecto, causa: f.causa, subproceso: (subDe(m, f.subprocesoId) || {}).nombre || "",
        ipr: LA.iprDe(f), iprMapa: iprMapa(m, f), nivel: nivelMapa(m, f), critico: marcaCritico(f), acciones: LA.accionesDe(f).map(a => ({ que: a.que, quien: a.quien, estado: a.estado }))
      }));
    }

    // ---------- Hoja de trabajo para las sesiones en papel (plantillas de los ejercicios 6, 8, 10 y 13) ----------
    // Con lo que ya tiene el mapa escrito y filas en blanco para completar; después se pasa a la app con «Pegar desde Excel».
    function documentoHoja(m, fecha) {
      const nom = m.proceso || m.titulo || "", B = [], S = m.subprocesos.filter(s => lleno(s.nombre)), vacias = (n, k) => Array.from({ length: n }, () => Array(k).fill(" "));
      B.push({ t: "h1", texto: "Hoja de trabajo del mapa de riesgos" });
      B.push({ t: "p", texto: [nom || "Proceso: ______________________________", m.unidad, fecha].filter(lleno).join(" · "), estilo: "nota" });
      B.push({ t: "p", texto: "Para las sesiones del equipo en papel. Después, pasad lo escrito a la app (cada tabla se puede pegar desde Excel en su paso)." });
      B.push({ t: "h2", texto: "1. Subprocesos (ejercicio 6 · paso 2)" });
      B.push({ t: "tabla", cab: ["Subproceso", "Descripción", "Inicio", "Fin", "Roles"], filas: S.map(s => [s.nombre, s.descripcion, s.inicio, s.fin, s.roles]).concat(vacias(Math.max(3, 7 - S.length), 5)), anchos: [22, 26, 17, 17, 18], fuente: 9 });
      B.push({ t: "salto" });
      B.push({ t: "h2", texto: "2. Puntos críticos (ejercicio 8 · paso 4)" });
      B.push({ t: "p", texto: "Escribe lo que puede salir mal, no su consecuencia ni su solución.", estilo: "nota" });
      B.push({ t: "tabla", cab: ["Subproceso", "Error o punto crítico", "Descripción del error o riesgo"], filas: (S.length ? S : [{ nombre: " " }, { nombre: " " }, { nombre: " " }]).flatMap(s => [[s.nombre, " ", " "], [" ", " ", " "], [" ", " ", " "]]), anchos: [24, 34, 42], fuente: 9 });
      B.push({ t: "salto" });
      B.push({ t: "h2", texto: "3. Fallos, efectos y causas (ejercicio 10 · pasos 6 y 7)" });
      B.push({ t: "p", texto: "G = gravedad, O = ocurrencia, D = detección, de 1 a 10. IPR = G × O × D.", estilo: "nota" });
      B.push({ t: "tabla", cab: ["Nº", "Subproceso", "Modo de fallo", "Efecto", "Causa", "G", "O", "D", "IPR"], filas: vacias(14, 9), anchos: [5, 15, 21, 19, 19, 5, 5, 5, 6], fuente: 9 });
      B.push({ t: "salto" });
      B.push({ t: "h2", texto: "4. Acciones de mejora 5W1H (ejercicio 13 · paso 8)" });
      B.push({ t: "tabla", cab: ["Nº fallo", "Qué", "Por qué", "Dónde", "Cuándo", "Quién", "Cómo", "Indicador"], filas: vacias(10, 8), anchos: [7, 17, 13, 10, 9, 12, 17, 15], fuente: 9 });
      return { titulo: "Hoja de trabajo · " + (nom || "Mapa de Riesgos"), bloques: B, horizontal: true };
    }

    const sugerirObjetivo = m => LF.sugerirObjetivo(m).replace("sin pérdidas de información entre profesionales", "minimizando los riesgos para el paciente");

    return {
      VERSION_DATOS, MOTORES, comprobarMotor,
      // [eco]
      URL_AMFE, URL_FLUJO, URL_AUD, URL_IND, URL_TM, URL_DAFO, URL_RONDAS, URL_LC, URL_ACR,
      // [/eco]
      lleno, corto, normal, plural, listaY, sinTildes,
      FASES, PASOS, nuevoMapa, nuevoSubproceso, nuevoPunto,
      subDe, subDePunto, idPunto, ordenPuntos, puntosDeSub, puntosPorSub,
      avisosProceso, avisosSubprocesos, avisosFlujo, avisosPuntos, avisosDe,
      progreso, pasoPendiente, siguientePaso, resumen,
      propuestas, aceptarPropuesta, anadirPunto, colocarPunto,
      leerFlujograma, resumenFlujo, traerDeFlujograma,
      avisosEquipo, avisosFallos, avisosPuntuar, avisosPriorizar, avisosAnalisis, TECNICAS, textoMetodologia, pasarPuntosAlAmfe, puntoDe,
      introduccionSugerida, conclusionesSugeridas, notaCalidad, diasRevision, nuevaEdicion, compararEdiciones, avisosCierre, nuevoControl,
      documentoFinal, documentoResumen, documentoAcogida, ESTILOS_XLSX, hojasExcel, paqueteAuditorias, iprMapa,
      CRITERIOS_ACCIONES, avisosAcciones, ubicacion, enMapa, flujoBase, puntosMapa, COLOR_NIVEL, calorSub, dibujoMapa, tituloMapa, leyendaMapa, sinUbicar, avisosMapa, sugerirTextoMapa,
      leerAmfe, resumenAmfe, traerDeAmfe, TIPO_DAFO, leerDafo, resumenDafo, traerDeDafo, FORMATO_RONDAS, VERSION_RONDAS, leerRondas, datoCaliente, falloCaliente, resumenRondas, traerDeRondas, resultadoTest, sanearTests, fallosDelPaso, documentoHoja, FORMATO_INTERCAMBIO, VERSION_INTERCAMBIO, frecuenciaSugerida, hallazgos, paqueteIntercambio, leerIntercambio,
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
