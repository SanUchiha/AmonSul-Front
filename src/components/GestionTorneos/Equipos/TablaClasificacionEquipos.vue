<template>
  <v-table v-if="clasificacion.length > 0" density="compact">
    <thead>
      <tr>
        <th class="text-center">#</th>
        <th class="text-center">Equipo</th>
        <th class="text-center">Puntos</th>
        <th class="text-center">Puntos a favor</th>
        <th class="text-center">Puntos en contra</th>
        <th class="text-center">Diferencia</th>
        <th class="text-center">G. Muertos</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(equipo, index) in clasificacion" :key="equipo.idEquipo">
        <td class="text-center">{{ index + 1 }}</td>
        <td class="text-center">{{ equipo.nombreEquipo }}</td>
        <td class="text-center">{{ equipo.puntos }}</td>
        <td class="text-center">{{ equipo.puntosFavor }}</td>
        <td class="text-center">{{ equipo.puntosContra }}</td>
        <td class="text-center">{{ equipo.diferencia }}</td>
        <td class="text-center">{{ equipo.lideresMatados }}</td>
      </tr>
    </tbody>
  </v-table>
  <div v-else>
    <p>Esperando resultados...</p>
  </div>
</template>

<script setup lang="ts">
import { ClasificacionEquipo } from "@/interfaces/Torneo";
import { defineProps } from "vue";

const props = defineProps<{
  clasificacion: ClasificacionEquipo[];
}>();
</script>
