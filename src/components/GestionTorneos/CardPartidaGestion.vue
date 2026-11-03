<template>
  <v-card variant="outlined" class="mb-2">
    <v-card-text class="pa-3">
      <!-- Arriba la mesa (o ronda, jornada…), en medio el escenario y, en la esquina, la fecha -->
      <div class="cabecera text-caption mb-1">
        <span class="etiqueta">{{ etiqueta }}</span>
        <!-- Lo elige el jugador al meter el resultado: hasta entonces, por decidir -->
        <span class="text-medium-emphasis text-center text-wrap">
          {{ partida.escenarioPartida || (jugada ? "Sin escenario" : "Escenario por decidir") }}
        </span>
        <span class="text-medium-emphasis text-right text-no-wrap">{{ fecha }}</span>
      </div>
      <!-- Los dos lados por filas: si un ejército ocupa dos líneas, lo de debajo sigue a la misma altura en los dos -->
      <div class="enfrentamiento">
        <!-- Equipos y Parejas: el equipo encima -->
        <template v-if="lados.some(l => l.equipo)">
          <template v-for="(l, i) in lados" :key="`equipo${l.lado}`">
            <div v-if="i === 1" />
            <div class="text-caption text-primary text-wrap" :class="alineado(l)">
              {{ l.equipo }}
            </div>
          </template>
        </template>
        <template v-for="(l, i) in lados" :key="`nick${l.lado}`">
          <div v-if="i === 1" class="marcador en-linea text-h6 text-center">
            {{ partida.resultadoUsuario1 ?? "–" }} :
            {{ partida.resultadoUsuario2 ?? "–" }}
          </div>
          <div
            class="font-weight-bold text-wrap en-linea"
            :class="[
              alineado(l),
              { 'text-success': ganador === l.lado, 'text-primary': ganador !== l.lado && l.mio },
            ]"
          >
            <span :class="{ pulsable: idJugador != null }" @click="verPerfil(l.id)">{{ l.nick }}</span>
          </div>
        </template>
        <!-- El ejército subrayado abre la lista; con varias listas por jugador, una línea por lista -->
        <template v-for="(l, i) in lados" :key="`ejercito${l.lado}`">
          <!-- Sistema alemán: debajo del resultado, los puntos que da -->
          <div v-if="i === 1" class="text-center text-caption">
            <template v-if="puntosAleman">
              <!-- En gris: el azul es el del jugador que mira -->
              <div class="text-medium-emphasis font-weight-bold text-no-wrap" title="Puntos del sistema alemán">
                {{ puntosAleman.jugador1 }} : {{ puntosAleman.jugador2 }}
              </div>
            </template>
          </div>
          <div class="text-caption text-medium-emphasis text-wrap" :class="alineado(l)">
            <template v-if="l.listas?.length">
              <div v-for="(listaJugador, j) in l.listas" :key="listaJugador.idLista ?? j">
                <span
                  class="enlace"
                  role="button"
                  tabindex="0"
                  @click="verListaPorId(listaJugador.idLista, l.nick)"
                  @keydown.enter="verListaPorId(listaJugador.idLista, l.nick)"
                >
                  {{ listaJugador.ejercito || "Ver lista" }}
                </span>
              </div>
            </template>
            <span
              v-else
              class="enlace"
              role="button"
              tabindex="0"
              @click="verLista(l.lado)"
              @keydown.enter="verLista(l.lado)"
            >
              {{ l.ejercito || "Ver lista" }}
            </span>
          </div>
        </template>
        <!-- Parejas: el compañero del capitán y, si cada uno lleva la suya, su lista -->
        <template v-if="lados.some(l => l.companero)">
          <template v-for="(l, i) in lados" :key="`companero${l.lado}`">
            <div v-if="i === 1" />
            <div
              class="font-weight-bold text-wrap mt-1"
              :class="[alineado(l), { 'text-primary': l.companero?.id === idJugador, pulsable: idJugador != null }]"
              @click="verPerfil(l.companero?.id)"
            >
              {{ l.companero?.nick }}
            </div>
          </template>
          <!-- Con lista conjunta la de la pareja va en el ejército del capitán -->
          <template v-if="!listaPorPareja">
            <template v-for="(l, i) in lados" :key="`ejercitoCompanero${l.lado}`">
              <div v-if="i === 1" />
              <div class="text-caption text-medium-emphasis text-wrap" :class="alineado(l)">
                <span
                  v-if="l.companero"
                  class="enlace"
                  role="button"
                  tabindex="0"
                  @click="verListaCompanero(l.companero.id, l.companero.nick)"
                  @keydown.enter="verListaCompanero(l.companero.id, l.companero.nick)"
                >
                  {{ l.companero.ejercito || "Ver lista" }}
                </span>
              </div>
            </template>
          </template>
        </template>
        <template v-if="lados.some(l => l.general !== null)">
          <template v-for="(l, i) in lados" :key="`general${l.lado}`">
            <div v-if="i === 1" />
            <div
              class="text-caption"
              :class="[alineado(l), l.general ? 'text-success' : 'text-medium-emphasis']"
            >
              <template v-if="l.general !== null">
                {{ l.general ? "Mató al general" : "No mató al general" }}
              </template>
            </div>
          </template>
        </template>
        <!-- Solo cuando cuenta para el ELO y la partida ya ha contado -->
        <template v-if="lados.some(l => l.elo != null)">
          <template v-for="(l, i) in lados" :key="`elo${l.lado}`">
            <div v-if="i === 1" />
            <div class="text-caption" :class="[alineado(l), l.elo != null ? colorElo(l.elo) : '']">
              <template v-if="l.elo != null">{{ textoElo(l.elo) }}</template>
            </div>
          </template>
        </template>
      </div>
      <!-- Quién la ha validado, cada uno en su lado, y en medio el check cuando la han validado los dos -->
      <div class="validaciones mt-2">
        <template v-for="(l, i) in lados" :key="`validada${l.lado}`">
          <div v-if="i === 1" class="text-center">
            <v-icon
              v-if="jugada"
              size="small"
              color="success"
              icon="mdi-check-circle"
              title="Validada por los dos"
            />
          </div>
          <div :class="l.lado === 1 ? 'text-left' : 'text-right'">
            <v-chip size="x-small" :color="l.validada ? 'success' : 'warning'">
              {{ l.validada ? "Validada" : "Sin validar" }}
            </v-chip>
          </div>
        </template>
      </div>
      <div v-if="$slots.chips || hayBotones" class="d-flex flex-wrap align-center ga-1 mt-2">
        <!-- Lo que añada quien la usa, como quién pasa en la eliminatoria -->
        <slot name="chips" />
        <!-- Los botones van juntos: si no caben, bajan los dos a la derecha -->
        <div class="d-flex ga-1 ms-auto">
          <!-- Jugador: el capitán de un equipo cambia quién juega contra quién mientras no se haya jugado -->
          <v-btn
            v-if="puedeCambiarPairing"
            size="small"
            variant="tonal"
            @click="showCambiarPairing = true"
          >
            Cambiar
          </v-btn>
          <!-- Jugador: si el rival ya lo metió, solo le queda darlo por bueno -->
          <v-btn
            v-if="jugadorValida"
            size="small"
            variant="tonal"
            color="success"
            prepend-icon="mdi-check-all"
            @click="showValidarJugador = true"
          >
            Validar
          </v-btn>
          <!-- Jugador: mete el resultado y con él valida su lado -->
          <v-btn
            v-if="jugadorMete"
            size="small"
            variant="tonal"
            color="primary"
            @click="showResultadoJugador = true"
          >
            Meter resultado
          </v-btn>
          <!-- Con el resultado ya metido basta con validarla, sin abrir el formulario -->
          <v-btn
            v-if="editable && !cerrado && puedeValidar"
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
            v-if="editable && !cerrado"
            size="small"
            variant="tonal"
            color="primary"
            @click="showEditar = true"
          >
            Meter resultado
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

  <!-- Lo que hace el jugador: meter el resultado, validar el del rival o, si es capitán, cambiar el emparejamiento -->
  <ModalEditarPartida
    v-if="showResultadoJugador && miLado"
    :isVisible="showResultadoJugador"
    :partida="partida"
    :idUsuario="miLado"
    @confirmar="guardarJugador"
    @cerrar="showResultadoJugador = false"
  />
  <ModalValidarPartida
    v-if="showValidarJugador"
    :isVisible="showValidarJugador"
    :idPartidaTorneo="partida.idPartidaTorneo"
    :resumen="`${partida.nick1} ${partida.resultadoUsuario1 ?? '–'} - ${partida.resultadoUsuario2 ?? '–'} ${partida.nick2}`"
    @confirmar="validarJugador"
    @cerrar="showValidarJugador = false"
  />
  <ModalCambiarPairingEquipo
    v-if="showCambiarPairing && partida.idEquipo1 && partida.idEquipo2"
    :isVisible="showCambiarPairing"
    :idEquipo1="partida.idEquipo1"
    :idEquipo2="partida.idEquipo2"
    :nombreEquipo1="partida.nombreEquipo1 ?? ''"
    :nombreEquipo2="partida.nombreEquipo2 ?? ''"
    @actualizar="cambiarPairing"
    @cerrar="showCambiarPairing = false"
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
import { useRouter } from "vue-router";
import { ActualizarPairingEquiposDTO, PartidaTorneoDTO } from "@/interfaces/Partidas";
import { UpdatePartidaTorneoDTO } from "@/interfaces/Live";
import { updatePairingTorneoAsync, updatePartidaTorneo } from "@/services/PartidaTorneoService";
import { getListaById, getListaPartidaAsync, getlistaTorneo } from "@/services/ListasService";
import { partidaJugada } from "@/utils/clasificacionLiga";
import { motivoSinLista, SIN_LISTA } from "@/utils/avisoLista";
import { mensajeDelBack } from "@/utils/mensajeDelBack";
import { useToast } from "@/composables/useToast";
import { useTorneoCerrado } from "@/composables/useTorneoCerrado";
import { useSistemaAleman } from "@/composables/useSistemaAleman";
import { calcularPuntosAleman } from "@/utils/sistemaAleman";
import ModalEditarPartidaGestion from "@/components/GestionTorneos/ModalEditarPartidaGestion.vue";
import ModalListaResultadoTorneo from "@/components/ResultadosTorneos/ModalListaResultadoTorneo.vue";
import ModalError from "@/components/Commons/ModalError.vue";
import ModalEditarPartida from "@/components/ResultadosTorneos/ModalEditarPartida.vue";
import ModalValidarPartida from "@/components/ResultadosTorneos/ModalValidarPartida.vue";
import ModalCambiarPairingEquipo from "@/components/PartidasTorneo/ModalCambiarPairingEquipo.vue";

