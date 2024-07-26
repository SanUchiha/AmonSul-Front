<template>
  <v-container class="text-center">
    <div v-if="isLoading">
      <ProgressCircular />
    </div>
    <div v-else>
      <v-tabs v-model="tab" color="primary" grow>
        <v-tab value="one">
          <v-icon icon="mdi-account"></v-icon>
        </v-tab>
        <v-tab value="two">
          <v-icon icon="mdi-account-group"></v-icon>
        </v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab">
        <!-- TAB 1. -->
        <v-tabs-window-item value="one" v-if="tab === 'one'">
          <SparklineElo :email="correo" class="separated" />
          <TablaClasificacionElo class="separated" :items="eloClasificacion" />
        </v-tabs-window-item>

        <v-tabs-window-item value="two" v-if="tab === 'two'">
          <TablaClasificacionEloEquipos class="separated" :items="usuarios" :facciones="facciones" />
        </v-tabs-window-item>
      </v-tabs-window>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import SparklineElo from "@/components/Elo/SparklineElo.vue";
import TablaClasificacionElo from "@/components/Elo/TablaClasificacionElo.vue";
import TablaClasificacionEloEquipos from "@/components/Elo/TablaClasificacionEloEquipos.vue";
import { UsuarioEloTablaClasificacion } from "@/interfaces/Elo";
import { FaccionDTO } from "@/interfaces/Faccion";
import { ViewUsuarioPartidaDTO } from "@/interfaces/Usuario";
import { getClasifiacionElo } from "@/services/EloService";
import { getFacciones } from "@/services/FaccionesService";
import { getUsuarios } from "@/services/UsuariosService";
import { onMounted, ref } from "vue";
import { useAuth } from "@/composables/useAuth";
import { useRouter } from "vue-router";
import ProgressCircular from "@/components/Commons/ProgressCircular.vue";

const tab = ref<string>("one");

const { getUser } = useAuth();
const error = ref<string | null>(null);
const router = useRouter();
const correo = ref<string>(``);
const isLoading = ref<boolean>(true);
const eloClasificacion = ref<UsuarioEloTablaClasificacion[]>([]);
const usuarios = ref<ViewUsuarioPartidaDTO[]>([]);
const facciones = ref<FaccionDTO[]>([])

onMounted(async () => {
  try {
    const email: any = await getUser.value;
    if (!email) {
      error.value = "No se pudo obtener el usuario. Por favor, inicie sesión.";
      router.push("error");
      return;
    }
    correo.value = email;
    eloClasificacion.value = await getClasifiacionElo();
    eloClasificacion.value = eloClasificacion.value.sort((a, b) => b.elo - a.elo);

    eloClasificacion.value = eloClasificacion.value.map((item, index) => ({
      ...item,
      clasificacion: index + 1,
    }));

    isLoading.value = false;

    facciones.value = await getFacciones();
    usuarios.value = await getUsuarios();
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
