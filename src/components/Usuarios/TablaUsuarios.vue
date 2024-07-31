<template>
  <div v-if="isLoading">
    <LoadingGandalf />
  </div>
  <div v-else>
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
        :loading="isLoading"
        :headers="headers"
        class="custom-table"
        item-key="nick"
      >
        <template v-slot:item="{ item }">
          <tr @click="goToUserDetail(item.idUsuario)" class="clickable-row">
            <td>{{ item.nick }}</td>
            <td>{{ item.nombreFaccion }}</td>
            <td>{{ item.ciudad }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { FaccionDTO } from "@/interfaces/Faccion";
import { getFacciones } from "@/services/FaccionesService";
import { onMounted, ref, defineProps } from "vue";
import { useRouter } from "vue-router";
import {
  VDataTable,
  VCard,
  VCardTitle,
  VDivider,
  VTextField,
} from "vuetify/components";
import LoadingGandalf from "../Commons/LoadingGandalf.vue";

const props = defineProps({
  usuarios: {
    type: Array,
    required: true,
  },
});

const search = ref<string>("");
const items = ref<any[]>([]);
const isLoading = ref<boolean>(true);
const router = useRouter();

const headers = [
  { title: "NICK", key: "nick", class: "blue lighten-5" },
  { title: "FACCIÓN", key: "nombreFaccion" },
  { title: "CIUDAD", key: "ciudad" },
];

const goToUserDetail = (idUsuario: number) => {
  router.push({ name: "detalle-jugador", params: { idUsuario: idUsuario } });
};

onMounted(async () => {
  try {
    isLoading.value = true;

    items.value = props.usuarios;
    items.value = items.value.sort((a, b) => a.nick.localeCompare(b.nick));

    const response = await getFacciones();
    var rawListaFacciones: FaccionDTO[] = response.data;

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
    isLoading.value = false;
  }
});
</script>

<style scoped>
.custom-table {
  text-align: left;
  background-color: rgb(55, 59, 59);
}

.clickable-row {
  cursor: pointer;
}
</style>
