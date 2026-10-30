<template>
  <!-- Pastillas para elegir la ronda, como las jornadas de la liga; en móvil se envuelven -->
  <div class="px-2 pt-2 text-left">
    <v-chip-group
      :model-value="modelValue"
      column
      mandatory
      selected-class="text-primary"
      @update:model-value="emit('update:modelValue', $event)"
    >
      <v-chip
        v-for="n in rondas"
        :key="n"
        :value="n"
        size="small"
        filter
        :variant="generada(n) ? 'tonal' : 'outlined'"
      >
        R{{ n }}
      </v-chip>
    </v-chip-group>
    <h3 v-if="modelValue" class="text-subtitle-1 font-weight-bold mt-1">
      Ronda {{ modelValue }}
      <span v-if="!generada(modelValue)" class="text-body-2 text-medium-emphasis">
        · aún sin generar
      </span>
    </h3>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps } from "vue";

const props = defineProps<{
  modelValue?: number;
  rondas: number[];
  // Las que aún no tienen partidas van con borde, sin relleno
  partidasPorRonda: Record<number, unknown[]>;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", ronda: number): void;
}>();

const generada = (n: number) => (props.partidasPorRonda[n]?.length ?? 0) > 0;
</script>
