<template>


  <v-col cols="12" sm="12" md="6" class="text-right">
  <v-hover v-slot:default="{ props }">
    <v-card v-bind="props" :class="['match-card', cardColorClass]" @click="goToDetallePartida()">
      
      <!-- Título con los jugadores y avatares -->
      <v-card-title class="text-center text-wrap">
        {{match.nombreTorneo}}
      </v-card-title>
      
      <v-divider></v-divider>

      <v-card-title class="text-center">
        <v-row align="center" justify="center">
          <v-col cols="5" class="text-left">
            <!--<v-avatar size="40">
              <img :src="match.avatarUsuario1"/>
            </v-avatar>-->
            <span class="ml-2 text-wrap">{{ match.nickUsuario1 }}</span>
            <v-card-subtitle class="text-wrap">{{match.ejercitoUsuario1}}</v-card-subtitle>
          </v-col>
          
          <v-col cols="2" class="text-center text-h6">
            vs
          </v-col>

          <v-col cols="5" class="text-right">
            <!--<v-avatar size="40">
              <img :src="match.avatarUsuario2"/>
            </v-avatar>-->
            <span class="ml-2 text-wrap">{{ match.nickUsuario2 }}</span>
            <v-card-subtitle class="text-wrap">{{match.ejercitoUsuario2}}</v-card-subtitle>
          </v-col>
        </v-row>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Información de la partida -->
      <v-card-text>
        <v-row align="center">
          <v-col cols="4" class="text-center">
            <v-chip :color="resultado === 'Victoria' ? 'green' : 'red'" class="text-h6">
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

        <v-row class="mt-3">
          <v-col cols="6" class="text-center">
            <v-icon left>mdi-map-marker</v-icon> Escenario: 
            <strong>{{ match.escenarioPartida || "No disponible" }}</strong>
          </v-col>
          
          <v-col cols="6" class="text-center">
            <v-btn small color="blue lighten-2" @click.stop="goToDetallePartida()">
              Ver Detalles
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>

    </v-card>
  </v-hover>
</v-col>
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
  if (props.match.ganadorPartidaNick == null) {
    resultado.value = "Empate";
  } else if (props.match.ganadorPartidaTorneo == props.idUsuario) {
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

const goToDetallePartida = () => {
  showModalDetallePartida.value = true;
};

const closeModalDetallePartida = () => {
  showModalDetallePartida.value = false;
};

onMounted(initializeComponent);
</script>

<style scoped>
.victoria-card {
  background-color: rgb(14, 84, 14);
  color: white;
  cursor: pointer;
}

.derrota-card {
  background-color: rgb(106, 12, 12);
  color: white;
  cursor: pointer;
}

.empate-card {
  background-color: rgb(151, 151, 15);
  color: black;
  cursor: pointer;
}

.error {
  color: red;
  text-align: center;
}
</style>
