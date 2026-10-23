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
t("Aprende: 4 temas y 4 próximamente", C.TEMAS.length === 4 && C.TEMAS_PROX.length === 4);
t("temas completos", C.TEMAS.every(x => x.minuto.length && x.secciones.length && x.minicaso && x.practica.href));
t("glosario sin repetidos", new Set(C.GLOSARIO.map(g => g[0])).size === C.GLOSARIO.length && C.GLOSARIO.length >= 25);

console.log(`${ok} bien, ${mal} mal`);
if (mal) process.exit(1);
