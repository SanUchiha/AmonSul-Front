import { computed, ref, Ref, watch } from "vue";

// Valor de la pestaña "Rondas": no choca con las demás (Resumen es -1, Gestión 0 y las rondas 1, 2...)
export const TAB_RONDAS = -2;

/**
 * Las rondas van en una sola pestaña "Rondas", con pastillas para elegir cada una, como las jornadas de la liga.
 * activeTab sigue valiendo el número de la ronda que se ve, igual que antes, para que la lógica de cada vista no
 * cambie: la barra de pestañas usa "pestana", que es "Rondas" mientras se mira cualquier ronda
 */
export function useRondasEnPestana(
  activeTab: Ref<number | undefined>,
  numeroRondas: Ref<number[]>,
  partidasPorRonda: Ref<Record<number, unknown[]>>
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

  return { pestana, enRondas, TAB_RONDAS };
}
