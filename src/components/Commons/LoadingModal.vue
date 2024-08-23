<template>
  <v-dialog v-model="visible" persistent max-width="290">
    <v-card>
      <v-card-title class="justify-center">
        <!-- Spinner de corona -->
        <div class="loading-spinner">
          <div class="crown">
            <div class="spike"></div>
            <div class="spike"></div>
            <div class="spike"></div>
            <div class="spike"></div>
            <div class="spike"></div>
          </div>
        </div>
      </v-card-title>
      <v-card-subtitle class="text-center"
        >Por favor, espere...</v-card-subtitle
      >
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from "vue";

const props = defineProps<{
  isVisible: boolean;
}>();

const emit = defineEmits<{
  (e: "update:isVisible", value: boolean): void;
}>();

const visible = ref(props.isVisible);

watch(
  () => props.isVisible,
  (newValue) => {
    visible.value = newValue;
  }
);

watch(visible, (newValue) => {
  emit("update:isVisible", newValue);
});
</script>

<style scoped>
.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.crown {
  width: 80px;
  height: 80px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
}

.crown::before,
.crown::after {
  content: "";
  position: absolute;
  border: 10px solid transparent;
  border-top-color: black;
  border-radius: 50%;
}

.crown::before {
  width: 40px;
  height: 40px;
  top: 0;
  left: 50%;
  transform: translateX(-50%) rotate(-30deg);
}

.crown::after {
  width: 60px;
  height: 60px;
  top: 0;
  left: 50%;
  transform: translateX(-50%) rotate(30deg);
}

.spike {
  position: absolute;
  width: 10px;
  height: 30px;
  background-color: black;
  border-radius: 5px;
  top: 0;
  transform-origin: bottom center;
}

.spike:nth-child(1) {
  transform: rotate(0deg) translateY(-20px);
}
.spike:nth-child(2) {
  transform: rotate(72deg) translateY(-20px);
}
.spike:nth-child(3) {
  transform: rotate(144deg) translateY(-20px);
}
.spike:nth-child(4) {
  transform: rotate(216deg) translateY(-20px);
}
.spike:nth-child(5) {
  transform: rotate(288deg) translateY(-20px);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.v-card-title {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
}

.v-card-subtitle {
  text-align: center;
}
</style>
