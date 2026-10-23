// ============================================================
//  contenido.js — Solo datos · Mapa de Riesgos
//  Temas de «Aprende», glosario y ejemplos (el de Urgencias del curso).
//  HTML de confianza escrito a mano. window.Contenido en navegador y
//  module.exports en Node (tests).
// ============================================================
(function (raiz) {
  "use strict";

  // ---------- Aprende ----------
  // c = color de la tarjeta (P azul, H verde, V naranja, A morado); se usa solo como color
  const TEMAS = [
    { n: 1, c: "P", titulo: "Seguridad del paciente y riesgo", sub: "Por qué hace falta un mapa de riesgos",
      minuto: [
        "La <b>seguridad del paciente</b> es reducir al mínimo el riesgo de daño innecesario asociado a la atención sanitaria.",
        "Alrededor de <b>1 de cada 10 pacientes ingresados</b> sufre algún evento adverso, y una parte importante son evitables.",
        "La mayoría de los errores no se deben a una persona descuidada, sino a <b>procesos que permiten el error</b>: falta de protocolos, traspasos de información, sobrecarga.",
        "Un <b>mapa de riesgos</b> es la forma ordenada de buscar esos puntos débiles <b>antes</b> de que dañen a alguien."
      ],
      secciones: [
        { t: "¿Aceptarías ese riesgo en un avión?", h: `<p>Imagina que el comandante anuncia: «Tienen un 91 % de posibilidades de llegar sin sufrir ningún daño; la posibilidad de que un error les dañe es del 8 %, y de que el daño sea permanente o mortal, del 1 %». Nadie subiría a ese avión.</p>
          <p>Sin embargo, cifras parecidas son las que describen los estudios sobre eventos adversos en hospitales. La diferencia es que en sanidad <b>no las vemos</b> y tendemos a normalizarlas.</p>
          <p>Esta reflexión es el punto de partida: si no aceptamos ese riesgo para nosotros ni para nuestra familia, tenemos que buscarlo y reducirlo en nuestros procesos.</p>` },
        { t: "Por qué se producen los errores", h: `<ul><li><b>Factores humanos</b>: cansancio, prisas, falta de formación, comunicación incompleta.</li><li><b>Factores del sistema</b>: protocolos que no existen o están desactualizados, sistemas informáticos sin alertas, espacios mal organizados, sobrecarga de trabajo.</li><li><b>Factores externos</b>: presión asistencial, expectativas, normativa.</li></ul>
          <p>La cultura de seguridad pone el foco en el <b>sistema</b>: no se trata de buscar culpables, sino de cambiar el proceso para que el error sea difícil de cometer y fácil de detectar.</p>` },
        { t: "Gestión proactiva frente a reactiva", h: `<p>Notificar y analizar los incidentes que ya han ocurrido es imprescindible (gestión <b>reactiva</b>). Pero el mapa de riesgos va un paso antes: analiza el proceso para encontrar <b>lo que podría fallar</b> y actuar antes (gestión <b>proactiva</b>).</p>
          <p>Las dos se complementan: los incidentes notificados ayudan a encontrar puntos críticos, y el mapa ayuda a decidir dónde vigilar.</p>` }
      ],
      minicaso: "<p>En una planta de Medicina Interna nunca se ha notificado un error de identificación. ¿Significa que no hay riesgo? No: puede que no se detecten o no se notifiquen. Un mapa de riesgos del proceso de extracción de analíticas encontraría que la pulsera identificativa no se comprueba antes de extraer, y propondría una medida antes del primer error grave.</p>",
      practica: { texto: "Empezar un mapa de riesgos", href: "#/mapa/nuevo" } },
    { n: 2, c: "H", titulo: "Herramientas para encontrar riesgos", sub: "Lluvia de ideas, grupo nominal, Ishikawa, flujograma y matriz",
      minuto: [
        "La <b>lluvia de ideas</b> saca muchas ideas rápido, sin juzgarlas.",
        "La <b>técnica de grupo nominal</b> ordena esas ideas: cada persona puntúa y se suman los votos.",
        "El <b>diagrama de Ishikawa</b> (espina de pescado) busca las causas de un problema por categorías.",
        "El <b>flujograma</b> dibuja el proceso paso a paso; la <b>matriz de riesgos</b> sitúa cada fallo según su gravedad y su frecuencia."
      ],
      secciones: [
        { t: "Lluvia de ideas", h: `<p>Todo el equipo propone, en poco tiempo, qué puede salir mal en el proceso. Reglas: <b>cantidad antes que calidad</b>, nada se critica, se vale construir sobre la idea de otro. Después se agrupan las ideas parecidas.</p>${'<div class="box box--trampa"><span class="box-tag">Ojo, trampa</span><p>Si habla siempre la misma persona, la lluvia de ideas se convierte en su opinión. Una ronda en la que cada cual aporta una idea por turno lo evita.</p></div>'}` },
        { t: "Técnica de grupo nominal", h: `<p>Sirve para <b>priorizar por consenso</b> sin que pese más quien más habla: cada miembro, en silencio, reparte puntos (por ejemplo 3, 2 y 1) entre las ideas que considera más importantes. Se suman y se comentan los resultados.</p>` },
        { t: "Diagrama de Ishikawa y los «porqués»", h: `<p>Pone el problema en la cabeza del pez y las causas en las espinas: personal, procedimientos, equipamiento, entorno, comunicación, paciente y organización. Preguntar «¿por qué?» varias veces lleva a la <b>causa de fondo</b>, que es donde una acción de mejora funciona.</p>` },
        { t: "Flujograma y matriz de riesgos", h: `<p>El <b>flujograma</b> representa el proceso con símbolos normalizados y deja ver los traspasos y las decisiones, donde más se falla. La <b>matriz de riesgos</b> (parrilla de priorización) cruza gravedad y ocurrencia y pinta cada fallo en una zona de color: verde, amarillo, naranja o rojo.</p><p>En el mapa de riesgos se juntan las dos: el flujograma con los fallos encima, del color de su riesgo.</p>` }
      ],
      minicaso: "<p>Un equipo de quirófano hace una lluvia de ideas y salen 30 posibles fallos. Con el grupo nominal (3-2-1 puntos por persona) se quedan con los 8 más votados para analizarlos a fondo en el AMFE. El resto no se tira: queda anotado por si se revisa el mapa más adelante.</p>",
      practica: { texto: "Ver el ejemplo de Urgencias", href: "#/mapa/ej-mapa-urgencias/1" } },
    { n: 3, c: "V", titulo: "Procesos y subprocesos", sub: "Del mapa de procesos al proceso que se analiza",
      minuto: [
        "Un <b>proceso</b> es un conjunto de actividades relacionadas que transforman unas entradas en un resultado para el paciente.",
        "En el <b>mapa de procesos</b> de un centro hay procesos <b>estratégicos</b> (dirigen), <b>clave</b> (atienden al paciente) y <b>de soporte</b> (dan recursos).",
        "El mapa de riesgos se hace sobre un <b>proceso clave</b>, bien delimitado: dónde empieza y dónde acaba.",
        "Para analizarlo por partes se divide en <b>subprocesos</b>, cada uno con su inicio, su fin y quién interviene."
      ],
      secciones: [
        { t: "Cómo elegir el proceso", h: `<p>Elige un proceso <b>relevante para la seguridad del paciente</b>: con muchos profesionales, traspasos, decisiones rápidas, pacientes vulnerables o incidentes previos. Ejemplos: atención en Urgencias, administración de medicación, transfusión, preparación de quirófano, alta hospitalaria.</p>
          <div class="box box--trampa"><span class="box-tag">Ojo, trampa</span><p>«Urgencias» no es un proceso, es una unidad. El proceso es lo que se hace: «Atención integral al paciente en el Servicio de Urgencias, desde su llegada hasta la decisión sobre su destino».</p></div>` },
        { t: "Poner límites: el alcance", h: `<p>Decide qué hecho <b>abre</b> el proceso y cuál lo <b>cierra</b>, y qué queda dentro y fuera (por ejemplo, «adultos; quedan fuera las urgencias pediátricas»). Sin límites claros, el análisis crece sin control y nunca se termina.</p>` },
        { t: "Subprocesos", h: `<p>Un subproceso es una <b>fase</b> del proceso con su propio inicio y fin: en Urgencias, recepción y registro, triaje, sala de espera, valoración médica, pruebas, comunicación de resultados y gestión del ingreso.</p><p>Para cada uno anota su descripción, dónde empieza, dónde acaba y los <b>roles implicados</b>: te servirán para formar el equipo y para las calles del flujograma.</p>
          <div class="box box--practica"><span class="box-tag">En la práctica</span><p>Entre 3 y 8 subprocesos suele ir bien. Uno solo es demasiado grande; más de 10, demasiado detalle.</p></div>` },
        { t: "El flujograma del proceso", h: `<p>Con los subprocesos claros, se dibuja el <b>flujograma</b>: cada paso con su símbolo (inicio y fin, actividad, decisión, documento, datos, proceso externo), quién lo hace (las calles) y a qué paso sigue. Se revisa y <b>se valida con el equipo</b> que hace el proceso cada día, para que refleje lo que de verdad se hace.</p>` }
      ],
      minicaso: "<p>El equipo de una planta quiere analizar «la planta». El técnico de calidad le propone acotar: «Administración de medicación oral, desde la prescripción en la historia hasta el registro de la toma». Quedan 4 subprocesos: prescripción, validación farmacéutica, preparación y administración. Ahora sí es abordable.</p>",
      practica: { texto: "Ver los subprocesos de Urgencias", href: "#/mapa/ej-mapa-urgencias/2" } },
    { n: 4, c: "A", titulo: "Puntos críticos", sub: "Dónde puede fallar el proceso",
      minuto: [
        "Un <b>punto crítico</b> es un momento del proceso en el que puede producirse un fallo que dañe al paciente o rompa la continuidad de la atención.",
        "Se buscan <b>subproceso a subproceso</b>, mirando el flujograma.",
        "Donde más se falla: <b>traspasos</b> entre profesionales, <b>decisiones</b>, <b>identificación</b>, <b>registros</b>, <b>comunicación</b>, <b>traslados</b>, <b>medicación</b> y <b>esperas</b>.",
        "Cada punto crítico es un <b>candidato a modo de fallo</b> del AMFE."
      ],
      secciones: [
        { t: "Cómo buscarlos", h: `<ul><li>Recorre el flujograma paso a paso y pregunta: «¿qué puede salir mal aquí?».</li><li>Fíjate en las flechas que <b>cruzan de una calle a otra</b>: la información o el paciente cambian de manos.</li><li>Mira las <b>decisiones</b>: si se decide mal, el paciente va por el camino equivocado.</li><li>Usa un <b>caso real o simulado</b>: el curso parte de la historia de una paciente en Urgencias y de lo que cuenta cada profesional.</li><li>Revisa los <b>incidentes notificados</b> del proceso.</li></ul>` },
        { t: "Cómo escribirlos", h: `<p>Un título corto con <b>lo que puede salir mal</b> («No colocación de la pulsera identificativa») y una descripción del riesgo («El paciente no recibe su identificación física, con riesgo de errores en pruebas o tratamientos»).</p>
          <div class="box box--trampa"><span class="box-tag">Ojo, trampa</span><p>No escribas el <b>daño</b> («Error de identidad»): es el efecto, que irá en otra columna del AMFE. Y no escribas la <b>solución</b> («Implantar un checklist»): irá en las acciones de mejora.</p></div>` },
        { t: "Del punto crítico al mapa", h: `<p>Cada punto crítico se coloca en el <b>paso del flujograma</b> donde ocurre. En el AMFE se convierte en uno o varios modos de fallo, que se puntúan y se priorizan. Al final, en el mapa, los fallos prioritarios aparecen <b>en ese mismo paso</b>, con su número y del color de su riesgo.</p>` }
      ],
      minicaso: "<p>En el triaje de Urgencias, la enfermera asigna un nivel 3 a una paciente mayor con fiebre, taquicardia y tensión baja. Puntos críticos de ese paso: clasificación errónea de la prioridad, constantes que no se valoran como sospecha de sepsis, paciente frágil no detectado y pulsera identificativa no colocada.</p>",
      practica: { texto: "Ver los puntos críticos de Urgencias", href: "#/mapa/ej-mapa-urgencias/4" } }
  ];
  // Temas que llegarán con las próximas versiones (se muestran como «próximamente»)
  const TEMAS_PROX = [
    { n: 5, titulo: "El AMFE: fallo, efecto y causa", sub: "Gravedad, ocurrencia, detección e IPR" },
    { n: 6, titulo: "Priorizar los riesgos", sub: "IPR, los más graves y la matriz de riesgos" },
    { n: 7, titulo: "Acciones de mejora", sub: "5W1H, fuerza de la medida e indicadores" },
    { n: 8, titulo: "El mapa de riesgos", sub: "Qué es, cómo se lee y para qué se usa" }
  ];

  // ---------- Glosario ----------
  const GLOSARIO = [
    ["Seguridad del paciente", "Reducir al mínimo el riesgo de daño innecesario asociado a la atención sanitaria."],
    ["Evento adverso", "Daño al paciente causado por la atención sanitaria y no por su enfermedad."],
    ["Incidente", "Suceso que ha causado o podría haber causado un daño al paciente. Si no llega a dañar, es un incidente sin daño o un «casi error»."],
    ["Cultura de seguridad", "Forma de trabajar en la que se habla abiertamente de los errores para aprender de ellos, sin buscar culpables."],
    ["Gestión proactiva del riesgo", "Buscar lo que puede fallar antes de que ocurra. El mapa de riesgos y el AMFE son herramientas proactivas."],
    ["Mapa de riesgos", "Representación de los riesgos de un proceso: el flujograma con los fallos priorizados encima, coloreados según su riesgo, acompañado del análisis y de las acciones de mejora."],
    ["Mapa de procesos", "Dibujo de todos los procesos de un centro o unidad agrupados en estratégicos, clave y de soporte."],
    ["Procesos estratégicos", "Los que dirigen la organización: contrato programa, plan de calidad, gestión clínica, docencia, investigación…"],
    ["Proceso clave", "El que atiende directamente al paciente. Es el que se analiza en el mapa de riesgos."],
    ["Procesos de soporte", "Los que dan recursos a los procesos clave: recursos humanos, sistemas de información, farmacia, laboratorio, limpieza…"],
    ["Proceso", "Conjunto de actividades relacionadas que transforman unas entradas en un resultado para el paciente."],
    ["Subproceso", "Fase de un proceso con su propio inicio, su fin y sus roles implicados."],
    ["Alcance", "Qué queda dentro y qué queda fuera del análisis: dónde empieza y dónde acaba el proceso."],
    ["Flujograma", "Diagrama del proceso paso a paso con símbolos normalizados: inicio y fin, actividad, decisión, documento, datos y proceso externo."],
    ["Calle", "Columna del flujograma con los pasos que hace un mismo profesional o servicio."],
    ["Traspaso", "Momento en que el proceso pasa de un profesional a otro. Es uno de los puntos donde más se falla."],
    ["Punto crítico", "Momento del proceso en el que puede producirse un fallo con impacto en la seguridad del paciente o en la continuidad de la atención."],
    ["Lluvia de ideas", "Técnica de grupo para sacar muchas ideas en poco tiempo, sin juzgarlas."],
    ["Técnica de grupo nominal", "Técnica de consenso en la que cada miembro puntúa las ideas en silencio y se suman los votos."],
    ["Diagrama de Ishikawa", "Diagrama de espina de pescado que ordena las causas de un problema por categorías."],
    ["AMFE", "Análisis Modal de Fallos y Efectos: método proactivo para encontrar qué puede fallar en cada paso, qué pasaría, por qué, y priorizarlo."],
    ["Modo de fallo", "Lo que puede salir mal en un paso del proceso."],
    ["Efecto", "La consecuencia del fallo para el paciente o para el proceso."],
    ["Causa", "Por qué se produce el fallo."],
    ["IPR", "Índice de Prioridad de Riesgo: gravedad × ocurrencia × detección. Va de 1 a 1000; cuanto más alto, antes hay que actuar."],
    ["Matriz de riesgos", "Cuadrícula de gravedad por ocurrencia en la que cada fallo cae en una zona de color: verde, amarillo, naranja o rojo."],
    ["5W1H", "Forma de describir una acción de mejora: qué, por qué, dónde, cuándo, quién y cómo."],
    ["Control documental", "Datos de quién elabora, revisa y aprueba un documento, y el histórico de sus ediciones."],
    ["Plan de acogida", "Formación para los profesionales que se incorporan a una unidad. El mapa de riesgos les muestra de un vistazo dónde están los riesgos."],
    ["Ciclo PDCA", "Planificar, hacer, verificar y actuar: el ciclo de la mejora continua. El mapa de riesgos ayuda a planificar dónde actuar primero."],
    ["draw.io (diagrams.net)", "Programa gratuito de diagramas que usa el curso. La app exporta el flujograma en su formato."]
  ];

  // ---------- Ejemplos ----------
  // Pasos: [num, tipo, texto, actor (índice en actores o -1), salidas ("3" | "si:4,no:5" | "3,ida:7"), subproceso (índice o -1)]
  const TIPO = { T: "terminal", A: "actividad", D: "decision", Da: "datos", Doc: "documento", X: "externo" };
  function miniMapa(m) {
    const id = "ej-mapa-" + m.clave, pid = n => `${id}-p${n}`;
    const actores = m.actores.map((nombre, i) => ({ id: `${id}-a${i}`, nombre }));
    const subprocesos = (m.subprocesos || []).map((s, i) => Object.assign({ id: `${id}-s${i}`, descripcion: "", inicio: "", fin: "", roles: "", color: String(i), origenApp: "", origenId: "" }, s));
    const pasos = m.pasos.map(([n, t, texto, ac, sal, sub, con]) => ({
      id: pid(n), num: n, tipo: TIPO[t], texto, actorId: ac >= 0 ? actores[ac].id : "", subprocesoId: sub >= 0 && subprocesos[sub] ? subprocesos[sub].id : "",
      siguientes: String(sal || "").split(",").filter(Boolean).map(x => { const [a, b] = x.includes(":") ? x.split(":") : ["", x]; return { a: pid(b), etiqueta: a === "si" || a === "no" ? a : "", estilo: a === "ida" ? "idavuelta" : "normal" }; }),
      con: con ? pid(con) : "", nota: "", ajuste: { fila: "", lado: "" }
    }));
    // Puntos críticos por subproceso: [subproceso, paso (num o 0), título, descripción]; se numeran seguidos
    const puntos = (m.puntos || []).map(([sub, paso, titulo, descripcion], i) => ({ id: `${id}-c${i + 1}`, num: i + 1, pasoId: paso ? pid(paso) : "", subprocesoId: subprocesos[sub].id, titulo, descripcion, fallos: [], origen: "manual", clave: "" }));
    return Object.assign({ id, titulo: "", unidad: "", ambito: "", descripcion: "", objetivo: "", inicio: "", fin: "", incluye: "", excluye: "", responsable: "", fecha: "",
      puntos, exportado: "", descartes: [], vista: { orientacion: "vertical", calles: "actor", subprocesos: true, letra: "normal", numeros: true, marco: false },
      marco: { estrategicos: [], soporte: [] }, validado: "", amfe: { id: "", titulo: "", traido: "", fallos: [] }, edicion: "00", anteriorId: "", tipoEdicion: "actual",
      control: { elaborado: [], revisado: [], aprobado: [], historial: [] }, origen: {}, notas: "", creado: "2026-10-23T00:00:00.000Z", modificado: "2026-10-23T00:00:00.000Z" },
      m.meta, { actores, subprocesos, pasos });
  }

  const MARCO_URG = {
    estrategicos: ["Contrato programa", "Control de gestión", "Gestión clínica", "Plan de docencia", "Plan de investigación", "Plan de calidad", "Guías de práctica clínica"],
    soporte: ["Recursos humanos", "Documentación clínica", "Formación", "Sistemas de información", "Servicio de farmacia", "Servicio de radiodiagnóstico", "Servicio de laboratorio", "Cocina y limpieza", "Suministros"]
  };
  const URGENCIAS = miniMapa({ clave: "urgencias",
    meta: { titulo: "Mapa de Riesgos · Atención integral en Urgencias", proceso: "Atención integral en el Servicio de Urgencias", unidad: "Servicio de Urgencias", ambito: "Área asistencial de Urgencias hospitalarias",
      descripcion: "Comprende el conjunto de actividades que se desarrollan desde la llegada del paciente al Servicio de Urgencias hasta la decisión final sobre su destino: alta, ingreso hospitalario o derivación a otro dispositivo. Es uno de los circuitos más críticos del hospital: confluyen muchos profesionales, intervenciones rápidas y decisiones clínicas en poco tiempo, con riesgo de incidentes relacionados con la identificación, la priorización, la atención clínica, las pruebas diagnósticas y la continuidad asistencial.",
      objetivo: "Garantizar la atención segura, eficaz y continua del paciente que acude al Servicio de Urgencias hospitalarias, desde su llegada hasta la decisión final sobre su destino, respetando criterios clínicos, organizativos y de calidad asistencial.",
      inicio: "El paciente llega a Urgencias, por su propio pie o en ambulancia", fin: "Se decide y se hace efectivo su destino (alta, observación, ingreso, UCI o traslado)",
      incluye: "Pacientes adultos atendidos en Urgencias generales", excluye: "Urgencias pediátricas y obstétricas; la estancia en planta tras el ingreso",
      responsable: "Coordinación de Calidad y Seguridad del Paciente", fecha: "Octubre 2025",
      vista: { orientacion: "vertical", calles: "actor", subprocesos: true, letra: "normal", numeros: true, marco: true }, marco: MARCO_URG, validado: "2025-10-15",
      notas: "Ejemplo completo del curso: proceso y subprocesos del ejercicio 6, flujograma general del ejercicio 7 y puntos críticos del ejercicio 8 (los 49 que analiza el AMFE). Sin nombres de centro ni de personas. En la tabla de puntos críticos del documento del curso, los de «Valoración médica inicial» repiten por error los de la sala de espera: aquí se usan los del AMFE (fallos 22 a 28). En el flujograma se ha añadido la espera de resultados y se han reunido los destinos en cinco (domicilio, observación, ingreso, UCI y traslado); la sala de curas y el exitus del dibujo del curso no se representan." },
    actores: ["Celador", "Administrativo", "Enfermería", "TCAE", "Facultativo"],
    subprocesos: [
      { nombre: "Recepción y registro administrativo", descripcion: "Registro inicial y verificación de datos del paciente.", inicio: "Llegada del paciente al mostrador de admisión", fin: "Derivación al triaje", roles: "Administrativo, celador, paciente, acompañante" },
      { nombre: "Triaje de enfermería", descripcion: "Evaluación clínica inicial y asignación de prioridad.", inicio: "Recepción por enfermería de triaje", fin: "Derivación a sala de espera", roles: "Enfermería de triaje, celador" },
      { nombre: "Estancia en sala de espera", descripcion: "Permanencia del paciente hasta la atención clínica.", inicio: "Entrada en sala de espera", fin: "Llamada a consulta médica", roles: "TCAE, celador, paciente" },
      { nombre: "Valoración médica inicial", descripcion: "Exploración y toma de decisiones clínicas preliminares.", inicio: "Entrada a consulta médica", fin: "Solicitud de pruebas diagnósticas", roles: "Facultativo, paciente" },
      { nombre: "Pruebas diagnósticas y traslado", descripcion: "Realización y retorno de los estudios solicitados.", inicio: "Salida de la consulta para pruebas", fin: "Regreso a box o área de observación", roles: "Celador, técnico de rayos, enfermería, paciente" },
      { nombre: "Comunicación de resultados y decisión clínica", descripcion: "Valoración de las pruebas y decisión terapéutica.", inicio: "Disponibilidad de resultados clínicos", fin: "Decisión sobre el destino del paciente", roles: "Facultativo, paciente, familia" },
      { nombre: "Gestión del ingreso", descripcion: "Preparación y formalización del ingreso hospitalario.", inicio: "Confirmación del ingreso por el facultativo", fin: "Salida del paciente hacia planta", roles: "Facultativo, enfermería, administrativo, celador" }
    ],
    pasos: [
      [1, "T", "Acude por su propio pie", -1, "3", 0],
      [2, "T", "Llega en ambulancia", -1, "4", 0],
      [3, "A", "Recepción", 0, "5", 0],
      [4, "D", "¿Paciente crítico?", 0, "si:13,no:3", 0],
      [5, "A", "Registro de datos", 1, "6", 0],
      [6, "A", "Triaje", 2, "7", 1],
      [7, "A", "Traslado a la zona asignada", 0, "8", 1],
      [8, "D", "¿Prioridad vital?", 2, "si:13,no:9", 1],
      [9, "D", "¿Consulta libre?", 3, "si:12,no:10", 2],
      [10, "A", "Sala de espera", 3, "11", 2],
      [11, "A", "Llamada a consulta", 3, "12", 2],
      [12, "A", "Consulta médica", 4, "14", 3],
      [13, "A", "Sala de críticos", 4, "14", 3],
      [14, "D", "¿Precisa pruebas?", 4, "si:15,no:21", 3],
      [15, "A", "Extrae analítica y prepara al paciente", 2, "ida:16,17", 4],
      [16, "X", "Laboratorio", -1, "20", 4],
      [17, "A", "Traslado a Radiología", 0, "18", 4],
      [18, "X", "Radiología", -1, "19", 4],
      [19, "A", "Traslado de vuelta al box", 0, "20", 4],
      [20, "A", "Espera de resultados en sala", 3, "21", 4],
      [21, "A", "Valoración de resultados", 4, "22", 5],
      [22, "A", "Informa al paciente y a la familia", 4, "23", 5],
      [23, "D", "¿Precisa ingreso?", 4, "si:24,no:28", 5],
      [24, "D", "¿Ingreso en UCI?", 4, "si:32,no:25", 6],
      [25, "A", "Gestiona la cama y el ingreso", 1, "26", 6],
      [26, "A", "Traslado a planta", 0, "27", 6],
      [27, "T", "Ingreso hospitalario", -1, "", 6],
      [28, "D", "¿Alta a domicilio?", 4, "si:29,no:30", 5],
      [29, "T", "Alta a domicilio", -1, "", 5],
      [30, "D", "¿Queda en observación?", 4, "si:31,no:33", 5],
      [31, "T", "Observación", -1, "", 5],
      [32, "T", "Ingreso en UCI", -1, "", 6],
      [33, "T", "Traslado a otro centro", -1, "", 5]
    ],
    // Ejercicio 8 resuelto (los 49 puntos críticos, 7 por subproceso, que el AMFE analiza como fallos 1 a 49)
    puntos: [
      [0, 5, "Registro incorrecto del nombre o apellidos del paciente", "Se introducen errores tipográficos o datos erróneos que dificultan la correcta identificación del paciente."],
      [0, 5, "No identificación del paciente mediante DNI o tarjeta", "Se omite la verificación documental de identidad, aumentando el riesgo de errores administrativos."],
      [0, 3, "Omisión de datos clínicos relevantes (alergias, medicación)", "No se recogen o se pasan por alto antecedentes clave que deberían estar disponibles desde el inicio."],
      [0, 5, "No se registra acompañante o contacto", "Falta de información sobre personas responsables o acompañantes en caso de necesidad."],
      [0, 3, "El sistema no alerta de antecedentes clínicos relevantes", "La aplicación informática no dispone de alertas activas ante riesgos conocidos del paciente."],
      [0, 5, "No se valida el centro de salud de referencia", "Se asigna erróneamente un centro de atención primaria, dificultando la continuidad asistencial."],
      [0, 3, "Falta de protocolo ante paciente frágil", "Ausencia de guías o alertas que permitan una atención diferenciada y segura al paciente vulnerable."],
      [1, 6, "Clasificación errónea del nivel de prioridad (ej. 3 en lugar de 2)", "Se asigna un nivel de prioridad incorrecto, lo que puede causar retrasos en la atención y empeoramiento del estado clínico del paciente."],
      [1, 6, "No detección de paciente frágil o con deterioro cognitivo", "El triaje no identifica correctamente a pacientes vulnerables, lo que impide una atención prioritaria o una supervisión adecuada."],
      [1, 6, "Omisión de constantes clave o mal registro", "No se miden o se registran incorrectamente parámetros clínicos importantes, lo que puede llevar a fallos en la detección precoz de patologías como la sepsis."],
      [1, 6, "No colocación de pulsera identificativa", "El paciente no recibe su identificación física, con el consiguiente riesgo de errores en pruebas o tratamientos."],
      [1, 6, "No revisión de medicación habitual o tratamiento activo", "Se omite preguntar o documentar la medicación habitual, dificultando la conciliación posterior o la detección de interacciones."],
      [1, 6, "No documentación de contacto acompañante relevante", "Falta de registro del acompañante responsable, lo que puede dificultar la obtención de información clínica del paciente."],
      [1, 6, "Falta de priorización del malestar subjetivo del paciente", "No se tiene en cuenta el malestar expresado por el paciente, lo que puede generar desatención o consecuencias clínicas si se infravalora."],
      [2, 10, "Espera prolongada sin reevaluación clínica", "El paciente permanece un tiempo excesivo en la sala sin ser reevaluado, lo que puede conllevar un empeoramiento de su estado sin ser detectado a tiempo."],
      [2, 10, "Falta de acompañamiento o supervisión", "Algunos pacientes, especialmente los frágiles o dependientes, permanecen solos sin supervisión, con riesgo de caídas, desorientación o ansiedad."],
      [2, 10, "Falta de control térmico o ambiental", "La sala presenta condiciones ambientales inadecuadas (temperatura, ventilación), provocando incomodidad, estrés añadido o incluso hipo o hipertermia."],
      [2, 10, "No identificación visual del paciente (sin pulsera)", "La ausencia de pulsera identificativa puede dar lugar a errores en la citación, el traslado o las intervenciones previstas durante la espera."],
      [2, 10, "Pérdida de pertenencias o ayudas técnicas (gafas, bastón)", "La desorganización del entorno favorece que los pacientes extravíen objetos personales importantes como gafas, bastones o audífonos, dificultando su autonomía."],
      [2, 10, "Falta de comunicación sobre los tiempos estimados", "No se informa a los pacientes del tiempo aproximado de espera, lo que genera ansiedad e insatisfacción con la atención recibida."],
      [2, 10, "Peticiones no atendidas (baño, agua, información)", "Las necesidades básicas no se atienden con prontitud, provocando malestar físico y emocional, deshidratación y sensación de abandono."],
      [3, 12, "Anamnesis incompleta por falta de información del paciente", "Sin familiar acompañante o con deterioro cognitivo, la historia queda incompleta y el diagnóstico puede ser inexacto."],
      [3, 12, "No conciliación de medicación habitual", "Por falta de tiempo o de consulta de la historia previa no se concilia el tratamiento, con riesgo de interacciones, duplicidades o errores."],
      [3, 12, "Exploración física superficial o apresurada", "La sobrecarga asistencial o la fatiga llevan a una exploración rápida que omite signos relevantes."],
      [3, 12, "No valoración del contexto social o funcional del paciente", "Con el foco solo en lo biomédico, las decisiones clínicas pueden no ajustarse al perfil o la vulnerabilidad del paciente."],
      [3, 12, "Fallo en la solicitud de pruebas necesarias", "Por falta de experiencia o de coordinación no se piden las pruebas adecuadas, con retrasos diagnósticos o pruebas repetidas."],
      [3, 12, "No introducción en el sistema de diagnósticos o alertas clave", "La desorganización o los fallos informáticos impiden registrar diagnósticos o alertas, y se pierde la trazabilidad del caso."],
      [3, 12, "No comunicación efectiva con enfermería", "Médico y enfermería trabajan en paralelo sin comunicación estructurada, con descoordinación en los cuidados y retrasos."],
      [4, 17, "Pérdida o no colocación de la pulsera identificativa", "Puede generar errores de identificación y la realización de pruebas diagnósticas a pacientes equivocados."],
      [4, 19, "Confusión de camillas al volver de pruebas", "Supone riesgo de atención clínica incorrecta por fallo en la identificación visual del paciente en zonas comunes."],
      [4, 17, "Retraso excesivo en el transporte", "Provoca demoras significativas en la realización de pruebas o riesgo clínico por deterioro no monitorizado."],
      [4, 17, "Traslado sin información clínica mínima al técnico", "Dificulta la correcta ejecución e interpretación de la prueba solicitada, generando posibles omisiones o repeticiones."],
      [4, 18, "Prueba no realizada por fallo de citación o duplicidad", "Implica una demora en el diagnóstico y, en algunos casos, repetir innecesariamente la solicitud."],
      [4, 17, "Paciente vulnerable sin acompañamiento funcional", "Riesgo aumentado de caída, desorientación o estrés durante el traslado, especialmente en mayores o con deterioro cognitivo."],
      [4, 20, "Resultados no comunicados adecuadamente al médico", "Puede originar la omisión de decisiones clínicas oportunas por interrupciones o fallos en los sistemas de comunicación."],
      [5, 21, "No revisión o interpretación incompleta de resultados", "Se produce un diagnóstico erróneo o retrasado debido a saturación, distracciones o falta de seguimiento."],
      [5, 21, "No integración de datos clínicos previos y actuales", "Se toman decisiones descontextualizadas por falta de tiempo, historia clínica dispersa o desconocimiento del paciente."],
      [5, 22, "No comunicación al paciente o familiar", "Genera ansiedad, desinformación o resistencia al tratamiento, por pérdida de oportunidad o falta de cultura comunicativa."],
      [5, 22, "Comunicación técnica no adaptada al nivel del paciente", "El paciente no comprende el diagnóstico o no lo cumple adecuadamente por déficit en habilidades de comunicación clínica."],
      [5, 22, "Falta de registro de la información comunicada", "No se puede verificar que el paciente ha sido informado debido a la omisión de anotación en la historia clínica."],
      [5, 23, "Decisión médica sin valorar la situación funcional o social", "Puede derivar en tratamientos o ingresos inadecuados al no integrar el modelo biopsicosocial."],
      [5, 23, "No participación del paciente en la decisión", "Puede conllevar rechazo, pérdida de adherencia o conflicto ético por cultura paternalista, falta de tiempo o presión."],
      [6, 25, "Demora prolongada en encontrar cama disponible", "El paciente permanece en Urgencias más tiempo del necesario por falta de planificación anticipada."],
      [6, 25, "Ubicación provisional no monitorizada (pasillo, box compartido)", "Se ubica al paciente en espacios no adecuados, sin monitorización ni seguimiento efectivo."],
      [6, 26, "Falta de coordinación entre Urgencias y la planta receptora", "El traspaso de información es deficiente, provocando omisiones o discontinuidades asistenciales."],
      [6, 26, "No traslado de documentación clínica actualizada", "La información clínica no se entrega correctamente, generando riesgo en el tratamiento y los cuidados."],
      [6, 25, "No identificación clara del responsable del ingreso", "No queda claro quién asume la gestión del ingreso, lo que genera retrasos y pérdida de información."],
      [6, 24, "Ingreso sin valoración funcional del paciente", "El paciente es asignado a una unidad no adecuada a su perfil clínico por falta de valoración previa."],
      [6, 25, "Ausencia de notificación al familiar sobre el ingreso", "La familia no es informada, lo que puede conllevar confusión, pérdida de pertenencias o cuidados deficientes."]
    ] });

  const EJEMPLOS = {
    mapas: [URGENCIAS],
    urgencias: { t: "Atención integral en el Servicio de Urgencias", s: "El ejemplo completo del curso: 7 subprocesos, el flujograma general con sus 33 pasos y el marco de procesos, y los 49 puntos críticos que analiza el AMFE. Con cada versión de la app se irá completando hasta el documento final.", href: "#/mapa/ej-mapa-urgencias/1" }
  };

  const API = { TEMAS, TEMAS_PROX, GLOSARIO, EJEMPLOS };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else raiz.Contenido = API;
})(typeof window !== "undefined" ? window : this);
