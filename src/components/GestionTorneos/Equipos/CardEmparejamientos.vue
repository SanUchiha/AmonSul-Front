<template>
  <div class="pa-2">
    <v-hover v-slot:default="{ props: hoverProps }">
      <v-card
        v-bind="hoverProps"
        class="match-card mt-3 mx-auto"
        width="100%"
        max-width="600"
        elevation="2"
      >
        <v-card-text>
          <div
            v-for="mesa in visibles"
            :key="mesa.numero"
            class="mb-2"
          >
            <strong>Mesa {{ mesa.numero }}:</strong>
            {{ mesa.equipo1 }} vs {{ mesa.equipo2 }}
          </div>
        </v-card-text>
      </v-card>
    </v-hover>
  </div>
</template>

<script setup lang="ts">
import { PartidaTorneoDTO } from "@/interfaces/Partidas";
import { computed } from "vue";
import { defineProps } from "vue";

const props = defineProps<{
  partidas: PartidaTorneoDTO[];
  numeroRonda: number;
  // Con un jugador buscado, solo los cruces de su equipo, con su número de mesa de siempre
  soloEquipos?: number[] | null;
}>();

const emparejamientosUnicos = computed(() => {
  const set = new Set<string>();
  const resultado: {
    equipo1: string;
    equipo2: string;
    idEquipo1: number | null;
    idEquipo2: number | null;
  }[] = [];

  props.partidas
    .filter((p) => p.numeroRonda === props.numeroRonda)
    .forEach((partida) => {
      const equipoA = partida.nombreEquipo1?.trim();
      const equipoB = partida.nombreEquipo2?.trim();
      const clave = [equipoA, equipoB].sort().join("|"); // Normaliza para detectar duplicados sin importar el orden

      if (!set.has(clave)) {
        set.add(clave);
        resultado.push({
          equipo1: equipoA as string,
          equipo2: equipoB as string,
          idEquipo1: partida.idEquipo1,
          idEquipo2: partida.idEquipo2,
        });
      }
    });

  return resultado;
});

const visibles = computed(() =>
  emparejamientosUnicos.value
    .map((mesa, index) => ({ ...mesa, numero: index + 1 }))
    .filter(
      mesa =>
        !props.soloEquipos ||
        (mesa.idEquipo1 != null && props.soloEquipos.includes(mesa.idEquipo1)) ||
        (mesa.idEquipo2 != null && props.soloEquipos.includes(mesa.idEquipo2))
    )
);
</script>
