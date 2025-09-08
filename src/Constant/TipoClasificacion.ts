export enum ClassificationType {
  NORMAL = 1,
  EXTENDED = 2,
  ALEMAN = 3
}

export const ClassificationTypeLabels: Record<ClassificationType, string> = {
  [ClassificationType.NORMAL]: "Normal",
  [ClassificationType.EXTENDED]: "Extendido",
  [ClassificationType.ALEMAN]: "Alemán",
};

export function getClassificationTypeLabel(type: ClassificationType): string {
  return ClassificationTypeLabels[type];
}
