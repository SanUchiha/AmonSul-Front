<template>
  <v-container class="pa-2 pa-sm-4">
    <div v-if="isLoading" class="center">
      <LoadingGandalf />
    </div>
    <v-card v-else-if="torneoGestion" class="mx-auto" max-width="800">
      <v-tabs v-model="tab" show-arrows grow>
        <v-tab value="gestion">Gestión</v-tab>
        <v-tab value="grupos">Grupos</v-tab>
        <v-tab value="jornadas">Jornadas</v-tab>
        <v-tab value="eliminatoria">Eliminatoria</v-tab>
        <v-tab value="listas">Listas</v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab">
        <!-- Gestión -->
        <v-tabs-window-item value="gestion">
          <CardGestionTorneo :torneo="torneoGestion" />

          <v-card class="mb-4 text-left">
            <v-card-title>Copa</v-card-title>
            <v-card-text>
              <div class="d-flex flex-wrap ga-1 mb-3">
                <v-chip size="small">
                  {{ cuenta(numeroGrupos, "grupo", "grupos") }}
                </v-chip>
                <v-chip size="small">
                  Pasan {{ torneo?.clasificadosPorGrupo }} por grupo
                </v-chip>
                <v-chip size="small">{{ etiquetaReparto }}</v-chip>
                <v-chip size="small">
                  {{ torneo?.idaYVuelta ? "Grupos a ida y vuelta" : "Grupos a solo ida" }}
                </v-chip>
                <v-chip size="small">Empates: {{ etiquetaDesempate }}</v-chip>
                <v-chip v-if="torneo?.tercerPuesto" size="small">
                  Con tercer puesto
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
                <v-chip v-if="cerrada" size="small" color="success">
                  Cerrada
                </v-chip>
              </div>

              <!-- Lo que toca en cada fase -->
              <template v-if="!tieneJornadas">
                <p>
                  {{ cuenta(jugadoresActivos, "jugador", "jugadores") }} en
                  {{ cuenta(numeroGrupos, "grupo", "grupos") }}.
                  <template v-if="sinGrupo > 0">
                    Faltan {{ sinGrupo }} por colocar en un grupo.
                  </template>
                  <template v-else>Todos tienen grupo.</template>
                </p>
                <p class="text-caption text-medium-emphasis mt-1">
                  <template v-if="esManual">
                    El reparto es a mano: pon a cada jugador en su grupo desde
                    su menú.
                  </template>
                  <template v-else>
                    Reparte los grupos y, si hace falta, mueve a quien quieras
                    desde su menú.
                  </template>
                  Al generar las jornadas se cierran las inscripciones y cada
                  jugador recibe un correo.
                </p>
              </template>
              <p v-else-if="!tieneCuadro">
                Fase de grupos:
                {{ cuenta(numeroJornadas, "jornada", "jornadas") }} ·
                {{ cuenta(partidasGrupos.length, "partida", "partidas") }} ·
                {{ cuenta(jugadasGrupos, "jugada", "jugadas") }}
              </p>
              <p v-else-if="cuadro?.campeon.idUsuario">
                {{ faltaTercero ? "Final jugada" : "Eliminatoria terminada" }}.
                Campeón: <strong>{{ cuadro.campeon.nick }}</strong>.
                <template v-if="faltaTercero">Falta el tercer puesto.</template>
              </p>
              <p v-else>
                Eliminatoria: {{ rondaEnJuego }} ·
                {{ cuenta(crucesJugados, "cruce jugado", "cruces jugados") }}
              </p>
            </v-card-text>

            <v-card-actions class="flex-wrap ga-2 justify-center">
              <template v-if="!tieneJornadas">
                <v-btn
                  v-if="!esManual"
                  color="primary"
                  variant="tonal"
                  :disabled="jugadoresActivos < minimoJugadores"
                  @click="pedirRepartir"
                >
                  {{ sinGrupo < jugadoresActivos ? "Volver a repartir" : "Repartir grupos" }}
                </v-btn>
                <v-btn
                  color="primary"
                  variant="flat"
                  :disabled="sinGrupo > 0 || jugadoresActivos < minimoJugadores"
                  @click="pedirGenerarGrupos"
                >
                  Generar jornadas
                </v-btn>
              </template>
              <template v-else-if="!tieneCuadro && !cerrada">
                <v-btn
                  v-if="!gruposConResultado"
                  color="error"
                  variant="tonal"
                  @click="pedirEliminarJornadas"
                >
                  Eliminar jornadas
                </v-btn>
                <v-btn color="primary" variant="flat" @click="pedirEliminatoria">
                  Generar eliminatoria
                </v-btn>
              </template>
              <template v-else-if="tieneCuadro && !cerrada">
                <v-btn
                  v-if="!cuadroConResultado"
                  color="error"
                  variant="tonal"
                  @click="pedirEliminarEliminatoria"
                >
                  Eliminar eliminatoria
                </v-btn>
                <v-btn
                  v-if="cuadro?.campeon.idUsuario && !faltaTercero"
                  color="primary"
                  variant="flat"
                  @click="pedirCerrar"
                >
                  Cerrar copa y guardar resultados
                </v-btn>
              </template>
            </v-card-actions>
            <v-card-text
              v-if="!tieneJornadas && jugadoresActivos < minimoJugadores"
              class="pt-0 text-caption"
            >
              Hacen falta al menos {{ minimoJugadores }} jugadores para
              {{ cuenta(numeroGrupos, "grupo", "grupos") }}.
            </v-card-text>
          </v-card>

          <TablaInscritosLiga
            :torneo="torneoGestion"
            :ligaGenerada="tieneJornadas"
            :ligaCerrada="cerrada"
            :numeroGrupos="numeroGrupos"
            :enEliminatoria="tieneCuadro"
            @actualizado="cargar"
          />
        </v-tabs-window-item>

        <!-- Grupos: antes de las jornadas, quién está en cada uno; después, su clasificación -->
        <v-tabs-window-item value="grupos">
          <div class="pa-2 text-left">
            <template v-if="!tieneJornadas">
              <v-alert type="info" variant="tonal" density="compact" class="mb-3">
                La clasificación de cada grupo aparece al generar las jornadas.
              </v-alert>
              <div v-for="g in numeroGrupos" :key="g" class="mb-4">
                <h3 class="text-subtitle-1 font-weight-bold mb-1">Grupo {{ g }}</h3>
                <div
                  v-if="miembros(g).length === 0"
                  class="text-body-2 text-medium-emphasis"
                >
                  Aún no hay nadie.
                </div>
                <div v-else class="d-flex flex-wrap ga-1">
                  <v-chip v-for="i in miembros(g)" :key="i.idInscripcion" size="small">
                    {{ i.nick }}
                  </v-chip>
                </div>
              </div>
            </template>
            <template v-else>
              <div v-for="g in numeroGrupos" :key="g" class="mb-4">
                <h3 class="text-subtitle-1 font-weight-bold mb-1">Grupo {{ g }}</h3>
                <TablaClasificacionLiga
                  :filas="clasificacionGrupo(g)"
                  :clasificados="clasificados"
                  sinNota
                />
              </div>
              <p class="text-caption text-medium-emphasis">
                Marcados en verde, los que pasan a la eliminatoria<template
                  v-if="!tieneCuadro"
                > si acabaran ahora; si no llenan el cuadro, entran los mejores
                  siguientes</template>. Solo cuentan las partidas validadas por
                los dos jugadores. Desempate: puntos, diferencia, puntos a favor
                y generales.
              </p>
            </template>
          </div>
        </v-tabs-window-item>

        <!-- Jornadas de los grupos -->
        <v-tabs-window-item value="jornadas">
          <v-alert
            v-if="!tieneJornadas"
            type="info"
            variant="tonal"
            class="ma-4"
          >
            Los grupos aún no tienen jornadas. Genéralas desde la pestaña
            Gestión cuando cierres las inscripciones.
          </v-alert>
          <TabJornadasLiga
            v-else
            :partidas="partidasGrupos"
            :jornadas="numeroJornadas"
            :editable="true"
            :numeroGrupos="numeroGrupos"
            @partidaActualizada="actualizarPartida"
          />
        </v-tabs-window-item>

        <!-- Eliminatoria -->
        <v-tabs-window-item value="eliminatoria">
          <v-alert v-if="!cuadro" type="info" variant="tonal" class="ma-4">
            La eliminatoria se genera desde la pestaña Gestión cuando acaben
            los grupos.
          </v-alert>
          <CuadroCopa
            v-else
            :idTorneo="idTorneo"
            :cuadro="cuadro"
            :editable="true"
            :desempateOrganizador="torneo?.desempateEliminatoria === DESEMPATE_ORGANIZADOR"
            :cerrada="cerrada"
            @partidaActualizada="actualizarPartida"
            @actualizado="recargarPartidas"
          />
        </v-tabs-window-item>

        <!-- Listas -->
        <v-tabs-window-item value="listas">
          <TabMostrarListas :torneo="torneo" />
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card>

    <!-- Confirmación de cada paso -->
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
  isSaveTournament,
} from "@/services/TorneosService";
import {
  cerrarCopaAsync,
  eliminarEliminatoriaAsync,
  eliminarJornadasCopaAsync,
  generarEliminatoriaAsync,
  generarGruposAsync,
  repartirGruposAsync,
} from "@/services/CopaService";
import {
  DESEMPATE_ORGANIZADOR,
  FASE_GRUPOS,
  REPARTO_ELO,
  REPARTO_MANUAL,
  desempateEliminatoriaOptions,
  repartoGruposOptions,
} from "@/Constant/FormatoTorneo";
import { partidaJugada } from "@/utils/clasificacionLiga";
import {
  clasificacionGrupos,
  clasificadosCopa,
  esDelCuadro,
  montarCuadro,
} from "@/utils/cuadroCopa";
import { mensajeDelBack } from "@/utils/mensajeDelBack";
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";
import ModalSuccess from "@/components/Commons/ModalSuccess.vue";
import ModalError from "@/components/Commons/ModalError.vue";
import CardGestionTorneo from "@/components/GestionTorneos/CardGestionTorneo.vue";
import TabMostrarListas from "@/components/GestionTorneos/TabMostrarListas.vue";
import TablaInscritosLiga from "@/components/GestionTorneos/Liga/TablaInscritosLiga.vue";
import TabJornadasLiga from "@/components/GestionTorneos/Liga/TabJornadasLiga.vue";
import TablaClasificacionLiga from "@/components/GestionTorneos/Liga/TablaClasificacionLiga.vue";
import CuadroCopa from "@/components/GestionTorneos/Copa/CuadroCopa.vue";

