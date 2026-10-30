<template>
  <div class="text-left">
    <h2 class="text-h6 text-center text-wrap mb-2">
      {{ torneo.nombreTorneo }}
    </h2>
    <div class="d-flex flex-wrap justify-center ga-1 mb-2">
      <v-chip size="small" color="primary">Copa</v-chip>
      <v-chip size="small">{{ cuenta(numeroGrupos, "grupo", "grupos") }}</v-chip>
      <v-chip size="small">Pasan {{ torneo.clasificadosPorGrupo }} por grupo</v-chip>
      <v-chip size="small">
        {{ torneo.cuentaElo ? "Cuenta para el ELO" : "No cuenta para el ELO" }}
      </v-chip>
    </div>

    <div v-if="isLoading" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>
    <template v-else-if="partidas.length === 0">
      <v-alert type="info" variant="tonal" class="ma-2">
        La copa aún no tiene jornadas. El organizador las genera cuando cierra
        las inscripciones.
      </v-alert>
      <!-- Si ya están repartidos, quién está en cada grupo -->
      <div v-if="hayGrupos" class="pa-2">
        <div v-for="g in numeroGrupos" :key="g" class="mb-3">
          <h3 class="text-subtitle-1 font-weight-bold mb-1">Grupo {{ g }}</h3>
          <div class="d-flex flex-wrap ga-1">
            <v-chip
              v-for="i in miembros(g)"
              :key="i.idInscripcion"
              size="small"
              :color="i.idUsuario === idUsuario ? 'primary' : undefined"
            >
              {{ i.nick }}
            </v-chip>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <p class="text-caption text-center text-medium-emphasis mb-2">
        <template v-if="cuadro?.campeon.idUsuario">
          Campeón: <strong>{{ cuadro.campeon.nick }}</strong>
        </template>
        <template v-else-if="cuadro">Eliminatoria: {{ rondaEnJuego }}</template>
        <template v-else>
          Fase de grupos · {{ jugadasGrupos }} de
          {{ cuenta(partidasGrupos.length, "partida", "partidas") }} jugadas
        </template>
      </p>

      <v-tabs v-model="tab" show-arrows grow>
        <v-tab v-if="juega" value="mias">Mis partidas</v-tab>
        <v-tab value="grupos">Grupos</v-tab>
        <v-tab value="jornadas">Jornadas</v-tab>
        <v-tab v-if="cuadro" value="eliminatoria">Eliminatoria</v-tab>
        <v-tab value="listas">Listas</v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <!-- Mis partidas: las pendientes primero, que son las que hay que jugar -->
        <v-window-item v-if="juega" value="mias">
          <div class="pa-2">
            <p v-if="miInscripcion?.ejercitoElegido" class="text-body-2 mb-1">
              Juegas con <strong>{{ miInscripcion.ejercitoElegido }}</strong>
              <template v-if="miInscripcion.grupo">
                en el grupo {{ miInscripcion.grupo }}</template>.
            </p>
            <p class="text-caption text-medium-emphasis">
              El calendario es abierto: queda con tu rival y, al jugar, meted
              el resultado aquí. Puedes cambiar de lista antes de cada partida
              desde Mis eventos.
            </p>

            <h3 class="text-subtitle-1 font-weight-bold mt-3">
              Pendientes ({{ misPendientes.length }})
            </h3>
            <p
              v-if="misPendientes.length === 0"
              class="text-medium-emphasis my-2"
            >
              No tienes partidas pendientes.
            </p>
            <CardPartidaTorneoLive
              v-for="partida in misPendientes"
              :key="partida.idPartidaTorneo"
              :idUsuario="idUsuario!"
              :match="partida"
              :mesa="etiquetaPartidaCopa(partida, cuadro)"
              :completa="false"
              :editarPartidaPJ="faltaMiValidacion(partida)"
              :soloValidarPJ="soloFaltaMiValidacion(partida)"
              listaDePartida
            />

            <template v-if="misJugadas.length > 0">
              <h3 class="text-subtitle-1 font-weight-bold mt-4">
                Jugadas ({{ misJugadas.length }})
              </h3>
              <CardPartidaTorneoLive
                v-for="partida in misJugadas"
                :key="partida.idPartidaTorneo"
                :idUsuario="idUsuario!"
                :match="partida"
                :mesa="etiquetaPartidaCopa(partida, cuadro)"
                :completa="true"
                :editarPartidaPJ="false"
                :soloValidarPJ="false"
                listaDePartida
              />
            </template>
          </div>
        </v-window-item>

        <v-window-item value="grupos">
          <div class="pa-2">
            <v-alert
              v-if="!torneo.mostrarClasificacion"
              type="info"
              variant="tonal"
              class="ma-2"
            >
              La clasificación está oculta.
            </v-alert>
            <template v-else>
              <div v-for="g in numeroGrupos" :key="g" class="mb-4">
                <h3 class="text-subtitle-1 font-weight-bold mb-1">
                  Grupo {{ g }}
                </h3>
                <TablaClasificacionLiga
                  :filas="grupos[g - 1] ?? []"
                  :idUsuario="idUsuario"
                  :clasificados="clasificados"
                  sinNota
                />
              </div>
              <p class="text-caption text-medium-emphasis">
                Marcados en verde, los que pasan a la eliminatoria<template
                  v-if="!cuadro"
                > si acabaran ahora; si no llenan el cuadro, entran los mejores
                  siguientes</template>. Solo cuentan las partidas validadas por
                los dos jugadores. Desempate: puntos, diferencia, puntos a favor
                y generales.
              </p>
            </template>
          </div>
        </v-window-item>

        <v-window-item value="jornadas">
          <TabJornadasLiga
            :partidas="partidasGrupos"
            :jornadas="jornadasGrupos"
            :editable="false"
            :numeroGrupos="numeroGrupos"
          />
        </v-window-item>

        <v-window-item v-if="cuadro" value="eliminatoria">
          <CuadroCopa
            :idTorneo="torneo.idTorneo"
            :cuadro="cuadro"
            :editable="false"
            :desempateOrganizador="false"
            :cerrada="true"
          />
        </v-window-item>

        <v-window-item value="listas">
          <TabMostrarListas v-if="torneo.mostrarListas" :torneo="torneo" />
          <v-alert v-else type="info" variant="tonal" class="ma-4">
            Las listas están ocultas.
          </v-alert>
        </v-window-item>
      </v-window>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, onMounted, ref } from "vue";
