<template>torneo detalle</template>

<script setup lang="ts">
import { Torneo } from "@/interfaces/Torneo";
import { getTorneo } from "@/services/TorneosService";
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
let torneo = ref<Torneo>();

onMounted(async () => {
  const idTorneo = Number(route.params.idTorneo);
  torneo.value = await getTorneo(idTorneo);
});

const formatDate = (date: string | number | Date) =>
  new Date(date).toLocaleDateString();

const goBack = () => router.go(-1);
</script>

<style scoped></style>
