<template>
  <div class="card-equipo" @click="toggleExpand">
    <v-card
      elevation="15"
      class="ma-2 pa-3"
      :class="{
        'border-warning': equipoIncompleto,
        'border-green': esPago === 'SI' && !equipoIncompleto,
      }"
    >
      <v-row class="align-center">
        <!-- Avatar + Nombre del equipo + Estado de Pago -->
        <v-col cols="12" sm="5" class="d-flex align-center justify-start">
          <v-avatar size="40">
            <img
              src="@/assets/icons/equipos.png"
              alt="Equipo"
              width="40"
              height="40"
            />
          </v-avatar>
          <div class="ms-2">
            <div class="d-flex align-center">
              <span class="text-subtitle-1 font-weight-bold ringbearer">
                {{ equipo.nombreEquipo }}
              </span>
              <v-spacer class="d-none d-sm-flex" />
              <span class="ms-2 text-caption text-grey-lighten-1">
                {{ inscripcionesEquipo.length }}/{{
                  numeroMiembrosEquipo
                }}
                jugadores <br />
                {{ listasOk }}/{{ numeroMiembrosEquipo }} listas OK
              </span>
            </div>
            <div class="d-flex align-center">
              <v-chip
                class="mt-1"
                :color="equipo.esPago === 'SI' ? 'green' : 'red'"
                variant="tonal"
                x-small
              >
                <v-icon size="16" class="me-1">mdi-cash</v-icon>
                Pago: {{ equipo.esPago }}
              </v-chip>
            </div>
            <div
              v-if="equipoIncompleto"
              class="text-red text-caption mt-1 d-flex align-center"
            >
              <v-icon size="16" class="me-1">mdi-alert-circle</v-icon>
              ATENCIÓN: Faltan listas por validar
            </div>
          </div>
        </v-col>

        <!-- Datos del Capitán con iconos -->
        <v-col cols="12" sm="4" class="text-caption text-md-left text-center">
          <div class="d-flex align-center">
            <v-icon size="18" class="me-1">mdi-account-star</v-icon>
            {{ equipo.nickCapitan }}
          </div>
          <div class="d-flex align-center">
            <v-icon size="18" class="me-1">mdi-email</v-icon>
            <a
              :href="`mailto:${equipo.emailCapitan}`"
              class="text-decoration-none"
              target="_blank"
            >
              {{ equipo.emailCapitan }}
            </a>
          </div>
          <div class="d-flex align-center">
            <v-icon size="18" class="me-1">mdi-calendar</v-icon>
            {{ convertirFecha(equipo.fechaInscripcion!) }}
          </div>
        </v-col>

        <!-- Botones -->
        <v-col
          cols="12"
          sm="3"
          class="d-flex flex-column align-end justify-center mt-2 mt-sm-0"
        >
          <v-btn
            v-show="equipo.esPago === 'NO'"
            variant="tonal"
            color="warning"
            size="small"
            class="mb-1"
            @click.stop="
              () =>
                abrirModalConfirmacion(
                  'Marcar equipo como pagado?',
                  '¿Seguro que quieres actualizar el estado de pago a SI?',
                  confirmarActualizarPago
                )
            "
            block
          >
            <v-icon class="me-1">mdi-credit-card-edit</v-icon>
            Modificar Pago
          </v-btn>
          <v-btn
            color="red"
            variant="tonal"
            size="small"
            @click.stop="
              abrirModalConfirmacion(
                '¿Deseas borrar el equipo?',
                'Esta acción no se puede deshacer.',
                confirmarEliminarEquipo
              )
            "
            block
          >
            <v-icon class="me-1">mdi-trash-can</v-icon>
            Borrar equipo
          </v-btn>
        </v-col>
      </v-row>

      <!-- Expand contenido -->
      <v-expand-transition>
        <div v-if="isExpanded" class="mt-4">
          <v-divider class="mb-2" />
          <v-data-table :items="equipoConHuecos" class="styled-table" dense>
            <template v-slot:headers>
              <tr>
                <th class="compact-header text-center">Nombre</th>
                <th class="hide-on-mobile compact-header text-center">
                  Ejército
                </th>
                <th class="compact-header text-center">Lista</th>
                <th class="hide-on-mobile compact-header text-center">
                  Entrega
                </th>
                <th class="compact-header text-center">Acciones</th>
              </tr>
            </template>
            <template v-slot:item="{ item }">
              <tr v-if="item">
                <td class="compact-cell text-left">
                  <!-- Avatar -->
                  <v-avatar size="40" class="hide-on-mobile">
                    <img
                      src="@/assets/icons/teamLeader.png"
                      v-if="item.idUsuario === equipo.idCapitan"
                      alt="Capitan"
                      width="45"
                      height="45"
                    />
                    <img
                      src="@/assets/icons/verdetalle.png"
                      v-else
                      alt="Participante"
                      width="40"
                      height="40"
                    />
                  </v-avatar>
                  <!-- Nick -->
                  &nbsp;{{ item.nick || "Desconocido" }}
                </td>
                <!-- ejercito -->
                <td class="hide-on-mobile compact-cell">
                  {{ item.ejercito || "No asignado" }}
                </td>
                <!-- estado lista -->
                <td class="compact-cell">
                  <v-chip
                    :color="
                      item.estadoLista === 'OK'
                        ? 'green'
                        : item.estadoLista === 'ENTREGADA'
                        ? 'yellow'
                        : 'red'
                    "
                    variant="tonal"
                  >
                    {{ item.estadoLista }}
                  </v-chip>
                </td>
                <!-- fecha entrega -->
                <td class="hide-on-mobile compact-cell">
                  {{
                    formatFechaSpaWhitoutAsync(item.fechaEntregaLista) || "N/A"
                  }}
                </td>
                <!-- menu acciones -->
                <td class="compact-cell">
                  <v-menu
                    v-model="isOpenMenuAcciones[item.idInscripcion]"
                    offset-y
                  >
                    <template v-slot:activator="{ props }">
                      <v-btn color="primary" variant="tonal" v-bind="props">
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <!-- lista acciones -->
                    <v-list>
                      <v-list-item
                        v-if="item.idLista"
                        @click.stop="
                          verLista(item.idLista, item.nick, item.ejercito);
                          isOpenMenuAcciones[item.idInscripcion] = false;
                        "
                      >
                        <v-list-item-title>
                          <v-icon class="me-2">mdi-eye</v-icon> Ver Lista
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item
                        v-if="item.idLista"
                        @click.stop="
                          cambiarEstadoLista(
                            item.idInscripcion!,
                            item.estadoLista,
                            item.nick
                          );
                          isOpenMenuAcciones[item.idInscripcion] = false;
                        "
                      >
                        <v-list-item-title>
                          <v-icon class="me-2">mdi-refresh</v-icon> Cambiar
                          Estado
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item
                        @click.stop="
                          enviarCambiarLista(
                            item.idInscripcion,
                            item.listaData!,
                            item.idUsuario,
                            item.nick,
                            item.idLista
                          );
                          isOpenMenuAcciones[item.idInscripcion] = false;
                        "
                      >
                        <v-list-item-title>
                          <v-icon class="me-2">mdi-pencil</v-icon>
                          <span v-if="item.listaData">Modificar lista</span>
                          <span v-else>Enviar lista</span>
                        </v-list-item-title>
                      </v-list-item>
                      <v-divider class="my-2" />
                      <v-list-item
                        @click.stop="
                          eliminarMiembro(item.idInscripcion);
                          isOpenMenuAcciones[item.idInscripcion] = false;
                        "
                      >
                        <v-list-item-title>
                          <v-icon color="red" class="me-2"
                            >mdi-account-remove</v-icon
                          >
                          Eliminar del equipo
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </td>
              </tr>

              <!-- Fila vacía con botón de añadir -->
              <tr v-else>
                <td :colspan="5" class="text-center py-4">
                  <v-btn
                    color="primary"
                    variant="tonal"
                    size="small"
                    @click.stop="handlerModalRegistrarMiembroEquipo()"
                  >
                    <v-icon class="me-1">mdi-account-plus</v-icon>
                    Añadir jugador
                  </v-btn>
                </td>
              </tr>
            </template>
          </v-data-table>
        </div>
      </v-expand-transition>
    </v-card>
  </div>

  <!-- Modales de respuesta a la subida de la lista -->
  <ModalCambiarEstadoListaEquipos
    v-if="showCambiarEstadoLista"
    :key="currentInscripcionId"
    v-model:isVisible="showCambiarEstadoLista"
    :idInscripcion="currentInscripcionId!"
    :estado-lista="currentEstadoLista!"
    :nick="currentNick!"
    @updateInscripcion="cambiarEstado"
  />

  <!-- Modal ver lista -->
  <ModalVerLista
    v-model:isVisible="showVerListaModal"
    :listaJugador="listaJugador!"
  />
  <!-- Modal enviar cambiar lista -->
  <ModalEnviarLista
    v-if="showEnviarCambiarListaModal"
    :key="currentInscripcionId"
    v-model:isVisible="showEnviarCambiarListaModal"
    :idInscripcion="currentInscripcionId!"
    :idUsuario="currentUsuarioId!"
    :idTorneo="currentTorneoId!"
    :emailOrganizador="currentEmailOrganziador!"
    :nick="currentNick!"
    :hasLista="hasLista"
    @enviarLista="guardarLista"
    @modificarLista="guardarLista"
  />

  <!-- Modales de respuesta a la subida de la lista -->
  <ModalSuccess
    :isVisible="showSuccessModalLista"
    message="Lista enviada con éxito."
    @update:isVisible="showSuccessModalLista = $event"
  />

  <!-- Modal response estado pago -->
  <ModalSuccess
    :isVisible="showSuccessModalPago"
    message="Estado del pago actualizado."
    @update:isVisible="showSuccessModalPago = $event"
  />

  <!-- Modal response estado pago -->
  <ModalSuccess
    :isVisible="showSuccessModalEliminarEquipo"
    message="Equipo eliminado."
    @update:isVisible="showSuccessModalEliminarEquipo = $event"
  />

  <!-- Modal response si error -->
  <ModalError
    :isVisible="showErrorModal"
    message="No se ha podido actualizar la inscripción. Contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />

  <!-- Modales de respuesta a la eliminarcion de un miembro del equipo -->
  <ModalSuccess
    :isVisible="showSuccessModalEliminarMiembroEquipo"
    message="Miembro eliminado con éxito."
    @update:isVisible="showSuccessModalLista = $event"
  />

  <ModalError
    :isVisible="showErrorModalEliminarMiembroEquipo"
    message="No se ha podido eliminar al miembro del equipo. Inténtelo de nuevo y si el error persiste contacta con el administrador."
    @update:isVisible="showErrorModalLista = $event"
  />

  <!-- Modal añadir miembro al equipo -->
  <ModalAddMiembroEquipo
    v-model:isVisible="showModalRegistrarMiembroEquipo"
    :idEquipo="equipo.idEquipo"
    :idTorneo="torneo.idTorneo!"
    :jugadores="jugadoresSinEquipo"
    @close="closeModal"
    @confirm="closeConfigModal"
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

  <v-dialog v-model="isCargandoAccion" persistent width="250" hide-overlay>
    <v-card
      class="d-flex flex-column justify-center align-center pa-4"
      height="180"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="50"
        class="mb-4"
      ></v-progress-circular>
      <div class="text-subtitle-1 text-center">{{ mensajeCarga }}</div>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showConfirmModal" max-width="400">
    <v-card>
      <v-card-title class="text-h6">{{ confirmTitle }}</v-card-title>
      <v-card-text>{{ confirmText }}</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="grey" variant="text" @click="showConfirmModal = false">
          Cancelar
        </v-btn>
        <v-btn color="primary" variant="tonal" @click="confirmAction?.()">
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, defineEmits, toRef } from "vue";
import { defineProps } from "vue";
import type { EquipoDTO, InscripcionTorneoDTO } from "@/interfaces/Inscripcion";
import {
  convertirFecha,
  obtenerFechaActual,
  formatFechaSpaWhitoutAsync,
} from "@/utils/Fecha";
import {
  eliminarEquipoAsync,
  eliminarMiembroEquipoAsync,
  updateEstadoPagoEquipo,
} from "@/services/InscripcionesService";
import ModalSuccess from "@/components/Commons/ModalSuccess.vue";
import ModalError from "@/components/Commons/ModalError.vue";
import {
  CrearListaTorneoRequestDTO,
  ListaJugador,
  ModificarListaTorneoRequestDTO,
  RequesListaDTO,
} from "@/interfaces/Lista";
import ModalVerLista from "@/components/Inscripcion/ModalVerLista.vue";
import ModalEnviarLista from "@/components/Inscripcion/ModalEnviarLista.vue";
import {
  getListaById,
  modificarListaTorneo,
  subirListaTorneo,
} from "@/services/ListasService";
import { Torneo } from "@/interfaces/Torneo";
import ModalCambiarEstadoListaEquipos from "./ModalCambiarEstadoListaEquipos.vue";
import { getUsuariosNoInscritosTorneoAsync } from "@/services/UsuariosService";
import { UsuarioSinEquipoDTO } from "@/interfaces/Usuario";
import ModalAddMiembroEquipo from "@/components/GestionTorneos/Equipos/ModalAddMiembroEquipo.vue";

