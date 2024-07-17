export interface ViewPartidaAmistosaDTO {
  idPartidaAmistosa: number;
  idUsuario1: number;
  nickUsuario1: string;
  idUsuario2: number;
  nickUsuario2: string;
  resultadoUsuario1: number;
  resultadoUsuario2: number;
  fechaPartida: string;
  esMatchedPlayPartida: boolean;
  escenarioPartida: string;
  puntosPartida: number | null;
  ganadorPartida: number;
  ganadorPartidaNick: string;
  esElo: boolean;
  esTorneo: boolean;
  partidaValidadaUsuario1: boolean;
  partidaValidadaUsuario2: boolean;
  ejercitoUsuario1: string;
  ejercitoUsuario2: string;
}

export interface ValidarPartidaDTO {
  idPartida: number;
  emailJugador: string;
}

export interface CreatePartidaAmistosaDTO {
  IdUsuario1: number;
  IdUsuario2: number;
  resultadoUsuario1: number;
  resultadoUsuario2: number;
  puntosPartida: number;
  esMatchedPlayPartida: boolean;
  escenarioPartida: string;
  esTorneo: boolean;
  ejercitoUsuario1: string;
  ejercitoUsuario2: string;
}
