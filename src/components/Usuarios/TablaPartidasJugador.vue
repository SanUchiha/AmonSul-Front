<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-card flat>
    <v-card-title class="d-flex align-center pe-2"
      >Partidas {{}}

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
      :items="listadoItems"
      :loading="loading"
      :headers="headers"
      class="custom-table"
      item-key="idPartida"
    >
      <template v-slot:item="{ item }">
        <tr @click="goToDetallePartida(item.idPartida)" class="clickable-row">
          <td>{{ item.rival }}</td>
          <td :class="getResultadoClass(item.resultado)">
            {{ item.resultado }}
          </td>
          <td>{{ item.fecha }}</td>
        </tr>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { Faccion } from "@/interfaces/Faccion";
import { ViewPartidaAmistosaDTO } from "@/interfaces/Partidas";
import { UsuarioViewDTO, ViewUsuarioPartidaDTO } from "@/interfaces/Usuario";
import { getFacciones } from "@/services/FaccionesService";
import { getPartidasValidadas } from "@/services/PartidasAmistosasService";
import { getUsuario, getUsuarios } from "@/services/UsuariosService";
import { formatFechaSpa } from "@/utils/Fecha";
import { defineProps, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  VDataTable,
  VCard,
  VCardTitle,
  VDivider,
  VTextField,
} from "vuetify/components";

const props = defineProps<{ email: any }>();

const search = ref<string>("");
const items = ref<ViewPartidaAmistosaDTO[]>([]);
const loading = ref<boolean>(true);
const router = useRouter();
const userOwner = ref<UsuarioViewDTO>();
const listadoItems = ref<TablaItem[]>([]);

const headers = [
  { title: "RIVAL", key: "rival" },
  { title: "RESULTADO", key: "resultado" },
  { title: "FECHA", key: "fecha" },
];

const goToDetallePartida = (idPartida: number) => {
  router.push({ name: "detalle-partida", params: { idPartida: idPartida } });
};

interface TablaItem {
  rival: string;
  resultado: string;
  fecha: string;
  idPartida: number;
}

const getResultadoClass = (resultado: string) => {
  switch (resultado) {
    case "Victoria":
      return "victoria";
    case "Derrota":
      return "derrota";
    case "Empate":
      return "empate";
    default:
      return "";
  }
};

onMounted(async () => {
  try {
    //traer al jugador
    userOwner.value = await getUsuario(props.email);
    const data = await getPartidasValidadas(props.email);
    items.value = data;

    // Mapear la nueva lista de items con fechas formateadas
    listadoItems.value = await Promise.all(
      items.value.map(async (partida) => {
        const rival =
          partida.idUsuario1 === userOwner.value?.idUsuario
            ? partida.nickUsuario2
            : partida.nickUsuario1;
        let resultado = "Empate";
        if (partida.ganadorPartida === userOwner.value?.idUsuario) {
          resultado = "Victoria";
        } else if (partida.ganadorPartida !== 0) {
          resultado = "Derrota";
        }
        const fechaFormateada = await formatFechaSpa(partida.fechaPartida);
        return {
          rival,
          resultado,
          fecha: fechaFormateada,
          idPartida: partida.idPartidaAmistosa,
        };
      })
    );
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

.clickable-row {
  cursor: pointer;
}

.victoria {
  color: rgb(106, 209, 111);
}

.derrota {
  color: rgb(224, 86, 86);
}

.empate {
  color: rgb(226, 226, 21);
}
</style>
