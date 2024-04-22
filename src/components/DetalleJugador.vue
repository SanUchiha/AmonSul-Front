<template>componente con la info del jugador</template>

<script setup lang="ts">
import { IUsuario } from "@/interfaces/Usuario";
import { onMounted, ref, defineProps } from "vue";
import { getUser } from "../services/UsuariosService";

const usuario = ref<IUsuario>();

const props = defineProps<{
  id: number;
}>();

onMounted(async () => {
  usuario.value = await getUser(props.id);
  console.log(props.id);
});
</script>

<style scoped></style>
