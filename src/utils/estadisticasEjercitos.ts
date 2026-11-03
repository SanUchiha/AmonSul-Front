import type { LocationQuery, LocationQueryRaw } from "vue-router";
import type {
  Bando,
  FiltroEstadisticas,
  TramoPuntos,
} from "@/interfaces/Estadisticas";

// Los tramos de puntos con su nombre para la pantalla, en el orden en que se muestran
export const TRAMOS: { valor: TramoPuntos; texto: string }[] = [
  { valor: "hasta-550", texto: "Hasta 550" },
  { valor: "600-650", texto: "600-650" },
  { valor: "700-750", texto: "700-750" },
  { valor: "800+", texto: "800+" },
];

export const textoTramo = (tramo: TramoPuntos) =>
  TRAMOS.find(t => t.valor === tramo)?.texto ?? tramo;

// Los mismos en todas partes: en las estadísticas y en la ficha de jugador
export const textoBando = (bando: Bando | string | null | undefined) =>
  bando === "good" ? "Bien" : bando === "evil" ? "Mal" : "";
export const colorBando = (bando: Bando | string | null | undefined) =>
  bando === "good" ? "blue" : bando === "evil" ? "red" : "grey";

// Por debajo, una o dos partidas lo deciden todo
export const POCAS_PARTIDAS = 20;

// «Rinde» con su signo: +3, −2 o 0
export const textoRinde = (rinde: number) => {
  const redondeado = Math.round(rinde);
  if (redondeado > 0) return `+${redondeado}`;
  if (redondeado < 0) return `−${Math.abs(redondeado)}`;
  return "0";
};
export const colorRinde = (rinde: number) =>
  Math.round(rinde) > 0
    ? "text-success"
    : Math.round(rinde) < 0
      ? "text-error"
      : "text-medium-emphasis";

export const textoPorcentaje = (porcentaje: number) =>
  `${Math.round(porcentaje)} %`;

// Con coma decimal y como mucho un decimal: 10,1
export const textoDecimal = (numero: number) =>
  numero.toLocaleString("es-ES", { maximumFractionDigits: 1 });

// Los filtros en la URL, para recargar o compartir un enlace sin perderlos: temporadas=2025,2026 (o «todas»),
// tramos=hasta-550,600-650, bando=good y amistosas=si. Lo que no viene en la URL sale del filtro por defecto, y lo que
// no se entiende se ignora
const CLAVES_FILTRO = ["temporadas", "tramos", "bando", "amistosas"];

const textoDeQuery = (query: LocationQuery, clave: string): string | null => {
  const valor = query[clave];
  if (Array.isArray(valor)) return valor[0] ?? null;
  return valor ?? null;
};

export function filtroDesdeQuery(
  query: LocationQuery,
  porDefecto: FiltroEstadisticas
): FiltroEstadisticas {
  const temporadas = textoDeQuery(query, "temporadas");
  const tramos = textoDeQuery(query, "tramos");
  const bando = textoDeQuery(query, "bando");
  const amistosas = textoDeQuery(query, "amistosas");
  return {
    temporadas:
      temporadas === null
        ? [...(porDefecto.temporadas ?? [])]
        : temporadas === "todas"
          ? []
          : [...new Set(temporadas.split(",").map(Number))].filter(
              a => Number.isInteger(a) && a >= 2000 && a <= 2100
            ),
    tramos:
      tramos === null
        ? [...(porDefecto.tramos ?? [])]
        : TRAMOS.map(t => t.valor).filter(valor =>
            tramos.split(",").includes(valor)
          ),
    bando:
      bando === "good" || bando === "evil"
        ? bando
        : bando === null
          ? (porDefecto.bando ?? null)
          : null,
    amistosas:
      amistosas === null ? (porDefecto.amistosas ?? false) : amistosas === "si",
  };
}

// La URL con estos filtros, sin tocar lo demás que lleve (la sección, el jugador)
export function queryConFiltro(
  query: LocationQuery,
  filtro: FiltroEstadisticas
): LocationQueryRaw {
  const resto = Object.fromEntries(
    Object.entries(query).filter(([clave]) => !CLAVES_FILTRO.includes(clave))
  );
  const temporadas = [...(filtro.temporadas ?? [])].sort();
  return {
    ...resto,
    temporadas: temporadas.length ? temporadas.join(",") : "todas",
    ...(filtro.tramos?.length
      ? {
          tramos: TRAMOS.map(t => t.valor)
            .filter(v => filtro.tramos?.includes(v))
            .join(","),
        }
      : {}),
    ...(filtro.bando ? { bando: filtro.bando } : {}),
    ...(filtro.amistosas ? { amistosas: "si" } : {}),
  };
}
