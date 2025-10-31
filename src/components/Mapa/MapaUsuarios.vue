<template>
  <v-container id="chart-container">
    <div v-if="isLoading">
      <LoadingGandalf />
    </div>
    <v-alert :text="total" icon="mdi-account" v-if="total"></v-alert>
    <svg id="map-1" :width="currentWidth" :height="currentHeight"></svg>

    <!-- Leyenda debajo del mapa -->
    <v-card class="mt-4" variant="outlined">
      <v-card-subtitle>Leyenda</v-card-subtitle>
      <v-card-text>
        <v-row>
          <v-col
            v-for="range in colorRanges"
            :key="range.label"
            cols="6"
            md="2"
          >
            <div class="d-flex align-center mb-1">
              <div :class="range.class" class="legend-color mr-2"></div>
              <small>{{ range.label }}</small>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { onMounted, ref, defineProps } from "vue";
import * as d3 from "d3";
import poblaciones from "@/settings/poblaciones";
import LoadingGandalf from "../Commons/LoadingGandalf.vue";

const props = defineProps({
  usersView: {
    type: Array,
    required: true,
  },
});

const total = ref("");
const users = ref([]);
const currentWidth = ref("300");
const currentHeight = ref("300");
const isLoading = ref(true);

// Leyenda de colores con rangos
const colorRanges = ref([
  { class: "wrapper__white", label: "0 usuarios", color: "#ebf5fb" },
  { class: "wrapper__lightblue1", label: "1-2 usuarios", color: "#e3f2fd" },
  { class: "wrapper__lightblue2", label: "3-5 usuarios", color: "#bbdefb" },
  { class: "wrapper__blue1", label: "6-9 usuarios", color: "#64b5f6" },
  { class: "wrapper__blue2", label: "10-14 usuarios", color: "#2196f3" },
  { class: "wrapper__darkblue1", label: "15-19 usuarios", color: "#1565c0" },
  { class: "wrapper__purple1", label: "20-29 usuarios", color: "#7e57c2" },
  { class: "wrapper__purple2", label: "30-49 usuarios", color: "#4a235a" },
  { class: "wrapper__gold", label: "50+ usuarios", color: "#ffd600" },
]);

const createChart = async () => {
  currentWidth.value = parseInt(
    d3.select("#chart-container").style("width"),
    10
  );
  currentWidth.value = currentWidth.value - 32;
  currentHeight.value = currentWidth.value > 800 ? 600 : 300;
  let svg = d3.select("#map-1"),
    width = +currentWidth.value,
    height = +svg.attr("height");

  // Creamos la proyección  (ver Proyecciones abajo)
  let projection = d3
    .geoMercator()
    .scale(currentWidth.value > 800 ? 2600 : 1200)
    .center([-1, currentWidth.value > 800 ? 42 : 40])
    .translate([width / 1.6, height / 2]);

  // Creamos el path añadiendo la proyección
  let path = d3.geoPath(projection);

  // Obtenemos las provincias de España en formato geojson
  let url =
    "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/spain-provinces.geojson";
  const spain = await d3.json(url);

  spain.features = spain.features.map(item => {
    if (item.properties.cod_prov === "35") {
      total.value = `${
        users.value[parseInt(item.properties.cod_prov)]?.length || 0
      } usuarios de ${item.properties.name}`;
    }
    return {
      ...item,
      users: users.value[parseInt(item.properties.cod_prov)]?.length,
    };
  });

  let group = svg
    .selectAll("g") // Creamos un grupo para cada provincia
    .data(spain.features)
    .enter()
    .append("g")
    .attr("class", d => {
      let classList = "";
      if (d.properties.name === "Las Palmas") {
        classList = "canarias ";
      }
      const u = d.users || 0;
      if (u >= 50) {
        return `${classList}wrapper__gold`;
      } else if (u >= 30) {
        return `${classList}wrapper__purple2`;
      } else if (u >= 20) {
        return `${classList}wrapper__purple1`;
      } else if (u >= 15) {
        return `${classList}wrapper__darkblue1`;
      } else if (u >= 10) {
        return `${classList}wrapper__blue2`;
      } else if (u >= 6) {
        return `${classList}wrapper__blue1`;
      } else if (u >= 3) {
        return `${classList}wrapper__lightblue2`;
      } else if (u >= 1) {
        return `${classList}wrapper__lightblue1`;
      } else {
        return `${classList}wrapper__white`;
      }
    })
    .on("click", d => {
      total.value = `${d.srcElement.__data__.users || 0} usuarios de ${
        d.srcElement.__data__.properties.name
      }`;
    });

  // Para cada grupo añadimos el path correspondiente
  group.append("path").attr("d", path).attr("class", "province");
  isLoading.value = false;
};

