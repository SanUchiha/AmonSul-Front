import axios from "axios";

const apiUrl = "https://jsonplaceholder.typicode.com/users";

/*
const usuarios: Usuario[] = [
  {
    nombre: "Jose Antonio Sanchez Molina",
    correo: "123@123.com",
    pass: "123",
  },
  {
    nombre: "María García",
    correo: "maria@example.com",
    pass: "password456",
  },
  {
    nombre: "Pedro Rodríguez",
    correo: "pedro@example.com",
    pass: "secreto789",
  },
  {
    nombre: "Ana Martínez",
    correo: "ana@example.com",
    pass: "clave987",
  },
  {
    nombre: "Luisa Sánchez",
    correo: "luisa@example.com",
    pass: "pass1234",
  },
];
*/
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

export const getUsersFake = async () => {
  //return usuarios;
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
