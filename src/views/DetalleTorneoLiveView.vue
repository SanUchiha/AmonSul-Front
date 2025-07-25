<template>
  <v-sheet class="pa-4">
    <div v-if="isLoading">
      <LoadingGandalf />
    </div>
    <div v-else>
      <!-- TABS -->
      <v-tabs v-model="activeTab" fixed-tabs>
        <v-tab
          v-if="torneo?.mostrarListas"
          :key="tabListas"
          :text="`Listas`"
          :value="tabListas"
        ></v-tab>
        <v-tab
          v-for="n in numeroRondas"
          :key="n"
          :text="`Ronda ${n}`"
          :value="n"
        >
        </v-tab>
        <v-tab
          v-if="
            torneo?.mostrarClasificacion && torneo.tipoTorneo != 'Individual'
          "
          :key="tabClasificacion"
          :text="`Clasificación`"
          :value="tabClasificacion"
        ></v-tab>

        <v-tab
          v-if="torneo?.mostrarClasificacion"
          :key="tabClasificacionIndividual"
          :text="`Individual`"
          :value="tabClasificacionIndividual"
        ></v-tab>
      </v-tabs>
      <!-- Contenido de las Tabs -->
      <v-window v-model="activeTab">
        <div v-if="partidas.length === 0">
          <p>Aún no se ha generado ninguna ronda</p>
        </div>

        <!-- Tab Listas -->
        <v-window-item :value="tabListas" :key="tabListas">
          <TabMostrarListas :torneo="torneo" />
        </v-window-item>

        <!-- tab dinamicas -->
        <v-window-item v-for="n in numeroRondas" :key="n" :value="n">
          <v-row>
            <CardEmparejamientos
              v-if="torneo?.tipoTorneo !== 'Individual'"
              :partidas="partidas"
              :numeroRonda="n"
            />
            <v-col
              cols="12"
              sm="12"
              md="6"
              lg="6"
              xl="4"
              class="pb-0"
              v-for="(partida, index) in partidasPorRonda[activeTab!]"
              :key="partida.idPartidaTorneo"
              :value="activeTab"
            >
              <!-- Partida completada -->
              <div
                v-if="
                  partida.partidaValidadaUsuario1 === true &&
                  partida.partidaValidadaUsuario2 === true
                "
              >
                <CardPartidaTorneoLive
                  :idUsuario="parseInt(idUsuarioLogger!)"
                  :match="partida"
                  :mesa="`Mesa ${index + 1}`"
                  :completa="true"
                  :editarPartidaPJ="false"
                  :soloValidarPJ="false"
                />
              </div>
              <!-- Partida sin completar -->
              <div v-else>
                <CardPartidaTorneoLive
                  :idUsuario="parseInt(idUsuarioLogger!)"
                  :match="partida"
                  :mesa="`Mesa ${index + 1}`"
                  :completa="false"
                  :editarPartidaPJ="editarPartidaPJ(partida)"
                  :soloValidarPJ="soloValidarPJ(partida)"
                />
              </div>
            </v-col>
          </v-row>
        </v-window-item>

        <!-- Tab clasificacion -->
        <TabClasificacionEquipos
          :tabClasificacion="tabClasificacion"
          :activeTab="activeTab!"
          :torneo="torneo"
          :partidas="partidas"
          :equipos="torneoGestion?.equipos"
          @enviarClasificacion="manejarClasificacion"
        />

        <!-- Tab clasificacion individual -->
        <TabClasificacionEquiposIndividual
          :tabClasificacion="tabClasificacionIndividual"
          :activeTab="activeTab!"
          :clasificacion="clasificacion"
          @enviarClasificacion="manejarClasificacion"
        />
      </v-window>
    </div>

    <!-- Spinner Modal -->
    <v-dialog v-model="isLoadingImage" persistent width="300">
      <v-card>
        <v-card-text
          class="d-flex justify-center align-center"
          style="height: 150px"
        >
          <v-progress-circular
            indeterminate
            color="blue-lighten-3"
            :size="57"
          ></v-progress-circular>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-sheet>
</template>

