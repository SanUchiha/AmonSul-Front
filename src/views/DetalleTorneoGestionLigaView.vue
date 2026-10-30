<template>
  <v-container class="pa-2 pa-sm-4">
    <div v-if="isLoading" class="center">
      <LoadingGandalf />
    </div>
    <v-card v-else-if="torneoGestion" class="mx-auto" max-width="800">
      <v-tabs v-model="tab" show-arrows grow>
        <v-tab value="gestion">Gestión</v-tab>
        <v-tab value="jornadas">Jornadas</v-tab>
        <v-tab value="clasificacion">Clasificación</v-tab>
        <v-tab value="listas">Listas</v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab">
        <!-- Gestión -->
        <v-tabs-window-item value="gestion">
          <CardGestionTorneo :torneo="torneoGestion" />

          <v-card class="mb-4 text-left">
            <v-card-title>Liga</v-card-title>
            <v-card-text>
              <div class="d-flex flex-wrap ga-1 mb-3">
                <v-chip size="small">
                  {{ torneo?.idaYVuelta ? "Ida y vuelta" : "Solo ida" }}
                </v-chip>
                <v-chip
                  size="small"
                  :color="torneo?.cuentaElo ? 'primary' : undefined"
                >
                  {{
                    torneo?.cuentaElo
                      ? "Cuenta para el ELO"
                      : "No cuenta para el ELO"
                  }}
                </v-chip>
                <v-chip v-if="ligaCerrada" size="small" color="success">
                  Cerrada
                </v-chip>
              </div>
              <p v-if="!ligaGenerada">
                Con {{ cuenta(jugadoresActivos, "jugador", "jugadores") }} salen
                <strong>{{ cuenta(calendario.jornadas, "jornada", "jornadas") }}</strong>
                y {{ cuenta(calendario.partidas, "partida", "partidas") }}. Al
                generarla se cierran las inscripciones y cada jugador recibe un
                correo.
              </p>
              <p v-else>
                {{ cuenta(numeroJornadas, "jornada", "jornadas") }} ·
                {{ cuenta(partidas.length, "partida", "partidas") }} ·
                {{ cuenta(jugadas, "jugada", "jugadas") }}
              </p>
            </v-card-text>
            <v-card-actions class="flex-wrap ga-2 justify-center">
              <v-btn
                v-if="!ligaGenerada"
                color="primary"
                variant="tonal"
                :disabled="jugadoresActivos < 3"
                @click="pedirGenerar"
              >
                Generar liga
              </v-btn>
              <v-btn
                v-if="ligaGenerada && jugadas === 0"
                color="error"
                variant="tonal"
                @click="pedirEliminar"
              >
                Eliminar jornadas
              </v-btn>
            </v-card-actions>
            <v-card-text
              v-if="!ligaGenerada && jugadoresActivos < 3"
              class="pt-0 text-caption"
            >
              Hacen falta al menos 3 jugadores para generar la liga.
            </v-card-text>
          </v-card>

          <TablaInscritosLiga
            :torneo="torneoGestion"
            :ligaGenerada="ligaGenerada"
            :ligaCerrada="ligaCerrada"
            @actualizado="cargar"
          />
        </v-tabs-window-item>

        <!-- Jornadas -->
        <v-tabs-window-item value="jornadas">
          <v-alert
            v-if="!ligaGenerada"
            type="info"
            variant="tonal"
            class="ma-4"
          >
            La liga aún no está generada. Genérala desde la pestaña Gestión
            cuando cierres las inscripciones.
          </v-alert>
          <TabJornadasLiga
            v-else
            :partidas="partidas"
            :jornadas="numeroJornadas"
            :editable="true"
            @partidaActualizada="actualizarPartida"
          />
        </v-tabs-window-item>

        <!-- Clasificación -->
        <v-tabs-window-item value="clasificacion">
          <div class="pa-2">
            <v-alert
              v-if="clasificacion.length === 0"
              type="info"
              variant="tonal"
              class="ma-2"
            >
              La clasificación aparece cuando la liga está generada.
            </v-alert>
            <template v-else>
              <TablaClasificacionLiga :filas="clasificacion" />
              <div v-if="!ligaCerrada" class="d-flex justify-center my-3">
                <v-btn color="primary" variant="tonal" @click="pedirGuardar">
                  Cerrar liga y guardar resultados
                </v-btn>
              </div>
              <v-alert
                v-else
                type="success"
                variant="tonal"
                density="compact"
                class="my-3 text-left"
              >
                Liga cerrada: los resultados ya están guardados.
              </v-alert>
            </template>
          </div>
        </v-tabs-window-item>

        <!-- Listas -->
        <v-tabs-window-item value="listas">
          <TabMostrarListas :torneo="torneo" />
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card>

    <!-- Confirmación de generar, eliminar y guardar -->
    <v-dialog v-model="showConfirmar" max-width="420">
      <v-card>
        <v-card-title class="text-wrap">{{ confirmar.titulo }}</v-card-title>
        <v-card-text>{{ confirmar.texto }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="showConfirmar = false">
            Cancelar
          </v-btn>
          <v-btn
            :color="confirmar.color"
            variant="tonal"
            @click="ejecutarConfirmado"
          >
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isGuardando" persistent width="200">
      <v-card class="pa-6 d-flex justify-center">
        <v-progress-circular indeterminate color="primary" size="60" />
      </v-card>
    </v-dialog>

    <ModalSuccess
      :isVisible="showSuccess"
      :message="mensaje"
      @update:isVisible="showSuccess = $event"
    />
    <ModalError
      :isVisible="showError"
      :message="mensaje"
      @update:isVisible="showError = $event"
    />
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { Torneo, TorneoGestionInfoDTO } from "@/interfaces/Torneo";
import { PartidaTorneoDTO } from "@/interfaces/Partidas";
import {
  getInfoTorneoCreado,
  getPartidasTorneo,
  getTorneo,
  guardarResultados,
  isSaveTournament,
} from "@/services/TorneosService";
import {
  eliminarJornadasLigaAsync,
  generarLigaAsync,
} from "@/services/LigaService";
import {
  calendarioLiga,
  generarClasificacionLiga,
  partidaJugada,
} from "@/utils/clasificacionLiga";
import { mensajeDelBack } from "@/utils/mensajeDelBack";
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";
import ModalSuccess from "@/components/Commons/ModalSuccess.vue";
import ModalError from "@/components/Commons/ModalError.vue";
import CardGestionTorneo from "@/components/GestionTorneos/CardGestionTorneo.vue";
import TabMostrarListas from "@/components/GestionTorneos/TabMostrarListas.vue";
import TablaInscritosLiga from "@/components/GestionTorneos/Liga/TablaInscritosLiga.vue";
import TabJornadasLiga from "@/components/GestionTorneos/Liga/TabJornadasLiga.vue";
import TablaClasificacionLiga from "@/components/GestionTorneos/Liga/TablaClasificacionLiga.vue";

const route = useRoute();
const idTorneo = Number(route.params.idTorneo);

const tab = ref("gestion");
const isLoading = ref(true);
const torneo = ref<Torneo>();
const torneoGestion = ref<TorneoGestionInfoDTO>();
const partidas = ref<PartidaTorneoDTO[]>([]);
// Con los resultados guardados ya no se retira a nadie ni se vuelve a cerrar
const ligaCerrada = ref(false);

const ligaGenerada = computed(() => partidas.value.length > 0);
const cuenta = (n: number, singular: string, plural: string) =>
  `${n} ${n === 1 ? singular : plural}`;
const numeroJornadas = computed(() =>
  partidas.value.reduce((max, p) => Math.max(max, p.numeroRonda), 0)
);
const jugadas = computed(() => partidas.value.filter(partidaJugada).length);
const jugadoresActivos = computed(
  () =>
    torneoGestion.value?.inscripciones.filter(
      i => i.estadoInscripcion !== "RETIRADO"
    ).length ?? 0
);
const calendario = computed(() =>
  calendarioLiga(jugadoresActivos.value, torneo.value?.idaYVuelta ?? false)
);
const clasificacion = computed(() =>
  generarClasificacionLiga(
    partidas.value,
    torneoGestion.value?.inscripciones ?? [],
    torneo.value?.classificationType
  )
);

async function cargar() {
  try {
    const [respTorneo, respGestion, respPartidas, respCerrada] =
      await Promise.all([
        getTorneo(idTorneo),
        getInfoTorneoCreado(idTorneo),
        getPartidasTorneo(idTorneo),
        isSaveTournament(idTorneo),
      ]);
    torneo.value = respTorneo.data;
    torneoGestion.value = respGestion.data;
    partidas.value = respPartidas.data;
    ligaCerrada.value = respCerrada.data === true;
  } catch (error) {
    console.error("Error al cargar la liga:", error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(cargar);

function actualizarPartida(actualizada: PartidaTorneoDTO) {
  const i = partidas.value.findIndex(
    p => p.idPartidaTorneo === actualizada.idPartidaTorneo
  );
  if (i !== -1) partidas.value[i] = { ...partidas.value[i], ...actualizada };
}

// Confirmaciones
const showConfirmar = ref(false);
const confirmar = ref<{
  titulo: string;
  texto: string;
  color: string;
  accion: () => Promise<void>;
}>({ titulo: "", texto: "", color: "primary", accion: () => Promise.resolve() });

function pedir(
  titulo: string,
  texto: string,
  color: string,
  accion: () => Promise<void>
) {
  confirmar.value = { titulo, texto, color, accion };
  showConfirmar.value = true;
}

async function ejecutarConfirmado() {
  showConfirmar.value = false;
  await confirmar.value.accion();
}

const isGuardando = ref(false);
const showSuccess = ref(false);
const showError = ref(false);
const mensaje = ref("");

async function ejecutar(
  accion: () => Promise<unknown>,
  exito: string,
  fallo: string
) {
  isGuardando.value = true;
  try {
    await accion();
    mensaje.value = exito;
    showSuccess.value = true;
    await cargar();
  } catch (error) {
    mensaje.value = mensajeDelBack(error, fallo);
    showError.value = true;
  } finally {
    isGuardando.value = false;
  }
}

function pedirGenerar() {
  const { jornadas, partidas: total } = calendario.value;
  pedir(
    "¿Generar la liga?",
    `Con ${jugadoresActivos.value} jugadores se crean ${jornadas} jornadas y ${total} partidas. Se cierran las inscripciones y cada jugador recibe un correo.`,
    "primary",
    () =>
      ejecutar(
        () => generarLigaAsync(idTorneo),
        "Liga generada.",
        "No se ha podido generar la liga."
      )
  );
}

function pedirEliminar() {
  pedir(
    "¿Eliminar las jornadas?",
    "Se borran todas las partidas para poder volver a generar la liga. Solo se puede mientras no se haya jugado ninguna.",
    "error",
    () =>
      ejecutar(
        () => eliminarJornadasLigaAsync(idTorneo),
        "Jornadas eliminadas.",
        "No se han podido eliminar las jornadas."
      )
  );
}

function pedirGuardar() {
  const pendientes = partidas.value.length - jugadas.value;
  pedir(
    "¿Cerrar la liga y guardar los resultados?",
    `Se guardan las posiciones de la clasificación actual.${
      pendientes > 0
        ? ` ${pendientes === 1 ? "Queda 1 partida sin jugar, que no cuenta." : `Quedan ${pendientes} partidas sin jugar, que no cuentan.`}`
        : ""
    } Después ya no se puede retirar a nadie ni eliminar las jornadas.`,
    "primary",
    () =>
      ejecutar(
        () =>
          guardarResultados({
            ganadoresDTO: clasificacion.value.map(fila => ({
              idUsuario: fila.idUsuario,
              idTorneo,
              resultado: fila.posicion,
            })),
            generarRondaDTO: {
              emparejamientos: [],
              luzVsOscCheck: false,
              mismaComunidadCheck: false,
              retosCheck: false,
              esEloCheck: false,
              opcionImpares: null,
              idTorneo,
              idRonda: numeroJornadas.value,
              isTorneoNarsil: false,
            },
          }),
        "Resultados guardados.",
        "No se han podido guardar los resultados."
      )
  );
}
</script>
