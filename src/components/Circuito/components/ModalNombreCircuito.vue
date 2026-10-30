<template>
  <!-- El nombre de un circuito, para crearlo o renombrarlo -->
  <v-dialog v-model="show" max-width="420">
    <v-card>
      <v-card-title class="text-wrap">{{ titulo }}</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="nombre"
          label="Nombre del circuito"
          placeholder="Ej: Liga de Murcia 2027"
          variant="outlined"
          counter="100"
          maxlength="100"
          autofocus
          :error-messages="error ?? undefined"
          @keyup.enter="guardar"
        />
      </v-card-text>
      <v-card-actions class="d-flex flex-wrap ga-2">
        <v-spacer />
        <v-btn color="grey" variant="text" @click="show = false">Cancelar</v-btn>
        <v-btn
          color="primary"
          variant="tonal"
          :loading="guardando"
          :disabled="nombre.trim().length < 3"
          @click="guardar"
        >
          {{ textoBoton }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";

const props = defineProps<{
  modelValue: boolean;
  titulo: string;
  textoBoton: string;
  nombreInicial?: string;
  guardando?: boolean;
  // El motivo del back si no se pudo guardar: nombre repetido, reservado...
  error?: string | null;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void;
  (event: "guardar", nombre: string): void;
}>();

const show = computed({
  get: () => props.modelValue,
  set: (valor: boolean) => emit("update:modelValue", valor),
});

const nombre = ref("");
// Cada vez que se abre, con el nombre que tiene o vacío
watch(
  () => props.modelValue,
  abierto => {
    if (abierto) nombre.value = props.nombreInicial ?? "";
  },
  { immediate: true }
);

const guardar = () => {
  const limpio = nombre.value.trim();
  if (limpio.length >= 3 && !props.guardando) emit("guardar", limpio);
};
</script>
