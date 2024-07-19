export interface UsuarioElo {
  nick: string;
  elo: number;
  partidas: number;
  ganadas: number;
  empatadas: number;
  perdidas: number;
}

export interface UsuarioEloTablaClasificacion {
  nick: string;
  elo: number;
  partidas: number;
  ganadas: number;
  empatadas: number;
  perdidas: number;
  clasificacion: number;
}
