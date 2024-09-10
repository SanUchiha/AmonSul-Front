export interface CrearListaTorneoRequestDTO {
  idInscripcion: number;
  listaData: string;
  ejercito: string;
}

export interface ObjetoListaDTO {
  listaData: string;
  ejercito: string;
}

export interface ModificarListaTorneoRequestDTO {
  idInscripcion: number;
  idLista: number;
  listaData: string;
  ejercito: string;
}
