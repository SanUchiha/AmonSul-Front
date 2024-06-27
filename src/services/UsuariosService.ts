import { Jugador, NewUserDTO } from "@/interfaces/Usuario";
import { appsettings } from "@/settings/appsettings";
import axios, { AxiosError } from "axios";

//const apiUrl = "https://localhost:7125/api/Usuario";

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

export const getUsuario = async (email: string) => {
  try {
    const response = await axios.get(baseUrl + "Usuario/" + email);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error as AxiosError;
    } else {
      throw new Error("Ocurrió un error desconocido");
    }
  }
};

export const getJugadoresMock = async () => {
  const listaJugadores: Jugador[] = [
    {
      ID_Usuario: 1,
      NombreUsuario: "Manuel",
      PrimerApellido: "Torrekampeño",
      SegundoApellido: "Gómez",
      Email: "Torre@amonsul.com",
      Contraseña: "Torre123",
      Rol: "JUGADOR",
      Nick: "Torrekampeño",
      Ciudad: "Ubeda",
      Faccion: "Amigos de Torre",
      FechaRegistro: new Date("2023-01-01"),
      FechaNacimiento: new Date("1990-05-15"),
    },
    {
      ID_Usuario: 2,
      NombreUsuario: "Enrique",
      PrimerApellido: "Trenado",
      SegundoApellido: "Gómez",
      Email: "AM@amonsul.com",
      Contraseña: "AM123",
      Rol: "JUGADOR",
      Nick: "AM",
      Ciudad: "Granada",
      Faccion: "Los emeritos",
      FechaRegistro: new Date("2023-01-01"),
      FechaNacimiento: new Date("1990-05-15"),
    },
    {
      ID_Usuario: 3,
      NombreUsuario: "Mario",
      PrimerApellido: "Ortiz",
      SegundoApellido: "Gómez",
      Email: "mafias6969@amonsul.com",
      Contraseña: "mafias6969123",
      Rol: "JUGADOR",
      Nick: "Mafias6969",
      Ciudad: "Ibiza",
      Faccion: "Amigos de AM",
      FechaRegistro: new Date("2023-01-01"),
      FechaNacimiento: new Date("1990-05-15"),
    },
    {
      ID_Usuario: 4,
      NombreUsuario: "Hector",
      PrimerApellido: "Valor",
      SegundoApellido: "Gómez",
      Email: "fundibulo@amonsul.com",
      Contraseña: "fundibulo123",
      Rol: "JUGADOR",
      Nick: "Fundibulo",
      Ciudad: "Ibi",
      Faccion: "Con fundibulo hasta la muerte",
      FechaRegistro: new Date("2023-01-01"),
      FechaNacimiento: new Date("1990-05-15"),
    },
    {
      ID_Usuario: 5,
      NombreUsuario: "Jose Antonio",
      PrimerApellido: "Sanchez",
      SegundoApellido: "Molina",
      Email: "sanuchiha@amonsulo.com",
      Contraseña: "1234",
      Rol: "ADMIN",
      Nick: "SanUchiha",
      Ciudad: "Murcius",
      Faccion: "Murcius una sola",
      FechaRegistro: new Date("2023-01-01"),
      FechaNacimiento: new Date("1990-05-15"),
    },
  ];
  return listaJugadores;
};

export const getTorneoByNickMock = async (nick: string) => {
  const listaJugadores = getJugadoresMock();
  const jugador = (await listaJugadores).find((x) => x.Nick === nick);
  return jugador;
};
