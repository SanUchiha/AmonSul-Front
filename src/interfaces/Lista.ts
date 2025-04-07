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
