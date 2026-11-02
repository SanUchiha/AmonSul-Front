<template>
  <!-- Antes de inscribirse: el ejército (en liga y copa) y si comparte su correo con el organizador -->
  <v-dialog v-model="visible" max-width="480">
    <v-card>
      <v-card-title class="text-wrap">{{ titulo }}</v-card-title>
      <v-card-text>
        <template v-if="pedirEjercito">
          <p class="text-body-2 mb-3">
            Llevas este ejército en todas tus partidas. Puedes cambiar de lista antes de cada una, pero
            siempre de este ejército.
          </p>
          <SelectorEjercito v-model="ejercito" />
        </template>

        <v-checkbox
          v-model="compartirEmail"
          color="primary"
          density="compact"
          hide-details="auto"
          label="Compartir mi correo con el organizador"
          messages="Para que pueda contactarte si hace falta. Puedes cambiarlo cuando quieras en Mi inscripción."
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="grey" variant="text" @click="visible = false">Cancelar</v-btn>
        <v-btn
          color="primary"
          variant="tonal"
          :disabled="pedirEjercito && !ejercito"
          @click="confirmar"
        >
          Inscribirme
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, ref, watch } from "vue";
import SelectorEjercito from "./SelectorEjercito.vue";

const props = defineProps<{
  isVisible: boolean;
  titulo: string;
  // Liga y Copa: el ejército de todo el evento se elige al inscribirse
  pedirEjercito: boolean;
}>();

const emit = defineEmits<{
  (e: "update:isVisible", valor: boolean): void;
  (e: "confirm", datos: { ejercito: string | null; compartirEmail: boolean }): void;
}>();

const visible = computed({
  get: () => props.isVisible,
  set: valor => emit("update:isVisible", valor),
});

const ejercito = ref<string | null>(null);
// Sin marcar: el correo solo se comparte si el jugador lo elige
const compartirEmail = ref(false);

watch(
  () => props.isVisible,
  abierto => {
    if (!abierto) return;
    ejercito.value = null;
    compartirEmail.value = false;
  }
);

const confirmar = () => {
  if (props.pedirEjercito && !ejercito.value) return;
  emit("confirm", { ejercito: ejercito.value, compartirEmail: compartirEmail.value });
  visible.value = false;
};
</script>
