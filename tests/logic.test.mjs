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
t("Aprende: 6 temas y 2 próximamente", C.TEMAS.length === 6 && C.TEMAS_PROX.length === 2);
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

console.log(`${ok} bien, ${mal} mal`);
if (mal) process.exit(1);
