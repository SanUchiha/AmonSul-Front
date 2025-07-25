import { ArmyDTO } from "./Army";
import { ListaDTO } from "./Usuario";

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
  ejercitoUsuario1: ArmyDTO;
  ejercitoUsuario2: ArmyDTO;
  esElo: boolean;
  partidaValidadaUsuario1: boolean;
}

export interface PartidaTorneoDTO {
  ejercitoUsuario1: string | null;
  ejercitoUsuario2: string | null;
  escenarioPartida: string | null;
  fechaPartida: string;
  ganadorPartidaTorneo: number | null;
  idPartidaTorneo: number;
  idTorneo: number;
  idUsuario1: number;
  idUsuario2: number;
  liderMuertoUsuario1: boolean | null;
  liderMuertoUsuario2: boolean | null;
  nick1: string;
  nick2: string;
  numeroRonda: number;
  partidaValidadaUsuario1: boolean | null;
  partidaValidadaUsuario2: boolean | null;
  resultadoUsuario1: number | null;
  resultadoUsuario2: number | null;
  idEquipo1: number | null;
  idEquipo2: number | null;
  nombreEquipo1: string | null;
  nombreEquipo2: string | null;
  idCapitan1: number | null;
  idCapitan2: number | null;
}

export interface PartidaTorneoMasDTO {
  escenarioPartida: string | null;
  fechaPartida: string;
  ganadorPartidaTorneo: number | null;
  idPartidaTorneo: number;
  idTorneo: number;
  idUsuario1: number;
  idUsuario2: number;
  liderMuertoUsuario1: boolean | null;
  liderMuertoUsuario2: boolean | null;
  nick1: string;
  nick2: string;
  numeroRonda: number;
  partidaValidadaUsuario1: boolean | null;
  partidaValidadaUsuario2: boolean | null;
  resultadoUsuario1: number | null;
  resultadoUsuario2: number | null;
  listasJugador1: ListaDTO[];
  listasJugador2: ListaDTO[];
}

export interface ViewPartidaTorneoDTO {
  idPartidaTorneo: number;
  idUsuario1: number;
  nickUsuario1?: string;
  idUsuario2: number;
  nickUsuario2?: string;
  resultadoUsuario1: number;
  resultadoUsuario2: number;
  fechaPartida: string;
  escenarioPartida?: string;
  puntosPartida: number;
  ganadorPartidaTorneo: number;
  ganadorPartidaNick?: string;
  esTorneo: boolean;
  ejercitoUsuario1?: string;
  ejercitoUsuario2?: string;
  nombreTorneo?: string;
}

export interface ActualizarPairingEquiposDTO {
  idJugador1: number;
  nombreEquipo1: string;
  ejercitoEquipo1: string | null;
  idJugador2: number;
  nombreEquipo2: string;
  ejercitoEquipo2: string | null;
  nick1: string;
  nick2: string;
}
