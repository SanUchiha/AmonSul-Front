<template>
  <v-card flat>
    <v-card-title class="d-flex align-center pe-2">
      Clasificación general
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        density="compact"
        label="Buscar"
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
        flat
        hide-details
        single-line
      />
    </v-card-title>
    
    <v-card-text>
      <v-data-table
        v-model:search="search"
        :items="clasificacion"
        :headers="headers"
        item-key="idUsuario"
        class="elevation-1"
        dense
        :items-per-page="10"
      >
        <template v-slot:items="props">
          <tr>
            <td>{{ props.index + 1 }}</td>
            <td>{{ props.item.nick }}</td>
            <td>{{ props.item.totalPuntos }}</td>
            <td>{{ props.item.torneosGanados }}</td>
            <td>
              <ul>
                <li
                  v-for="(puntos, index) in props.item.puntosPorTorneos"
                  :key="index"
                >
                  Torneo {{ index + 1 }}: {{ puntos }} puntos
                </li>
              </ul>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, defineProps } from "vue";

interface ClasificacionItem {
  nick: string;
  totalPuntos: number;
  torneosGanados: number;
  puntosPorTorneos: number[];
  posicion: number;
}

defineProps<{
  clasificacion: ClasificacionItem[];
}>();

const search = ref<string>("");

const headers = [
  { title: "#", key: "posicion" },
  { title: "Nick", key: "nick" },
  { title: "Puntos Totales", key: "totalPuntos" },
  { title: "Torneos Ganados", key: "torneosGanados" },
  { title: "Puntos por Torneo", key: "puntosPorTorneos" },
];
</script>