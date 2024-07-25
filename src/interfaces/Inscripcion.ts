export interface CrearInscripcionDTO {
  idTorneo: number;
  idUsuario: number;
}

export interface InscripcionUsuarioDTO {
  idInscripcion: number;
  idTorneo: number;
  idUsuario: number;
  nick: string;
  email: string;
  estadoInscripcion: string;
  fechaInscripcion: string;
  estadoLista: string;
  fechaEntregaLista: string;
  esPago: boolean;
  nombreTorneo: string;
}
