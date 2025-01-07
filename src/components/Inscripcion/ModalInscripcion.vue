<template>
  <div v-if="isLoading" class="center">
    <LoadingGandalf />
  </div>
  <div v-else class="center">
    <v-dialog v-model="show" max-width="800px">
      <v-card elevation="8" class="rounded-modal">
        <v-card-title class="modal-title">
          <h3>Detalle inscripción</h3>
          <v-spacer></v-spacer>
          <v-btn icon @click="close" class="close-button">
            <v-icon color="grey darken-1">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <v-card-text>
          <v-list dense>
            <!-- Estado Lista -->
            <v-list-item>
              <v-list-item-title class="list-item-title">
                LISTA: {{ inscripcionData?.estadoLista }}
              </v-list-item-title>
              <v-btn
                color="primary"
                variant="tonal"
                @click="handleVerLista(inscripcionData?.idInscripcion!)"
              >
                Envia/modifica tu lista
              </v-btn>
            </v-list-item>

            <v-list-item v-if="inscripcionData?.listaData != null">
              <v-list-item-content v-if="inscripcionData?.listaData">
                <v-btn color="orange" variant="tonal" @click="toggleLista">
                  Mostrar Lista
                </v-btn>
              </v-list-item-content>
              <v-list-item-content v-else>
                <v-btn color="orange" variant="tonal" @click="toggleLista">
                  Ocultar Lista
                </v-btn>
              </v-list-item-content>
            </v-list-item>

            <!-- Contenido de la lista -->
            <v-expand-transition>
              <v-list-item v-if="showLista">
                <v-list-item-content>
                  <h3>{{ inscripcionData?.ejercito }}</h3>
                  <v-spacer class="my-3"></v-spacer>
                  <template v-if="listaBase64">
                    <img
                      :src="listaBase64"
                      alt="Lista"
                      style="max-width: 100%; height: auto"
                    />
                  </template>
                  <template v-else>
                    <p>No hay lista disponible</p>
                  </template>
                </v-list-item-content>
              </v-list-item>
            </v-expand-transition>
            <!-- Estado Pago -->
            <v-list-item>
              <v-list-item-title class="list-item-title">
                PAGO: {{ inscripcionData?.esPago }}
              </v-list-item-title>
            </v-list-item>

            <!-- Botón para eliminar la inscripcion-->
            <v-list-item>
              <v-list-item-content>
                <v-btn
                  color="error"
                  variant="tonal"
                  @click="eliminarInscripcion(idInscripcion!)"
                  class="elevated-btn"
                >
                  Darse de baja del torneo
                </v-btn>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
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
    </v-dialog>
  </div>

  <!-- Modal response eliminar inscripcion -->
  <ModalSuccess
    :isVisible="showSuccessModalEliminar"
    message="Inscripción eliminada."
    @update:isVisible="showSuccessModalEliminar = $event"
  />

  <!-- Modal response si error -->
  <ModalError
    :isVisible="showErrorModal"
    message="No se ha podido actualizar la inscripción. Contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />

  <!-- Modal lista -->
  <ModalLista
    v-if="currentInscripcionId !== null"
    :isVisible="showVerListaModal"
    :hasLista="hasLista"
    :idInscripcion="currentInscripcionId"
    @update:isVisible="showVerListaModal = $event"
    @enviarLista="handleEnviarLista"
    @modificarLista="handleModificarLista"
  />

  <!-- Modales de respuesta a la subida de la lista -->
  <ModalSuccess
    :isVisible="showSuccessModalLista"
    message="Lista enviada con éxito."
    @update:isVisible="showSuccessModalLista = $event"
  />

  <ModalError
    :isVisible="showErrorModalLista"
    message="No se ha podido enviar la lista. Contacta con el administrador."
    @update:isVisible="showErrorModalLista = $event"
  />
</template>

<script setup lang="ts">
import { defineProps, ref, defineEmits, onMounted, watch } from "vue";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";
import LoadingGandalf from "../Commons/LoadingGandalf.vue";
import { getIncripcionById } from "@/services/InscripcionesService";
import { InscripcionTorneoCreadoDTO } from "@/interfaces/Torneo";
import ModalLista from "./ModalLista.vue";
import {
  CrearListaTorneoRequestDTO,
  ListaTorneoRequestDTO,
  ModificarListaTorneoRequestDTO,
  RequesListaDTO,
} from "@/interfaces/Lista";
import {
  getlistaTorneo,
  modificarListaTorneo,
  subirListaTorneo,
} from "@/services/ListasService";
import { ArmyDTO } from "@/interfaces/Army";

const props = defineProps<{
  idInscripcion: number | null;
  idUsuario: number | null;
  idTorneo: number | null;
  idOrganizador: number | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "eliminar-inscripcion", idInscripcion: number): void;
}>();

