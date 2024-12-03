import {
  CreatePartidaAmistosaDTO,
  ValidarPartidaDTO,
} from "@/interfaces/Partidas";
import { http } from "./index";

export const getPartidasAmistosasByIdUser = async (idUser: number) => {
  return http.get(`PartidaAmistosa/Partidas/${idUser}`);
};

export const getById = async (idPartida: string) => {
  return http.get(`PartidaAmistosa/Partida/${idPartida}`);
};

export const getPartidasPendientesValidar = async (idUsuario: number) => {
  return http.get(`PartidaAmistosa/Pendientes/${idUsuario}`);
};

export const ValidarPartida = async (validarpartidaDTO: ValidarPartidaDTO) => {
  return http.put(`PartidaAmistosa/Validar`, validarpartidaDTO);
};

export const cancelarPartida = async (idPartida: number) => {
  return http.delete(`PartidaAmistosa/Cancelar/${idPartida}`);
};

export const getPartidasValidadas = async (email: string) => {
  return http.get(`PartidaAmistosa/Validadas/${email}`);
};

export const registrarPartida = async (
  nuevaPartida: CreatePartidaAmistosaDTO
) => {
  return http.post(`PartidaAmistosa`, nuevaPartida);
};
