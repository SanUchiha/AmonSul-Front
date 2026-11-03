<template>
  <v-autocomplete
    :model-value="modelValue"
    :items="ejercitos"
    item-title="name"
    item-value="name"
    label="Ejército"
    auto-select-first
    @update:model-value="valor => emit('update:modelValue', valor)"
  >
    <template #item="{ item, props: itemProps }">
      <v-list-item
        v-bind="itemProps"
        :subtitle="item.raw.band === 'good' ? 'Luz' : 'Oscuridad'"
      />
    </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
import { defineEmits, defineProps } from "vue";
import { appsettings } from "@/settings/appsettings";

defineProps<{ modelValue: string | null }>();
const emit = defineEmits<{
  (e: "update:modelValue", valor: string | null): void;
}>();

const ejercitos = [...appsettings.armies].sort((a, b) =>
  a.name.localeCompare(b.name)
);
</script>
