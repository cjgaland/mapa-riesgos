// Tests de la lógica de Mapa de Riesgos: node tests/logic.test.mjs
// Los motores de AMFE y Flujograma NO se copian: se cargan de sus carpetas hermanas del Escritorio,
// igual que en la web se cargan de ../amfe/ y ../flujograma/.
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";
const require = createRequire(import.meta.url);
const aqui = path.dirname(fileURLToPath(import.meta.url));
const ESCRITORIO = path.resolve(aqui, "../../..");
const LF = require(path.join(ESCRITORIO, "Flujograma/Aplicación/logic.js"));
const LA = require(path.join(ESCRITORIO, "AMFE/Aplicación/logic.js"));
const D = require(path.join(ESCRITORIO, "Flujograma/Aplicación/dibujo.js"));
const { crear, MOTORES, comprobarMotor } = require("../logic.js");
const C = require("../contenido.js");

let ok = 0, mal = 0;
const t = (nombre, cond) => { if (cond) ok++; else { mal++; console.log("✕", nombre); } };
let n = 0; const genId = () => "t" + (n++);
const clon = o => JSON.parse(JSON.stringify(o));

// ---------- Motores en vivo ----------
t("motor de Flujograma compatible", comprobarMotor("flujo", LF) === "");
t("motor de AMFE compatible", comprobarMotor("amfe", LA) === "");
t("sin motor se avisa", /No se ha podido cargar/.test(comprobarMotor("flujo", null)));
t("motor de otra versión se avisa", /otra versión/.test(comprobarMotor("flujo", Object.assign({}, LF, { MOTOR: 2 }))));
t("función que falta se avisa", /le falta: disponer/.test(comprobarMotor("flujo", Object.assign({}, LF, { disponer: undefined, MOTOR: 1 })) ) || /le falta/.test(comprobarMotor("flujo", (() => { const o = Object.assign({}, LF); delete o.disponer; return o; })())));
// Todo lo que esta app usa del motor de Flujograma está en el contrato que Flujograma se compromete a mantener
t("lo que se usa de Flujograma está en su contrato", MOTORES.flujo.usa.every(k => LF.CONTRATO.includes(k)) || console.log("   fuera del contrato:", MOTORES.flujo.usa.filter(k => !LF.CONTRATO.includes(k)).join(", ")));
t("no se ha copiado el motor (logic.js propio no define disponer)", !/function disponer/.test(require("fs").readFileSync(path.join(aqui, "../logic.js"), "utf8")));
// Y lo que se usa de AMFE está en su contrato (la lista CONTRATO_MAPA de sus tests)
{
  const txt = require("fs").readFileSync(path.join(ESCRITORIO, "AMFE/Aplicación/tests/logic.test.mjs"), "utf8"), i = txt.indexOf("CONTRATO_MAPA = {"), bloque = i < 0 ? "" : txt.slice(i, txt.indexOf("};", i));
  const fuera = MOTORES.amfe.usa.filter(k => !new RegExp(`"${k}"`).test(bloque));
  t("lo que se usa de AMFE está en su contrato", !fuera.length || console.log("   fuera del contrato de AMFE:", fuera.join(", ")));
}
const usadas = (f, v) => [...new Set((require("fs").readFileSync(path.join(aqui, "..", f), "utf8").match(new RegExp(`\\b${v}\\.([A-Za-z_0-9]+)`, "g")) || []).map(x => x.split(".")[1]))];
t("todo lo usado de AMFE está declarado", [...usadas("logic.js", "LA"), ...usadas("app.js", "A")].filter(k => !["filter", "map", "length", "some", "every", "find", "push", "forEach"].includes(k) && !MOTORES.amfe.usa.includes(k)).length === 0 || console.log("   sin declarar:", [...usadas("logic.js", "LA"), ...usadas("app.js", "A")].filter(k => !MOTORES.amfe.usa.includes(k)).join(", ")));
t("todo lo usado de Flujograma está declarado", [...usadas("logic.js", "LF"), ...usadas("app.js", "LF")].every(k => MOTORES.flujo.usa.includes(k)));
const L = crear(LF, LA);

// ---------- Modelo ----------
const m = L.nuevoMapa("m1", "2026-10-23");
t("un mapa es un flujograma del motor", ["actores", "subprocesos", "pasos", "puntos", "vista", "marco"].every(k => k in m));
t("y lleva lo propio", "ambito" in m && "descripcion" in m && m.origen && m.origen.flujo);
t("10 pasos en 4 fases", L.PASOS.length === 10 && L.FASES.length === 4 && L.FASES.flatMap(f => f.pasos).length === 10);
t("entrega 1 = pasos 1 a 4", L.PASOS.filter(p => p.entrega === 1).map(p => p.n).join() === "1,2,3,4");

// ---------- Avisos ----------
const av = (f, x) => f.map(a => a.texto).join(" | ");
t("proceso vacío avisa", /nombre del proceso/.test(av(L.avisosProceso(m))));
m.proceso = "Urgencias";
t("nombre de unidad avisa", /parece el nombre de una unidad/.test(av(L.avisosProceso(m))));
m.proceso = "Atención integral en el Servicio de Urgencias";
t("nombre de proceso no avisa", !/unidad/.test(av(L.avisosProceso(m))));
t("sin subprocesos avisa", /Divide el proceso/.test(av(L.avisosSubprocesos(m))));
m.subprocesos.push(Object.assign(L.nuevoSubproceso("s1", 0), { nombre: "Triaje" }));
t("un solo subproceso avisa", /Solo hay un subproceso/.test(av(L.avisosSubprocesos(m))));
t("subproceso sin roles avisa", L.avisosSubprocesos(m).some(a => a.sub === "s1" && /quién interviene/.test(a.texto)));
m.subprocesos.push(Object.assign(L.nuevoSubproceso("s2", 1), { nombre: "triaje" }));
t("subproceso repetido avisa", /repetido/.test(av(L.avisosSubprocesos(m))));
// Puntos críticos sin flujograma
const x1 = L.anadirPunto(m, genId, "s1");
t("punto en su subproceso", L.subDePunto(m, x1).id === "s1" && L.idPunto(m, x1) === "1.1");
x1.titulo = "Implantar un checklist de triaje";
t("punto escrito como solución avisa", L.avisosPuntos(m).some(a => a.punto === x1.id && /solución/.test(a.texto)));
x1.titulo = "Empeoramiento del paciente";
t("punto escrito como efecto avisa", L.avisosPuntos(m).some(a => a.punto === x1.id && /efecto/.test(a.texto)));
x1.titulo = "Clasificación errónea del nivel de prioridad";
t("punto bien escrito sin avisos de redacción", !L.avisosPuntos(m).some(a => a.punto === x1.id && /(efecto|solución)/.test(a.texto)));
t("subproceso sin punto avisa", /«triaje» no tiene ningún punto crítico/.test(av(L.avisosPuntos(m))));

