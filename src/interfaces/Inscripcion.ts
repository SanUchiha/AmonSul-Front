export interface CrearInscripcionDTO {
  idTorneo: number;
  idUsuario: number;
}

export interface InscripcionUsuarioDTO {
  idInscripcion: number;
  idTorneo: number;
  idUsuario: number;
  idOrganizador: number;
  nick: string;
  email: string;
  fechaInscripcion: string;
  estadoLista: string;
  fechaEntregaLista: string;
  esPago: boolean;
  nombreTorneo: string;
}

export interface UpdateEstadoListaDTO {
  idInscripcion: number;
  estadoLista: string;
}

export interface UpdateEstadoPagoDTO {
  idInscripcion: number;
  esPago: string;
}
