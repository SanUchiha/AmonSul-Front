<template>
  <v-container>
    <div v-if="isLoading" class="loading"></div>
    <div v-else>
      <SparklineElo :email="correo" class="separated" />
      <TablaClasificacionElo class="separated" />
    </div>
  </v-container>
</template>

<script setup lang="ts">
import SparklineElo from "@/components/Elo/SparklineElo.vue";
import TablaClasificacionElo from "@/components/Elo/TablaClasificacionElo.vue";

import { onMounted, ref } from "vue";
import { useAuth } from "@/composables/useAuth";
import { useRouter } from "vue-router";

const { getUser } = useAuth();
const error = ref<string | null>(null);
const router = useRouter();
const correo = ref<string>(``);
const isLoading = ref<boolean>(true);

onMounted(async () => {
  try {
    const email: any = await getUser.value;
    if (!email) {
      error.value = "No se pudo obtener el usuario. Por favor, inicie sesión.";
      router.push("error");
      return;
    }
    correo.value = email;
  } catch {
    console.error("Error al obtener datos del usuario:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.separated {
  margin-bottom: 20px; /* Ajusta el valor según tus necesidades */
}
</style>
