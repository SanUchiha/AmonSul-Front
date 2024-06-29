import { appsettings } from "@/settings/appsettings";
import axios, { AxiosError } from "axios";
import { RegistrarFaccionDTO } from "../interfaces/Faccion";

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

export const registrarFaccion = async (nombreFaccionString: string) => {
  try {
    const body: RegistrarFaccionDTO = {
      nombreFaccion: nombreFaccionString,
    };
    const response = await axios.post(baseUrl + "Faccion/Registrar", body);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error as AxiosError;
    } else {
      throw new Error("Ocurrió un error desconocido");
    }
  }
};
