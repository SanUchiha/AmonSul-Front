<template>
  <div v-if="isLoading" class="center">
    <LoadingGandalf />
  </div>
  <div v-else class="center">
    <v-dialog v-model="show" max-width="800px">
      <v-card>
        <v-card-title class="modal-title">
          <h3>Nick del jugador</h3>
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
              <v-list-item-title class="list-item-title">
                LISTA: {{ inscripcionData?.estadoLista }}
              </v-list-item-title>
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

            <!-- Botón para ver la lista -->
            <!-- <div v-if="inscripcion?.listaData">
            <v-list-item>
              <v-list-item-content>
                <v-btn color="primary" @click="toggleLista"> Ver Lista </v-btn>
              </v-list-item-content>
            </v-list-item>

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
          </div> -->

            <!-- Botón para eliminar la inscripcion-->
            <!-- <v-list-item>
            <v-list-item-content>
              <v-btn color="red" @click="eliminarInscripcion(idInscripcion!)">
                Eliminar inscripción
              </v-btn>
            </v-list-item-content>
          </v-list-item> -->
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
</template>

<script setup lang="ts">
import { defineProps, ref, defineEmits, onMounted } from "vue";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";
import LoadingGandalf from "../Commons/LoadingGandalf.vue";
import { getIncripcionById } from "@/services/InscripcionesService";
import { InscripcionTorneoCreadoDTO } from "@/interfaces/Torneo";

// Definir las propiedades y eventos
const props = defineProps<{
  idInscripcion: number | null;
}>();

// ModalDetalleInscripcion.vue
const emit = defineEmits<{
  (e: "close"): void;
}>();

const show = ref(true);
const showLista = ref(false);

const showSuccessModalEliminar = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);

const isLoading = ref(true);

const inscripcionData = ref<InscripcionTorneoCreadoDTO>();

const toggleLista = () => {
  showLista.value = !showLista.value;
};

// const eliminarInscripcion = async (idInscripcion: number) => {
//   try {
//     const response = await cancelarInscripcion(idInscripcion);

//     if (response.request?.status === 200) {
//       showSuccessModalEliminar.value = true;
//       emit("eliminar-inscripcion", idInscripcion.v);
//     } else {
//       showErrorModal.value = true;
//     }
//   } catch {
//     showErrorModal.value = true;
//   } finally {
//     show.value = false;
//     emit("close");
//   }
// };
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
</style>
