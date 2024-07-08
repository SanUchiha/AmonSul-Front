<template>
  <div>
    <div v-if="loading">
      <v-row justify="center" align="center" style="height: 100px">
        <v-col cols="12" class="text-center">
          <ProgressCircular />
        </v-col>
      </v-row>
    </div>
    <v-container>
      <v-row dense>
        <v-col v-for="usuario in listaUsuarios" :key="usuario.idUsuario">
          <JugadorCard :usuario="usuario" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { getUsuarios } from "@/services/UsuariosService";
import { onMounted, ref } from "vue";
import JugadorCard from "../components/Usuarios/JugadorCard.vue";
import { ViewUsuarioPartidaDTO } from "@/interfaces/Usuario";
import { useAuth } from "@/composables/useAuth";
import ProgressCircular from "@/components/Commons/ProgressCircular.vue";
import { useRouter } from "vue-router";

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
