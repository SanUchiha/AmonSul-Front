<template>
  <v-container>
    <v-row dense>
      <v-col cols="12" md="12" class="text-center">
        <div v-if="isLoading">
          <LoadingGandalf />
        </div>
        <div v-else>
          <v-tabs v-model="tab" color="primary" grow>
            <v-tab value="proximos"> Próximos </v-tab>
            <v-tab value="pasados"> Pasados </v-tab>
          </v-tabs>
          <v-tabs-window v-model="tab">
            <v-tabs-window-item value="proximos">
              <div v-if="torneosFuturos.length < 1">
                No hay torneos próximos...
              </div>
              <v-row v-else dense>
                <v-col
                  v-for="torneo in torneosFuturos"
                  :key="torneo.idTorneo"
                  cols="12"
                  md="4"
                >
                  <TorneoCard :torneo="torneo" />
                </v-col>
              </v-row>
            </v-tabs-window-item>
            <v-tabs-window-item value="pasados">
              <div v-if="torneosPasados.length < 1">
                No hay torneos pasados...
              </div>
              <v-row v-else dense>
                <v-col
                  v-for="torneo in torneosPasados"
                  :key="torneo.idTorneo"
                  cols="12"
                  md="4"
                >
                  <TorneoCard :torneo="torneo" />
                </v-col>
              </v-row>
            </v-tabs-window-item>
          </v-tabs-window>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { Torneo } from "@/interfaces/Torneo";
import { getTorneos } from "@/services/TorneosService";
import { onMounted, ref } from "vue";
import TorneoCard from "@/components/Torneos/TorneoCard.vue";
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";

const listaTorneos = ref<Torneo[]>([]);
const torneosFuturos = ref<Torneo[]>([]);
const torneosPasados = ref<Torneo[]>([]);
const isLoading = ref(true);
const tab = ref(0);

onMounted(async () => {
  isLoading.value = true;

  const responseTorneos = await getTorneos();
  listaTorneos.value = responseTorneos.data;

  const now = new Date().getTime();

  torneosFuturos.value = listaTorneos.value
    .filter((torneo) => new Date(torneo.fechaInicioTorneo).getTime() > now)
    .sort(
      (a, b) =>
        new Date(a.fechaInicioTorneo).getTime() -
        new Date(b.fechaInicioTorneo).getTime()
    );

  torneosPasados.value = listaTorneos.value.filter(
    (torneo) => new Date(torneo.fechaInicioTorneo).getTime() <= now
  );

  isLoading.value = false;
});
</script>

<style scoped>
.active-pointer {
  color: #ffb74d;
}
.inactive-pointer {
  color: gray;
}
</style>