// ---------- Saneado ----------
const sucio = Object.assign(clon(m), { ambito: 42, raro: "x", puntos: [Object.assign(clon(x1), { subprocesoId: "no-existe" }), Object.assign(clon(x1), { id: "p2", num: 2, subprocesoId: "s2" })] });
const s = L.sanearMapa(sucio, genId, "2026");
t("saneado conserva lo propio", s.ambito === "42" && !("raro" in s));
t("saneado recupera el subproceso del punto", s.puntos[1].subprocesoId === "s2" && s.puntos[0].subprocesoId === "");
t("saneado rechaza basura", L.sanearMapa(null, genId, "") === null && L.sanearDatos({}, genId, "") === null);
const d1 = { mapas: [Object.assign(clon(s), { modificado: "2026-01-01" })] }, d2 = { mapas: [Object.assign(clon(s), { modificado: "2026-02-01", proceso: "Nuevo" })] };
t("fusionar se queda el más reciente", L.fusionar(d1, d2).mapas[0].proceso === "Nuevo" && L.fusionar(d2, d1).mapas[0].proceso === "Nuevo");

// ---------- Ejemplo de Urgencias ----------
const U = L.sanearMapa(clon(C.EJEMPLOS.mapas[0]), genId, "2026");
t("ejemplo: 7 subprocesos", U.subprocesos.length === 7);
t("ejemplo: 33 pasos y 5 calles", U.pasos.length === 33 && U.actores.length === 5);
t("ejemplo: 49 puntos críticos, 7 por subproceso", U.puntos.length === 49 && U.subprocesos.every(sb => L.puntosDeSub(U, sb.id).length === 7));
t("ejemplo: cada punto en su paso y en el subproceso de su paso", U.puntos.every(x => x.pasoId && LF.pasoDe(U, x.pasoId).subprocesoId === x.subprocesoId));
t("ejemplo: el flujograma no tiene errores", LF.errores(U).length === 0);
t("ejemplo: sin avisos de puntos críticos", L.avisosPuntos(U).length === 0);
t("ejemplo: sin avisos de subprocesos ni del proceso", L.avisosSubprocesos(U).length === 0 && L.avisosProceso(U).length === 0);
t("ejemplo: pasos 1 a 4 hechos", [1, 2, 3, 4].every(k => L.progreso(U)[k]));
t("ejemplo: puntos numerados como los fallos del AMFE (1 a 49)", U.puntos.map(x => x.num).join() === Array.from({ length: 49 }, (_, i) => i + 1).join());
t("ejemplo: punto 10 = constantes en el triaje", /constantes/.test(U.puntos[9].titulo) && L.subDePunto(U, U.puntos[9]).nombre === "Triaje de enfermería" && L.idPunto(U, U.puntos[9]) === "2.3");
t("ejemplo: valoración médica con los fallos 22-28 del AMFE (no la errata)", /Anamnesis/.test(U.puntos[21].titulo) && !/Espera prolongada/.test(L.puntosDeSub(U, U.subprocesos[3].id)[0].titulo));
// Mismos textos que los fallos 1-49 del AMFE de Urgencias de la app AMFE (comparando la primera palabra con contenido)
const dib = LF.dibujar(U);
t("ejemplo: se dibuja con marco y avisos", dib.marco && dib.iconos.length >= 10 && dib.ancho > 0);
t("ejemplo: aviso de la recepción con los nº 3, 5, 7 (como la página 15)", dib.iconos.some(i => i.texto === "3, 5, 7"));
t("ejemplo: el SVG se genera", /<svg/.test(D.svg(dib, { numeros: true })));
t("siguiente paso con el ejemplo apunta más allá del paso 4", L.siguientePaso({ mapas: [U] }, 1).k === "listo");
t("siguiente paso sin mapas", L.siguientePaso({ mapas: [] }, 1).k === "crear");
t("siguiente paso de un mapa a medias", L.siguientePaso({ mapas: [m] }, 1).k === "paso1");

// ---------- Propuestas sobre el flujograma ----------
const P = L.propuestas(U);
t("propuestas de puntos críticos del motor", P.length > 0 && P.every(p => p.clave && p.pasoId));
const xp = L.aceptarPropuesta(U, P[0], genId);
t("propuesta aceptada con su subproceso", xp.subprocesoId === LF.pasoDe(U, xp.pasoId).subprocesoId && !L.propuestas(U).some(p => p.clave === P[0].clave));
const xq = L.anadirPunto(U, genId, "", U.pasos[5].id);
t("punto añadido en un paso toma su subproceso", xq.subprocesoId === U.pasos[5].subprocesoId && xq.pasoId === U.pasos[5].id);
L.colocarPunto(U, xq, U.pasos[11].id);
t("colocar el punto en otro paso cambia su subproceso", xq.subprocesoId === U.pasos[11].subprocesoId);

