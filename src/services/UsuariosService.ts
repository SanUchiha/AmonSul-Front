import { EditarFaccionDTO } from "@/interfaces/Faccion";
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

export const getNickById = async (idUsuario: number) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(baseUrl + "Usuario/id/" + idUsuario, {
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

export const getUsuarioByNick = async (nick: string) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(baseUrl + "Usuario/nick/" + nick, {
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

export const getDetalleUsuarioByEmail = async (email: string) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(baseUrl + "Usuario/detalle/" + email, {
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

export const getUsuarioData = async (idUsuario: number) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(baseUrl + "Usuario/Data/" + idUsuario, {
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

export const editarFaccion = async (body: EditarFaccionDTO) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(
      baseUrl + "Usuario/modificar-faccion",
      body,
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
