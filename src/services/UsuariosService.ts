import axios from "axios";

const apiUrl = "https://localhost:7125/api/Usuario";

export const getUsers = async () => {
  try {
    const response = await axios.get(apiUrl);

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("No se pudo obtener la información de los usuarios");
    }
  } catch (error) {
    console.error("Error al obtener la información de los usuarios:", error);
    return [];
  }
};

export const doLogin = async (correo: string, password: string) => {
  axios
    .post(apiUrl, {
      correo: correo,
      password: password,
    })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
};

export const getUser = async (idUsuario: number) => {
  try {
    const url = `${apiUrl}/${idUsuario}`;
    const response = await axios.get(url);

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("No se pudo obtener la información del usuario");
    }
  } catch (error) {
    console.error("Error al obtener la información de los usuarios:", error);
    return null;
  }
};
