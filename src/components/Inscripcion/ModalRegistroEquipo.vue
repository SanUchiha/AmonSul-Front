<template>
  <v-dialog v-model="dialogVisible" max-width="600px">
    <v-card>
      <v-card-title class="text-h5">Registrar Equipo</v-card-title>
      <v-card-text>
        <p>Registra a tu equipo para el torneo.</p>
        <p>Puedes añadir un máximo de {{ maxPlayers - 1 }} participantes.</p>
        <p>
          Tu serás el capitán del equipo, Amon Sûl te añadirá automaticamente a
          tu equipo.
        </p>

        <!-- Campo para ingresar el nombre del equipo -->
        <v-text-field
          v-model="teamName"
          label="Nombre del equipo"
          outlined
          required
        ></v-text-field>

        <v-form>
          <!-- Selección de jugadores según el tipo de torneo -->
          <v-combobox
            v-model="jugadorSelected"
            :items="jugadores"
            item-title="nick"
            item-value="idUsuario"
            label="Selecciona un jugador"
            outlined
            required
            @update:modelValue="addPlayer"
          ></v-combobox>

          <!-- Lista de jugadores seleccionados -->
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
        <v-btn color="primary" @click="submitForm">Registrar equipo</v-btn>
        <v-btn color="secondary" @click="closeDialog"> Cerrar </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Modal Success -->
  <ModalSuccess
    :isVisible="showSuccessModal"
    message="Equipo registrado con exito."
    @update:isVisible="showSuccessModal = $event"
  />

  <!-- Modal Error -->
  <ModalError
    :isVisible="showErrorModal"
    message="No se ha podido registrar el equipo. Contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />

  <!-- Spinner Modal -->
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
</template>

<script setup lang="ts">
import { InscripcionEquipoDTO } from "@/interfaces/Inscripcion";
import { JugadorParaEmparejamiento } from "@/interfaces/Live";
import { UsuarioFastDTO } from "@/interfaces/Usuario";
import { defineProps, defineEmits, computed, ref, onMounted } from "vue";
import { useAuth } from "@/composables/useAuth";
import { registrarEquipo } from "@/services/InscripcionesService";
import { getUsuariosNoInscritosTorneoAsync } from "@/services/UsuariosService";

const props = defineProps<{
  isVisible: boolean;
  tipoTorneo: string | undefined;
  idTorneo: number;
}>();

const emit = defineEmits(["update:isVisible"]);

const teamName = ref<string>("");
const jugadorSelected = ref<JugadorParaEmparejamiento | null>(null);
const jugadores = ref<UsuarioFastDTO[]>([]);
const selectedPlayers = ref<UsuarioFastDTO[]>([]);
const idsSelected = ref<number[]>([]);
const { getidUsuario } = useAuth();
const idUsuarioLogger = ref<string | null>(getidUsuario.value);
const isRegistering = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);
const isSuccess = ref<boolean>(false);

// Determina la cantidad máxima de jugadores según el tipo de torneo
const maxPlayers = computed(() => {
  if (props.tipoTorneo === "Parejas") return 2;
  if (props.tipoTorneo === "Equipos_4") return 4;
  if (props.tipoTorneo === "Equipos_6") return 6;
  return 0;
});

const dialogVisible = computed({
  get: () => props.isVisible,
  set: (value) => emit("update:isVisible", value),
});

// Agregar jugador seleccionado si no está ya en la lista
const addPlayer = (player: UsuarioFastDTO) => {
  if (
    player &&
    !selectedPlayers.value.find((p) => p.idUsuario === player.idUsuario) &&
    selectedPlayers.value.length < maxPlayers.value - 1
  ) {
    selectedPlayers.value.push(player);
    idsSelected.value.push(player.idUsuario);
  }
  jugadorSelected.value = null; // Resetea el combobox después de seleccionar un jugador
};

// Remover jugador de la lista
const removePlayer = (index: number) => {
  selectedPlayers.value.splice(index, 1);
  idsSelected.value.splice(index, 1);
};

const validateForm = () => {
  if (!teamName.value.trim()) {
    showErrorModal.value = true;
    return false;
  }
  if (!props.idTorneo) {
    showErrorModal.value = true;
    return false;
  }
  if (selectedPlayers.value.length !== maxPlayers.value - 1) {
    showErrorModal.value = true;
    return false;
  }
  return true;
};

// Función para manejar el registro del equipo
const submitForm = async () => {
  if (!validateForm()) return;
  if (
    selectedPlayers.value.length === maxPlayers.value - 1 &&
    props.idTorneo &&
    idUsuarioLogger.value
  ) {
    const id: number = parseInt(idUsuarioLogger.value);
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
      isSuccess.value = true;
      emit("update:isVisible", false);
      window.location.reload();
    } catch (error) {
      showErrorModal.value = true;
    } finally {
      isRegistering.value = false;
    }
  } else {
    alert("Por favor, selecciona el número correcto de jugadores.");
  }
};

const resetForm = () => {
  teamName.value = "";
  selectedPlayers.value = [];
  idsSelected.value = [];
};

const closeDialog = () => {
  emit("update:isVisible", false);
  resetForm();
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
    console.error("Error al obtener la información del torneo:", error);
    jugadores.value = []; // Evitar que sea undefined
  }
});
</script>

<style scoped>
/* Puedes agregar estilos específicos aquí si es necesario */
</style>
