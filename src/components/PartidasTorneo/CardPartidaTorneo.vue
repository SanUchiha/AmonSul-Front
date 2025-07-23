<template>
  <!-- TODO implementar ver detalles cuando haya algo mas que mostrar
     @click="goToDetallePartida()"
     -->
  <v-card
    ref="matchCards"
    :class="['match-card', cardColorClass]"
    :style="{
      '--border-color':
        resultado === 'Win'
          ? '#145c1750'
          : resultado === 'Lose'
          ? '#75171050'
          : '#e6c40050',
    }"
  >
    <!-- Título con los jugadores y avatares -->
    <v-card-text class="text-center text-wrap text-h5">
      {{ match.nombreTorneo }}
    </v-card-text>

    <v-divider></v-divider>

    <v-card-title class="text-center text-wrap">
      <v-row align="center" justify="center" class="match-score" no-gutters>
        <v-col
          @click="verProfileUser(match.idUsuario1)"
          cols="5"
          class="player-name text-center"
        >
          <span class="player-nick text-center" style="cursor: pointer">
            {{ match.nickUsuario1 }}
          </span>
          <v-card-subtitle class="text-wrap">{{
            match.ejercitoUsuario1
          }}</v-card-subtitle>
        </v-col>

        <v-col cols="2" class="score text-center marcador">
          <p>vs</p>
          <p>{{ match.resultadoUsuario1 }}-{{ match.resultadoUsuario2 }}</p>
        </v-col>

        <v-col
          @click="verProfileUser(match.idUsuario2)"
          cols="5"
          class="player-name text-center"
        >
          <span class="player-nick text-center" style="cursor: pointer">
            {{ match.nickUsuario2 }} </span
          ><br />
          <v-card-subtitle class="text-wrap">{{
            match.ejercitoUsuario2
          }}</v-card-subtitle>
        </v-col>
      </v-row>
    </v-card-title>

    <v-divider></v-divider>

    <!-- Información de la partida -->
    <v-card-text :class="['text-center', cardColorClass]">
      <v-row align="center">
        <v-col cols="4">
          <v-chip>
            {{ resultado }}
          </v-chip>
        </v-col>

        <v-col cols="4"> {{ match.puntosPartida }} pts </v-col>

        <v-col cols="4" class="player-nick">
          {{ fechaPartidaFormateada }}
        </v-col>
      </v-row>

      <v-row class="mt-3 match-scenario">
        <v-col cols="12" class="text-center">
          <strong>{{ match.escenarioPartida || "No disponible" }}</strong>
        </v-col>

        <!--TODO Implementar detalles, de momento no hay nada que mostrar
          <v-col cols="6" class="text-center">
            <v-btn small color="blue lighten-2" @click.stop="goToDetallePartida()">
              Ver Detalles
            </v-btn>
          </v-col>-->
      </v-row>
    </v-card-text>
  </v-card>
  <v-spacer class="my-3"></v-spacer>

  <div v-if="error" class="error">{{ error }}</div>
  <ModalDetallePartida
    v-if="showModalDetallePartida"
    :partida="match"
    @close="closeModalDetallePartida"
  />
</template>

<script setup lang="ts">
import { defineProps, ref, onMounted, computed } from "vue";
import { ViewPartidaTorneoDTO } from "@/interfaces/Partidas";
import { useRouter } from "vue-router";
import { formatFechaSpa } from "@/utils/Fecha";
import ModalDetallePartida from "@/components/PartidaAmistosa/ModalDetallePartida.vue";

const isLoading = ref(true);
const error = ref<string | null>(null);
const router = useRouter();

const resultado = ref<string>("");
const fechaPartidaFormateada = ref<string>("");

const props = defineProps<{
  match: ViewPartidaTorneoDTO;
  idUsuario: number;
}>();

const showModalDetallePartida = ref(false);

const initializeComponent = async () => {
  try {
    isLoading.value = true;
    setResultado();
    fechaPartidaFormateada.value = await formatFechaSpa(
      props.match.fechaPartida
    );
  } catch (err) {
    error.value = (err as Error).message;
    router.push({ name: "error" });
  } finally {
    isLoading.value = false;
  }
};

const setResultado = () => {
  if (props.match.ganadorPartidaTorneo == null) {
    resultado.value = "Draw";
  } else if (props.match.ganadorPartidaTorneo == props.idUsuario) {
    resultado.value = "Win";
  } else {
    resultado.value = "Lose";
  }
};

const cardColorClass = computed(() => {
  switch (resultado.value) {
    case "Win":
      return "victoria-card";
    case "Lose":
      return "derrota-card";
    case "Draw":
      return "empate-card";
    default:
      return "";
  }
});

const verProfileUser = (idUser: number) => {
  router.push({ name: "detalle-jugador", params: { idUsuario: idUser } });
};

const goToDetallePartida = () => {
  showModalDetallePartida.value = true;
};

const closeModalDetallePartida = () => {
  showModalDetallePartida.value = false;
};

onMounted(initializeComponent);
</script>
<style>
.player-nick {
  white-space: nowrap;
  font-size: 1rem;
}

@media (max-width: 600px) {
  .player-nick {
    font-size: 0.85rem;
  }
}
</style>
