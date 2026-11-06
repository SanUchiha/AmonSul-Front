<template>
  <!-- Mejor decirlo que dejar la página en blanco o dar a entender que no hay nada -->
  <v-alert type="warning" variant="tonal" density="comfortable" class="my-2">
    {{ mensaje }}
    <div class="mt-2">
      <v-btn size="small" variant="tonal" class="text-none" @click="emit('reintentar')">Reintentar</v-btn>
    </div>
  </v-alert>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, withDefaults } from "vue";

withDefaults(defineProps<{ mensaje?: string }>(), {
  mensaje: "No se ha podido cargar. Comprueba la conexión o vuelve a intentarlo.",
});

const emit = defineEmits<{ (e: "reintentar"): void }>();
</script>
