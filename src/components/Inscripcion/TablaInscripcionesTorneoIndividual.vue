<template>
  <div v-if="!hasAcciones">
    <v-container :loading="isLoading">
      <h3 class="ringbearer text-center mb-4">Inscripciones individuales</h3>
      <v-list>
        <template v-if="listaTorneos && listaTorneos.length > 0">
          <v-list-item
            v-for="torneo in listaTorneos"
            :key="torneo.idInscripcion"
            @click="verDetalleTorneo(torneo.idTorneo)"
            class="clickable-list-item"
          >
            <v-list-item-title class="text-wrap text-left pl-2">{{
              torneo.torneo.nombreTorneo
            }}</v-list-item-title>

            <template v-slot:append>
              <v-btn icon @click.stop="verDetalleTorneo(torneo.idTorneo)">
                <img
                  src="@/assets/icons/verdetalle.png"
                  alt="Ver detalles"
                  width="32"
                  height="32"
                />
              </v-btn>
            </template>
          </v-list-item>
        </template>
        <template v-else>
          <v-list-item>
            <v-list-item-title
              class="text-center grey--text text-wrap aviso-torneos"
              >No tienes torneos individuales en el
              horizonte.</v-list-item-title
            >
          </v-list-item>
        </template>
      </v-list>
    </v-container>
  </div>
  <div v-if="hasAcciones">
    <v-container :loading="isLoading" class="mb-0 pb-0">
      <h3 class="ringbearer text-center mb-4">Torneos individuales</h3>
      <v-list>
        <template v-if="listaTorneos && listaTorneos.length > 0">
          <v-list-item
            v-for="torneo in listaTorneos"
            :key="torneo.idInscripcion"
            class="clickable-list-item"
          >
            <v-list-item-title class="text-wrap text-left pl-2">
              {{ torneo.torneo.nombreTorneo }}
            </v-list-item-title>
            <template v-slot:append>
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn icon v-bind="props">
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="verDetalleTorneo(torneo.idTorneo)">
                    <v-list-item-title
                      >Ver detalle del torneo</v-list-item-title
                    >
                  </v-list-item>
                  <v-list-item
                    @click="verDetalleInscripcion(torneo.idInscripcion)"
                  >
                    <v-list-item-title
                      >Subir lista y ver inscripción</v-list-item-title
                    >
                  </v-list-item>
                  <v-list-item
                    @click="
                      torneo.torneo.tipoTorneo == 'Individual' &&
                      torneo.torneo.listasPorJugador > 1
                        ? VerResultadoTorneoMas(torneo.idTorneo)
                        : VerResultadoTorneo(torneo.idTorneo)
                    "
                  >
                    <v-list-item-title>Ver resultados</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
          </v-list-item>
        </template>
        <template v-else>
          <v-list-item>
            <v-list-item-title
              class="text-center grey--text text-wrap aviso-torneos"
              >No tienes torneos individuales en el
              horizonte.</v-list-item-title
            >
          </v-list-item>
        </template>
      </v-list>
    </v-container>
  </div>

  <!-- Modal Success -->
  <ModalSuccess
    :isVisible="showSuccessModal"
    message="Eliminado con exito."
    @update:isVisible="showSuccessModal = $event"
  />

  <ModalError
    :isVisible="showErrorModal"
    message="No se ha podido eliminar. Contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />

  <ModalInscripcion
    v-if="showModalInscripcion"
    :idInscripcion="currentInscripcionId!"
    :idUsuario="parseInt(idUsuarioLogger!)"
    :idTorneo="currentTorneoId!"
    :idOrganizador="currentIdOrganizador!"
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

const props = defineProps<{
  isLoading: boolean;
  listaTorneos: InscripcionUsuarioIndividualDTO[];
  idUsuario: number;
  disputado: boolean;
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

const verDetalleTorneo = (idTorneo: number) => {
  router.push({ name: "detalle-torneo", params: { idTorneo } });
};
const VerResultadoTorneo = (idTorneo: number) => {
  router.push({ name: "detalle-torneo-live", params: { idTorneo } });
};
const VerResultadoTorneoMas = (idTorneo: number) => {
  router.push({ name: "detalle-torneo-live-mas", params: { idTorneo } });
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
.btns-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
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

.btn-mini {
  font-size: 0.65rem !important;
  min-width: 0 !important;
  padding: 0 4px !important;
  height: 18px !important;
  line-height: 1 !important;
  margin-left: 2px;
  margin-right: 2px;
}

.aviso-torneos {
  white-space: normal !important;
  word-break: break-word;
  font-size: 1rem;
  width: 100%;
  display: block;
  overflow: visible !important;
  text-overflow: unset !important;
}
</style>
