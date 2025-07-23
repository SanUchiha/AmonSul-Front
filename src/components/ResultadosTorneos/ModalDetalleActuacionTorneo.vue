<template>
  <v-dialog v-model="internalShow" max-width="600">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        Resumen actuación
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-progress-circular
          v-if="loading"
          indeterminate
          color="primary"
          class="d-block mx-auto my-6"
        />
        <div v-else>
          <v-card class="pa-4 mb-4 player-info-card">
            <v-row dense>
              <v-col cols="12" class="text-center">
                <h3 class="text-h6 text-md-h5 mb-2">{{ data?.nick }}</h3>
              </v-col>

              <v-col cols="12" sm="6">
                <strong>Ejército:</strong> {{ data?.ejercito }}
              </v-col>

              <v-col cols="12" sm="6">
                <strong>Puntos de torneo:</strong> {{ data?.puntosTorneo }}
              </v-col>

              <v-col cols="12" sm="4">
                <strong>Victorias:</strong> {{ data?.victorias }}
              </v-col>

              <v-col cols="12" sm="4">
                <strong>Empates:</strong> {{ data?.empates }}
              </v-col>

              <v-col cols="12" sm="4">
                <strong>Derrotas:</strong> {{ data?.derrotas }}
              </v-col>
            </v-row>
          </v-card>
        </div>
      </v-card-text>

      <v-card-actions class="flex-column align-start">
        <div v-if="!isLoadingLista" class="w-100">
          <v-card class="section-card stats-section pt-0 mt-0">
            <template v-if="listaBase64">
              <img
                :src="listaBase64"
                alt="Lista"
                style="max-width: 100%; height: auto"
              />
            </template>
            <template v-else>
              <p>No hay lista disponible</p>
            </template></v-card
          >
        </div>
        <div v-else class="px-4 py-2">
          <h3>No tienes partidas en torneos</h3>
        </div>
      </v-card-actions>

      <v-card-actions class="flex-column align-start">
        <div v-if="!isLoadingMatches && matches.length > 0" class="w-100">
          <v-card class="section-card stats-section pt-0 mt-0">
            <v-row>
              <v-col
                cols="12"
                sm="6"
                md="6"
                lg="4"
                xl="4"
                class="pb-0"
                v-for="match in matches"
                :key="match.idPartidaTorneo"
              >
                <CardPartidaTorneo
                  :idUsuario="props.jugador.idUsuario"
                  :match="match"
                  class="mb-4"
                />
              </v-col>
            </v-row>
          </v-card>
        </div>
        <div v-else class="px-4 py-2">
          <h3>No tienes partidas en torneos</h3>
        </div>
        <v-spacer />
        <v-btn text @click="close" variant="tonal" class="mt-2">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { Clasificacion } from "@/interfaces/Live";
import { ViewPartidaTorneoDTO } from "@/interfaces/Partidas";
import { getPartidasTorneoByUsuarioAsync } from "@/services/PartidaTorneoService";
import { ref, watch, onMounted } from "vue";
import { defineProps, defineEmits } from "vue";
import CardPartidaTorneo from "../PartidasTorneo/CardPartidaTorneo.vue";
import { getlistaTorneo } from "@/services/ListasService";

const props = defineProps<{
  show: boolean;
  jugador: Clasificacion;
}>();

const emit = defineEmits(["update:show"]);

const internalShow = ref<boolean>(props.show);
const loading = ref<boolean>(true);
const data = ref<Clasificacion>();
const matches = ref<ViewPartidaTorneoDTO[]>([]);
const listaBase64 = ref<string>();
const isLoadingMatches = ref<boolean>(false);
const isLoadingLista = ref<boolean>(false);

watch(
  () => props.show,
  (val) => (internalShow.value = val)
);

watch(internalShow, (visible) => {
  if (visible) {
    loadData();
  }
});

const loadData = async () => {
  loading.value = true;
  try {
    data.value = props.jugador;
    isLoadingMatches.value = true;
    isLoadingLista.value = true;

    const response = await getPartidasTorneoByUsuarioAsync(
      props.jugador.idTorneo,
      props.jugador.idUsuario
    );

    matches.value = response.data;

    const responseLista = await getlistaTorneo({
      idTorneo: props.jugador.idTorneo,
      idUsuario: props.jugador.idUsuario,
    });

    listaBase64.value = responseLista.data.listaData;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
    isLoadingMatches.value = false;
    isLoadingLista.value = false;
  }
};

const close = () => {
  internalShow.value = false;
  emit("update:show", false);
};

onMounted(() => {
  if (internalShow.value) {
    loadData();
  }
});
</script>

<style scoped>
.section-card {
  margin-bottom: 20px;
  padding: 20px;
  background: #212121;
  color: white;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5);
  border-radius: 12px;
}

.player-info-card {
  background-color: #1e1e1e;
  color: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

@media (max-width: 600px) {
  .player-info-card {
    padding: 16px !important;
  }
}
</style>
