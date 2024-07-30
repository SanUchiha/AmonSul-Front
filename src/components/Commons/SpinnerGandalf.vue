<template>
  <v-container fluid class="d-flex align-center justify-center fill-height">
    <v-card class="text-center pa-4 card-background" max-width="90vw" outlined>
      <v-card-text>
        {{ displayText }}
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const phrase = ref(
  "Un mago nunca llega tarde; ni pronto; llega exactamente cuando se lo propone"
);
const displayText = ref("");

const updateText = () => {
  let index = 0;
  const speed = 100; // Speed of text appearance
  const delay = 1000; // Delay before restarting (1 second)

  const interval = setInterval(() => {
    if (index < phrase.value.length) {
      displayText.value += phrase.value[index++];
    } else {
      clearInterval(interval);
      setTimeout(() => {
        displayText.value = "";
        index = 0; // Reset index to restart animation
        updateText(); // Restart text update
      }, delay);
    }
  }, speed);
};

onMounted(updateText);
</script>

<style scoped>
.v-card {
  max-width: 90vw; /* Responsive max-width */
  width: 100%;
  overflow: hidden; /* Prevents overflow of content */
  position: relative; /* Ensures background covers the entire card */
  background: none; /* Removes default background */
}

.v-card-text {
  font-size: 1.2rem; /* Adjust font size for better readability */
  font-family: "Courier New", Courier, monospace; /* Monospace font for typewriter effect */
  white-space: pre-wrap; /* Preserve whitespace and line breaks */
  overflow-wrap: break-word; /* Break long words to avoid overflow */
  text-align: center; /* Center text inside the card */
  line-height: 1.5; /* Adjust line height for better readability */
  color: white; /* Make text readable against background */
  position: relative; /* Ensures text is above background */
  z-index: 1; /* Ensures text is above background */
}

.card-background {
  background-image: url("@/assets/images/Gandalf_Smoke.gif");
  background-size: cover; /* Ensures background covers entire card */
  background-position: center; /* Centers the background image */
  background-repeat: no-repeat; /* Prevents the background from repeating */
}
</style>
