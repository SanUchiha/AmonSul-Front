<template>
  <div>
    <v-container>
      <v-row dense>
        <v-col v-for="jugador in listaJugadores" :key="jugador.email">
          <JugadorCard :jugador="jugador" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { Jugador } from "@/interfaces/Usuario";
import { getUsuarios } from "@/services/UsuariosService";
import { onMounted, ref } from "vue";
import JugadorCard from "../components/Usuarios/JugadorCard.vue";

const listaJugadores = ref<Jugador[]>([]);

onMounted(async () => {
  var response = await getUsuarios();
  listaJugadores.value = response.data;
  console.log(listaJugadores.value);
});
</script>

<style scoped></style>
