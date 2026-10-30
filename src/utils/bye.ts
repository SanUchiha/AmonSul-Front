// El bye lo pone el sistema cuando los jugadores son impares: no es nadie, ni cuenta como inscrito ni clasifica
export const ID_BYE = 568;

export const esUsuarioBye = (idUsuario?: number | null, nick?: string | null) =>
  idUsuario === ID_BYE || /^bye\d*$/i.test((nick ?? "").trim());