// ---------- Traer de Flujograma ----------
const FEJ = require(path.join(ESCRITORIO, "Flujograma/Aplicación/contenido.js")).EJEMPLOS.flujos.find(f => f.id === "ej-fl-radiografia");
const flujoUsuario = Object.assign(LF.sanearFlujo(clon(FEJ), genId, "2026"), { id: "fl-radio" });
flujoUsuario.puntos[0].fallos = ["3"];
const paquete = LF.paqueteIntercambio([flujoUsuario], "2026.06", "2026-10-23");
t("leer el paquete de Flujograma", L.leerFlujograma(paquete).length === 1);
t("leer la copia .json de Flujograma", L.leerFlujograma({ app: "flujograma", flujos: [], intercambio: paquete }).length === 1);
t("rechazar otro formato", L.leerFlujograma({ formato: "amfe-fallos", version: 1, amfes: [] }) === null && L.leerFlujograma({ formato: "flujograma-procesos", version: 2, flujos: [] }) === null);
const fl = L.leerFlujograma(paquete)[0];
const mt = L.nuevoMapa("m-traer", "2026");
const r = L.traerDeFlujograma(mt, fl, genId, "2026.06", "2026-10-23");
t("trae proceso, subprocesos, calles, pasos y puntos", r.proceso && r.subprocesos === fl.subprocesos.length && r.actores === fl.actores.length && r.pasos === fl.pasos.length && r.puntos === fl.puntos.length);
t("lo traído no tiene errores", LF.errores(mt).length === LF.errores(flujoUsuario).length);
t("flechas rehechas con los ids nuevos", mt.pasos.every(p => p.siguientes.every(s => LF.pasoDe(mt, s.a))));
t("puntos en su paso y con sus nº de fallo", mt.puntos.every(x => LF.pasoDe(mt, x.pasoId)) && mt.puntos[0].fallos.join() === "3");
t("puntos con el subproceso de su paso", mt.puntos.every(x => !LF.pasoDe(mt, x.pasoId).subprocesoId || x.subprocesoId === LF.pasoDe(mt, x.pasoId).subprocesoId));
t("se anota de dónde viene", mt.origen.flujo.id === "fl-radio" && mt.origen.flujo.traido === "2026-10-23" && fl.appVersion === "2026.06");
const r2 = L.traerDeFlujograma(mt, fl, genId, "2026.06", "2026-10-23");
t("traer dos veces no duplica", r2.subprocesos === 0 && r2.pasos === 0 && r2.pasosOmitidos && mt.subprocesos.length === fl.subprocesos.length);
t("lo traído sobrevive al saneado", L.sanearMapa(clon(mt), genId, "2026").puntos.every((x, i) => x.subprocesoId === mt.puntos[i].subprocesoId));
// Un subproceso que ya existía con el mismo nombre se reutiliza
const mt2 = L.nuevoMapa("m-traer2", "2026"); mt2.subprocesos.push(Object.assign(L.nuevoSubproceso("ya", 0), { nombre: fl.subprocesos[0].nombre }));
L.traerDeFlujograma(mt2, fl, genId, "2026.06", "2026-10-23");
t("empareja subprocesos por nombre", mt2.subprocesos.length === fl.subprocesos.length && mt2.pasos.some(p => p.subprocesoId === "ya"));

// ---------- Copiar y duplicar ----------
const cp = L.renovarIds(clon(U), genId);
t("las propuestas aceptadas no vuelven tras copiar", !L.propuestas(cp).some(p => p.clave === cp.puntos.find(x => x.origen === "propuesta").clave));
t("ids nuevos y referencias rehechas", cp.id !== U.id && !JSON.stringify(cp).includes("ej-mapa") && cp.puntos.every(x => LF.pasoDe(cp, x.pasoId) && cp.subprocesos.some(sb => sb.id === x.subprocesoId)) && LF.errores(cp).length === 0);

// ---------- Contenido ----------
t("Aprende: los 8 temas", C.TEMAS.length === 8 && C.TEMAS_PROX.length === 0 && C.TEMAS.map(x => x.n).join() === "1,2,3,4,5,6,7,8");
t("temas completos", C.TEMAS.every(x => x.minuto.length && x.secciones.length && x.minicaso && x.practica.href));
t("glosario sin repetidos", new Set(C.GLOSARIO.map(g => g[0])).size === C.GLOSARIO.length && C.GLOSARIO.length >= 25);

