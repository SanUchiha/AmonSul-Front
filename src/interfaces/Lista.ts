// DTO para la descarga de listas completas de un torneo
export interface ListaCompletaDTO {
  idLista: number;
  idInscripcion: number;
  nick: string;
  listaData?: string;
  bando?: string;
  ejercito?: string;
  estadoLista?: string;
  fechaEntrega?: string; // DateOnly se serializa como string (YYYY-MM-DD)
}
import { ArmyDTO } from "./Army";

export interface CrearListaTorneoRequestDTO {
  idInscripcion: number;
  idUsuario: number;
  idTorneo: number;
  listaData: string;
  ejercito: ArmyDTO;
  nick?: string;
  emailOrganizador?: string;
  nombreEquipo?: string;
  idOrganizador?: number;
}

export interface RequesListaDTO {
  listaData: string;
  ejercito: ArmyDTO;
  idUsuario: number;
  nick: string;
}

export interface ModificarListaTorneoRequestDTO {
  idInscripcion?: number;
  idLista: number;
  idUsuario?: number;
  idTorneo?: number;
  idOrganizador?: number;
  listaData: string;
  ejercito: ArmyDTO;
}

export interface ListaTorneoRequestDTO {
  idTorneo: number;
  idUsuario: number;
}

export interface ListaTorneoResponseDTO {
  listaData: string;
}

export interface ListaJugador {
  listaData: string;
  nombreEjercito: string;
  nick: string;
}

export interface UpdateEstadoListaMasDTO {
  idLista: number;
  estado: string;
  idTorneo: number;
  idUsuario: number;
}
