import { http } from "./index";
import type {
  RatingEjercitoRequestDTO,
  RatingEjercitoResponseDTO,
  TopBandosResponseDTO,
} from "@/interfaces/Estadisticas";

export const getTopEjercitosPorBando = async (
  top = 3
): Promise<TopBandosResponseDTO> => {
  const response = await http.get<TopBandosResponseDTO>(
    `Estadisticas/ejercito/top-bandos`,
    { params: { top } }
  );
  return response.data;
};

export const getRatingEjercito = async (
  request: RatingEjercitoRequestDTO
): Promise<RatingEjercitoResponseDTO> => {
  const response = await http.post<RatingEjercitoResponseDTO>(
    `Estadisticas/ejercito/rating`,
    request
  );
  return response.data;
};
