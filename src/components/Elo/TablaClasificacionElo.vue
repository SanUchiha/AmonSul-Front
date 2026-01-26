<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-card flat>
    <v-card-title class="d-flex align-center pe-2"
      >Individual

      <v-spacer></v-spacer>

      <v-text-field
        v-model="search"
        density="compact"
        label="Buscar"
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
      :headers="headers"
      class="custom-table"
      item-key="nick"
    >
      <template v-slot:item="{ item }">
        <tr @click="goToUserDetail(item.idUsuario)" class="clickable-row">
          <td>{{ item.clasificacion }}</td>

          <td>{{ item.nick }}</td>
          <td>
            <v-chip color="blue" dark>{{ item.elo }}</v-chip>
          </td>
        </tr>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { UsuarioEloTablaClasificacion } from "@/interfaces/Elo";
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  VDataTable,
  VCard,
  VCardTitle,
  VDivider,
  VTextField,
} from "vuetify/components";

// eslint-disable-next-line no-undef
defineProps<{
  items: UsuarioEloTablaClasificacion[];
}>();

const search = ref<string>("");
const router = useRouter();

const headers = [
  { title: "#", key: "clasificacion" },
  { title: "Nick", key: "nick" },
  { title: "ELO", key: "elo" },
];

const goToUserDetail = (idUsuario: number) => {
  router.push({ name: "detalle-jugador", params: { idUsuario: idUsuario } });
};
</script>

<style scoped>
.custom-table {
  text-align: left;
}

.v-data-table-header {
  text-align: center;
}
</style>
