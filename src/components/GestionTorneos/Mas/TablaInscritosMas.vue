<template>
  <!-- Tabla inscritos -->

  <!-- Inscritos en tarjetas, como en la gestión de un torneo con una lista -->
  <v-card flat>
    <div class="text-left px-3 pt-3">
      <!-- Justo encima de los inscritos -->
      <v-btn variant="tonal" color="secondary" block class="mb-3" @click="openAddJugadorModal">
        Añadir jugador
      </v-btn>
      <h3 class="text-subtitle-1 font-weight-bold mb-2">Inscritos ({{ reales.length }})</h3>
      <v-text-field
        v-model="search"
        density="compact"
        label="Buscar jugador"
        prepend-inner-icon="mdi-magnify"
        clearable
        hide-details
        class="mb-2"
      />
      <!-- A quién falta reclamarle algo, de un toque -->
      <v-chip-group v-model="filtro" mandatory column selected-class="text-primary" class="mb-1">
        <v-chip value="todos" size="small" filter>Todos ({{ reales.length }})</v-chip>
        <v-chip value="faltanListas" size="small" filter>Faltan listas ({{ faltanListas.length }})</v-chip>
        <v-chip value="sinPagar" size="small" filter>No pagado ({{ sinPagar.length }})</v-chip>
      </v-chip-group>
    </div>

    <div v-if="isLoading && localInscripciones.length === 0" class="text-center pa-4">
      Cargando inscripciones...
    </div>
    <div v-else-if="localInscripciones.length === 0" class="text-center pa-4">
      No hay inscripciones para este torneo
    </div>
    <div v-else-if="visibles.length === 0" class="text-center text-medium-emphasis pa-4">
      Nadie con estos filtros
    </div>
    <v-row v-else dense class="px-2">
      <v-col v-for="item in visibles" :key="item.idInscripcion" cols="12" sm="6" lg="4">
        <!-- Pulsando la tarjeta se despliegan sus listas -->
        <v-card
          v-ripple
          variant="outlined"
          class="pa-3 text-left tarjeta"
          role="button"
          tabindex="0"
          @click="toggleExpand(item.idInscripcion)"
          @keydown.enter="toggleExpand(item.idInscripcion)"
        >
          <div class="d-flex align-center ga-2">
            <span class="text-body-1 font-weight-bold flex-grow-1 texto-largo">{{ item.nick }}</span>
            <!-- Puntos extra: suman en la clasificación -->
            <PuntosExtra
              v-if="!esBye(item)"
              :inscripcion="item"
              @cambiado="(idUsuario, puntos) => emit('puntosExtra', idUsuario, puntos)"
            />
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
                  v-if="item.email"
                  prepend-icon="mdi-email-outline"
                  title="Escribir correo"
                  :href="`mailto:${item.email}`"
                />
                <v-list-item
                  prepend-icon="mdi-delete"
                  base-color="error"
                  title="Eliminar inscripción"
                  @click="borrar = item"
                />
              </v-list>
            </v-menu>
          </div>
          <!-- El correo como texto: pulsarlo despliega las listas como el resto de la tarjeta -->
          <div v-if="item.email" class="text-caption text-medium-emphasis texto-largo">{{ item.email }}</div>
          <div class="d-flex align-center ga-2">
            <div class="text-body-2 flex-grow-1">
              <span :class="`text-${colorListas(item)}`">
                {{ item.countListasEntregadas }}/{{ torneo.torneo.listasPorJugador }} listas entregadas
              </span>
              <template v-if="listasIlegales(item) > 0">
                <span class="text-medium-emphasis"> · </span>
                <span class="text-error">
                  {{ listasIlegales(item) }} {{ listasIlegales(item) === 1 ? "ilegal" : "ilegales" }}
                </span>
              </template>
            </div>
            <InterruptorPago
              :esPago="item.esPago"
              :idInscripcion="item.idInscripcion"
              @cambiado="esPago => handleUpdatePago(item.idInscripcion, esPago)"
            />
          </div>
          <!-- Las fechas, en amarillo si llegaron fuera de plazo -->
          <div class="text-caption text-medium-emphasis">
            <span :class="{ 'text-warning': tarde(item.fechaInscripcion, torneo?.torneo.fechaFinInscripcion) }">
              Inscrito {{ formattedDate(item.fechaInscripcion) }}
            </span>
            <template v-if="item.fechaUltimaEntrega">
              ·
              <span :class="{ 'text-warning': tarde(item.fechaUltimaEntrega, torneo?.torneo.fechaEntregaListas) }">
                Última lista {{ formattedDate(item.fechaUltimaEntrega) }}
              </span>
            </template>
          </div>
          <div class="text-caption text-medium-emphasis mt-1">
            {{ expandedRows[item.idInscripcion] ? "Ocultar listas" : "Ver listas" }}
            <v-icon size="small" :icon="expandedRows[item.idInscripcion] ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
          </div>

          <!-- Sus listas: cada una con su estado, que el organizador puede cambiar, y sus acciones -->
          <v-expand-transition>
            <div v-if="expandedRows[item.idInscripcion]" @click.stop>
              <v-card v-for="n in torneo.torneo.listasPorJugador" :key="n" variant="tonal" class="pa-2 mt-2">
                <div class="text-body-2 font-weight-bold">Lista {{ n }}</div>
                <template v-if="item.lista[n - 1]">
                  <div class="text-body-2">
                    <span v-if="item.lista[n - 1].ejercito" class="text-medium-emphasis">
                      {{ item.lista[n - 1].ejercito }} ·
                    </span>
                    <span :class="`text-${estadoLista(item.lista[n - 1].estadoLista).color}`">
                      {{ estadoLista(item.lista[n - 1].estadoLista).texto }}
                    </span>
                    <span v-if="bandoLista(item.lista[n - 1].bando)" class="text-medium-emphasis text-no-wrap">
                      · {{ bandoLista(item.lista[n - 1].bando)!.texto }}
                    </span>
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    <span :class="{ 'text-warning': tarde(item.lista[n - 1].fechaEntrega, torneo?.torneo.fechaEntregaListas) }">
                      Entregada {{ formattedDate(item.lista[n - 1].fechaEntrega) }}
                    </span>
                  </div>
                  <v-select
                    :items="ESTADOS_LISTA"
                    v-model="item.lista[n - 1].estadoLista"
                    item-title="corto"
                    item-value="valor"
                    label="Estado"
                    density="compact"
                    hide-details
                    class="mt-2"
                    @update:modelValue="
                      (value: string) => updateEstado(item.lista[n - 1].idLista, value, item.idTorneo, item.idUsuario)
                    "
                  />
                  <div class="d-flex ga-1 mt-2">
                    <v-btn size="small" variant="tonal" class="accion text-none" @click="verLista(item.lista[n - 1], item.nick)">
                      Ver lista
                    </v-btn>
                    <v-btn
                      size="small"
                      variant="tonal"
                      class="accion text-none"
                      @click="handleEditLista(item.lista[n - 1], item.idTorneo, item.idUsuario)"
                    >
                      Cambiar lista
                    </v-btn>
                  </div>
                </template>
                <template v-else>
                  <div class="text-body-2 text-warning">Lista sin entregar</div>
                  <div class="d-flex mt-2">
                    <v-btn
                      size="small"
                      variant="tonal"
                      class="accion text-none"
                      @click="handleAddLista(item.idInscripcion, item.idUsuario, item.idTorneo)"
                    >
                      Subir lista
                    </v-btn>
                  </div>
                </template>
              </v-card>
            </div>
          </v-expand-transition>
        </v-card>
      </v-col>
    </v-row>

    <!-- Borrar una inscripción no tiene vuelta atrás: mejor preguntarlo -->
    <v-dialog :model-value="!!borrar" max-width="400" @update:model-value="borrar = null">
      <v-card v-if="borrar">
        <v-card-title class="text-wrap">¿Eliminar la inscripción de {{ borrar.nick }}?</v-card-title>
        <v-card-text>Se borran su inscripción y sus listas en este torneo. Esta acción no se puede deshacer.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="borrar = null">Volver</v-btn>
          <v-btn color="error" variant="flat" @click="confirmarBorrar">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ModalParametrosPrimeraRondaMas
      v-if="torneo.torneo.idTorneo"
      :isVisible="showModalGenerarRonda1"
      :torneo="torneo"
      @close="closeModalGenerarRonda1"
      @confirm="handleConfirmGenerarRonda1"
    />
    <ModalAddJugadorTorneoMas
      :isVisible="showAddJugadorModal"
      :torneo="torneo"
      @close="closeAddJugadorModal"
      @confirm="handleAddJugadorConfirm"
    />
    <ModalSorteo
      :isVisible="showSorteoModal"
      :participantes="nicks"
      @close="closeSorteoModal"
    />
  </v-card>

  <ModalSuccess
    :isVisible="showSuccessModal"
    message="Jugador añadido correctamente."
    @update:isVisible="showSuccessModal = $event"
  />

  <!-- Modal response success subir la lista pago -->
  <ModalSuccess
    :isVisible="showSuccessAddLista"
    message="Lista subida con éxito."
    @update:isVisible="showSuccessAddLista = $event"
  />

  <!-- Modal response success editar lista -->
  <ModalSuccess
    :isVisible="showSuccessEditLista"
    message="Lista modificada con éxito."
    @update:isVisible="showSuccessEditLista = $event"
  />

  <!-- Modal response success eliminar inscripcion -->
  <ModalSuccess
    :isVisible="showSuccessEliminarInscripcion"
    message="Inscripción eliminada con éxito."
    @update:isVisible="showSuccessEliminarInscripcion = $event"
  />

  <!-- Modal response success actualizar estado de una lista -->
  <ModalSuccess
    :isVisible="showSuccessUpdateEstadoLista"
    message="Estado de la lista actualizado con éxito."
    @update:isVisible="showSuccessUpdateEstadoLista = $event"
  />

  <!-- Modal response si error -->
  <ModalError
    :isVisible="showErrorModal"
    message="No se ha podido actualizar la inscripción. Contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />

  <!-- Modal response si error al subir la lista -->
  <ModalError
    :isVisible="showErrorAddLista"
    message="No se ha podido subir la lista. Si el error persiste contacta con el administrador."
    @update:isVisible="showErrorAddLista = $event"
  />

  <!-- Modal response error al actualizar el estado de una lista -->
  <ModalError
    :isVisible="showErrorUpdateEstadoLista"
    message="No se ha podido actualizar el estado de la lista. Si el error persiste contacta con el administrador."
    @update:isVisible="showErrorUpdateEstadoLista = $event"
  />

  <!-- Modal response si error al eliminar inscripcion -->
  <ModalError
    :isVisible="showErrorEliminarInscripcion"
    message="No se ha podido eliminar la inscripción. Si el error persiste contacta con el administrador."
    @update:isVisible="showErrorEliminarInscripcion = $event"
  />

  <!-- Modal response si error al editar una lista -->
  <ModalError
    :isVisible="showErrorEditLista"
    message="No se ha podido cambiar la lista. Si el error persiste contacta con el administrador."
    @update:isVisible="showErrorEditLista = $event"
  />

  <!-- Modal lista -->
  <ModalSubirListaGestionMas
    v-if="currentInscripcionId != undefined && currentInscripcionId != null"
    :isVisible="showModalAddLista"
    :idInscripcion="currentInscripcionId!"
    @update:isVisible="showModalAddLista = $event"
    @enviarLista="handleEnviarLista"
  />

  <!-- Modal modificar lista -->
  <ModalModificarLista
    v-if="currentLista != null && currentLista != undefined"
    :isVisible="showModalEditLista"
    :idLista="currentLista!.idLista!"
    @update:isVisible="showModalEditLista = $event"
    @modificarListaMasDeUna="modificarLista"
  />

  <ModalListaResultadoTorneo
    v-if="showVerListaModal"
    :listaData="listaData"
    :ejercito="currentEjercito"
    :nickJugador="currentNick!"
    @close="showVerListaModal = false"
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
</template>

