import { ArmyDTO } from "./Army";

export interface CrearListaTorneoRequestDTO {
  idInscripcion: number;
  idUsuario: number;
  idTorneo: number;
  idOrganizador?: number;
  listaData: string;
  ejercito: ArmyDTO;
}

export interface RequesListaDTO {
  listaData: string;
  ejercito: ArmyDTO;
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
