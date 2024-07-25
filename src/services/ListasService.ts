import {
  ModificarListaTorneoRequestDTO,
  CrearListaTorneoRequestDTO,
} from "@/interfaces/Lista";
import { appsettings } from "@/settings/appsettings";
import axios, { AxiosError } from "axios";

const baseUrl: string = appsettings.apiUrl + "Lista/";

export const subirListaTorneo = async (request: CrearListaTorneoRequestDTO) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(baseUrl, request, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error as AxiosError;
    } else {
      throw new Error("Ocurrió un error desconocido");
    }
  }
};

export const modificarListaTorneo = async (
  request: ModificarListaTorneoRequestDTO
) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(baseUrl + request.idLista, request, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error as AxiosError;
    } else {
      throw new Error("Ocurrió un error desconocido");
    }
  }
};

export const getlista = async (idInscripcion: number) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(baseUrl + "inscripcion/" + idInscripcion, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error as AxiosError;
    } else {
      throw new Error("Ocurrió un error desconocido");
    }
  }
};
