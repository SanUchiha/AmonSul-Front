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

            <!-- Estado Pago -->
            <v-list-item>
              <v-list-item-title class="list-item-title">
                PAGO: {{ inscripcionData?.esPago }}
              </v-list-item-title>
            </v-list-item>

            <!-- Estado Inscripción -->
            <v-list-item>
              <v-list-item-title class="list-item-title">
                INSCRIPCIÓN: {{ inscripcionData?.estadoInscripcion }}
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
import { defineProps, ref, defineEmits, onMounted } from "vue";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";
import LoadingGandalf from "../Commons/LoadingGandalf.vue";
import { getIncripcionById } from "@/services/InscripcionesService";
import { InscripcionTorneoCreadoDTO } from "@/interfaces/Torneo";
import ModalLista from "./ModalLista.vue";
import {
  CrearListaTorneoRequestDTO,
  ModificarListaTorneoRequestDTO,
  ObjetoListaDTO,
} from "@/interfaces/Lista";
import {
  modificarListaTorneo,
  subirListaTorneo,
} from "@/services/ListasService";

const props = defineProps<{
  idInscripcion: number | null;
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
const ejercito = ref<string>("");
const showSuccessModalLista = ref<boolean>(false);
const showErrorModalLista = ref<boolean>(false);
const idLista = ref<number | null>();

const handleVerLista = async (idInscripcion: number) => {
  currentInscripcionId.value = idInscripcion;
  idLista.value = inscripcionData.value?.idLista;

  if (inscripcionData.value?.listaData) hasLista.value = true;
  await verLista();
};
const verLista = async () => {
  showVerListaModal.value = true;
};

const handleEnviarLista = async (newLista: ObjetoListaDTO) => {
  listaText.value = newLista.listaData;
  ejercito.value = newLista.ejercito;
  await enviarLista(newLista);
};

const enviarLista = async (newLista: ObjetoListaDTO) => {
  if (currentInscripcionId.value !== null) {
    isRegistering.value = true;
    const requestLista: CrearListaTorneoRequestDTO = {
      idInscripcion: currentInscripcionId.value,
      listaData: listaText.value,
      ejercito: newLista.ejercito,
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

const handleModificarLista = async (newLista: ObjetoListaDTO) => {
  ejercito.value = newLista.ejercito;
  listaText.value = newLista.listaData;
  await modificarLista(newLista);
};

const modificarLista = async (newLista: ObjetoListaDTO) => {
  isRegistering.value = true;
  if (currentInscripcionId.value !== null && idLista.value != null) {
    const requestLista: ModificarListaTorneoRequestDTO = {
      idInscripcion: currentInscripcionId.value,
      listaData: listaText.value,
      idLista: idLista.value,
      ejercito: newLista.ejercito,
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
