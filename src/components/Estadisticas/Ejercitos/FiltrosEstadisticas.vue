<template>
  <!-- Los filtros comunes, en pastillas que se envuelven: temporada, puntos y, si se pide, bando; y las amistosas.
       De temporadas y puntos se pueden marcar varias; «Todas» y «Todos los puntos» quitan las marcadas -->
  <div class="d-flex flex-column align-center ga-1 mb-3">
    <div class="d-flex flex-wrap justify-center ga-1">
      <v-chip
        v-for="anio in ANIOS"
        :key="anio"
        size="small"
        :color="temporadas.includes(anio) ? 'primary' : undefined"
        @click="cambiar({ temporadas: alternar(temporadas, anio) })"
      >
        {{ anio }}
      </v-chip>
      <v-chip
        size="small"
        :color="temporadas.length === 0 ? 'primary' : undefined"
        @click="cambiar({ temporadas: [] })"
      >
        Todas
      </v-chip>
    </div>
    <div class="d-flex flex-wrap justify-center ga-1">
      <v-chip
        size="small"
        :color="tramos.length === 0 ? 'primary' : undefined"
        @click="cambiar({ tramos: [] })"
      >
        Todos los puntos
      </v-chip>
      <v-chip
        v-for="tramo in TRAMOS"
        :key="tramo.valor"
        size="small"
        :color="tramos.includes(tramo.valor) ? 'primary' : undefined"
        @click="cambiar({ tramos: alternar(tramos, tramo.valor) })"
      >
        {{ tramo.texto }}
      </v-chip>
    </div>
    <div class="d-flex flex-wrap justify-center ga-1">
      <template v-if="conBando">
        <v-chip
          size="small"
          :color="!modelValue.bando ? 'primary' : undefined"
          @click="cambiar({ bando: null })"
        >
          Los dos bandos
        </v-chip>
        <v-chip
          size="small"
          :color="modelValue.bando === 'good' ? 'primary' : undefined"
          @click="cambiar({ bando: 'good' })"
        >
          Bien
        </v-chip>
        <v-chip
          size="small"
          :color="modelValue.bando === 'evil' ? 'primary' : undefined"
          @click="cambiar({ bando: 'evil' })"
        >
          Mal
        </v-chip>
      </template>
      <v-chip
        size="small"
        :color="modelValue.amistosas ? 'primary' : undefined"
        :prepend-icon="modelValue.amistosas ? 'mdi-check' : undefined"
        @click="cambiar({ amistosas: !modelValue.amistosas })"
      >
        Con amistosas
      </v-chip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps } from "vue";
import type { FiltroEstadisticas } from "@/interfaces/Estadisticas";
import { TRAMOS } from "@/utils/estadisticasEjercitos";

const props = defineProps<{
  modelValue: FiltroEstadisticas;
  conBando?: boolean;
}>();
const emit = defineEmits<{
  (event: "update:modelValue", filtro: FiltroEstadisticas): void;
}>();

// Este año y el anterior, más «Todas»: antes de 2025 apenas hay partidas
const ACTUAL = new Date().getFullYear();
const ANIOS = [ACTUAL, ACTUAL - 1];

const temporadas = computed(() => props.modelValue.temporadas ?? []);
const tramos = computed(() => props.modelValue.tramos ?? []);

// Marca o desmarca una pastilla dentro de su grupo
const alternar = <T,>(lista: T[], valor: T): T[] =>
  lista.includes(valor) ? lista.filter(v => v !== valor) : [...lista, valor];

const cambiar = (cambio: Partial<FiltroEstadisticas>) =>
  emit("update:modelValue", { ...props.modelValue, ...cambio });
</script>