// Como en el back: cada grupo necesita al menos 2 jugadores
const MINIMO_POR_GRUPO = 2;

const route = useRoute();
const idTorneo = Number(route.params.idTorneo);

const tab = ref("gestion");
const isLoading = ref(true);
const torneo = ref<Torneo>();
const torneoGestion = ref<TorneoGestionInfoDTO>();
const partidas = ref<PartidaTorneoDTO[]>([]);
// Con los resultados guardados ya no se retira a nadie ni se toca el cuadro
const cerrada = ref(false);

const cuenta = (n: number, singular: string, plural: string) =>
  `${n} ${n === 1 ? singular : plural}`;

const numeroGrupos = computed(() => torneo.value?.numeroGrupos ?? 1);
const esManual = computed(() => torneo.value?.repartoGrupos === REPARTO_MANUAL);
const etiquetaReparto = computed(
  () =>
    repartoGruposOptions.find(o => o.value === torneo.value?.repartoGrupos)
      ?.label ?? "Por ELO, con bombos"
);
const etiquetaDesempate = computed(() =>
  (
    desempateEliminatoriaOptions.find(
      o => o.value === torneo.value?.desempateEliminatoria
    )?.label ?? "Pasa el mejor de grupos"
  ).toLowerCase()
);

const activos = computed(
  () =>
    torneoGestion.value?.inscripciones.filter(
      i => i.estadoInscripcion !== "RETIRADO"
    ) ?? []
);
const jugadoresActivos = computed(() => activos.value.length);
const minimoJugadores = computed(() => numeroGrupos.value * MINIMO_POR_GRUPO);
const sinGrupo = computed(
  () =>
    activos.value.filter(
      i => !i.grupo || i.grupo < 1 || i.grupo > numeroGrupos.value
    ).length
);
const miembros = (grupo: number) =>
  activos.value
    .filter(i => i.grupo === grupo)
    .sort((a, b) => (a.nick ?? "").localeCompare(b.nick ?? ""));

