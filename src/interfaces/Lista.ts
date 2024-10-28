import { army } from "./Army";

export interface CrearListaTorneoRequestDTO {
  idInscripcion: number;
  idUsuario: number;
  idTorneo: number;
  idOrganizador: number;
  listaData: string;
  ejercito: army;
}

export interface RequesListaDTO {
  listaData: string;
  ejercito: army;
}

export interface ModificarListaTorneoRequestDTO {
  idInscripcion: number;
  idLista: number;
  idUsuario: number;
  idTorneo: number;
  idOrganizador: number;
  listaData: string;
  ejercito: army;
}

export interface ListaTorneoRequestDTO {
  idTorneo: number;
  idUsuario: number;
}

export interface ListaTorneoResponseDTO {
  listaData: string;
}