// Una partida de cualquier evento (torneo individual, por equipos, por parejas, de más de una lista, liga o copa):
// resultado, general, ELO y listas. En la gestión el organizador mete el resultado o la valida; en lo que ve un
// jugador, le deja meter el suyo o validar el del rival cuando le toca
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
  // Quien mira, si es un jugador: resalta su nombre y los nombres llevan a la ficha de cada uno
  idJugador?: number;
  // Al jugador le toca meter el resultado (y con él valida su lado) o solo validar el que metió el rival
  meterResultado?: boolean;
  soloValidar?: boolean;
  // Equipos: el capitán puede cambiar quién juega contra quién mientras no se haya jugado
  cambiarPairing?: boolean;
}>();

const emit = defineEmits<{
  (e: "partidaActualizada", partida: PartidaTorneoDTO): void;
}>();

const jugada = computed(() => partidaJugada(props.partida));
const puedeValidar = computed(
  () =>
    !jugada.value &&
    (props.partida.resultadoUsuario1 != null ||
      props.partida.resultadoUsuario2 != null)
);

// Con el sistema alemán, los puntos que reparte el resultado (siempre suman 20)
const aleman = useSistemaAleman();
const puntosAleman = computed(() => {
  const { resultadoUsuario1: r1, resultadoUsuario2: r2 } = props.partida;
  if (!aleman.value || r1 == null || r2 == null) return null;
  return calcularPuntosAleman(r1, r2);
});

