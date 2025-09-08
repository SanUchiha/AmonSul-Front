export const torneoType = [
  "Parejas",
  "Equipos_4",
  "Equipos_6",
  "Individual",
] as const;

export type TorneoType = (typeof torneoType)[number];

