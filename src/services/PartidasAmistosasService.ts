import { ValidarPartidaDTO } from "@/interfaces/Partidas";
import { appsettings } from "@/settings/appsettings";
import axios, { AxiosError } from "axios";

const baseUrl: string = appsettings.apiUrl;

export const getPartidasPendientesValidar = async (email: string) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      baseUrl + "PartidaAmistosa/Pendientes/" + email,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error as AxiosError;
    } else {
      throw new Error("Ocurrió un error desconocido");
    }
  }
};

export const ValidarPartida = async (validarpartidaDTO: ValidarPartidaDTO) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(
      baseUrl + "PartidaAmistosa/Validar",
      validarpartidaDTO,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error as AxiosError;
    } else {
      throw new Error("Ocurrió un error desconocido");
    }
  }
};

export const getPartidasValidadas = async (email: string) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      baseUrl + "PartidaAmistosa/Validadas/" + email,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error as AxiosError;
    } else {
      throw new Error("Ocurrió un error desconocido");
    }
  }
};
