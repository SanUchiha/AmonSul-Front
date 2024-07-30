import { http } from './index'

export const getTorneos = async () => {
  return http.get(`Torneo`)
};

export const getTorneo = async (idTorneo: number) => {
  return http.get(`Torneo/id/${idTorneo}`)
};

export const descargarBasesTorneo = async (idTorneo: number) => {
  return http.get(`Torneo/bases/${idTorneo}`)
};

export const getTorneosCreadosUsuario = async (idUsuario: string) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(BASE_URL + "Torneo/creados/" + idUsuario, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error recuperando torneos creados por el usuario:", error);
    throw error;
  }
};
