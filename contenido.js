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
      practica: { texto: "Ver los puntos críticos de Urgencias", href: "#/mapa/ej-mapa-urgencias/4" } },
    { n: 5, c: "V", titulo: "El AMFE: fallo, efecto y causa", sub: "Gravedad, ocurrencia, detección e IPR",
      minuto: [
        "El <b>AMFE</b> (Análisis Modal de Fallos y Efectos) analiza cada punto crítico de forma ordenada: <b>qué puede fallar</b>, <b>qué pasaría</b> y <b>por qué</b>.",
        "Lo hace un <b>equipo multidisciplinar</b> (al menos 6 perfiles, con quien hace el proceso cada día) en varias sesiones.",
        "Cada fallo se puntúa de 1 a 10 en <b>gravedad</b> (G), <b>ocurrencia</b> (O) y <b>detección</b> (D).",
        "<b>IPR = G × O × D</b>, de 1 a 1.000: cuanto más alto, antes hay que actuar."
      ],
      secciones: [
        { t: "Modo de fallo, efecto y causa", h: `<div class="table-wrap"><table class="mini"><tr><th>Columna</th><th>Pregunta</th><th>Ejemplo</th></tr>
          <tr><td><b>Modo de fallo</b></td><td>¿Qué sale mal?</td><td>No colocación de pulsera identificativa</td></tr>
          <tr><td><b>Efecto</b></td><td>¿Qué pasaría?</td><td>Error de identidad, confusión en pruebas o medicación</td></tr>
          <tr><td><b>Causa</b></td><td>¿Por qué?</td><td>Rutina interrumpida, recursos saturados</td></tr>
          <tr><td><b>Controles actuales</b></td><td>¿Qué hay hoy para evitarlo o detectarlo?</td><td>Protocolo de identificación; impresora de pulseras en el triaje</td></tr></table></div>
          <div class="box box--trampa"><span class="box-tag">Ojo, trampa</span><p>El error más frecuente: escribir una <b>causa</b> como fallo («sobrecarga asistencial», «falta de formación») o un <b>efecto</b> como fallo («daño al paciente»). La app te avisa cuando lo detecta.</p></div>` },
        { t: "Las escalas de 1 a 10", h: `<p><b>Gravedad</b>: cuánto daño haría si ocurre (1–2 sin daño; 9–10 discapacidad o muerte).</p><p><b>Ocurrencia</b>: con qué frecuencia puede pasar (1–2 casi nunca; 9–10 casi siempre).</p><p><b>Detección</b>: si se descubre antes de causar daño. <b>Va al revés</b>: 1–2 se detecta casi seguro; 9–10 es casi imposible de detectar.</p>
          <div class="box box--practica"><span class="box-tag">En la práctica</span><p>Antes de puntuar la detección, mirad los <b>controles actuales</b>: si no hay ninguno, difícilmente se detectará a tiempo. Y usad toda la escala: si todo sale 5 o 6, quizá falta información.</p></div>` },
        { t: "El equipo y las sesiones", h: `<p>El equipo tiene una <b>coordinación</b> (dirige y modera), una <b>secretaría</b> (registra y prepara los documentos) y miembros de todos los estamentos que intervienen en el proceso, más alguien que domine la metodología y, si se puede, una mirada externa.</p><p>Lo habitual son <b>tres sesiones de unas dos horas</b>: analizar el proceso y sus puntos críticos; buscar los fallos (lluvia de ideas y grupo nominal); y puntuarlos.</p>` }
      ],
      minicaso: "<p>En el triaje de Urgencias, el fallo «Omisión de constantes clave o mal registro» tiene como efecto un fallo en la alerta de sepsis (G 7), ocurre con frecuencia (O 7) y es difícil de detectar porque el sistema deja cerrar el triaje sin las constantes (D 7). IPR = 7 × 7 × 7 = 343: el primero del mapa.</p>",
      practica: { texto: "Ver los fallos de Urgencias", href: "#/mapa/ej-mapa-urgencias/6" } },
    { n: 6, c: "A", titulo: "Priorizar los riesgos", sub: "IPR, los más graves y la matriz de riesgos",
      minuto: [
        "No se puede actuar sobre todo a la vez: priorizar es decidir <b>por dónde empezar</b>.",
        "Lo habitual: los <b>N de mayor IPR</b> (en el curso, los 15 primeros) o los que superan un <b>umbral</b>.",
        "Un fallo con <b>gravedad 9–10</b> merece atención aunque su IPR sea bajo.",
        "La <b>matriz de riesgos</b> (gravedad × ocurrencia) comunica el riesgo de un vistazo, con zonas verde, amarilla, naranja y roja."
      ],
      secciones: [
        { t: "Criterio de prioridad", h: `<p>Ordenad los fallos por IPR. A igual IPR, va antes el de más gravedad. Elegid los N primeros o un umbral acordado por el equipo (como orientación: 300 o más es muy alto; de 200 a 299, alto; de 100 a 199, medio).</p><p>Si hay <b>empates</b> justo en el corte, la app os lo dice: decidid si añadís alguno a mano.</p>` },
        { t: "Fallo crítico y decisiones del equipo", h: `<p>La marca <b>«fallo crítico»</b> sube un fallo a prioritario aunque su IPR sea bajo: un evento centinela, una exigencia normativa… El equipo también puede <b>añadir o quitar</b> un fallo a mano.</p><div class="box box--trampa"><span class="box-tag">Ojo, trampa</span><p>Abusar de «crítico» o de los cambios a mano hace que la priorización deje de ser objetiva. Escribid siempre el motivo.</p></div>` },
        { t: "La matriz de riesgos", h: `<p>Coloca cada fallo según su <b>gravedad</b> (filas) y su <b>ocurrencia</b> (columnas). No tiene en cuenta la detección, así que <b>no sustituye al IPR</b>, pero ayuda a explicarlo. Puede verse en 10 × 10 (cada valor) o agrupada en 5 × 5, como la del documento final del curso.</p><p>Un fallo en la <b>zona roja</b> que no sale prioritario suele ser porque «se detecta fácil»: comprobad que esa detección existe de verdad.</p>` }
      ],
      minicaso: "<p>En Urgencias, los 15 fallos de mayor IPR van de 343 a 180. Otros cuatro también tienen 180 y quedan fuera por el corte (a igual IPR, la app pone antes el de más gravedad): el equipo decide si alguno merece entrar a mano. En la matriz, los 15 caen en las zonas naranja y amarilla.</p>",
      practica: { texto: "Ver la priorización de Urgencias", href: "#/mapa/ej-mapa-urgencias/7" } },
    { n: 7, c: "H", titulo: "Acciones de mejora", sub: "5W1H, fuerza de la medida e indicadores",
      minuto: [
        "Cada fallo prioritario necesita al menos una acción que <b>ataque su causa</b>.",
        "Se describe con el modelo <b>5W1H</b>: qué, por qué, dónde, cuándo, quién y cómo.",
        "Cada acción lleva un <b>indicador con su estándar</b> para comprobar que funciona.",
        "Las medidas que <b>cambian el sistema</b> (obligar, automatizar, eliminar el paso que falla) son más fuertes que formar o recordar."
      ],
      secciones: [
        { t: "El modelo 5W1H", h: `<div class="table-wrap"><table class="mini"><tr><th>Pregunta</th><th>Ejemplo (fallo nº 10 de Urgencias)</th></tr>
          <tr><td><b>Qué</b></td><td>Checklist digital obligatorio antes de cerrar el triaje con TA, FC, SatO₂ y temperatura</td></tr>
          <tr><td><b>Por qué</b></td><td>Para garantizar una valoración inicial completa y homogénea</td></tr>
          <tr><td><b>Dónde</b></td><td>Puesto de triaje</td></tr><tr><td><b>Cuándo</b></td><td>1 mes</td></tr>
          <tr><td><b>Quién</b></td><td>Supervisora de Enfermería de Urgencias</td></tr>
          <tr><td><b>Cómo</b></td><td>Configuración en el módulo de triaje, sesiones formativas y supervisión semanal</td></tr></table></div>` },
        { t: "Tipos de acción y fuerza de la medida", h: `<p><b>Corrección</b>: arregla el fallo cuando ocurre. <b>Acción correctora</b>: elimina su causa. <b>Acción preventiva</b>: elimina un riesgo antes de que ocurra.</p><p>Las acciones pueden cambiar un <b>procedimiento</b>, la <b>formación</b>, la <b>tecnología</b> o la <b>organización</b>.</p><div class="box box--trampa"><span class="box-tag">Ojo, trampa</span><p>Formar, recordar o poner carteles son <b>medidas débiles</b>: dependen de la memoria y la buena voluntad. Combínalas con alguna que cambie el sistema.</p></div>` },
        { t: "Indicadores y criterios", h: `<p>Una buena acción es <b>específica</b> (ataca la causa), <b>factible</b>, <b>medible</b>, <b>sostenible</b> y <b>aceptable</b> para el equipo. El documento final recoge además con qué criterios se eligieron: viabilidad, impacto esperado, cultura de seguridad del centro y posibilidad de medirlas.</p><p>El <b>indicador</b> y su <b>estándar</b> («% de triajes con las cuatro constantes registradas ≥ 95 %») son la base de la auditoría de seguimiento.</p>` }
      ],
      minicaso: "<p>Para el fallo «Espera prolongada sin reevaluación clínica», el equipo propone primero «recordar al personal que reevalúe». Es una medida débil. La mejora: reevaluación programada cada 90 minutos con un responsable por turno y registro obligatorio en la historia; indicador: % de pacientes con espera de más de 90 minutos con la reevaluación registrada, estándar ≥ 90 %.</p>",
      practica: { texto: "Ver las acciones de Urgencias", href: "#/mapa/ej-mapa-urgencias/8" } },
    { n: 8, c: "P", titulo: "El mapa de riesgos", sub: "Qué es, cómo se lee y para qué se usa",
      minuto: [
        "El <b>mapa de riesgos</b> es el flujograma del proceso con los fallos prioritarios marcados encima, en el paso donde ocurren.",
        "Cada aviso lleva los <b>números de los fallos</b> del AMFE y su color dice el nivel de riesgo: <b>rojo</b> muy alto, <b>naranja</b> alto, <b>amarillo</b> medio y <b>verde</b> bajo.",
        "Va dentro del <b>marco de procesos</b>: estratégicos arriba, el proceso clave en el centro y los de soporte abajo.",
        "Se usa para <b>comunicar</b>: acogida de nuevos profesionales, sesiones de seguridad, comisiones de calidad y planificación de auditorías."
      ],
      secciones: [
        { t: "Los pasos para elaborarlo", h: `<ol><li>Identificar el proceso y sus actividades (flujograma).</li><li>Identificar los riesgos (puntos críticos y AMFE).</li><li>Evaluarlos y clasificarlos (gravedad, ocurrencia, detección e IPR).</li><li>Planificar la respuesta (acciones de mejora con responsable y plazo).</li><li>Documentarlo y comunicarlo (el documento final y la lámina del mapa).</li><li>Revisarlo periódicamente (auditorías y nuevas ediciones).</li></ol>` },
        { t: "Cómo se lee", h: `<p>Recorre el flujograma de arriba abajo: los avisos muestran <b>dónde se concentran los riesgos</b>. Un aviso puede agrupar varios fallos del mismo paso; un fallo puede aparecer en más de un paso (por ejemplo, en el traslado de ida y en el de vuelta). La <b>leyenda</b> dice qué es cada número y su IPR.</p><div class="box box--practica"><span class="box-tag">En la práctica</span><p>Si un paso acumula muchos fallos, quizá es demasiado grande: dividirlo en el flujograma ayuda a localizar mejor el riesgo.</p></div>` },
        { t: "Revisión y mejora continua", h: `<p>El mapa no es un documento estático: se revisa cuando cambia el proceso, tras un incidente o tras las auditorías, como parte del ciclo PDCA. Los fallos prioritarios son los <b>hallazgos clave</b> que alimentan el Plan Anual de Auditorías.</p>` }
      ],
      minicaso: "<p>En el mapa de Urgencias, el triaje lleva un aviso rojo con los fallos 8, 9, 10 y 11, y la recepción uno naranja con el 3, el 5 y el 7. Un profesional que se incorpora ve en un minuto que los primeros pasos (identificación y priorización) son los más delicados del circuito.</p>",
      practica: { texto: "Ver el mapa de Urgencias", href: "#/mapa/ej-mapa-urgencias/9" } }
  ];
  // Temas que llegarán con las próximas versiones (se muestran como «próximamente»)
  const TEMAS_PROX = [];

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
    ["Equipo AMFE", "Grupo multidisciplinar que hace el análisis: coordinación, secretaría y profesionales de todos los estamentos que intervienen en el proceso."],
    ["Controles actuales", "Lo que hoy ya existe para evitar un fallo o detectarlo antes de que dañe: protocolos, dobles chequeos, alertas, listas de verificación."],
    ["Gravedad (G)", "Cuánto daño haría el fallo si ocurre, de 1 (sin daño) a 10 (discapacidad o muerte)."],
    ["Ocurrencia (O)", "Con qué frecuencia puede ocurrir el fallo, de 1 (casi nunca) a 10 (casi siempre)."],
    ["Detección (D)", "Si el fallo se descubre antes de causar daño. Va al revés: 1 = se detecta casi seguro; 10 = casi imposible de detectar."],
    ["Fallo prioritario", "Fallo sobre el que se actuará primero: por su IPR, por su gravedad o porque el equipo lo ha marcado como crítico."],
    ["Fallo crítico", "Fallo que el equipo sube a prioritario aunque su IPR sea bajo (evento centinela, exigencia normativa…). Siempre con su motivo."],
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

  // Equipo del ejercicio 9 (solo perfiles y cargos, sin nombres): [perfil, cargo, papel, justificación]
  const EQUIPO_URG = [
    ["Médico/a de Urgencias", "Facultativo responsable de guardia", "coordinador", "Visión clínica integral del proceso, toma de decisiones médicas y conocimiento global del funcionamiento del servicio."],
    ["Enfermero/a de Urgencias", "Supervisor/a o referente de turno", "referente", "Conocimiento detallado del flujo asistencial, cuidados y protocolos. Aporta experiencia sobre la operativa diaria."],
    ["Técnico/a en Cuidados Auxiliares de Enfermería (TCAE)", "TCAE del área de observación", "operativo", "Identifica riesgos asociados a la movilización, la higiene y el apoyo directo al paciente."],
    ["Celador/a", "Celador de guardia", "miembro", "Aporta la perspectiva de los traslados y la accesibilidad física del paciente dentro del servicio."],
    ["Administrativo/a de Admisión", "Administrativo/a de Urgencias", "miembro", "Apunta riesgos del registro inicial, la identificación y la gestión documental."],
    ["Farmacéutico/a Hospitalario", "Referente de conciliación en Urgencias", "experto", "Su visión es esencial para detectar fallos relacionados con la medicación y la conciliación farmacológica."],
    ["Médico/a de Medicina Interna", "Médico/a de interconsulta frecuente", "externo", "Aporta una mirada externa y transversal desde otra especialidad que colabora habitualmente con Urgencias."],
    ["Técnico/a de Calidad", "Técnico de Calidad del hospital", "secretario", "Organiza, registra y estructura las sesiones. Asegura el uso correcto de la metodología AMFE."],
    ["Enfermero/a de Triaje", "Enfermero/a con formación específica en triaje", "miembro", "Identifica riesgos críticos del proceso inicial de clasificación y priorización."],
    ["Responsable de Seguridad del Paciente", "Coordinador/a de Seguridad del Área", "metodologico", "Supervisa el análisis desde la perspectiva de la seguridad del paciente y garantiza la trazabilidad del proceso de mejora."]
  ];
  // Los 49 fallos del ejercicio 11 resuelto (los mismos IPR que la app AMFE): [nº, efecto, causa, G, O, D]. El modo de
  // fallo es el título de su punto crítico (nº igual), del que sale. Controles actuales: añadidos para el ejemplo en los 15 primeros.
  const FALLOS_URG = [
    [1, "Errores en la historia clínica, duplicación, retrasos", "Error tipográfico no corregido, alta carga asistencial", 5, 5, 4],
    [2, "Error de identidad, mezcla de historiales", "Proceso no protocolizado o no exigido en todos los turnos", 6, 4, 6],
    [3, "Falta de información crítica para el triaje y la atención médica", "No recogida sistemática, desconocimiento de la importancia", 7, 6, 5],
    [4, "Imposibilidad de recabar información en caso de urgencia", "Falta de campo obligatorio o de rutina en el sistema informático", 5, 5, 4],
    [5, "Riesgo en la atención inicial por falta de alertas previas", "Historia clínica fragmentada, mal interoperada o sin codificación", 7, 6, 7],
    [6, "Pérdida de continuidad asistencial", "Omisión del campo o proceso automatizado no verificado", 4, 3, 3],
    [7, "No se activa circuito preferente ni seguimiento específico", "Desconocimiento del riesgo o falta de cribado geriátrico inicial", 6, 6, 6],
    [8, "Retraso en la atención, progresión del cuadro clínico", "Subestimación de signos vitales alterados, presión asistencial", 8, 7, 6],
    [9, "Pérdida de oportunidad de atención prioritaria y acompañamiento", "Falta de cribado geriátrico, comunicación deficiente", 7, 6, 6],
    [10, "Asignación incorrecta de prioridad, fallo en la alerta de sepsis", "Automatización excesiva, omisión por prisa", 7, 7, 7],
    [11, "Riesgo de error de identidad, confusión en pruebas o medicación", "Rutina interrumpida, recursos saturados", 6, 6, 5],
    [12, "Fallo en la conciliación posterior o en la detección de interacciones", "No integración enfermería–médico en la fase de triaje", 6, 5, 5],
    [13, "Dificultad para recabar la historia clínica real", "Se asume presencia ocasional, no protocolizado", 5, 4, 3],
    [14, "Desatención percibida, riesgo de descompensación por estrés", "Focalización en datos objetivos, falta de escucha activa", 4, 5, 4],
    [15, "Empeoramiento del estado sin detección", "Saturación del servicio, falta de protocolos de vigilancia activa", 7, 7, 6],
    [16, "Riesgo de caídas, desorientación o ansiedad", "Recursos humanos limitados, paciente frágil sin alerta de riesgo", 6, 6, 6],
    [17, "Incomodidad, hipo o hipertermia, estrés añadido", "Problemas estructurales o falta de monitorización", 4, 5, 4],
    [18, "Error de citación, traslado o intervención", "Omisión inicial de identificación, pérdida durante la espera", 6, 6, 5],
    [19, "Dificultad para comunicarse o desplazarse", "Entorno desorganizado, falta de seguimiento del paciente vulnerable", 4, 4, 4],
    [20, "Ansiedad, percepción negativa de la atención", "Comunicación deficiente, falta de circuitos informativos", 3, 5, 3],
    [21, "Deshidratación, frustración, malestar físico y emocional", "Alta ocupación, roles no definidos, ausencia de atención humanizada", 5, 5, 5],
    [22, "Diagnóstico inexacto o incompleto", "Ausencia de familiar acompañante, paciente con deterioro cognitivo", 6, 6, 5],
    [23, "Interacciones, duplicidades o errores de tratamiento", "Falta de tiempo, no consultar la historia previa o la base de datos farmacológica", 7, 6, 6],
    [24, "Omisión de signos relevantes", "Sobrecarga asistencial, fatiga profesional", 6, 5, 5],
    [25, "Decisiones clínicas inadecuadas a su perfil o vulnerabilidad", "Foco exclusivo en lo biomédico", 5, 4, 5],
    [26, "Retrasos en el diagnóstico o pruebas repetidas", "Falta de experiencia o de coordinación", 5, 4, 4],
    [27, "Pérdida de trazabilidad del caso, errores posteriores", "Desorganización, fallos informáticos o falta de formación", 6, 5, 5],
    [28, "Descoordinación en los cuidados, retrasos en los procedimientos", "Trabajo en paralelo sin briefing ni comunicación estructurada", 5, 5, 4],
    [29, "Riesgo de realizar pruebas al paciente equivocado", "Omisión previa en el triaje o retirada accidental no detectada", 7, 6, 7],
    [30, "Error de localización o atención a un paciente erróneo", "Falta de etiquetado visible, desorganización en pasillos o boxes", 6, 6, 6],
    [31, "Retraso en las pruebas, deterioro clínico no monitorizado", "Falta de celadores, priorización deficiente de los traslados", 6, 5, 5],
    [32, "Pruebas mal orientadas o incompletas", "Desconexión entre el médico prescriptor y el personal técnico", 5, 4, 4],
    [33, "Repetición innecesaria, demora en el diagnóstico", "Errores administrativos, confusión entre nombres similares", 5, 4, 3],
    [34, "Riesgo de caída, desorientación o ansiedad", "No identificación de la situación de fragilidad", 6, 5, 5],
    [35, "Omisión en la toma de decisiones o retraso clínico", "Falta de integración entre sistemas informáticos o interrupciones en el flujo", 6, 5, 6],
    [36, "Diagnóstico erróneo o retrasado", "Saturación, distracciones, falta de seguimiento", 7, 6, 6],
    [37, "Toma de decisiones descontextualizada", "Falta de tiempo, historia clínica dispersa, desconocimiento del paciente", 6, 6, 5],
    [38, "Ansiedad, desinformación, resistencia al tratamiento", "Pérdida de oportunidad, falta de cultura comunicativa", 6, 5, 5],
    [39, "Incomprensión del diagnóstico, mal cumplimiento posterior", "Déficit en habilidades de comunicación clínica", 5, 4, 4],
    [40, "Imposibilidad de verificar que se ha informado al paciente", "Omisión de la anotación en la historia clínica", 4, 4, 3],
    [41, "Tratamiento o ingreso inadecuado a su situación global", "No integración del modelo biopsicosocial", 6, 5, 5],
    [42, "Rechazo posterior, pérdida de adherencia, conflicto ético", "Cultura paternalista, falta de tiempo o presión asistencial", 5, 5, 4],
    [43, "Empeoramiento del estado clínico, descompensación", "Saturación hospitalaria, falta de planificación anticipada", 6, 6, 6],
    [44, "Falta de seguimiento, pérdida de oportunidad terapéutica", "Recursos insuficientes, decisiones transitorias que se prolongan", 6, 5, 5],
    [45, "Omisión de datos importantes, duplicación o discontinuidad asistencial", "Comunicación incompleta, registros no compartidos, traslado precipitado", 7, 6, 6],
    [46, "Riesgo de errores en el tratamiento o los cuidados", "Falta de impresión, sistemas no interoperables, protocolo ineficaz", 6, 5, 5],
    [47, "Tareas no asignadas, retrasos o pérdidas de información", "Ambigüedad en los circuitos o turnos cambiantes sin traspaso efectivo", 5, 4, 4],
    [48, "Asignación a una unidad inadecuada", "Desconocimiento del perfil del paciente, presión para agilizar ingresos", 6, 5, 4],
    [49, "Confusión, falta de pertenencias, retraso en cuidados básicos", "Omisión del contacto de referencia, fallo en la comunicación", 5, 4, 4]
  ];
  const CONTROLES_URG = {
    10: "Registro de constantes en el módulo de triaje, sin obligación de completarlas para cerrarlo.",
    8: "Sistema de triaje estructurado de cinco niveles; no se revisa después la clasificación.",
    5: "Consulta manual de la historia clínica cuando hay tiempo; el sistema no genera alertas.",
    15: "Reevaluación solo si el paciente o su acompañante avisan; sin tiempos fijados.",
    29: "Protocolo de identificación con pulsera; no se comprueba al volver de pruebas.",
    9: "Preguntas generales en el triaje; no se usa ninguna escala de fragilidad.",
    23: "Consulta de la receta electrónica a criterio de cada médico.",
    36: "Aviso de resultados disponibles en la estación clínica.",
    45: "Llamada telefónica a la planta e informe de enfermería al trasladar.",
    7: "Ninguno específico.",
    16: "Vigilancia visual de la sala por la TCAE cuando sus tareas lo permiten.",
    30: "Identificación verbal del paciente al volver al box.",
    43: "Gestión de camas por la supervisión de guardia.",
    3: "Se pregunta por alergias en admisión, pero no de forma sistemática.",
    11: "Protocolo de identificación e impresora de pulseras en el triaje."
  };
  // Acciones de mejora 5W1H de la tabla 6.2 del Documento Final (las 15, una por fallo prioritario). El curso no trae
  // indicador, estándar, estado, fecha de fin ni puntuación tras las acciones: se han añadido para el ejemplo (las 9
  // primeras, igual que en el ejemplo de la app AMFE).
  // [nº, qué, por qué, dónde, plazo, fin, quién, cómo, tipo, clase, actúa sobre, indicador, estándar, fuente, estado]
  const ACCIONES_URG = [
    [10, "Establecer un checklist digital obligatorio antes de cerrar el triaje con los parámetros mínimos: TA, FC, SatO₂ y temperatura", "Para garantizar una valoración inicial completa y homogénea de todos los pacientes", "Puesto de triaje", "1 mes", "2025-12-15", "Supervisora de Enfermería de Urgencias", "Configuración del checklist en el módulo de triaje de la historia digital, sesiones formativas y supervisión semanal", "correctora", "tecnologia", ["o", "d"], "% de triajes con TA, FC, SatO₂ y temperatura registradas", "≥ 95 %", "Módulo de triaje de la historia digital", "verificada"],
    [8, "Implantar una auditoría clínica mensual de triajes con doble revisión y retroalimentación individual", "Para mejorar la calidad y la homogeneidad en la asignación de los niveles de prioridad", "Puesto de triaje", "2 meses", "2026-01-15", "Coordinador médico y Supervisora de Enfermería", "Selección aleatoria de 20 historias al mes, revisión ciega por un profesional experto e informe con los errores detectados y formación orientada", "correctora", "procedimiento", ["o", "d"], "% de triajes con nivel de prioridad concordante en la doble revisión", "≥ 90 %", "Auditoría mensual de triaje", "hecha"],
    [5, "Configurar una alerta visible automática en el campo de admisión para pacientes con antecedentes relevantes registrados en la historia clínica", "Para evitar omisiones críticas en pacientes con patologías relevantes en su atención urgente", "Puesto de admisión", "1 mes", "2025-12-15", "Responsable TIC y Dirección Médica", "Modificación del sistema informático, prueba piloto y formación del personal administrativo", "preventiva", "tecnologia", ["d"], "% de pacientes con antecedentes relevantes en los que salta la alerta en admisión", "≥ 95 %", "Sistema informático de admisión", "hecha"],
    [15, "Implementar reevaluaciones clínicas programadas cada 90 minutos para los pacientes en espera", "Para disminuir los riesgos clínicos en pacientes cuya situación puede agravarse sin control", "Sala de espera del Servicio de Urgencias", "2 meses", "2025-12-01", "Supervisor/a de enfermería de Urgencias", "Modificando el protocolo de espera, asignando un responsable por turno y registrando la reevaluación en la historia clínica", "correctora", "procedimiento", ["o", "d"], "% de pacientes con espera > 90 min con reevaluación registrada", "≥ 90 %", "Historia clínica (registro de reevaluaciones)", "verificada"],
    [29, "Establecer la verificación activa y el doble chequeo de la pulsera antes de salir a pruebas", "Para garantizar la identificación segura en los traslados y evitar errores de identidad", "Box de exploración y área de pruebas", "2 semanas", "2025-11-30", "Personal de enfermería de boxes", "Listado de control obligatorio antes del traslado, formación al personal y auditoría semanal de cumplimiento", "correctora", "procedimiento", ["o", "d"], "% de traslados a pruebas con la pulsera verificada en el listado de control", "100 %", "Listado de control de traslados", "verificada"],
    [9, "Incluir una alerta de fragilidad en el triaje mediante un cuestionario breve y estructurado", "Para prevenir riesgos en pacientes vulnerables que no se detectan al principio", "Puesto de triaje", "1 mes", "2025-12-15", "Profesional de triaje", "Añadiendo ítems al sistema informático de triaje (edad, dependencia, deterioro cognitivo), con formación previa", "preventiva", "tecnologia", ["o", "d"], "% de pacientes de 75 años o más con el cuestionario de fragilidad completado en el triaje", "≥ 90 %", "Módulo de triaje", "hecha"],
    [23, "Implementar un checklist obligatorio de conciliación de la medicación en las primeras indicaciones", "Para evitar interacciones y errores por desconocer la medicación crónica del paciente", "Historia clínica electrónica", "1 mes", "2026-01-31", "Jefe de Urgencias y Responsable de Calidad", "Campo obligatorio en el parte médico inicial, formación breve del personal y auditoría mensual de cumplimiento", "correctora", "tecnologia", ["o", "d"], "% de pacientes con la medicación habitual conciliada en las primeras indicaciones", "≥ 85 %", "Historia clínica electrónica", "curso"],
    [36, "Activar un sistema de alertas del laboratorio ante resultados críticos", "Para reducir las omisiones de resultados importantes y evitar retrasos en la actuación médica", "Sistema informático de resultados del laboratorio", "1 mes", "2025-12-31", "Responsable de Sistemas y Jefe de Urgencias", "Configurando alertas automáticas por valores críticos y verificando que el clínico los ha visto antes del alta", "preventiva", "tecnologia", ["o", "d"], "% de resultados críticos con visualización verificada antes del alta", "100 %", "Sistema de laboratorio", "hecha"],
    [45, "Crear un canal directo de comunicación y un parte de ingreso normalizado entre Urgencias y la planta", "Para minimizar retrasos en la ubicación del paciente y mejorar la continuidad asistencial", "Área de admisión e ingreso y planta hospitalaria", "2 semanas", "2025-12-15", "Supervisor de Urgencias y Supervisor de planta", "Grupo de mensajería institucional y plantilla electrónica compartida con la información clínica relevante para la planta receptora", "correctora", "organizativa", ["o", "d"], "% de ingresos con el parte de ingreso normalizado enviado a la planta", "≥ 95 %", "Registro de ingresos", "pendiente"],
    [7, "Elaborar y difundir un protocolo específico de atención prioritaria a pacientes frágiles en el área de Urgencias", "Para garantizar una atención rápida, segura y adaptada a las necesidades especiales de estos pacientes", "Área de Admisión de Urgencias", "2 meses", "2026-01-31", "Supervisión de Urgencias y Coordinación de Calidad", "Formación al personal, validación del protocolo en la Comisión de Calidad y monitorización de su cumplimiento", "preventiva", "procedimiento", ["o"], "% de pacientes frágiles con el circuito preferente activado", "≥ 85 %", "Registro de admisión", "curso"],
    [16, "Establecer turnos de revisión periódica de los pacientes en sala de espera con registro en la historia clínica", "Para evitar el deterioro clínico en pacientes con esperas prolongadas y mejorar la seguridad", "Sala de espera de Urgencias", "Inmediato (1 mes)", "2025-12-15", "Enfermería de triaje y Coordinación de turnos", "Asignación de responsabilidades en el cuadrante, checklist de revisión y registro obligatorio en la historia electrónica", "correctora", "organizativa", ["o", "d"], "% de turnos con la revisión de la sala de espera registrada", "≥ 95 %", "Historia clínica electrónica", "hecha"],
    [30, "Implementar un sistema de etiquetado único por paciente y verificación cruzada en los traslados internos", "Para evitar errores de identificación y garantizar el retorno seguro del paciente a su ubicación", "Circuito interno de traslado de pacientes", "1 mes", "2025-12-31", "Celadores, Enfermería y Coordinación del área", "Etiquetado adhesivo con código, checklist de entrega y recepción, y formación básica a los celadores", "preventiva", "procedimiento", ["o", "d"], "% de traslados con la verificación cruzada registrada", "≥ 95 %", "Checklist de traslados", "curso"],
    [43, "Implementar un sistema electrónico de previsión de altas en las plantas", "Para anticipar necesidades y reducir los tiempos de espera de cama en Urgencias", "Coordinación entre las plantas de hospitalización y Urgencias", "En el momento de la previsión del alta en planta", "2026-02-28", "Supervisión de planta y Unidad de Gestión de Camas", "Mediante checklists digitales de altas previstas, actualizados en tiempo real", "preventiva", "tecnologia", ["o"], "Mediana de horas de espera de cama desde la decisión de ingreso", "≤ 4 h", "Sistema de gestión de camas", "pendiente"],
    [3, "Incluir un campo obligatorio de alergias y medicación habitual en el sistema de admisión", "Para que la información crítica esté disponible desde el inicio del proceso asistencial", "Aplicación de admisión (sistema informático)", "Al realizar el registro administrativo", "2026-01-15", "Personal administrativo de admisión", "Configurando alertas de validación que impidan continuar si no se rellena el campo", "preventiva", "tecnologia", ["o", "d"], "% de registros de admisión con el campo de alergias cumplimentado", "≥ 98 %", "Aplicación de admisión", "curso"],
    [11, "Establecer un control sistemático con checklist visible de la pulsera tras el triaje", "Para mejorar la seguridad del paciente y evitar errores de identificación", "Box de triaje", "Justo después del triaje inicial", "2025-12-15", "Profesional de enfermería responsable del triaje", "Incorporando la verificación de la pulsera al checklist obligatorio antes de asignar box", "correctora", "procedimiento", ["o", "d"], "% de pacientes con la pulsera verificada antes de asignar box", "100 %", "Checklist de triaje", "hecha"]
  ];
  // G·O·D esperados tras las acciones (añadidos para el ejemplo; la gravedad no cambia)
  const RESIDUAL_URG = { 10: [7, 4, 3], 8: [8, 5, 4], 5: [7, 6, 3], 15: [7, 5, 4], 29: [7, 3, 4], 9: [7, 4, 4], 23: [7, 4, 4], 36: [7, 5, 3], 45: [7, 4, 5] };
  // Dónde va cada fallo en el mapa, como la página 15 del Documento Final cuando no basta con el paso de su punto crítico:
  // el 29 y el 30 en los dos traslados (ida y vuelta de pruebas), el 45 en la consulta y en la decisión de ingreso, el 43 en la decisión de ingreso
  const UBICACION_URG = { 29: [17, 19], 30: [17, 19], 45: [12, 24], 43: [24], 36: [21] };
  function amfeUrgencias(base) {
    const id = base.id, equipo = EQUIPO_URG.map(([perfil, cargo, rol, justificacion], i) => ({ id: `${id}-m${i + 1}`, perfil, cargo, rol, justificacion, nombre: "" }));
    const todos = equipo.map(x => x.id);
    return {
      equipo,
      sesiones: [
        { id: `${id}-x1`, fecha: "2025-10-07", actividad: "Lectura del caso y análisis del proceso", duracion: "2 h", asistentes: todos.slice(), resultados: "Identificación de los 7 subprocesos y de sus puntos críticos" },
        { id: `${id}-x2`, fecha: "2025-10-21", actividad: "Lluvia de ideas y técnica de grupo nominal", duracion: "2 h", asistentes: todos.slice(), resultados: "Identificación consensuada de 49 fallos potenciales" },
        { id: `${id}-x3`, fecha: "2025-11-04", actividad: "Asignación de escalas G-O-D y cálculo del IPR", duracion: "2 h", asistentes: todos.slice(), resultados: "Priorización de los fallos según su criticidad e impacto en el proceso" }
      ],
      metodologia: { tecnicas: ["caso", "lluvia", "tgn"], texto: "" },
      fallos: FALLOS_URG.map(([num, efecto, causa, g, o, d]) => {
        const x = base.puntos[num - 1];
        const acciones = ACCIONES_URG.filter(a => a[0] === num).map(([, que, porque, donde, plazo, fin, quien, como, tipo, clase, actuaSobre, nombre, estandar, fuente, estado], i) => ({ id: `${id}-a${num}-${i + 1}`, que, porque, donde, plazo, fin, quien, como, tipo, clase, actuaSobre, indicador: { nombre, formula: "", estandar, fuente }, comprobacion: { especifica: true, factible: true, medible: true, sostenible: estado === "verificada", aceptable: true }, estado, nota: "" }));
        const r = RESIDUAL_URG[num];
        return { id: `${id}-f${num}`, num, subprocesoId: x.subprocesoId, puntoId: x.id, pasos: (UBICACION_URG[num] || []).map(n => `${id}-p${n}`), fallo: x.titulo.replace(" (ej. 3 en lugar de 2)", ""), efecto, causa, controles: CONTROLES_URG[num] || "",
          g: String(g), o: String(o), d: String(d), critico: false, motivoCritico: "", manual: "", motivo: "", acciones,
          residual: r ? { g: String(r[0]), o: String(r[1]), d: String(r[2]), fecha: "", nota: "Esperado cuando la acción esté implantada" } : { g: "", o: "", d: "", fecha: "", nota: "" }, votos: [], ishikawa: [] };
      }),
      prioridad: { modo: "top", n: "15", umbral: "200" },
      criteriosAcciones: { viabilidad: true, impacto: true, cultura: true, medible: true },
      // Control documental del Documento Final, solo con cargos (sin nombres de personas ni de centro)
      control: {
        elaborado: [{ nombre: "", cargo: "Coordinación de Calidad y Seguridad del Paciente", ubicacion: "Área de Gestión Sanitaria" }, { nombre: "", cargo: "Técnicos de Calidad y Seguridad del Paciente", ubicacion: "Área de Gestión Sanitaria" }],
        revisado: [{ nombre: "", cargo: "Coordinación de Calidad y Seguridad del Paciente", ubicacion: "Área de Gestión Sanitaria" }, { nombre: "", cargo: "Jefatura de Servicio de Urgencias", ubicacion: "Área de Gestión Sanitaria" }],
        aprobado: [{ nombre: "", cargo: "Gerencia del Área de Gestión Sanitaria", ubicacion: "Área de Gestión Sanitaria" }, { nombre: "", cargo: "Jefatura de Servicio de Urgencias", ubicacion: "Área de Gestión Sanitaria" }],
        historial: [{ edicion: "00", fecha: "2025-09-30", cambio: "Documento inicial" }]
      },
      proxRevision: "2026-11-04",
      vistaMapa: { mostrar: "prioritarios", calor: false, titulo: "Mapa de riesgo del Servicio de Urgencias", leyenda: "num" }
    };
  }
  Object.assign(URGENCIAS, amfeUrgencias(URGENCIAS));
  URGENCIAS.notas += " El AMFE (pasos 5 a 7) es el del curso: equipo del ejercicio 9, tres sesiones y los 49 fallos con la puntuación del ejercicio 11; los controles actuales de los 15 primeros se han añadido para el ejemplo. Las acciones son las 15 de la tabla 6.2 del documento (el texto dice «los cinco fallos con mayor IPR», pero la tabla trae los 15); su indicador, su estándar, su estado y la puntuación tras las acciones se han añadido para el ejemplo. En el mapa, los fallos van en el paso de su punto crítico y, como en la página 15, el 29 y el 30 en los dos traslados y el 45 en la consulta y en la decisión de ingreso.";

  const EJEMPLOS = {
    mapas: [URGENCIAS],
    urgencias: { t: "Atención integral en el Servicio de Urgencias", s: "El ejemplo completo del curso: 7 subprocesos, el flujograma general con sus 33 pasos y el marco de procesos, los 49 puntos críticos, el AMFE con su equipo, sus sesiones y los 49 fallos priorizados, las 15 acciones de mejora y el mapa de riesgos de la página 15. Con cada versión de la app se irá completando hasta el documento final.", href: "#/mapa/ej-mapa-urgencias/1" }
  };

  const API = { TEMAS, TEMAS_PROX, GLOSARIO, EJEMPLOS };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else raiz.Contenido = API;
})(typeof window !== "undefined" ? window : this);
