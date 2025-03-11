<template>
  <div v-if="!hasAcciones">
    <v-container :loading="isLoading">
        <v-list>
          <v-list-item
            v-for="torneo in listaTorneos"
            :key="torneo.idInscripcion"
            @click="verDetalleTorneo(torneo.idTorneo)"
            class="clickable-list-item"
          >
            <template v-slot:prepend>
              <img src="@/assets/icons/misTorneos.png" alt="Icono personalizado" width="30" height="30">
            </template>

            <v-list-item-title class="text-wrap text-left pl-2">{{ torneo.nombreTorneo }}</v-list-item-title>

            <template v-slot:append>
              <v-btn icon @click.stop="verDetalleTorneo(torneo.idTorneo)">
                <img src="@/assets/icons/verLista.png" alt="Icono personalizado" width="40" height="40">
              </v-btn>
            </template>
          </v-list-item>

        </v-list>
    </v-container>
  </div>
  <div v-if="hasAcciones">
    <v-container :loading="isLoading" class="mb-0 pb-0">
        <v-list >
          <v-list-item
            v-for="torneo in listaTorneos"
            :key="torneo.idInscripcion"
            @click="verDetalleTorneo(torneo.idTorneo)"
            class="clickable-list-item"
          >
            <template v-slot:prepend>
              <img src="@/assets/icons/misTorneos.png" alt="Icono personalizado" width="30" height="30">
            </template>

            <v-list-item-title class="text-wrap text-left pl-2">{{ torneo.nombreTorneo }}</v-list-item-title>

            <template v-slot:append>
              <v-btn icon @click.stop="VerResultadoTorneo(torneo.idTorneo)">
                <img src="@/assets/icons/clasificacionTorneo.png" alt="Icono personalizado" width="40" height="40">
              </v-btn>
              
              <v-btn icon @click.stop="verDetalleInscripcion(torneo.idInscripcion)">
                <img src="@/assets/icons/verLista.png" alt="Icono personalizado" width="40" height="40">
              </v-btn>
            </template>
          </v-list-item>

          
        </v-list>
    </v-container>
  </div>

  <ModalSuccess
    :isVisible="showSuccessModal"
    message="Eliminado con éxito."
    @update:isVisible="showSuccessModal = $event"
  />

  <ModalError
    :isVisible="showErrorModal"
    message="No se ha podido eliminar. Contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />

  <ModalInscripcion
    v-if="showModalInscripcion"
    :idInscripcion="currentInscripcionId"
    :idUsuario="parseInt(idUsuarioLogger!)"
    :idTorneo="currentTorneoId"
    :idOrganizador="currentTorneoId"
    @eliminar-inscripcion="eliminarInscripcion"
    @close="closeModal"
  />
  <ModalInscripcionEquipo
    v-if="showModalInscripcionEquipo"
    :idInscripcion="currentInscripcionId"
    :idUsuario="parseInt(idUsuarioLogger!)"
    :idTorneo="currentTorneoId"
    :idOrganizador="currentTorneoId"
    @eliminar-inscripcion="eliminarInscripcion"
    @close="closeModal"
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
import { defineProps, onMounted, ref } from "vue";
import { InscripcionUsuarioIndividualDTO } from "@/interfaces/Inscripcion";
import router from "@/router";
import {
  cancelarInscripcion,
  getInscripcionesIndividualByUser,
} from "@/services/InscripcionesService";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";
import { useAuth } from "@/composables/useAuth";
import ModalInscripcion from "./ModalInscripcion.vue";
import ModalInscripcionEquipo from "./ModalInscripcionEquipo.vue";

const props = defineProps<{
  isLoading: boolean;
  listaTorneos: InscripcionUsuarioIndividualDTO[];
  idUsuario: number;
}>();

const isRegistering = ref<boolean>(false);

const currentInscripcionId = ref<number | null>(null);
const currentTorneoId = ref<number | null>(null);
const currentIdOrganizador = ref<number | null>(null);
const listaTorneos = ref<InscripcionUsuarioIndividualDTO[]>([]);

const showSuccessModal = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);
const showModalInscripcion = ref<boolean>(false);
const showModalInscripcionEquipo = ref<boolean>(false);

const hasAcciones = ref<boolean>(false);
const { getidUsuario } = useAuth();
const idUsuarioLogger = ref<string | null>(getidUsuario.value);

const verDetalleInscripcion = (idInscripcion: number) => {
  currentInscripcionId.value = idInscripcion;
  currentTorneoId.value =
    listaTorneos.value.find(
      (i) => i.idInscripcion == currentInscripcionId.value
    )?.idTorneo ?? null;
  currentIdOrganizador.value =
    listaTorneos.value.find(
      (i) => i.idInscripcion == currentInscripcionId.value
    )?.idOrganizador ?? null;

  showModalInscripcion.value = true;
};

const verDetalleInscripcionEquipo = (idInscripcion: number) => {
  currentInscripcionId.value = idInscripcion;
  showModalInscripcionEquipo.value = true;
};

const verDetalleTorneo = (idTorneo: number) => {
  router.push({ name: "detalle-torneo", params: { idTorneo } });
};
const VerResultadoTorneo = (idTorneo: number) => {
  router.push({ name: "detalle-torneo-live", params: { idTorneo } });
};

const eliminarInscripcion = async (idInscripcion: number) => {
  isRegistering.value = true;
  try {
    const response = await cancelarInscripcion(idInscripcion);

    if (response.request?.status === 200) {
      showSuccessModal.value = true;
      const responseInscriptionesUser = await getInscripcionesIndividualByUser(
        listaTorneos.value[0].idUsuario.toString()
      );
      listaTorneos.value = responseInscriptionesUser.data;
    } else {
      showErrorModal.value = true;
    }
  } catch {
    isRegistering.value = false;
    showErrorModal.value = true;
  } finally {
    isRegistering.value = false;
  }
};

onMounted(async () => {
  listaTorneos.value = props.listaTorneos;
  if (idUsuarioLogger.value != null) {
    if (props.idUsuario === parseInt(idUsuarioLogger.value)) {
      hasAcciones.value = true;
    }
  }
});

// Cierra el modal
const closeModal = () => {
  showModalInscripcion.value = false;
  showModalInscripcionEquipo.value = false;
};
</script>

<style scoped>
thead {
  background-color: #5b2269;
  color: white;
  text-align: center;
}

tbody tr {
  transition: background-color 0.3s;
}

tbody tr:hover {
  background-color: #3c4041;
}

.text-center {
  text-align: center;
}
</style>