<script setup lang="ts">
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";
import CardEmparejamientos from "@/components/GestionTorneos/Equipos/CardEmparejamientos.vue";
import TabClasificacionEquipos from "@/components/GestionTorneos/Equipos/TabClasificacionEquipos.vue";
import TabClasificacionEquiposIndividual from "@/components/GestionTorneos/Equipos/TabClasificacionEquiposIndividual.vue";
import TabMostrarListas from "@/components/GestionTorneos/TabMostrarListas.vue";
import CardPartidaTorneoLive from "@/components/PartidasTorneo/CardPartidaTorneoLive.vue";
import { useAuth } from "@/composables/useAuth";
import { TorneoEquipoGestionInfoDTO } from "@/interfaces/Inscripcion";
import { Clasificacion } from "@/interfaces/Live";
import { PartidaTorneoDTO } from "@/interfaces/Partidas";
import {
  ClasificacionEquipo,
  InscripcionTorneoCreadoDTO,
  Torneo,
} from "@/interfaces/Torneo";
import { getInscripcionesTorneo } from "@/services/InscripcionesService";
import {
  getInfoTorneoEquipoCreado,
  getPartidasTorneo,
  getTorneo,
} from "@/services/TorneosService";
import { appsettings } from "@/settings/appsettings";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const idTorneo = ref<number>(Number(route.params.idTorneo));
const isLoading = ref<boolean>(false);
const isLoadingImage = ref<boolean>(false);
const torneo = ref<Torneo>();
const partidas = ref<PartidaTorneoDTO[]>([]);
const numeroRondas = ref<number[]>([]);
const partidasPorRonda = ref<Record<number, PartidaTorneoDTO[]>>({});
const { getidUsuario } = useAuth();
const idUsuarioLogger = ref<string | null>(getidUsuario.value);
const idUsuario = ref<number>();
const activeTab = ref();
const tabClasificacion = ref<number>();
const tabClasificacionIndividual = ref<number>();
const tabListas = ref<number>();
const clasificacion = ref<Clasificacion[]>([]);
const jugadoresZona1 = ref<Clasificacion[]>([]);
const jugadoresZona2 = ref<Clasificacion[]>([]);
const clasificacionDividida = ref<Clasificacion[]>([]);
const clasificacionZona1 = ref<Clasificacion[]>([]);
const clasificacionZona2 = ref<Clasificacion[]>([]);
const torneoGestion = ref<TorneoEquipoGestionInfoDTO | null>(null);
const clasificacionEquipos = ref<ClasificacionEquipo[]>([]);
const inscripciones = ref<InscripcionTorneoCreadoDTO[]>([]);

function manejarClasificacion(clasificacion: ClasificacionEquipo[]) {
  clasificacionEquipos.value = clasificacion;
}

onMounted(async () => {
  if (idUsuarioLogger.value) idUsuario.value = parseInt(idUsuarioLogger.value);
  isLoading.value = true;

  try {
    const responseTorneo = await getTorneo(idTorneo.value);
    torneo.value = responseTorneo.data;

    const responsePartidas = await getPartidasTorneo(idTorneo.value);
    partidas.value = responsePartidas.data;

    if (torneo.value) {
      numeroRondas.value = Array.from(
        { length: torneo.value.numeroPartidas },
        (_, index) => index + 1
      );
    }
    if (partidas.value) {
      partidasPorRonda.value = partidas.value.reduce((acc, partida) => {
        const { numeroRonda } = partida;
        if (!acc[numeroRonda]) {
          acc[numeroRonda] = [];
        }
        acc[numeroRonda].push(partida);
        return acc;
      }, {} as Record<number, PartidaTorneoDTO[]>);
    }

    try {
      const responseTorneo = await getInfoTorneoEquipoCreado(idTorneo.value);
      torneoGestion.value = responseTorneo.data;
    } catch (error) {
      console.error(error);
    }

    try {
      const responseInscripciones = await getInscripcionesTorneo(
        idTorneo.value
      );
      inscripciones.value = responseInscripciones.data;
    } catch (error) {
      console.error(error);
    }

    calcularClasificacion();

    tabClasificacion.value = numeroRondas.value.length + 2;
    tabClasificacionIndividual.value = numeroRondas.value.length + 3;
    tabListas.value = numeroRondas.value.length + 1;
    if (torneo.value?.mostrarListas) {
      activeTab.value = tabListas.value;
    } else {
      activeTab.value = numeroRondas.value[0] ?? 1;
    }
  } catch (error) {
    console.error("calcularClasificacion", error);
  } finally {
    isLoading.value = false;
  }
});

