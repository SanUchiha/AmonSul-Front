<template>
  <div class="pa-2 text-left">
    <!-- Filtros: los chips se envuelven en móvil -->
    <!-- 0 son todas: con null el chip no se ve marcado -->
    <v-chip-group
      v-model="jornada"
      column
      mandatory
      selected-class="text-primary"
    >
      <v-chip :value="0" size="small" filter>Todas</v-chip>
      <v-chip v-for="n in jornadas" :key="n" :value="n" size="small" filter>
        J{{ n }}
      </v-chip>
    </v-chip-group>
    <v-chip-group
      v-model="estado"
      column
      mandatory
      selected-class="text-primary"
    >
      <v-chip value="todas" size="small" filter>Todas</v-chip>
      <v-chip value="pendientes" size="small" filter>
        Pendientes ({{ pendientes }})
      </v-chip>
      <v-chip value="jugadas" size="small" filter>
        Jugadas ({{ partidas.length - pendientes }})
      </v-chip>
    </v-chip-group>
    <v-autocomplete
      v-model="jugador"
      :items="jugadores"
      item-title="nick"
      item-value="idUsuario"
      label="Partidas de un jugador"
      density="compact"
      clearable
      hide-details
      class="mb-3"
    />

    <div
      v-if="grupos.length === 0"
      class="text-center text-medium-emphasis my-6"
    >
      No hay partidas con estos filtros.
    </div>

    <div v-for="grupo in grupos" :key="grupo.jornada" class="mb-4">
      <h3 class="text-subtitle-1 font-weight-bold mb-2">
        Jornada {{ grupo.jornada }}
      </h3>
      <v-card
        v-for="partida in grupo.partidas"
        :key="partida.idPartidaTorneo"
        variant="outlined"
        class="mb-2"
      >
        <v-card-text class="pa-3">
          <div class="d-flex align-start ga-2">
            <div class="lado text-left">
              <div class="font-weight-bold text-wrap">{{ partida.nick1 }}</div>
              <div class="text-caption text-medium-emphasis text-wrap">
                {{ partida.ejercitoUsuario1 }}
              </div>
              <!-- Solo en ligas que cuentan para el ELO, cuando la partida ya ha contado -->
              <div
                v-if="partida.eloVariacionUsuario1 != null"
                class="text-caption"
                :class="colorElo(partida.eloVariacionUsuario1)"
              >
                {{ textoElo(partida.eloVariacionUsuario1) }}
              </div>
              <v-btn
                size="x-small"
                variant="tonal"
                class="mt-1"
                @click="verLista(partida, 1)"
              >
                Lista
              </v-btn>
            </div>
            <div class="marcador text-h6 text-center">
              {{ partida.resultadoUsuario1 ?? "–" }} :
              {{ partida.resultadoUsuario2 ?? "–" }}
            </div>
            <div class="lado text-right">
              <div class="font-weight-bold text-wrap">{{ partida.nick2 }}</div>
              <div class="text-caption text-medium-emphasis text-wrap">
                {{ partida.ejercitoUsuario2 }}
              </div>
              <div
                v-if="partida.eloVariacionUsuario2 != null"
                class="text-caption"
                :class="colorElo(partida.eloVariacionUsuario2)"
              >
                {{ textoElo(partida.eloVariacionUsuario2) }}
              </div>
              <v-btn
                size="x-small"
                variant="tonal"
                class="mt-1"
                @click="verLista(partida, 2)"
              >
                Lista
              </v-btn>
            </div>
          </div>
          <div class="d-flex flex-wrap align-center ga-1 mt-2">
            <v-chip
              size="x-small"
              :color="partidaJugada(partida) ? 'success' : 'warning'"
            >
              {{ partidaJugada(partida) ? "Jugada" : "Pendiente" }}
            </v-chip>
            <v-chip
              v-if="!partidaJugada(partida) && validadaPorUno(partida)"
              size="x-small"
            >
              Falta una validación
            </v-chip>
            <!-- Los botones van juntos: si no caben, bajan los dos a la derecha -->
            <div class="d-flex ga-1 ms-auto">
              <!-- Con el resultado ya metido basta con validarla, sin abrir el formulario -->
              <v-btn
                v-if="editable && puedeValidar(partida)"
                size="small"
                variant="tonal"
                color="success"
                prepend-icon="mdi-check-all"
                :loading="validando === partida.idPartidaTorneo"
                @click="validar(partida)"
              >
                Validar
              </v-btn>
              <v-btn
                v-if="editable"
                size="small"
                variant="tonal"
                color="primary"
                @click="editar(partida)"
              >
                Resultado
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>

  <ModalEditarPartidaGestion
    v-if="partidaActual"
    :isVisible="showEditar"
    :partida="partidaActual"
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

  <ModalSuccess
    :isVisible="showSuccess"
    message="Resultado guardado."
    @update:isVisible="showSuccess = $event"
  />
  <v-snackbar v-model="showValidada" color="success" timeout="2000">
    Partida validada.
  </v-snackbar>
  <ModalError
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
import { getListaPartidaAsync } from "@/services/ListasService";
import { partidaJugada } from "@/utils/clasificacionLiga";
import { motivoSinLista } from "@/utils/avisoLista";
import ModalEditarPartidaGestion from "@/components/GestionTorneos/ModalEditarPartidaGestion.vue";
import ModalListaResultadoTorneo from "@/components/ResultadosTorneos/ModalListaResultadoTorneo.vue";
import ModalSuccess from "@/components/Commons/ModalSuccess.vue";
import ModalError from "@/components/Commons/ModalError.vue";