// ---------- Entrega 2 · el AMFE dentro del mapa ----------
t("un mapa es también un AMFE", ["equipo", "sesiones", "fallos", "escalas", "prioridad"].every(k => k in L.nuevoMapa("x", "")) && L.nuevoMapa("x", "").prioridad.n === "15");
t("ejemplo: equipo de 10 y 3 sesiones", U.equipo.length === 10 && U.sesiones.length === 3 && U.sesiones.every(s => s.asistentes.length === 10));
t("ejemplo: 49 fallos, cada uno con su punto crítico (mismo nº y subproceso)", U.fallos.length === 49 && U.fallos.every(f => { const x = L.puntoDe(U, f); return x && x.num === f.num && x.subprocesoId === f.subprocesoId; }));
const IPR_CURSO = { 10: 343, 8: 336, 5: 294, 15: 294, 29: 294, 9: 252, 23: 252, 36: 252, 45: 252, 7: 216, 16: 216, 30: 216, 43: 216, 3: 210, 11: 180, 6: 36, 20: 45 };
t("ejemplo: mismos IPR que el curso", Object.entries(IPR_CURSO).every(([n, v]) => LA.iprDe(U.fallos.find(f => f.num === Number(n))) === v));
t("ejemplo: los 15 prioritarios y en el orden del curso", LA.prioritarios(U).map(f => f.num).join() === "10,8,5,15,29,9,23,36,45,7,16,30,43,3,11");
t("ejemplo: pasos 5, 6 y 7 hechos", [5, 6, 7].every(k => L.progreso(U)[k]));
t("ejemplo: los avisos del AMFE no llevan el nº de paso de la app AMFE", [5, 6, 7].every(n => L.avisosDe(U, n).every(a => !("paso" in a))));
t("ejemplo: sin errores al puntuar ni avisos de prioridad sin motivo", !L.avisosAnalisis(U).some(a => a.nivel === "error" || /motivo/.test(a.texto)));
t("ejemplo: aviso de empate en el corte (nº 18, 22, 35, 37)", L.avisosPriorizar(U).some(a => /18, 22, 35, 37/.test(a.texto)));
t("ejemplo: metodología con caso, lluvia de ideas y grupo nominal", /análisis de un caso real o simulado, lluvia de ideas y técnica de grupo nominal, en 3 sesiones/.test(L.textoMetodologia(U)));
// Saneado de la parte de AMFE: lo hace el motor de AMFE y se conserva el punto crítico de cada fallo
const U2 = L.sanearMapa(Object.assign(clon(U), { fallos: [...clon(U.fallos), { id: "malo", num: 3, fallo: "Repetido", g: "99", puntoId: "no-existe" }] }), genId, "2026");
t("saneado AMFE: nº repetido renumerado y punto roto fuera", U2.fallos.length === 50 && U2.fallos.find(f => f.id === "malo").num === 50 && U2.fallos.find(f => f.id === "malo").puntoId === "" && U2.fallos[0].puntoId === U.fallos[0].puntoId);
t("saneado AMFE: técnicas desconocidas fuera", L.sanearMapa(Object.assign(clon(U), { metodologia: { tecnicas: ["lluvia", "magia"], texto: 5 } }), genId, "").metodologia.tecnicas.join() === "lluvia");
t("saneado sin motor de AMFE conserva los fallos", crear(LF, null).sanearMapa(clon(U), genId, "").fallos.length === 49);
// Pasar los puntos críticos al AMFE
const mp = L.sanearMapa(clon(C.EJEMPLOS.mapas[0]), genId, ""); mp.fallos = [];
t("pasar los puntos al AMFE crea 49 fallos con su nº", L.pasarPuntosAlAmfe(mp, genId) === 49 && mp.fallos.every(f => f.num === L.puntoDe(mp, f).num && f.fallo === L.puntoDe(mp, f).titulo));
t("pasar dos veces no duplica", L.pasarPuntosAlAmfe(mp, genId) === 0 && mp.fallos.length === 49);
mp.puntos.push(Object.assign(L.nuevoPunto("nuevo-pt", 3, mp.subprocesos[0].id), { titulo: "Otro riesgo en la recepción" }));
t("un punto nuevo con nº ocupado toma el siguiente libre", L.pasarPuntosAlAmfe(mp, genId) === 1 && mp.fallos.find(f => f.puntoId === "nuevo-pt").num === 50);
t("avisa de puntos críticos sin pasar", L.avisosFallos(Object.assign(clon(mp), { fallos: mp.fallos.slice(0, 10) })).some(a => a.k === "puntos"));
// Traer de AMFE con el paquete real que genera la app AMFE para su ejemplo de Urgencias
const AC = require(path.join(ESCRITORIO, "AMFE/Aplicación/contenido.js"));
const amfeOrig = LA.sanearAmfe(clon(AC.EJEMPLOS.amfes ? AC.EJEMPLOS.amfes.find(a => a.id === "ej-amfe-urg") : AC.EJEMPLOS.find(a => a.id === "ej-amfe-urg")), genId, "2026");
amfeOrig.id = "amfe-real"; amfeOrig.fallos[0].manual = "si"; amfeOrig.fallos[0].motivo = "Lo decide el equipo";
const pqA = LA.paqueteIntercambio([amfeOrig], "2026.06", "2026-10-23");
t("leer el paquete de AMFE", L.leerAmfe(pqA).length === 1 && L.leerAmfe({ amfes: [], intercambio: pqA }).length === 1 && L.leerAmfe({ formato: "flujograma-procesos", version: 1, flujos: [] }) === null);
const a1 = L.leerAmfe(pqA)[0], ma = L.nuevoMapa("m-amfe", "2026");
const ra = L.traerDeAmfe(ma, a1, genId, a1.appVersion, "2026-10-23");
t("trae proceso, 7 subprocesos, 49 fallos y sus acciones", ra.proceso && ra.subprocesos === 7 && ra.fallos === 49 && ra.acciones === 9 && ma.origen.amfe.appVersion === "2026.06");
t("misma prioridad que en AMFE", LA.prioritarios(ma).map(f => f.num).join() === LA.prioritarios(amfeOrig).map(f => f.num).join());
t("se respeta lo marcado a mano", ma.fallos.find(f => f.num === amfeOrig.fallos[0].num).manual === "si");
t("trae los controles y el residual", ma.fallos.find(f => f.num === 10).controles.length > 10 && LA.iprResidual(ma.fallos.find(f => f.num === 10)) > 0);
t("traer dos veces no duplica los fallos", L.traerDeAmfe(ma, a1, genId, "", "").fallosOmitidos && ma.fallos.length === 49 && ma.subprocesos.length === 7);
// Con los puntos críticos del ejemplo, los fallos traídos se enlazan con su punto por subproceso y título
const mU = L.sanearMapa(clon(C.EJEMPLOS.mapas[0]), genId, ""); mU.fallos = [];
const rU = L.traerDeAmfe(mU, a1, genId, "", "");
t("los fallos traídos se enlazan con los puntos críticos del mapa", rU.enlazados >= 40 && rU.subprocesos === 0);
t("lo traído sobrevive al saneado", L.sanearMapa(clon(ma), genId, "").fallos.length === 49);
// Paquete «mapariesgos-mapas» v1 para otras apps (Auditorías)
const mu = Object.assign(clon(U), { id: "usuario-1" });
const pq = L.paqueteIntercambio([U, mu], "2026.02", "2026-10-23");
t("paquete: formato y versión, sin ejemplos", pq.formato === "mapariesgos-mapas" && pq.version === 1 && pq.mapas.length === 1);
t("paquete: bloque amfe con la forma de amfe-fallos (lo lee el motor de AMFE)", LA.leerIntercambio({ formato: "amfe-fallos", version: 1, amfes: [pq.mapas[0].amfe] }).length === 1 && pq.mapas[0].amfe.fallos.length === 49);
t("paquete: bloque flujo con la forma de flujograma-procesos (lo lee el motor de Flujograma)", LF.leerIntercambio({ formato: "flujograma-procesos", version: 1, flujos: [pq.mapas[0].flujo] }).length === 1 && pq.mapas[0].flujo.dibujo.nodos.length === 33);
t("paquete: 15 hallazgos con frecuencia proporcional al riesgo", pq.mapas[0].hallazgos.length === 15 && pq.mapas[0].hallazgos[0].frecuencia === "trimestral" && pq.mapas[0].hallazgos[14].frecuencia === "semestral");
t("leer el paquete propio", L.leerIntercambio(pq).length === 1 && L.leerIntercambio({ mapas: [], intercambio: pq }).length === 1 && L.leerIntercambio(pqA) === null);
t("frecuencia: gravedad 9-10 al menos semestral", L.frecuenciaSugerida(100, 9) === "semestral" && L.frecuenciaSugerida(100, 5) === "anual" && L.frecuenciaSugerida(0, 9) === "");
// Copiar el ejemplo con su AMFE
const cpa = L.renovarIds(clon(U), genId);
t("copiar: fallos enlazados a sus puntos y asistentes al equipo", cpa.fallos.every(f => cpa.puntos.some(x => x.id === f.puntoId)) && cpa.sesiones.every(s => s.asistentes.every(id => cpa.equipo.some(x => x.id === id))) && LA.prioritarios(cpa).length === 15);