// Fase de grupos
const partidasGrupos = computed(() =>
  partidas.value.filter(p => p.fase === FASE_GRUPOS)
);
const tieneJornadas = computed(() => partidasGrupos.value.length > 0);
const numeroJornadas = computed(() =>
  partidasGrupos.value.reduce((max, p) => Math.max(max, p.numeroRonda), 0)
);
const jugadasGrupos = computed(
  () => partidasGrupos.value.filter(partidaJugada).length
);
const tieneResultado = (p: PartidaTorneoDTO) =>
  p.resultadoUsuario1 != null ||
  p.resultadoUsuario2 != null ||
  p.partidaValidadaUsuario1 === true ||
  p.partidaValidadaUsuario2 === true;
const gruposConResultado = computed(() =>
  partidasGrupos.value.some(tieneResultado)
);

const grupos = computed(() =>
  clasificacionGrupos(
    partidas.value,
    torneoGestion.value?.inscripciones ?? [],
    numeroGrupos.value,
    torneo.value?.classificationType
  )
);
const clasificacionGrupo = (grupo: number) => grupos.value[grupo - 1] ?? [];
const clasificados = computed(() =>
  clasificadosCopa(
    grupos.value,
    torneoGestion.value?.inscripciones ?? [],
    torneo.value?.clasificadosPorGrupo ?? 0
  )
);