import { Torneo } from "@/interfaces/Torneo";
import { PartidaTorneoDTO } from "@/interfaces/Partidas";
import { InscripcionUsuarioIndividualDTO } from "@/interfaces/Inscripcion";
import { getPartidasTorneo } from "@/services/TorneosService";
import { getInscripcionesTorneo } from "@/services/InscripcionesService";
import { FASE_GRUPOS } from "@/Constant/FormatoTorneo";
import { partidaJugada } from "@/utils/clasificacionLiga";
import {
  clasificacionGrupos,
  clasificadosCopa,
  etiquetaPartidaCopa,
  montarCuadro,
} from "@/utils/cuadroCopa";
import CardPartidaTorneoLive from "@/components/PartidasTorneo/CardPartidaTorneoLive.vue";
import TabMostrarListas from "@/components/GestionTorneos/TabMostrarListas.vue";
import TabJornadasLiga from "@/components/GestionTorneos/Liga/TabJornadasLiga.vue";
import TablaClasificacionLiga from "@/components/GestionTorneos/Liga/TablaClasificacionLiga.vue";
import CuadroCopa from "@/components/GestionTorneos/Copa/CuadroCopa.vue";

// Lo que ven los jugadores de una copa: sus partidas, los grupos, sus jornadas y el cuadro
const props = defineProps<{
  torneo: Torneo;
  idUsuario?: number;
}>();