// ---------- Entrega 3 · acciones de mejora y el mapa ----------
t("ejemplo: 15 acciones, una por fallo prioritario, con indicador y estándar", LA.prioritarios(U).every(f => f.acciones.length === 1 && f.acciones[0].indicador.nombre && f.acciones[0].indicador.estandar) && U.fallos.reduce((s, f) => s + f.acciones.length, 0) === 15);
t("ejemplo: paso 8 hecho y criterios de selección marcados", L.progreso(U)[8] && Object.values(U.criteriosAcciones).every(Boolean));
t("ejemplo: las acciones no tienen avisos salvo vencimientos", L.avisosAcciones(U, "2025-11-01").length === 0);
t("ejemplo: paso 9 hecho (todos los prioritarios en el mapa)", L.progreso(U)[9] && L.sinUbicar(U).length === 0);
const DM = L.dibujoMapa(U), avisoDe = n => DM.iconos.filter(i => i.nums.includes(n));
t("mapa: los avisos de la página 15", ["3, 5, 7", "8, 9, 10, 11", "15, 16", "23, 45", "43, 45"].every(x => DM.iconos.some(i => i.texto === x)));
t("mapa: el 29 y el 30 en los dos traslados", avisoDe(29).length === 2 && avisoDe(30).length === 2 && avisoDe(29).every(i => i.texto === "29, 30"));
t("mapa: color por nivel de IPR (triaje rojo, recepción naranja)", avisoDe(10)[0].nivel === "muyalto" && avisoDe(3)[0].nivel === "alto");
t("mapa: con el marco de procesos y su título", DM.marco && L.tituloMapa(U) === "Mapa de riesgo del Servicio de Urgencias");
t("mapa: el SVG lleva el título y los avisos coloreados", (s => s.includes("Mapa de riesgo del Servicio de Urgencias") && s.includes("fl-icono--muyalto") && s.includes("fl-icono--alto"))(D.svg(DM, { cabecera: L.tituloMapa(U) })));
t("mapa: draw.io se genera con los avisos", (x => /<mxfile/.test(x) && (x.match(/8, 9, 10, 11/g) || []).length >= 1)(D.drawio(DM, { titulo: L.tituloMapa(U), id: U.id })));
t("mapa: «todos» enseña los 49", (() => { const T = Object.assign(clon(U), { vistaMapa: Object.assign({}, U.vistaMapa, { mostrar: "todos" }) }); return L.enMapa(T).length === 49 && L.dibujoMapa(T).iconos.reduce((s, i) => s + i.nums.length, 0) >= 49; })());
t("mapa: calor por subproceso colorea las bandas", (() => { const T = Object.assign(clon(U), { vistaMapa: Object.assign({}, U.vistaMapa, { calor: true }) }); const d = L.dibujoMapa(T); return d.bandas.some(b => b.color === L.COLOR_NIVEL.muyalto) && d.bandas.some(b => /IPR máx\. 343/.test(b.nombre)); })());
t("mapa: leyenda con los 15, por número o por IPR", L.leyendaMapa(U).length === 15 && L.leyendaMapa(U)[0].num === 3 && L.leyendaMapa(Object.assign(clon(U), { vistaMapa: Object.assign({}, U.vistaMapa, { leyenda: "ipr" }) }))[0].num === 10);
t("mapa: un fallo crítico lleva borde", (() => { const T = clon(U); T.fallos.find(f => f.num === 3).critico = true; T.fallos.find(f => f.num === 3).motivoCritico = "x"; return L.dibujoMapa(T).iconos.find(i => i.nums.includes(3)).critico === true; })());
// Ubicación: por defecto el paso del punto crítico; si el equipo elige, esos pasos
const fU = U.fallos.find(f => f.num === 10);
t("ubicación por defecto: el paso del punto crítico", L.ubicacion(U, fU).join() === L.puntoDe(U, fU).pasoId);
t("ubicación elegida por el equipo", L.ubicacion(U, U.fallos.find(f => f.num === 29)).length === 2);
const sinPunto = clon(U); sinPunto.fallos.find(f => f.num === 8).puntoId = "";
t("un prioritario sin punto ni ubicación queda sin colocar y se avisa", L.sinUbicar(sinPunto).map(f => f.num).join() === "8" && L.avisosMapa(sinPunto).some(a => /nº 8/.test(a.texto)) && !L.progreso(sinPunto)[9]);
t("saneado: pasos de ubicación rotos fuera", L.sanearMapa(Object.assign(clon(U), { fallos: U.fallos.map(f => Object.assign(clon(f), { pasos: f.num === 29 ? ["no-existe", U.pasos[16].id] : f.pasos })) }), genId, "").fallos.find(f => f.num === 29).pasos.join() === U.pasos[16].id);
t("saneado: vista y textos del mapa", (x => x.vistaMapa.mostrar === "prioritarios" && x.vistaMapa.calor === false && x.textosMapa.objetivos === "")(L.sanearMapa(Object.assign(clon(U), { vistaMapa: { mostrar: "raro", calor: "si" }, textosMapa: 7 }), genId, "")));
// Sin flujograma: mapa por subprocesos
const SF = clon(U); SF.pasos = []; SF.puntos.forEach(x => { x.pasoId = ""; });
const DS = L.dibujoMapa(SF);
t("sin flujograma: una caja por subproceso con sus fallos", DS.nodos.filter(n => n.tipo === "actividad").length === 7 && DS.iconos.length === 7 && L.sinUbicar(SF).length === 0 && L.avisosMapa(SF).some(a => /por subprocesos/.test(a.texto)));
// Textos propuestos
t("textos del mapa propuestos", ["objetivos", "estructura", "interpretacion"].every(k => L.sugerirTextoMapa(U, k).length > 80) && /15 fallos prioritarios/.test(L.sugerirTextoMapa(U, "estructura")) && /Triaje de enfermería/.test(L.sugerirTextoMapa(U, "interpretacion")));
// Paquete: los hallazgos llevan la acción y el indicador
t("paquete: hallazgos con acción e indicador", (h => h.accion.length > 10 && /≥ 95 %/.test(h.indicador))(L.paqueteIntercambio([Object.assign(clon(U), { id: "u-1" })], "x", "x").mapas[0].hallazgos[0]));
t("copiar el ejemplo conserva la ubicación de los fallos", (c => L.ubicacion(c, c.fallos.find(f => f.num === 29)).length === 2 && L.sinUbicar(c).length === 0)(L.renovarIds(clon(U), genId)));

