<template>
  <v-container class="text-center">
    <div>
      <CardGestionTorneo :torneo="torneo" />

      <TablaInscritos :torneo="torneo" />
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import router from "@/router";
import { getInfoTorneoCreado } from "@/services/TorneosService";
import TablaInscritos from "@/components/GestionTorneos/TablaInscritos.vue";
import CardGestionTorneo from "@/components/GestionTorneos/CardGestionTorneo.vue";
import { TorneoGestionInfoDTO } from "@/interfaces/Torneo";

const route = useRoute();
const idTorneo = ref<number>();

const isLoading = ref<boolean>(false);

const torneo = ref<TorneoGestionInfoDTO | null>(null);

onMounted(async () => {
  idTorneo.value = parseInt(route.params.idTorneo.toString());

  isLoading.value = true;

  try {
    const responseTorneo = await getInfoTorneoCreado(idTorneo.value);
    torneo.value = responseTorneo.data;
  } catch (error) {
    console.error(error);
    router.push({ name: "error" });
  } finally {
    isLoading.value = false;
  }
});
</script>
