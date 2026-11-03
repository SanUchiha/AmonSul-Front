import { http } from "./index";
import type {
  Bando,
  CruceEjercitosDTO,
  CrucesDestacadosDTO,
  EjercitoBalanceDTO,
  EjercitosJugadorDTO,
  FichaEjercitoDTO,
  FiltroEstadisticas,
} from "@/interfaces/Estadisticas";

// Sin los filtros vacíos: el back toma los que faltan como «todos»
const parametros = (
  filtro: FiltroEstadisticas,
  otros: Record<string, unknown> = {}
) => {
  const todos: Record<string, unknown> = { ...filtro, ...otros };
  return Object.fromEntries(
    Object.entries(todos).filter(
      ([, valor]) =>
        valor !== null &&
        valor !== undefined &&
        valor !== "" &&
        !(Array.isArray(valor) && valor.length === 0)
    )
  );
};

// Las listas van repetidas (temporadas=2025&temporadas=2026), que es como las entiende el back; sin corchetes
const conListas = { indexes: null };

export const getRankingEjercitos = async (
  filtro: FiltroEstadisticas,
  minimo = 10
) =>
  (
    await http.get<EjercitoBalanceDTO[]>("Estadisticas/ejercitos", {
      params: parametros(filtro, { minimo }),
      paramsSerializer: conListas,
    })
  ).data;

export const getFichaEjercito = async (
  ejercito: string,
  filtro: FiltroEstadisticas
) =>
  (
    await http.get<FichaEjercitoDTO>("Estadisticas/ejercitos/ficha", {
      params: parametros(filtro, { ejercito }),
      paramsSerializer: conListas,
    })
  ).data;

// Contra un ejército o contra todos los de un bando: uno de los dos
export const getCruce = async (
  ejercito: string,
  rival: { ejercito?: string | null; bando?: Bando | null },
  filtro: FiltroEstadisticas
) =>
  (
    await http.get<CruceEjercitosDTO>("Estadisticas/ejercitos/cruce", {
      params: parametros(filtro, {
        ejercito,
        rival: rival.ejercito,
        bandoRival: rival.bando,
      }),
      paramsSerializer: conListas,
    })
  ).data;

export const getCrucesDestacados = async (filtro: FiltroEstadisticas) =>
  (
    await http.get<CrucesDestacadosDTO>(
      "Estadisticas/ejercitos/cruces-destacados",
      {
        params: parametros(filtro),
        paramsSerializer: conListas,
      }
    )
  ).data;

export const getEjercitosJugador = async (
  idUsuario: number,
  filtro: FiltroEstadisticas
) =>
  (
    await http.get<EjercitosJugadorDTO>(
      `Estadisticas/ejercitos/jugador/${idUsuario}`,
      {
        params: parametros(filtro),
        paramsSerializer: conListas,
      }
    )
  ).data;