// ---------- Entrega 4 · documento final y cierre ----------
const Dx = require("../docx.js"), Xx = require("../xlsx.js");
const DF = L.documentoFinal(U, "23/10/2026", { png: new Uint8Array([137, 80, 78, 71]), w: 100, h: 200, svg: "<svg/>" });
const h1 = DF.bloques.filter(b => b.t === "h1").map(b => b.texto);
t("documento final: los 11 apartados del curso, en orden", ["1. Índice", "2. Introducción", "3. Descripción del proceso", "4. Identificación de puntos críticos", "5. Análisis AMFE", "6. Acciones de mejora", "7. Mapa de Riesgos", "8. Conclusiones", "9. Anexo I: Escalas de priorización en AMFE", "10. Anexo II: Tablas de fallos priorizados", "11. Matriz de riesgo"].every((x, i) => h1.includes(x) && (i === 0 || h1.indexOf(x) > h1.indexOf(["1. Índice", "2. Introducción", "3. Descripción del proceso", "4. Identificación de puntos críticos", "5. Análisis AMFE", "6. Acciones de mejora", "7. Mapa de Riesgos", "8. Conclusiones", "9. Anexo I: Escalas de priorización en AMFE", "10. Anexo II: Tablas de fallos priorizados", "11. Matriz de riesgo"][i - 1]))));
const h2 = DF.bloques.filter(b => b.t === "h2").map(b => b.texto);
t("documento final: subapartados 3.1 a 7.4", ["3.1. Objetivo del proceso", "3.2. Subprocesos incluidos", "4.1. Tabla de subprocesos y riesgos detectados", "5.1. Utilidad del AMFE en la gestión de riesgos", "5.2. Composición del equipo de trabajo", "5.3. Metodología empleada", "5.4. Resultados del análisis", "5.5. Fallos con mayor criticidad (IPR más elevado)", "6.1. Criterios para seleccionar acciones", "6.2. Tabla de acciones propuestas para los fallos con mayor IPR", "6.3. Justificación y alineación con auditoría", "7.1. Objetivos del mapa", "7.2. Estructura del flujograma", "7.3. Interpretación y utilidad", "7.4. Mapa de Riesgo"].every(x => h2.includes(x)));
const tablas = DF.bloques.filter(b => b.t === "tabla");
t("documento final: 15 prioritarios, 15 acciones, 15 hallazgos y la imagen del mapa", tablas.some(b => b.cab && b.cab[0] === "Subproceso" && b.filas.length === 15) && tablas.some(b => b.cab && b.cab[3] === "Acción de mejora (qué)" && b.filas.length === 15) && tablas.some(b => b.cab && b.cab[1] === "Hallazgo clave (fallo prioritario)" && b.filas.length === 15) && DF.bloques.some(b => b.t === "imagen"));
t("documento final: 7 tablas de puntos críticos (una por subproceso) y los 49 fallos dos veces en el anexo II", tablas.filter(b => b.cab && b.cab[2] === "Error o punto crítico").length === 7 && tablas.filter(b => b.cab && b.cab[0] === "Subproceso" && b.filas.length === 49).length === 2);
t("documento final: matriz 5 × 5 con zonas de color", tablas.some(b => b.cab && b.cab[0] === "G \\ O" && b.filas.length === 5 && b.filas.every(f => f.slice(1).every(c => c.fondo))));
t("documento final: sin textos escritos usa los propuestos", DF.bloques.some(b => b.t === "p" && /gestión proactiva/.test(b.texto)) && DF.bloques.some(b => b.t === "lista" && b.items.some(x => /49 fallos potenciales/.test(x))));
const bytes = Dx.construirDocx(Object.assign({ pie: "x" }, DF));
t("documento final: se construye el Word con la imagen", bytes.length > 10000 && new TextDecoder().decode(bytes).includes("word/media/imagen1.png"));
t("resumen y ficha de acogida", L.documentoResumen(U, "x", null).bloques.some(b => b.t === "tabla" && b.cab && b.cab[0] === "Nº" && b.filas.length === 5) && L.documentoAcogida(U, "x").bloques.filter(b => b.t === "h1").length === 7 && Dx.construirDocx(L.documentoAcogida(U, "x")).length > 5000);
const XL = L.hojasExcel(U, "x");
t("Excel: 5 hojas con los 49 fallos, las 15 acciones y los 15 hallazgos", XL.hojas.length === 5 && XL.hojas[0].filas.length === 49 + 3 && XL.hojas[1].filas.length === 15 + 3 && XL.hojas[2].filas.length === 15 + 3 && Xx.construirLibroXlsx(XL).length > 5000);
t("conclusiones propuestas con las cifras", /49 fallos potenciales/.test(L.conclusionesSugeridas(U)) && /15 fallos prioritarios/.test(L.conclusionesSugeridas(U)) && /IPR de 343 a 180/.test(L.conclusionesSugeridas(U)));
t("nota de calidad: el ejemplo solo tiene pendiente lo del paso 10", L.notaCalidad(U).filter(x => !x.ok).every(x => x.paso === 10));
const UC = clon(U); UC.conclusiones = "Hecho."; UC.proxRevision = "2027-10-23"; UC.control.elaborado[0] = { nombre: "", cargo: "Coordinación de Calidad", ubicacion: "Hospital" }; UC.control.aprobado[0] = { nombre: "", cargo: "Gerencia", ubicacion: "" };
t("paso 10 hecho con conclusiones, control y revisión", L.progreso(UC)[10] && L.notaCalidad(UC).every(x => x.ok) && !L.progreso(U)[10]);
t("control: se guarda la ubicación", L.sanearMapa(clon(UC), genId, "").control.elaborado[0].ubicacion === "Hospital" && L.nuevoMapa("x", "").control.elaborado[0].ubicacion === "");
t("control en el documento con nombre, cargo y ubicación", L.documentoFinal(UC, "x", null).bloques.some(b => b.t === "tabla" && b.cab && b.cab[3] === "Ubicación" && b.filas[0][3] === "Hospital"));
t("revisión: días que faltan y aviso si ha pasado", L.diasRevision(UC, "2027-10-13") === 10 && L.diasRevision(L.nuevoMapa("r", "")) === null && L.diasRevision(U, "2026-10-23") === 12 && L.avisosCierre(Object.assign(clon(UC), { proxRevision: "2020-01-01" })).some(a => /ya ha pasado/.test(a.texto)));
t("aviso si una acción baja la gravedad", L.avisosCierre((x => { x.fallos.find(f => f.num === 10).residual.g = "3"; return x; })(clon(U))).some(a => /baja la gravedad/.test(a.texto)));
// Mapa «después»: colores con el IPR tras las acciones
const UD = Object.assign(clon(U), { vistaMapa: Object.assign({}, U.vistaMapa, { despues: true }) });
t("mapa después: el triaje deja de ser rojo y el título lo dice", L.dibujoMapa(UD).iconos.find(i => i.nums.includes(10)).nivel !== "muyalto" && /tras las acciones/.test(L.tituloMapa(UD)) && L.leyendaMapa(UD).find(x => x.num === 10).ipr === 84);
// Ediciones
const E1 = L.nuevaEdicion(UC, genId, "2027-10-23T10:00:00Z");
t("nueva edición: copia con nº siguiente, enlazada y con su línea en el histórico", E1.edicion === "01" && E1.anteriorId === UC.id && E1.id !== UC.id && E1.control.historial.slice(-1)[0].edicion === "01" && E1.proxRevision === "");
E1.fallos.find(f => f.num === 10).d = "3"; E1.fallos = E1.fallos.filter(f => f.num !== 49);
const CE = L.compararEdiciones(UC, E1);
t("comparar ediciones: cambios de IPR y fallos quitados", CE.filas.length === 1 && CE.filas[0].num === 10 && CE.filas[0].antes === 343 && CE.filas[0].ahora === 147 && CE.quitados.join() === "49" && !CE.nuevos.length);
// Llevar a Auditorías: el archivo lo acepta el «Traer de AMFE» de Auditorías (paquete amfe-fallos v1 dentro de «intercambio»)
const AU = require(path.join(ESCRITORIO, "Auditorías/Aplicación/logic.js"));
const arch = { app: "mapariesgos", intercambio: L.paqueteAuditorias(Object.assign(clon(U), { id: "mapa-aud" }), "2026.04", "2026-10-23") };
const leidoAud = AU.leerAmfe ? AU.leerAmfe(JSON.parse(JSON.stringify(arch))) : null;
t("Auditorías reconoce el archivo con su «Traer de AMFE»", leidoAud && !leidoAud.error && leidoAud.amfes.length === 1);
const mAud = leidoAud && leidoAud.amfes ? AU.mapaDesdeAmfe(leidoAud.amfes[0], genId, "2026-10-23") : null;
t("y crea un mapa con los 49 riesgos y los 15 hallazgos clave", mAud && mAud.mapa.riesgos.length === 49 && mAud.mapa.riesgos.filter(r => r.clave).length === 15);

