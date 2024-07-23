<template>
  <v-container>
    <v-row dense>
      <v-col cols="12" md="12" class="text-center">
        <div v-if="loading">
          <ProgressCircular />
        </div>
        <div v-else>
          <v-col>
            <JugadorCard :usuario="usuario" />
          </v-col>
          <v-col>
            <SparklineElo :email="usuario.email" />
          </v-col>
          <v-col>
            <TablaPartidasJugador :email="usuario.email" />
          </v-col>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ViewUsuarioPartidaDTO } from "@/interfaces/Usuario";
import {
  getDetalleUsuarioByEmail,
  getUsuarioByNick,
} from "@/services/UsuariosService";
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import JugadorCard from "@/components/Usuarios/JugadorCard.vue";
import SparklineElo from "@/components/Elo/SparklineElo.vue";
import ProgressCircular from "@/components/Commons/ProgressCircular.vue";
import TablaPartidasJugador from "@/components/Usuarios/TablaPartidasJugador.vue";

const route = useRoute();
const router = useRouter();
const usuario = ref<ViewUsuarioPartidaDTO>({
  idUsuario: 0,
  email: "",
  nick: "",
  fechaRegistro: "",
  numeroPartidasJugadas: 0,
  partidasGanadas: 0,
  partidasEmpatadas: 0,
  partidasPerdidas: 0,
  puntuacionElo: 0,
  clasificacionElo: 0,
});
const loading = ref<boolean>(true);

onMounted(async () => {
  const nick = String(route.params.Nick);

  const email = await getUsuarioByNick(nick);
  const data = await getDetalleUsuarioByEmail(email.email);
  usuario.value = data;
  loading.value = false;
});

const goBack = () => router.go(-1);
</script>

<style scoped>
.separated {
  margin-bottom: 20px; /* Ajusta el valor según tus necesidades */
}
</style>
