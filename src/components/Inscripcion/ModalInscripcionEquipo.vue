<template>
  <!-- La inscripción de tu equipo o pareja, con el mismo estilo que la individual -->
  <v-dialog v-model="show" max-width="560" scrollable @update:model-value="alCambiarVisible">
    <v-card>
      <v-card-title class="d-flex align-start ga-2 text-wrap pt-3">
        <div class="flex-grow-1 min-w-0">
          <div class="text-subtitle-1 font-weight-bold">Mi inscripción</div>
          <div v-if="detalleTorneo" class="text-body-2 text-medium-emphasis nombre">
            {{ detalleTorneo.nombreTorneo }}
          </div>
        </div>
        <v-btn icon="mdi-close" variant="text" density="comfortable" aria-label="Cerrar" @click="close" />
      </v-card-title>
      <v-divider />

      <v-card-text class="text-left">
        <div v-if="cargando" class="d-flex justify-center py-8">
          <v-progress-circular indeterminate color="primary" />
        </div>
        <template v-else>
          <!-- De un vistazo: el equipo, su capitán, el pago y cuándo se inscribió -->
          <div class="text-body-2 font-weight-bold nombre">{{ inscripcionData.nombreEquipo }}</div>
          <div class="text-body-2 mb-1">
            <span :class="pagado ? 'text-success' : 'text-warning'">{{ pagado ? "Pagado" : "No pagado" }}</span>
            <span class="text-medium-emphasis">
              · Capitán: {{ nickCapitan }}
              <template v-if="fechaInscripcion"> · Inscrito el {{ fechaInscripcion }}</template>
            </span>
          </div>

          <!-- Dobles con lista conjunta: una sola lista para los dos -->
          <template v-if="esListaConjunta">
            <h3 class="text-subtitle-2 font-weight-bold mt-3 mb-2">Lista de la pareja</h3>
            <v-card variant="outlined" class="pa-3 mb-2">
              <div class="text-body-2">
                <span :class="`text-${estadoLista(listaPareja?.listaData ? listaPareja.estadoLista : null).color}`">
                  {{ estadoLista(listaPareja?.listaData ? listaPareja.estadoLista : null).texto }}
                </span>
                <span v-if="listaPareja?.ejercito" class="text-medium-emphasis"> · {{ listaPareja.ejercito }}</span>
              </div>
              <div v-if="listaPareja && (listaPareja.listaData || puedeCambiarListas)" class="d-flex ga-1 mt-3">
                <v-btn
                  v-if="listaPareja.listaData"
                  size="small"
                  variant="tonal"
                  class="accion text-none"
                  @click="alternarLista(listaPareja.idInscripcion)"
                >
                  {{ listaVisible === listaPareja.idInscripcion ? "Ocultar lista" : "Ver lista" }}
                </v-btn>
                <v-btn
                  v-if="puedeCambiarListas"
                  size="small"
                  variant="tonal"
                  class="accion text-none"
                  @click="enviarCambiarLista(listaPareja)"
                >
                  {{ listaPareja.listaData ? "Cambiar lista" : "Enviar lista" }}
                </v-btn>
              </div>
              <v-expand-transition>
                <div v-if="listaPareja && listaVisible === listaPareja.idInscripcion" class="mt-3">
                  <v-img :src="listaPareja.listaData" alt="Lista de ejército" class="rounded" contain />
                </div>
              </v-expand-transition>
            </v-card>
          </template>

          <!-- Una tarjeta por miembro: su lista y lo que puede hacer el capitán -->
          <h3 class="text-subtitle-2 font-weight-bold mt-3 mb-2">Miembros</h3>
          <template v-for="(miembro, index) in equipoConHuecos" :key="miembro?.idUsuario ?? `hueco-${index}`">
            <v-card v-if="miembro" variant="outlined" class="pa-3 mb-2">
              <div class="text-body-2 font-weight-bold">
                {{ miembro.nick }}
                <span v-if="miembro.idUsuario === inscripcionData.idCapitan" class="text-medium-emphasis font-weight-regular">
                  (capitán)
                </span>
              </div>
              <div v-if="!esListaConjunta" class="text-body-2">
                <span :class="`text-${estadoLista(miembro.listaData ? miembro.estadoLista : null).color}`">
                  {{ estadoLista(miembro.listaData ? miembro.estadoLista : null).texto }}
                </span>
                <span v-if="miembro.ejercito" class="text-medium-emphasis"> · {{ miembro.ejercito }}</span>
              </div>
              <div v-if="accionesDe(miembro).length > 0" class="d-flex ga-1 mt-3">
                <v-btn
                  v-if="!esListaConjunta && miembro.listaData"
                  size="small"
                  variant="tonal"
                  class="accion text-none"
                  @click="alternarLista(miembro.idInscripcion)"
                >
                  {{ listaVisible === miembro.idInscripcion ? "Ocultar lista" : "Ver lista" }}
                </v-btn>
                <v-btn
                  v-if="!esListaConjunta && puedeCambiarListas"
                  size="small"
                  variant="tonal"
                  class="accion text-none"
                  @click="enviarCambiarLista(miembro)"
                >
                  {{ miembro.listaData ? "Cambiar lista" : "Enviar lista" }}
                </v-btn>
                <v-btn
                  v-if="puedeQuitar(miembro)"
                  size="small"
                  variant="tonal"
                  color="error"
                  class="accion text-none"
                  @click="quitar = miembro"
                >
                  Quitar
                </v-btn>
              </div>
              <v-expand-transition>
                <div v-if="!esListaConjunta && listaVisible === miembro.idInscripcion" class="mt-3">
                  <v-img :src="miembro.listaData" alt="Lista de ejército" class="rounded" contain />
                </div>
              </v-expand-transition>
            </v-card>

            <!-- Hueco libre: el capitán puede completar el equipo -->
            <v-card v-else variant="outlined" class="pa-3 mb-2">
              <div class="text-body-2 text-warning">Hueco libre</div>
              <div v-if="esCapitan && abierta" class="d-flex mt-3">
                <v-btn size="small" variant="tonal" class="accion text-none" @click="abrirAnadirMiembro">
                  Añadir jugador
                </v-btn>
              </div>
            </v-card>
          </template>

          <!-- Dar de baja: solo el capitán y antes de que termine el evento -->
          <div v-if="esCapitan && abierta" class="text-center mt-4">
            <v-btn
              variant="text"
              color="error"
              size="small"
              class="text-none"
              @click="eliminarInscripcion(inscripcionData.idEquipo)"
            >
              {{ esParejas ? "Dar de baja a la pareja" : "Dar de baja al equipo" }}
            </v-btn>
          </div>
        </template>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Quitar a alguien del equipo: mejor preguntarlo -->
  <v-dialog :model-value="!!quitar" max-width="400" @update:model-value="quitar = null">
    <v-card v-if="quitar">
      <v-card-title class="text-wrap">¿Quitar a {{ quitar.nick }}?</v-card-title>
      <v-card-text>
        Dejará de estar en {{ esParejas ? "la pareja" : "el equipo" }}
        {{ inscripcionData.nombreEquipo }}.
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="quitar = null">Volver</v-btn>
        <v-btn color="error" variant="flat" :loading="quitando" @click="confirmarQuitar">Quitar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <ModalEnviarLista
    v-model:isVisible="showEnviarCambiarListaModal"
    :idInscripcion="currentInscripcionId!"
    :idUsuario="currentUsuarioId!"
    :nick="currentNick!"
    :hasLista="hasLista"
    @enviarLista="guardarLista"
    @modificarLista="guardarLista"
  />

  <ModalAddMiembroEquipo
    :isVisible="showModalRegistrarMiembroEquipo"
    :idEquipo="inscripcionData.idEquipo"
    :idTorneo="inscripcionData.idTorneo"
    :jugadores="jugadoresSinEquipo"
    @close="showModalRegistrarMiembroEquipo = false"
    @confirm="alAnadirMiembro"
  />
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, onMounted, ref } from "vue";
import { ComponentesEquipoDTO, InscripcionEquipoDTO } from "@/interfaces/Inscripcion";
import {
  eliminarMiembroEquipoAsync,
  getInscripcionEquipo,
} from "@/services/InscripcionesService";
import { useAuth } from "@/composables/useAuth";
import { useToast } from "@/composables/useToast";
import { convertirFecha, diaDeHoy, ultimoDiaEvento } from "@/utils/Fecha";
import { estadoLista } from "@/utils/estadoLista";
import {
  CrearListaTorneoRequestDTO,
  ModificarListaTorneoRequestDTO,
  RequesListaDTO,
} from "@/interfaces/Lista";
import { subirListaTorneo, modificarListaTorneo } from "@/services/ListasService";
import { UsuarioSinEquipoDTO } from "@/interfaces/Usuario";
import { getUsuariosNoInscritosTorneoAsync } from "@/services/UsuariosService";
import { getTorneo } from "@/services/TorneosService";
import { Torneo } from "@/interfaces/Torneo";
import ModalEnviarLista from "./ModalEnviarLista.vue";
import ModalAddMiembroEquipo from "../GestionTorneos/Equipos/ModalAddMiembroEquipo.vue";

