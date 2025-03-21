<template>
  <v-dialog v-model="show" max-width="800px">
    <v-card>
      <v-card-title class="modal-title">
        <h3>{{ inscripcion?.nick }}</h3>
        <v-spacer></v-spacer>
        <v-btn icon @click="close" class="close-button">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>

      <v-card-text>
        <v-list dense>
          <!-- Estado Lista -->
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title class="list-item-title">
                LISTA
              </v-list-item-title>
              <v-select
                v-model="localInscripcion.estadoLista"
                :items="estadoListaOptions"
                label="Estado"
                dense
                hide-details
                @change="
                  logChange('estadoLista', localInscripcion.estadoLista!)
                "
              ></v-select>
            </v-list-item-content>
          </v-list-item>

          <!-- Estado Pago -->
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title class="list-item-title">
                PAGO
              </v-list-item-title>
              <v-select
                v-model="localInscripcion.esPago"
                :items="pagoOptions"
                label="Estado"
                dense
                hide-details
                @input="logChange('esPago', localInscripcion.esPago!)"
              ></v-select>
            </v-list-item-content>
          </v-list-item>

          <!-- Botón para ver la lista -->
          <v-list-item>
            <v-list-item-content v-if="!showLista">
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
                <h3>{{ localInscripcion.ejercito }}</h3>
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

          <!-- Botón para subir/modificar lista -->
          <v-list-item>
            <v-btn color="primary" variant="tonal" @click="showModalLista()">
              Envia/modifica su lista
            </v-btn>
          </v-list-item>

          <!-- Botón para eliminar la inscripcion-->
          <v-list-item>
            <v-list-item-content>
              <v-btn
                color="red"
                variant="tonal"
                @click="eliminarInscripcion(inscripcion?.idInscripcion!)"
              >
                Eliminar inscripción
              </v-btn>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Modal response estado pago -->
  <ModalSuccess
    :isVisible="showSuccessModalPago"
    message="Estado del pago actualizado."
    @update:isVisible="showSuccessModalPago = $event"
  />

  <!-- Modal response estado lista -->
  <ModalSuccess
    :isVisible="showSuccessModalLista"
    message="Estado de la lista actualizado."
    @update:isVisible="showSuccessModalLista = $event"
  />

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

  <!-- Modal response eliminar inscripcion -->
  <ModalSuccess
    :isVisible="showSuccessModalSubirLista"
    message="Lista subida con exito."
    @update:isVisible="showSuccessModalSubirLista = $event"
  />

  <!-- Modal para subir la lista del jugador -->
  <ModalListaGestion
    :isVisible="showModificarLista"
    :idLista="localInscripcion.idLista!"
    @update:isVisible="showModificarLista = $event"
    @enviarLista="handleEnviarLista"
  />

  <!-- Modal de Carga -->
  <v-dialog v-model="isLoading" hide-overlay persistent>
    <v-card class="progress-card">
      <v-progress-circular
        indeterminate
        color="primary"
        size="70"
      ></v-progress-circular>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { InscripcionTorneoCreadoDTO } from "@/interfaces/Torneo";
import {
  cancelarInscripcion,
  updateEstadoLista,
  updateEstadoPago,
} from "@/services/InscripcionesService";
import { defineProps, ref, watch, defineEmits } from "vue";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";
import {
  getlistaTorneo,
  modificarListaTorneo,
  subirListaTorneo,
} from "@/services/ListasService";
import {
  CrearListaTorneoRequestDTO,
  ListaTorneoRequestDTO,
  ModificarListaTorneoRequestDTO,
  RequesListaDTO,
} from "@/interfaces/Lista";
import ModalListaGestion from "./ModalListaGestion.vue";
import { ArmyDTO } from "@/interfaces/Army";

// Definir las propiedades y eventos
const props = defineProps<{
  inscripcion: InscripcionTorneoCreadoDTO | null;
}>();

// ModalDetalleInscripcion.vue
const emit = defineEmits<{
  (e: "close"): void;
  (
    e: "update-inscripcion",
    payload: { field: keyof InscripcionTorneoCreadoDTO; value: unknown }
  ): void;
  (e: "eliminar-inscripcion", idInscripcion: number): void;
}>();

const show = ref<boolean>(true);
const showLista = ref<boolean>(false);
const localInscripcion = ref({ ...props.inscripcion });
const isLoading = ref<boolean>(false);
const listaBase64 = ref<string>();
const listaText = ref<string>("");
const ejercito = ref<ArmyDTO>();

const estadoListaOptions = [
  "NO ENTREGADA",
  "ENTREGADA",
  "ILEGAL",
  "OK",
] as const;
const pagoOptions = ["NO", "SI"] as const;

const showSuccessModalPago = ref<boolean>(false);
const showSuccessModalLista = ref<boolean>(false);
const showSuccessModalEliminar = ref<boolean>(false);
const showSuccessModalSubirLista = ref<boolean>(false);