onMounted(async () => {
  users.value = [...props.usersView];
  users.value = users.value.map(user => {
    // Log Usuarios no detectados
    // if (!poblaciones.some(
    //       (poblacion) =>
    //         poblacion.label
    //           .toLowerCase()
    //           .replace(/\s/g, '')
    //           .normalize('NFD')
    //           .replace(/[\u0300-\u036f]/g, '') ===
    //         user.ciudad
    //           .toLowerCase()
    //           .replace(/\s/g, '')
    //           .normalize('NFD')
    //           .replace(/[\u0300-\u036f]/g, '')
    //     )) {
    // }
    return {
      id: user.idUsuario,
      comunidad: parseInt(
        poblaciones.find(
          poblacion =>
            poblacion.label
              .toLowerCase()
              .replace(/\s/g, "")
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "") ===
            user.ciudad
              .toLowerCase()
              .replace(/\s/g, "")
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
        )?.parent_code || "0"
      ),
    };
  });
  users.value = Object.groupBy(users.value, ({ comunidad }) => comunidad);
  createChart();
});
</script>

<style lang="scss">
.province {
  stroke: #fff;
  stroke-width: 1px;
  cursor: pointer;
}

.province:hover {
  fill: green;
  stroke: green;
  stroke-width: 2px;
  stroke-dasharray: none;
}

.canarias {
  transform: translate(15%, -60%);

  @media screen and (max-width: 720px) {
    transform: translate(30%, -60%);
  }
}

.graticule {
  fill: none;
  stroke: #fff;
  stroke-width: 0.6px;
  stroke-opacity: 0.5;
}
.wrapper {
  &__white {
    background-color: #ebf5fb;
    fill: #ebf5fb;
  }
  &__lightblue1 {
    background-color: #e3f2fd;
    fill: #e3f2fd;
  }
  &__lightblue2 {
    background-color: #bbdefb;
    fill: #bbdefb;
  }
  &__blue1 {
    background-color: #64b5f6;
    fill: #64b5f6;
  }
  &__blue2 {
    background-color: #2196f3;
    fill: #2196f3;
  }
  &__darkblue1 {
    background-color: #1565c0;
    fill: #1565c0;
  }
  &__purple1 {
    background-color: #7e57c2;
    fill: #7e57c2;
  }
  &__purple2 {
    background-color: #4a235a;
    fill: #4a235a;
  }
}

// Asegura que los paths del mapa heredan el color de la clase del grupo
.wrapper__white path {
  fill: #ebf5fb !important;
}
.wrapper__lightblue1 path {
  fill: #e3f2fd !important;
}
.wrapper__lightblue2 path {
  fill: #bbdefb !important;
}
.wrapper__blue1 path {
  fill: #64b5f6 !important;
}
.wrapper__blue2 path {
  fill: #2196f3 !important;
}
.wrapper__darkblue1 path {
  fill: #1565c0 !important;
}
.wrapper__purple1 path {
  fill: #7e57c2 !important;
}
.wrapper__purple2 path {
  fill: #4a235a !important;
}

// Estilos para la leyenda
.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  border: 1px solid rgba(0, 0, 0, 0.1);

  &.wrapper__white {
    background-color: #ebf5fb;
    fill: #ebf5fb;
  }
  &.wrapper__lightblue1 {
    background-color: #e3f2fd;
    fill: #e3f2fd;
  }
  &.wrapper__lightblue2 {
    background-color: #bbdefb;
    fill: #bbdefb;
  }
  &.wrapper__blue1 {
    background-color: #64b5f6;
    fill: #64b5f6;
  }
  &.wrapper__blue2 {
    background-color: #2196f3;
    fill: #2196f3;
  }
  &.wrapper__darkblue1 {
    background-color: #1565c0;
    fill: #1565c0;
  }
  &.wrapper__purple1 {
    background-color: #7e57c2;
    fill: #7e57c2;
  }
  &.wrapper__purple2 {
    background-color: #4a235a;
    fill: #4a235a;
  }
}

.wrapper__gold {
  background-color: #ffd600;
  fill: #ffd600;
}
.wrapper__gold path {
  fill: #ffd600 !important;
}
</style>
