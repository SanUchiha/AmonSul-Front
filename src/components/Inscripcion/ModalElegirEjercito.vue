<template>
  <v-dialog v-model="visible" max-width="480">
    <v-card>
      <v-card-title class="text-wrap">{{ titulo }}</v-card-title>
      <v-card-text>
        <p class="text-body-2 mb-3">
          {{
            texto ??
            "En la liga llevas este ejército en todas tus partidas. Puedes cambiar de lista en cada jornada, pero siempre de este ejército."
          }}
        </p>
        <v-autocomplete
          v-model="ejercito"
          :items="ejercitos"
          item-title="name"
          item-value="name"
          label="Ejército"
          auto-select-first
        >
          <template #item="{ item, props: itemProps }">
            <v-list-item
              v-bind="itemProps"
              :subtitle="item.raw.band === 'good' ? 'Luz' : 'Oscuridad'"
            />
          </template>
        </v-autocomplete>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="grey" variant="text" @click="visible = false">
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          variant="tonal"
          :disabled="!ejercito"
          @click="confirmar"
        >
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, ref, watch } from "vue";
import { appsettings } from "@/settings/appsettings";

const props = defineProps<{
  isVisible: boolean;
  titulo: string;
  ejercitoActual?: string | null;
  // Si lo usa el organizador, el texto no le habla al jugador
  texto?: string;
}>();

const emit = defineEmits<{
  (e: "update:isVisible", valor: boolean): void;
  (e: "confirm", ejercito: string): void;
}>();

const visible = computed({
  get: () => props.isVisible,
  set: valor => emit("update:isVisible", valor),
});

const ejercitos = [...appsettings.armies].sort((a, b) =>
  a.name.localeCompare(b.name)
);
const ejercito = ref<string | null>(props.ejercitoActual ?? null);

watch(
  () => props.isVisible,
  abierto => {
    if (abierto) ejercito.value = props.ejercitoActual ?? null;
  }
);

const confirmar = () => {
  if (!ejercito.value) return;
  emit("confirm", ejercito.value);
  visible.value = false;
};
</script>
