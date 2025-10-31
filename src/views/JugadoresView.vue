<template>
  <v-container>
    <!-- Mostrar loading mientras cargan los usuarios -->
    <div v-if="isLoading">
      <LoadingGandalf />
    </div>

    <!-- Contenido principal cuando ya están cargados -->
    <div v-else>
      <v-tabs v-model="tab" color="primary" grow>
        <v-tab value="one"> Listado </v-tab>
        <v-tab value="two"> Mapa </v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="one" v-if="tab === 'one'">
          <TablaUsuarios v-if="users.length" :usuarios="users" />
          <v-alert
            v-else
            type="info"
            variant="tonal"
            icon="mdi-account-group-outline"
            class="ma-4"
          >
            No hay usuarios disponibles
          </v-alert>
        </v-tabs-window-item>

        <v-tabs-window-item value="two" v-if="tab === 'two'">
          <MapaUsuarios v-if="users.length" :usersView="users" />
          <v-alert
            v-else
            type="info"
            variant="tonal"
            icon="mdi-map-outline"
            class="ma-4"
          >
            No hay usuarios para mostrar en el mapa
          </v-alert>
        </v-tabs-window-item>
      </v-tabs-window>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, ComputedRef } from "vue";
import { UsuarioDTO } from "@/interfaces/Usuario";
import TablaUsuarios from "@/components/Usuarios/TablaUsuarios.vue";
import MapaUsuarios from "@/components/Mapa/MapaUsuarios.vue";
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";
import { useUsuariosStore } from "@/store/usuarios";

const usuariosStore = useUsuariosStore();

const users: ComputedRef<UsuarioDTO[]> = computed(() => usuariosStore.usuarios);
const tab = ref("one");
const isLoading = ref(false);

onMounted(async () => {
  if (!users.value.length) {
    isLoading.value = true;
    try {
      await usuariosStore.requestUsuarios();
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      isLoading.value = false;
    }
  }
});
</script>
