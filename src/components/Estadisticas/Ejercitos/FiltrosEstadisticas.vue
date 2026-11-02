<template>
  <!-- Los filtros comunes, en pastillas que se envuelven: temporada, puntos y, si se pide, bando; y las amistosas -->
  <div class="d-flex flex-column align-center ga-1 mb-3">
    <div class="d-flex flex-wrap justify-center ga-1">
      <v-chip
        v-for="opcion in temporadas"
        :key="String(opcion.valor)"
        size="small"
        :color="modelValue.temporada === opcion.valor ? 'primary' : undefined"
        @click="cambiar({ temporada: opcion.valor })"
      >
        {{ opcion.texto }}
      </v-chip>
    </div>
    <div class="d-flex flex-wrap justify-center ga-1">
      <v-chip
        size="small"
        :color="!modelValue.tramo ? 'primary' : undefined"
        @click="cambiar({ tramo: null })"
      >
        Todos los puntos
      </v-chip>
      <v-chip
        v-for="tramo in TRAMOS"
        :key="tramo.valor"
        size="small"
        :color="modelValue.tramo === tramo.valor ? 'primary' : undefined"
        @click="cambiar({ tramo: tramo.valor })"
      >
        {{ tramo.texto }}
      </v-chip>
    </div>
    <div class="d-flex flex-wrap justify-center ga-1">
      <template v-if="conBando">
        <v-chip size="small" :color="!modelValue.bando ? 'primary' : undefined" @click="cambiar({ bando: null })">
          Los dos bandos
        </v-chip>
        <v-chip size="small" :color="modelValue.bando === 'good' ? 'primary' : undefined" @click="cambiar({ bando: 'good' })">
          Bien
        </v-chip>
        <v-chip size="small" :color="modelValue.bando === 'evil' ? 'primary' : undefined" @click="cambiar({ bando: 'evil' })">
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
import { defineEmits, defineProps } from "vue";
import type { FiltroEstadisticas } from "@/interfaces/Estadisticas";
import { TRAMOS } from "@/utils/estadisticasEjercitos";

const props = defineProps<{ modelValue: FiltroEstadisticas; conBando?: boolean }>();
const emit = defineEmits<{ (event: "update:modelValue", filtro: FiltroEstadisticas): void }>();

// Este año, el anterior y todas: antes de 2025 apenas hay partidas
const anio = new Date().getFullYear();
const temporadas: { valor: number | null; texto: string }[] = [
  { valor: anio, texto: String(anio) },
  { valor: anio - 1, texto: String(anio - 1) },
  { valor: null, texto: "Todas" },
];

const cambiar = (cambio: Partial<FiltroEstadisticas>) => emit("update:modelValue", { ...props.modelValue, ...cambio });
</script>
