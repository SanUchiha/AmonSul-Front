// Puntos de circuito de un puesto en un evento. Ganarlo da 10 puntos más cada vez que el evento dobla su tamaño, hasta
// 64 jugadores: así un Nacional no decide el circuito. Por debajo, los puntos caen con el cuadrado del puesto: la mitad
// de la tabla se lleva un cuarto. Todo el que juega suma al menos 1 y el podio suma +5, +3 y +1
const TOPE_JUGADORES_CIRCUITO = 64;
const BONUS_PODIO: Record<number, number> = { 1: 5, 2: 3, 3: 1 };

// A partir de las posiciones guardadas del evento, los puntos de cada puesto. El evento vale por sus jugadores, pero la
// tabla se baja por puestos: en Parejas los dos miembros comparten el suyo, así que 8 parejas son 16 jugadores y 8 puestos
export function puntosDelEvento(posiciones: { resultado: number }[]) {
  const puestos = new Set(posiciones.map(posicion => posicion.resultado)).size;
  const base =
    10 * Math.log2(Math.min(posiciones.length, TOPE_JUGADORES_CIRCUITO));

  return (puesto: number): number => {
    if (puesto < 1) return 0;
    const proporcion = Math.max(0, (puestos - puesto + 1) / puestos);
    return (
      Math.max(1, Math.round(base * proporcion ** 2)) +
      (BONUS_PODIO[puesto] ?? 0)
    );
  };
}
