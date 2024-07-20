import {
  CrearInscripcionDTO,
  InscripcionUsuarioDTO,
} from "@/interfaces/Inscripcion";
import { appsettings } from "@/settings/appsettings";
import axios, { AxiosError } from "axios";

const baseUrl: string = appsettings.apiUrl + "Inscripcion/";

export const getIncripcionById = async (idInscripcion: number) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(baseUrl + idInscripcion, {
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

export const getAllInscripciones = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(baseUrl, {
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

export const registrarInscripcion = async (
  nuevaInscripcion: CrearInscripcionDTO
) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(baseUrl, nuevaInscripcion, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.data.status) return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error as AxiosError;
    } else {
      throw new Error("Ocurrió un error desconocido");
    }
  }
};

export const cancelarInscripcion = async (idInscripcion: number) => {
  try {
    const token = localStorage.getItem("token");
    const url = `${baseUrl}${idInscripcion}`;
    const response = await axios.delete(url, {
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

export const getInscripcionesUser = async (idUsuario: number) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(baseUrl + "byUser/" + idUsuario, {
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

export const getInscripcionesTorneo = async (idTorneo: number) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(baseUrl + "byTorneo/" + idTorneo, {
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
