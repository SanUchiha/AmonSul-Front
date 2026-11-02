<template>
  <!-- La clasificación final de un evento sin salir del circuito: la guardada, la misma que reparte los puntos -->
  <v-dialog :model-value="modelValue" max-width="480" scrollable @update:model-value="cerrar">
    <v-card v-if="evento">
      <v-card-title class="text-wrap pb-0">{{ evento.nombreTorneo }}</v-card-title>
      <v-card-subtitle class="pb-2">Clasificación final · {{ posiciones.length }} jugadores</v-card-subtitle>
      <v-card-text class="pt-0">
        <div class="fila cabecera text-caption text-medium-emphasis">
          <span>#</span>
          <span>Jugador</span>
          <span class="text-right">Circuito</span>
        </div>
        <div
          v-for="posicion in posiciones"
          :key="posicion.idUsuario"
          class="fila text-body-2"
          :class="{ resaltada: posicion.idUsuario === idUsuario }"
        >
          <span class="text-medium-emphasis">{{ posicion.resultado }}</span>
          <span class="nick" :class="{ 'font-weight-bold': posicion.idUsuario === idUsuario }">{{ posicion.nick }}</span>
          <span class="text-right">{{ puntosPorResultado[posicion.resultado - 1] ?? "" }}</span>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn variant="text" size="small" class="text-none" :to="`/detalle-evento/${evento.idTorneo}?tab=resultados`">
          Ver el evento
        </v-btn>
        <v-spacer />
        <v-btn variant="text" class="text-none" @click="cerrar">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { defineEmits, defineProps } from "vue";
import { GanadorDTO } from "@/interfaces/Ganadores";

defineProps<{
  modelValue: boolean;
  evento: { idTorneo: number; nombreTorneo: string } | null;
  posiciones: GanadorDTO[];
  // El jugador desde el que se ha abierto, resaltado
  idUsuario: number | null;
  puntosPorResultado: number[];
}>();
const emit = defineEmits<{ (event: "update:modelValue", valor: boolean): void }>();

const cerrar = () => emit("update:modelValue", false);
</script>

<style scoped>
.fila {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 56px;
  column-gap: 8px;
  padding: 6px 4px;
}

.fila + .fila {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.cabecera {
  padding-top: 0;
}

.resaltada {
  background: rgba(var(--v-theme-primary), 0.12);
  border-radius: 4px;
}

.nick {
  overflow-wrap: anywhere;
}
</style>
