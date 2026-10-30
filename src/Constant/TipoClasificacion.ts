export enum ClassificationType {
  NORMAL = 1,
  EXTENDED = 2,
  ALEMAN = 3,
}

export const ClassificationTypeLabels: Record<ClassificationType, string> = {
  [ClassificationType.NORMAL]: "Matched Play",
  [ClassificationType.EXTENDED]: "Matched Play Extendido",
  [ClassificationType.ALEMAN]: "Alemán",
};

// Cómo puntúa cada tipo, para explicarlo al crear o modificar un evento: el resumen va en el desplegable y el
// detalle debajo, con el tipo elegido
export const ClassificationTypeDescriptions: Record<
  ClassificationType,
  { resumen: string; detalle: string }
> = {
  [ClassificationType.NORMAL]: {
    resumen: "Victoria 3 · Empate 1 · Derrota 0",
    detalle:
      "Cada partida da 3 puntos al que gana, 1 a cada uno si empatan y 0 al que pierde, sea cual sea la diferencia de puntos.",
  },
  [ClassificationType.EXTENDED]: {
    resumen: "Premia ganar por mucho: 6, 5, 2, 1 o 0",
    detalle:
      "Una victoria es amplia si el ganador hace al menos el doble de puntos que su rival y como mínimo 6. Cada partida da 6 puntos por una victoria amplia, 5 por una victoria, 2 por un empate, 1 por una derrota y 0 por una derrota amplia. Por equipos, cada partida suma a su equipo 4, 3, 2, 1 o 0.",
  },
  [ClassificationType.ALEMAN]: {
    resumen: "Se reparten 20 puntos según la diferencia",
    detalle:
      "Cada partida reparte 20 puntos. Si empatan, 10 para cada uno. Si no, el que gana se lleva 10 más la mitad de la diferencia, redondeando hacia arriba, y el que pierde 10 menos esa mitad: un 12-6 da 13 y 7.",
  },
};

// El mismo desempate para todos los tipos
export const DESEMPATE_CLASIFICACION =
  "Si empatan a puntos de clasificación, desempata la diferencia de puntos, luego los puntos a favor y después los generales matados.";

export function getClassificationTypeLabel(type: ClassificationType): string {
  return ClassificationTypeLabels[type];
}

export const ResultMatchMatchedPlayExtendedTeamType = {
  MAJOR_WIN: 4,
  MINOR_WIN: 3,
  DRAW: 2,
  MINOR_LOSS: 1,
  MAJOR_LOSS: 0,
} as const;

export const ResultMatchMatchedPlayExtendedIndividualType = {
  MAJOR_WIN: 6,
  MINOR_WIN: 5,
  DRAW: 2,
  MINOR_LOSS: 1,
  MAJOR_LOSS: 0,
} as const;

export const ResultMatchMatchedPlayType = {
  WIN: 3,
  DRAW: 1,
  LOSS: 0,
} as const;

export const MatchResultGeneral = {
  DEAD: 1,
} as const;

export const MatchResultPoint = {
  WIN: 1,
  LOSS: 1,
  DRAW: 1,
} as const;
