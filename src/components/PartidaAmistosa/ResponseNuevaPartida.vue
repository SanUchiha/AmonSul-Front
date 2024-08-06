<template>
  <v-container>
    <div class="text-center pa-4">
      <v-dialog v-model="internalVisible" width="auto" persistent>
        <v-card max-width="400">
          <v-card-title>
            <v-icon color="success">mdi-check-circle</v-icon>
            Partida creada con éxito
          </v-card-title>
          <template v-slot:actions>
            <v-btn variant="outlined" color="blue darken-1" @click="handlerOk"
              >Ok</v-btn
            >
          </template>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
});

const emits = defineEmits(["update:isVisible"]);
const internalVisible = ref(props.isVisible);
const router = useRouter();

watch(
  () => props.isVisible,
  (newVal) => {
    internalVisible.value = newVal;
  }
);

const handlerOk = () => {
  emits("update:isVisible", false);
  internalVisible.value = false;
  router.push({ name: "dashboard" });
};

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    internalVisible.value = false;
    emits("update:isVisible", false);
  }
};
onUnmounted(() => {
  window.removeEventListener("keydown", handleEscapeKey);
});
</script>

<style scoped></style>
