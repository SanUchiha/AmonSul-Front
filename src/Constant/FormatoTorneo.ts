// Cómo se empareja el torneo; el tipo dice quién juega
export const FORMATO_SUIZO = "Suizo";
// Todos contra todos por jornadas
export const FORMATO_LIGA = "Liga";

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
];

export const cuentaEloOptions = [
  { label: "Sí, cuenta para el ELO", value: true },
  { label: "No cuenta para el ELO", value: false },
];

export const idaYVueltaOptions = [
  { label: "Solo ida", value: false },
  { label: "Ida y vuelta", value: true },
];
