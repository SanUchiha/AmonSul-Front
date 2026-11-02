<template>
  <!-- Los eventos del circuito: cada uno lleva a su página -->
  <div>
    <p class="text-caption text-medium-emphasis mb-2">
      {{ torneos.length }} {{ torneos.length === 1 ? "evento" : "eventos" }}
    </p>
    <v-card v-if="torneos.length > 0" variant="outlined" class="lista">
      <v-list density="compact" bg-color="transparent" class="py-0">
        <template v-for="(torneo, i) in torneos" :key="torneo.idTorneo">
          <v-divider v-if="i > 0" />
          <v-list-item :to="`/detalle-evento/${torneo.idTorneo}`" append-icon="mdi-chevron-right">
            <v-list-item-title class="text-body-2 nombre">{{ torneo.torneoNombre }}</v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
    <p v-else class="text-body-2 text-medium-emphasis mb-0">Aún no tiene eventos.</p>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";
import { CircuitoTorneosDTO } from "@/interfaces/Circuito";

defineProps<{
  torneos: CircuitoTorneosDTO[];
}>();
</script>

<style lang="scss" scoped>
/* Con muchos eventos, la lista se desplaza y los botones quedan a la vista */
.lista {
  max-height: 320px;
  overflow-y: auto;
}

.nombre {
  overflow-wrap: anywhere;
  white-space: normal;
}
</style>
