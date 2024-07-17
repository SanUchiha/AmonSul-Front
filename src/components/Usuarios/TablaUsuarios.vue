<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-card flat>
    <v-card-title class="d-flex align-center pe-2"
      >Usuarios

      <v-spacer></v-spacer>

      <v-text-field
        v-model="search"
        density="compact"
        label="Search"
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
        flat
        hide-details
        single-line
      ></v-text-field>
    </v-card-title>

    <v-divider></v-divider>
    <v-divider></v-divider>
    <v-data-table
      v-model:search="search"
      :items="items"
      :loading="loading"
      :headers="headers"
      class="custom-table"
      item-key="nick"
    >
      <template v-slot:item="{ item }">
        <tr @click="goToUserDetail(item.nick)" class="clickable-row">
          <td>{{ item.nick }}</td>
          <td>{{ item.nombreFaccion }}</td>
          <td>{{ item.ciudad }}</td>
        </tr>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { Faccion } from "@/interfaces/Faccion";
import { ViewUsuarioPartidaDTO } from "@/interfaces/Usuario";
import { getFacciones } from "@/services/FaccionesService";
import { getUsuarios } from "@/services/UsuariosService";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  VDataTable,
  VCard,
  VCardTitle,
  VDivider,
  VTextField,
} from "vuetify/components";

const search = ref<string>("");
const items = ref<ViewUsuarioPartidaDTO[]>([]);
const loading = ref<boolean>(true);
const router = useRouter();

const headers = [
  { title: "NICK", key: "nick", class: "blue lighten-5" },
  { title: "FACCIÓN", key: "nombreFaccion" },
  { title: "CIUDAD", key: "ciudad" },
];

const goToUserDetail = (nick: string) => {
  router.push({ name: "detalle-jugador", params: { Nick: nick } });
};

onMounted(async () => {
  try {
    items.value = [];

    const data = await getUsuarios();
    items.value = data;
    items.value = items.value.sort((a, b) => b.puntuacionElo - a.puntuacionElo);

    var rawListaFacciones: Faccion[] = await getFacciones();

    items.value.forEach((usuario) => {
      const faccion = rawListaFacciones.find(
        (f) => f.idFaccion === usuario.idFaccion
      );
      if (faccion) usuario.nombreFaccion = faccion.nombreFaccion;
      else usuario.nombreFaccion = "N/A";
    });
  } catch (error) {
    console.error("Error al obtener la clasificación de Elo:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.custom-table {
  text-align: left;
  background-color: rgb(55, 59, 59);
}
</style>
