export interface ViewPartidaAmistosaDTO {
  idPartidaAmistosa: number;
  idUsuario1: number;
  idUsuario2: number;
  resultadoUsuario1: number;
  resultadoUsuario2: number;
  fechaPartida: string;
  esMatchedPlayPartida: boolean;
  escenarioPartida: string;
  puntosPartida: number | null;
  ganadorPartida: number;
  esElo: boolean;
  partidaValidadaUsuario1: boolean;
  partidaValidadaUsuario2: boolean;
}

export interface ValidarPartidaDTO {
  idPartida: number;
  emailJugador: string;
}
