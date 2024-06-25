<template>
  <div>
    <NavBar />
    <v-container>
      <v-row dense>
        <v-col v-for="torneo in listaTorneos" :key="torneo.ID_Torneo">
          <TorneoCard :torneo="torneo" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import NavBar from "../components/Commons/NavBar.vue";
import { ITorneo } from "@/interfaces/Torneo";
import { getTorneos } from "@/services/TorneosService";
import { onMounted, ref } from "vue";
import TorneoCard from "@/components/Torneos/TorneoCard.vue";

const listaTorneos = ref<ITorneo[]>([]);

onMounted(async () => {
  listaTorneos.value = await getTorneos();
  console.log("torneos", listaTorneos.value);
});
</script>

<style scoped></style>
