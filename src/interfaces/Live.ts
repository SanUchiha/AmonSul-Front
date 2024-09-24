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

export interface UpdatePartidaTorneoDTO {
  idPartidaTorneo: number;
  resultadoUsuario1?: number | null;
  resultadoUsuario2?: number | null;
  escenarioPartida?: string | null;
  ganadorPartidaTorneo?: number | null;
  partidaValidadaUsuario1?: boolean | null;
  partidaValidadaUsuario2?: boolean | null;
  liderMuertoUsuario1?: boolean | null;
  liderMuertoUsuario2?: boolean | null;
}

export interface Clasificacion {
  nick: string;
  victorias: number;
  puntosFavor: number;
  puntosContra: number;
  diferenciaPuntos: number;
  lider: number;
  idUsuario: number;
}
