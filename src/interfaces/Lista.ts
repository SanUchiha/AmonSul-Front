export interface CrearListaTorneoRequestDTO {
  idInscripcion: number;
  listaData: string;
}

export interface ModificarListaTorneoRequestDTO {
  idInscripcion: number;
  idLista: number;
  listaData: string;
}
