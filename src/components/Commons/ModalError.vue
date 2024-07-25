<template>
  <v-dialog v-model="internalIsVisible" max-width="400">
    <v-card>
      <v-card-title class="headline">Error</v-card-title>
      <v-card-text>{{ message }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="close">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from "vue";

const props = defineProps<{
  isVisible: boolean;
  message: string;
}>();
const internalIsVisible = ref(props.isVisible);

watch(
  () => props.isVisible,
  (newVal) => {
    internalIsVisible.value = newVal;
  }
);

const emit = defineEmits(["update:isVisible"]);

const close = () => {
  emit("update:isVisible", false);
  internalIsVisible.value = false;
};
</script>