const props = defineProps<{
  idInscripcion: number | null;
  idUsuario: number | null;
  idTorneo: number;
  idOrganizador: number | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "eliminar-inscripcion-equipo", idEquipo: number): void;
  // Ha cambiado una lista o un miembro: quien lo abrió puede refrescar
  (e: "actualizada"): void;
}>();

const { getidUsuario } = useAuth();
const { triggerToast } = useToast();
const idUsuarioLogger = Number(getidUsuario.value);

const show = ref(true);
const cargando = ref(true);
const detalleTorneo = ref<Torneo>();
const inscripcionData = ref<InscripcionEquipoDTO>({
  idTorneo: 0,
  idCapitan: 0,
  nombreEquipo: "",
  miembros: [],
  idInscripcion: 0,
  idUsuario: 0,
  idEquipo: 0,
  idOrganizador: 0,
  emailOrganizador: "",
  componentesEquipoDTO: [],
});

const esParejas = computed(() => detalleTorneo.value?.tipoTorneo === "Parejas");
const esListaConjunta = computed(
  () => esParejas.value && detalleTorneo.value?.listaPorPareja === true
);
const esCapitan = computed(() => inscripcionData.value.idCapitan === idUsuarioLogger);
const pagado = computed(() => (inscripcionData.value.esPago ?? "").toUpperCase() === "SI");
const nickCapitan = computed(
  () =>
    inscripcionData.value.componentesEquipoDTO.find(c => c.idUsuario === inscripcionData.value.idCapitan)
      ?.nick ?? "Desconocido"
);
const fechaInscripcion = computed(() =>
  inscripcionData.value.fechaInscripcion ? convertirFecha(inscripcionData.value.fechaInscripcion) : ""
);
// Hasta su último día, incluido, se pueden enviar listas, tocar el equipo y darse de baja
const abierta = computed(
  () =>
    !!detalleTorneo.value &&
    ultimoDiaEvento(detalleTorneo.value.fechaInicioTorneo, detalleTorneo.value.fechaFinTorneo) >= diaDeHoy()
);
const puedeCambiarListas = computed(() => esCapitan.value && abierta.value);

