export interface GenerarRonda {
  emparejamientos: Emparejamiento[];
  luzVsOscCheck: boolean;
  mismaComunidadCheck: boolean;
  retosCheck: boolean;
  esEloCheck: boolean;
  opcionImpares: string | null;
  idTorneo: number;
  idRonda: number;
}

export interface Emparejamiento {
  jugador1: JugadorParaEmparejamiento;
  jugador2: JugadorParaEmparejamiento;
}

export interface JugadorParaEmparejamiento {
  idUsuario: number;
  nick: string;
}
