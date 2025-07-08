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
            v-for="(mesa, index) in emparejamientosUnicos"
            :key="index"
            class="mb-2"
          >
            <strong>Mesa {{ index + 1 }}:</strong>
            {{ mesa.equipo1 }} vs {{ mesa.equipo2 }}
            <v-btn
              icon
              @click="editarEmparejamiento(mesa.idEquipo1, mesa.idEquipo2)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-hover>
  </div>

  <ModalModificarPairingEquipos
    v-if="showModalModificacion"
    v-model="showModalModificacion"
    :equipoOriginal1="equipos1Old"
    :equipoOriginal2="equipos2Old"
    :numeroRonda="numeroRonda"
    :idTorneo="props.idTorneo"
  />
</template>

<script setup lang="ts">
import { PartidaTorneoDTO } from "@/interfaces/Partidas";
import { computed, ref } from "vue";
import { defineProps } from "vue";
import ModalModificarPairingEquipos from "./ModalModificarPairingEquipos.vue";

const props = defineProps<{
  partidas: PartidaTorneoDTO[];
  numeroRonda: number;
  idTorneo: number;
}>();

const equipos1Old = ref();
const equipos2Old = ref();
const showModalModificacion = ref<boolean>();

const emparejamientosUnicos = computed(() => {
  const set = new Set<string>();
  const resultado: {
    equipo1: string;
    equipo2: string;
    idEquipo1: number;
    idEquipo2: number;
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
          idEquipo1: partida.idEquipo1 as number,
          idEquipo2: partida.idEquipo2 as number,
        });
      }
    });

  return resultado;
});

const equiposDisponibles = computed(() => {
  const equiposMap = new Map<number, string>();
  props.partidas.forEach((p) => {
    if (p.idEquipo1 && p.nombreEquipo1)
      equiposMap.set(p.idEquipo1, p.nombreEquipo1.trim());
    if (p.idEquipo2 && p.nombreEquipo2)
      equiposMap.set(p.idEquipo2, p.nombreEquipo2.trim());
  });
  return Array.from(equiposMap.entries()).map(([id, nombre]) => ({
    id,
    nombre,
  }));
});

function editarEmparejamiento(id1: number, id2: number) {
  equipos1Old.value =
    equiposDisponibles.value.find((e) => e.id === id1) ?? null;
  equipos2Old.value =
    equiposDisponibles.value.find((e) => e.id === id2) ?? null;
  showModalModificacion.value = true;
}
</script>
