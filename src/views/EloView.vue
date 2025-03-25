<template>
  <v-container class="text-center">
    <div v-if="isLoading">
      <LoadingGandalf />
    </div>
    <div v-else>
      <v-tabs v-model="tab" color="primary" grow>
        <v-tab value="Individual"> Individual </v-tab>
        <!-- <v-tab value="Mensual"> Mensual </v-tab> -->
        <v-tab value="Equipos"> Equipos </v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab">
        <!-- TAB 1. -->
        <v-tabs-window-item value="Individual" v-if="tab === 'Individual'">
          <SparklineElo :idUsuario="idUsuarioLogger" class="separated" />
          <TablaClasificacionElo class="separated" :items="eloClasificacion" />
        </v-tabs-window-item>

        <!-- TAB 3. -->
        <v-tabs-window-item value="Equipos" v-if="tab === 'Equipos'">
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
import { onMounted, ref, computed, ComputedRef } from "vue";
import { useAuth } from "@/composables/useAuth";
import { useRouter } from "vue-router";
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";
import { useUsuariosStore } from "@/store/usuarios";
import { ViewUsuarioPartidaDTO } from "@/interfaces/Usuario";

const usuariosStore = useUsuariosStore();

const tab = ref<string>("Individual");

const { getidUsuario } = useAuth();
const idUsuarioLogger = ref<number>(parseInt(getidUsuario.value));
const error = ref<string | null>(null);
const router = useRouter();
const idUsuario = ref<number>();
const isLoading = ref<boolean>(true);
const eloClasificacion = ref<UsuarioEloTablaClasificacion[]>([]);
const facciones = ref<FaccionDTO[]>([]);
const usuarios: ComputedRef<ViewUsuarioPartidaDTO[]> = computed(
  () => usuariosStore.usuarios
);

onMounted(async () => {
  isLoading.value = true;
  try {
    // Obtener el usuario
    const id = idUsuarioLogger.value;
    if (!id) {
      error.value = "No se pudo obtener el usuario. Por favor, inicie sesión.";
      router.push({ name: "error" });
      return;
    }
    idUsuario.value = id;

    // Hacer peticiones en paralelo
    const [responseClasificacionElo, faccionesResponse] = await Promise.all([
      getClasifiacionElo(),
      getFacciones(),
    ]);

    // Procesar la clasificación ELO
    eloClasificacion.value = responseClasificacionElo.data.sort(
      (a: { elo: number }, b: { elo: number }) => b.elo - a.elo
    );
    eloClasificacion.value = eloClasificacion.value.map((item, index) => ({
      ...item,
      clasificacion: index + 1,
    }));

    // Procesar las facciones
    facciones.value = faccionesResponse.data;

    // Obtener los usuarios si no se han cargado
    if (!usuarios.value.length) {
      await usuariosStore.requestUsuarios();
    }
  } catch (err) {
    console.error("Error al obtener datos del usuario:", error.value);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.separated {
  margin-bottom: 20px;
}
</style>