<script setup lang="ts">
import { esUsuarioBye } from "@/utils/bye";
import { bandoLista, ESTADOS_LISTA, estadoLista } from "@/utils/estadoLista";
import { ref, computed, watch, defineEmits } from "vue";
import { defineProps } from "vue";
import {
  InscripcionTorneoCreadoMasDTO,
  TorneoGestionInfoMasDTO,
} from "@/interfaces/Torneo";
import { getInfoTorneoCreadoMasAsync } from "@/services/TorneosService";
import { ListaDTO } from "@/interfaces/Usuario";
import { cancelarInscripcion } from "@/services/InscripcionesService";
import {
  CrearListaTorneoRequestDTO,
  ModificarListaTorneoRequestDTO,
  RequesListaDTO,
  UpdateEstadoListaMasDTO,
} from "@/interfaces/Lista";
import {
  modificarListaTorneo,
  subirListaTorneo,
  updateEstadoListaMasAsync,
} from "@/services/ListasService";
import ModalError from "@/components/Commons/ModalError.vue";
import ModalSuccess from "@/components/Commons/ModalSuccess.vue";
import ModalAddJugadorTorneoMas from "./ModalAddJugadorTorneoMas.vue";
import ModalSorteo from "../ModalSorteo.vue";
import ModalSubirListaGestionMas from "./ModalSubirListaGestionMas.vue";
import ModalModificarLista from "@/components/Inscripcion/ModalModificarLista.vue";
import ModalListaResultadoTorneo from "@/components/ResultadosTorneos/ModalListaResultadoTorneo.vue";
import ModalParametrosPrimeraRondaMas from "./ModalParametrosPrimeraRondaMas.vue";
import PuntosExtra from "../PuntosExtra.vue";
import InterruptorPago from "../InterruptorPago.vue";

