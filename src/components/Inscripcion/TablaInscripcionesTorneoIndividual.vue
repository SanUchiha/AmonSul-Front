<template>
  <div v-if="!hasAcciones">
    <v-table :loading="isLoading">
      <thead>
        <tr>
          <th class="text-center">Nombre torneo</th>
          <th class="text-center">Detalle torneo</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="torneo in listaTorneos" :key="torneo.idInscripcion">
          <td>{{ torneo.nombreTorneo }}</td>
          <td class="text-center">
            <v-btn icon @click="verDetalleTorneo(torneo.idTorneo)">
              <v-icon color="orange">mdi-eye</v-icon>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
  <div v-if="hasAcciones">
    <v-table :loading="isLoading">
      <tbody>
        <tr v-for="torneo in listaTorneos" :key="torneo.idInscripcion">
          <td>{{ torneo.nombreTorneo }}</td>
          <td class="text-center">
            <div v-if="torneo.idEquipo">
              <v-btn
                icon
                @click="verDetalleInscripcionEquipo(torneo.idInscripcion)"
              >
                <v-icon color="orange">mdi-eye</v-icon>
              </v-btn>
            </div>
            <div v-else>
              <v-btn icon @click="verDetalleInscripcion(torneo.idInscripcion)">
                <v-icon color="orange">mdi-eye</v-icon>
              </v-btn>
            </div>

            <!-- <v-btn icon @click="handleVerLista(torneo.idInscripcion)">
              <v-icon color="primary">mdi-file-send</v-icon>
            </v-btn> -->
            <!-- <v-btn icon @click="eliminarInscripcion(torneo.idInscripcion)">
              <v-icon color="red">mdi-cancel</v-icon>
            </v-btn> -->
          </td>
        </tr>
      </tbody>
    </v-table>
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

  console.log(idInscripcion);

  showModalInscripcionEquipo.value = true;
};

const verDetalleTorneo = (idTorneo: number) => {
  router.push({ name: "detalle-torneo", params: { idTorneo } });
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
