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
import NavBar from "@/components/NavBar.vue";
import { Torneo } from "@/interfaces/Torneo";
import { getTorneosMock } from "@/services/TorneosService";
import { onMounted, ref } from "vue";
import TorneoCard from "@/components/Torneos/TorneoCard.vue";

const listaTorneos = ref<Torneo[]>([]);

onMounted(async () => {
  listaTorneos.value = await getTorneosMock();
});
</script>

<style scoped></style>
