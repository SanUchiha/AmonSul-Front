<template>
  <v-dialog v-model="localVisible" persistent width="400">
    <v-card>
      <v-card-title class="headline">Confirmación</v-card-title>
      <v-card-text>
        <p>Te has apuntado al torneo con éxito.</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="handleOk">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, defineEmits, defineProps } from "vue";

const props = defineProps<{
  isVisible: boolean;
}>();
const emit = defineEmits<{
  (event: "close"): void;
}>();

const localVisible = ref(props.isVisible);

watch(
  () => props.isVisible,
  (newValue) => {
    localVisible.value = newValue;
  }
);

const handleOk = () => {
  emit("close");
};
</script>
