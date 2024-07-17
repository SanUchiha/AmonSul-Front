<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            <h3>Detalle de la Partida</h3>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text v-if="loading" class="d-flex justify-center">
            <v-progress-circular
              indeterminate
              color="primary"
            ></v-progress-circular>
          </v-card-text>
          <v-card-text v-else>
            <v-list>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title
                    >{{ partida?.nickUsuario1 }} vs
                    {{ partida?.nickUsuario2 }}</v-list-item-title
                  >
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Fecha</v-list-item-title>
                  <v-list-item-subtitle>{{
                    partida?.fechaPartida
                  }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Escenario</v-list-item-title>
                  <v-list-item-subtitle>{{
                    partida?.escenarioPartida ?? "N/A"
                  }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Ganador</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ partida?.ganadorPartidaNick }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Resultado</v-list-item-title>
                  <v-list-item-subtitle
                    >{{ partida?.resultadoUsuario1 }} -
                    {{ partida?.resultadoUsuario2 }}</v-list-item-subtitle
                  >
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Puntos</v-list-item-title>
                  <v-list-item-subtitle>{{
                    partida?.puntosPartida ?? "No especificado"
                  }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Ejército Usuario 1</v-list-item-title>
                  <v-list-item-subtitle>{{
                    partida?.ejercitoUsuario1 ?? "No especificado"
                  }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Ejército Usuario 2</v-list-item-title>
                  <v-list-item-subtitle>{{
                    partida?.ejercitoUsuario2 ?? "No especificado"
                  }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Es Torneo</v-list-item-title>
                  <v-list-item-subtitle>{{
                    partida?.esTorneo ? "Sí" : "No"
                  }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="goBack" variant="outlined" color="blue darken-1">
              Volver
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ViewPartidaAmistosaDTO } from "@/interfaces/Partidas";
import { getById } from "@/services/PartidasAmistosasService";
import { formatFechaSpa } from "@/utils/Fecha";
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const partida = ref<ViewPartidaAmistosaDTO | null>(null);
const loading = ref(true);

const getResultadoClass = (ganadorPartida: number | null) => {
  if (ganadorPartida === null) return ""; // Si no hay ganador, no aplica clase
  return ganadorPartida === partida.value?.idUsuario1
    ? "victoria"
    : ganadorPartida === partida.value?.idUsuario2
    ? "derrota"
    : "empate";
};

const goBack = () => {
  router.back();
};

onMounted(async () => {
  const idPartida = route.params.idPartida as string;
  try {
    const partidaData = await getById(idPartida);
    if (partidaData && partidaData.fechaPartida) {
      partidaData.fechaPartida = await formatFechaSpa(partidaData.fechaPartida);
    }
    partida.value = partidaData;
  } catch (error) {
    console.error("Error al obtener los detalles de la partida:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.victoria {
  color: blue;
}

.derrota {
  color: red;
}

.empate {
  color: yellow;
}
</style>