// ---------- Entrega 5: Ponte a prueba, minicasos, presentación, «Traer de DAFO» y hoja de trabajo ----------
t("test del curso: 30 preguntas, 5 por tema, con la respuesta dentro de sus opciones", C.TEST.length === 30 && [1, 2, 3, 4, 5, 6].every(k => C.TEST.filter(q => q.t === k).length === 5) && C.TEST.every(q => q.o.length === 5 && q.ok >= 0 && q.ok < 5 && q.e) && Object.keys(C.TEMAS_TEST).every(k => C.TEMAS.some(x => x.n === C.TEMAS_TEST[k].aprende)));
t("las preguntas de los temas 2, 4 y 5 son las mismas que en AMFE", (() => { const CA = require(path.join(ESCRITORIO, "AMFE/Aplicación/contenido.js")); return CA.TEST.every(q => C.TEST.some(x => x.q.replace(/[“”«»]/g, "") === q.q.replace(/[“”«»]/g, "") && x.o[x.ok] === q.o[q.ok])); })());
const RT = L.resultadoTest(C.TEST, Object.fromEntries(C.TEST.map((q, i) => [i, i < 10 ? q.ok : (q.ok + 1) % 5])));
t("resultado del test: total y por tema", RT.bien === 10 && RT.completo && RT.porTema[1].bien === 5 && RT.porTema[2].bien === 5 && RT.porTema[3].bien === 0 && RT.pct === 33);
t("test guardado: se limpia lo que no vale", (() => { const s = L.sanearTests({ inicial: { fecha: "2026-10-23", resp: { 0: 1, 1: 9, 99: 0, x: 2 } }, otro: {} }, C.TEST); return s.inicial && Object.keys(s.inicial.resp).join() === "0" && !s.otro && !s.final; })() && Object.keys(L.sanearTests(null, C.TEST)).length === 0);
const EJ = C.EJEMPLOS.mapas.map(m => L.sanearMapa(clon(m), genId, "2026-10-23"));
const UE = EJ[0], fN = n => UE.fallos.find(f => f.num === n), pN = n => UE.pasos.find(p => p.num === n);
t("¿dónde va este fallo?: cada pregunta tiene una sola respuesta buena", C.EJERCICIOS.donde.every(x => x.opciones.filter(n => L.ubicacion(UE, fN(x.num)).includes(pN(n).id)).length === 1));
t("¿de qué color es?: hay de los cuatro niveles", new Set(C.EJERCICIOS.color.map(n => LA.nivelIPR(LA.iprDe(fN(n))).k)).size === 4);
t("caso clínico: cada punto crítico existe en el ejemplo y hay frases que no lo son", C.CASO.frases.filter(x => x.c).every(x => UE.puntos[x.p - 1]) && C.CASO.frases.some(x => !x.c) && !/Jiménez|María/.test(JSON.stringify(C.CASO)));
t("minicasos: los 5 se sanean y se abren", EJ.length === 6 && C.EJEMPLOS.minicasos.length === 5 && C.EJEMPLOS.minicasos.every(x => EJ.some(m => m && m.id === x.id)));
const MC = id => EJ.find(m => m.id === id);
t("minicaso de transfusión: la app avisa de 2 fallos fuera del mapa", L.sinUbicar(MC("ej-mapa-transfusion")).map(f => f.num).sort().join() === "3,4");
t("minicaso de medicación: un aviso agrupa 9 fallos", L.dibujoMapa(MC("ej-mapa-medicacion")).iconos.some(i => i.nums.length === 9) && L.avisosMapa(MC("ej-mapa-medicacion")).some(a => /agrupa 9 fallos/.test(a.texto)));
t("minicaso de analítica: el subproceso de más riesgo sin acciones", L.avisosAcciones(MC("ej-mapa-analitica")).some(a => /Extracción y envío/.test(a.texto)) && !L.avisosAcciones(UE).some(a => a.sub));
t("minicaso de CMA: 3 puntos críticos escritos como soluciones", L.avisosPuntos(MC("ej-mapa-cma")).filter(a => /parece una solución/.test(a.texto)).length === 3);
t("minicaso de hospital de día: baja a verde y avisa de la gravedad", L.leyendaMapa(Object.assign(clon(MC("ej-mapa-hdia")), { vistaMapa: { mostrar: "prioritarios", calor: false, titulo: "", leyenda: "num", despues: true } })).every(x => x.nivel === "bajo") && L.avisosCierre(MC("ej-mapa-hdia")).some(a => /baja la gravedad/.test(a.texto)));
t("presentación: los fallos de un paso con su acción", (() => { const F = L.fallosDelPaso(UE, pN(17).id); return F.map(f => f.num).join() === "29,30" && F[0].acciones.length === 1 && F[0].efecto && F[0].nivel; })() && L.fallosDelPaso(UE, pN(1).id).length === 0);
// «Traer de DAFO» con el paquete real que genera la app DAFO
{
  const LD = require(path.join(ESCRITORIO, "DAFO/Aplicación/logic.js")), CD = require(path.join(ESCRITORIO, "DAFO/Aplicación/contenido.js"));
  const dafos = clon((CD.EJEMPLOS.dafos || CD.EJEMPLOS.lista || [])).map(d => LD.sanearDafo ? LD.sanearDafo(d, genId, "2026-10-23") || d : d);
  const fc = dafos[0] && dafos[0].factores.find(f => f.candidato && f.candidato.destino);
  if (fc) fc.candidato.destino = "mapa";
  const paq = LD.paqueteIntercambio(dafos, "2026.07", "2026-10-23");
  const CL = L.leerDafo(clon(paq));
  t("Traer de DAFO: lee el paquete real de DAFO (y su copia .json)", fc && CL && CL.length === 1 && CL[0].proceso === fc.candidato.proceso && L.leerDafo({ intercambio: clon(paq) }).length === 1 && L.leerDafo({ formato: "otro" }) === null);
  const MD = L.nuevoMapa("md", "");
  const hD = CL && L.traerDeDafo(MD, CL[0], "2026-10-23");
  t("Traer de DAFO: rellena el proceso y el porqué sin pisar nada", hD && hD.proceso && hD.descripcion && MD.proceso === fc.candidato.proceso && /DAFO/.test(MD.descripcion) && MD.origen.dafo.id === dafos[0].id && L.sanearMapa(clon(MD), genId, "").origen.dafo.id === dafos[0].id && !L.traerDeDafo(MD, CL[0], "x").proceso);
}
const HJ = L.documentoHoja(UE, "x");
t("hoja de trabajo: 4 tablas apaisadas con los subprocesos ya escritos", HJ.horizontal && HJ.bloques.filter(b => b.t === "tabla").length === 4 && HJ.bloques.find(b => b.t === "tabla").filas[0][0] === UE.subprocesos[0].nombre && Dx.construirDocx(HJ).length > 5000 && L.documentoHoja(L.nuevoMapa("h", ""), "x").bloques.length > 5);

