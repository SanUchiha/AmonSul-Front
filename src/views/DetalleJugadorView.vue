<template>
  Detalle de jugador

  <p>{{ jugador.id }}</p>
  <p>{{ jugador.name }}</p>
  <p>{{ jugador.surname }}</p>
  <p>{{ jugador.email }}</p>

  <div>
    <RouterLink :to="{ name: 'jugadores' }"> Volver atrás</RouterLink>
  </div>
</template>

<script setup lang="ts">
import DetalleJugador from "@/components/DetalleJugador.vue";

import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { getUser } from "@/services/UsuariosService";
import { IUsuario } from "@/interfaces/Usuario";

const jugador = ref<IUsuario>();

onMounted(async () => {
  const route = useRoute();
  let elm = route.params.idJugador;
  jugador.value = await getUser(elm);
});
</script>

<style scoped></style>
