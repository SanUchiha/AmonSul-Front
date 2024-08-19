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

          <!-- Estado Inscripción -->
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title class="list-item-title">
                INSCRIPCIÓN
              </v-list-item-title>
              <v-select
                v-model="localInscripcion.estadoInscripcion"
                :items="estadoInscripcionOptions"
                label="Estado"
                dense
                hide-details
                v-on:change="
                  logChange(
                    'estadoInscripcion',
                    localInscripcion.estadoInscripcion!
                  )
                "
              ></v-select>
            </v-list-item-content>
          </v-list-item>

          <!-- Botón para ver la lista -->
          <div v-if="inscripcion?.listaData">
            <v-list-item>
              <v-list-item-content>
                <v-btn color="primary" @click="toggleLista"> Ver Lista </v-btn>
              </v-list-item-content>
            </v-list-item>

            <!-- Contenido de la lista -->
            <v-expand-transition>
              <v-list-item v-if="showLista">
                <v-list-item-content>
                  <v-textarea
                    v-model="localInscripcion.listaData"
                    auto-grow
                    readonly
                  ></v-textarea>
                </v-list-item-content>
              </v-list-item>
            </v-expand-transition>
          </div>

          <!-- Botón para eliminar la inscripcion-->
          <v-list-item>
            <v-list-item-content>
              <v-btn
                color="red"
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

  <!-- Modal response estado inscripcion -->
  <ModalSuccess
    :isVisible="showSuccessModalInscripcion"
    message="Estado de la inscripción actualizado."
    @update:isVisible="showSuccessModalInscripcion = $event"
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
</template>

<script setup lang="ts">
import { InscripcionTorneoCreadoDTO } from "@/interfaces/Torneo";
import {
  cancelarInscripcion,
  updateEstadoInscripcion,
  updateEstadoLista,
  updateEstadoPago,
} from "@/services/InscripcionesService";
import { defineProps, ref, watch, defineEmits } from "vue";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";

// Definir las propiedades y eventos
const props = defineProps<{
  inscripcion: InscripcionTorneoCreadoDTO | null;
}>();

// ModalDetalleInscripcion.vue
const emit = defineEmits<{
  (e: "close"): void;
  (
    e: "update-inscripcion",
    payload: { field: keyof InscripcionTorneoCreadoDTO; value: any }
  ): void;
  (e: "eliminar-inscripcion", idInscripcion: number): void;
}>();

const show = ref(true);
const showLista = ref(false);
const localInscripcion = ref({ ...props.inscripcion });

const estadoInscripcionOptions = ["EN PROCESO", "COMPLETADA"] as const;
const estadoListaOptions = [
  "NO ENTREGADA",
  "ENTREGADA",
  "ILEGAL",
  "OK",
] as const;
const pagoOptions = ["NO", "SI"] as const;

const showSuccessModalPago = ref<boolean>(false);
const showSuccessModalLista = ref<boolean>(false);
const showSuccessModalInscripcion = ref<boolean>(false);
const showSuccessModalEliminar = ref<boolean>(false);

const showErrorModal = ref<boolean>(false);

// Registrar el cambio y actualizar en la base de datos
const logChange = async (
  field: "estadoInscripcion" | "estadoLista" | "esPago",
  value: string | boolean
) => {
  console.log("Entramos cambiar el estado de: " + field);
  console.log("Entramos cambiar el estado de: " + value);
  try {
    //inscripcion
    if (field === "estadoInscripcion") {
      let estado: string;
      if (value == "EN PROCESO") estado = "EN PROCESO";
      else estado = "COMPLETADA";
      await updateEstadoInscripcion({
        idInscripcion: localInscripcion.value.idInscripcion!,
        estadoInscripcion: estado,
      });
      showSuccessModalInscripcion.value = true;
      emit("update-inscripcion", { field, value: estado });

      //lista
    } else if (field === "estadoLista") {
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
      emit("update-inscripcion", { field, value: estado });
    }

    console.log(`Actualización exitosa en ${field}:`, value);
  } catch (error) {
    console.error(`Error actualizando ${field}:`, error);
    showErrorModal.value = true;
  } finally {
    //
  }
};

watch(
  () => localInscripcion.value.estadoInscripcion,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      logChange("estadoInscripcion", newValue!);
    }
  }
);

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

const toggleLista = () => {
  showLista.value = !showLista.value;
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

// Watch para actualizar la inscripción local cuando cambie la inscripción original
watch(
  () => props.inscripcion,
  (newInscripcion) => {
    localInscripcion.value = { ...newInscripcion };
    show.value = true;
  }
);
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
</style>
