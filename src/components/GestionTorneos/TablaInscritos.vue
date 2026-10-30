<template>
  <v-card flat>
    <!-- Inscritos en tarjetas: en móvil la tabla necesitaba scroll horizontal -->
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
        <v-chip v-if="ilegales.length > 0" value="ilegal" size="small" filter>
          Lista ilegal ({{ ilegales.length }})
        </v-chip>
        <v-chip value="sinPagar" size="small" filter>No pagado ({{ sinPagar.length }})</v-chip>
      </v-chip-group>
    </div>

    <div v-if="isLoading" class="text-center pa-4">Cargando inscripciones...</div>
    <div v-else-if="localInscripciones.length === 0" class="text-center pa-4">
      No hay inscripciones para este torneo
    </div>
    <div v-else-if="visibles.length === 0" class="text-center text-medium-emphasis pa-4">
      Nadie con estos filtros
    </div>
    <v-row v-else dense class="px-2">
      <v-col v-for="item in visibles" :key="item.idInscripcion" cols="12" sm="6" lg="4">
        <!-- Pulsando la tarjeta, el detalle para cambiar la lista o el pago -->
        <v-card
          v-ripple
          variant="outlined"
          class="pa-3 text-left tarjeta"
          role="button"
          tabindex="0"
          @click="handleRowClick(item)"
          @keydown.enter="handleRowClick(item)"
        >
          <div class="d-flex align-center ga-2">
            <span class="text-body-1 font-weight-bold flex-grow-1 nick">{{ item.nick }}</span>
            <!-- Puntos extra: se tocan sin abrir el detalle -->
            <PuntosExtra
              :inscripcion="item"
              @cambiado="(idUsuario, puntos) => emit('puntosExtra', idUsuario, puntos)"
            />
          </div>
          <!-- El correo como texto: pulsarlo abre el detalle como el resto de la tarjeta; en el detalle se le escribe -->
          <div v-if="item.email" class="text-caption text-medium-emphasis email">{{ item.email }}</div>
          <div class="d-flex align-center ga-2">
            <div class="text-body-2 flex-grow-1">
              <span :class="`text-${estadoLista(item.estadoLista).color}`">
                {{ estadoLista(item.estadoLista).texto }}
              </span>
              <!-- Con la lista entregada, su bando -->
              <span v-if="bandoLista(item.bando)" class="text-medium-emphasis text-no-wrap">
                · {{ bandoLista(item.bando)!.texto }}
              </span>
            </div>
            <InterruptorPago
              :esPago="item.esPago"
              :idInscripcion="item.idInscripcion"
              @cambiado="esPago => (item.esPago = esPago)"
            />
          </div>
          <!-- Las fechas, en amarillo si llegaron fuera de plazo -->
          <div class="text-caption text-medium-emphasis">
            <span :class="{ 'text-warning': tarde(item.fechaInscripcion, torneo?.torneo.fechaFinInscripcion) }">
              Inscrito {{ formattedDate(item.fechaInscripcion) }}
            </span>
            <template v-if="item.fechaEntrega">
              ·
              <span :class="{ 'text-warning': tarde(item.fechaEntrega, torneo?.torneo.fechaEntregaListas) }">
                Lista {{ formattedDate(item.fechaEntrega) }}
              </span>
            </template>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- boton para generar los pairing pasandole el id del torneo -->

    <ModalParametrosPrimeraRonda
      :isVisible="showConfigModal"
      :torneo="torneo"
      @close="closeConfigModal"
      @confirm="handleConfigConfirm"
    />
    <ModalAddJugadorTorneo
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

  <ModalDetalleInscripcion
    v-if="showModal"
    :inscripcion="selectedInscripcion"
    @close="closeModal"
    @update-inscripcion="handleUpdateInscripcion"
    @eliminar-inscripcion="handleEliminarInscripcion"
  />

  <ModalSuccess
    :isVisible="showSuccessModal"
    message="Jugador añadido correctamente."
    @update:isVisible="showSuccessModal = $event"
  />
</template>

<script setup lang="ts">
import { esUsuarioBye } from "@/utils/bye";
import { bandoLista, estadoLista } from "@/utils/estadoLista";
import { ref, computed, watch, defineEmits } from "vue";
import { defineProps } from "vue";
import ModalDetalleInscripcion from "./ModalDetalleInscripcion.vue";
import {
  InscripcionTorneoCreadoDTO,
  TorneoGestionInfoDTO,
} from "@/interfaces/Torneo";
import ModalParametrosPrimeraRonda from "./ModalParametrosPrimeraRonda.vue";
import ModalAddJugadorTorneo from "./ModalAddJugadorTorneo.vue";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import { getInfoTorneoCreado } from "@/services/TorneosService";
import ModalSorteo from "./ModalSorteo.vue";
import PuntosExtra from "./PuntosExtra.vue";
import InterruptorPago from "./InterruptorPago.vue";
import { ClassificationType } from "@/Constant/TipoClasificacion";

const props = defineProps<{ torneo: TorneoGestionInfoDTO }>();
const localInscripciones = ref<InscripcionTorneoCreadoDTO[]>([]);
const isLoading = ref<boolean>(true);
const showConfigModal = ref<boolean>(false);
const showSorteoModal = ref<boolean>(false);
const showAddJugadorModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);
const localTorneo = ref<TorneoGestionInfoDTO>();
const nicks = ref<string[]>();

