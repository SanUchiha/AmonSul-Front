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
    .translate([width / 1.7, height / 2])

  // Creamos el path añadiendo la proyección
  let path = d3.geoPath(projection)

  // Obtenemos las provincias de España en formato geojson
  let url =
    'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/spain-provinces.geojson'
  const spain = await d3.json(url)

  spain.features = spain.features.map((item) => {
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
      if (d.users > 16) {
        return 'wrapper__purple'
      } else if (d.users > 11) {
        return 'wrapper__darkblue'
      } else if (d.users > 7) {
        return 'wrapper__darkslateblue'
      } else if (d.users > 3) {
        return 'wrapper__blue'
      } else if (d.users > 0) {
        return 'wrapper__lightblue'
      } else {
        return 'wrapper__white'
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

.graticule {
  fill: none;
  stroke: #fff;
  stroke-width: 0.6px;
  stroke-opacity: 0.5;
}
.wrapper {
  &__purple {
    fill: purple;
    background: purple;
  }

  &__darkslateblue {
    fill: darkslateblue;
    background: darkslateblue;
  }

  &__darkblue {
    fill: darkblue;
    background: darkblue;
  }

  &__blue {
    fill: blue;
    background: blue;
  }

  &__lightblue {
    fill: lightblue;
    background: darkblue;
  }

  &__white {
    fill: lightcyan;
    background: lightcyan;
  }
}
</style>
