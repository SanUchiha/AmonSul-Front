<template>
  <v-container>
    <TablaUsuarios />
  </v-container>
</template>

<script setup lang="ts">
import { getUsuarios } from "@/services/UsuariosService";
import { onMounted, ref } from "vue";
import { ViewUsuarioPartidaDTO } from "@/interfaces/Usuario";
import { useAuth } from "@/composables/useAuth";
import { useRouter } from "vue-router";
import TablaUsuarios from "@/components/Usuarios/TablaUsuarios.vue";

const listaUsuarios = ref<ViewUsuarioPartidaDTO[]>([]);
const { getUser } = useAuth();
const error = ref<string | null>(null);
const loading = ref(true);
const router = useRouter();

onMounted(async () => {
  const email: string | unknown = await getUser.value;
  if (!email) {
    error.value = "No se pudo obtener el usuario. Por favor, inicie sesión.";
    console.log(error.value);
    router.push("error");
    loading.value = false;
    return;
  }
  try {
    var rawListaUsuarios: ViewUsuarioPartidaDTO[] = await getUsuarios();
    rawListaUsuarios = rawListaUsuarios.filter((u) => u.email != email);
    listaUsuarios.value = rawListaUsuarios;
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped></style>
