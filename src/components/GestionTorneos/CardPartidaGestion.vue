<template>
  <v-card variant="outlined" class="mb-2">
    <v-card-text class="pa-3">
      <div v-if="etiqueta" class="text-caption text-medium-emphasis mb-1">
        {{ etiqueta }}
      </div>
      <div class="d-flex align-start ga-2">
        <template v-for="(l, i) in lados" :key="l.lado">
          <div v-if="i === 1" class="marcador text-h6 text-center">
            {{ partida.resultadoUsuario1 ?? "–" }} :
            {{ partida.resultadoUsuario2 ?? "–" }}
          </div>
          <div class="lado" :class="l.lado === 1 ? 'text-left' : 'text-right'">
            <!-- Equipos y Parejas: el equipo encima -->
            <div v-if="l.equipo" class="text-caption text-primary text-wrap">
              {{ l.equipo }}
            </div>
            <div class="font-weight-bold text-wrap" :class="{ 'text-success': ganador === l.lado }">
              {{ l.nick }}
              <!-- Mientras no cuenta, quién la ha validado ya -->
              <v-icon
                v-if="!jugada"
                size="x-small"
                :icon="l.validada ? 'mdi-check-circle' : 'mdi-clock-outline'"
                :color="l.validada ? 'success' : 'grey'"
                :title="l.validada ? 'La ha validado' : 'Le falta validarla'"
              />
            </div>
            <div class="text-caption text-medium-emphasis text-wrap">
              {{ l.ejercito }}
            </div>
            <!-- Parejas: el compañero del capitán -->
            <template v-if="l.companero">
              <div class="font-weight-bold text-wrap mt-1">{{ l.companero.nick }}</div>
              <div
                v-if="l.companero.ejercito"
                class="text-caption text-medium-emphasis text-wrap"
              >
                {{ l.companero.ejercito }}
              </div>
            </template>
            <div
              v-if="l.general !== null"
              class="text-caption"
              :class="l.general ? 'text-success' : 'text-medium-emphasis'"
            >
              {{ l.general ? "Mató al general" : "No mató al general" }}
            </div>
            <!-- Solo cuando cuenta para el ELO y la partida ya ha contado -->
            <div
              v-if="l.elo != null"
              class="text-caption"
              :class="colorElo(l.elo)"
            >
              {{ textoElo(l.elo) }}
            </div>
            <div
              class="d-flex flex-wrap ga-1 mt-1"
              :class="{ 'justify-end': l.lado === 2 }"
            >
              <!-- Con una lista por jugador en Parejas, cada botón lleva el nick de su dueño -->
              <v-btn size="x-small" variant="tonal" @click="verLista(l.lado)">
                {{ l.companero && !listaPorPareja ? `Lista ${l.nick}` : "Lista" }}
              </v-btn>
              <v-btn
                v-if="l.companero && !listaPorPareja"
                size="x-small"
                variant="tonal"
                @click="verListaCompanero(l.companero.id, l.companero.nick)"
              >
                Lista {{ l.companero.nick }}
              </v-btn>
            </div>
          </div>
        </template>
      </div>
      <div
        v-if="partida.escenarioPartida || fecha"
        class="text-caption text-medium-emphasis mt-2"
      >
        <v-icon size="x-small" icon="mdi-map-marker" />
        {{ [partida.escenarioPartida, fecha].filter(Boolean).join(" · ") }}
      </div>
      <div class="d-flex flex-wrap align-center ga-1 mt-2">
        <v-chip size="x-small" :color="jugada ? 'success' : 'warning'">
          {{ jugada ? "Jugada" : "Pendiente" }}
        </v-chip>
        <v-chip v-if="!jugada && validadaPorUno" size="x-small">
          Falta una validación
        </v-chip>
        <!-- Lo que añada quien la usa, como quién pasa en la eliminatoria -->
        <slot name="chips" />
        <!-- Los botones van juntos: si no caben, bajan los dos a la derecha -->
        <div class="d-flex ga-1 ms-auto">
          <!-- Con el resultado ya metido basta con validarla, sin abrir el formulario -->
          <v-btn
            v-if="editable && puedeValidar"
            size="small"
            variant="tonal"
            color="success"
            prepend-icon="mdi-check-all"
            :loading="validando"
            @click="validar"
          >
            Validar
          </v-btn>
          <v-btn
            v-if="editable"
            size="small"
            variant="tonal"
            color="primary"
            @click="showEditar = true"
          >
            Resultado
          </v-btn>
        </div>
      </div>
      <!-- Más acciones de quien la usa, como cambiar el pairing -->
      <slot />
    </v-card-text>
  </v-card>

  <ModalEditarPartidaGestion
    v-if="showEditar"
    :isVisible="showEditar"
    :partida="partida"
    @cerrar="showEditar = false"
    @confirm="guardar"
  />

  <ModalListaResultadoTorneo
    v-if="lista"
    :listaData="lista.listaData"
    :nickJugador="lista.nick"
    :ejercito="lista.ejercito"
    @close="lista = null"
  />

  <v-dialog v-model="isCargando" persistent width="200">
    <v-card class="pa-6 d-flex justify-center">
      <v-progress-circular indeterminate color="primary" size="60" />
    </v-card>
  </v-dialog>

  <ModalError
    v-if="showError"
    :isVisible="showError"
    :titulo="tituloError"
    :message="mensajeError"
    @update:isVisible="showError = $event"
  />
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, ref } from "vue";
import { PartidaTorneoDTO } from "@/interfaces/Partidas";
import { updatePartidaTorneo } from "@/services/PartidaTorneoService";
import { getListaPartidaAsync, getlistaTorneo } from "@/services/ListasService";
import { partidaJugada } from "@/utils/clasificacionLiga";
import { motivoSinLista, SIN_LISTA } from "@/utils/avisoLista";
import { mensajeDelBack } from "@/utils/mensajeDelBack";
import { useToast } from "@/composables/useToast";
import ModalEditarPartidaGestion from "@/components/GestionTorneos/ModalEditarPartidaGestion.vue";
import ModalListaResultadoTorneo from "@/components/ResultadosTorneos/ModalListaResultadoTorneo.vue";
import ModalError from "@/components/Commons/ModalError.vue";

