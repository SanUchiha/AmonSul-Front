<template>
  <v-table v-if="clasificacion.length > 0" density="compact">
    <thead>
      <tr>
        <th class="text-center">Posición</th>
        <th class="text-center">Jugador</th>
        <th class="text-center">P</th>
        <th class="text-center">PV</th>
        <th class="text-center">PD</th>
        <th class="text-center">+-</th>
        <th class="text-center">G</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(jugador, index) in clasificacion"
        :key="jugador.nick"
        :class="{
          'good-bando': jugador.bando === 'good',
          'evil-bando': jugador.bando === 'evil',
        }"
      >
        <td>{{ index + 1 }}</td>
        <td class="jugador-cell">
          <div class="jugador-contenido">
            {{ jugador.nick }}
            <v-chip
              class="ml-2"
              color="grey-lighten-2"
              text-color="black"
              label
              size="small"
              variant="tonal"
              @click="$emit('click-ejercito', jugador)"
            >
              {{ jugador.nombreCortoEjercito }}
            </v-chip>
          </div>
        </td>
        <td>{{ jugador.puntosTorneo }}</td>
        <td>{{ jugador.puntosFavor }}</td>
        <td>{{ jugador.puntosContra }}</td>
        <td>{{ jugador.diferenciaPuntos }}</td>
        <td>{{ jugador.lider }}</td>
      </tr>
    </tbody>
  </v-table>
  <div v-else><p>Esperando resultados...</p></div>
</template>

<script setup lang="ts">
import { Clasificacion } from "@/interfaces/Live";
import { defineProps, defineEmits } from "vue";

defineProps<{ clasificacion: Clasificacion[] }>();
defineEmits(["click-ejercito"]);
</script>

<style scoped>
.jugador-cell {
  text-align: center;
  padding: 8px;
}
.jugador-contenido {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}
.good-bando {
  background-color: #377746;
}
.evil-bando {
  background-color: #4b2263;
}
</style>
