<template>
  <v-card flat>
    <v-card-title class="d-flex align-center pe-2"
      >Clasificación ELO Equipos

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
      :items="equipos"
      :headers="headers"
      :loading="Boolean(!equipos.length)"
      class="custom-table"
      item-key="equipo"
    >
      <template v-slot:item="{ item }">
        <tr>
          <td>{{ item.clasificacion }}</td>

          <td>{{ item.equipo }}</td>
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
import { ViewUsuarioPartidaDTO } from "@/interfaces/Usuario";
import { FaccionDTO } from "@/interfaces/Faccion";
import { ref, defineProps, watch, onMounted } from "vue";

const props = defineProps<{
  items: ViewUsuarioPartidaDTO[];
  facciones: FaccionDTO[];
}>();

const equipos = ref<Array<any>>([]);

const search = ref<string>("");

const headers = [
  { title: "#", key: "clasificacion" },
  { title: "Equipo", key: "equipo" },
  { title: "ELO", key: "elo" },
  { title: "V", key: "ganadas" },
  { title: "E", key: "empatadas" },
  { title: "D", key: "perdidas" },
  { title: "Jugadas", key: "partidas" },
];

const groupByEquipos = () => {
  const jugadoresPorEquipo = Object.groupBy(
    props.items,
    ({ idFaccion }) => idFaccion
  );
  if (!Object.keys(jugadoresPorEquipo).length) return;
  for (const [key, value] of Object.entries(jugadoresPorEquipo)) {
    const nombre = props.facciones.find(
      (faccion) => faccion.idFaccion === value[0].idFaccion
    )?.nombreFaccion;
    const elo = (
      value.reduce((a, b) => a + b.puntuacionElo, 0) / value.length
    ).toFixed(2);
    const ganadas = value.reduce((a, b) => a + b.partidasGanadas, 0);
    const empatadas = value.reduce((a, b) => a + b.partidasEmpatadas, 0);
    const perdidas = value.reduce((a, b) => a + b.partidasPerdidas, 0);
    const partidas = ganadas + empatadas + perdidas;
    if (nombre)
      equipos.value.push({
        equipo: nombre,
        elo,
        ganadas,
        empatadas,
        perdidas,
        partidas,
      });
  }
  equipos.value = equipos.value.sort((a, b) => b.elo - a.elo);
  equipos.value = equipos.value.map((item, index) => ({
    ...item,
    clasificacion: index + 1,
  }));
};

onMounted(() => {
  groupByEquipos();
});

watch(
  () => props.items,
  () => {
    groupByEquipos();
  }
);
</script>

<style scoped>
.custom-table {
  text-align: left;
}

.v-data-table-header {
  text-align: center;
}
</style>
