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
  partidaValidadaUsuario1: boolean;
  partidaValidadaUsuario2: boolean;
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
}
