export interface GenerarRonda {
  emparejamientos: Emparejamiento[];
  luzVsOscCheck: boolean;
  mismaComunidadCheck: boolean;
  retosCheck: boolean;
  esEloCheck: boolean;
}

export interface Emparejamiento {
  jugador1: JugadorParaEmparejamiento;
  jugador2: JugadorParaEmparejamiento;
}

export interface JugadorParaEmparejamiento {
  idUsuario: number;
  nick: string;
}
