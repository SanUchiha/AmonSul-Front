<template>
  <v-card :class="['match-card', cardColorClass]" :style="{ '--border-color': resultado === 'Victoria' ? '#145c1750' : resultado === 'Derrota'? '#75171050' : '#e6c40050'}">
           
      <v-divider></v-divider>

      <v-card-title class="text-center text-wrap">
        <v-row align="center" justify="center" class="match-score" no-gutters>
          <v-col @click="verProfileUser(match.idUsuario1)" cols="5" class="player-name text-left">
            <span class="ml-2 text-wrap">{{ match.nickUsuario1 }}</span>
            <v-card-subtitle class="text-wrap">{{match.ejercitoUsuario1}}</v-card-subtitle>              
          </v-col>

          <v-col cols="2" class="score text-center marcador">
            <p>vs</p>
            <p>{{ match.resultadoUsuario1 }}-{{ match.resultadoUsuario2 }}</p>
          </v-col>

          <v-col @click="verProfileUser(match.idUsuario2)" cols="5" class="player-name text-right">
            <span class="ml-2 text-wrap">{{ match.nickUsuario2 }}</span><br>
            <v-card-subtitle class="text-wrap">{{match.ejercitoUsuario2}}</v-card-subtitle>              
          </v-col>
        </v-row>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Información de la partida -->
      <v-card-text :class="['text-center match-content', cardColorClass]">
        <v-row align="center">
          <v-col cols="4" class="text-center">
            <v-chip :color="resultado === 'Victoria' ? 'green' : resultado === 'Derrota'? 'red' : 'orange'" class="text-h6">
              {{ resultado }}
            </v-chip>
          </v-col>

          <v-col cols="4" class="text-center">
            <v-icon left>mdi-cash-multiple</v-icon> {{ match.puntosPartida }} pts
          </v-col>

          <v-col cols="4" class="text-center">
            <v-icon left>mdi-calendar</v-icon> {{ fechaPartidaFormateada }}
          </v-col>
        </v-row>

        <v-row class="mt-3 match-scenario">
          <v-col cols="12" class="text-center">
            <v-icon left class="location-icon">mdi-map-marker</v-icon> Escenario:
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

      <ShareMatch :match-amistosa=match></ShareMatch>

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
import { ViewPartidaAmistosaDTO } from "@/interfaces/Partidas";
import { useRouter } from "vue-router";
import { formatFechaSpa } from "@/utils/Fecha";
import ModalDetallePartida from "@/components/PartidaAmistosa/ModalDetallePartida.vue";
import ShareMatch from "@/components/Commons/ShareMatch.vue";

const isLoading = ref(true);
const error = ref<string | null>(null);
const router = useRouter();

const resultado = ref<string>("");
const fechaPartidaFormateada = ref<string>("");

const props = defineProps<{
  match: ViewPartidaAmistosaDTO;
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
  if (props.match.ganadorPartidaNick == null) {
    resultado.value = "Empate";
  } else if (props.match.ganadorPartida == props.idUsuario) {
    resultado.value = "Victoria";
  } else {
    resultado.value = "Derrota";
  }
};

const cardColorClass = computed(() => {
  switch (resultado.value) {
    case "Victoria":
      return "victoria-card";
    case "Derrota":
      return "derrota-card";
    case "Empate":
      return "empate-card";
    default:
      return "";
  }
});

const verProfileUser = (idUser: number) => {
  router.push({ name: "detalle-jugador", params: { idUsuario:idUser } });
};

const goToDetallePartida = () => {
  showModalDetallePartida.value = true;
};

const closeModalDetallePartida = () => {
  showModalDetallePartida.value = false;
};

onMounted(initializeComponent);
</script>

