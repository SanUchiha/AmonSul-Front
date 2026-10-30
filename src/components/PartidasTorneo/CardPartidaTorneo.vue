<template>
  <!-- div raíz: así la clase que pasan los padres (mb-4...) se aplica aunque haya modales -->
  <div>
    <CardPartidaLectura
      :contexto="contexto"
      :fecha="formatFechaSpaWhitoutAsync(match.fechaPartida)"
      :jugador1="{
        idUsuario: match.idUsuario1,
        nick: match.nickUsuario1,
        ejercito: match.ejercitoUsuario1,
        puntos: match.resultadoUsuario1,
        companero: companero1,
      }"
      :jugador2="{
        idUsuario: match.idUsuario2,
        nick: match.nickUsuario2,
        ejercito: match.ejercitoUsuario2,
        puntos: match.resultadoUsuario2,
        companero: companero2,
      }"
      :escenario="match.escenarioPartida"
      :puntosPartida="match.puntosPartida || match.puntosTorneo"
      :idGanador="match.ganadorPartidaTorneo"
      :idUsuarioDestacado="idUsuario"
      :listasVisibles="!!match.idTorneo && match.mostrarListas === true"
      :eloVariacion="eloVariacion"
      @verLista="verLista"
    />

    <!-- Modal lista -->
    <ModalListaResultadoTorneo
      v-if="isModalListaVisible"
      :listaData="listaData"
      :nickJugador="nickJugador"
      :ejercito="ejercitoLista"
      @close="isModalListaVisible = false"
    />

    <ModalError
      :isVisible="showErrorLista"
      titulo="Aviso"
      :message="mensajeErrorLista"
      @update:isVisible="showErrorLista = $event"
    />

    <!-- Spinner carga lista -->
    <v-dialog v-model="isLoadingLista" persistent width="300">
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
  </div>
</template>

<script setup lang="ts">
import { FORMATO_COPA, esPorJornadas } from "@/Constant/FormatoTorneo";
import { etiquetaPartidaCopa } from "@/utils/cuadroCopa";
import { computed, ref } from "vue";
import { ViewPartidaTorneoDTO } from "@/interfaces/Partidas";
import { formatFechaSpaWhitoutAsync } from "@/utils/Fecha";
import { motivoSinLista, SIN_LISTA } from "@/utils/avisoLista";
import { getlistaTorneo } from "@/services/ListasService";
import CardPartidaLectura, {
  JugadorPartidaLectura,
} from "@/components/Commons/CardPartidaLectura.vue";
import ModalListaResultadoTorneo from "@/components/ResultadosTorneos/ModalListaResultadoTorneo.vue";
import ModalError from "@/components/Commons/ModalError.vue";

//eslint-disable-next-line no-undef
const props = withDefaults(
  defineProps<{
    match: ViewPartidaTorneoDTO;
    idUsuario: number;
    // En el modal de un torneo el nombre ya está en el título
    mostrarTorneo?: boolean;
  }>(),
  { mostrarTorneo: true }
);

const isLoadingLista = ref<boolean>(false);
const isModalListaVisible = ref<boolean>(false);
const showErrorLista = ref<boolean>(false);
const mensajeErrorLista = ref<string>("");
const listaData = ref<string>("");
const nickJugador = ref<string>("");
const ejercitoLista = ref<string>();

const contexto = computed(() =>
  [
    props.mostrarTorneo ? props.match.nombreTorneo : "",
    props.match.formatoTorneo === FORMATO_COPA && props.match.fase && props.match.numeroRonda
      ? etiquetaPartidaCopa({
          fase: props.match.fase,
          grupo: props.match.grupo,
          numeroRonda: props.match.numeroRonda,
        })
      : props.match.numeroRonda
        ? `${esPorJornadas(props.match.formatoTorneo) ? "Jornada" : "Ronda"} ${props.match.numeroRonda}`
        : "",
  ]
    .filter(Boolean)
    .join(" · ")
);

// Solo en Parejas: compañeros de los capitanes
const companero1 = computed<JugadorPartidaLectura | null>(() =>
  props.match.idCompanero1
    ? {
        idUsuario: props.match.idCompanero1,
        nick: props.match.nickCompanero1 ?? undefined,
        ejercito: props.match.ejercitoCompanero1,
      }
    : null
);
const companero2 = computed<JugadorPartidaLectura | null>(() =>
  props.match.idCompanero2
    ? {
        idUsuario: props.match.idCompanero2,
        nick: props.match.nickCompanero2 ?? undefined,
        ejercito: props.match.ejercitoCompanero2,
      }
    : null
);

// ELO del jugador del perfil en esta partida; en Parejas los dos de un lado ganan o pierden lo mismo
const eloVariacion = computed(() => {
  if (
    props.idUsuario === props.match.idUsuario1 ||
    props.idUsuario === props.match.idCompanero1
  )
    return props.match.eloVariacionUsuario1 ?? null;
  if (
    props.idUsuario === props.match.idUsuario2 ||
    props.idUsuario === props.match.idCompanero2
  )
    return props.match.eloVariacionUsuario2 ?? null;
  return null;
});

const verLista = async (jugador: JugadorPartidaLectura) => {
  if (!props.match.idTorneo) return;
  isLoadingLista.value = true;
  try {
    const response = await getlistaTorneo({
      idTorneo: props.match.idTorneo,
      idUsuario: jugador.idUsuario,
    });
    // Sin lista el modal se quedaría cargando para siempre: mejor avisar
    if (!response.data?.listaData) {
      mensajeErrorLista.value = SIN_LISTA;
      showErrorLista.value = true;
      return;
    }
    listaData.value = response.data.listaData;
    nickJugador.value = jugador.nick ?? "";
    ejercitoLista.value = response.data.ejercito ?? jugador.ejercito ?? "";
    isModalListaVisible.value = true;
  } catch (error) {
    console.error("Error al cargar la lista:", error);
    mensajeErrorLista.value = motivoSinLista(error);
    showErrorLista.value = true;
  } finally {
    isLoadingLista.value = false;
  }
};
</script>