const calcularClasificacion = async () => {
  const ranking: Record<
    number,
    {
      nick: string;
      victorias: number;
      puntosFavor: number;
      puntosContra: number;
      diferenciaPuntos: number;
      lider: number;
      idUsuario: number;
      idTorneo: number;
      empates: 0;
      derrotas: 0;
      puntosTorneo: 0;
    }
  > = {};
  const rankingDividido: Record<
    number,
    {
      nick: string;
      victorias: number;
      puntosFavor: number;
      puntosContra: number;
      diferenciaPuntos: number;
      lider: number;
      idUsuario: number;
      idTorneo: number;
      empates: 0;
      derrotas: 0;
      puntosTorneo: 0;
    }
  > = {};

  // Filtramos hasta la ronda 2 para dividir el grupo
  const partidasFiltradas = partidas.value?.filter(
    (partida) => partida.numeroRonda <= 2
  );

  partidasFiltradas?.forEach((partida) => {
    // Verifica que la partida esté validada por ambos usuarios
    if (partida.partidaValidadaUsuario1 && partida.partidaValidadaUsuario2) {
      const puntosUsuario1 = partida.resultadoUsuario1 ?? 0;
      const puntosUsuario2 = partida.resultadoUsuario2 ?? 0;
      const liderMuertoUsuario1 = partida.liderMuertoUsuario1 ? 1 : 0;
      const liderMuertoUsuario2 = partida.liderMuertoUsuario2 ? 1 : 0;

      // Inicializamos los jugadores si no están en el ranking
      if (!rankingDividido[partida.idUsuario1]) {
        rankingDividido[partida.idUsuario1] = {
          nick: partida.nick1,
          victorias: 0,
          puntosFavor: 0,
          puntosContra: 0,
          diferenciaPuntos: 0,
          lider: 0,
          idUsuario: partida.idUsuario1,
          idTorneo: partida.idTorneo,
          empates: 0,
          derrotas: 0,
          puntosTorneo: 0,
        };
      }
      if (!rankingDividido[partida.idUsuario2]) {
        rankingDividido[partida.idUsuario2] = {
          nick: partida.nick2,
          victorias: 0,
          puntosFavor: 0,
          puntosContra: 0,
          diferenciaPuntos: 0,
          lider: 0,
          idUsuario: partida.idUsuario2,
          idTorneo: partida.idTorneo,
          empates: 0,
          derrotas: 0,
          puntosTorneo: 0,
        };
      }

      // Actualizamos puntos a favor y en contra
      rankingDividido[partida.idUsuario1].puntosFavor += puntosUsuario1;
      rankingDividido[partida.idUsuario1].puntosContra += puntosUsuario2;
      rankingDividido[partida.idUsuario2].puntosFavor += puntosUsuario2;
      rankingDividido[partida.idUsuario2].puntosContra += puntosUsuario1;

      // Actualizamos la diferencia de puntos
      rankingDividido[partida.idUsuario1].diferenciaPuntos =
        rankingDividido[partida.idUsuario1].puntosFavor -
        rankingDividido[partida.idUsuario1].puntosContra;
      rankingDividido[partida.idUsuario2].diferenciaPuntos =
        rankingDividido[partida.idUsuario2].puntosFavor -
        rankingDividido[partida.idUsuario2].puntosContra;

      // Actualizamos las puntosTorneo
      if (partida.ganadorPartidaTorneo === partida.idUsuario1) {
        rankingDividido[partida.idUsuario1].puntosTorneo += 3;
        rankingDividido[partida.idUsuario1].victorias += 1;
        rankingDividido[partida.idUsuario2].derrotas += 1;
      } else if (partida.ganadorPartidaTorneo === partida.idUsuario2) {
        rankingDividido[partida.idUsuario2].puntosTorneo += 3;
        rankingDividido[partida.idUsuario2].victorias += 1;
        rankingDividido[partida.idUsuario1].derrotas += 1;
      } else {
        rankingDividido[partida.idUsuario1].puntosTorneo += 1;
        rankingDividido[partida.idUsuario2].puntosTorneo += 1;
        rankingDividido[partida.idUsuario1].empates += 1;
        rankingDividido[partida.idUsuario2].empates += 1;
      }

      // Lider muerto primero
      if (liderMuertoUsuario1) {
        rankingDividido[partida.idUsuario1].lider += 1;
      } else if (liderMuertoUsuario2) {
        rankingDividido[partida.idUsuario2].lider += 1;
      }
    }
  });

  clasificacionDividida.value = Object.values(rankingDividido).sort((a, b) => {
    // 1. Ordenar por puntosTorneo
    if (b.puntosTorneo !== a.puntosTorneo) {
      return b.puntosTorneo - a.puntosTorneo;
    }
    // 2. Ordenar por diferencia de puntos (puntos a favor - puntos en contra)
    if (b.diferenciaPuntos !== a.diferenciaPuntos) {
      return b.diferenciaPuntos - a.diferenciaPuntos;
    }
    // 3. Ordenar por puntos a favor
    if (b.puntosFavor !== a.puntosFavor) {
      return b.puntosFavor - a.puntosFavor;
    }
    // 4. Ordenar por quién ha matado al líder primero
    return b.lider - a.lider;
  });

  dividirClasificacionEnZonas();

  // Clasificacion normal
  partidas.value?.forEach((partida) => {
    // Verifica que la partida esté validada por ambos usuarios
    if (partida.partidaValidadaUsuario1 && partida.partidaValidadaUsuario2) {
      const puntosUsuario1 = partida.resultadoUsuario1 ?? 0;
      const puntosUsuario2 = partida.resultadoUsuario2 ?? 0;
      const liderMuertoUsuario1 = partida.liderMuertoUsuario1 ? 1 : 0;
      const liderMuertoUsuario2 = partida.liderMuertoUsuario2 ? 1 : 0;

      // Inicializamos los jugadores si no están en el ranking
      if (!ranking[partida.idUsuario1]) {
        ranking[partida.idUsuario1] = {
          nick: partida.nick1,
          victorias: 0,
          puntosFavor: 0,
          puntosContra: 0,
          diferenciaPuntos: 0,
          lider: 0,
          idUsuario: partida.idUsuario1,
          idTorneo: partida.idTorneo,
          empates: 0,
          derrotas: 0,
          puntosTorneo: 0,
        };
      }
      if (!ranking[partida.idUsuario2]) {
        ranking[partida.idUsuario2] = {
          nick: partida.nick2,
          victorias: 0,
          puntosFavor: 0,
          puntosContra: 0,
          diferenciaPuntos: 0,
          lider: 0,
          idUsuario: partida.idUsuario2,
          idTorneo: partida.idTorneo,
          empates: 0,
          derrotas: 0,
          puntosTorneo: 0,
        };
      }

      // Actualizamos puntos a favor y en contra
      ranking[partida.idUsuario1].puntosFavor += puntosUsuario1;
      ranking[partida.idUsuario1].puntosContra += puntosUsuario2;
      ranking[partida.idUsuario2].puntosFavor += puntosUsuario2;
      ranking[partida.idUsuario2].puntosContra += puntosUsuario1;

      // Actualizamos la diferencia de puntos
      ranking[partida.idUsuario1].diferenciaPuntos =
        ranking[partida.idUsuario1].puntosFavor -
        ranking[partida.idUsuario1].puntosContra;
      ranking[partida.idUsuario2].diferenciaPuntos =
        ranking[partida.idUsuario2].puntosFavor -
        ranking[partida.idUsuario2].puntosContra;

      // Actualizamos las puntosTorneo
      if (partida.ganadorPartidaTorneo === partida.idUsuario1) {
        ranking[partida.idUsuario1].puntosTorneo += 3;
        ranking[partida.idUsuario1].victorias += 1;
        ranking[partida.idUsuario2].derrotas += 1;
      } else if (partida.ganadorPartidaTorneo === partida.idUsuario2) {
        ranking[partida.idUsuario2].puntosTorneo += 3;
        ranking[partida.idUsuario2].victorias += 1;
        ranking[partida.idUsuario1].derrotas += 1;
      } else {
        ranking[partida.idUsuario1].puntosTorneo += 1;
        ranking[partida.idUsuario2].puntosTorneo += 1;
        ranking[partida.idUsuario1].empates += 1;
        ranking[partida.idUsuario2].empates += 1;
      }

      // Lider muerto primero
      if (liderMuertoUsuario1) {
        ranking[partida.idUsuario1].lider += 1;
      } else if (liderMuertoUsuario2) {
        ranking[partida.idUsuario2].lider += 1;
      }
    }
  });

  inscripciones.value.forEach((inscripcion) => {
    const userId = inscripcion.idUsuario;
    if (ranking[userId]) {
      ranking[userId].puntosTorneo += inscripcion.puntosExtra;
    }
  });

  //Ordenar segun parametros
  clasificacion.value = Object.values(ranking).sort((a, b) => {
    // 1. Ordenar por puntosTorneo
    if (b.puntosTorneo !== a.puntosTorneo) {
      return b.puntosTorneo - a.puntosTorneo;
    }
    // 2. Ordenar por diferencia de puntos (puntos a favor - puntos en contra)
    if (b.diferenciaPuntos !== a.diferenciaPuntos) {
      return b.diferenciaPuntos - a.diferenciaPuntos;
    }
    // 3. Ordenar por puntos a favor
    if (b.puntosFavor !== a.puntosFavor) {
      return b.puntosFavor - a.puntosFavor;
    }
    // 4. Ordenar por quién ha matado al líder primero
    return b.lider - a.lider;
  });

  // Clasificacion por zonas
  clasificacionZona1.value = clasificacion.value.filter((jugador) =>
    jugadoresZona1.value.some((z) => z.idUsuario === jugador.idUsuario)
  );
  clasificacionZona2.value = clasificacion.value.filter((jugador) =>
    jugadoresZona2.value.some((z) => z.idUsuario === jugador.idUsuario)
  );

  type JugadorConEjercito = {
    nick: string;
    ejercito: string | null;
  };

  const jugadoresConEjercitos = partidas.value.reduce<JugadorConEjercito[]>(
    (acc, partida) => {
      acc.push({ nick: partida.nick1, ejercito: partida.ejercitoUsuario1 });
      acc.push({ nick: partida.nick2, ejercito: partida.ejercitoUsuario2 });
      return acc;
    },
    []
  );

  const listaEjercitos = appsettings.armies;

  const ejercitosJugadoresConBando = jugadoresConEjercitos.map((jugador) => {
    const ejercito = listaEjercitos.find((e) => e.name === jugador.ejercito);
    return {
      nick: jugador.nick,
      ejercito: jugador.ejercito,
      bando: ejercito ? ejercito.band : "desconocido",
      shortName: ejercito?.shortName,
    };
  });

  clasificacion.value = clasificacion.value.map((j) => {
    const datosEjercito = ejercitosJugadoresConBando.find(
      (e) => e.nick === j.nick
    );
    return {
      ...j,
      bando: datosEjercito?.bando ?? "desconocido",
      nombreCortoEjercito: datosEjercito?.shortName ?? undefined,
      ejercito: datosEjercito?.ejercito ?? undefined,
    };
  });
};

