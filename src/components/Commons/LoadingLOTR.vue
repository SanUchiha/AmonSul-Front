<template>
  <v-dialog v-model="localVisible" persistent max-width="400">
    <v-card class="text-center pa-6 lotr-background">
      <v-card-text>
        <div class="lotr-spinner-3d mb-4 mx-auto"></div>
        <v-img
          src="@/assets/images/LOTR_ring.gif"
          max-width="120"
          class="mb-4 mx-auto"
        />
        <div class="lotr-text mb-2">{{ mensaje }}</div>
        <div class="lotr-quote">
          "Todo lo que tenemos que decidir es qué hacer con el tiempo que se nos
          ha dado."
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { watch, ref } from "vue";

// eslint-disable-next-line no-undef
const props = defineProps<{ isVisible: boolean; mensaje?: string }>();
// eslint-disable-next-line no-undef
const emit = defineEmits(["update:isVisible"]);
const localVisible = ref(props.isVisible);

watch(
  () => props.isVisible,
  val => {
    localVisible.value = val;
  }
);

watch(localVisible, val => {
  if (val !== props.isVisible) {
    emit("update:isVisible", val);
  }
});
</script>

<style scoped>
.lotr-background {
  background: linear-gradient(135deg, #2d1606 0%, #6b4f1d 100%);
  border: 2px solid #e2c275;
  box-shadow: 0 0 24px #e2c27599;
}
.lotr-text {
  font-family: "Ringbearer", "Georgia", serif;
  color: #e2c275;
  font-size: 1.2rem;
}
.lotr-quote {
  font-family: "Georgia", serif;
  color: #fffbe6;
  font-size: 0.95rem;
  margin-top: 1rem;
  font-style: italic;
}
.lotr-spinner-3d {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px auto;
  border-radius: 50%;
  border: 6px solid #e2c275;
  border-top: 6px solid #fffbe6;
  border-bottom: 6px solid #fffbe6;
  box-shadow: 0 0 16px #e2c27599;
  animation: lotr-spin-3d 1.2s linear infinite; /* 3D efecto visual */
  background: radial-gradient(
    ellipse at 60% 40%,
    #fffbe6 10%,
    #e2c275 60%,
    #6b4f1d 100%
  );
}
@keyframes lotr-spin-3d {
  0% {
    transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
  }
  100% {
    transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg);
  }
}
</style>
