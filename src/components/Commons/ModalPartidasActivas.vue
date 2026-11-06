<template>
  <v-dialog v-model="modelValueProxy" max-width="500">
    <v-card>
      <v-card-title class="headline">Partidas de hoy</v-card-title>
      <v-card-text>
        <div v-if="estaJugando.partidas && estaJugando.partidas.length > 0">
          <ListaPartidasDeHoy :estaJugando="estaJugando" :idUsuario="idUsuario" />
        </div>
        <div v-else>No tienes partidas activas.</div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="tonal" @click="close">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { EstaJugandoDTO } from "@/interfaces/Partidas";
import { computed } from "vue";
import ListaPartidasDeHoy from "@/components/Commons/ListaPartidasDeHoy.vue";

// eslint-disable-next-line no-undef
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  estaJugando: {
    type: Object as () => EstaJugandoDTO,
    default: () => ({}),
  },
  idUsuario: {
    type: Number,
    required: true,
  },
});

// eslint-disable-next-line no-undef
const emit = defineEmits(["update:modelValue"]);

const modelValueProxy = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

function close() {
  emit("update:modelValue", false);
}
</script>

<style scoped>
.v-dialog {
  z-index: 2000;
}
</style>
