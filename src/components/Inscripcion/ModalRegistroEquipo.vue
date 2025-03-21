<template>
  <v-dialog v-model="dialogVisible" max-width="600px">
    <v-card>
      <v-card-title class="text-h5">Registrar Equipo</v-card-title>
      <v-card-text>
        <p>Registra a tu equipo para el torneo.</p>
        <p>Debes añadir un máximo de {{ maxPlayers - 1 }} participantes.</p>
        <p>
          Tu serás el capitán del equipo, Amon Sûl te añadirá automáticamente a
          tu equipo.
        </p>

        <v-text-field
          v-model="teamName"
          label="Nombre del equipo"
          outlined
          required
        ></v-text-field>

        <v-form>
          <v-combobox
            v-model="jugadorSelected"
            :items="jugadores"
            item-title="nick"
            item-value="idUsuario"
            label="Selecciona un jugador"
            outlined
            required
            @update:modelValue="addPlayer"
            :return-object="true"
          ></v-combobox>

          <div v-show="selectedPlayers.length">
            <p>Jugadores seleccionados:</p>
            <v-chip
              v-for="(player, index) in selectedPlayers"
              :key="player.idUsuario"
              closable
              @click:close="removePlayer(index)"
              class="ma-1"
            >
              {{ player.nick }}
            </v-chip>
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="tonal" color="primary" @click="submitForm"
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
import { ref, computed, defineProps, defineEmits, onMounted } from "vue";
import { useAuth } from "@/composables/useAuth";
import { registrarEquipo } from "@/services/InscripcionesService";
import { getUsuariosNoInscritosTorneoAsync } from "@/services/UsuariosService";
import { InscripcionEquipoDTO } from "@/interfaces/Inscripcion";
import { UsuarioSinEquipoDTO } from "@/interfaces/Usuario";

const props = defineProps<{
  isVisible: boolean;
  tipoTorneo: string | undefined;
  idTorneo: number;
}>();
const emit = defineEmits(["update:isVisible"]);

const teamName = ref("");
const jugadorSelected = ref<UsuarioSinEquipoDTO | null>(null);
const jugadores = ref<UsuarioSinEquipoDTO[]>([]);
const selectedPlayers = ref<UsuarioSinEquipoDTO[]>([]);
const idsSelected = ref<number[]>([]);
const isRegistering = ref(false);
const showSuccessModal = ref(false);
const showErrorModal = ref(false);
const snackBarShow = ref(false);
const snackBarMessage = ref("");
const snackBarTimeOut = ref(3000);

const { getidUsuario } = useAuth();
const idUsuarioLogger = ref<string | null>(getidUsuario.value);

const maxPlayers = computed(() => {
  return props.tipoTorneo === "Parejas"
    ? 2
    : props.tipoTorneo === "Equipos_4"
    ? 4
    : props.tipoTorneo === "Equipos_6"
    ? 6
    : 0;
});

const dialogVisible = computed({
  get: () => props.isVisible,
  set: (value) => emit("update:isVisible", value),
});

const addPlayer = (player: UsuarioSinEquipoDTO) => {
  if (
    player &&
    !selectedPlayers.value.some((p) => p.idUsuario === player.idUsuario)
  ) {
    selectedPlayers.value.push(player);
    idsSelected.value.push(player.idUsuario);
  }
  jugadorSelected.value = null;
};

const removePlayer = (index: number) => {
  selectedPlayers.value.splice(index, 1);
  idsSelected.value.splice(index, 1);
};

const validateForm = () => {
  if (!teamName.value.trim()) {
    snackBarMessage.value = "El nombre del equipo es obligatorio";
    snackBarShow.value = true;
    return false;
  }
  if (!props.idTorneo) {
    showErrorModal.value = true;
    return false;
  }
  return true;
};

const submitForm = async () => {
  if (!validateForm()) return;
  if (props.idTorneo && idUsuarioLogger.value) {
    const id = parseInt(idUsuarioLogger.value);
    const inscripcionEquipo: InscripcionEquipoDTO = {
      idTorneo: props.idTorneo,
      idCapitan: id,
      nombreEquipo: teamName.value,
      miembros: idsSelected.value,
      idInscripcion: 0,
      idUsuario: 0,
      idEquipo: 0,
      idOrganizador: 0,
      emailOrganizador: "",
      componentesEquipoDTO: [],
    };
    try {
      isRegistering.value = true;
      await registrarEquipo(inscripcionEquipo);
      showSuccessModal.value = true;
      emit("update:isVisible", false);
      window.location.reload();
    } catch (error) {
      showErrorModal.value = true;
    } finally {
      isRegistering.value = false;
    }
  } else {
    showErrorModal.value = true;
  }
};

const closeDialog = () => {
  emit("update:isVisible", false);
  teamName.value = "";
  selectedPlayers.value = [];
  idsSelected.value = [];
};

onMounted(async () => {
  try {
    const responseJugadores = await getUsuariosNoInscritosTorneoAsync(
      props.idTorneo
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
