import {
  CrearInscripcionDTO,
  UpdateEstadoListaDTO,
  UpdateEstadoPagoDTO,
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

export const getInscripcionesUser = async (idUsuario: string) => {
  return http.get(`Inscripcion/byUser/${idUsuario}`);
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
