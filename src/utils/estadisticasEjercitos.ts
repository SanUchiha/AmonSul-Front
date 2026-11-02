import type { Bando, TramoPuntos } from "@/interfaces/Estadisticas";

// Los tramos de puntos con su nombre para la pantalla, en el orden en que se muestran
export const TRAMOS: { valor: TramoPuntos; texto: string }[] = [
  { valor: "hasta-550", texto: "Hasta 550" },
  { valor: "600-650", texto: "600-650" },
  { valor: "700-750", texto: "700-750" },
  { valor: "800+", texto: "800+" },
];

export const textoTramo = (tramo: TramoPuntos) => TRAMOS.find(t => t.valor === tramo)?.texto ?? tramo;

export const textoBando = (bando: Bando | null) => (bando === "good" ? "Bien" : bando === "evil" ? "Mal" : "");
export const colorBando = (bando: Bando | null) => (bando === "good" ? "blue" : bando === "evil" ? "red" : "grey");

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
  Math.round(rinde) > 0 ? "text-success" : Math.round(rinde) < 0 ? "text-error" : "text-medium-emphasis";

export const textoPorcentaje = (porcentaje: number) => `${Math.round(porcentaje)} %`;

// Con coma decimal y como mucho un decimal: 10,1
export const textoDecimal = (numero: number) => numero.toLocaleString("es-ES", { maximumFractionDigits: 1 });
