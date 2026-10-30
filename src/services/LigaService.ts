import { http } from "./index";

// Gestión de los torneos con formato Liga; solo el organizador. Si no se puede, el back responde 400 con el motivo

export const generarLigaAsync = async (idTorneo: number) => {
  return http.post(`Liga/${idTorneo}/Generar`, {});
};

export const eliminarJornadasLigaAsync = async (idTorneo: number) => {
  return http.delete(`Liga/${idTorneo}/Jornadas`);
};

export const retirarJugadorLigaAsync = async (
  idTorneo: number,
  idInscripcion: number
) => {
  return http.post(`Liga/${idTorneo}/Retirar/${idInscripcion}`, {});
};
