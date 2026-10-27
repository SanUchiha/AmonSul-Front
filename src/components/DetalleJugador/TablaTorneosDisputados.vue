<template>
  <v-card class="section-card stats-section pt-0 mt-0">
    <v-col cols="12">
      <p class="text-h5 ringbearer">Resultados en Torneos</p>
    </v-col>
    <v-divider></v-divider>
    <v-data-table
      :headers="headers"
      :items="resumenTorneos"
      :loading="isLoading"
      class="elevation-1"
      :items-per-page="10"
      :search="search"
      no-data-text="No ha jugado torneos"
    >
      <template #top>
        <v-text-field
          v-model="search"
          label="Buscar torneo"
          class="mx-4 my-2"
          clearable
        />
      </template>
      <template #[`item.posicion`]="{ item }">
        <v-chip
          v-if="item.posicion !== null"
          :color="colorPosicion(item.posicion)"
          size="small"
        >
          {{ item.posicion }}
        </v-chip>
        <span v-else>-</span>
      </template>
      <template #[`item.ved`]="{ item }">
        <span class="text-success">{{ item.victorias }}</span> -
        <span>{{ item.empates }}</span> -
        <span class="text-error">{{ item.derrotas }}</span>
      </template>
      <template #[`item.puntos`]="{ item }">
        {{ item.puntosFavor }} - {{ item.puntosContra }}
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ViewPartidaTorneoDTO } from "@/interfaces/Partidas";
import { ClasificacionTorneosDTO } from "@/interfaces/Usuario";

interface ResumenTorneo {
  clave: string;
  nombreTorneo: string;
  posicion: number | null;
  jugadas: number;
  victorias: number;
  empates: number;
  derrotas: number;
  puntosFavor: number;
  puntosContra: number;
  ejercito: string;
  ultimaFecha: number;
}

// eslint-disable-next-line no-undef
const props = defineProps<{
  clasificacionTorneos: ClasificacionTorneosDTO[];
  tournamentMatches: ViewPartidaTorneoDTO[];
  idUsuario: number;
  isLoading?: boolean;
}>();

const search = ref("");

const headers = [
  { title: "Torneo", key: "nombreTorneo" },
  { title: "Pos", key: "posicion" },
  { title: "PJ", key: "jugadas" },
  { title: "V-E-D", key: "ved", sortable: false },
  { title: "PF-PC", key: "puntos", sortable: false },
  { title: "Ejército", key: "ejercito" },
];

// Agrupa por idTorneo; si el back aún no lo envía, por nombre
const claveTorneo = (idTorneo?: number, nombreTorneo?: string) =>
  idTorneo ? `id-${idTorneo}` : `nombre-${nombreTorneo ?? ""}`;

const nuevoResumen = (clave: string, nombreTorneo: string): ResumenTorneo => ({
  clave,
  nombreTorneo,
  posicion: null,
  jugadas: 0,
  victorias: 0,
  empates: 0,
  derrotas: 0,
  puntosFavor: 0,
  puntosContra: 0,
  ejercito: "-",
  ultimaFecha: 0,
});

const ejercitoMasJugado = (ejercitos: string[]): string => {
  const conteo = new Map<string, number>();
  ejercitos.forEach(e => conteo.set(e, (conteo.get(e) ?? 0) + 1));
  let masJugado = "-";
  let maximo = 0;
  conteo.forEach((veces, ejercito) => {
    if (veces > maximo) {
      masJugado = ejercito;
      maximo = veces;
    }
  });
  return masJugado;
};

const resumenTorneos = computed<ResumenTorneo[]>(() => {
  const resumen = new Map<string, ResumenTorneo>();
  const ejercitos = new Map<string, string[]>();

  const obtenerFila = (clave: string, nombreTorneo: string): ResumenTorneo => {
    let fila = resumen.get(clave);
    if (!fila) {
      fila = nuevoResumen(clave, nombreTorneo);
      resumen.set(clave, fila);
    }
    return fila;
  };

  (props.tournamentMatches ?? []).forEach(partida => {
    // Partidas sin resultado todavía (ronda en juego) no cuentan
    if (partida.resultadoUsuario1 == null || partida.resultadoUsuario2 == null)
      return;

    const clave = claveTorneo(partida.idTorneo, partida.nombreTorneo);
    const fila = obtenerFila(clave, partida.nombreTorneo ?? "-");

    const esJugador1 = partida.idUsuario1 === props.idUsuario;
    const propios = esJugador1
      ? partida.resultadoUsuario1
      : partida.resultadoUsuario2;
    const rival = esJugador1
      ? partida.resultadoUsuario2
      : partida.resultadoUsuario1;

    fila.jugadas++;
    fila.puntosFavor += propios;
    fila.puntosContra += rival;
    if (partida.ganadorPartidaTorneo === props.idUsuario) fila.victorias++;
    else if (!partida.ganadorPartidaTorneo) fila.empates++;
    else fila.derrotas++;

    const fecha = partida.fechaPartida
      ? new Date(partida.fechaPartida).getTime()
      : 0;
    fila.ultimaFecha = Math.max(fila.ultimaFecha, fecha);

    const ejercito = esJugador1
      ? partida.ejercitoUsuario1
      : partida.ejercitoUsuario2;
    if (ejercito && ejercito !== "N/A") {
      ejercitos.set(clave, [...(ejercitos.get(clave) ?? []), ejercito]);
    }
  });

  ejercitos.forEach((lista, clave) => {
    obtenerFila(clave, "-").ejercito = ejercitoMasJugado(lista);
  });

  // La posición viene de la clasificación guardada al cerrar el torneo
  (props.clasificacionTorneos ?? []).forEach(clasificacion => {
    const clave = claveTorneo(clasificacion.idTorneo, clasificacion.nombreTorneo);
    obtenerFila(clave, clasificacion.nombreTorneo).posicion =
      clasificacion.resultado;
  });

  return [...resumen.values()].sort((a, b) => b.ultimaFecha - a.ultimaFecha);
});

const colorPosicion = (posicion: number) => {
  if (posicion === 1) return "amber-darken-2";
  if (posicion === 2) return "blue-grey-lighten-1";
  if (posicion === 3) return "brown-lighten-1";
  return "primary";
};
</script>