const props = defineProps<{ torneo: TorneoGestionInfoMasDTO }>();
const localInscripciones = ref<InscripcionTorneoCreadoMasDTO[]>([]);
const isLoading = ref<boolean>(true);
const showSorteoModal = ref<boolean>(false);
const showAddJugadorModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);
const localTorneo = ref<TorneoGestionInfoMasDTO>();
const nicks = ref<string[]>();
const showErrorModal = ref<boolean>(false);
const currentInscripcionId = ref<number>();
const currentLista = ref<ListaDTO>();

const currentTorneoId = ref<number>();
const currentNick = ref<string>();
const currentEjercito = ref<string>();

const currentUsuarioId = ref<number>();
const showModalAddLista = ref<boolean>(false);
const showSuccessAddLista = ref<boolean>(false);
const showErrorAddLista = ref<boolean>(false);
const showVerListaModal = ref<boolean>(false);
const showSuccessEliminarInscripcion = ref<boolean>(false);
const showErrorEliminarInscripcion = ref<boolean>(false);
const showSuccessEditLista = ref<boolean>(false);
const showSuccessUpdateEstadoLista = ref<boolean>(false);
const showErrorUpdateEstadoLista = ref<boolean>(false);
const showErrorEditLista = ref<boolean>(false);
const showModalEditLista = ref<boolean>(false);
const listaData = ref<string>("");
const search = ref<string | null>("");
const expandedRows = ref<{ [key: number]: boolean }>({});
const showModalGenerarRonda1 = ref<boolean>(false);

