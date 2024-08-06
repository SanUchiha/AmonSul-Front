<template>
  <v-container id="chart-container">
    <div v-if="isLoading">
      <LoadingGandalf />
    </div>
    <v-alert :text="total" icon="mdi-account" v-if="total"></v-alert>
    <svg id="map-1" :width="currentWidth" :height="currentHeight"></svg>
  </v-container>
</template>

<script setup>
import { onMounted, ref, defineProps } from 'vue'
import * as d3 from 'd3'
import poblaciones from '@/settings/poblaciones'
import LoadingGandalf from "../Commons/LoadingGandalf.vue"


const props = defineProps({
  usersView: {
    type: Array,
    required: true,
  },
});

const total = ref('')
const users = ref([])
const currentWidth = ref('300')
const currentHeight = ref('300')
const isLoading = ref(true)


const createChart = async () => {
  currentWidth.value = parseInt(
    d3.select('#chart-container').style('width'),
    10
  )
  currentWidth.value = currentWidth.value - 32
  currentHeight.value = currentWidth.value > 800 ? 600 : 300
  let svg = d3.select('#map-1'),
    width = +currentWidth.value,
    height = +svg.attr('height')

  // Creamos la proyección  (ver Proyecciones abajo)
  let projection = d3
    .geoMercator()
    .scale(currentWidth.value > 800 ? 2600 : 1200)
    .center([-1, currentWidth.value > 800 ? 42 : 40])
    .translate([width / 1.6, height / 2])

  // Creamos el path añadiendo la proyección
  let path = d3.geoPath(projection)

  // Obtenemos las provincias de España en formato geojson
  let url =
    'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/spain-provinces.geojson'
  const spain = await d3.json(url)

  spain.features = spain.features.map((item) => {
    if (item.properties.cod_prov === "35") {
      total.value = `${users.value[parseInt(item.properties.cod_prov)]?.length || 0} usuarios de ${item.properties.name}`
    }
    return {
      ...item,
      users: users.value[parseInt(item.properties.cod_prov)]?.length,
    }
  })

  let group = svg
    .selectAll('g') // Creamos un grupo para cada provincia
    .data(spain.features)
    .enter()
    .append('g')
    .attr('class', (d) => {
      let classList = ''
      if (d.properties.name === 'Las Palmas') {
        classList = 'canarias '
      }
      if (d.users > 16) {
        return `${classList}wrapper__purple`
      } else if (d.users > 11) {
        return `${classList}wrapper__darkblue`
      } else if (d.users > 7) {
        return `${classList}wrapper__darkslateblue`
      } else if (d.users > 3) {
        return `${classList}wrapper__blue`
      } else if (d.users > 0) {
        return `${classList}wrapper__lightblue`
      } else {
        return `${classList}wrapper__white`
      }
    })
  .on('click', (d) => {
    total.value = `${d.srcElement.__data__.users || 0} usuarios de ${d.srcElement.__data__.properties.name}`
  })

  // Para cada grupo añadimos el path correspondiente
  group.append('path').attr('d', path).attr('class', 'province')
  isLoading.value = false
}

onMounted(async () => {
  users.value = [...props.usersView]
  users.value = users.value.map((user) => {
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
    //   console.log(user.ciudad, '(idUsuario)', user.idUsuario)
    // }
    return {
      id: user.idUsuario,
      comunidad: parseInt(
        poblaciones.find(
          (poblacion) =>
            poblacion.label
              .toLowerCase()
              .replace(/\s/g, '')
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '') ===
            user.ciudad
              .toLowerCase()
              .replace(/\s/g, '')
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
        )?.parent_code || '0'
      ),
    }
  })
  users.value = Object.groupBy(users.value, ({ comunidad }) => comunidad)
  createChart()
})
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
  &__purple {
    fill: #4a235a;
    background: #4a235a;
  }

  &__darkslateblue {
    fill: #1b4f72;
    background: #1b4f72;
  }

  &__darkblue {
    fill: #2e86c1;
    background: #2e86c1;
  }

  &__blue {
    fill: #5dade2;
    background: #5dade2;
  }

  &__lightblue {
    fill: #aed6f1;
    background: #aed6f1;
  }

  &__white {
    fill: #ebf5fb;
    background: #ebf5fb;
  }
}
</style>
