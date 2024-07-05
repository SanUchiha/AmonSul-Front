import { NewUserDTO } from "@/interfaces/Usuario";
import { appsettings } from "@/settings/appsettings";
import axios, { AxiosError } from "axios";

const baseUrl: string = appsettings.apiUrl;

export const newUser = async (newUser: NewUserDTO) => {
  try {
    const response = await axios.post(baseUrl + "Usuario/Registrar", newUser);
    if (response.data.status) return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error as AxiosError;
    } else {
      throw new Error("Ocurrió un error desconocido");
    }
  }
};

export const getUsuarioPartidas = async (email: string) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(baseUrl + "Usuario/Email/" + email, {
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

export const getUsuario = async (email: string) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(baseUrl + "Usuario/" + email, {
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

export const getUsuarios = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(baseUrl + "Usuario/All", {
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

export const getNickById = async (idUduario: number) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(baseUrl + "Usuario/id/" + idUduario, {
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