const dividirClasificacionEnZonas = () => {
  const totalJugadores = clasificacionDividida.value.length;
  const esImpar = totalJugadores % 2 !== 0;

  const mitad = Math.floor(totalJugadores / 2);
  const zona1Size = esImpar ? mitad + 1 : mitad;

  jugadoresZona1.value = clasificacionDividida.value.slice(0, zona1Size);
  jugadoresZona2.value = clasificacionDividida.value.slice(zona1Size);
};

//Este método determina si el jugador actual ha validado ya la partida o no.
const editarPartidaPJ = (partida: PartidaTorneoDTO) => {
  if (
    partida.idUsuario1 === idUsuario.value &&
    (partida.partidaValidadaUsuario1 === false ||
      partida.partidaValidadaUsuario1 === null)
  ) {
    return true;
  } else if (
    partida.idUsuario2 === idUsuario.value &&
    (partida.partidaValidadaUsuario2 === false ||
      partida.partidaValidadaUsuario2 === null)
  ) {
    return true;
  } else {
    return false;
  }
};

const soloValidarPJ = (partida: PartidaTorneoDTO) => {
  //Si somos el PJ1 y no hemos validado partida, y el PJ2 si ha validado, tenemos que validar
  if (
    partida.idUsuario1 === idUsuario.value &&
    (partida.partidaValidadaUsuario1 === false ||
      partida.partidaValidadaUsuario1 === null) &&
    partida.partidaValidadaUsuario2 === true
  ) {
    return true;
  } else if (
    partida.idUsuario2 === idUsuario.value &&
    (partida.partidaValidadaUsuario2 === false ||
      partida.partidaValidadaUsuario2 === null) &&
    partida.partidaValidadaUsuario1 === true
  ) {
    return true;
  } else {
    return false;
  }
};
</script>
