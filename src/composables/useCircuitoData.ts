import { ref, computed } from "vue";
import { CircuitoDTO, CircuitoTorneosDTO } from "@/interfaces/Circuito";
import { getTorneosOfCircuito } from "@/services/CircuitosService";
import { getGanadores } from "@/services/GanadoresService";
import { GanadorDTO } from "@/interfaces/Ganadores";
import { puntosCircuito } from "@/utils/puntosCircuito";

// Un resultado que suma en el circuito: el puesto en un evento y los puntos que da
export interface ResultadoCircuito {
  idTorneo: number;
  nombreTorneo: string;
  resultado: number;
  puntos: number;
}

export interface ClasificacionItem {
  idUsuario: number;
  nick: string;
  totalPuntos: number;
  torneosGanados: number;
  // Sus 4 mejores resultados, los que suman, del que más da al que menos
  mejores: ResultadoCircuito[];
  posicion: number;
}

export function useCircuitoData() {
  const torneos = ref<CircuitoTorneosDTO[]>([]);
  const loading = ref<boolean>(false);
  const ganadores = ref<GanadorDTO[]>([]);

  // Las posiciones guardadas de cada evento del circuito
  const posicionesPorTorneo = computed(() => {
    const idsCircuito = new Set(torneos.value.map((torneo) => torneo.idTorneo));
    const porTorneo = new Map<number, GanadorDTO[]>();
    ganadores.value.forEach((ganador) => {
      if (!idsCircuito.has(ganador.idTorneo)) return;
      const posiciones = porTorneo.get(ganador.idTorneo) ?? [];
      posiciones.push(ganador);
      porTorneo.set(ganador.idTorneo, posiciones);
    });
    return porTorneo;
  });

  const clasificacion = computed<ClasificacionItem[]>(() => {
    // Todos los resultados de cada jugador: puntúa todo el que juega, según el tamaño del evento y su puesto
    const jugadores = new Map<number, { nick: string; resultados: ResultadoCircuito[] }>();
    posicionesPorTorneo.value.forEach((posiciones) => {
      posiciones.forEach((ganador) => {
        const jugador = jugadores.get(ganador.idUsuario) ?? { nick: ganador.nick, resultados: [] };
        jugador.resultados.push({
          idTorneo: ganador.idTorneo,
          nombreTorneo: ganador.nombreTorneo,
          resultado: ganador.resultado,
          puntos: puntosCircuito(posiciones.length, ganador.resultado),
        });
        jugadores.set(ganador.idUsuario, jugador);
      });
    });

    // Suman sus 4 mejores
    const filas = Array.from(jugadores, ([idUsuario, jugador]) => {
      const mejores = [...jugador.resultados].sort((a, b) => b.puntos - a.puntos).slice(0, 4);
      return {
        idUsuario,
        nick: jugador.nick,
        totalPuntos: mejores.reduce((suma, resultado) => suma + resultado.puntos, 0),
        torneosGanados: jugador.resultados.filter((resultado) => resultado.resultado === 1).length,
        mejorPuesto: Math.min(...jugador.resultados.map((resultado) => resultado.resultado)),
        jugados: jugador.resultados.length,
        mejores,
      };
    });

    // A igualdad de puntos: más eventos ganados, mejor puesto y más eventos jugados
    filas.sort(
      (a, b) =>
        b.totalPuntos - a.totalPuntos ||
        b.torneosGanados - a.torneosGanados ||
        a.mejorPuesto - b.mejorPuesto ||
        b.jugados - a.jugados
    );

    return filas.map((fila, index) => ({
      idUsuario: fila.idUsuario,
      nick: fila.nick,
      totalPuntos: fila.totalPuntos,
      torneosGanados: fila.torneosGanados,
      mejores: fila.mejores,
      posicion: index + 1,
    }));
  });

  const loadTorneos = async (circuito: CircuitoDTO) => {
    if (!circuito) return;
    loading.value = true;
    try {
      const response = await getTorneosOfCircuito(circuito.idCircuito);
      torneos.value = response.data;
    } catch (error) {
      console.error("Error al cargar torneos paral circuito:", error);
    } finally {
      loading.value = false;
    }
  };

  const loadGanadores = async () => {
    loading.value = true;
    try {
      const response = await getGanadores();
      ganadores.value = response.data;
    } catch (error) {
      console.error("Error al cargar ganadores:", error);
    } finally {
      loading.value = false;
    }
  };

  // Posiciones finales guardadas de un evento, de la primera a la última
  const posicionesDe = (idTorneo: number) =>
    ganadores.value.filter((g) => g.idTorneo === idTorneo).sort((a, b) => a.resultado - b.resultado);

  return {
    torneos,
    loading,
    clasificacion,
    loadTorneos,
    prepareClasificacion: loadGanadores,
    posicionesDe,
  };
}
