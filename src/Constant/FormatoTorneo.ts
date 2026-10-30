// Cómo se empareja el torneo; el tipo dice quién juega
export const FORMATO_SUIZO = "Suizo";
// Todos contra todos por jornadas
export const FORMATO_LIGA = "Liga";
// Fase de grupos (todos contra todos en cada grupo) y eliminatoria
export const FORMATO_COPA = "Copa";

// Liga y Copa: jornadas con calendario abierto, ejército fijo al inscribirse, lista guardada en cada partida y ELO
// partida a partida
export const esPorJornadas = (formato?: string | null) =>
  formato === FORMATO_LIGA || formato === FORMATO_COPA;

// Para chips y títulos
export const nombreEvento = (formato?: string | null) =>
  formato === FORMATO_LIGA ? "Liga" : formato === FORMATO_COPA ? "Copa" : "Torneo";

// Para los textos que hablan del evento: "Nombre de la liga", "¿Dónde se celebra el torneo?"...
export const textosEvento = (formato?: string | null) =>
  formato === FORMATO_LIGA
    ? { el: "la liga", del: "de la liga", al: "a la liga" }
    : formato === FORMATO_COPA
      ? { el: "la copa", del: "de la copa", al: "a la copa" }
      : { el: "el torneo", del: "del torneo", al: "al torneo" };

// Tipo de evento al crearlo: un torneo es suizo. Subtítulos cortos: en móvil se cortan
export const tipoEventoOptions = [
  {
    label: "Torneo",
    value: FORMATO_SUIZO,
    subtitle: "Rondas emparejadas por la clasificación",
  },
  {
    label: "Liga",
    value: FORMATO_LIGA,
    subtitle: "Todos contra todos por jornadas",
  },
  {
    label: "Copa",
    value: FORMATO_COPA,
    subtitle: "Fase de grupos y eliminatoria",
  },
];

export const cuentaEloOptions = [
  { label: "Sí, cuenta para el ELO", value: true },
  { label: "No cuenta para el ELO", value: false },
];

export const idaYVueltaOptions = [
  { label: "Solo ida", value: false },
  { label: "Ida y vuelta", value: true },
];

// Copa
export const REPARTO_ELO = "Elo";
export const REPARTO_SORTEO = "Sorteo";
export const REPARTO_MANUAL = "Manual";
export const repartoGruposOptions = [
  { label: "Por ELO, con bombos", value: REPARTO_ELO, subtitle: "Los mejores, uno en cada grupo" },
  { label: "Sorteo al azar", value: REPARTO_SORTEO, subtitle: "Todos al azar" },
  { label: "A mano", value: REPARTO_MANUAL, subtitle: "Colocas tú a cada jugador" },
];

export const DESEMPATE_GRUPOS = "Grupos";
export const DESEMPATE_GENERAL = "General";
export const DESEMPATE_ORGANIZADOR = "Organizador";
export const desempateEliminatoriaOptions = [
  { label: "Pasa el mejor de grupos", value: DESEMPATE_GRUPOS, subtitle: "El mejor clasificado en grupos" },
  { label: "Pasa quien mató al general", value: DESEMPATE_GENERAL, subtitle: "Si no, el mejor de grupos" },
  { label: "Lo decide el organizador", value: DESEMPATE_ORGANIZADOR, subtitle: "Eliges tú en cada empate" },
];

export const tercerPuestoOptions = [
  { label: "Sin partido por el tercer puesto", value: false },
  { label: "Con partido por el tercer puesto", value: true },
];

// Fase de una partida de la Copa
export const FASE_GRUPOS = "Grupos";
export const FASE_ELIMINATORIA = "Eliminatoria";
export const FASE_TERCER_PUESTO = "TercerPuesto";
