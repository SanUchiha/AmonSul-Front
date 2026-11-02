import { ref, computed } from "vue";
import { CircuitoDTO, CircuitoTorneosDTO } from "@/interfaces/Circuito";
import { getTorneosOfCircuito } from "@/services/CircuitosService";
import { getGanadores } from "@/services/GanadoresService";
import { GanadorDTO } from "@/interfaces/Ganadores";

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
  puntosPorTorneos: number[];
  // Sus 4 mejores resultados, los que suman, del que más da al que menos
  mejores: ResultadoCircuito[];
  posicion: number;
}

export function useCircuitoData() {
  const torneos = ref<CircuitoTorneosDTO[]>([]);
  const loading = ref<boolean>(false);
  const ganadores = ref<GanadorDTO[]>([]);
  const topGanadores = ref<GanadorDTO[]>([]);
  const puntosPorResultado = [25, 20, 18, 15, 10, 8, 6, 4, 2, 1];

  const clasificacion = computed<ClasificacionItem[]>(() => {
    const jugadoresMap = new Map<
      number,
      {
        nick: string;
        totalPuntos: number;
        torneosGanados: number;
        puntosPorTorneos: number[];
        resultados: ResultadoCircuito[];
        mejores: ResultadoCircuito[];
      }
    >();

    // Recopilar todos los puntos por jugador
    topGanadores.value.forEach((ganador) => {
      const puntos = puntosPorResultado[ganador.resultado - 1] || 0;

      if (!jugadoresMap.has(ganador.idUsuario)) {
        jugadoresMap.set(ganador.idUsuario, {
          nick: ganador.nick,
          totalPuntos: 0,
          torneosGanados: 0,
          puntosPorTorneos: [],
          resultados: [],
          mejores: [],
        });
      }

      const jugador = jugadoresMap.get(ganador.idUsuario);
      if (jugador) {
        jugador.resultados.push({
          idTorneo: ganador.idTorneo,
          nombreTorneo: ganador.nombreTorneo,
          resultado: ganador.resultado,
          puntos,
        });
        if (ganador.resultado === 1) {
          jugador.torneosGanados += 1;
        }
      }
    });

    // Procesar cada jugador para tomar solo sus mejores 4 resultados
    jugadoresMap.forEach((jugador) => {
      // Ordenar de más a menos puntos y tomar los mejores 4
      jugador.mejores = [...jugador.resultados].sort((a, b) => b.puntos - a.puntos).slice(0, 4);
      const mejoresPuntos = jugador.mejores.map((r) => r.puntos);

      jugador.puntosPorTorneos = mejoresPuntos;
      jugador.totalPuntos = mejoresPuntos.reduce((sum, puntos) => sum + puntos, 0);
    });

    const jugadoresOrdenados = Array.from(jugadoresMap.entries()).sort(
      ([, a], [, b]) => b.totalPuntos - a.totalPuntos
    );

    return jugadoresOrdenados.map(([idUsuario, jugador], index) => ({
      idUsuario,
      nick: jugador.nick,
      totalPuntos: jugador.totalPuntos,
      torneosGanados: jugador.torneosGanados,
      puntosPorTorneos: jugador.puntosPorTorneos,
      mejores: jugador.mejores,
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

  const mergeGanadoresXTorneo = () => {
    if (!torneos.value.length || !ganadores.value.length) return;
    
    const idTorneosCircuito = torneos.value.map((torneo) => torneo.idTorneo);

    const ganadoresPorTorneo = ganadores.value.reduce((acc, ganador) => {
      if (!acc[ganador.idTorneo]) {
        acc[ganador.idTorneo] = [];
      }
      acc[ganador.idTorneo].push(ganador);
      return acc;
    }, {} as Record<number, (typeof ganadores.value)[0][]>);

    const top10PorTorneo = Object.values(ganadoresPorTorneo).flatMap(
      (ganadoresTorneo) => ganadoresTorneo.slice(0, 10)
    );

    const soloGanadoresTorneosCircuito = top10PorTorneo.filter((ganador) =>
      idTorneosCircuito.includes(ganador.idTorneo)
    );

    topGanadores.value = soloGanadoresTorneosCircuito;
  };

  // Posiciones finales guardadas de un evento, de la primera a la última
  const posicionesDe = (idTorneo: number) =>
    ganadores.value.filter((g) => g.idTorneo === idTorneo).sort((a, b) => a.resultado - b.resultado);

  const prepareClasificacion = async () => {
    await loadGanadores();
    mergeGanadoresXTorneo();
  };

  return {
    torneos,
    loading,
    clasificacion,
    puntosPorResultado,
    loadTorneos,
    prepareClasificacion,
    posicionesDe,
  };
}