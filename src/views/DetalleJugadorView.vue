<template>
  <div>
    Vista detalle de jugador
    <div>
      <v-btn color="blue darken-1" variant="outlined" @click="goBack">
        Atrás
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Jugador } from "@/interfaces/Usuario";
import {
  getDetalleUsuarioByEmail,
  getUsuarioByNick,
} from "@/services/UsuariosService";
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
let jugador = ref<Jugador>();

onMounted(async () => {
  const nick = String(route.params.Nick);

  const email = await getUsuarioByNick(nick);
  console.log(email);
  const data = await getDetalleUsuarioByEmail(email.email);
});

const formatDate = (date: string | number | Date) =>
  new Date(date).toLocaleDateString();

const goBack = () => router.go(-1);
</script>

<style scoped></style>
