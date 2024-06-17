import { Jugador, NewUserDTO } from "@/interfaces/Usuario";
import { appsettings } from "@/settings/appsettings";
import axios from "axios";

//const apiUrl = "https://localhost:7125/api/Usuario";

const baseUrl: string = appsettings.apiUrl;

export const newUser = async (newUser: NewUserDTO) => {
  await axios
    .post(baseUrl, { newUser: newUser })
    .then((response) => console.log(response))
    .catch((error) => console.log(error));
};

export const getUsers = async () => {
  try {
    const response = await axios.get(baseUrl);

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

export const getUser = async (idUsuario: number) => {
  try {
    const url = `${baseUrl}/${idUsuario}`;
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

export const getJugadoresMock = async () => {
  const listaJugadores: Jugador[] = [
    {
      ID_Usuario: 1,
      Nombre_Usuario: "Manuel",
      Primer_Apellido: "Torrekampeño",
      Segundo_Apellido: "Gómez",
      Email: "Torre@amonsul.com",
      Contraseña: "Torre123",
      Rol: "JUGADOR",
      Nick: "Torrekampeño",
      Ciudad: "Ubeda",
      Faccion: "Amigos de Torre",
      Fecha_Registro: new Date("2023-01-01"),
      Fecha_Nacimiento: new Date("1990-05-15"),
    },
    {
      ID_Usuario: 2,
      Nombre_Usuario: "Enrique",
      Primer_Apellido: "Trenado",
      Segundo_Apellido: "Gómez",
      Email: "AM@amonsul.com",
      Contraseña: "AM123",
      Rol: "JUGADOR",
      Nick: "AM",
      Ciudad: "Granada",
      Faccion: "Los emeritos",
      Fecha_Registro: new Date("2023-01-01"),
      Fecha_Nacimiento: new Date("1990-05-15"),
    },
    {
      ID_Usuario: 3,
      Nombre_Usuario: "Mario",
      Primer_Apellido: "Ortiz",
      Segundo_Apellido: "Gómez",
      Email: "mafias6969@amonsul.com",
      Contraseña: "mafias6969123",
      Rol: "JUGADOR",
      Nick: "Mafias6969",
      Ciudad: "Ibiza",
      Faccion: "Amigos de AM",
      Fecha_Registro: new Date("2023-01-01"),
      Fecha_Nacimiento: new Date("1990-05-15"),
    },
    {
      ID_Usuario: 4,
      Nombre_Usuario: "Hector",
      Primer_Apellido: "Valor",
      Segundo_Apellido: "Gómez",
      Email: "fundibulo@amonsul.com",
      Contraseña: "fundibulo123",
      Rol: "JUGADOR",
      Nick: "Fundibulo",
      Ciudad: "Ibi",
      Faccion: "Con fundibulo hasta la muerte",
      Fecha_Registro: new Date("2023-01-01"),
      Fecha_Nacimiento: new Date("1990-05-15"),
    },
    {
      ID_Usuario: 5,
      Nombre_Usuario: "Jose Antonio",
      Primer_Apellido: "Sanchez",
      Segundo_Apellido: "Molina",
      Email: "sanuchiha@amonsulo.com",
      Contraseña: "1234",
      Rol: "ADMIN",
      Nick: "SanUchiha",
      Ciudad: "Murcius",
      Faccion: "Murcius una sola",
      Fecha_Registro: new Date("2023-01-01"),
      Fecha_Nacimiento: new Date("1990-05-15"),
    },
  ];
  return listaJugadores;
};

export const getTorneoByNickMock = async (nick: string) => {
  const listaJugadores = getJugadoresMock();
  const jugador = (await listaJugadores).find((x) => x.Nick === nick);
  return jugador;
};
