<template>
  <!-- Un cruce destacado: al pulsarlo se elige y se ve entero -->
  <div
    class="fila pulsable text-body-2"
    role="button"
    tabindex="0"
    @click="elegir"
    @keydown.enter="elegir"
  >
    <span class="nombre">
      {{ cruce.ejercito }} <span class="text-medium-emphasis">contra</span> {{ cruce.rival }}
    </span>
    <span class="text-right">{{ cruce.partidas }}</span>
    <span class="text-right">{{ textoPorcentaje(cruce.porcentaje) }}</span>
    <span class="text-right" :class="colorRinde(cruce.rinde)">{{ textoRinde(cruce.rinde) }}</span>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps } from "vue";
import type { CruceResumenDTO } from "@/interfaces/Estadisticas";
import { colorRinde, textoPorcentaje, textoRinde } from "@/utils/estadisticasEjercitos";

const props = defineProps<{ cruce: CruceResumenDTO }>();
const emit = defineEmits<{ (event: "elegir", cruce: { ejercito: string; rival: string }): void }>();

const elegir = () => emit("elegir", { ejercito: props.cruce.ejercito, rival: props.cruce.rival });
</script>

<style scoped>
.fila {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 32px 44px 36px;
  column-gap: 8px;
  padding: 8px 4px;
  align-items: center;
}

.fila + .fila {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.pulsable {
  cursor: pointer;
}

.pulsable:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.nombre {
  overflow-wrap: anywhere;
}
</style>
