<template>
  <div v-if="isLoading" class="center">
    <LoadingGandalf />
  </div>
  <div v-else class="center">
    <v-dialog v-model="show" max-width="800">
      <v-card elevation="8" class="rounded-modal pa-3">
        <v-card-title
          class="modal-title d-flex align-center justify-space-between px-4 py-3"
        >
          <h3 class="text-h5 font-weight-bold">Detalle de la Inscripción</h3>
          <v-btn icon @click="close" class="close-button">
            <v-icon color="grey darken-1">mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <!-- Información del equipo simplificada y adaptada a móvil -->
        <v-card class="info-card pa-4 mt-4 mx-3">
          <v-row>
            <v-col cols="12" sm="6" class="align-center pt-1 pb-1">
              <v-icon color="blue" class="mr-2">mdi-shield-account</v-icon>
              <span class="font-weight-bold">Equipo:</span>
              <span class="ml-2">{{ inscripcionData?.nombreEquipo }}</span>
            </v-col>
            <v-col cols="12" sm="6" class="align-center pt-1 pb-1">
              <v-icon color="amber" class="mr-2">mdi-crown</v-icon>
              <span class="font-weight-bold">Capitán:</span>
              <span class="ml-2">{{
                inscripcionData?.componentesEquipoDTO.find(
                  (c) => c.idUsuario === inscripcionData?.idCapitan
                )?.nick || "Desconocido"
              }}</span>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="6" class="align-center pt-1 pb-1">
              <v-icon color="green" class="mr-2">mdi-calendar</v-icon>
              <span class="font-weight-bold">Fecha:</span>
              <span class="ml-2">{{
                convertirFecha(inscripcionData?.fechaInscripcion!)
              }}</span>
            </v-col>
            <v-col cols="12" sm="6" class="align-center pt-1 pb-1">
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
                {{ inscripcionData?.esPago === "SI" ? "Pagado" : "No pagado" }}
              </v-chip>
            </v-col>
          </v-row>
        </v-card>

        <v-divider class="my-4"></v-divider>

        <h4 class="text-h6 font-weight-bold text-center">
          Miembros del equipo
        </h4>
        <v-container>
          <v-row>
            <v-col v-if="$vuetify.display.xs" cols="12">
              <v-table dense>
                <thead>
                  <tr>
                    <th>Jugador</th>
                    <th>Lista</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="miembro in inscripcionData?.componentesEquipoDTO"
                    :key="miembro.idUsuario"
                  >
                    <td>
                      <v-icon
                        v-if="miembro.idUsuario === inscripcionData?.idCapitan"
                        color="amber darken-2"
                        >mdi-crown</v-icon
                      >
                      {{ miembro.nick }}
                    </td>
                    <td>
                      <span>
                        <v-btn
                          v-if="miembro.listaData"
                          color="primary"
                          variant="tonal"
                          @click="
                            verLista(
                              miembro.listaData,
                              miembro.nick,
                              miembro.ejercito!
                            )
                          "
                        >
                          Ver lista
                        </v-btn>
                        <span v-else>No hay lista</span>
                        <!--TODO  v-if="new Date(torneo!.fechaFinTorneo) >= new Date()"-->
                        <v-btn
                          v-if="inscripcionData?.idCapitan == idUsuario"
                          color="primary"
                          block
                          variant="tonal"
                          class="elevated-btn"
                          @click="
                            enviarCambiarLista(
                              miembro.idInscripcion,
                              miembro.listaData!,
                              miembro.idUsuario,
                              miembro.nick
                            )
                          "
                        >
                          <v-icon left>mdi-mail</v-icon> Enviar/Modificar Lista
                        </v-btn>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-col>
            <v-col
              v-else
              v-for="miembro in inscripcionData?.componentesEquipoDTO"
              :key="miembro.idUsuario"
              cols="12"
              sm="6"
              md="4"
            >
              <v-card class="pa-3 player-card" outlined>
                <v-card-title
                  class="text-body-1 font-weight-bold d-flex align-center"
                >
                  <v-icon
                    v-if="miembro.idUsuario === inscripcionData?.idCapitan"
                    color="amber darken-2"
                    >mdi-crown</v-icon
                  >
                  {{ miembro.nick }}
                </v-card-title>
                <v-card-actions class="justify-center">
                  <span>
                    <v-btn
                      v-if="miembro.listaData"
                      color="primary"
                      variant="tonal"
                      @click="
                        verLista(
                          miembro.listaData,
                          miembro.nick,
                          miembro.ejercito!
                        )
                      "
                    >
                      Ver lista
                    </v-btn>
                    <span v-else><p class="text-center">No hay lista</p></span>
                    <!--TODO  v-if="new Date(torneo!.fechaFinTorneo) >= new Date()"-->
                    <v-btn
                      v-if="inscripcionData?.idCapitan == idUsuario"
                      color="primary"
                      block
                      variant="tonal"
                      class="elevated-btn"
                      @click="
                        enviarCambiarLista(
                          miembro.idInscripcion,
                          miembro.listaData!,
                          miembro.idUsuario,
                          miembro.nick
                        )
                      "
                    >
                      <v-icon left>mdi-mail</v-icon> Enviar / Modificar Lista
                    </v-btn>
                  </span>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-container>

        <v-divider
          class="my-4"
          v-if="inscripcionData?.idCapitan == idUsuario"
        ></v-divider>
        <div
          class="text-center pb-3"
          v-if="inscripcionData?.idCapitan == idUsuario"
        >
          <v-btn
            color="red-darken-3"
            variant="tonal"
            @click="eliminarInscripcion(inscripcionData?.idEquipo!)"
            class="elevated-btn"
            block
          >
            Dar de baja al equipo
          </v-btn>
        </div>
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

  <!-- Modal ver lista -->
  <ModalVerLista
    v-model:isVisible="showVerListaModal"
    :listaJugador="listaJugador!"
  />

  <!-- Modal envair cambiar lista -->
  <ModalEnviarLista
    v-model:isVisible="showEnviarCambiarListaModal"
    :idInscripcion="currentInscripcionId!"
    :idUsuario="currentUsuarioId!"
    :idTorneo="currentTorneoId!"
    :emailOrganizador="currentEmailOrganziador!"
    :nick="currentNick!"
    :hasLista="hasLista"
    @enviarLista="handleEnviarLista"
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
import { InscripcionEquipoDTO } from "@/interfaces/Inscripcion";
import { getInscripcionEquipo } from "@/services/InscripcionesService";
import { useAuth } from "@/composables/useAuth";
import ModalVerLista from "./ModalVerLista.vue";
import ModalEnviarLista from "./ModalEnviarLista.vue";
import { convertirFecha } from "@/utils/Fecha";

