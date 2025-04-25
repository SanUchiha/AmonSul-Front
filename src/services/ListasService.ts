import {
  ModificarListaTorneoRequestDTO,
  CrearListaTorneoRequestDTO,
  ListaTorneoRequestDTO,
  UpdateEstadoListaMasDTO,
} from "@/interfaces/Lista";
import { http } from "./index";

export const subirListaTorneo = async (request: CrearListaTorneoRequestDTO) => {
  return http.post(`Lista`, request);
};

export const modificarListaTorneo = async (
  request: ModificarListaTorneoRequestDTO
) => {
  return http.put(`Lista/${request.idLista}`, request);
};

export const updateEstadoListaMasAsync = async (
  request: UpdateEstadoListaMasDTO
) => {
  return http.put(`lista/estado`, request);
};

export const getlista = async (idInscripcion: number) => {
  return http.get(`inscripcion/${idInscripcion}`);
};

export const getListaById = async (idLista: number) => {
  return http.get(`lista/${idLista}`);
};

export const getListasByInscripcion = async (idInscripcion: number) => {
  return http.get(`lista/listas/${idInscripcion}`);
};

export const getlistaTorneo = async (request: ListaTorneoRequestDTO) => {
  return http.get(
    `Lista/Lista-Torneo/${request.idTorneo}/${request.idUsuario}`
  );
};
