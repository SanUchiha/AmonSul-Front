<template>
  <div>
    <NavBar />

    <v-btn @click="goBack" variant="tonal"> Atrás </v-btn>

    <div v-if="jugador">
      <h2>
        {{ jugador.Nombre_Usuario }} {{ jugador.Primer_Apellido }}
        {{ jugador.Segundo_Apellido }}
      </h2>
      <p>{{ jugador.Nick }}</p>
      <p>
        {{ jugador.Ciudad }}
      </p>
      <p>
        {{ jugador.Faccion }}
      </p>
      <p><strong>Partidas jugadas:</strong> 10</p>
      <p><strong>Partidas ganadas:</strong> 5</p>
      <p><strong>Partidas empatadas:</strong> 3</p>
      <p><strong>Partidas perdidas:</strong> 2</p>
      <p><strong>Torneos jugados:</strong> 4</p>
      <p><strong>Torneos ganados:</strong> 1</p>
      <p><strong>Mejor posición en un torneo:</strong> 1</p>
      <p><strong>Peor posición en un torneo:</strong> 33</p>
      <p><strong>ELO:</strong> 1544</p>
      <p><strong>Posición ELO:</strong> 15</p>
    </div>

    <div v-else>
      <p>Cargando detalles del torneo...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import NavBar from "@/components/NavBar.vue";
import { IJugador } from "@/interfaces/Usuario";
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getTorneoByNickMock } from "../services/UsuariosService";

const route = useRoute();
const router = useRouter();
let jugador = ref<IJugador>();

onMounted(async () => {
  const Nick = String(route.params.Nick);
  console.log(Nick);
  jugador.value = await getTorneoByNickMock(Nick);
});

const formatDate = (date: string | number | Date) =>
  new Date(date).toLocaleDateString();

const goBack = () => router.go(-1);
</script>

<style scoped></style>
