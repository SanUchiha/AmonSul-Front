// Calcula los puntos de torneo según el sistema alemán clásico
// Devuelve un objeto { jugador1: number, jugador2: number }
export function calcularPuntosAleman(resultado1: number, resultado2: number) {
  if (resultado1 === resultado2) {
    return { jugador1: 10, jugador2: 10 };
  }
  const diff = Math.abs(resultado1 - resultado2);
  const puntos = Math.ceil(diff / 2);
  if (resultado1 > resultado2) {
    return { jugador1: 10 + puntos, jugador2: 10 - puntos };
  } else {
    return { jugador1: 10 - puntos, jugador2: 10 + puntos };
  }
}
