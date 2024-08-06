<template>
  <div>
    <h1>{{ idTorneo }}</h1>
    <!-- Display other tournament details here -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const idTorneo = ref<number>();

onMounted(() => {
  idTorneo.value = parseInt(route.params.idTorneo.toString());
});
</script>
