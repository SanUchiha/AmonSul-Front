<template>
  <v-container>
    <v-tabs v-model="tab" color="primary" grow>
      <v-tab value="one">
        <v-icon icon="mdi-account-group"></v-icon>
      </v-tab>
      <v-tab value="two">
        <v-icon icon="mdi-map"></v-icon>
      </v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab">
      <v-tabs-window-item value="one" v-if="tab === 'one'">
        <TablaUsuarios v-if="users.length" :usuarios="users" />
      </v-tabs-window-item>

      <v-tabs-window-item value="two" v-if="tab === 'two'">
        <MapaUsuarios v-if="users.length" :usersView="users" />
      </v-tabs-window-item>
    </v-tabs-window>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, ComputedRef } from 'vue'
import { ViewUsuarioPartidaDTO } from "@/interfaces/Usuario";
import TablaUsuarios from '@/components/Usuarios/TablaUsuarios.vue'
import MapaUsuarios from '@/components/Mapa/MapaUsuarios.vue'
import { useUsuariosStore } from '@/store/usuarios';

const usuariosStore = useUsuariosStore();

const users: ComputedRef<ViewUsuarioPartidaDTO[]> = computed(() => usuariosStore.usuarios)
const tab = ref("one");

onMounted(async () => {
  if (!users.value.length) {
    await usuariosStore.requestUsuarios()
  }
})
</script>