// Una partida en la gestión de cualquier evento (torneo individual, por equipos, por parejas, de más de una lista,
// liga o copa): resultado, general, ELO, listas y, para el organizador, meter el resultado o validarla
const props = defineProps<{
  partida: PartidaTorneoDTO;
  // El organizador puede meter o cambiar cualquier resultado en cualquier momento
  editable: boolean;
  // Encima de los jugadores, como la mesa o el grupo
  etiqueta?: string;
  // En la eliminatoria de la copa, el lado que pasa aunque hayan empatado
  pasa?: 1 | 2 | null;
  // Parejas con una lista conjunta: un solo botón de lista por pareja
  listaPorPareja?: boolean;
}>();

const emit = defineEmits<{
  (e: "partidaActualizada", partida: PartidaTorneoDTO): void;
}>();

const jugada = computed(() => partidaJugada(props.partida));
const validadaPorUno = computed(
  () =>
    props.partida.partidaValidadaUsuario1 === true ||
    props.partida.partidaValidadaUsuario2 === true
);
const puedeValidar = computed(
  () =>
    !jugada.value &&
    (props.partida.resultadoUsuario1 != null ||
      props.partida.resultadoUsuario2 != null)
);

// En verde el que pasa o, si no se dice, el que gana una partida ya jugada
const ganador = computed<1 | 2 | null>(() => {
  if (props.pasa) return props.pasa;
  const { resultadoUsuario1: r1, resultadoUsuario2: r2 } = props.partida;
  if (!jugada.value || r1 == null || r2 == null || r1 === r2) return null;
  return r1 > r2 ? 1 : 2;
});

// Los dos lados con lo que se pinta de cada uno
const lados = computed(() => {
  const p = props.partida;
  return ([1, 2] as const).map(lado => {
    const uno = lado === 1;
    const idCompanero = uno ? p.idCompanero1 : p.idCompanero2;
    return {
      lado,
      equipo: uno ? p.nombreEquipo1 : p.nombreEquipo2,
      nick: uno ? p.nick1 : p.nick2,
      ejercito: uno ? p.ejercitoUsuario1 : p.ejercitoUsuario2,
      companero: idCompanero
        ? {
            id: idCompanero,
            nick: (uno ? p.nickCompanero1 : p.nickCompanero2) ?? "",
            ejercito: uno ? p.ejercitoCompanero1 : p.ejercitoCompanero2,
          }
        : null,
      general: uno ? p.liderMuertoUsuario1 : p.liderMuertoUsuario2,
      elo: uno ? p.eloVariacionUsuario1 : p.eloVariacionUsuario2,
      validada: (uno ? p.partidaValidadaUsuario1 : p.partidaValidadaUsuario2) === true,
    };
  });
});