const openConfigModal = async () => {
  isLoading.value = true;
  try {
    if (props.torneo?.torneo.idTorneo) {
      const responseTorneo = await getInfoTorneoCreado(
        props.torneo?.torneo.idTorneo
      );
      localTorneo.value = responseTorneo.data;
    }
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
  showConfigModal.value = true;
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
  await props.torneo;
  showAddJugadorModal.value = true;
};

const closeConfigModal = () => {
  showConfigModal.value = false;
  window.location.reload();
};

const closeAddJugadorModal = () => {
  showAddJugadorModal.value = false;
};

const handleConfigConfirm = () => {
  closeConfigModal();
};

const handleAddJugadorConfirm = () => {
  showAddJugadorModal.value = false;
  showSuccessModal.value = false;
  window.location.reload();
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

const emit = defineEmits(["inscripcionEliminada", "puntosExtra"]);

// Generar la ronda 1 y el sorteo se piden desde la tarjeta de gestión, debajo de Descargar listas
defineExpose({ abrirGenerarRonda1: openConfigModal, abrirSorteo: openSorteo });

const search = ref<string | null>("");
const showModal = ref(false);
const selectedInscripcion = ref<InscripcionTorneoCreadoDTO>({
  idInscripcion: 0,
  idUsuario: 0,
  torneo: {
    idTorneo: 0,
    idUsuario: 0,
    nombreTorneo: "",
    descripcionTorneo: "",
    fechaInicioTorneo: "",
    fechaFinTorneo: "",
    precioTorneo: 0,
    numeroPartidas: 0,
    puntosTorneo: 0,
    estadoTorneo: "ESPERANDO",
    lugarTorneo: "",
    esPrivadoTorneo: false,
    idRangoTorneo: 0,
    esMatchedPlayTorneo: false,
    fechaEntregaListas: "",
    fechaFinInscripcion: "",
    basesTorneo: "",
    cartelTorneo: "",
    metodosPago: [],
    horaInicioTorneo: "",
    horaFinTorneo: "",
    tieneBases: false,
    inicioInscripciones: "",
    listasPorJugador: 0,
    tipoTorneo: "Individual",
    mostrarListas: false,
    mostrarClasificacion: false,
    classificationType: ClassificationType.NORMAL
  },
  idTorneo: 0,
  puntosExtra: 0,
});

// Filtros: a quien le falta la lista (sin entregar o ilegal, que hay que cambiar), solo los de lista ilegal y los que
// no han pagado
const filtro = ref<"todos" | "faltanListas" | "ilegal" | "sinPagar">("todos");
const estaPagado = (item: InscripcionTorneoCreadoDTO) => (item.esPago ?? "").toUpperCase() === "SI";
const faltaLista = (item: InscripcionTorneoCreadoDTO) =>
  !["ENTREGADA", "OK"].includes((item.estadoLista ?? "").toUpperCase());
// El bye lo inscribe el sistema con números impares: no es nadie a quien reclamar nada
const esBye = (item: InscripcionTorneoCreadoDTO) => esUsuarioBye(item.idUsuario, item.nick);
const reales = computed(() => localInscripciones.value.filter(i => !esBye(i)));
const faltanListas = computed(() => reales.value.filter(faltaLista));
const ilegales = computed(() =>
  reales.value.filter(i => (i.estadoLista ?? "").toUpperCase() === "ILEGAL")
);
const sinPagar = computed(() => reales.value.filter(i => !estaPagado(i)));
const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const visibles = computed(() => {
  const base =
    filtro.value === "faltanListas"
      ? faltanListas.value
      : filtro.value === "ilegal"
        ? ilegales.value
        : filtro.value === "sinPagar"
          ? sinPagar.value
          : localInscripciones.value;
  const texto = normalizar(search.value ?? "").trim();
  return texto ? base.filter(i => normalizar(i.nick ?? "").includes(texto)) : base;
});
// Fuera de plazo: después de la fecha límite del torneo
const tarde = (fecha?: string | null, limite?: string | null) =>
  !!fecha && !!limite && new Date(fecha) > new Date(limite);

const formattedDate = (date: string | null | undefined) => {
  return date ? new Date(date).toLocaleDateString() : "N/A";
};


const handleRowClick = (item: InscripcionTorneoCreadoDTO) => {
  selectedInscripcion.value = item;
  showModal.value = true;
};

const handleUpdateInscripcion = (payload: {
  field: keyof InscripcionTorneoCreadoDTO;
  value: any;
}) => {
  if (selectedInscripcion.value) {
    (selectedInscripcion.value[payload.field] as unknown) = payload.value;
  }
};

const handleEliminarInscripcion = (idInscripcion: number) => {
  const index = localInscripciones.value.findIndex(
    (inscripcion) => inscripcion.idInscripcion === idInscripcion
  );
  if (index !== -1) {
    localInscripciones.value.splice(index, 1);
    emit("inscripcionEliminada", idInscripcion);
  }
};

const closeModal = () => {
  showModal.value = false;
};
</script>

<style scoped>
.tarjeta {
  cursor: pointer;
}
.nick {
  overflow-wrap: anywhere;
}
.email {
  overflow-wrap: anywhere;
}
</style>
