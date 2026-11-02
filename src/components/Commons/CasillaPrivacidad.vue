<template>
  <!-- Obligatoria para registrarse e inscribirse. El enlace se abre aparte para no perder lo rellenado -->
  <v-checkbox
    :model-value="modelValue"
    color="primary"
    density="compact"
    hide-details="auto"
    @update:model-value="valor => emit('update:modelValue', !!valor)"
  >
    <template #label>
      <span>
        He leído y acepto la
        <a href="/politica-privacidad" target="_blank" rel="noopener" class="enlace" @click.stop>
          política de privacidad
        </a>
      </span>
    </template>
  </v-checkbox>
</template>

<script setup lang="ts">
import { defineEmits, defineProps } from "vue";

defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: "update:modelValue", valor: boolean): void }>();
</script>

<style scoped>
.enlace {
  color: rgb(var(--v-theme-primary));
}
</style>
