export const torneoType = [
  // Antiguo nombre de Equipos_2: se mantiene hasta renombrar los torneos que aún lo tienen
  "Parejas",
  "Equipos_2",
  "Equipos_4",
  "Equipos_6",
  "Individual",
] as const;

export type TorneoType = (typeof torneoType)[number];

