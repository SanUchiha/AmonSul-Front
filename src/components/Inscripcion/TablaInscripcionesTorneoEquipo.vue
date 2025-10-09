<template>
  <v-divider class="mb-0 pb-0"></v-divider>
  <div v-if="!hasAcciones">
    <v-container :loading="isLoading">
      <v-list>
        <v-list-item
          v-for="torneo in listaTorneos"
          :key="torneo.idInscripcion"
          @click="verDetalleTorneo(torneo.idTorneo)"
          class="clickable-list-item"
        >
          <v-list-item-title class="text-wrap text-left pl-2">{{
            torneo.nombreTorneo
          }}</v-list-item-title>

          <template v-slot:append>
            <v-btn icon @click.stop="verDetalleTorneo(torneo.idTorneo)">
              <img
                src="@/assets/icons/verLista.png"
                alt="Icono personalizado"
                width="40"
                height="40"
              />
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-container>
  </div>

  <div v-if="hasAcciones">
    <v-container :loading="isLoading" class="mb-0 pb-0">
      <h3 class="ringbearer text-center mb-4">Torneos por equipos</h3>
      <v-list>
        <template v-if="listaTorneos && listaTorneos.length > 0">
          <v-list-item
            v-for="torneo in listaTorneos"
            :key="torneo.idInscripcion"
            class="clickable-list-item"
          >
            <v-list-item-title class="text-wrap text-left pl-2">
              {{ torneo.nombreTorneo }}
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
                    @click="verDetalleInscripcionEquipo(torneo.idInscripcion)"
                  >
                    <v-list-item-title
                      >Subir lista y ver inscripción</v-list-item-title
                    >
                  </v-list-item>
                  <v-list-item @click="VerResultadoTorneo(torneo.idTorneo)">
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
              >No tienes torneos por equipos en el horizonte.</v-list-item-title
            >
          </v-list-item>
        </template>
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

  <v-dialog v-model="showModalInscripcionEquipo">
    <ModalInscripcionEquipo
      :idInscripcion="currentInscripcionId"
      :idUsuario="parseInt(idUsuarioLogger!)"
      :idTorneo="currentTorneoId!"
      :idOrganizador="currentTorneoId"
      @eliminar-inscripcion-equipo="eliminarInscripcionEquipo"
      @close="closeModal"
    />
  </v-dialog>

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
import { InscripcionUsuarioEquipoDTO } from "@/interfaces/Inscripcion";
import router from "@/router";
import {
  getInscripcionesEquipoByUser,
  eliminarEquipoAsync,
} from "@/services/InscripcionesService";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";
import { useAuth } from "@/composables/useAuth";
import ModalInscripcionEquipo from "./ModalInscripcionEquipo.vue";

const props = defineProps<{
  isLoading: boolean;
  listaTorneos: InscripcionUsuarioEquipoDTO[];
  idUsuario: number;
  disputado: boolean;
}>();

const isRegistering = ref<boolean>(false);

const currentInscripcionId = ref<number | null>(null);
const currentTorneoId = ref<number | null>(null);
const listaTorneos = ref<InscripcionUsuarioEquipoDTO[]>([]);

const showSuccessModal = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);
const showModalInscripcion = ref<boolean>(false);
const showModalInscripcionEquipo = ref<boolean>(false);

const hasAcciones = ref<boolean>(false);
const { getidUsuario } = useAuth();
const idUsuarioLogger = ref<string | null>(getidUsuario.value);

const verDetalleInscripcionEquipo = (idInscripcion: number) => {
  currentInscripcionId.value = idInscripcion;
  showModalInscripcionEquipo.value = true;
};

const verDetalleTorneo = (idTorneo: number) => {
  router.push({ name: "detalle-torneo", params: { idTorneo } });
};
const VerResultadoTorneo = (idTorneo: number) => {
  router.push({ name: "detalle-torneo-live-equipos", params: { idTorneo } });
};

const eliminarInscripcionEquipo = async (idEquipo: number) => {
  isRegistering.value = true;
  try {
    const response = await eliminarEquipoAsync(idEquipo);

    if (response.request?.status === 200) {
      showSuccessModal.value = true;
      const responseInscriptionesUser = await getInscripcionesEquipoByUser(
        parseInt(idUsuarioLogger.value!)
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
.clickable-list-item {
  cursor: pointer;
  transition: background 0.2s;
}
.clickable-list-item:hover {
  background: rgba(255, 255, 255, 0.1);
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
</style>
