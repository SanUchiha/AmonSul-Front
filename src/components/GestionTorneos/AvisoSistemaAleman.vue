<template>
  <!-- Con sistema alemán se mete el resultado real: los puntos alemanes los calcula la app -->
  <v-alert
    v-if="aleman"
    type="info"
    variant="tonal"
    density="compact"
    class="mb-4 text-body-2"
  >
    Este torneo usa el sistema alemán: mete el resultado real de la partida, no
    los puntos alemanes. Los calcula la app.
    <div v-if="puntos" class="mt-1">
      Con este resultado:
      <strong>{{ puntos.jugador1 }} : {{ puntos.jugador2 }}</strong> en el
      sistema alemán.
    </div>
  </v-alert>
</template>

<script setup lang="ts">
import { computed, defineProps } from "vue";
import { useSistemaAleman } from "@/composables/useSistemaAleman";
import { calcularPuntosAleman } from "@/utils/sistemaAleman";

// El resultado que se está metiendo en el formulario
const props = defineProps<{
  resultado1?: number | string | null;
  resultado2?: number | string | null;
}>();

const aleman = useSistemaAleman();

// Lo que dará en puntos alemanes, en cuanto estén los dos
const puntos = computed(() => {
  const { resultado1: r1, resultado2: r2 } = props;
  if (typeof r1 !== "number" || typeof r2 !== "number") return null;
  if (Number.isNaN(r1) || Number.isNaN(r2)) return null;
  return calcularPuntosAleman(r1, r2);
});
</script>