// ---------- Traer de Rondas de Seguridad (paquete «rondas-seguridad» v1) ----------
// Se genera con la lógica real de la app Rondas de Seguridad (carpeta hermana) a partir de sus ejemplos, más una unidad a mano.
{
  const RA = path.join(ESCRITORIO, "Auditorías/Rondas de Seguridad/Aplicación");
  const RL = require(path.join(RA, "logic.js")), RC = require(path.join(RA, "contenido.js"));
  const us = RC.EJEMPLOS.unidades.map(u => RL.sanearUnidad(clon(u), genId, "2026-10-24"));
  const pq = RL.paqueteIntercambio(us, "2026.01", "2026-10-24T10:00:00.000Z");
  pq.unidades.push({ id: "u-mano", unidad: "Planta de Medicina Interna", items: [{ id: "id-01", bloqueNombre: "Identificación del paciente" }],
    rondas: [{ estado: "hecha", fecha: "2026-09-12" }, { estado: "hecha", fecha: "2026-10-11" }, { estado: "curso", fecha: "2026-11-10" }],
    puntosCalientes: [{ itemId: "id-01", texto: "Todos los pacientes llevan pulsera legible.", por: "repetido", fallos: 2, evaluadas: 3 }, { itemId: "y", texto: "  " }, 7, { itemId: "z", texto: "Raro.", por: "turno", turno: "luna", fallos: 2, evaluadas: 2 }] });
  const lr = L.leerRondas(pq);
  t("Rondas: paquete real válido", !lr.error && lr.unidades.length === 6);
  t("Rondas: el ejemplo de Urgencias trae su punto caliente de noche", JSON.stringify(lr.unidades[0].calientes.map(p => [p.itemId, p.por, p.turno, p.bloque])) === JSON.stringify([["cui-08", "turno", "noche", "Cuidados seguros"]]));
  t("Rondas: solo rondas hechas, la última fecha y puntos saneados (turno desconocido → repetido)", lr.unidades[5].rondas === 2 && lr.unidades[5].ultima === "2026-10-11" && lr.unidades[5].calientes.length === 2 && lr.unidades[5].calientes[1].por === "repetido");
  t("Rondas: desde su copia .json", L.leerRondas({ app: "rondas", unidades: [], intercambio: pq }).unidades.length === 6);
  t("Rondas: formato o versión equivocados no traen nada", /formato/.test(L.leerRondas(Object.assign({}, pq, { formato: "x" })).error) && /versión 2/.test(L.leerRondas(Object.assign({}, pq, { version: 2 })).error));
  t("Rondas: copia antigua y basura", /copia nueva/.test(L.leerRondas({ app: "rondas", unidades: [] }).error) && !!L.leerRondas(null).error && !!L.leerRondas([1]).error && !!L.leerRondas(Object.assign({}, pq, { unidades: 3 })).error);
  t("Rondas: el dato de cada punto", L.datoCaliente(lr.unidades[0].calientes[0]) === "no se ha cumplido en ninguna de las 3 rondas de noche" && L.datoCaliente(lr.unidades[5].calientes[0]) === "no se ha cumplido en 2 de las últimas 3 rondas");
  const mr = L.nuevoMapa("mr", "2026-10-24"); mr.subprocesos.push(Object.assign(L.nuevoSubproceso("s1", 1), { nombre: "Acogida" }));
  mr.fallos.push(Object.assign(LA.nuevoFallo("f0", 4), { fallo: "Ya estaba" }));
  const r1 = L.traerDeRondas(mr, lr.unidades[5], ["id-01"], "s1", genId, "2026-10-24");
  const f1 = mr.fallos[1];
  t("Rondas → fallos: solo los elegidos, numerados después del último", r1.fallos === 1 && mr.fallos.length === 2 && f1.num === 5);
  t("Rondas → fallos: modo de fallo, subproceso y dato en los controles", f1.fallo === "No se cumple: «Todos los pacientes llevan pulsera legible»" && f1.subprocesoId === "s1" && /Rondas de seguridad \(Planta de Medicina Interna\): no se ha cumplido en 2 de las últimas 3 rondas; última ronda el 11\/10\/2026\. Traído de la app Rondas de Seguridad el 24\/10\/2026\./.test(f1.controles));
  t("Rondas → fallos: sin puntuar (G·O·D las pone el equipo)", !f1.g && !f1.o && !f1.d);
  const r2 = L.traerDeRondas(mr, lr.unidades[5], null, "no-existe", genId, "2026-10-24");
  t("Rondas → fallos: traer dos veces no repite; subproceso que no existe → sin subproceso", r2.repetidos === 1 && r2.fallos === 1 && mr.fallos[2].subprocesoId === "");
  const sm = L.sanearMapa ? L.sanearMapa(clon(mr), genId) : (L.sanearDatos({ mapas: [clon(mr)] }, genId, "x") || { mapas: [] }).mapas[0];
  t("Rondas → fallos: sobreviven al saneado", sm && sm.fallos.length === 3 && sm.fallos[1].controles === f1.controles);
  { const L0 = crear(LF, null), m0 = L0.nuevoMapa("m0", "x"); t("Rondas → fallos: sin motor de AMFE no se hace nada", L0.traerDeRondas(m0, lr.unidades[5], null, "", genId, "x").fallos === 0 && !m0.fallos.length); }
}

console.log(`${ok} bien, ${mal} mal`);
if (mal) process.exit(1);
