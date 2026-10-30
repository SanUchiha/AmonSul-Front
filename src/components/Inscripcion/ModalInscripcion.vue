<template>
  <!-- Tu inscripción: pago, listas y darse de baja -->
  <v-dialog v-model="show" max-width="560" scrollable @update:model-value="alCambiarVisible">
    <v-card>
      <v-card-title class="d-flex align-start ga-2 text-wrap pt-3">
        <div class="flex-grow-1 min-w-0">
          <div class="text-subtitle-1 font-weight-bold">Mi inscripción</div>
          <div v-if="torneo" class="text-body-2 text-medium-emphasis nombre">
            {{ torneo.nombreTorneo }}
          </div>
        </div>
        <v-btn icon="mdi-close" variant="text" density="comfortable" aria-label="Cerrar" @click="close" />
      </v-card-title>
      <v-divider />

      <v-card-text class="text-left">
        <div v-if="cargando || !inscripcionData || !torneo" class="d-flex justify-center py-8">
          <v-progress-circular indeterminate color="primary" />
        </div>
        <template v-else>
          <!-- De un vistazo, como en Mis eventos: el pago y, en ligas y copas, el ejército de todo el evento -->
          <div class="text-body-2 mb-1">
            <span :class="pagado ? 'text-success' : 'text-warning'">{{ pagado ? "Pagado" : "Sin pagar" }}</span>
            <template v-if="ejercitoFijo">
              <span class="text-medium-emphasis"> · {{ ejercitoFijo }}</span>
            </template>
          </div>
          <p v-if="ejercitoFijo" class="text-caption text-medium-emphasis mb-3">
            Puedes cambiar de lista antes de cada partida, siempre de este ejército.
          </p>

          <!-- Una tarjeta por lista: su estado, verla y enviarla o cambiarla -->
          <h3 class="text-subtitle-2 font-weight-bold mt-2 mb-2">
            {{ listas.length > 1 ? "Tus listas" : "Tu lista" }}
          </h3>
          <v-card v-for="lista in listas" :key="lista.indice" variant="outlined" class="pa-3 mb-2">
            <div v-if="listas.length > 1" class="text-body-2 font-weight-bold">Lista {{ lista.indice }}</div>
            <div class="text-body-2">
              <span :class="`text-${estadoLista(lista.estado).color}`">{{ estadoLista(lista.estado).texto }}</span>
              <span v-if="lista.ejercito" class="text-medium-emphasis"> · {{ lista.ejercito }}</span>
            </div>
            <!-- Los botones en una fila, a partes iguales y del mismo color -->
            <div v-if="lista.tieneLista || abierta" class="d-flex ga-1 mt-3">
              <v-btn
                v-if="lista.tieneLista"
                size="small"
                variant="tonal"
                class="accion text-none"
                :loading="cargandoLista === lista.indice"
                @click="alternarLista(lista.indice)"
              >
                {{ listaVisible === lista.indice ? "Ocultar lista" : "Ver lista" }}
              </v-btn>
              <v-btn
                v-if="abierta"
                size="small"
                variant="tonal"
                class="accion text-none"
                @click="enviarOCambiar(lista.indice)"
              >
                {{ lista.tieneLista ? "Cambiar lista" : "Enviar lista" }}
              </v-btn>
            </div>
            <v-expand-transition>
              <div v-if="listaVisible === lista.indice && imagenVisible" class="mt-3">
                <v-img :src="imagenVisible" alt="Lista de ejército" class="rounded" contain />
              </div>
            </v-expand-transition>
          </v-card>

          <!-- Darse de baja: solo antes del evento; en una liga o copa en marcha, con el organizador -->
          <div v-if="abierta && !ligaEnMarcha" class="text-center mt-4">
            <v-btn variant="text" color="error" size="small" class="text-none" @click="eliminarInscripcion">
              Darme de baja
            </v-btn>
          </div>
          <p v-else-if="ligaEnMarcha" class="text-caption text-medium-emphasis mt-3 mb-0">
            {{ esCopa ? "La copa" : "La liga" }} ya está en marcha: si tienes que dejarla, habla con el
            organizador.
          </p>
        </template>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Subir y cambiar listas: los mismos modales de siempre -->
  <ModalLista
    v-if="currentInscripcionId != null"
    :isVisible="showVerListaModal"
    :hasLista="hasLista"
    :idInscripcion="currentInscripcionId"
    :ejercitoFijo="ejercitoFijo"
    @update:isVisible="showVerListaModal = $event"
    @enviarLista="enviarLista"
    @modificarLista="modificarLista"
  />
  <ModalEnviarLista
    v-if="showEnviarListaModal"
    :key="currentInscripcionId"
    v-model:isVisible="showEnviarListaModal"
    :idInscripcion="currentInscripcionId!"
    :idUsuario="props.idUsuario"
    :idTorneo="props.idTorneo"
    :hasLista="false"
    @enviarLista="enviarLista"
    @modificarLista="modificarLista"
  />
  <ModalModificarLista
    :isVisible="showModificarListaModal"
    :idLista="currentIdLista!"
    :ejercitoFijo="ejercitoFijo"
    @update:isVisible="showModificarListaModal = $event"
    @modificarListaMasDeUna="modificarLista"
  />
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, onMounted, ref } from "vue";
import { getIncripcionById } from "@/services/InscripcionesService";
import { InscripcionTorneoCreadoDTO } from "@/interfaces/Torneo";
import {
  CrearListaTorneoRequestDTO,
  ModificarListaTorneoRequestDTO,
  RequesListaDTO,
} from "@/interfaces/Lista";
import {
  getListasByInscripcion,
  getlistaTorneo,
  modificarListaTorneo,
  subirListaTorneo,
} from "@/services/ListasService";
import { ListaDTO } from "@/interfaces/Usuario";
import { esPorJornadas, FORMATO_COPA } from "@/Constant/FormatoTorneo";
import { useToast } from "@/composables/useToast";
import { diaDeHoy, ultimoDiaEvento } from "@/utils/Fecha";
import { estadoLista } from "@/utils/estadoLista";
import ModalLista from "./ModalLista.vue";
import ModalModificarLista from "./ModalModificarLista.vue";
import ModalEnviarLista from "./ModalEnviarLista.vue";

