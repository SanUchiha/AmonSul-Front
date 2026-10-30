<template>
  <div v-if="isLoading" class="d-flex justify-center align-center" style="height: 150px">
    <LoadingGandalf />
  </div>
  <v-container v-else class="mis-partidas text-left">
    <!-- Cabecera: qué hay aquí y el botón para registrar una -->
    <div class="d-flex flex-wrap align-center ga-2 mb-1">
      <h1 class="text-h5 font-weight-bold flex-grow-1">Mis partidas</h1>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="abrirRegistro">
        Registrar partida
      </v-btn>
    </div>
    <p class="text-body-2 text-medium-emphasis mb-4">
      Tus partidas amistosas. Las de eventos están en Mis eventos y en
      <router-link :to="`/detalle-jugador/${idUsuario}`">tu ficha de jugador</router-link>.
    </p>

    <!-- Pendientes: primero las que te toca validar -->
    <template v-if="pendientes.length > 0">
      <h2 class="text-subtitle-1 font-weight-bold mb-1">
        Pendientes de validar ({{ pendientes.length }})
      </h2>
      <p v-if="porValidar > 0" class="text-body-2 text-medium-emphasis mb-2">
        {{ porValidar === 1 ? "Tienes 1 partida" : `Tienes ${porValidar} partidas` }} esperando tu
        validación.
      </p>
      <v-row dense class="mb-4">
        <v-col
          v-for="partida in pendientes"
          :key="partida.idPartidaAmistosa"
          cols="12"
          sm="6"
          lg="4"
        >
          <PendingMatchCard :match="partida" @registroExitoso="cargarPartidas" />
        </v-col>
      </v-row>
    </template>

    <!-- Jugadas: balance, filtros, buscador y tarjetas, como en la ficha de jugador -->
    <h2 class="text-subtitle-1 font-weight-bold mb-1">Jugadas</h2>
    <PartidasJugador
      v-if="jugadas.length > 0"
      :partidas="jugadas"
      origen="amistosa"
      :idUsuario="idUsuario"
    />
    <v-card v-else variant="outlined" class="pa-4 text-center">
      <p class="text-body-2 text-medium-emphasis mb-3">
        Aún no tienes partidas amistosas validadas.
      </p>
      <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" @click="abrirRegistro">
        Registrar la primera
      </v-btn>
    </v-card>
  </v-container>

  <!-- Se monta de nuevo cada vez: así se puede volver a abrir aunque se cierre pulsando fuera -->
  <ModalRegistrarPartida
    v-if="registrando"
    :key="vecesRegistro"
    @close="registrando = false"
    @registroExitoso="cargarPartidas"
  />

  <ModalProteccionDatos
    v-if="showModalProteccionDatos"
    @modalClosed="showModalProteccionDatos = false"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { ViewPartidaAmistosaDTO } from "@/interfaces/Partidas";
import { getPartidasAmistosasByIdUser } from "@/services/PartidasAmistosasService";
import { getProteccionDatos } from "@/services/UsuariosService";
import { partidasJugadas } from "@/utils/historialJugador";
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";
import PendingMatchCard from "@/components/PartidaAmistosa/PendingMatchCard.vue";
import PartidasJugador from "@/components/DetalleJugador/PartidasJugador.vue";
import ModalRegistrarPartida from "@/components/PartidaAmistosa/ModalRegistrarPartida.vue";
import ModalProteccionDatos from "@/components/Usuarios/ModalProteccionDatos.vue";

const router = useRouter();
const { getidUsuario } = useAuth();
const idUsuario = Number(getidUsuario.value);

const isLoading = ref(true);
const partidas = ref<ViewPartidaAmistosaDTO[]>([]);
const registrando = ref(false);
const vecesRegistro = ref(0);
const showModalProteccionDatos = ref(false);

const validadaPor = (partida: ViewPartidaAmistosaDTO, id: number) =>
  partida.idUsuario1 === id ? partida.partidaValidadaUsuario1 : partida.partidaValidadaUsuario2;
const fecha = (partida: ViewPartidaAmistosaDTO) => new Date(partida.fechaPartida).getTime();

const pendientes = computed(() =>
  partidas.value
    .filter(p => !(p.partidaValidadaUsuario1 && p.partidaValidadaUsuario2))
    .sort(
      (a, b) =>
        Number(validadaPor(a, idUsuario)) - Number(validadaPor(b, idUsuario)) ||
        fecha(b) - fecha(a)
    )
);
const porValidar = computed(() => pendientes.value.filter(p => !validadaPor(p, idUsuario)).length);
// Solo las validadas por los dos, de la más reciente a la más antigua
const jugadas = computed(() =>
  partidasJugadas(
    idUsuario,
    [],
    partidas.value.filter(p => p.partidaValidadaUsuario1 && p.partidaValidadaUsuario2)
  )
);

const cargarPartidas = async () => {
  try {
    const response = await getPartidasAmistosasByIdUser(idUsuario);
    partidas.value = response.data;
  } catch (error) {
    console.error(error);
    router.push({ name: "error" });
  }
};

const abrirRegistro = () => {
  vecesRegistro.value++;
  registrando.value = true;
};

onMounted(async () => {
  if (!idUsuario) return;
  await cargarPartidas();
  isLoading.value = false;
  try {
    const response = await getProteccionDatos(idUsuario);
    if (!response.data) showModalProteccionDatos.value = true;
  } catch (error) {
    console.error(error);
  }
});
</script>

<style scoped>
.mis-partidas {
  max-width: 1100px;
}
</style>
