<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-card flat>
    <v-card-title class="d-flex align-center pe-2"
      >Clasificación ELO

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
          <td>{{ item.clasificacion }}</td>

          <td>{{ item.nick }}</td>
          <td>
            <v-chip color="blue" dark>{{ item.elo }}</v-chip>
          </td>
          <td>
            <v-chip color="green" dark>{{ item.ganadas }}</v-chip>
          </td>
          <td>
            <v-chip color="yellow" dark>{{ item.empatadas }}</v-chip>
          </td>
          <td>
            <v-chip color="red" dark>{{ item.perdidas }}</v-chip>
          </td>
          <td>{{ item.partidas }}</td>
        </tr>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { UsuarioElo } from "@/interfaces/Elo";
import { getClasifiacionElo } from "@/services/EloService";
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
const items = ref<UsuarioElo[]>([]);
const loading = ref<boolean>(true);
const router = useRouter();

const headers = [
  { title: "#", key: "clasificacion" },
  { title: "Nick", key: "nick" },
  { title: "ELO", key: "elo" },
  { title: "V", key: "ganadas" },
  { title: "E", key: "empatadas" },
  { title: "D", key: "perdidas" },
  { title: "Jugadas", key: "partidas" },
];

const goToUserDetail = (nick: string) => {
  router.push({ name: "detalle-jugador", params: { Nick: nick } });
};

onMounted(async () => {
  try {
    items.value = [];

    const data = await getClasifiacionElo();
    items.value = data;
    items.value = items.value.sort((a, b) => b.elo - a.elo);

    items.value = items.value.map((item, index) => ({
      ...item,
      clasificacion: index + 1,
    }));
    console.log(items.value);
  } catch (error) {
    console.error("Error al obtener la clasificación de Elo:", error);
  } finally {
    loading.value = false; // Indica que la carga ha finalizado
  }
});
</script>

<style scoped>
.custom-table {
  text-align: left;
}

.v-data-table-header {
  text-align: center;
}
</style>