const props = defineProps<{
  idInscripcion: number;
  idUsuario: number;
  idTorneo: number;
  idOrganizador: number;
  // Liga: el ejército elegido al inscribirse
  ejercitoElegido?: string | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "eliminar-inscripcion", idInscripcion: number): void;
  // Ha cambiado una lista: quien lo abrió puede refrescar su estado
  (e: "actualizada"): void;
}>();

const { triggerToast } = useToast();

const show = ref(true);
const cargando = ref(true);
const inscripcionData = ref<InscripcionTorneoCreadoDTO | null>(null);
const listasPorJugador = ref<ListaDTO[]>([]);
const torneo = computed(() => inscripcionData.value?.torneo ?? null);

// Liga y Copa: el ejército es el de la inscripción
const esLiga = computed(() => esPorJornadas(torneo.value?.formatoTorneo));
const esCopa = computed(() => torneo.value?.formatoTorneo === FORMATO_COPA);
const ejercitoFijo = computed(() => (esLiga.value ? props.ejercitoElegido ?? null : null));
// Al generar las jornadas el torneo pasa a tener tantas partidas como jornadas
const ligaEnMarcha = computed(() => esLiga.value && (torneo.value?.numeroPartidas ?? 0) > 1);
// Hasta su último día, incluido, se pueden enviar listas y darse de baja
const abierta = computed(
  () =>
    !!torneo.value &&
    ultimoDiaEvento(torneo.value.fechaInicioTorneo, torneo.value.fechaFinTorneo) >= diaDeHoy()
);
const pagado = computed(() => (inscripcionData.value?.esPago ?? "").toUpperCase() === "SI");

// Con una lista por jugador va en la inscripción; con varias, cada una por separado
const listas = computed(() => {
  const inscripcion = inscripcionData.value;
  if (!inscripcion || !torneo.value) return [];
  if (torneo.value.listasPorJugador <= 1)
    return [
      {
        indice: 1,
        estado: inscripcion.estadoLista,
        ejercito: inscripcion.ejercito,
        tieneLista: !!inscripcion.listaData,
        lista: null as ListaDTO | null,
      },
    ];
  return Array.from({ length: torneo.value.listasPorJugador }, (_, i) => {
    const lista = listasPorJugador.value[i] ?? null;
    return {
      indice: i + 1,
      estado: lista?.estadoLista ?? null,
      ejercito: lista?.ejercito ?? null,
      tieneLista: !!lista?.listaData,
      lista,
    };
  });
});