const showModificarLista = ref<boolean>(false);

const showErrorModal = ref<boolean>(false);

// Registrar el cambio y actualizar en la base de datos
const logChange = async (
  field: "estadoLista" | "esPago",
  value: string | boolean
) => {
  isLoading.value = true;
  try {
    //lista
    if (field === "estadoLista") {
      let estado: string;
      if (value == "NO ENTREGADA") estado = "NO ENTREGADA";
      else if (value == "ENTREGADA") estado = "ENTREGADA";
      else if (value == "ILEGAL") estado = "ILEGAL";
      else estado = "OK";
      await updateEstadoLista({
        idInscripcion: localInscripcion.value.idInscripcion!,
        estadoLista: estado,
      });
      showSuccessModalLista.value = true;
      isLoading.value = false;
      emit("update-inscripcion", { field, value: estado });

      //Pago
    } else if (field === "esPago") {
      let estado: string;
      if (value == "NO") estado = "NO";
      else estado = "SI";
      await updateEstadoPago({
        idInscripcion: localInscripcion.value.idInscripcion!,
        esPago: estado,
      });
      showSuccessModalPago.value = true;
      isLoading.value = false;
      emit("update-inscripcion", { field, value: estado });
    }
  } catch (error) {
    console.error(`Error actualizando ${field}:`, error);
    showErrorModal.value = true;
    isLoading.value = false;
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => localInscripcion.value.estadoLista,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      logChange("estadoLista", newValue!);
    }
  }
);

watch(
  () => localInscripcion.value.esPago,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      logChange("esPago", newValue!);
    }
  }
);

const toggleLista = async () => {
  showLista.value = !showLista.value;
  isLoading.value = true;
  // Traer la lista del back
  const requestLista: ListaTorneoRequestDTO = {
    idTorneo: localInscripcion.value.torneo!.idTorneo,
    idUsuario: localInscripcion.value.idUsuario!,
  };
  try {
    const response = await getlistaTorneo(requestLista);
    listaBase64.value = response.data;
  } catch (error) {
    console.error("Error al recuperar la lista.");
  } finally {
    isLoading.value = false;
  }
};

const eliminarInscripcion = async (idInscripcion: number) => {
  try {
    const response = await cancelarInscripcion(idInscripcion);

    if (response.request?.status === 200) {
      showSuccessModalEliminar.value = true;
      emit("eliminar-inscripcion", idInscripcion);
    } else {
      showErrorModal.value = true;
    }
  } catch {
    showErrorModal.value = true;
  } finally {
    show.value = false;
    emit("close");
  }
};

const close = () => {
  show.value = false;
  emit("close");
};

const showModalLista = () => {
  showModificarLista.value = true;
};

const handleEnviarLista = async (newLista: RequesListaDTO) => {
  listaText.value = newLista.listaData;
  ejercito.value = newLista.ejercito;
  await enviarLista(newLista);
};

const enviarLista = async (newLista: RequesListaDTO) => {
  isLoading.value = true;

  if (localInscripcion.value.idLista && localInscripcion.value.idLista != 0) {
    const requestLista: ModificarListaTorneoRequestDTO = {
      idLista: localInscripcion.value.idLista,
      listaData: newLista.listaData,
      ejercito: newLista.ejercito,
    };
    try {
      await modificarListaTorneo(requestLista);
      showSuccessModalSubirLista.value = true;
    } catch {
      showErrorModal.value = true;
    } finally {
      isLoading.value = false;
    }
  } else {
    const requestLista: CrearListaTorneoRequestDTO = {
      idInscripcion: localInscripcion.value.idInscripcion!,
      idUsuario: localInscripcion.value.idUsuario!,
      idTorneo: localInscripcion.value.torneo?.idTorneo,
      listaData: newLista.listaData,
      ejercito: newLista.ejercito,
      nick: "",
    };
    try {
      await subirListaTorneo(requestLista);
      showSuccessModalSubirLista.value = true;
    } catch {
      showErrorModal.value = true;
    } finally {
      isLoading.value = false;
    }
  }
};

// Watch para actualizar la inscripción local cuando cambie la inscripción original
watch(
  () => props.inscripcion,
  (newInscripcion) => {
    localInscripcion.value = { ...newInscripcion };
    show.value = true;
  }
);

// Watch para detectar cuando se cierra el modal de éxito
watch(
  () => showSuccessModalSubirLista.value,
  (newValue, oldValue) => {
    if (oldValue && !newValue) {
      recargarPagina();
    }
  }
);

const recargarPagina = () => {
  window.location.reload();
};
</script>

<style scoped>
.modal-title {
  display: flex;
  align-items: center;
  align-items: center;
  font-size: 20px;
}

.modal-title h3 {
  margin: 0; /* Elimina márgenes para un mejor centrado */
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

.lotr-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  width: 100%;
}
</style>
