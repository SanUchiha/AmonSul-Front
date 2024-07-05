<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8" class="text-center">
        <div v-if="loading">
          <ProgressCircular />
        </div>
        <div v-if="!loading && pendingMatches.length > 0">
          <PendingMatchCard
            v-for="match in pendingMatches"
            :key="match.idPartidaAmistosa"
            :match="match"
            class="mb-4"
            @partidaValidada="cargarPartidasPendientes"
          />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getPartidasPendientesValidar } from "@/services/PartidasAmistosasService";
import { ViewPartidaAmistosaDTO } from "@/interfaces/Partidas";
import PendingMatchCard from "@/components/PartidaAmistosa/PendingMatchCard.vue";
import { useAuth } from "@/composables/useAuth";
import ProgressCircular from "../components/Commons/ProgressCircular.vue";

const loading = ref(true);
const { getUser } = useAuth();
const error = ref<string | null>(null);

const pendingMatches = ref<ViewPartidaAmistosaDTO[]>([]);

const cargarPartidasPendientes = async () => {
  const email: any = await getUser.value;
  if (!email) {
    error.value = "No se pudo obtener el usuario. Por favor, inicie sesión.";
    console.log(error.value);
    return;
  }
  try {
    const response = await getPartidasPendientesValidar(email);
    pendingMatches.value = response;
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(cargarPartidasPendientes);
</script>

<style scoped></style>
