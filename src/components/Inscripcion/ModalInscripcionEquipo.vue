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
                  inscripcionData?.componentesEquipoDTO.find(
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

            <div v-if="isCaptain">
              <v-list-item>
                <v-list-item-title class="font-weight-bold">
                  Miembros del equipo:
                </v-list-item-title>
                <div class="players-container">
                  <v-card
                    v-for="miembro in inscripcionData?.componentesEquipoDTO"
                    :key="miembro.idUsuario"
                    class="player-card"
                    elevation="2"
                  >
                    <div v-if="idCaptain == miembro.idUsuario">
                      <v-card-title class="player-nick">
                        {{ miembro.nick }} icono Capitan
                      </v-card-title>
                    </div>
                    <div v-else>
                      <v-card-title class="player-nick">
                        {{ miembro.nick }}
                      </v-card-title>
                    </div>

                    <v-card-actions>
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

                      <v-btn
                        color="success"
                        variant="tonal"
                        @click="
                          enviarCambiarLista(
                            miembro.idInscripcion,
                            miembro.listaData!,
                            miembro.idUsuario,
                            miembro.nick
                          )
                        "
                        ><div v-if="!miembro.listaData">Enviar lista</div>
                        <div v-else>Cambiar lista</div>
                      </v-btn>
                    </v-card-actions>
                  </v-card>
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
            </div>

            <div v-else>
              <v-list-item>
                <v-list-item-title class="font-weight-bold">
                  Miembros del equipo:
                </v-list-item-title>
                <div class="players-container">
                  <v-card
                    v-for="miembro in inscripcionData?.componentesEquipoDTO"
                    :key="miembro.idUsuario"
                    class="player-card"
                    elevation="2"
                  >
                    <div v-if="idCaptain == miembro.idUsuario">
                      <v-card-title class="player-nick">
                        {{ miembro.nick }} icono Capitan
                      </v-card-title>
                    </div>
                    <div v-else>
                      <v-card-title class="player-nick">
                        {{ miembro.nick }}
                      </v-card-title>
                    </div>

                    <v-card-actions>
                      <div v-if="miembro.listaData">
                        <v-btn
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
                      </div>
                      <div v-else>No hay lista para este jugador</div>
                    </v-card-actions>
                  </v-card>
                </div>
              </v-list-item>
            </div>
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
  (e: "eliminar-inscripcion", idInscripcion: number): void;
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

const eliminarInscripcion = async (idInscripcion: number) => {
  emit("eliminar-inscripcion", idInscripcion);
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
