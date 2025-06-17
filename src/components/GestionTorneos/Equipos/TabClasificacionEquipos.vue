<template>
  <v-window-item :value="tabClasificacion" :key="tabClasificacion">
    <div v-if="clasificacionEquipos.length > 0">
      <h3 class="text-h6 my-2">Clasificación por Equipos</h3>
      <v-table v-if="activeTab === tabClasificacion" density="compact">
        <thead>
          <tr>
            <th class="text-center">#</th>
            <th class="text-center">Equipo</th>
            <th class="text-center">Puntos</th>
            <th class="text-center">Puntos a favor</th>
            <th class="text-center">Puntos en contra</th>
            <th class="text-center">Diferencia</th>
            <th class="text-center">G. Muertos</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(equipo, index) in clasificacionEquipos"
            :key="equipo.idEquipo"
          >
            <td class="text-center">{{ index + 1 }}</td>
            <td class="text-center">{{ equipo.nombreEquipo }}</td>
            <td class="text-center">{{ equipo.puntos }}</td>
            <td class="text-center">{{ equipo.puntosFavor }}</td>
            <td class="text-center">{{ equipo.puntosContra }}</td>
            <td class="text-center">{{ equipo.diferencia }}</td>
            <td class="text-center">{{ equipo.lideresMatados }}</td>
          </tr>
        </tbody>
      </v-table>
    </div>
    <div v-else>
      <p>Esperando resultados...</p>
    </div>
  </v-window-item>
</template>

<script setup lang="ts">
import { EquipoDTO } from "@/interfaces/Inscripcion";
import { PartidaTorneoDTO } from "@/interfaces/Partidas";
import { ClasificacionEquipo, Torneo } from "@/interfaces/Torneo";
import { defineProps, ref, watch, defineEmits } from "vue";

const props = defineProps<{
  tabClasificacion: number | undefined;
  activeTab: number;
  torneo: Torneo | undefined;
  partidas: PartidaTorneoDTO[];
  equipos: EquipoDTO[] | null | undefined;
}>();

const emit = defineEmits(["enviarClasificacion"]);

const clasificacionEquipos = ref<ClasificacionEquipo[]>([]);

watch(
  [() => props.equipos, () => props.partidas],
  ([equipos, partidas]) => {
    if ((equipos?.length ?? 0) > 0 && (partidas?.length ?? 0) > 0) {
      generarClasificacionEquipos();
    }
  },
  { immediate: true }
);

function generarClasificacionEquipos() {
  const equipos = props.equipos ?? [];
  const partidas = props.partidas ?? [];

  const clasificacionMap = new Map<number, ClasificacionEquipo>();

  equipos.forEach((equipo) => {
    clasificacionMap.set(equipo.idEquipo, {
      nombreEquipo: equipo.nombreEquipo ?? `Equipo ${equipo.idEquipo}`,
      idEquipo: equipo.idEquipo,
      puntos: 0,
      puntosFavor: 0,
      puntosContra: 0,
      diferencia: 0,
      lideresMatados: 0,
    });
  });

  partidas.forEach((partida) => {
    const {
      idEquipo1,
      idEquipo2,
      resultadoUsuario1,
      resultadoUsuario2,
      partidaValidadaUsuario1,
      partidaValidadaUsuario2,
      liderMuertoUsuario1,
      liderMuertoUsuario2,
    } = partida;

    const esValida = partidaValidadaUsuario1 && partidaValidadaUsuario2;
    if (!esValida || idEquipo1 === null || idEquipo2 === null) return;

    // Acumulamos datos para equipo 1
    const equipo1 = clasificacionMap.get(idEquipo1);
    const equipo2 = clasificacionMap.get(idEquipo2);

    const res1 = resultadoUsuario1 ?? 0;
    const res2 = resultadoUsuario2 ?? 0;

    // Empate
    if (res1 === res2) {
      if (equipo1) equipo1.puntos += 1;
      if (equipo2) equipo2.puntos += 1;
    } else {
      if (equipo1 && res1 > res2) equipo1.puntos += 3;
      if (equipo2 && res2 > res1) equipo2.puntos += 3;
    }

    if (equipo1) {
      equipo1.puntosFavor += res1;
      equipo1.puntosContra += res2;
      if (liderMuertoUsuario2 === true) equipo1.lideresMatados += 1;
      equipo1.diferencia = equipo1.puntosFavor - equipo1.puntosContra;
    }

    if (equipo2) {
      equipo2.puntosFavor += res2;
      equipo2.puntosContra += res1;
      if (liderMuertoUsuario1 === true) equipo2.lideresMatados += 1;
      equipo2.diferencia = equipo2.puntosFavor - equipo2.puntosContra;
    }
  });

  clasificacionEquipos.value = Array.from(clasificacionMap.values()).sort(
    (a, b) => {
      if (b.puntos !== a.puntos) return b.puntos - a.puntos;
      if (b.diferencia !== a.diferencia) return b.diferencia - a.diferencia;
      if (b.puntosFavor !== a.puntosFavor) return b.puntosFavor - a.puntosFavor;
      return b.lideresMatados - a.lideresMatados;
    }
  );

  emit("enviarClasificacion", clasificacionEquipos.value);
}
</script>

<style scoped>
.good-bando {
  background-color: #e0f7fa;
}
.evil-bando {
  background-color: #ffebee;
}
</style>
