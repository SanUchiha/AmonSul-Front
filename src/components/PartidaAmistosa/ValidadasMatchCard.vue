<template>
  <div v-if="loading" class="center">
    <ProgressCircular />
  </div>
  <div v-else>
    <v-card :class="cardColorClass">
      <v-card-title>Rival: {{ nickRival }}</v-card-title>
      <v-card-text>
        Resultado: {{ match.resultadoUsuario1 }} - {{ match.resultadoUsuario2 }}
      </v-card-text>
      <v-card-text>
        <p>{{ match.puntosPartida }} puntos</p>
        Escenario: {{ match.escenarioPartida || "No disponible" }}
      </v-card-text>

      <v-card-text>
        <p>Fecha: {{ fechaPartidaFormateada }}</p>
      </v-card-text>
    </v-card>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, onMounted, defineEmits, computed } from "vue";
import {
  ValidarPartidaDTO,
  ViewPartidaAmistosaDTO,
} from "@/interfaces/Partidas";
import { useAuth } from "@/composables/useAuth";
import ProgressCircular from "../Commons/ProgressCircular.vue";
import { getUsuario } from "@/services/UsuariosService";
import { useRouter } from "vue-router";
import { formatFechaSpa } from "@/utils/Fecha";
import { UsuarioViewDTO } from "@/interfaces/Usuario";

const loading = ref(true);
const { getUser } = useAuth();
const error = ref<string | null>(null);
const router = useRouter();

const nickRival = ref<string>("");
const resultado = ref<string>("");
const fechaPartidaFormateada = ref<string>("");
const userOwner = ref<UsuarioViewDTO | null>(null);

const props = defineProps<{ match: ViewPartidaAmistosaDTO }>();
const emit = defineEmits(["partidaValidada"]);

const initializeComponent = async () => {
  try {
    const email: any = await getUser.value;
    if (!email) {
      throw new Error(
        "No se pudo obtener el usuario. Por favor, inicie sesión."
      );
    }

    userOwner.value = await getUsuario(email);

    setResultado();
    setRivalNick();
    fechaPartidaFormateada.value = await formatFechaSpa(
      props.match.fechaPartida
    );
  } catch (err) {
    error.value = (err as Error).message;
    router.push("error");
  } finally {
    loading.value = false;
  }
};

const setResultado = () => {
  if (props.match.ganadorPartidaNick == null) {
    resultado.value = "Empate";
  } else if (props.match.ganadorPartidaNick == userOwner.value?.nick) {
    resultado.value = "Victoria";
  } else {
    resultado.value = "Derrota";
  }
};

const setRivalNick = () => {
  if (props.match.nickUsuario1 === userOwner.value?.nick) {
    nickRival.value = props.match.nickUsuario2;
  } else {
    nickRival.value = props.match.nickUsuario1;
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

onMounted(initializeComponent);
</script>

<style scoped>
.victoria-card {
  background-color: rgb(14, 84, 14);
  color: white;
}

.derrota-card {
  background-color: rgb(106, 12, 12);
  color: white;
}

.empate-card {
  background-color: rgb(151, 151, 15);
  color: black;
}

.error {
  color: red;
  text-align: center;
}
</style>
