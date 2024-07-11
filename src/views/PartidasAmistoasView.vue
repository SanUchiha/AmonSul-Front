<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8" class="text-center">
        <div v-if="loading">
          <ProgressCircular />
        </div>
        <div v-if="!loading && validMatches.length > 0">
          <ValidadasMatchCard
            v-for="match in validMatches"
            :key="match.idPartidaAmistosa"
            :match="match"
            class="mb-4"
            @partidaValidada="cargarPartidasValidadas"
          />
        </div>
        <div v-else>
          <h3>No tienes partidas validadas</h3>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getPartidasValidadas } from "@/services/PartidasAmistosasService";
import { ViewPartidaAmistosaDTO } from "@/interfaces/Partidas";
import ValidadasMatchCard from "@/components/PartidaAmistosa/ValidadasMatchCard.vue";
import { useAuth } from "@/composables/useAuth";
import ProgressCircular from "../components/Commons/ProgressCircular.vue";
import { useRouter } from "vue-router";

const loading = ref(true);
const { getUser } = useAuth();
const error = ref<string | null>(null);
const router = useRouter();

const validMatches = ref<ViewPartidaAmistosaDTO[]>([]);

const cargarPartidasValidadas = async () => {
  const email: any = await getUser.value;
  if (!email) {
    router.push("error");
    error.value = "No se pudo obtener el usuario. Por favor, inicie sesión.";
    console.log(error.value);
    return;
  }
  try {
    const response = await getPartidasValidadas(email);
    validMatches.value = response;
    validMatches.value = validMatches.value.sort((a, b) => {
      let dateA = new Date(a.fechaPartida).getTime();
      let dateB = new Date(b.fechaPartida).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(cargarPartidasValidadas);
</script>

<style scoped></style>
