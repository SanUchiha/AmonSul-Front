import {
  ModificarListaTorneoRequestDTO,
  CrearListaTorneoRequestDTO,
  ListaTorneoRequestDTO,
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

export const getlista = async (idInscripcion: number) => {
  return http.get(`inscripcion/${idInscripcion}`);
};

export const getlistaTorneo = async (request: ListaTorneoRequestDTO) => {
  return http.post(`Lista/Lista-Torneo`, request);
};
