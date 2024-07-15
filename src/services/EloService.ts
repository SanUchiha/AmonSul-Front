import { appsettings } from "@/settings/appsettings";
import axios, { AxiosError } from "axios";

const baseUrl: string = appsettings.apiUrl;

export const getEloUsuario = async (email: string) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(baseUrl + "Elo/Usuario/" + email, {
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

export const getClasifiacionElo = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(baseUrl + "Elo/Clasificacion/", {
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