// En verde el que pasa o, si no se dice, el que gana una partida ya jugada
const ganador = computed<1 | 2 | null>(() => {
  if (props.pasa) return props.pasa;
  const { resultadoUsuario1: r1, resultadoUsuario2: r2 } = props.partida;
  if (!jugada.value || r1 == null || r2 == null || r1 === r2) return null;
  return r1 > r2 ? 1 : 2;
});

// El lado de quien mira: el suyo si juega, es el compañero en Parejas o el capitán de ese equipo
const miLado = computed<1 | 2 | null>(() => {
  const p = props.partida;
  const id = props.idJugador;
  if (id == null) return null;
  if ([p.idUsuario1, p.idCompanero1, p.idCapitan1].includes(id)) return 1;
  if ([p.idUsuario2, p.idCompanero2, p.idCapitan2].includes(id)) return 2;
  return null;
});
// Lo que le toca al jugador, mientras no se haya jugado y el torneo siga abierto
const puedeActuar = computed(() => miLado.value !== null && !jugada.value && !cerrado.value);
const jugadorValida = computed(() => puedeActuar.value && props.soloValidar === true);
const jugadorMete = computed(
  () => puedeActuar.value && props.meterResultado === true && props.soloValidar !== true
);
// Algún botón para quien mira: si no, la tarjeta acaba en las validaciones
const hayBotones = computed(
  () =>
    puedeCambiarPairing.value ||
    jugadorValida.value ||
    jugadorMete.value ||
    (props.editable && !cerrado.value)
);
// En Parejas hay una partida por cruce: no se elige qué miembro juega contra cuál
const puedeCambiarPairing = computed(() => {
  const p = props.partida;
  const capitan = miLado.value === 1 ? p.idCapitan1 : miLado.value === 2 ? p.idCapitan2 : null;
  return (
    props.cambiarPairing === true &&
    puedeActuar.value &&
    capitan === props.idJugador &&
    p.idCompanero1 == null &&
    p.idCompanero2 == null
  );
});

