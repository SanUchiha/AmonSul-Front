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

export function getClassificationTypeLabel(type: ClassificationType): string {
  return ClassificationTypeLabels[type];
}

export const ResultMatchMatchedPlayExtendedType = {
  MAJOR_WIN: 4,
  MINOR_WIN: 3,
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
