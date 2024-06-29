import { appsettings } from "@/settings/appsettings";
import axios, { AxiosError } from "axios";

const baseUrl: string = appsettings.apiUrl;

export const getFacciones = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(baseUrl + "Faccion", {
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

export const editarUsuario = async (json: any) => {
  try {
    const response = await axios.put(baseUrl + "Usuario/Editar", json);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error as AxiosError;
    } else {
      throw new Error("Ocurrió un error desconocido");
    }
  }
};
