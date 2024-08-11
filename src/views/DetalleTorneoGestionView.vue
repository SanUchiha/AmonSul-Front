<template>
  <v-container class="text-center">
    <div>
      <!-- Mostrar una tarjeta con la información del torneo -->
      <v-card v-if="listaInscripciones" class="mb-4">
        <v-card-title>{{
          listaInscripciones.torneo.nombreTorneo
        }}</v-card-title>
        <v-card-text>
          <p><strong>Plazas Restantes:</strong> {{ plazasRestantes }}</p>
          <p>
            <strong>Fecha de Entrega de Listas:</strong>
            {{ formatDate(listaInscripciones.torneo.fechaEntregaListas!) }}
          </p>
          <p>
            <strong>Fecha de Fin de Inscripción:</strong>
            {{ formatDate(listaInscripciones.torneo.fechaFinInscripcion!) }}
          </p>
        </v-card-text>
      </v-card>

      <!-- Mostrar una tabla con las inscripciones del torneo -->
      <v-card flat>
        <v-card-title class="d-flex align-center pe-2"
          >Inscritos

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
          :items="listaInscripciones?.inscripciones"
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
                      torneo!.fechaFinInscripcion
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
                    getChipColor(item.fechaEntrega, torneo!.fechaEntregaListas)
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

      <!-- Loading spinner -->
      <v-progress-circular
        v-if="isLoading"
        indeterminate
        color="primary"
        class="d-flex justify-center"
      ></v-progress-circular>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { TorneoGestionInfoDTO } from "@/interfaces/Torneo";
import router from "@/router";
import { getInfoTorneoCreado } from "@/services/TorneosService";
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const idTorneo = ref<number>();

const isLoading = ref<boolean>(false);

const listaInscripciones = ref<TorneoGestionInfoDTO>();
const torneo = computed(() => listaInscripciones.value?.torneo);

const search = ref<string>("");

const headers = ref([
  { title: "Nick", key: "nick" },
  { title: "Estado Inscripción", key: "estadoInscripcion" },
  { title: "Fecha Inscripción", key: "fechaInscripcion" },
  { title: "Estado Lista", key: "estadoLista" },
  { title: "Fecha Entrega", key: "fechaEntrega" },
  { title: "Pagado", key: "esPago" },
]);

// Computed property para calcular las plazas restantes
const plazasRestantes = computed(() => {
  if (
    !listaInscripciones.value ||
    listaInscripciones.value.torneo.limiteParticipantes === null
  ) {
    return "Sin límite";
  }
  return (
    listaInscripciones.value.torneo.limiteParticipantes! -
    listaInscripciones.value.inscripciones.length
  );
});

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

onMounted(async () => {
  idTorneo.value = parseInt(route.params.idTorneo.toString());

  isLoading.value = true;

  try {
    const responseTorneo = await getInfoTorneoCreado(idTorneo.value);
    listaInscripciones.value = responseTorneo.data;
    console.log(listaInscripciones.value);
  } catch (error) {
    console.error(error);
    router.push({ name: "error" });
  } finally {
    isLoading.value = false;
  }
});
</script>
