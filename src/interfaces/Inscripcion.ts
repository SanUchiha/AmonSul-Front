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

export interface TorneoEquipoGestionInfoDTO {
  torneo: TorneoCreadoDTO;
  equipos: EquipoDTO[];
}

export interface TorneoCreadoDTO {
  idTorneo: number;
  idUsuario: number;
  nombreTorneo: string;
  limiteParticipantes?: number | null;
  numeroPartidas: number;
  estadoTorneo: string;
  fechaEntregaListas?: string | null;
  fechaFinInscripcion?: string | null;
  inicioInscripciones?: string | null;
  jugadoresXEquipo: number;
}

export interface EquipoDTO {
  nombreEquipo?: string | null;
  idEquipo: number;
  idCapitan: number;
  nickCapitan?: string | null;
  emailCapitan?: string | null;
  esPago?: string | null;
  fechaInscripcion?: string | null;
  inscripciones: InscripcionTorneoDTO[];
}

export interface InscripcionTorneoDTO {
  idInscripcion: number;
  idTorneo: number;
  idUsuario: number;
  fechaInscripcion?: string | null;
  estadoLista?: string | null;
  fechaEntregaLista?: string | null;
  esPago?: string | null;
  listaData?: string | null;
  ejercito?: string | null;
  idLista: number;
  nick: string;
}