const props = defineProps<{
  partidas: PartidaTorneoDTO[];
  jornadas: number;
  // El organizador puede meter o cambiar cualquier resultado en cualquier momento
  editable: boolean;
}>();

const emit = defineEmits<{
  (e: "partidaActualizada", partida: PartidaTorneoDTO): void;
}>();

const jornada = ref(0);
const estado = ref<"todas" | "pendientes" | "jugadas">("todas");
const jugador = ref<number | null>(null);

const pendientes = computed(
  () => props.partidas.filter(p => !partidaJugada(p)).length
);

const jugadores = computed(() => {
  const porId = new Map<number, string>();
  props.partidas.forEach(p => {
    porId.set(p.idUsuario1, p.nick1);
    porId.set(p.idUsuario2, p.nick2);
  });
  return [...porId.entries()]
    .map(([idUsuario, nick]) => ({ idUsuario, nick }))
    .sort((a, b) => a.nick.localeCompare(b.nick));
});

const grupos = computed(() => {
  const filtradas = props.partidas.filter(
    p =>
      (jornada.value === 0 || p.numeroRonda === jornada.value) &&
      (estado.value === "todas" ||
        (estado.value === "jugadas") === partidaJugada(p)) &&
      (jugador.value === null ||
        p.idUsuario1 === jugador.value ||
        p.idUsuario2 === jugador.value)
  );
  const porJornada = new Map<number, PartidaTorneoDTO[]>();
  filtradas.forEach(p => {
    porJornada.set(p.numeroRonda, [
      ...(porJornada.get(p.numeroRonda) ?? []),
      p,
    ]);
  });
  return [...porJornada.entries()]
    .sort(([a], [b]) => a - b)
    .map(([numero, partidas]) => ({ jornada: numero, partidas }));
});

const textoElo = (variacion: number) =>
  `${variacion > 0 ? "+" : ""}${variacion} ELO`;
const colorElo = (variacion: number) =>
  variacion > 0 ? "text-success" : variacion < 0 ? "text-error" : "text-medium-emphasis";

function validadaPorUno(partida: PartidaTorneoDTO) {
  return (
    partida.partidaValidadaUsuario1 === true ||
    partida.partidaValidadaUsuario2 === true
  );
}

// Resultado
const partidaActual = ref<PartidaTorneoDTO | null>(null);
const showEditar = ref(false);
const isCargando = ref(false);
const showSuccess = ref(false);
const showError = ref(false);
const tituloError = ref<string | undefined>(undefined);
const mensajeError = ref("");

function editar(partida: PartidaTorneoDTO) {
  partidaActual.value = partida;
  showEditar.value = true;
}

async function guardar(partidaEditada: PartidaTorneoDTO) {
  showEditar.value = false;
  isCargando.value = true;
  try {
    const actualizada = await updatePartidaTorneo(partidaEditada);
    emit("partidaActualizada", actualizada);
    showSuccess.value = true;
  } catch (error) {
    console.error(error);
    tituloError.value = undefined;
    mensajeError.value = "No se ha podido guardar el resultado.";
    showError.value = true;
  } finally {
    isCargando.value = false;
  }
}

// Validar de un toque: el organizador da por buenos los datos que ya hay
const validando = ref<number | null>(null);
const showValidada = ref(false);

function puedeValidar(partida: PartidaTorneoDTO) {
  return (
    !partidaJugada(partida) &&
    (partida.resultadoUsuario1 != null || partida.resultadoUsuario2 != null)
  );
}

async function validar(partida: PartidaTorneoDTO) {
  validando.value = partida.idPartidaTorneo;
  try {
    await updatePartidaTorneo({
      idPartidaTorneo: partida.idPartidaTorneo,
      partidaValidadaUsuario1: true,
      partidaValidadaUsuario2: true,
    });
    // La respuesta no trae los nicks: se cambia solo lo validado
    emit("partidaActualizada", {
      ...partida,
      partidaValidadaUsuario1: true,
      partidaValidadaUsuario2: true,
    });
    showValidada.value = true;
  } catch (error) {
    console.error(error);
    tituloError.value = undefined;
    mensajeError.value = "No se ha podido validar la partida.";
    showError.value = true;
  } finally {
    validando.value = null;
  }
}

// Lista con la que se jugó, o la actual si está pendiente
const lista = ref<{
  listaData: string;
  nick: string;
  ejercito?: string;
} | null>(null);

async function verLista(partida: PartidaTorneoDTO, lado: 1 | 2) {
  isCargando.value = true;
  try {
    const response = await getListaPartidaAsync(partida.idPartidaTorneo, lado);
    lista.value = {
      listaData: response.data.listaData,
      nick: lado === 1 ? partida.nick1 : partida.nick2,
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
