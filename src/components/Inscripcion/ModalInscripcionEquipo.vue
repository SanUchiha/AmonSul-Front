<template>
  <div v-if="isLoading" class="center">
    <LoadingGandalf />
  </div>
  <div v-else class="center">
    <v-dialog v-model="show" max-width="800px">
      <v-card elevation="8" class="rounded-modal">
        <v-card-title class="modal-title">
          <h3>Detalle inscripción Equipo</h3>
          <v-spacer></v-spacer>
          <v-btn icon @click="close" class="close-button">
            <v-icon color="grey darken-1">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <v-card-text>
          <v-list dense>
            <v-list-item>
              <v-list-item-title class="font-weight-bold">
                Nombre del equipo:
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ inscripcionData?.nombreEquipo }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <v-list-item-title class="font-weight-bold">
                Capitán del equipo:
              </v-list-item-title>
              <v-list-item-subtitle>
                {{
                  inscripcionData?.componentesEquipo.find(
                    (c) => c.idUsuario === inscripcionData?.idCapitan
                  )?.nick || "Desconocido"
                }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <v-list-item-title class="font-weight-bold">
                Fecha de inscripción:
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ inscripcionData?.fechaInscripcion }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <v-list-item-title class="font-weight-bold">
                Estado de pago:
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ inscripcionData?.esPago === "SI" ? "Pagado" : "No pagado" }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-divider class="my-3"></v-divider>

            <v-list-item>
              <v-list-item-title class="font-weight-bold">
                Miembros del equipo:
              </v-list-item-title>
              <div class="chips-container">
                <v-chip
                  v-for="miembro in inscripcionData?.componentesEquipo"
                  :key="miembro.idUsuario"
                  color="primary"
                  variant="tonal"
                >
                  {{ miembro.nick }}
                </v-chip>
              </div>
            </v-list-item>

            <v-divider class="my-4"></v-divider>

            <v-list-item>
              <v-btn
                color="error"
                variant="tonal"
                @click="eliminarInscripcion(idInscripcion!)"
                class="elevated-btn"
              >
                Darse de baja del torneo
              </v-btn>
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
import { getIncripcionEquipoById } from "@/services/InscripcionesService";
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
import { InscripcionTorneoEquiposDTO } from "@/interfaces/Inscripcion";

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

const inscripcionData = ref<InscripcionTorneoEquiposDTO>();
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
    const response = await getIncripcionEquipoById(props.idInscripcion!);
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