const updateEstado = async (
  idLista: number,
  estado: string,
  idTorneo: number,
  idUsuario: number
) => {
  isLoading.value = true;
  const updateEstadoListaDTO: UpdateEstadoListaMasDTO = {
    idLista: idLista,
    estado: estado,
    idTorneo: idTorneo,
    idUsuario: idUsuario,
  };

  try {
    updateEstadoListaMasAsync(updateEstadoListaDTO);
    showSuccessUpdateEstadoLista.value = true;
  } catch {
    console.error("Error actualizando el estado de la lista");
    showErrorUpdateEstadoLista.value = true;
  } finally {
    isLoading.value = false;
  }
};

const handleAddLista = async (
  idInscripcion: number,
  idUsuario: number,
  idTorneo: number
) => {
  currentTorneoId.value = idTorneo;
  currentUsuarioId.value = idUsuario;
  currentInscripcionId.value = idInscripcion;
  showModalAddLista.value = true;
};

const handleEditLista = async (
  lista: ListaDTO,
  idTorneo: number,
  idUsuario: number
) => {
  currentLista.value = lista;
  currentTorneoId.value = idTorneo;
  currentUsuarioId.value = idUsuario;
  showModalEditLista.value = true;
};

const handleEnviarLista = async (newLista: RequesListaDTO) => {
  if (
    currentInscripcionId.value &&
    currentUsuarioId.value &&
    currentTorneoId.value
  ) {
    isLoading.value = true;
    const requestLista: CrearListaTorneoRequestDTO = {
      idInscripcion: currentInscripcionId.value,
      listaData: newLista.listaData,
      ejercito: newLista.ejercito,
      idUsuario: currentUsuarioId.value,
      idTorneo: currentTorneoId.value,
    };

    try {
      await subirListaTorneo(requestLista);
      showModalAddLista.value = false;
      showSuccessAddLista.value = true;
      refreshTorneo();
    } catch {
      isLoading.value = false;
      showErrorAddLista.value = true;
    } finally {
      isLoading.value = false;
      showModalAddLista.value = false;
    }
  }
};

