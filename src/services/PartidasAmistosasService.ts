import {
  CreatePartidaAmistosaDTO,
  ValidarPartidaDTO,
} from "@/interfaces/Partidas";
import { http } from './index'


export const getById = async (idPartida: string) => {
  return http.get(`PartidaAmistosa/Partida/${idPartida}`)
};

export const getPartidasPendientesValidar = async (email: string) => {
  return http.get(`PartidaAmistosa/Pendientes/${email}`)
};

export const ValidarPartida = async (validarpartidaDTO: ValidarPartidaDTO) => {
  return http.put(`PartidaAmistosa/Validar`, validarpartidaDTO)
};

export const cancelarPartida = async (idPartida: number) => {
  return http.delete(`PartidaAmistosa/Cancelar/${idPartida}`)
};

export const getPartidasValidadas = async (email: string) => {
  return http.get(`PartidaAmistosa/Validadas/${email}`)
};

export const registrarPartida = async (
  nuevaPartida: CreatePartidaAmistosaDTO
) => {
  return http.post(`PartidaAmistosa`, nuevaPartida)
};
