import { AddCircuitoTorneoDTO } from "@/interfaces/Circuito";
import { http } from "./index";

export const getCircuito = async (idCircuito: number) => {
  return http.get(`circuitos/${idCircuito}`);
};

export const getCircuitos = async () => {
  return http.get(`circuitos`);
};

export const getTorneosOfCircuito = async (idCircuito: number) => {
  return http.get(`circuitos/${idCircuito}/torneos`);
};

export const getCircuitosNoTorneoAsync = async (idTorneo: number) => {
  return http.get(`circuitos/no-circuito-torneo/${idTorneo}`);
};

export const getCircuitosAsociadosATorneoAsync = async (idTorneo: number) => {
  return http.get(`circuitos/torneo/${idTorneo}`);
};

export const addTorneoToCircuitoAsync = async (request: AddCircuitoTorneoDTO) => {
  return http.post(`circuitos`, request);
};

export const deleteCircuitoTorneoAsync = async (
  idTorneo: number,
  idCircuito: number
) => {
  return http.delete(`circuitos/${idCircuito}/torneo/${idTorneo}`);
};
