export interface CrearInscripcionDTO {
  idTorneo: number;
  idUsuario: number;
}

export interface InscripcionUsuarioIndividualDTO {
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
  idEquipo?: number;
}

export interface InscripcionUsuarioEquipoDTO {
  idInscripcion: number;
  idTorneo: number;
  idUsuario: number;
  nick: string;
  nombreTorneo: string;
  idEquipo: number;
}

export interface Equipo {
  idEquipo: number;
  nombreEquipo: string;
  idCapitan: number;
}

export interface UpdateEstadoListaDTO {
  idInscripcion: number;
  estadoLista: string;
}

export interface UpdateEstadoPagoDTO {
  idInscripcion: number;
  esPago: string;
}

export interface InscripcionEquipoDTO {
  idTorneo: number;
  idCapitan: number;
  nombreEquipo: string;
  miembros: number[];
}

export interface InscripcionEquipoDTO {
  idInscripcion: number;
  idTorneo: number;
  idUsuario: number;
  idCapitan: number;
  idEquipo: number;
  idOrganizador: number;
  emailOrganizador: string;
  fechaInscripcion?: string;
  esPago?: string;
  componentesEquipoDTO: ComponentesEquipoDTO[];
}

export interface ComponentesEquipoDTO {
  idUsuario: number;
  idInscripcion: number;
  nick: string;
  esCapitan: boolean;
  estadoLista?: string;
  fechaEntregaLista?: string;
  listaData?: string;
  ejercito?: string;
  idLista: number;
}
