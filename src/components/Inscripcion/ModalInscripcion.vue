<template>
  <div v-if="isLoading" class="center">
    <LoadingGandalf />
  </div>
  <div v-else class="center">
    <v-dialog v-model="show" max-width="800px">
      <v-card elevation="12">
        <v-card-title
          class="modal-title d-flex align-center justify-space-between"
        >
          <h3 class="text-h5 font-weight-bold">Detalle de la inscripción</h3>
          <v-btn icon @click="close" class="close-button">
            <v-icon color="grey darken-1">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <v-card-text class="px-6 py-4">
          <v-list>
            <v-list-item>
              <v-list-item-title class="list-item-title">
                <v-icon color="primary" class="mr-2">mdi-file-document</v-icon>
                <strong>Lista:</strong> &nbsp;{{ inscripcionData?.estadoLista }}
              </v-list-item-title>
              <v-btn
                v-if="inscripcionData?.listaData"
                color="primary"
                variant="tonal"
                block
                @click="toggleLista"
              >
                <v-icon left>mdi-eye</v-icon
                >{{ showLista ? "Ocultar lista" : "Ver lista" }}
              </v-btn>
              <v-btn
                v-if="new Date(torneo!.fechaFinTorneo) >= new Date()"
                color="primary"
                block
                variant="tonal"
                class="elevated-btn"
                @click="handleVerLista(inscripcionData?.idInscripcion!)"
              >
                <v-icon left>mdi-mail</v-icon> Enviar / Modificar Lista
              </v-btn>
            </v-list-item>

            <v-divider class="mt-3 mb-1"></v-divider>
            <v-expand-transition>
              <v-list-item v-if="showLista">
                <v-list-item-content>
                  <h3 class="text-h6 font-weight-bold text-primary">
                    {{ inscripcionData?.ejercito }}
                  </h3>
                  <v-divider class="my-3"></v-divider>
                  <template v-if="listaBase64">
                    <v-img
                      :src="listaBase64"
                      alt="Lista de ejército"
                      max-width="100%"
                      class="rounded-img"
                      contain
                    />
                  </template>
                  <template v-else>
                    <p class="text-grey-darken-1 text-center">
                      No hay lista disponible
                    </p>
                  </template>
                </v-list-item-content>
              </v-list-item>
            </v-expand-transition>

            <v-list-item>
              <v-list-item-title class="list-item-title">
                <v-icon
                  :color="inscripcionData?.esPago === 'SI' ? 'green' : 'red'"
                  class="mr-2"
                  >mdi-credit-card</v-icon
                >
                <span class="font-weight-bold">Estado de pago:</span>
                <v-chip
                  :color="inscripcionData?.esPago === 'SI' ? 'green' : 'red'"
                  dark
                  class="ml-2"
                >
                  {{
                    inscripcionData?.esPago === "SI" ? "Pagado" : "No pagado"
                  }}
                </v-chip>
              </v-list-item-title>
            </v-list-item>

            <v-list-item v-if="new Date(torneo!.fechaFinTorneo) >= new Date()">
              <v-btn
                color="red-darken-3"
                variant="tonal"
                block
                class="elevated-btn"
                @click="eliminarInscripcion(idInscripcion!)"
              >
                <v-icon left>mdi-delete</v-icon> Darse de baja del torneo
              </v-btn>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
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
import { InscripcionTorneoCreadoDTO, Torneo } from "@/interfaces/Torneo";
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
const torneo = ref<Torneo>();
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
  if (
    currentInscripcionId.value &&
    props.idUsuario &&
    props.idTorneo &&
    props.idOrganizador
  ) {
    isRegistering.value = true;
    const requestLista: CrearListaTorneoRequestDTO = {
      idInscripcion: currentInscripcionId.value,
      listaData: listaText.value,
      ejercito: newLista.ejercito,
      idUsuario: props.idUsuario,
      nick: "",
      idTorneo: props.idTorneo,
      idOrganizador: props.idOrganizador,
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
  if (
    currentInscripcionId.value !== null &&
    idLista.value != null &&
    props.idUsuario &&
    props.idTorneo &&
    props.idOrganizador
  ) {
    const requestLista: ModificarListaTorneoRequestDTO = {
      idInscripcion: currentInscripcionId.value,
      listaData: listaText.value,
      idLista: idLista.value,
      ejercito: newLista.ejercito,
      idUsuario: props.idUsuario,
      idTorneo: props.idTorneo,
      idOrganizador: props.idOrganizador,
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
    torneo.value = inscripcionData.value?.torneo;
  } catch (error) {
    console.error("Error al obtener datos de la inscripcion:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.rounded-modal {
  border-radius: 12px;
}
.modal-title {
  padding: 16px;
  font-weight: bold;
}
.close-button {
  margin-right: 8px;
}
.info-card {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}
.elevated-btn {
  margin: auto;
}
</style>
