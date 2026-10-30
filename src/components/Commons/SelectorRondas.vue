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
    <!-- Con un jugador elegido, cada ronda enseña solo su partida -->
    <v-autocomplete
      :model-value="jugador"
      :items="jugadores"
      item-title="nick"
      item-value="idUsuario"
      label="Partidas de un jugador"
      prepend-inner-icon="mdi-magnify"
      density="compact"
      clearable
      hide-details
      class="mt-1 mb-2"
      @update:model-value="emit('update:jugador', $event ?? null)"
    />
    <h3 v-if="modelValue" class="text-subtitle-1 font-weight-bold mt-1">
      Ronda {{ modelValue }}
      <span v-if="!generada(modelValue)" class="text-body-2 text-medium-emphasis">
        · aún sin generar
      </span>
    </h3>
    <p
      v-if="modelValue && jugador !== null && generada(modelValue) && !juegaEnRonda"
      class="text-body-2 text-medium-emphasis"
    >
      {{ nickBuscado }} no juega en esta ronda.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps } from "vue";
import { juegaEn, PartidaConJugadores } from "@/composables/useRondasEnPestana";

const props = defineProps<{
  modelValue?: number;
  rondas: number[];
  // Las que aún no tienen partidas van con borde, sin relleno
  partidasPorRonda: Record<number, PartidaConJugadores[]>;
  // Buscador de un jugador
  jugador: number | null;
  jugadores: { idUsuario: number; nick: string }[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", ronda: number): void;
  (e: "update:jugador", idUsuario: number | null): void;
}>();

const generada = (n: number) => (props.partidasPorRonda[n]?.length ?? 0) > 0;

const nickBuscado = computed(
  () => props.jugadores.find(j => j.idUsuario === props.jugador)?.nick
);
const juegaEnRonda = computed(
  () =>
    props.jugador !== null &&
    !!props.modelValue &&
    (props.partidasPorRonda[props.modelValue] ?? []).some(p =>
      juegaEn(p, props.jugador as number)
    )
);
</script>
