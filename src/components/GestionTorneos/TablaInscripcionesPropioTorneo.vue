<template>
  <v-card flat>
    <v-card-title class="d-flex align-center pe-2"
      >Torneos

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
      :items="items"
      :loading="isLoading"
      :headers="headers"
      class="custom-table"
      item-key="idTorneo"
    >
      <template v-slot:item="{ item }">
        <tr>
          <td>{{ item.nombreTorneo }}</td>
          <td>
            <v-btn @click="viewDetails(item.idTorneo)" icon="mdi-eye"> </v-btn>
            <v-btn
              :disabled="isDisabled"
              @click="deleteTournament(item.idTorneo)"
              color="error"
              icon="mdi-close"
            >
            </v-btn>
          </td>
        </tr>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { TorneoPropioDTO } from "@/interfaces/Torneo";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  VDataTable,
  VCard,
  VCardTitle,
  VDivider,
  VTextField,
} from "vuetify/components";
import { useAuth } from "@/composables/useAuth";
import { getTorneosCreadosUsuario } from "@/services/TorneosService";

const { getidUsuario } = useAuth();
const idUsuarioLogger = ref<string | null>(getidUsuario.value);

const search = ref<string>("");
const items = ref<TorneoPropioDTO[]>([]);
const isLoading = ref<boolean>(true);
const isDisabled = ref(true);

const router = useRouter();

const headers = [{ title: "NOMBRE", key: "nombreTorneo" }];

const viewDetails = (idTorneo: number) => {
  router.push({ name: "detalle-torneo-gestion", params: { idTorneo } });
};

const deleteTournament = async (idTorneo: number) => {
  try {
    //await deleteTorneo(idTorneo);
    items.value = items.value.filter((item) => item.idTorneo !== idTorneo);
  } catch (error) {
    console.error("Error deleting tournament:", error);
  }
};

onMounted(async () => {
  try {
    items.value = [];

    const responseTorneosCreados = await getTorneosCreadosUsuario(
      idUsuarioLogger.value!
    );

    items.value = responseTorneosCreados.data;
  } catch (error) {
    console.error("Error recuperando torneos creados por el usuario:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.custom-table {
  text-align: left;
  background-color: rgb(55, 59, 59);
}

.clickable-row {
  cursor: pointer;
}
</style>