// Los miembros y, si faltan, huecos hasta completar el equipo
const MIEMBROS_POR_TIPO: Record<string, number> = {
  Individual: 1,
  Parejas: 2,
  Equipos_2: 2,
  Equipos_4: 4,
  Equipos_6: 6,
};
const equipoConHuecos = computed(() => {
  const miembros = inscripcionData.value.componentesEquipoDTO ?? [];
  const total = MIEMBROS_POR_TIPO[detalleTorneo.value?.tipoTorneo ?? "Individual"] ?? 1;
  return [...miembros, ...Array(Math.max(0, total - miembros.length)).fill(null)] as (ComponentesEquipoDTO | null)[];
});
// La lista conjunta está en la inscripción del capitán; si se subió antes en la del compañero, se usa esa
const listaPareja = computed(() => {
  const miembros = inscripcionData.value.componentesEquipoDTO ?? [];
  return (
    miembros.find(m => m.listaData) ??
    miembros.find(m => m.idUsuario === inscripcionData.value.idCapitan) ??
    null
  );
});

// Al capitán no se le quita: dejaría el equipo sin nadie al mando
const puedeQuitar = (miembro: ComponentesEquipoDTO) =>
  esCapitan.value && abierta.value && miembro.idUsuario !== inscripcionData.value.idCapitan;
const accionesDe = (miembro: ComponentesEquipoDTO) =>
  [
    !esListaConjunta.value && !!miembro.listaData,
    !esListaConjunta.value && puedeCambiarListas.value,
    puedeQuitar(miembro),
  ].filter(Boolean);

// Ver una lista dentro de su tarjeta
const listaVisible = ref<number | null>(null);
const alternarLista = (idInscripcion: number) => {
  listaVisible.value = listaVisible.value === idInscripcion ? null : idInscripcion;
};

// Enviar o cambiar la lista de un miembro
const currentInscripcionId = ref<number>();
const currentUsuarioId = ref<number>();
const currentNick = ref<string>();
const hasLista = ref(false);
const showEnviarCambiarListaModal = ref(false);
const enviarCambiarLista = (miembro: ComponentesEquipoDTO) => {
  currentInscripcionId.value = miembro.idInscripcion;
  currentUsuarioId.value = miembro.idUsuario;
  currentNick.value = miembro.nick;
  hasLista.value = !!miembro.listaData;
  showEnviarCambiarListaModal.value = true;
};