// Los dos lados con lo que se pinta de cada uno
const lados = computed(() => {
  const p = props.partida;
  return ([1, 2] as const).map(lado => {
    const uno = lado === 1;
    const idCompanero = uno ? p.idCompanero1 : p.idCompanero2;
    const id = uno ? p.idUsuario1 : p.idUsuario2;
    return {
      lado,
      id,
      mio: props.idJugador != null && id === props.idJugador,
      // Torneos de más de una lista: todas las del jugador
      listas: uno ? p.listasJugador1 : p.listasJugador2,
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

// Cada lado hacia su borde
const alineado = (l: { lado: 1 | 2 }) => (l.lado === 1 ? "text-left" : "text-right");

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
const cerrado = useTorneoCerrado();
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

// Una lista concreta, en los torneos de más de una lista por jugador
async function verListaPorId(idLista: number | undefined, nick: string) {
  if (idLista == null) return;
  isCargando.value = true;
  try {
    const response = await getListaById(idLista);
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

// --- Lo que hace el jugador. Al guardarse se recarga la página: cambian la clasificación, el ELO y quién va ---

const router = useRouter();
const showResultadoJugador = ref(false);
const showValidarJugador = ref(false);
const showCambiarPairing = ref(false);

const verPerfil = (idUsuario: number | null | undefined) => {
  if (props.idJugador == null || idUsuario == null) return;
  router.push({ name: "detalle-jugador", params: { idUsuario } });
};

// Valida su lado: el del capitán o compañero es el de su equipo o pareja
const validaMiLado = (): Partial<UpdatePartidaTorneoDTO> =>
  miLado.value === 1 ? { partidaValidadaUsuario1: true } : { partidaValidadaUsuario2: true };

async function enviarJugador(body: UpdatePartidaTorneoDTO, porDefecto: string) {
  isCargando.value = true;
  try {
    await updatePartidaTorneo(body);
    window.location.reload();
  } catch (error) {
    console.error(error);
    // Sin recargar, para que se vea por qué no se ha guardado: por ejemplo, que el torneo ya está cerrado
    tituloError.value = undefined;
    mensajeError.value = mensajeDelBack(error, porDefecto);
    showError.value = true;
    isCargando.value = false;
  }
}

async function guardarJugador(editada: UpdatePartidaTorneoDTO) {
  showResultadoJugador.value = false;
  await enviarJugador(
    {
      idPartidaTorneo: props.partida.idPartidaTorneo,
      resultadoUsuario1: editada.resultadoUsuario1,
      resultadoUsuario2: editada.resultadoUsuario2,
      escenarioPartida: editada.escenarioPartida,
      liderMuertoUsuario1: editada.liderMuertoUsuario1,
      liderMuertoUsuario2: editada.liderMuertoUsuario2,
      ...validaMiLado(),
    },
    "No se ha podido guardar el resultado."
  );
}

async function validarJugador() {
  showValidarJugador.value = false;
  await enviarJugador(
    { idPartidaTorneo: props.partida.idPartidaTorneo, ...validaMiLado() },
    "No se ha podido validar la partida."
  );
}

async function cambiarPairing(payload: ActualizarPairingEquiposDTO) {
  showCambiarPairing.value = false;
  isCargando.value = true;
  try {
    await updatePairingTorneoAsync({
      idPartidaTorneo: props.partida.idPartidaTorneo,
      idUsuario1: payload.idJugador1,
      idUsuario2: payload.idJugador2,
    });
    window.location.reload();
  } catch (error) {
    console.error(error);
    tituloError.value = undefined;
    mensajeError.value = mensajeDelBack(error, "No se ha podido cambiar el emparejamiento.");
    showError.value = true;
    isCargando.value = false;
  }
}
</script>

<style scoped>
.cabecera {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  column-gap: 8px;
  align-items: start;
}
.validaciones {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  column-gap: 8px;
  align-items: center;
}
.enfrentamiento {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  column-gap: 8px;
  align-items: start;
}
.marcador {
  white-space: nowrap;
}
/* Los nombres y el marcador en la misma línea, aunque el marcador vaya con letra más grande */
.en-linea {
  align-self: baseline;
}
.pulsable {
  cursor: pointer;
}
/* El dorado de las mesas, como en la portada */
.etiqueta {
  color: #ffcc00;
}
/* El ejército abre la lista */
.enlace {
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>