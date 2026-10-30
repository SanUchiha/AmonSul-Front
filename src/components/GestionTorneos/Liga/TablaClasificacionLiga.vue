<template>
  <v-table density="compact" class="text-caption">
    <thead>
      <tr>
        <th class="px-1">#</th>
        <th class="px-1 text-left">Jugador</th>
        <th class="px-1 text-center">PJ</th>
        <th class="px-1 text-center">V-E-D</th>
        <th class="px-1 text-center">Pts</th>
        <th class="px-1 text-center">Dif</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="fila in filas"
        :key="fila.idUsuario"
        :class="{ 'fila-propia': fila.idUsuario === idUsuario }"
      >
        <td
          class="px-1"
          :class="{ 'fila-clasificada': clasificados?.includes(fila.idUsuario) }"
        >
          {{ fila.posicion }}
        </td>
        <td class="px-1 text-left">
          <div class="font-weight-bold">{{ fila.nick }}</div>
          <div class="text-medium-emphasis">{{ fila.ejercito }}</div>
        </td>
        <td class="px-1 text-center">{{ fila.jugadas }}</td>
        <td class="px-1 text-center text-no-wrap">
          {{ fila.victorias }}-{{ fila.empates }}-{{ fila.derrotas }}
        </td>
        <td class="px-1 text-center font-weight-bold">
          {{ fila.puntos }}
        </td>
        <td class="px-1 text-center">{{ fila.diferencia }}</td>
      </tr>
    </tbody>
  </v-table>
  <p v-if="!sinNota" class="text-caption text-medium-emphasis mt-2 text-left">
    Solo cuentan las partidas validadas por los dos jugadores. Desempate:
    puntos, diferencia, puntos a favor y generales.
  </p>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { FilaClasificacionLiga } from "@/utils/clasificacionLiga";

defineProps<{
  filas: FilaClasificacionLiga[];
  // Se resalta la fila del jugador que mira
  idUsuario?: number;
  // Copa: los que pasan a la eliminatoria
  clasificados?: number[];
  // Con varias tablas seguidas, la nota va una sola vez debajo de todas
  sinNota?: boolean;
}>();
</script>

<style scoped>
.fila-propia {
  color: rgb(224, 175, 13);
}
.fila-clasificada {
  border-left: 4px solid rgb(var(--v-theme-success));
  font-weight: bold;
}
</style>