// Eliminatoria
const cuadro = computed(() =>
  montarCuadro(
    partidas.value,
    torneoGestion.value?.inscripciones ?? [],
    torneo.value?.tercerPuesto ?? false
  )
);
const tieneCuadro = computed(() => cuadro.value !== null);
const cruces = computed(() => partidas.value.filter(esDelCuadro));
const crucesJugados = computed(() => cruces.value.filter(partidaJugada).length);
const cuadroConResultado = computed(() => cruces.value.some(tieneResultado));
// Para cerrar la copa, el tercer puesto también tiene que estar decidido
const faltaTercero = computed(
  () => !!cuadro.value?.tercerPuesto && !cuadro.value.tercerPuesto.pasa.idUsuario
);
// La primera ronda que aún tiene algún cruce sin decidir
const rondaEnJuego = computed(
  () =>
    cuadro.value?.rondas.find(r => r.cruces.some(c => c.pasa.pendiente))
      ?.nombre ?? "Final"
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
    cerrada.value = respCerrada.data === true;
  } catch (error) {
    console.error("Error al cargar la copa:", error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(cargar);

async function recargarPartidas() {
  try {
    partidas.value = (await getPartidasTorneo(idTorneo)).data;
  } catch (error) {
    console.error("Error al recargar las partidas:", error);
  }
}

// Cada resultado puede mover el cuadro y el ELO: se recargan siempre
async function actualizarPartida(actualizada: PartidaTorneoDTO) {
  const i = partidas.value.findIndex(
    p => p.idPartidaTorneo === actualizada.idPartidaTorneo
  );
  if (i !== -1) partidas.value[i] = { ...partidas.value[i], ...actualizada };
  await recargarPartidas();
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

function pedirRepartir() {
  const como =
    torneo.value?.repartoGrupos === REPARTO_ELO
      ? "por ELO: los mejores, uno en cada grupo, y el resto por bombos"
      : "al azar";
  pedir(
    "¿Repartir los grupos?",
    `Los ${jugadoresActivos.value} jugadores se reparten en ${numeroGrupos.value} grupos ${como}. Si ya estaban repartidos, se hace de nuevo. Después puedes mover a quien quieras.`,
    "primary",
    () =>
      ejecutar(
        () => repartirGruposAsync(idTorneo),
        "Grupos repartidos.",
        "No se han podido repartir los grupos."
      )
  );
}

function pedirGenerarGrupos() {
  pedir(
    "¿Generar las jornadas de los grupos?",
    `En cada grupo juegan todos contra todos${torneo.value?.idaYVuelta ? ", ida y vuelta" : ""}. Se cierran las inscripciones y cada jugador recibe un correo.`,
    "primary",
    () =>
      ejecutar(
        () => generarGruposAsync(idTorneo),
        "Jornadas generadas.",
        "No se han podido generar las jornadas."
      )
  );
}

function pedirEliminarJornadas() {
  pedir(
    "¿Eliminar las jornadas?",
    "Se borran las partidas de los grupos para poder repartirlos otra vez. Los jugadores se quedan en su grupo. Solo se puede mientras no haya ningún resultado.",
    "error",
    () =>
      ejecutar(
        () => eliminarJornadasCopaAsync(idTorneo),
        "Jornadas eliminadas.",
        "No se han podido eliminar las jornadas."
      )
  );
}

function pedirEliminatoria() {
  const pendientes = partidasGrupos.value.length - jugadasGrupos.value;
  pedir(
    "¿Cerrar los grupos y generar la eliminatoria?",
    `Pasan los ${torneo.value?.clasificadosPorGrupo} primeros de cada grupo; si no llenan el cuadro, entran los mejores siguientes.${
      pendientes > 0
        ? ` ${pendientes === 1 ? "Queda 1 partida de grupos sin jugar, que ya no cuenta." : `Quedan ${pendientes} partidas de grupos sin jugar, que ya no cuentan.`}`
        : ""
    }`,
    "primary",
    () =>
      ejecutar(
        () => generarEliminatoriaAsync(idTorneo),
        "Eliminatoria generada.",
        "No se ha podido generar la eliminatoria."
      )
  );
}

function pedirEliminarEliminatoria() {
  pedir(
    "¿Eliminar la eliminatoria?",
    "Se borra el cuadro para volver a la fase de grupos. Solo se puede mientras ningún cruce tenga resultado.",
    "error",
    () =>
      ejecutar(
        () => eliminarEliminatoriaAsync(idTorneo),
        "Eliminatoria eliminada.",
        "No se ha podido eliminar la eliminatoria."
      )
  );
}

function pedirCerrar() {
  pedir(
    "¿Cerrar la copa y guardar los resultados?",
    `Se guarda la clasificación final: campeón, finalista, ${torneo.value?.tercerPuesto ? "tercero y cuarto" : "semifinalistas"}, luego los que caen en cada ronda y por último los que no pasaron de grupos. Después ya no se puede retirar a nadie ni tocar el cuadro.`,
    "primary",
    () =>
      ejecutar(
        () => cerrarCopaAsync(idTorneo),
        "Copa cerrada y resultados guardados.",
        "No se ha podido cerrar la copa."
      )
  );
}
</script>
