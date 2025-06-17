<template>
  <v-dialog v-model="dialogVisible" max-width="600px">
    <v-card>
      <v-card-title class="text-h5">Registrar Equipo</v-card-title>
      <v-card-text>
        <p>Registra a un equipo para el torneo.</p>
        <p>Debes añadir un máximo de {{ maxPlayers }} jugadores.</p>

        <v-text-field
          v-model="teamName"
          label="Nombre del equipo"
          tonal
          required
        ></v-text-field>

        <v-form>
          <v-combobox
            v-model="capitanSelected"
            :items="jugadores"
            item-title="nick"
            item-value="idUsuario"
            label="Selecciona el capitán"
            tonal
            required
            :return-object="true"
          ></v-combobox>
          <div v-for="index in maxPlayers - 1" :key="index">
            <v-combobox
              v-model="jugadorSelected[index]"
              :items="getJugadoresDisponibles(index)"
              item-title="nick"
              item-value="idUsuario"
              label="Selecciona a un jugador"
              tonal
              required
              :return-object="true"
            />
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          variant="tonal"
          color="primary"
          @click="submitForm"
          :disabled="isRegistering"
          >Registrar equipo</v-btn
        >
        <v-btn variant="tonal" color="secondary" @click="closeDialog"
          >Cerrar</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>

  <ModalSuccess
    :isVisible="showSuccessModal"
    message="Equipo registrado con éxito."
    @update:isVisible="showSuccessModal = $event"
  />
  <ModalError
    :isVisible="showErrorModal"
    message="No se ha podido registrar el equipo. Contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />

  <v-dialog v-model="isRegistering" persistent width="300">
    <v-card>
      <v-card-text
        class="d-flex justify-center align-center"
        style="height: 150px"
      >
        <v-progress-circular
          indeterminate
          color="blue-lighten-3"
          :size="57"
        ></v-progress-circular>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-snackbar
    color="red-darken-2"
    :timeout="snackBarTimeOut"
    v-model="snackBarShow"
    eager
    auto-height
  >
    {{ snackBarMessage }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits, onMounted, watch } from "vue";
import { registrarEquipo } from "@/services/InscripcionesService";
import { getUsuariosNoInscritosTorneoAsync } from "@/services/UsuariosService";
import {
  InscripcionEquipoDTO,
  TorneoEquipoGestionInfoDTO,
} from "@/interfaces/Inscripcion";
import { UsuarioSinEquipoDTO } from "@/interfaces/Usuario";

const props = defineProps<{
  isVisible: boolean;
  torneo: TorneoEquipoGestionInfoDTO;
}>();
const emit = defineEmits(["close", "confirm"]);

const teamName = ref("");
const jugadorSelected = ref<(UsuarioSinEquipoDTO | null)[]>([]);
const capitanSelected = ref<UsuarioSinEquipoDTO | null>(null);
const jugadores = ref<UsuarioSinEquipoDTO[]>([]);
const selectedPlayers = ref<UsuarioSinEquipoDTO[]>([]);
const idsSelected = ref<number[]>([]);
const isRegistering = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);
const snackBarShow = ref<boolean>(false);
const snackBarMessage = ref<string>("");
const snackBarTimeOut = ref<number>(3000);

const maxPlayers = computed(() => {
  return props.torneo.torneo.jugadoresXEquipo;
});

const dialogVisible = computed({
  get: () => props.isVisible,
  set: (value) => emit("close", value),
});

watch(dialogVisible, (visible) => {
  if (visible) {
    jugadorSelected.value = Array(maxPlayers.value - 1).fill(null);
  }
});

const getJugadoresDisponibles = (index: number) => {
  const idsSeleccionados = jugadorSelected.value
    .filter((_, i) => i !== index) // excluye el actual
    .filter((j) => j !== null)
    .map((j) => (j as UsuarioSinEquipoDTO).idUsuario);

  return jugadores.value.filter((j) => !idsSeleccionados.includes(j.idUsuario));
};

const validateForm = () => {
  // Comprueba nombre equipo
  if (!teamName.value.trim()) {
    snackBarMessage.value = "El nombre del equipo es obligatorio";
    snackBarShow.value = true;
    return false;
  }

  // Comprueba capitan
  if (!capitanSelected.value) {
    snackBarMessage.value = "Tienes que selecionar un capitán";
    snackBarShow.value = true;
    return false;
  }

  // Comprueba duplicado de capitan
  for (const jugador of jugadorSelected.value) {
    if (jugador?.idUsuario == capitanSelected.value.idUsuario) {
      snackBarMessage.value =
        "El capitán no puede estar repetido entre los jugadores.";
      snackBarShow.value = true;
      return false;
    }
  }

  idsSelected.value = [];
  const ids = new Set<number>();

  for (const jugador of jugadorSelected.value) {
    if (!jugador) continue;

    if (ids.has(jugador.idUsuario)) {
      snackBarMessage.value = "No se pueden duplicar los jugadores";
      snackBarShow.value = true;
      return false;
    }

    ids.add(jugador.idUsuario);
  }

  idsSelected.value = [...ids];

  return true;
};

const submitForm = async () => {
  if (
    props.torneo.torneo.idTorneo &&
    capitanSelected.value &&
    jugadorSelected.value.length > 1
  ) {
    if (!validateForm()) return;
    const inscripcionEquipo: InscripcionEquipoDTO = {
      idTorneo: props.torneo.torneo.idTorneo,
      idCapitan: capitanSelected.value.idUsuario,
      nombreEquipo: teamName.value,
      miembros: idsSelected.value,
      idUsuario: 0,
      idEquipo: 0,
      idOrganizador: 0,
      emailOrganizador: "",
      componentesEquipoDTO: [],
      idInscripcion: 0,
    };
    try {
      isRegistering.value = true;
      await registrarEquipo(inscripcionEquipo);
      showSuccessModal.value = true;
      emit("confirm");
    } catch (error) {
      showErrorModal.value = true;
    } finally {
      isRegistering.value = false;
      teamName.value = "";
      selectedPlayers.value = [];
      idsSelected.value = [];
    }
  } else {
    showErrorModal.value = true;
  }
};

const closeDialog = () => {
  emit("close");
  teamName.value = "";
  selectedPlayers.value = [];
  idsSelected.value = [];
};

onMounted(async () => {
  if (props.torneo.torneo.idTorneo == undefined) return;
  try {
    const responseJugadores = await getUsuariosNoInscritosTorneoAsync(
      props.torneo.torneo.idTorneo
    );
    jugadores.value = (responseJugadores?.data ?? []).sort(
      (a: { nick: string }, b: { nick: string }) => a.nick.localeCompare(b.nick)
    );
  } catch (error) {
    console.error("Error al obtener jugadores: ", error);
    jugadores.value = [];
  }
});
</script>

<style scoped></style>
