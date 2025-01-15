<template>
  <v-dialog v-model="localVisible" max-width="400">
    <v-card>
      <v-card-title class="headline">Partida Validada</v-card-title>
      <v-card-text> La partida ha sido validada exitosamente. </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="tonal" color="blue darken-1" @click="closeModal"
          >Aceptar</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from "vue";

const props = defineProps<{
  visible: boolean;
}>();

const localVisible = ref<boolean>(props.visible);

watch(
  () => props.visible,
  (newVal) => {
    localVisible.value = newVal;
  }
);

const emit = defineEmits(["update:visible", "modalAccepted"]);

const closeModal = () => {
  localVisible.value = false;
  emit("update:visible", false);
  emit("modalAccepted");
};
</script>

<style scoped></style>
