export const torneoType = [
  // 2 contra 2 en la misma mesa: se enseña como Dobles. Hasta octubre de 2026 era el nombre de Equipos_2
  "Parejas",
  "Equipos_2",
  "Equipos_4",
  "Equipos_6",
  "Individual",
] as const;

export type TorneoType = (typeof torneoType)[number];

// Opciones del selector de tipo al crear o modificar un torneo. Subtítulos cortos: en móvil se cortan
export const tipoTorneoOptions: {
  label: string;
  value: TorneoType;
  subtitle: string;
}[] = [
  {
    label: "Individual",
    value: "Individual",
    subtitle: "Cada jugador juega sus partidas",
  },
  {
    label: "Dobles",
    value: "Parejas",
    subtitle: "2 contra 2 en la misma mesa",
  },
  {
    label: "Equipos de 2",
    value: "Equipos_2",
    subtitle: "Cada miembro juega su propia partida",
  },
  {
    label: "Equipos de 4",
    value: "Equipos_4",
    subtitle: "Cada miembro juega su propia partida",
  },
  {
    label: "Equipos de 6",
    value: "Equipos_6",
    subtitle: "Cada miembro juega su propia partida",
  },
];

// Solo en Dobles: cómo entrega las listas cada pareja
export const modoListasParejaOptions = [
  { label: "Una lista por jugador", value: false },
  { label: "Una lista conjunta por pareja", value: true },
];
