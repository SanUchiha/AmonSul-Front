<template>
  <v-card flat>
    <v-card-title class="d-flex align-center pe-2"
      >Torneos

      <v-spacer></v-spacer>

      <v-text-field
        v-model="search"
        density="compact"
        label="Buscar"
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
        flat
        hide-details
        single-line
        class="search-field"
      ></v-text-field>
    </v-card-title>

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
        <tr class="table-row">
          <td>{{ item.nombreTorneo }}</td>
          <td class="action-buttons">
            <v-btn
              @click="viewDetails(item.idTorneo)"
              icon="mdi-eye"
              color="primary"
              elevation="2"
            >
            </v-btn>
            <v-btn
              @click="deleteTournament(item.idTorneo)"
              color="error"
              icon="mdi-close"
              elevation="2"
            ></v-btn>
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

const router = useRouter();

const headers = [{ title: "NOMBRE", key: "nombreTorneo" }];

const viewDetails = (idTorneo: number) => {
  router.push({ name: "detalle-torneo-gestion", params: { idTorneo } });
};

const deleteTournament = async (idTorneo: number) => {
  try {
    //await deleteTorneo(idTorneo);
    items.value = items.value.filter((item) => item.idTorneo !== idTorneo);
    alert("No está disponible está funcionalidad.");
  } catch (error) {
    console.error("Error deleting tournament:", error);
  }
};

onMounted(async () => {
  try {
    isLoading.value = true;
    if (idUsuarioLogger.value != null) {
      const responseTorneosCreados = await getTorneosCreadosUsuario(
        idUsuarioLogger.value
      );
      items.value = responseTorneosCreados.data;
    }
  } catch (error) {
    console.error("Error recuperando torneos creados por el usuario:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.title-bar {
  background-color: #2e3b55;
  color: white;
  padding: 8px;
  font-size: 18px;
  font-weight: bold;
}

.search-field {
  max-width: 200px;
  background-color: #f0f0f0;
}

.custom-table {
  text-align: left;
  background-color: #373b3b;
}

.table-row:hover {
  background-color: #525e75;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.action-buttons v-btn {
  border-radius: 50%;
}
</style>