const guardarLista = async (newLista: RequesListaDTO) => {
  const indice = inscripcionData.value.componentesEquipoDTO.findIndex(
    m => m.idInscripcion === currentInscripcionId.value
  );
  if (indice === -1) {
    triggerToast("error", "No se ha podido enviar la lista");
    return;
  }
  const miembro = inscripcionData.value.componentesEquipoDTO[indice];
  try {
    let idLista = miembro.idLista;
    if (miembro.idLista) {
      const request: ModificarListaTorneoRequestDTO = {
        idInscripcion: miembro.idInscripcion,
        idLista: miembro.idLista,
        listaData: newLista.listaData,
        ejercito: newLista.ejercito,
        idUsuario: newLista.idUsuario,
        idTorneo: inscripcionData.value.idTorneo,
      };
      await modificarListaTorneo(request);
    } else {
      const request: CrearListaTorneoRequestDTO = {
        idInscripcion: miembro.idInscripcion,
        listaData: newLista.listaData,
        ejercito: newLista.ejercito,
        idUsuario: newLista.idUsuario,
        idTorneo: inscripcionData.value.idTorneo,
        emailOrganizador: inscripcionData.value.emailOrganizador,
        nick: newLista.nick,
        nombreEquipo: inscripcionData.value.nombreEquipo,
      };
      const response = await subirListaTorneo(request);
      idLista = response.data?.idLista;
    }
    inscripcionData.value.componentesEquipoDTO[indice] = {
      ...miembro,
      estadoLista: "ENTREGADA",
      listaData: newLista.listaData,
      ejercito: newLista.ejercito.name,
      idLista,
    };
    triggerToast("success", miembro.idLista ? "Lista cambiada" : "Lista enviada");
    emit("actualizada");
  } catch (error) {
    console.error("Error al guardar la lista:", error);
    triggerToast("error", "No se ha podido enviar la lista");
  } finally {
    showEnviarCambiarListaModal.value = false;
  }
};

// Quitar a un miembro, tras confirmarlo
const quitar = ref<ComponentesEquipoDTO | null>(null);
const quitando = ref(false);
const confirmarQuitar = async () => {
  if (!quitar.value) return;
  quitando.value = true;
  try {
    await eliminarMiembroEquipoAsync(quitar.value.idInscripcion);
    const idInscripcion = quitar.value.idInscripcion;
    inscripcionData.value.componentesEquipoDTO = inscripcionData.value.componentesEquipoDTO.filter(
      m => m.idInscripcion !== idInscripcion
    );
    triggerToast("success", `${quitar.value.nick} ya no está ${esParejas.value ? "en la pareja" : "en el equipo"}`);
    quitar.value = null;
    emit("actualizada");
  } catch (error) {
    console.error("Error al quitar a un miembro:", error);
    triggerToast("error", "No se ha podido quitar al jugador");
  } finally {
    quitando.value = false;
  }
};

// Añadir a alguien a un hueco libre
const jugadoresSinEquipo = ref<UsuarioSinEquipoDTO[]>([]);
const showModalRegistrarMiembroEquipo = ref(false);
const abrirAnadirMiembro = async () => {
  try {
    const response = await getUsuariosNoInscritosTorneoAsync(inscripcionData.value.idTorneo);
    jugadoresSinEquipo.value = (response?.data ?? []).sort((a: { nick: string }, b: { nick: string }) =>
      a.nick.localeCompare(b.nick)
    );
    showModalRegistrarMiembroEquipo.value = true;
  } catch (error) {
    console.error(error);
    triggerToast("error", "No se han podido cargar los jugadores");
  }
};
const alAnadirMiembro = (nuevoMiembro: ComponentesEquipoDTO) => {
  if (nuevoMiembro && !inscripcionData.value.componentesEquipoDTO.some(m => m.idUsuario === nuevoMiembro.idUsuario)) {
    inscripcionData.value.componentesEquipoDTO.push(nuevoMiembro);
    emit("actualizada");
  }
};

const eliminarInscripcion = (idEquipo: number) => {
  emit("eliminar-inscripcion-equipo", idEquipo);
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

onMounted(async () => {
  try {
    const response = await getInscripcionEquipo(props.idInscripcion!);
    inscripcionData.value = response.data;
    if (inscripcionData.value.idTorneo) {
      const respuestaTorneo = await getTorneo(inscripcionData.value.idTorneo);
      detalleTorneo.value = respuestaTorneo.data;
    }
  } catch (error) {
    console.error("Error al obtener datos de la inscripcion:", error);
    triggerToast("error", "No se ha podido cargar la inscripción");
  } finally {
    cargando.value = false;
  }
});
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
