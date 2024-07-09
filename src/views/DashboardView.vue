<template>
  <v-container>
    <v-row dense>
      <v-col cols="12" md="8" class="text-center">
        <div v-if="loading">
          <ProgressCircular />
        </div>
        <div v-else>
          <div v-if="pendingMatches.length > 0">
            <PendingMatchCard
              v-for="match in pendingMatches"
              :key="match.idPartidaAmistosa"
              :match="match"
              class="mb-4"
              @partidaValidada="cargarPartidasPendientes"
            />
          </div>
          <div v-else><h4>No tienes partidas pendientes de validar</h4></div>
        </div>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12" md="8" class="text-center">
        <JugadorCard :usuario="usuario" />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="12" md="8" class="text-center">
        <v-card :class="cardClass">
          <v-card-title>Última partida jugada</v-card-title>
          <v-card-text v-if="ultimaPartida">{{
            messageUltimaPartida
          }}</v-card-text>
          <v-card-text v-else>No tienes aún partida registrada</v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="12" md="8" class="text-center">
        <v-card>
          <v-card-title>Último torneo jugado</v-card-title>
          <v-card-text>In progress...</v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-col cols="12" md="8" class="text-center">
      <v-card
        color="#632687"
        class="mx-auto register-card"
        @click="handleFormCreateMatch"
        max-width="344"
        title="Registrar partida"
        appendIcon="mdi-open-in-app"
        prependIcon="mdi-open-in-app"
      />
    </v-col>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import {
  getPartidasPendientesValidar,
  getPartidasValidadas,
} from "@/services/PartidasAmistosasService";
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
const router = useRouter();

const pendingMatches = ref<ViewPartidaAmistosaDTO[]>([]);
const ultimaPartida = ref<ViewPartidaAmistosaDTO | null>(null);
const messageUltimaPartida = computed(() => {
  if (!ultimaPartida.value) return null;

  const nickRival =
    ultimaPartida.value.nickUsuario1 === usuario.value.nick
      ? ultimaPartida.value.nickUsuario2
      : ultimaPartida.value.nickUsuario1;

  if (ultimaPartida.value.ganadorPartidaNick == null) {
    return `Empate contra ${nickRival}`;
  }

  return ultimaPartida.value.ganadorPartidaNick === nickRival
    ? `Derrota contra ${nickRival}`
    : `Victoria contra ${nickRival}`;
});

const cardClass = computed(() => {
  if (!ultimaPartida.value) return "";
  if (ultimaPartida.value.ganadorPartidaNick == null) return "empate-card";
  return ultimaPartida.value.ganadorPartidaNick === usuario.value.nick
    ? "victoria-card"
    : "derrota-card";
});

const cargarPartidasValidadas = async (email: string) => {
  try {
    const responseValidadas = await getPartidasValidadas(email);
    ultimaPartida.value = responseValidadas[responseValidadas.length - 1];
  } catch (error) {
    console.error("Error al obtener las partidas validadas:", error);
  }
};

const cargarPartidasPendientes = async (email: string) => {
  try {
    if (!email) {
      email = await getUser.value;
      if (!email) {
        throw new Error(
          "No se pudo obtener el usuario. Por favor, inicie sesión."
        );
      }
    }

    console.log("entra");
    const response = await getPartidasPendientesValidar(email);
    pendingMatches.value = response;
  } catch (error) {
    console.error(
      "Error al obtener las partidas pendientes de validar:",
      error
    );
  }
};

const initializeComponent = async () => {
  loading.value = true;
  try {
    const email: any = await getUser.value;
    if (!email) {
      throw new Error(
        "No se pudo obtener el usuario. Por favor, inicie sesión."
      );
    }

    const usuarioResponse = await getUsuarioPartidas(email);
    usuario.value = usuarioResponse;
    await cargarPartidasPendientes(email);
    await cargarPartidasValidadas(email);
  } catch (error) {
    console.error(error);
    router.push("error");
  } finally {
    loading.value = false;
  }
};

onMounted(initializeComponent);

const handleFormCreateMatch = () => {
  router.push("registrar-partida");
};
</script>

<style scoped>
.register-card {
  cursor: pointer;
}

.victoria-card {
  background-color: rgb(14, 84, 14);
  color: white;
}

.empate-card {
  background-color: rgb(151, 151, 15);
  color: black;
}

.derrota-card {
  background-color: rgb(106, 12, 12);
  color: white;
}

.error {
  color: red;
  text-align: center;
}
</style>