const isLoading = ref(true);
const partidas = ref<PartidaTorneoDTO[]>([]);
const inscripciones = ref<InscripcionUsuarioIndividualDTO[]>([]);
const tab = ref("grupos");

const cuenta = (n: number, singular: string, plural: string) =>
  `${n} ${n === 1 ? singular : plural}`;

const numeroGrupos = computed(() => props.torneo.numeroGrupos ?? 1);
const hayGrupos = computed(() => inscripciones.value.some(i => i.grupo));
const miembros = (grupo: number) =>
  inscripciones.value
    .filter(i => i.grupo === grupo)
    .sort((a, b) => (a.nick ?? "").localeCompare(b.nick ?? ""));

// Fase de grupos
const partidasGrupos = computed(() =>
  partidas.value.filter(p => p.fase === FASE_GRUPOS)
);
const jornadasGrupos = computed(() =>
  partidasGrupos.value.reduce((max, p) => Math.max(max, p.numeroRonda), 0)
);
const jugadasGrupos = computed(
  () => partidasGrupos.value.filter(partidaJugada).length
);
const grupos = computed(() =>
  clasificacionGrupos(
    partidas.value,
    inscripciones.value,
    numeroGrupos.value,
    props.torneo.classificationType
  )
);
const clasificados = computed(() =>
  clasificadosCopa(
    grupos.value,
    inscripciones.value,
    props.torneo.clasificadosPorGrupo ?? 0
  )
);

// Eliminatoria
const cuadro = computed(() =>
  montarCuadro(
    partidas.value,
    inscripciones.value,
    props.torneo.tercerPuesto ?? false
  )
);
const rondaEnJuego = computed(
  () =>
    cuadro.value?.rondas.find(r => r.cruces.some(c => c.pasa.pendiente))
      ?.nombre ?? "Tercer puesto"
);

// Las mías: primero los grupos por jornada y luego el cuadro por ronda
const esMia = (p: PartidaTorneoDTO) =>
  props.idUsuario !== undefined &&
  (p.idUsuario1 === props.idUsuario || p.idUsuario2 === props.idUsuario);
const mias = computed(() =>
  partidas.value
    .filter(esMia)
    .sort(
      (a, b) =>
        Number(a.fase !== FASE_GRUPOS) - Number(b.fase !== FASE_GRUPOS) ||
        a.numeroRonda - b.numeroRonda
    )
);
const juega = computed(() => mias.value.length > 0);
const misPendientes = computed(() =>
  mias.value.filter(p => !partidaJugada(p))
);
const misJugadas = computed(() => mias.value.filter(partidaJugada));
const miInscripcion = computed(() =>
  inscripciones.value.find(i => i.idUsuario === props.idUsuario)
);

// Mientras no la haya validado, puede meter o corregir el resultado
function faltaMiValidacion(p: PartidaTorneoDTO) {
  if (p.idUsuario1 === props.idUsuario) return p.partidaValidadaUsuario1 !== true;
  return p.partidaValidadaUsuario2 !== true;
}

// Si el rival ya lo metió, solo le queda validarlo
function soloFaltaMiValidacion(p: PartidaTorneoDTO) {
  if (p.idUsuario1 === props.idUsuario)
    return p.partidaValidadaUsuario1 !== true && p.partidaValidadaUsuario2 === true;
  return p.partidaValidadaUsuario2 !== true && p.partidaValidadaUsuario1 === true;
}

onMounted(async () => {
  const [respPartidas, respInscripciones] = await Promise.allSettled([
    getPartidasTorneo(props.torneo.idTorneo),
    getInscripcionesTorneo(props.torneo.idTorneo),
  ]);
  if (respPartidas.status === "fulfilled")
    partidas.value = respPartidas.value.data;
  if (respInscripciones.status === "fulfilled")
    inscripciones.value = respInscripciones.value.data;
  // Quien juega entra directo a sus partidas; quien mira, a lo que está en juego
  if (juega.value) tab.value = "mias";
  else if (cuadro.value) tab.value = "eliminatoria";
  isLoading.value = false;
});
</script>
