<template>
  <v-dialog v-model="internalIsVisible" max-width="400">
    <v-card>
      <v-card-title class="text-center">
        <v-icon color="purple" icon="mdi-dice-6"></v-icon>
        Éxito
        <v-icon color="purple" icon="mdi-dice-6"></v-icon>
      </v-card-title>

      <v-divider class="my-3"></v-divider>

      <v-card-text class="text-center">
        <!-- Mostrar cuenta regresiva si aún no ha llegado a 0 -->
        <template v-if="countdown > 0">
          <span class="text-h3">{{ countdown }}...</span>
        </template>
        <!-- Mostrar mensaje cuando el contador sea 0 -->
        <template v-else>
          <span class="text-h5">El ganador del sorteo es: </span>
          <span class="text-h2"
            ><strong>{{ message }}</strong></span
          >
        </template>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" variant="tonal" @click="close">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch, onBeforeUnmount } from "vue";
import confetti from "canvas-confetti";

const props = defineProps<{
  isVisible: boolean;
  message: string | undefined;
}>();
const internalIsVisible = ref<boolean>(props.isVisible);
const countdown = ref<number>(5);
let countdownInterval: ReturnType<typeof setInterval> | null = null;

const emit = defineEmits(["update:isVisible"]);

const close = () => {
  emit("update:isVisible", false);
  internalIsVisible.value = false;
};

const startConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
};

const startCountdown = () => {
  countdown.value = 5;
  countdownInterval = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value -= 1;
    } else {
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
        startConfetti();
      }
    }
  }, 1000);
};

watch(
  () => props.isVisible,
  (newVal) => {
    internalIsVisible.value = newVal;
    if (newVal) {
      startCountdown();
    }
  }
);

onBeforeUnmount(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
});
</script>
