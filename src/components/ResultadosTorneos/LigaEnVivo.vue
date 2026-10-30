<template>
  <div class="text-left">
    <h2 class="text-h6 text-center text-wrap mb-2">
      {{ torneo.nombreTorneo }}
    </h2>
    <div class="d-flex flex-wrap justify-center ga-1 mb-2">
      <v-chip size="small" color="primary">Liga</v-chip>
      <v-chip size="small">
        {{ torneo.idaYVuelta ? "Ida y vuelta" : "Solo ida" }}
      </v-chip>
      <v-chip size="small">
        {{ torneo.cuentaElo ? "Cuenta para el ELO" : "No cuenta para el ELO" }}
      </v-chip>
    </div>

    <div v-if="isLoading" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>
    <v-alert
      v-else-if="partidas.length === 0"
      type="info"
      variant="tonal"
      class="ma-2"
    >
      La liga aún no tiene jornadas. El organizador las genera cuando cierra
      las inscripciones.
    </v-alert>
    <template v-else>
      <p class="text-caption text-center text-medium-emphasis mb-2">
        {{ cuenta(jornadas, "jornada", "jornadas") }} ·
        {{ jugadas }} de {{ cuenta(partidas.length, "partida", "partidas") }}
        jugadas
      </p>

      <v-tabs v-model="tab" show-arrows grow>
        <v-tab v-if="juega" value="mias">Mis partidas</v-tab>
        <v-tab value="jornadas">Jornadas</v-tab>
        <v-tab value="clasificacion">Clasificación</v-tab>
        <v-tab value="listas">Listas</v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <!-- Mis partidas: las pendientes primero, que son las que hay que jugar -->
        <v-window-item v-if="juega" value="mias">
          <div class="pa-2">
            <p v-if="miEjercito" class="text-body-2 mb-1">
              Juegas con <strong>{{ miEjercito }}</strong>.
            </p>
            <p class="text-caption text-medium-emphasis">
              El calendario es abierto: queda con tu rival y, al jugar, meted
              el resultado aquí. Puedes cambiar de lista antes de cada partida
              desde Mis torneos.
            </p>

            <h3 class="text-subtitle-1 font-weight-bold mt-3">
              Pendientes ({{ misPendientes.length }})
            </h3>
            <p
              v-if="misPendientes.length === 0"
              class="text-medium-emphasis my-2"
            >
              Has jugado todas tus partidas.
            </p>
            <CardPartidaTorneoLive
              v-for="partida in misPendientes"
              :key="partida.idPartidaTorneo"
              :idUsuario="idUsuario!"
              :match="partida"
              :mesa="`Jornada ${partida.numeroRonda}`"
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
                :mesa="`Jornada ${partida.numeroRonda}`"
                :completa="true"
                :editarPartidaPJ="false"
                :soloValidarPJ="false"
                listaDePartida
              />
            </template>
          </div>
        </v-window-item>

        <v-window-item value="jornadas">
          <TabJornadasLiga
            :partidas="partidas"
            :jornadas="jornadas"
            :editable="false"
          />
        </v-window-item>

        <v-window-item value="clasificacion">
          <div class="pa-2">
            <TablaClasificacionLiga
              v-if="torneo.mostrarClasificacion"
              :filas="clasificacion"
              :idUsuario="idUsuario"
            />
            <v-alert v-else type="info" variant="tonal" class="ma-2">
              La clasificación está oculta.
            </v-alert>
          </div>
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
import {
  generarClasificacionLiga,
  partidaJugada,
} from "@/utils/clasificacionLiga";
import CardPartidaTorneoLive from "@/components/PartidasTorneo/CardPartidaTorneoLive.vue";
import TabMostrarListas from "@/components/GestionTorneos/TabMostrarListas.vue";
import TabJornadasLiga from "@/components/GestionTorneos/Liga/TabJornadasLiga.vue";
import TablaClasificacionLiga from "@/components/GestionTorneos/Liga/TablaClasificacionLiga.vue";

const props = defineProps<{
  torneo: Torneo;
  idUsuario?: number;
}>();

const isLoading = ref(true);
const partidas = ref<PartidaTorneoDTO[]>([]);
const inscripciones = ref<InscripcionUsuarioIndividualDTO[]>([]);
const tab = ref("jornadas");

const cuenta = (n: number, singular: string, plural: string) =>
  `${n} ${n === 1 ? singular : plural}`;

const jornadas = computed(() =>
  partidas.value.reduce((max, p) => Math.max(max, p.numeroRonda), 0)
);
const jugadas = computed(() => partidas.value.filter(partidaJugada).length);

const esMia = (p: PartidaTorneoDTO) =>
  props.idUsuario !== undefined &&
  (p.idUsuario1 === props.idUsuario || p.idUsuario2 === props.idUsuario);
const mias = computed(() =>
  partidas.value
    .filter(esMia)
    .sort((a, b) => a.numeroRonda - b.numeroRonda)
);
const juega = computed(() => mias.value.length > 0);
const misPendientes = computed(() =>
  mias.value.filter(p => !partidaJugada(p))
);
const misJugadas = computed(() => mias.value.filter(partidaJugada));
const miEjercito = computed(
  () =>
    inscripciones.value.find(i => i.idUsuario === props.idUsuario)
      ?.ejercitoElegido
);

const clasificacion = computed(() =>
  generarClasificacionLiga(
    partidas.value,
    inscripciones.value,
    props.torneo.classificationType
  )
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
  // Quien juega la liga entra directo a sus partidas
  if (juega.value) tab.value = "mias";
  isLoading.value = false;
});
</script>
