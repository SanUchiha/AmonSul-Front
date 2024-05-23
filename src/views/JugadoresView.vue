<template>
  <div>
    <NavBar />
    <v-container>
      <v-row dense>
        <v-col v-for="jugador in listaJugadores" :key="jugador.ID_Usuario">
          <JugadorCard :jugador="jugador" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import NavBar from "@/components/NavBar.vue";
import { IJugador } from "@/interfaces/Usuario";
import { getJugadoresMock } from "@/services/UsuariosService";
import { onMounted, ref } from "vue";
import JugadorCard from "../components/Jugadores/JugadorCard.vue";

const listaJugadores = ref<IJugador[]>([]);

onMounted(async () => {
  listaJugadores.value = await getJugadoresMock();
});
</script>

<style scoped></style>