const props = defineProps<{ equipo: EquipoDTO; torneo: Torneo }>();

const isOpenMenuAcciones = ref<{ [id: number]: boolean }>({});
const isExpanded = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const showSuccessModalPago = ref<boolean>(false);
const showSuccessModalEliminarEquipo = ref<boolean>(false);
const showVerListaModal = ref<boolean>(false);
const showEnviarCambiarListaModal = ref<boolean>(false);
const showCambiarEstadoLista = ref<boolean>(false);
const showSuccessModalLista = ref<boolean>(false);
const showErrorModalLista = ref<boolean>(false);
const showModalRegistrarMiembroEquipo = ref<boolean>(false);
const showErrorModalEliminarMiembroEquipo = ref<boolean>(false);
const showSuccessModalEliminarMiembroEquipo = ref<boolean>(false);
const showConfirmModal = ref(false);
const confirmAction = ref<() => void>();
const confirmTitle = ref("¿Estás seguro?");
const confirmText = ref("Esta acción no se puede deshacer.");
const currentInscripcionId = ref<number>();
const currentIdLista = ref<number>(0);
const currentUsuarioId = ref<number>();
const currentEmailOrganziador = ref<string>();
const currentNick = ref<string>();
const currentTorneoId = ref<number>();
const currentEstadoLista = ref<string>();
const hasLista = ref<boolean>(false);
const listaJugador = ref<ListaJugador>();
const jugadoresSinEquipo = ref<UsuarioSinEquipoDTO[]>([]);
const inscripcionesEquipo = ref<InscripcionTorneoDTO[]>([
  ...props.equipo.inscripciones,
]);
const esPago = toRef(props.equipo, "esPago");

