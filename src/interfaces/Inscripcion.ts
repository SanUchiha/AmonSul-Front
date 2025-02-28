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
  idEquipo?: number;
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

export interface InscripcionTorneoEquiposDTO {
  idInscripcion: number;
  idTorneo: number;
  idCapitan: number;
  fechaInscripcion?: string; // DateOnly no existe en TS, se usa string (ISO 8601)
  esPago?: string;
  idsListas: number[];
  componentesEquipo: ComponentesEquipoDTO[];
  idEquipo: number;
  nombreEquipo?: string;
}

export interface ComponentesEquipoDTO {
  idUsuario: number;
  nick: string;
}
