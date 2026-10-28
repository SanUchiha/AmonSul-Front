import { Clasificacion, Emparejamiento } from "@/interfaces/Live";

// Tope de pasos de la búsqueda para que un caso raro no bloquee el navegador
const MAX_PASOS = 200000;

// Empareja la clasificación en orden sin repetir ningún enfrentamiento de las partidas anteriores.
// El bye está en la clasificación como un jugador más, así que tampoco se repite.
// Con luz vs oscuridad busca primero rivales del otro bando y hace el mínimo de cruces del mismo bando.
// Devuelve null si no hay forma de emparejar a todos sin repetir.
export function emparejarSinRepetir(
  clasificacion: Clasificacion[],
  partidasAnteriores: { idUsuario1: number; idUsuario2: number }[],
  luzVsOscuridad = false
): Emparejamiento[] | null {
  const jugados = new Set<string>();
  partidasAnteriores.forEach(partida => {
    jugados.add(`${partida.idUsuario1}-${partida.idUsuario2}`);
    jugados.add(`${partida.idUsuario2}-${partida.idUsuario1}`);
  });

  const total = clasificacion.length;
  const esLuz = (jugador: { bando?: string }) => jugador.bando !== "evil";
  const mismoBando = (a: { bando?: string }, b: { bando?: string }) =>
    luzVsOscuridad && esLuz(a) === esLuz(b);

  // Busca con un máximo de cruces del mismo bando
  const buscar = (permitidosMismoBando: number): Emparejamiento[] | null => {
    const usado: boolean[] = new Array(total).fill(false);
    const emparejamientos: Emparejamiento[] = [];
    let pasos = 0;

    const emparejar = (
      desde: number,
      sinRivalPermitidos: number,
      mismoBandoPermitidos: number
    ): boolean => {
      if (++pasos > MAX_PASOS) return false;

      let i = desde;
      while (i < total && usado[i]) i++;
      if (i === total) return true;

      usado[i] = true;
      const jugador1 = clasificacion[i];
      // Primero los del otro bando y después los del mismo, siempre en orden de clasificación
      const candidatos: number[] = [];
      for (let j = i + 1; j < total; j++)
        if (!usado[j] && !mismoBando(jugador1, clasificacion[j])) candidatos.push(j);
      if (mismoBandoPermitidos > 0)
        for (let j = i + 1; j < total; j++)
          if (!usado[j] && mismoBando(jugador1, clasificacion[j])) candidatos.push(j);

      for (const j of candidatos) {
        const jugador2 = clasificacion[j];
        if (jugados.has(`${jugador1.idUsuario}-${jugador2.idUsuario}`)) continue;

        usado[j] = true;
        emparejamientos.push({
          jugador1: {
            idUsuario: jugador1.idUsuario,
            nick: jugador1.nick,
            bando: jugador1.bando,
          },
          jugador2: {
            idUsuario: jugador2.idUsuario,
            nick: jugador2.nick,
            bando: jugador2.bando,
          },
        });
        const restantes = mismoBando(jugador1, jugador2)
          ? mismoBandoPermitidos - 1
          : mismoBandoPermitidos;
        if (emparejar(i + 1, sinRivalPermitidos, restantes)) return true;
        emparejamientos.pop();
        usado[j] = false;
      }

      // Solo si no hay rival posible: se queda sin jugar, si con impares aún cabe uno
      if (
        sinRivalPermitidos > 0 &&
        emparejar(i + 1, sinRivalPermitidos - 1, mismoBandoPermitidos)
      )
        return true;

      usado[i] = false;
      return false;
    };

    return emparejar(0, total % 2, permitidosMismoBando) ? emparejamientos : null;
  };

  // Sin límite de cruces del mismo bando: si así no sale, no hay forma de no repetir
  const sinLimite = buscar(Math.floor(total / 2));
  if (!sinLimite || !luzVsOscuridad) return sinLimite;

  // Con luz vs oscuridad, intenta hacer menos cruces del mismo bando que sin límite
  const mismosSinLimite = sinLimite.filter(e =>
    mismoBando(e.jugador1, e.jugador2)
  ).length;
  const luz = clasificacion.filter(esLuz).length;
  const minimoMismoBando = Math.floor(Math.abs(luz - (total - luz)) / 2);
  for (
    let permitidos = minimoMismoBando;
    permitidos < mismosSinLimite;
    permitidos++
  ) {
    const emparejamientos = buscar(permitidos);
    if (emparejamientos) return emparejamientos;
  }
  return sinLimite;
}
