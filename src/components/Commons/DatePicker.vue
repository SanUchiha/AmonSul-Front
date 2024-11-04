<script setup lang="ts">
import { defineProps, defineEmits, ref } from "vue";
import { useDisplay } from "vuetify";

interface Props {
  label: string;
  color?: string;
  customClass?: string;
  rules?: Array<(value: string) => boolean | string>;
  variant?: string;
  density?: string;
  model?: string | Date; // Puede ser una cadena (por ejemplo, ISO) o una fecha.
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (event: "update:model", value: string | null): void; // Mantener el evento update:model
  (event: "dateChanged", value: string | null): void; // Añadir el evento personalizado
}>();

const menu = ref<boolean>(false);
const model = ref<Date | null>(null); // Definir model como ref para que sea reactivo.
const formattedDate = ref<string>("");

const { width, xs } = useDisplay();

// Función para formatear la fecha
function formatDate(inputDate: Date | null): string {
  if (!inputDate) return "";
  const parsedDate = new Date(inputDate);
  if (isNaN(parsedDate.getTime())) return ""; // Verificar si la fecha es inválida.

  const day = `0${parsedDate.getDate()}`.slice(-2);
  const month = `0${parsedDate.getMonth() + 1}`.slice(-2);
  const year = parsedDate.getFullYear();
  return `${day}/${month}/${year}`;
}

const handleDateChange = (newDate: Date | null) => {
  formattedDate.value = formatDate(newDate);
  emit("update:model", formattedDate.value); // Emitiendo el evento de v-model
  emit("dateChanged", formattedDate.value); // Emitiendo el evento personalizado
  closeDatePicker();
};

const closeDatePicker = () => {
  menu.value = false;
};
</script>

<template>
  <v-menu v-model="menu" location="center">
    <template v-slot:activator="{ props: activatorProps }">
      <v-text-field
        v-model="formattedDate"
        :class="props.customClass"
        :density="props.density"
        :label="props.label"
        :rules="props.rules"
        :variant="props.variant"
        hide-details
        prepend-inner-icon="mdi-calendar"
        readonly
        v-bind="activatorProps"
        @click:clear="
          () => {
            formattedDate = '';
            model = null;
            emit('update:model', null); // Emitimos para limpiar v-model
            emit('dateChanged', null); // Emitimos el evento personalizado al limpiar
          }
        "
      />
    </template>
    <div class="position-relative">
      <v-date-picker
        v-model="model"
        :color="props.color"
        :width="xs ? width - 30 : 'auto'"
        height="auto"
        show-adjacent-months
        @update:modelValue="handleDateChange"
      />
      <v-btn
        class="position-absolute top-0 right-0"
        color="white"
        icon="mdi-close"
        size="small"
        variant="text"
        @click="menu = false"
      />
    </div>
  </v-menu>
</template>

<style>
.v-overlay__content:has(> .v-date-picker) {
  min-width: auto !important;
}

.v-picker-title {
  padding: 0 !important;
}

@media only screen and (max-width: 400px) {
  .v-overlay__content:has(> .v-date-picker) {
    left: 0 !important;
  }
}
</style>
