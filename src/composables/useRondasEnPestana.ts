import { computed, ref, Ref, watch } from "vue";

// Valor de la pestaña "Rondas": no choca con las demás (Resumen es -1, Gestión 0 y las rondas 1, 2...)
export const TAB_RONDAS = -2;

// Lo que hace falta de una partida para saber quién la juega: individual, por equipos, a parejas o de más de una lista
export interface PartidaConJugadores {
  idUsuario1: number;
  idUsuario2: number;
  nick1?: string | null;
  nick2?: string | null;
  idCompanero1?: number | null;
  idCompanero2?: number | null;
  nickCompanero1?: string | null;
  nickCompanero2?: string | null;
  idEquipo1?: number | null;
  idEquipo2?: number | null;
}

export const juegaEn = (partida: PartidaConJugadores, idUsuario: number) =>
  partida.idUsuario1 === idUsuario ||
  partida.idUsuario2 === idUsuario ||
  partida.idCompanero1 === idUsuario ||
  partida.idCompanero2 === idUsuario;

/**
 * Las rondas van en una sola pestaña "Rondas", con pastillas para elegir cada una, como las jornadas de la liga.
 * activeTab sigue valiendo el número de la ronda que se ve, igual que antes, para que la lógica de cada vista no
 * cambie: la barra de pestañas usa "pestana", que es "Rondas" mientras se mira cualquier ronda. Con un jugador
 * buscado, cada ronda enseña solo su partida
 */
export function useRondasEnPestana(
  activeTab: Ref<number | undefined>,
  numeroRondas: Ref<number[]>,
  partidasPorRonda: Ref<Record<number, PartidaConJugadores[]>>
) {
  const esRonda = (tab: number | undefined) =>
    tab !== undefined && numeroRondas.value.includes(tab);

  // Al volver a la pestaña se sigue en la ronda que se estaba mirando
  const rondaVista = ref<number>();
  watch(activeTab, tab => {
    if (esRonda(tab)) rondaVista.value = tab;
  });

  // Si no se ha mirado ninguna, la última que ya tiene partidas, que es la que se está jugando
  function rondaPorDefecto() {
    if (esRonda(rondaVista.value)) return rondaVista.value;
    const conPartidas = numeroRondas.value.filter(
      n => (partidasPorRonda.value[n]?.length ?? 0) > 0
    );
    return conPartidas[conPartidas.length - 1] ?? numeroRondas.value[0];
  }

  const pestana = computed<number | undefined>({
    get: () => (esRonda(activeTab.value) ? TAB_RONDAS : activeTab.value),
    set: tab => {
      activeTab.value = tab === TAB_RONDAS ? rondaPorDefecto() : tab;
    },
  });
  const enRondas = computed(() => esRonda(activeTab.value));

  // Buscador: todos los que juegan alguna partida, compañeros de pareja incluidos
  const jugadorBuscado = ref<number | null>(null);
  const jugadores = computed(() => {
    const porId = new Map<number, string>();
    Object.values(partidasPorRonda.value)
      .flat()
      .forEach(p => {
        porId.set(p.idUsuario1, p.nick1 ?? "");
        porId.set(p.idUsuario2, p.nick2 ?? "");
        if (p.idCompanero1) porId.set(p.idCompanero1, p.nickCompanero1 ?? "");
        if (p.idCompanero2) porId.set(p.idCompanero2, p.nickCompanero2 ?? "");
      });
    return [...porId.entries()]
      .filter(([, nick]) => nick)
      .map(([idUsuario, nick]) => ({ idUsuario, nick: nick.trim() }))
      .sort((a, b) => a.nick.localeCompare(b.nick));
  });

  // Las partidas de una ronda que se enseñan: todas o solo las del jugador buscado
  function deLaBusqueda<T extends PartidaConJugadores>(partidas?: T[] | null): T[] {
    const todas = partidas ?? [];
    const id = jugadorBuscado.value;
    return id === null ? todas : todas.filter(p => juegaEn(p, id));
  }

  // Por equipos, el equipo del jugador buscado: en los cruces de equipos se enseña solo el suyo
  const equiposDelBuscado = computed<number[] | null>(() => {
    const id = jugadorBuscado.value;
    if (id === null) return null;
    const equipos = new Set<number>();
    Object.values(partidasPorRonda.value)
      .flat()
      .forEach(p => {
        if ((p.idUsuario1 === id || p.idCompanero1 === id) && p.idEquipo1)
          equipos.add(p.idEquipo1);
        if ((p.idUsuario2 === id || p.idCompanero2 === id) && p.idEquipo2)
          equipos.add(p.idEquipo2);
      });
    return [...equipos];
  });

  // La mesa no cambia al filtrar: es su puesto en la ronda
  const mesaDe = <T>(partidas: T[] | null | undefined, partida: T) =>
    (partidas?.indexOf(partida) ?? 0) + 1;

  return {
    pestana,
    enRondas,
    TAB_RONDAS,
    jugadorBuscado,
    jugadores,
    deLaBusqueda,
    equiposDelBuscado,
    mesaDe,
  };
}
