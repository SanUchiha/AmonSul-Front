<template>
  <!-- Un equipo o pareja como las tarjetas de inscritos: sus datos y, al desplegar, sus miembros -->
  <v-card
    v-ripple
    variant="outlined"
    class="ma-1 pa-3 text-left tarjeta"
    role="button"
    tabindex="0"
    @click="toggleExpand"
    @keydown.enter="toggleExpand"
  >
    <div class="d-flex align-center ga-2">
      <span class="text-body-1 font-weight-bold flex-grow-1 texto-largo">{{ equipo.nombreEquipo }}</span>
      <!-- Lo que suma el equipo por sus miembros: en la cabecera, para que al aparecer no mueva los botones -->
      <v-chip v-if="puntosExtraEquipo !== 0" size="x-small" variant="tonal" class="flex-shrink-0">
        {{ puntosExtraEquipo > 0 ? "+" : "" }}{{ puntosExtraEquipo }} {{ Math.abs(puntosExtraEquipo) === 1 ? "punto extra" : "puntos extra" }}
      </v-chip>
      <v-menu>
        <template #activator="{ props: menuProps }">
          <v-btn
            icon="mdi-dots-vertical"
            variant="text"
            size="small"
            density="comfortable"
            aria-label="Más acciones"
            v-bind="menuProps"
            @click.stop
          />
        </template>
        <v-list density="compact">
          <v-list-item
            prepend-icon="mdi-trash-can"
            base-color="error"
            :title="esParejas ? 'Borrar pareja' : 'Borrar equipo'"
            @click="
              abrirModalConfirmacion(
                esParejas ? '¿Deseas borrar la pareja?' : '¿Deseas borrar el equipo?',
                'Esta acción no se puede deshacer.',
                confirmarEliminarEquipo
              )
            "
          />
        </v-list>
      </v-menu>
    </div>
    <div class="text-caption text-medium-emphasis">
      Capitán: {{ equipo.nickCapitan }}
      <template v-if="equipo.fechaInscripcion"> · Inscrito {{ convertirFecha(equipo.fechaInscripcion) }}</template>
    </div>
    <!-- El correo del capitán como texto: pulsarlo despliega los miembros; se le escribe desde su menú de miembro -->
    <div v-if="equipo.emailCapitan" class="text-caption text-medium-emphasis texto-largo">
      {{ equipo.emailCapitan }}
    </div>
    <div class="d-flex align-center ga-2">
      <div class="text-body-2 flex-grow-1">
        <!-- Cada parte entera: junto al interruptor, si no cabe, salta de línea por el punto -->
        <span
          class="text-no-wrap"
          :class="inscripcionesEquipo.length < numeroMiembrosEquipo ? 'text-warning' : 'text-medium-emphasis'"
        >
          {{ inscripcionesEquipo.length }}/{{ numeroMiembrosEquipo }} jugadores
        </span>
        <span class="text-medium-emphasis"> · </span>
        <span class="text-no-wrap" :class="equipoIncompleto ? 'text-warning' : 'text-success'">
          {{ listasOk }}/{{ listasNecesarias }} {{ esListaConjunta ? "lista conjunta validada" : "listas validadas" }}
        </span>
      </div>
      <!-- El pago es del equipo: se cambia en todos sus miembros y se avisa al capitán -->
      <InterruptorPago :esPago="equipo.esPago" :idEquipo="equipo.idEquipo" @cambiado="pagoCambiado" />
    </div>
    <div class="text-caption text-medium-emphasis mt-1">
      {{ isExpanded ? "Ocultar miembros" : "Ver miembros" }}
      <v-icon size="small" :icon="isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
    </div>

    <!-- Los miembros: cada uno con su correo, su lista y sus acciones -->
    <v-expand-transition>
      <div v-if="isExpanded" @click.stop>
        <template v-for="(item, index) in equipoConHuecos" :key="item?.idInscripcion ?? `hueco-${index}`">
          <v-card v-if="item" variant="tonal" class="pa-2 mt-2">
            <div class="d-flex align-center ga-2">
              <span class="text-body-2 font-weight-bold flex-grow-1 texto-largo">
                {{ item.nick || "Desconocido" }}
                <span v-if="item.idUsuario === equipo.idCapitan" class="font-weight-regular text-medium-emphasis">
                  (capitán)
                </span>
              </span>
              <!-- Puntos extra: suman en su clasificación y en la del equipo -->
              <PuntosExtra
                :inscripcion="item"
                @cambiado="(idUsuario, puntos) => emit('puntos-extra', idUsuario, puntos)"
              />
              <v-menu v-model="isOpenMenuAcciones[item.idInscripcion]">
                <template #activator="{ props: menuProps }">
                  <v-btn
                    icon="mdi-dots-vertical"
                    variant="text"
                    size="small"
                    density="comfortable"
                    aria-label="Acciones del jugador"
                    v-bind="menuProps"
                  />
                </template>
                <v-list density="compact">
                  <v-list-item
                    v-if="item.email"
                    prepend-icon="mdi-email-outline"
                    title="Escribir correo"
                    :href="`mailto:${item.email}`"
                  />
                  <v-list-item
                    v-if="item.idLista"
                    prepend-icon="mdi-eye"
                    title="Ver lista"
                    @click="verLista(item.idLista, item.nick, item.ejercito)"
                  />
                  <v-list-item
                    v-if="item.idLista"
                    prepend-icon="mdi-refresh"
                    title="Cambiar estado"
                    @click="cambiarEstadoLista(item.idInscripcion!, item.estadoLista, item.nick)"
                  />
                  <!-- Con lista conjunta solo se envía en la inscripción que la guarda -->
                  <v-list-item
                    v-if="!esListaConjunta || item.idInscripcion === idInscripcionListaPareja"
                    prepend-icon="mdi-pencil"
                    :title="item.listaData ? 'Modificar lista' : 'Enviar lista'"
                    @click="enviarCambiarLista(item.idInscripcion, item.listaData!, item.idUsuario, item.nick, item.idLista)"
                  />
                  <v-divider class="my-1" />
                  <v-list-item
                    prepend-icon="mdi-account-remove"
                    base-color="error"
                    :title="esParejas ? 'Quitar de la pareja' : 'Quitar del equipo'"
                    @click="
                      abrirModalConfirmacion(
                        esParejas ? `¿Quitar a ${item.nick} de la pareja?` : `¿Quitar a ${item.nick} del equipo?`,
                        'Se borran su inscripción y su lista en este torneo. Esta acción no se puede deshacer.',
                        () => eliminarMiembro(item.idInscripcion)
                      )
                    "
                  />
                </v-list>
              </v-menu>
            </div>
            <!-- Como en el resto de tarjetas, el correo es texto; se le escribe desde su menú -->
            <div v-if="item.email" class="text-caption text-medium-emphasis texto-largo">{{ item.email }}</div>
            <div class="text-body-2">
              <span v-if="item.ejercito" class="text-medium-emphasis">{{ item.ejercito }} · </span>
              <span :class="`text-${estadoLista(item.estadoLista).color}`">
                {{ estadoLista(item.estadoLista).texto }}
              </span>
              <span v-if="bandoLista(item.bando)" class="text-medium-emphasis text-no-wrap">
                · {{ bandoLista(item.bando)!.texto }}
              </span>
            </div>
            <div v-if="item.fechaEntregaLista" class="text-caption text-medium-emphasis">
              Lista {{ formatFechaSpaWhitoutAsync(item.fechaEntregaLista) }}
            </div>
          </v-card>

          <!-- Hueco libre: se puede completar -->
          <v-card v-else variant="tonal" class="pa-2 mt-2 d-flex align-center ga-2">
            <span class="text-body-2 text-warning flex-grow-1">Hueco libre</span>
            <v-btn size="small" variant="tonal" class="text-none" @click="handlerModalRegistrarMiembroEquipo()">
              Añadir jugador
            </v-btn>
          </v-card>
        </template>
      </div>
    </v-expand-transition>
  </v-card>

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
    :isVisible="showSuccessModalEliminarEquipo"
    :message="esParejas ? 'Pareja eliminada.' : 'Equipo eliminado.'"
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
import { bandoLista, estadoLista } from "@/utils/estadoLista";
import {
  convertirFecha,
  obtenerFechaActual,
  formatFechaSpaWhitoutAsync,
} from "@/utils/Fecha";
import {
  eliminarEquipoAsync,
  eliminarMiembroEquipoAsync,
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
import PuntosExtra from "@/components/GestionTorneos/PuntosExtra.vue";
import InterruptorPago from "@/components/GestionTorneos/InterruptorPago.vue";

const props = defineProps<{ equipo: EquipoDTO; torneo: Torneo }>();

const isOpenMenuAcciones = ref<{ [id: number]: boolean }>({});
const isExpanded = ref<boolean>(false);
const isLoading = ref<boolean>(false);
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
const pagoCambiado = (nuevo: "SI" | "NO") => {
  esPago.value = nuevo;
};

const emit = defineEmits<{
  (e: "delete-team"): void;
  (e: "puntos-extra", idUsuario: number, puntosExtra: number): void;
}>();

// Los de todos sus miembros: es lo que suma el equipo en la clasificación
const puntosExtraEquipo = computed(() =>
  inscripcionesEquipo.value.reduce((total, i) => total + (i.puntosExtra ?? 0), 0)
);

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
const esParejas = computed(() => props.torneo.tipoTorneo === "Parejas");
const esListaConjunta = computed(
  () => esParejas.value && props.torneo.listaPorPareja === true
);
// La lista conjunta va en la inscripción del capitán, o en la que ya la tenga
const idInscripcionListaPareja = computed(
  () =>
    (
      inscripcionesEquipo.value.find((i) => i.idLista) ??
      inscripcionesEquipo.value.find((i) => i.idUsuario === props.equipo.idCapitan)
    )?.idInscripcion
);
const listasNecesarias = computed(() =>
  esListaConjunta.value ? 1 : numeroMiembrosEquipo.value
);
const listasOk = computed(() => {
  if (esListaConjunta.value)
    return inscripcionesEquipo.value.some(
      (i) =>
        i.idInscripcion === idInscripcionListaPareja.value &&
        i.estadoLista === "OK"
    )
      ? 1
      : 0;
  return inscripcionesEquipo.value.filter((i) => i.estadoLista === "OK").length;
});
const equipoIncompleto = computed(() => {
  return listasOk.value < listasNecesarias.value;
});

const miembrosPorTipo: Record<string, number> = {
  Individual: 1,
  Parejas: 2,
  Equipos_2: 2,
  Equipos_4: 4,
  Equipos_6: 6,
};
numeroMiembrosEquipo.value =
  miembrosPorTipo[props.torneo.tipoTorneo ?? "Individual"] || 1;

const verLista = async (idLista: number, nombre: string, ejercito: string) => {
  isLoading.value = true;
  try {
    const responseLista = await getListaById(idLista);
    const listaJugadorDTO: ListaJugador = {
      listaData: responseLista.data.listaData,
      nick: nombre,
      nombreEjercito: ejercito,
    };
    listaJugador.value = listaJugadorDTO;
    showVerListaModal.value = true;
  } catch (error) {
    // axios lanza en respuestas no 2xx; sin esto el spinner persistente se quedaba abierto
    console.error("Error al cargar la lista:", error);
    showErrorModal.value = true;
  } finally {
    isLoading.value = false;
  }
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

    if (esModificacion && !miembro.idLista) {
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
.tarjeta {
  cursor: pointer;
}
.texto-largo {
  overflow-wrap: anywhere;
}
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
