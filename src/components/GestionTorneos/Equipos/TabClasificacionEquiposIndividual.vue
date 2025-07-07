<template>
  <v-window-item :value="tabClasificacion" :key="tabClasificacion">
    <div v-if="clasificacion.length > 0">
      <v-table v-if="activeTab == tabClasificacion" density="compact">
        <thead>
          <tr>
            <th class="text-center">Posición</th>
            <th class="text-center">Jugador</th>
            <th class="text-center">P</th>
            <th class="text-center">PV</th>
            <th class="text-center">PD</th>
            <th class="text-center">+-</th>
            <th class="tect-center">L</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(jugador, index) in clasificacion"
            :key="jugador.nick"
            :class="{
              'good-bando': jugador.bando === 'good',
              'evil-bando': jugador.bando === 'evil',
            }"
          >
            <td>{{ index + 1 }}</td>
            <td>{{ jugador.nick }}</td>
            <td>{{ jugador.victorias }}</td>
            <td>{{ jugador.puntosFavor }}</td>
            <td>{{ jugador.puntosContra }}</td>
            <td>{{ jugador.diferenciaPuntos }}</td>
            <td>{{ jugador.lider }}</td>
          </tr>
        </tbody>
      </v-table>
    </div>
    <div v-else><p>Esperando resultados...</p></div>
  </v-window-item>
</template>

<script setup lang="ts">
import { EquipoDTO } from "@/interfaces/Inscripcion";
import { Clasificacion } from "@/interfaces/Live";
import { PartidaTorneoDTO } from "@/interfaces/Partidas";
import { ClasificacionEquipo, Torneo } from "@/interfaces/Torneo";
import { defineProps, ref, watch, defineEmits } from "vue";

const props = defineProps<{
  tabClasificacion: number | undefined;
  activeTab: number;
  clasificacion: Clasificacion[];
}>();

const emit = defineEmits(["enviarClasificacion"]);

const clasificacionEquipos = ref<ClasificacionEquipo[]>([]);

// watch(
//   [() => props.equipos, () => props.partidas],
//   ([equipos, partidas]) => {
//     if ((equipos?.length ?? 0) > 0 && (partidas?.length ?? 0) > 0) {
//       generarClasificacionEquipos();
//     }
//   },
//   { immediate: true }
// );

function generarClasificacionEquipos() {
  // const equipos = props.equipos ?? [];
  // const partidas = props.partidas ?? [];

  // const clasificacionMap = new Map<number, ClasificacionEquipo>();

  // equipos.forEach((equipo) => {
  //   clasificacionMap.set(equipo.idEquipo, {
  //     nombreEquipo: equipo.nombreEquipo ?? `Equipo ${equipo.idEquipo}`,
  //     idEquipo: equipo.idEquipo,
  //     puntos: 0,
  //     puntosFavor: 0,
  //     puntosContra: 0,
  //     diferencia: 0,
  //     lideresMatados: 0,
  //   });
  // });

  // partidas.forEach((partida) => {
  //   const {
  //     idEquipo1,
  //     idEquipo2,
  //     resultadoUsuario1,
  //     resultadoUsuario2,
  //     partidaValidadaUsuario1,
  //     partidaValidadaUsuario2,
  //     liderMuertoUsuario1,
  //     liderMuertoUsuario2,
  //   } = partida;

  //   const esValida = partidaValidadaUsuario1 && partidaValidadaUsuario2;
  //   if (!esValida || idEquipo1 === null || idEquipo2 === null) return;

  //   // Acumulamos datos para equipo 1
  //   const equipo1 = clasificacionMap.get(idEquipo1);
  //   const equipo2 = clasificacionMap.get(idEquipo2);

  //   const res1 = resultadoUsuario1 ?? 0;
  //   const res2 = resultadoUsuario2 ?? 0;

  //   // Empate
  //   if (res1 === res2) {
  //     if (equipo1) equipo1.puntos += 1;
  //     if (equipo2) equipo2.puntos += 1;
  //   } else {
  //     if (equipo1 && res1 > res2) equipo1.puntos += 3;
  //     if (equipo2 && res2 > res1) equipo2.puntos += 3;
  //   }

  //   if (equipo1) {
  //     equipo1.puntosFavor += res1;
  //     equipo1.puntosContra += res2;
  //     if (liderMuertoUsuario2 === true) equipo1.lideresMatados += 1;
  //     equipo1.diferencia = equipo1.puntosFavor - equipo1.puntosContra;
  //   }

  //   if (equipo2) {
  //     equipo2.puntosFavor += res2;
  //     equipo2.puntosContra += res1;
  //     if (liderMuertoUsuario1 === true) equipo2.lideresMatados += 1;
  //     equipo2.diferencia = equipo2.puntosFavor - equipo2.puntosContra;
  //   }
  // });

  // clasificacionEquipos.value = Array.from(clasificacionMap.values()).sort(
  //   (a, b) => {
  //     if (b.puntos !== a.puntos) return b.puntos - a.puntos;
  //     if (b.diferencia !== a.diferencia) return b.diferencia - a.diferencia;
  //     if (b.puntosFavor !== a.puntosFavor) return b.puntosFavor - a.puntosFavor;
  //     return b.lideresMatados - a.lideresMatados;
  //   }
  // );

  emit("enviarClasificacion", clasificacionEquipos.value);
}
</script>

<style scoped>
.good-bando {
  background-color: #57a86a; /* Verde claro */
}

.evil-bando {
  background-color: #ce4b56; /* Rojo claro */
}
</style>
