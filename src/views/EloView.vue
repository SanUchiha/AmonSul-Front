<template>
  <v-container class="text-center">
    <div v-if="isLoading">
      <LoadingGandalf />
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
          <TablaClasificacionEloEquipos
            class="separated"
            :items="eloClasificacion"
            :facciones="facciones"
          />
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
import { getClasifiacionElo } from "@/services/EloService";
import { getFacciones } from "@/services/FaccionesService";
import { onMounted, ref } from "vue";
import { onMounted, ref, computed, ComputedRef } from "vue";
import { useAuth } from "@/composables/useAuth";
import { useRouter } from "vue-router";
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";
import { useUsuariosStore } from '@/store/usuarios';

const usuariosStore = useUsuariosStore();

const tab = ref<string>("one");

const { getUser } = useAuth();
const error = ref<string | null>(null);
const router = useRouter();
const correo = ref<string>(``);
const isLoading = ref<boolean>(true);
const eloClasificacion = ref<UsuarioEloTablaClasificacion[]>([]);
const facciones = ref<FaccionDTO[]>([]);
const usuarios: ComputedRef<ViewUsuarioPartidaDTO[]> = computed(() => usuariosStore.usuarios)


onMounted(async () => {
  isLoading.value = true;
  try {
    const email: any = await getUser.value;
    if (!email) {
      error.value = "No se pudo obtener el usuario. Por favor, inicie sesión.";
      router.push({ name: "error" });
      return;
    }
    correo.value = email;
    const responseClasificacionElo = await getClasifiacionElo();
    eloClasificacion.value = responseClasificacionElo.data;
    eloClasificacion.value = eloClasificacion.value.sort(
      (a, b) => b.elo - a.elo
    );

    eloClasificacion.value = eloClasificacion.value.map((item, index) => ({
      ...item,
      clasificacion: index + 1,
    }));

    const faccionesResponse = await getFacciones();
    facciones.value = faccionesResponse.data;
    if (!usuarios.value.length) {
      await usuariosStore.requestUsuarios()
    }
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
