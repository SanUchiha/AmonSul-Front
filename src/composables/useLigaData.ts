import { ref, computed } from "vue";
import { LigaDTO, LigaTorneosDTO } from "@/interfaces/Liga";
import { getTorneosOfLiga } from "@/services/LigasService";
import { getGanadores } from "@/services/GanadoresService";
import { GanadorDTO } from "@/interfaces/Ganadores";

export interface ClasificacionItem {
  nick: string;
  totalPuntos: number;
  torneosGanados: number;
  puntosPorTorneos: number[];
  posicion: number;
}

export function useLigaData() {
  const torneos = ref<LigaTorneosDTO[]>([]);
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
        todosPuntos: number[];
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
          todosPuntos: [],
        });
      }

      const jugador = jugadoresMap.get(ganador.idUsuario);
      if (jugador) {
        jugador.todosPuntos.push(puntos);
        if (ganador.resultado === 1) {
          jugador.torneosGanados += 1;
        }
      }
    });

    // Procesar cada jugador para tomar solo sus mejores 4 resultados
    jugadoresMap.forEach((jugador) => {
      // Ordenar puntos de mayor a menor y tomar los mejores 4
      const mejoresPuntos = jugador.todosPuntos
        .sort((a, b) => b - a)
        .slice(0, 4);
      
      jugador.puntosPorTorneos = mejoresPuntos;
      jugador.totalPuntos = mejoresPuntos.reduce((sum, puntos) => sum + puntos, 0);
    });

    const jugadoresOrdenados = Array.from(jugadoresMap.values()).sort(
      (a, b) => b.totalPuntos - a.totalPuntos
    );

    return jugadoresOrdenados.map((jugador, index) => ({
      nick: jugador.nick,
      totalPuntos: jugador.totalPuntos,
      torneosGanados: jugador.torneosGanados,
      puntosPorTorneos: jugador.puntosPorTorneos,
      posicion: index + 1,
    }));
  });

  const loadTorneos = async (liga: LigaDTO) => {
    if (!liga) return;
    loading.value = true;
    try {
      const response = await getTorneosOfLiga(liga.idLiga);
      torneos.value = response.data;
    } catch (error) {
      console.error("Error al cargar torneos para la liga:", error);
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
    
    const idTorneosLiga = torneos.value.map((torneo) => torneo.idTorneo);

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

    const soloGanadoresTorneosLiga = top10PorTorneo.filter((ganador) =>
      idTorneosLiga.includes(ganador.idTorneo)
    );

    topGanadores.value = soloGanadoresTorneosLiga;
  };

  const prepareClasificacion = async () => {
    await loadGanadores();
    mergeGanadoresXTorneo();
  };

  return {
    torneos,
    loading,
    clasificacion,
    loadTorneos,
    prepareClasificacion,
  };
}