export interface GenerarRonda {
  emparejamientos: Emparejamiento[];
  luzVsOscCheck: boolean;
  mismaComunidadCheck: boolean;
  retosCheck: boolean;
  esEloCheck: boolean;
  opcionImpares: string | null;
  idTorneo: number;
  idRonda: number;
  isTorneoNarsil: boolean;
}

export interface Emparejamiento {
  jugador1: JugadorParaEmparejamiento;
  jugador2: JugadorParaEmparejamiento;
}

export interface JugadorParaEmparejamiento {
  idUsuario: number;
  nick: string;
  bando?: string;
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

export interface UpdatePairingTorneoDTO {
  idPartidaTorneo: number;
  idTorneo: number;
  idUsuario1: number | { idUsuario: number };
  idUsuario2: number | { idUsuario: number };
  nick1: string;
  nick2: string;
}

export interface AddPairingTorneoDTO {
  idTorneo: number;
  idRonda: number;
  idUsuario1?: number | { idUsuario: number };
  idUsuario2?: number | { idUsuario: number };
}

export interface Clasificacion {
  nick: string;
  puntosTorneo: number;
  puntosFavor: number;
  puntosContra: number;
  diferenciaPuntos: number;
  lider: number;
  idUsuario: number;
  bando?: string;
  nombreCortoEjercito?: string;
  idTorneo: number;
  ejercito?: string;
  victorias: number;
  empates: number;
  derrotas: number;
}

export interface RequestUpdatePairingTorneoDTO {
  idPartidaTorneo: number;
  idUsuario1?: number;
  idUsuario2?: number;
}

export interface RequestAddPairingTorneoDTO {
  idTorneo: number;
  idUsuario1?: number;
  idUsuario2?: number;
  idRonda: number;
}
