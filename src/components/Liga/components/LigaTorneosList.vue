<template>
  <div>
    <v-divider class="my-2"></v-divider>
    
    <div class="torneos-header">
      <v-icon size="small" color="primary" class="mr-1">mdi-trophy</v-icon>
      <span class="torneos-count">{{ numeroTorneos }} torneos disputados</span>
    </div>
    
    <div v-if="torneos.length > 0" class="torneos-container">
      <div 
        v-for="torneo in torneos" 
        :key="torneo.idTorneo"
        class="torneo-item"
      >
        <v-icon x-small color="secondary" class="mr-1">mdi-sword-cross</v-icon>
        <span class="torneo-name">{{ torneo.torneoNombre }}</span>
      </div>
    </div>
    
    <v-alert
      v-else
      type="info"
      density="compact"
      variant="tonal"
      icon="mdi-information-outline"
      class="my-2"
    >
      No hay torneos asociados a esta liga.
    </v-alert>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineProps } from "vue";
import { LigaTorneosDTO } from "@/interfaces/Liga";

const props = defineProps<{
  torneos: LigaTorneosDTO[];
}>();

const numeroTorneos = computed(() => props.torneos.length);
</script>

<style lang="scss" scoped>
.torneos-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 4px 0;
}

.torneos-count {
  font-size: 0.9rem;
  font-weight: 600;
}

.torneos-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px 0;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
}

.torneo-item {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  font-size: 0.875rem;
  line-height: 1.2;
  border-radius: 4px;
  margin: 0 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.torneo-name {
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>