import { GenerarRonda } from "@/interfaces/Live";
import { http } from "./index";

export const generarRonda = async (nuevaRonda: GenerarRonda) => {
  return http.post(`Torneo/Gestion/Generar-Ronda`, nuevaRonda);
};
