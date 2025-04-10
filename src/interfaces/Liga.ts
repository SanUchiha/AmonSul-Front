export interface LigaTorneosDTO {
  idLiga: number;
  nombreLiga: string;
  idTorneo: number;
  torneoNombre: string;
}

export interface LigaDTO {
  idLiga: number;
  nombreLiga: string;
}

export interface AddLigaTorneoDTO {
  idLiga: number;
  idTorneo: number;
}