const emit = defineEmits<{
  (e: "delete-team"): void;
}>();

//Spiner
const isCargandoAccion = ref(false);
const mensajeCarga = ref("Cargando...");

const showErrorModal = ref<boolean>(false);
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const numeroMiembrosEquipo = ref<number>(0);
const equipoConHuecos = computed(() => {
  const miembros = inscripcionesEquipo.value ?? [];
  const faltantes = Math.max(
    0,
    (numeroMiembrosEquipo.value ?? 0) - miembros.length
  );
  return [...miembros, ...Array(faltantes).fill(null)];
});
const listasOk = computed(() => {
  return inscripcionesEquipo.value.filter((i) => i.estadoLista === "OK").length;
});
const equipoIncompleto = computed(() => {
  return listasOk.value < numeroMiembrosEquipo.value;
});

const miembrosPorTipo: Record<string, number> = {
  Individual: 1,
  Parejas: 2,
  Equipos_4: 4,
  Equipos_6: 6,
};
numeroMiembrosEquipo.value =
  miembrosPorTipo[props.torneo.tipoTorneo ?? "Individual"] || 1;

const verLista = async (idLista: number, nombre: string, ejercito: string) => {
  isLoading.value = true;
  const responseLista = await getListaById(idLista);
  if (responseLista.status !== 200) {
    isLoading.value = false;
    showErrorModal.value = true;
    return;
  }
  isLoading.value = false;
  const listaJugadorDTO: ListaJugador = {
    listaData: responseLista.data.listaData,
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
  nick: string,
  idLista: number
) => {
  currentInscripcionId.value = idInscripcion;
  currentUsuarioId.value = idUsuario;
  currentNick.value = nick;
  currentIdLista.value = idLista;
  if (!listaData) hasLista.value = false;
  else hasLista.value = true;

  showEnviarCambiarListaModal.value = true;
};

const guardarLista = async (newLista: RequesListaDTO) => {
  isCargandoAccion.value = true;
  const miembroIndex = inscripcionesEquipo.value.findIndex(
    (m) => m.idInscripcion === currentInscripcionId.value
  );

  if (miembroIndex === -1) {
    isCargandoAccion.value = false;
    showErrorModalLista.value = true;
    return;
  }

  const miembro = inscripcionesEquipo.value[miembroIndex];

  const esModificacion = !!miembro.idLista;

  try {
    let nuevoIdLista = miembro.idLista;

    if (!currentInscripcionId.value) {
      console.error('ID de inscripción no disponible');
      return;
    }

    if (!miembro.idLista) {
      console.error('ID de lista no disponible para modificación');
      return;
    }

    if (esModificacion) {
      mensajeCarga.value = "Modificando lista...";

      const requestLista: ModificarListaTorneoRequestDTO = {
        idInscripcion: currentInscripcionId.value ,
        idLista: miembro.idLista,
        listaData: newLista.listaData,
        ejercito: newLista.ejercito,
        idUsuario: newLista.idUsuario,
        idTorneo: props.torneo.idTorneo,
      };

      await modificarListaTorneo(requestLista);
    } else {
      mensajeCarga.value = "Enviando lista...";

      const requestLista: CrearListaTorneoRequestDTO = {
        idInscripcion: currentInscripcionId.value,
        listaData: newLista.listaData,
        ejercito: newLista.ejercito,
        idUsuario: newLista.idUsuario,
        idTorneo: props.torneo.idTorneo,
        nick: newLista.nick,
        nombreEquipo: props.equipo.nombreEquipo ?? "Sin nombre",
      };

      const response = await subirListaTorneo(requestLista);
      nuevoIdLista = response.data?.idLista;
    }

    // Reemplazo reactivo del objeto completo
    inscripcionesEquipo.value[miembroIndex] = {
      ...miembro,
      estadoLista: "ENTREGADA",
      listaData: newLista.listaData,
      ejercito: newLista.ejercito.name,
      idLista: nuevoIdLista,
      fechaEntregaLista: obtenerFechaActual(),
    };

    showSuccessModalLista.value = true;
  } catch (error) {
    console.error("Error al guardar/modificar lista:", error);
    showErrorModalLista.value = true;
  } finally {
    isCargandoAccion.value = false;
  }
};

const cambiarEstadoLista = (
  idInscripcion: number,
  estadoLista: string,
  nick: string
) => {
  currentInscripcionId.value = idInscripcion;
  currentNick.value = nick;
  currentEstadoLista.value = estadoLista;
  showCambiarEstadoLista.value = true;
};
const cambiarEstado = (payload: {
  field: keyof InscripcionTorneoDTO;
  value: unknown;
}) => {
  const { field, value } = payload;

  const index = inscripcionesEquipo.value.findIndex(
    (i) => i.idInscripcion === currentInscripcionId.value
  );

  if (index !== -1) {
    // Aseguramos reactividad reemplazando el objeto completo
    inscripcionesEquipo.value[index] = {
      ...inscripcionesEquipo.value[index],
      [field]: value,
    };
  }
};

const abrirModalConfirmacion = (
  titulo: string,
  texto: string,
  accion: () => void
) => {
  confirmTitle.value = titulo;
  confirmText.value = texto;
  confirmAction.value = () => {
    showConfirmModal.value = false;
    accion();
  };
  showConfirmModal.value = true;
};

const confirmarActualizarPago = async () => {
  isLoading.value = true;
  try {
    const response = await updateEstadoPagoEquipo({
      idEquipo: props.equipo.idEquipo,
      esPago: "SI",
    });
    if (response.status >= 200 && response.status < 300) {
      showSuccessModalPago.value = true;
      esPago.value = "SI";
    } else {
      console.error("error:", response);
      showErrorModal.value = true;
    }

    showSuccessModalPago.value = true;
    isLoading.value = false;
  } catch (error) {
    console.error("error:", error);
    showErrorModal.value = true;
    isLoading.value = false;
  } finally {
    isLoading.value = false;
  }
};

const confirmarEliminarEquipo = async () => {
  isLoading.value = true;
  try {
    const response = await eliminarEquipoAsync(props.equipo.idEquipo);

    if (response.status >= 200 && response.status < 300) {
      showSuccessModalEliminarEquipo.value = true;
      emit("delete-team");
    } else {
      showErrorModal.value = true;
    }
  } catch (error) {
    console.error("Error al eliminar el equipo:", error);
    showErrorModal.value = true;
    isLoading.value = false;
  } finally {
    isLoading.value = false;
  }
};

const handlerModalRegistrarMiembroEquipo = async () => {
  const responseJugadores = await getUsuariosNoInscritosTorneoAsync(
    props.torneo.idTorneo
  );
  jugadoresSinEquipo.value = (responseJugadores?.data ?? []).sort(
    (a: { nick: string }, b: { nick: string }) => a.nick.localeCompare(b.nick)
  );
  showModalRegistrarMiembroEquipo.value = true;
};

const closeModal = () => {
  showModalRegistrarMiembroEquipo.value = false;
};
const closeConfigModal = (nuevoMiembro: InscripcionTorneoDTO) => {
  if (nuevoMiembro) {
    if (
      !inscripcionesEquipo.value.some(
        (m) => m.idUsuario === nuevoMiembro.idUsuario
      )
    ) {
      inscripcionesEquipo.value.push(nuevoMiembro);
    }
  }
};

const eliminarMiembro = async (idInscripcion: number) => {
  isCargandoAccion.value = true;
  mensajeCarga.value = "Eliminando jugador...";
  try {
    const response = await eliminarMiembroEquipoAsync(idInscripcion);
    if (
      (response.status < 200 && response.status >= 300) ||
      response.data === false
    ) {
      isCargandoAccion.value = false;
      showErrorModalEliminarMiembroEquipo.value = true;
      return;
    }

    inscripcionesEquipo.value = inscripcionesEquipo.value.filter(
      (miembro) => miembro.idInscripcion !== idInscripcion
    );

    showSuccessModalEliminarMiembroEquipo.value = true;
  } catch (error) {
    console.error("Error al borrar un miembro: ", error);
    showErrorModalEliminarMiembroEquipo.value = true;
  } finally {
    isCargandoAccion.value = false;
  }
};
</script>

<style scoped>
@media (max-width: 600px) {
  .hide-on-mobile {
    display: none;
  }
}
.styled-table {
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  font-size: 12px; /* Reduce el tamaño de fuente general */
}

/* Reducir padding y espacio en las celdas */
.compact-header,
.compact-cell,
.compact-actions {
  padding: 4px !important;
  font-size: 12px;
}

/* Compactar botones */
.compact-actions .v-btn {
  min-width: 24px !important;
  padding: 2px 6px !important;
}

/* Animación de expansión */
.expand-enter-active,
.expand-leave-active {
  transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

/**Estilo de la card cuando faltan listas por enviar OK */
.border-warning {
  border: 2px solid #ffa726; /* naranja */
}
.border-green {
  border: 2px solid green; /* verde */
}
</style>
