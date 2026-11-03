// Puntos de circuito de un puesto en un evento. Ganarlo da 10 puntos más cada vez que el evento dobla su tamaño, hasta
// 64 jugadores: así un Nacional no decide el circuito. Por debajo, los puntos caen con el cuadrado del puesto: la mitad
// de la tabla se lleva un cuarto. Todo el que juega suma al menos 1 y el podio suma +5, +3 y +1
export const TOPE_JUGADORES_CIRCUITO = 64;
const BONUS_PODIO: Record<number, number> = { 1: 5, 2: 3, 3: 1 };

// jugadores: los que tienen posición guardada en el evento
export function puntosCircuito(jugadores: number, puesto: number): number {
  if (jugadores < 1 || puesto < 1) return 0;
  const base = 10 * Math.log2(Math.min(jugadores, TOPE_JUGADORES_CIRCUITO));
  const proporcion = Math.max(0, (jugadores - puesto + 1) / jugadores);
  return (
    Math.max(1, Math.round(base * proporcion ** 2)) + (BONUS_PODIO[puesto] ?? 0)
  );
}
