<template>
  <v-container>
    <v-row dense justify="center">
      <div v-if="loading">
        <v-row justify="center" align="center" style="height: 100px">
          <v-col cols="12" class="text-center">
            <ProgressCircular />
          </v-col>
        </v-row>
      </div>
      <div v-else>
        <div v-if="listaTorneos.length < 1">In progress...</div>
        <v-row dense justify="center">
          <v-col
            v-for="torneo in listaTorneos"
            :key="torneo.idTorneo"
            cols="12"
          >
            <TorneoCard :torneo="torneo" />
          </v-col>
        </v-row>
      </div>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { Torneo } from "@/interfaces/Torneo";
import { getTorneos } from "@/services/TorneosService";
import { onMounted, ref } from "vue";
import TorneoCard from "@/components/Torneos/TorneoCard.vue";

const listaTorneos = ref<Torneo[]>([]);
const loading = ref(true);

onMounted(async () => {
  listaTorneos.value = await getTorneos();
  loading.value = false;
});
</script>

<style scoped></style>