const fecha = computed(() =>
  props.partida.fechaPartida
    ? new Date(props.partida.fechaPartida).toLocaleDateString("es-ES")
    : ""
);

const textoElo = (variacion: number) =>
  `${variacion > 0 ? "+" : ""}${variacion} ELO`;
const colorElo = (variacion: number) =>
  variacion > 0 ? "text-success" : variacion < 0 ? "text-error" : "text-medium-emphasis";

// El aviso de éxito es el de la app: con un filtro, la tarjeta puede desaparecer al cambiar la partida
const { triggerToast } = useToast();
const showEditar = ref(false);
const isCargando = ref(false);
const showError = ref(false);
const tituloError = ref<string | undefined>(undefined);
const mensajeError = ref("");

async function guardar(partidaEditada: PartidaTorneoDTO) {
  showEditar.value = false;
  isCargando.value = true;
  try {
    const actualizada = await updatePartidaTorneo(partidaEditada);
    emit("partidaActualizada", actualizada);
    triggerToast("success", "Resultado guardado.");
  } catch (error) {
    console.error(error);
    tituloError.value = undefined;
    mensajeError.value = mensajeDelBack(error, "No se ha podido guardar el resultado.");
    showError.value = true;
  } finally {
    isCargando.value = false;
  }
}

// Validar de un toque: el organizador da por buenos los datos que ya hay
const validando = ref(false);

async function validar() {
  validando.value = true;
  try {
    await updatePartidaTorneo({
      idPartidaTorneo: props.partida.idPartidaTorneo,
      partidaValidadaUsuario1: true,
      partidaValidadaUsuario2: true,
    });
    // La respuesta no trae los nicks: se cambia solo lo validado
    emit("partidaActualizada", {
      ...props.partida,
      partidaValidadaUsuario1: true,
      partidaValidadaUsuario2: true,
    });
    triggerToast("success", "Partida validada.");
  } catch (error) {
    console.error(error);
    tituloError.value = undefined;
    mensajeError.value = mensajeDelBack(error, "No se ha podido validar la partida.");
    showError.value = true;
  } finally {
    validando.value = false;
  }
}

// Lista con la que se jugó, o la actual si está pendiente
const lista = ref<{
  listaData: string;
  nick: string;
  ejercito?: string;
} | null>(null);

async function verLista(lado: 1 | 2) {
  isCargando.value = true;
  try {
    const response = await getListaPartidaAsync(props.partida.idPartidaTorneo, lado);
    lista.value = {
      listaData: response.data.listaData,
      nick: lado === 1 ? props.partida.nick1 : props.partida.nick2,
      ejercito: response.data.ejercito ?? undefined,
    };
  } catch (error) {
    tituloError.value = "Aviso";
    mensajeError.value = motivoSinLista(error);
    showError.value = true;
  } finally {
    isCargando.value = false;
  }
}

// La del compañero en Parejas con una lista por jugador: la que tiene en el torneo
async function verListaCompanero(idUsuario: number, nick: string) {
  isCargando.value = true;
  try {
    const response = await getlistaTorneo({
      idTorneo: props.partida.idTorneo,
      idUsuario,
    });
    if (!response.data?.listaData) {
      tituloError.value = "Aviso";
      mensajeError.value = SIN_LISTA;
      showError.value = true;
      return;
    }
    lista.value = {
      listaData: response.data.listaData,
      nick,
      ejercito: response.data.ejercito ?? undefined,
    };
  } catch (error) {
    tituloError.value = "Aviso";
    mensajeError.value = motivoSinLista(error);
    showError.value = true;
  } finally {
    isCargando.value = false;
  }
}
</script>

<style scoped>
.lado {
  flex: 1 1 0;
  min-width: 0;
}
.marcador {
  flex: 0 0 auto;
  white-space: nowrap;
}
</style>