import {
  CrearListaTorneoRequestDTO,
  ListaJugador,
  RequesListaDTO,
} from "@/interfaces/Lista";
import { subirListaTorneo } from "@/services/ListasService";

const props = defineProps<{
  idInscripcion: number | null;
  idUsuario: number | null;
  idTorneo: number | null;
  idOrganizador: number | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "eliminar-inscripcion-equipo", idEquipo: number): void;
}>();

const show = ref(true);
const showSuccessModalEliminar = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);
const { getidUsuario } = useAuth();

const idUsuarioLogger = ref<string | null>(getidUsuario.value);
const isLoading = ref(true);
const isRegistering = ref(false);
const isCaptain = ref(false);
const idCaptain = ref<number>();
const inscripcionData = ref<InscripcionEquipoDTO>();
const currentInscripcionId = ref<number>();
const currentUsuarioId = ref<number>();
const currentEmailOrganziador = ref<string>();
const currentNick = ref<string>();
const currentTorneoId = ref<number>();

const showVerListaModal = ref<boolean>(false);
const showEnviarCambiarListaModal = ref<boolean>(false);

const hasLista = ref<boolean>(false);
const showSuccessModalLista = ref<boolean>(false);
const showErrorModalLista = ref<boolean>(false);
const listaJugador = ref<ListaJugador>();

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

const verLista = (listaData: string, nombre: string, ejercito: string) => {
  const listaJugadorDTO: ListaJugador = {
    listaData: listaData,
    nick: nombre,
    nombreEjercito: ejercito,
  };
  listaJugador.value = listaJugadorDTO;
  showVerListaModal.value = true;
};

const enviarCambiarLista = (
  idInscripcion: number | undefined,
  listaData: string,
  idUsuario: number,
  nick: string
) => {
  currentInscripcionId.value = idInscripcion;
  currentUsuarioId.value = idUsuario;
  currentNick.value = nick;
  if (!listaData) hasLista.value = false;
  else hasLista.value = true;

  showEnviarCambiarListaModal.value = true;
};

const eliminarInscripcion = async (idEquipo: number) => {
  emit("eliminar-inscripcion-equipo", idEquipo);
  show.value = false;
  emit("close");
};
const close = () => {
  show.value = false;
  emit("close");
};

const handleEnviarLista = async (newLista: RequesListaDTO) => {
  if (currentInscripcionId.value != null) {
    isRegistering.value = true;
    const requestLista: CrearListaTorneoRequestDTO = {
      idInscripcion: currentInscripcionId.value,
      listaData: newLista.listaData,
      ejercito: newLista.ejercito,
      idUsuario: newLista.idUsuario,
      idTorneo: inscripcionData.value?.idTorneo,
      emailOrganizador: inscripcionData.value?.emailOrganizador,
      nick: newLista.nick,
      nombreEquipo: inscripcionData.value?.nombreEquipo,
    };

    try {
      await subirListaTorneo(requestLista);
      showSuccessModalLista.value = true;

      for (
        let index = 0;
        index < inscripcionData.value!.componentesEquipoDTO.length;
        index++
      ) {
        const element = inscripcionData.value!.componentesEquipoDTO[index];
        if (currentInscripcionId.value == element.idInscripcion)
          element.estadoLista = "ENTREGADA";
      }
    } catch {
      isRegistering.value = false;
      showErrorModalLista.value = true;
    } finally {
      isRegistering.value = false;
      //showVerListaModal.value = false;
    }
  }
};

onMounted(async () => {
  try {
    isLoading.value = true;
    const response = await getInscripcionEquipo(props.idInscripcion!);

    inscripcionData.value = response.data;

    if (inscripcionData.value?.idCapitan == parseInt(idUsuarioLogger.value!)) {
      isCaptain.value = true;
      idCaptain.value = parseInt(idUsuarioLogger.value!);
    }
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
