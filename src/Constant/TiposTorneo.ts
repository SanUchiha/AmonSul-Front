export const torneoType = [
  // 2 contra 2 en la misma mesa. Hasta octubre de 2026 era el nombre de Equipos_2
  "Parejas",
  "Equipos_2",
  "Equipos_4",
  "Equipos_6",
  "Individual",
] as const;

export type TorneoType = (typeof torneoType)[number];

// Opciones del selector de tipo al crear o modificar un torneo
export const tipoTorneoOptions: {
  label: string;
  value: TorneoType;
  subtitle: string;
}[] = [
  {
    label: "Individual",
    value: "Individual",
    subtitle: "Cada jugador juega sus propias partidas",
  },
  {
    label: "Parejas",
    value: "Parejas",
    subtitle: "Dos contra dos en la misma mesa, un resultado por partida",
  },
  {
    label: "Equipos de 2",
    value: "Equipos_2",
    subtitle: "Cada miembro juega su partida contra uno del otro equipo",
  },
  {
    label: "Equipos de 4",
    value: "Equipos_4",
    subtitle: "Cada miembro juega su partida contra uno del otro equipo",
  },
  {
    label: "Equipos de 6",
    value: "Equipos_6",
    subtitle: "Cada miembro juega su partida contra uno del otro equipo",
  },
];

// Solo en Parejas: cómo entrega las listas cada pareja
export const modoListasParejaOptions = [
  { label: "Una lista por jugador", value: false },
  { label: "Una lista conjunta por pareja", value: true },
];