const show = ref(true);
const showSuccessModalEliminar = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);

const isLoading = ref(true);
const isRegistering = ref(false);

const inscripcionData = ref<InscripcionTorneoCreadoDTO>();
const currentInscripcionId = ref<number | null>(null);
const showVerListaModal = ref<boolean>(false);
const hasLista = ref<boolean>(false);
const listaText = ref<string>("");
const ejercito = ref<ArmyDTO>();
const showSuccessModalLista = ref<boolean>(false);
const showErrorModalLista = ref<boolean>(false);
const idLista = ref<number | null>();
const showLista = ref<boolean>(false);
const listaBase64 = ref<string | null>();

watch(
  () => showSuccessModalLista.value,
  (newValue, oldValue) => {
    if (oldValue && !newValue) {
      recargarPagina();
    }
  }
);

const recargarPagina = () => {
  window.location.reload();
};

const handleVerLista = async (idInscripcion: number) => {
  currentInscripcionId.value = idInscripcion;
  idLista.value = inscripcionData.value?.idLista;

  if (inscripcionData.value?.bando) hasLista.value = true;
  await verLista();
};

const toggleLista = async () => {
  if (!props.idTorneo || !props.idUsuario) {
    console.error("Faltan datos necesarios: idTorneo o idUsuario.");
    return;
  }

  showLista.value = !showLista.value;
  isLoading.value = true;

  const requestLista: ListaTorneoRequestDTO = {
    idTorneo: props.idTorneo,
    idUsuario: props.idUsuario,
  };
  try {
    const response = await getlistaTorneo(requestLista);
    listaBase64.value = response.data;

    if (response.data != null && inscripcionData.value)
      inscripcionData.value.listaData = response.data;
  } catch (error) {
    console.error("Error al recuperar la lista.");
  } finally {
    isLoading.value = false;
  }
};

const verLista = async () => {
  showVerListaModal.value = true;
};

const handleEnviarLista = async (newLista: RequesListaDTO) => {
  listaText.value = newLista.listaData;
  ejercito.value = newLista.ejercito;
  await enviarLista(newLista);
};

const enviarLista = async (newLista: RequesListaDTO) => {
  if (currentInscripcionId.value !== null) {
    isRegistering.value = true;
    const requestLista: CrearListaTorneoRequestDTO = {
      idInscripcion: currentInscripcionId.value,
      listaData: listaText.value,
      ejercito: newLista.ejercito,
      idUsuario: props.idUsuario!,
      idTorneo: props.idTorneo!,
      idOrganizador: props.idOrganizador!,
    };

    try {
      await subirListaTorneo(requestLista);
      showSuccessModalLista.value = true;
      if (inscripcionData.value) {
        inscripcionData.value.estadoLista = "ENTREGADA";
      }
      hasLista.value = true;
    } catch {
      isRegistering.value = false;
      showErrorModalLista.value = true;
    } finally {
      isRegistering.value = false;
      showVerListaModal.value = false;
    }
  }
};

const handleModificarLista = async (newLista: RequesListaDTO) => {
  ejercito.value = newLista.ejercito;
  listaText.value = newLista.listaData;
  await modificarLista(newLista);
};

const modificarLista = async (newLista: RequesListaDTO) => {
  isRegistering.value = true;
  if (currentInscripcionId.value !== null && idLista.value != null) {
    const requestLista: ModificarListaTorneoRequestDTO = {
      idInscripcion: currentInscripcionId.value,
      listaData: listaText.value,
      idLista: idLista.value,
      ejercito: newLista.ejercito,
      idUsuario: props.idUsuario!,
      idTorneo: props.idTorneo!,
      idOrganizador: props.idOrganizador!,
    };
    try {
      await modificarListaTorneo(requestLista);
      showSuccessModalLista.value = true;
    } catch {
      isRegistering.value = false;
      showErrorModalLista.value = true;
    } finally {
      isRegistering.value = false;
      showVerListaModal.value = false;
    }
  }
};

const eliminarInscripcion = async (idInscripcion: number) => {
  emit("eliminar-inscripcion", idInscripcion);
  show.value = false;
  emit("close");
};
const close = () => {
  show.value = false;
  emit("close");
};

onMounted(async () => {
  try {
    isLoading.value = true;
    const response = await getIncripcionById(props.idInscripcion!);
    inscripcionData.value = response.data;
  } catch (error) {
    console.error("Error al obtener datos de la inscripcion:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.modal-title {
  display: flex;
  align-items: center;
  font-size: 20px;
}

.list-item-title {
  display: flex;
  align-items: center;
  font-weight: 500;
  margin-bottom: 8px;
}

.close-button {
  margin-left: auto;
}

.v-list-item {
  margin-bottom: 16px;
}
.elevated-btn {
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
