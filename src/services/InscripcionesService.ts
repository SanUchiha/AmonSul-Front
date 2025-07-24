import {
  CrearInscripcionDTO,
  CreateMiembroEquipoDTO,
  InscripcionEquipoDTO,
  UpdateEstadoListaDTO,
  UpdateEstadoPagoDTO,
  UpdateEstadoPagoEquipoDTO,
  UpdatePuntosExtraDTO,
} from "@/interfaces/Inscripcion";
import { http } from "./index";

export const getIncripcionById = async (idInscripcion: number) => {
  return http.get(`Inscripcion/${idInscripcion}`);
};

export const getAllInscripciones = async () => {
  return http.get("Inscripcion");
};

export const registrarInscripcion = async (
  nuevaInscripcion: CrearInscripcionDTO
) => {
  return http.post(`Inscripcion`, nuevaInscripcion);
};

export const cancelarInscripcion = async (idInscripcion: number) => {
  return http.delete(`Inscripcion/${idInscripcion}`);
};

export const eliminarEquipoAsync = async (idEquipo: number) => {
  return http.delete(`Inscripcion/equipo/${idEquipo}`);
};

export const getInscripcionesIndividualByUser = async (idUsuario: string) => {
  return http.get(`Inscripcion/individual/byUser/${idUsuario}`);
};

export const getInscripcionesEquipoByUser = async (idUsuario: number) => {
  return http.get(`Inscripcion/Equipo/byUser/${idUsuario}`);
};

export const getInscripcionesTorneo = async (idTorneo: number) => {
  return http.get(`Inscripcion/byTorneo/${idTorneo}`);
};

export const updateEstadoLista = async (nuevaEstado: UpdateEstadoListaDTO) => {
  return http.put(`Inscripcion/Estado-Lista`, nuevaEstado);
};

export const updateEstadoPago = async (nuevaEstado: UpdateEstadoPagoDTO) => {
  return http.put(`Inscripcion/Estado-Pago`, nuevaEstado);
};

export const updatePuntosExtraAsync = async (request: UpdatePuntosExtraDTO) => {
  return http.put(`Inscripcion/Puntos-Extra`, request);
};

export const updateEstadoPagoEquipo = async (
  nuevaEstado: UpdateEstadoPagoEquipoDTO
) => {
  return http.put(`Inscripcion/Equipo/Estado-Pago`, nuevaEstado);
};

export const registrarEquipo = async (
  nuevaInscripcion: InscripcionEquipoDTO
) => {
  return http.post(`Inscripcion/equipo`, nuevaInscripcion);
};

export const registrarMiembroEquipoAsync = async (
  request: CreateMiembroEquipoDTO
): Promise<{ idInscripcion: number }> => {
  const response = await http.post(
    `Inscripcion/Registar-miembro-Equipo`,
    request
  );
  return response.data;
};

export const eliminarMiembroEquipoAsync = async (idInscripcion: number) => {
  return http.delete(`Inscripcion/Miembro/${idInscripcion}`);
};

export const getInscripcionEquipo = async (idInscripcion: number) => {
  return http.get(`Inscripcion/Equipo/${idInscripcion}`);
};

export const getJugadoresEquipos = async (
  idInscripcion1: number,
  idInscripcion2: number
) => {
  return http.get(`Inscripcion/Equipo/${idInscripcion1}/${idInscripcion2}`);
};

export const estaApuntadoTorneoAsync = async (
  idTorneo: number,
  idUsuario: number
) => {
  return http.get(`Inscripcion/apuntado/${idUsuario}/${idTorneo}`);
};