const modificarLista = async (newLista: RequesListaDTO) => {
  if (
    currentLista.value?.idLista == null ||
    currentLista.value?.idLista == undefined
  ) {
    return;
  }
  isLoading.value = true;
  const requestLista: ModificarListaTorneoRequestDTO = {
    listaData: newLista.listaData,
    idLista: currentLista.value.idLista,
    ejercito: newLista.ejercito,
    idUsuario: currentUsuarioId.value,
    idTorneo: currentTorneoId.value,
  };
  try {
    await modificarListaTorneo(requestLista);
    showSuccessEditLista.value = true;
    refreshTorneo();
  } catch {
    isLoading.value = false;
    showErrorEditLista.value = true;
  } finally {
    isLoading.value = false;
    showModalEditLista.value = false;
  }
};

const handlerModalGenerarRonda1 = async () => {
  showModalGenerarRonda1.value = true;
};

const refreshTorneo = async () => {
  isLoading.value = true;
  try {
    if (props.torneo?.torneo.idTorneo) {
      const responseTorneo = await getInfoTorneoCreadoMasAsync(
        props.torneo?.torneo.idTorneo
      );
      localTorneo.value = responseTorneo.data;
      localInscripciones.value = JSON.parse(
        JSON.stringify(localTorneo.value?.inscripciones)
      );
    }

    emit("cambios", localTorneo.value);
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const openSorteo = async () => {
  isLoading.value = true;
  try {
    // El bye no entra en el sorteo
    nicks.value = localInscripciones.value
      .filter((x) => !esBye(x))
      .map((x) => x.nick)
      .filter((nick): nick is string => nick !== null && nick !== undefined);
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
  showSorteoModal.value = true;
};

const closeSorteoModal = () => {
  showSorteoModal.value = false;
};

const openAddJugadorModal = async () => {
  showAddJugadorModal.value = true;
};

const closeModalGenerarRonda1 = () => {
  showModalGenerarRonda1.value = false;
};

const closeAddJugadorModal = () => {
  showAddJugadorModal.value = false;
};

const handleConfirmGenerarRonda1 = () => {
  closeModalGenerarRonda1();
  recargarPagina();
};

const recargarPagina = () => {
  window.location.reload();
};

const handleAddJugadorConfirm = () => {
  showAddJugadorModal.value = false;
  showSuccessModal.value = false;
  refreshTorneo();
};

watch(
  () => props.torneo?.inscripciones,
  (newInscripciones) => {
    if (newInscripciones) {
      localInscripciones.value = [...newInscripciones];
    }
    isLoading.value = false;
  },
  { immediate: true }
);

watch(
  () => showSuccessModal.value,
  (newValue) => {
    if (!newValue) {
      window.location.reload();
    }
  }
);

const emit = defineEmits(["inscripcionEliminada", "cambios", "puntosExtra"]);

// Generar la ronda 1 y el sorteo se piden desde la tarjeta de gestión, debajo de Descargar listas
defineExpose({ abrirGenerarRonda1: () => handlerModalGenerarRonda1(), abrirSorteo: () => openSorteo() });

// Filtros: a quien le faltan listas (sin entregar o alguna ilegal, que hay que cambiar) y quien no ha pagado, sin
// contar al bye
const filtro = ref<"todos" | "faltanListas" | "sinPagar">("todos");
// Las listas que el organizador ha marcado como ilegales: hay que cambiarlas aunque estén entregadas
const listasIlegales = (item: InscripcionTorneoCreadoMasDTO) =>
  item.lista.filter(l => (l.estadoLista ?? "").toUpperCase() === "ILEGAL").length;
// Rojo si alguna es ilegal, amarillo si faltan por entregar y verde solo con todas entregadas y legales
const colorListas = (item: InscripcionTorneoCreadoMasDTO) => {
  if (listasIlegales(item) > 0) return "error";
  return item.countListasEntregadas >= props.torneo.torneo.listasPorJugador ? "success" : "warning";
};
const esBye = (item: InscripcionTorneoCreadoMasDTO) => esUsuarioBye(item.idUsuario, item.nick);
const reales = computed(() => localInscripciones.value.filter(i => !esBye(i)));
const faltanListas = computed(() =>
  reales.value.filter(
    i => i.countListasEntregadas < props.torneo.torneo.listasPorJugador || listasIlegales(i) > 0
  )
);
const sinPagar = computed(() => reales.value.filter(i => i.esPago !== "SI"));
const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const visibles = computed(() => {
  const base =
    filtro.value === "faltanListas"
      ? faltanListas.value
      : filtro.value === "sinPagar"
        ? sinPagar.value
        : localInscripciones.value;
  const texto = normalizar(search.value ?? "").trim();
  return texto ? base.filter(i => normalizar(i.nick ?? "").includes(texto)) : base;
});
// Fuera de plazo: después de la fecha límite del torneo
const tarde = (fecha?: string | null, limite?: string | null) =>
  !!fecha && !!limite && new Date(fecha) > new Date(limite);

// Borrar una inscripción, tras confirmarlo
const borrar = ref<InscripcionTorneoCreadoMasDTO | null>(null);
const confirmarBorrar = async () => {
  const idInscripcion = borrar.value?.idInscripcion;
  borrar.value = null;
  if (idInscripcion) await handleEliminarInscripcion(idInscripcion);
};

const formattedDate = (date: string | null | undefined) => {
  return date ? new Date(date).toLocaleDateString() : "N/A";
};


const toggleExpand = (id: number) => {
  expandedRows.value[id] = !expandedRows.value[id];
};

const handleUpdatePago = (idInscripcion: number, estado: string) => {
  localInscripciones.value.forEach((i) => {
    if (i.idInscripcion == idInscripcion) {
      i.esPago = estado;
    }
  });
  refreshTorneo();
};

const handleEliminarInscripcion = async (idInscripcion: number) => {
  try {
    const response = await cancelarInscripcion(idInscripcion);

    if (response.request?.status === 200) {
      showSuccessEliminarInscripcion.value = true;
      refreshTorneo();
    }
  } catch {
    showErrorEliminarInscripcion.value = true;
  }
};

const verLista = (lista: ListaDTO, nick: string) => {
  if (lista.listaData) {
    listaData.value = lista.listaData;
    showVerListaModal.value = true;
    currentNick.value = nick;
    currentEjercito.value = lista.ejercito;
  } else {
    console.error("No se puede cargar la lista");
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
.accion {
  flex: 1 1 0;
  min-width: 0;
  padding-inline: 4px;
}
.expanded-row {
  background-color: rgb(87, 60, 12);
}

.red--text {
  color: red;
}

.green--text {
  color: green;
}
</style>
