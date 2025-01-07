<template>
  <v-dialog v-model="localDialog" max-width="600px">
    <v-card class="elevation-2 rounded">
      <v-card-title>
        <span class="headline">{{ props.liga?.nombreLiga }}</span>
      </v-card-title>

      <!-- Aquí puedes agregar más detalles de la liga -->
      <v-card-text>
        <div class="my-2">Número de torneos: {{ numeroTorneos }}</div>
        <!-- Listado de torneos -->
        <v-list dense>
          <v-list-item-group v-if="torneos.length > 0">
            <v-list-item v-for="torneo in torneos" :key="torneo.idTorneo">
              <v-list-item-content>
                <v-list-item-title>{{ torneo.torneoNombre }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
          <v-list-item v-else>
            <v-list-item-content>
              <v-list-item-title
                >No hay torneos asociados a esta liga.</v-list-item-title
              >
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-expand-transition>
        <v-list-item v-if="showClasificacion">
          <v-list-item-content>
            <v-card class="elevation-1">
              <v-card-title class="headline"
                >Clasificación General</v-card-title
              >
              <v-card-text>
                <v-data-table
                  :items="clasificacion"
                  :headers="headers"
                  item-key="idUsuario"
                  class="elevation-1"
                  dense
                  :items-per-page="10"
                >
                  <template v-slot:items="props">
                    <tr>
                      <td>{{ props.index + 1 }}</td>
                      <td>{{ props.item.nick }}</td>
                      <td>{{ props.item.totalPuntos }}</td>
                      <td>{{ props.item.torneosGanados }}</td>
                      <td>
                        <!-- Mostrar los puntos por torneo, puedes usar un formato más bonito si lo deseas -->
                        <ul>
                          <li
                            v-for="(puntos, index) in props.item
                              .puntosPorTorneos"
                            :key="index"
                          >
                            Torneo {{ index + 1 }}: {{ puntos }} puntos
                          </li>
                        </ul>
                      </td>
                    </tr>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-list-item-content>
        </v-list-item>
      </v-expand-transition>

      <v-card-actions>
        <v-btn
          v-if="!showClasificacion"
          color="primary"
          variant="tonal"
          text
          @click="verClasificacion"
          >ver clasificación</v-btn
        >
        <v-btn
          v-else
          color="primary"
          variant="tonal"
          text
          @click="ocultarClasificacion"
          >ocultar clasificación</v-btn
        >
        <v-btn color="primary" variant="tonal" text @click="closeDialog"
          >Cerrar</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts" setup>
import { ref, defineProps, defineEmits, watch, computed } from "vue";
import { LigaDTO, LigaTorneosDTO } from "@/interfaces/Liga";
import { getTorneosOfLiga } from "@/services/LigasService";
import { getGanadores } from "@/services/GanadoresService";
import { GanadorDTO } from "@/interfaces/Ganadores";

const props = defineProps<{
  liga: LigaDTO | null;
  showModalLiga: boolean;
}>();

const headers = [
  { title: "#", key: "posicion" },
  { title: "Nick", key: "nick" },
  { title: "Puntos Totales", key: "totalPuntos" },
  { title: "Torneos Ganados", key: "torneosGanados" },
  { title: "Puntos por Torneo", key: "puntosPorTorneos" }, // Nueva columna
];

const localDialog = ref(props.showModalLiga);
const torneos = ref<LigaTorneosDTO[]>([]);
const loading = ref<boolean>(false);
const numeroTorneos = ref<number>(0);
const ganadores = ref<GanadorDTO[]>([]);
const topGanadores = ref<GanadorDTO[]>([]);
const showClasificacion = ref<boolean>(false);
const puntosPorResultado = [25, 20, 18, 15, 10, 8, 6, 4, 2, 1];

const emit = defineEmits<{
  (e: "update:showModalLiga", value: boolean): void;
}>();

const closeDialog = () => {
  emit("update:showModalLiga", false);
};

const clasificacion = computed(() => {
  const jugadoresMap = new Map<
    number,
    {
      nick: string;
      totalPuntos: number;
      torneosGanados: number;
      puntosPorTorneos: number[];
    }
  >();

  topGanadores.value.forEach((ganador) => {
    const puntos = puntosPorResultado[ganador.resultado - 1] || 0;

    if (!jugadoresMap.has(ganador.idUsuario)) {
      jugadoresMap.set(ganador.idUsuario, {
        nick: ganador.nick,
        totalPuntos: 0,
        torneosGanados: 0,
        puntosPorTorneos: [],
      });
    }

    const jugador = jugadoresMap.get(ganador.idUsuario)!;
    jugador.totalPuntos += puntos;
    jugador.puntosPorTorneos.push(puntos); // Añadir los puntos del torneo al array

    // Si es el ganador del torneo (resultado 1), aumenta el contador de torneos ganados
    if (ganador.resultado === 1) {
      jugador.torneosGanados += 1;
    }
  });

  const jugadoresOrdenados = Array.from(jugadoresMap.values()).sort(
    (a, b) => b.totalPuntos - a.totalPuntos
  );

  return jugadoresOrdenados.map((jugador, index) => ({
    ...jugador,
    posicion: index + 1, // La posición es el índice + 1 para que empiece desde 1
  }));
});

const verClasificacion = async () => {
  await loadGanadores();
  mergeGanadoresXTorneo();
  hacerClasificacion();
  showClasificacion.value = true;

  console.log("clasifiacion final", clasificacion.value);
};

const hacerClasificacion = async () => {
  showClasificacion.value = false;
};

const ocultarClasificacion = async () => {
  showClasificacion.value = false;
};

const mergeGanadoresXTorneo = () => {
  if (!torneos.value.length || !ganadores.value.length) return;
  const idTorneosLiga = torneos.value.map((torneo) => torneo.idTorneo);
  console.log("ids", idTorneosLiga);

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

  topGanadores.value = top10PorTorneo;

  console.log("Ganadores top 10 por torneo:", topGanadores.value);
};

const loadGanadores = async () => {
  loading.value = true;
  try {
    const response = await getGanadores();
    ganadores.value = response.data;
    console.log("ganadores", ganadores.value);
  } catch (error) {
    console.error("Error al cargar torneos para la liga:", error);
  } finally {
    loading.value = false;
  }
};

const loadTorneos = async () => {
  if (!props.liga) return;
  loading.value = true;
  try {
    const response = await getTorneosOfLiga(props.liga.idLiga);
    torneos.value = response.data;
    numeroTorneos.value = torneos.value.length;
  } catch (error) {
    console.error("Error al cargar torneos para la liga:", error);
  } finally {
    loading.value = false;
  }
};

// Observa los cambios en props.liga para recargar torneos
watch(
  () => props.liga,
  (newLiga) => {
    if (newLiga) {
      loadTorneos();
    }
  },
  { immediate: true } // Llama a loadTorneos inmediatamente si props.liga tiene valor inicial
);

// Sincroniza localDialog con props.showModalLiga
watch(
  () => props.showModalLiga,
  (newVal) => {
    localDialog.value = newVal;
  }
);
</script>
