<template>
  <v-container>
    <v-row dense justify="center" style="height: 100vh">
      <div v-if="isLoading">
        <v-row justify="center" style="height: 100px">
          <v-col cols="12" class="text-center">
            <ProgressCircular />
          </v-col>
        </v-row>
      </div>
      <div v-else>
        <div v-if="listaTorneos.length < 1">No hay torneos próximamente...</div>
        <v-window v-model="activeTorneo">
          <v-window-item
            v-for="torneo in listaTorneos"
            :key="torneo.idTorneo"
            :value="torneo.idTorneo"
          >
            <TorneoCard :torneo="torneo" />
          </v-window-item>
        </v-window>
        <v-card-actions class="justify-space-between">
          <v-btn icon="mdi-chevron-left" variant="plain" @click="prev"></v-btn>
          <v-item-group v-model="activeTorneo" class="text-center" mandatory>
            <v-item
              v-for="torneo in listaTorneos"
              :key="`btn-${torneo.idTorneo}`"
              v-slot="{ isSelected, toggle }"
              :value="torneo.idTorneo"
            >
              <v-btn
                :variant="isSelected ? 'outlined' : 'text'"
                icon="mdi-record"
                :class="{
                  'active-pointer': isSelected,
                  'inactive-pointer': !isSelected,
                }"
                @click="toggle"
              ></v-btn>
            </v-item>
          </v-item-group>
          <v-btn icon="mdi-chevron-right" variant="plain" @click="next"></v-btn>
        </v-card-actions>
      </div>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { Torneo } from "@/interfaces/Torneo";
import { getTorneos } from "@/services/TorneosService";
import { onMounted, ref } from "vue";
import TorneoCard from "@/components/Torneos/TorneoCard.vue";
import ProgressCircular from "@/components/Commons/ProgressCircular.vue";

const listaTorneos = ref<Torneo[]>([]);
const isLoading = ref(true);
const activeTorneo = ref<number | null>(null);
const contador = ref<number>(0);

const prev = () => {
  if (listaTorneos.value.length === 0) return;
  const currentIndex = listaTorneos.value.findIndex(
    (t) => t.idTorneo === activeTorneo.value
  );
  activeTorneo.value =
    currentIndex - 1 < 0
      ? listaTorneos.value[listaTorneos.value.length - 1].idTorneo
      : listaTorneos.value[currentIndex - 1].idTorneo;
};

const next = () => {
  if (listaTorneos.value.length === 0) return;
  const currentIndex = listaTorneos.value.findIndex(
    (t) => t.idTorneo === activeTorneo.value
  );
  activeTorneo.value =
    currentIndex + 1 >= listaTorneos.value.length
      ? listaTorneos.value[0].idTorneo
      : listaTorneos.value[currentIndex + 1].idTorneo;
};

onMounted(async () => {
  listaTorneos.value = await getTorneos();
  listaTorneos.value = listaTorneos.value.sort(
    (a, b) =>
      new Date(a.fechaInicioTorneo).getTime() -
      new Date(b.fechaInicioTorneo).getTime()
  );
  if (listaTorneos.value.length > 0) {
    activeTorneo.value = listaTorneos.value[0].idTorneo;
  }

  contador.value = listaTorneos.value.length;

  console.log("lista de torneos", listaTorneos.value);
  console.log("torneosActivo", activeTorneo.value);

  isLoading.value = false;
});
</script>

<style scoped>
.active-pointer {
  color: #ffb74d;
}
.inactive-pointer {
  color: gray;
}
</style>
