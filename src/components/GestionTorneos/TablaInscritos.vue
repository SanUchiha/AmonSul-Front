<template>
  <v-card flat>
    <v-card-title class="d-flex align-center pe-2">
      Inscritos
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
      :items="torneo?.inscripciones"
      :headers="headers"
      class="custom-table"
      item-key="nick"
    >
      <template v-slot:item="{ item }">
        <tr>
          <td>{{ item.nick }}</td>
          <td>{{ item.estadoInscripcion }}</td>
          <td>
            <v-chip
              :color="
                getChipColor(
                  item.fechaInscripcion,
                  torneo?.torneo.fechaFinInscripcion
                )
              "
              dark
            >
              {{ formatDate(item.fechaInscripcion) }}
            </v-chip>
          </td>
          <td>
            <v-chip v-if="item.estadoLista" color="blue" dark>{{
              item.estadoLista
            }}</v-chip>
            <v-chip v-else color="red" dark>No entregada</v-chip>
          </td>
          <td>
            <v-chip
              :color="
                getChipColor(
                  item.fechaEntrega,
                  torneo?.torneo.fechaEntregaListas
                )
              "
              dark
            >
              {{ formatDate(item.fechaEntrega) }}
            </v-chip>
          </td>
          <td>
            <v-chip v-if="!item.esPago" color="red" dark>No pagado</v-chip>
            <v-chip v-else color="blue" dark>Pagado</v-chip>
          </td>
        </tr>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { TorneoGestionInfoDTO } from "@/interfaces/Torneo";
import { ref, defineProps } from "vue";

const props = defineProps<{ torneo: TorneoGestionInfoDTO | null }>();

const search = ref<string>("");

const headers = ref([
  { title: "Nick", key: "nick" },
  { title: "Estado Inscripción", key: "estadoInscripcion" },
  { title: "Fecha Inscripción", key: "fechaInscripcion" },
  { title: "Estado Lista", key: "estadoLista" },
  { title: "Fecha Entrega", key: "fechaEntrega" },
  { title: "Pagado", key: "esPago" },
]);

const formatDate = (date: string | null | undefined) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
};

const getChipColor = (
  inscriptionDate: string | null | undefined,
  referenceDate: string | null | undefined
) => {
  if (!inscriptionDate || !referenceDate) return "red";
  return new Date(inscriptionDate) < new Date(referenceDate)
    ? "blue"
    : "yellow";
};
</script>
