<template>
  <v-card flat>
    <!-- Inscritos en tarjetas: en móvil la tabla necesitaba scroll horizontal -->
    <div class="text-left px-3 pt-3">
      <h3 class="text-subtitle-1 font-weight-bold mb-2">Inscritos ({{ localInscripciones.length }})</h3>
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
        <v-chip value="todos" size="small" filter>Todos ({{ localInscripciones.length }})</v-chip>
        <v-chip value="sinLista" size="small" filter>Sin lista ({{ sinLista.length }})</v-chip>
        <v-chip v-if="ilegales.length > 0" value="ilegal" size="small" filter>
          Lista ilegal ({{ ilegales.length }})
        </v-chip>
        <v-chip value="sinPagar" size="small" filter>Sin pagar ({{ sinPagar.length }})</v-chip>
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
            <div class="d-flex align-center flex-shrink-0" @click.stop>
              <v-btn
                icon="mdi-minus"
                size="x-small"
                variant="tonal"
                :disabled="loadingPuntosExtra"
                aria-label="Quitar un punto extra"
                @click.stop="actualizarPuntos(item, -1)"
              />
              <span class="mx-2 text-body-2 font-weight-bold puntos">{{ item.puntosExtra }}</span>
              <v-btn
                icon="mdi-plus"
                size="x-small"
                variant="tonal"
                :disabled="loadingPuntosExtra"
                aria-label="Sumar un punto extra"
                @click.stop="actualizarPuntos(item, 1)"
              />
            </div>
          </div>
          <!-- El correo, para escribirle: se abre la aplicación de correo sin abrir el detalle -->
          <a
            v-if="item.email"
            :href="`mailto:${item.email}`"
            class="d-block text-caption text-medium-emphasis email"
            @click.stop
          >
            {{ item.email }}
          </a>
          <div class="text-body-2">
            <span :class="`text-${estadoLista(item.estadoLista).color}`">
              {{ estadoLista(item.estadoLista).texto }}
            </span>
            <!-- Con la lista entregada, su bando -->
            <span v-if="bandoLista(item.bando)" class="text-medium-emphasis text-no-wrap">
              · {{ bandoLista(item.bando)!.texto }}
            </span>
            <span class="text-medium-emphasis"> · </span>
            <span :class="estaPagado(item) ? 'text-success' : 'text-warning'">
              {{ estaPagado(item) ? "Pagado" : "Sin pagar" }}
            </span>
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
    <v-row justify="center" class="my-4 ga-5">
      <v-btn
        variant="tonal"
        @click="openAddJugadorModal"
        color="secondary"
        size="large"
      >
        Añadir Jugador
      </v-btn>
    </v-row>

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
import { useToast } from "@/composables/useToast";
import { updatePuntosExtraAsync } from "@/services/InscripcionesService";
import { UpdatePuntosExtraDTO } from "@/interfaces/Inscripcion";
import { ClassificationType } from "@/Constant/TipoClasificacion";

const { triggerToast } = useToast();

const props = defineProps<{ torneo: TorneoGestionInfoDTO }>();
const localInscripciones = ref<InscripcionTorneoCreadoDTO[]>([]);
const isLoading = ref<boolean>(true);
const loadingPuntosExtra = ref<boolean>(false);
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
    nicks.value = localInscripciones.value
      .map((x) => x.nick)
      .filter((nick): nick is string => nick !== null && nick !== undefined);
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
  showSorteoModal.value = true;
};

const actualizarPuntos = async (
  inscripcion: InscripcionTorneoCreadoDTO,
  puntos: number
) => {
  loadingPuntosExtra.value = true;
  try {
    inscripcion.puntosExtra += puntos;

    const request: UpdatePuntosExtraDTO = {
      idInscripcion: inscripcion.idInscripcion,
      puntosExtra: inscripcion.puntosExtra,
    };
    await updatePuntosExtraAsync(request);

    triggerToast("success", "Puntos extra modificados correctamente.");
  } catch (error) {
    console.error("Error al actualizar puntos:", error);
    inscripcion.puntosExtra -= puntos;

    triggerToast("error", "Puntos extra no han podido ser modificados.");
  } finally {
    loadingPuntosExtra.value = false;
  }
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

const emit = defineEmits(["inscripcionEliminada"]);

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

// Filtros: los que no han entregado la lista, los que la tienen ilegal y los que no han pagado
const filtro = ref<"todos" | "sinLista" | "ilegal" | "sinPagar">("todos");
const estaPagado = (item: InscripcionTorneoCreadoDTO) => (item.esPago ?? "").toUpperCase() === "SI";
const sinEntregar = (item: InscripcionTorneoCreadoDTO) =>
  !["ENTREGADA", "OK", "ILEGAL"].includes((item.estadoLista ?? "").toUpperCase());
// El bye lo inscribe el sistema con números impares: no es nadie a quien reclamar nada
const esBye = (item: InscripcionTorneoCreadoDTO) =>
  item.idUsuario === 568 || /^bye\d*$/i.test((item.nick ?? "").trim());
const reales = computed(() => localInscripciones.value.filter(i => !esBye(i)));
const sinLista = computed(() => reales.value.filter(sinEntregar));
const ilegales = computed(() =>
  reales.value.filter(i => (i.estadoLista ?? "").toUpperCase() === "ILEGAL")
);
const sinPagar = computed(() => reales.value.filter(i => !estaPagado(i)));
const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const visibles = computed(() => {
  const base =
    filtro.value === "sinLista"
      ? sinLista.value
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
.puntos {
  min-width: 1.5em;
  text-align: center;
}
.email {
  overflow-wrap: anywhere;
  text-decoration: none;
}
</style>