// Ver una lista: con una por jugador hay que pedir la imagen; con varias ya viene
const listaVisible = ref<number | null>(null);
const imagenVisible = ref<string | null>(null);
const cargandoLista = ref<number | null>(null);
const alternarLista = async (indice: number) => {
  if (listaVisible.value === indice) {
    listaVisible.value = null;
    return;
  }
  const lista = listas.value.find(l => l.indice === indice);
  if (lista?.lista) {
    imagenVisible.value = lista.lista.listaData ?? null;
    listaVisible.value = indice;
    return;
  }
  cargandoLista.value = indice;
  try {
    const response = await getlistaTorneo({ idTorneo: props.idTorneo, idUsuario: props.idUsuario });
    imagenVisible.value = response.data.listaData;
    listaVisible.value = indice;
  } catch (error) {
    console.error(error);
    triggerToast("error", "No se ha podido cargar la lista");
  } finally {
    cargandoLista.value = null;
  }
};

// Enviar o cambiar: los mismos modales y llamadas que antes
const currentInscripcionId = ref<number>();
const currentIdLista = ref<number>();
const showVerListaModal = ref(false);
const showModificarListaModal = ref(false);
const showEnviarListaModal = ref(false);
const hasLista = ref(false);

const enviarOCambiar = (indice: number) => {
  const inscripcion = inscripcionData.value;
  if (!inscripcion || !torneo.value) return;
  currentInscripcionId.value = inscripcion.idInscripcion;
  if (torneo.value.listasPorJugador <= 1) {
    hasLista.value = !!inscripcion.bando;
    if (inscripcion.idLista) {
      currentIdLista.value = inscripcion.idLista;
      showModificarListaModal.value = true;
    } else showVerListaModal.value = true;
    return;
  }
  const lista = listas.value.find(l => l.indice === indice)?.lista;
  if (lista?.idLista) {
    currentIdLista.value = lista.idLista;
    showModificarListaModal.value = true;
  } else showEnviarListaModal.value = true;
};

const alGuardarLista = async (texto: string) => {
  triggerToast("success", texto);
  listaVisible.value = null;
  emit("actualizada");
  await cargar();
};

const enviarLista = async (newLista: RequesListaDTO) => {
  if (!currentInscripcionId.value) return;
  const request: CrearListaTorneoRequestDTO = {
    idInscripcion: currentInscripcionId.value,
    listaData: newLista.listaData,
    ejercito: newLista.ejercito,
    idUsuario: props.idUsuario,
    idTorneo: props.idTorneo,
  };
  try {
    await subirListaTorneo(request);
    await alGuardarLista("Lista enviada");
  } catch (error) {
    console.error(error);
    triggerToast("error", "No se ha podido enviar la lista");
  } finally {
    showVerListaModal.value = false;
    showEnviarListaModal.value = false;
  }
};

const modificarLista = async (newLista: RequesListaDTO) => {
  if (currentIdLista.value == null) return;
  const request: ModificarListaTorneoRequestDTO = {
    listaData: newLista.listaData,
    idLista: currentIdLista.value,
    ejercito: newLista.ejercito,
    idUsuario: props.idUsuario,
    idTorneo: props.idTorneo,
  };
  try {
    await modificarListaTorneo(request);
    await alGuardarLista("Lista cambiada");
  } catch (error) {
    console.error(error);
    triggerToast("error", "No se ha podido cambiar la lista");
  } finally {
    showVerListaModal.value = false;
    showModificarListaModal.value = false;
  }
};

const eliminarInscripcion = () => {
  emit("eliminar-inscripcion", props.idInscripcion);
  show.value = false;
  emit("close");
};

const close = () => {
  show.value = false;
  emit("close");
};
// Cerrarlo pulsando fuera también avisa
const alCambiarVisible = (visible: boolean) => {
  if (!visible) emit("close");
};

const cargar = async () => {
  try {
    const response = await getIncripcionById(props.idInscripcion);
    inscripcionData.value = response.data;
    if (inscripcionData.value && (inscripcionData.value.torneo?.listasPorJugador ?? 0) > 1) {
      const listasResponse = await getListasByInscripcion(inscripcionData.value.idInscripcion);
      listasPorJugador.value = listasResponse.data;
    }
  } catch (error) {
    console.error("Error al obtener datos de la inscripcion:", error);
    triggerToast("error", "No se ha podido cargar la inscripción");
  } finally {
    cargando.value = false;
  }
};

onMounted(cargar);
</script>

<style scoped>
.nombre {
  overflow-wrap: anywhere;
}
.accion {
  flex: 1 1 0;
  min-width: 0;
  padding-inline: 4px;
}
</style>
