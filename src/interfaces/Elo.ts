export interface UsuarioElo {
  nick: string;
  idUsuario: number;
  elo: number;
  partidas: number;
  ganadas: number;
  empatadas: number;
  perdidas: number;
}

export interface UsuarioEloTablaClasificacion {
  nick: string;
  idUsuario: number;
  elo: number;
  partidas: number;
  ganadas: number;
  empatadas: number;
  perdidas: number;
  clasificacion: number;
  idFaccion: number;
}

export interface EloDTO {
  puntuacionElo: number;
  fechaElo: string;
}
