<template>
  <v-container>
    <v-row dense>
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

    <v-row dense>
      <v-col cols="12" md="8" class="text-center">
        <v-card>
          <v-card-title> Última partida jugada </v-card-title>
          <v-card-text> In progress... </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="12" md="8" class="text-center">
        <v-card>
          <v-card-title> Última torneo jugado </v-card-title>
          <v-card-text> In progress... </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="12" md="8" class="text-center">
        <JugadorCard :usuario="usuario" />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12" md="8" class="text-center">
        <v-card
          class="mx-auto"
          @click="handleFormCreateMatch"
          max-width="344"
          title="Registrar partida"
          appendIcon="mdi-open-in-app"
          prependIcon="mdi-open-in-app"
        >
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getPartidasPendientesValidar } from "@/services/PartidasAmistosasService";
import { ViewPartidaAmistosaDTO } from "@/interfaces/Partidas";
import PendingMatchCard from "@/components/PartidaAmistosa/PendingMatchCard.vue";
import { ViewUsuarioPartidaDTO } from "@/interfaces/Usuario";
import { useAuth } from "@/composables/useAuth";
import ProgressCircular from "../components/Commons/ProgressCircular.vue";
import { getUsuarioPartidas } from "@/services/UsuariosService";
import { useRouter } from "vue-router";
import JugadorCard from "@/components/Usuarios/JugadorCard.vue";
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

const loading = ref(true);
const { getUser } = useAuth();
const error = ref<string | null>(null);
const router = useRouter();

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

onMounted(async () => {
  cargarPartidasPendientes;
  const email: any = await getUser.value;
  if (!email) {
    router.push("error");
    error.value = "No se pudo obtener el usuario. Por favor, inicie sesión.";
    console.log(error.value);
    loading.value = false;
    return;
  }
  try {
    const usuarioResponse = await getUsuarioPartidas(email);
    usuario.value = usuarioResponse;
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
  } finally {
    loading.value = false;
  }
});

const handleFormCreateMatch = () => {
  router.push("registrar-partida");
};
</script>

<style scoped>
.jugador-card {
  margin: 16px;
}

.victoria {
  color: green;
}

.empate {
  color: yellow;
}

.derrota {
  color: red;
}
</style>
