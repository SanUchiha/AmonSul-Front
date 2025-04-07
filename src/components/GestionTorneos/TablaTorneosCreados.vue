<template>
  <v-card flat>
    <v-card-title class="d-flex align-center pe-2"
      >Torneos propios

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
            <div v-if="item.tipoTorneo != 'Individual'">
              <v-btn
                @click="viewDetailsTorneoEquipos(item.idTorneo)"
                icon="mdi-eye"
                color="primary"
                elevation="2"
                variant="tonal"
              >
              </v-btn>
            </div>
            <div v-else>
              <div
                v-if="
                  item.tipoTorneo == 'Individual' && item.listasPorJugador > 1
                "
              >
                <v-btn
                  @click="
                    viewDetailsTorneoIndividualMasDeUnaLista(item.idTorneo)
                  "
                  icon="mdi-eye"
                  color="primary"
                  elevation="2"
                  variant="tonal"
                >
                </v-btn>
              </div>
              <div v-else>
                <v-btn
                  @click="viewDetails(item.idTorneo)"
                  icon="mdi-eye"
                  color="primary"
                  elevation="2"
                  variant="tonal"
                >
                </v-btn>
              </div>
            </div>

            <v-btn
              @click="deleteTournament(item.idTorneo)"
              color="error"
              icon="mdi-close"
              elevation="2"
              variant="tonal"
            ></v-btn>
          </td>
        </tr>
      </template>
    </v-data-table>
  </v-card>

  <ModalSuccess
    :isVisible="showSuccessBorrarModal"
    message="Torneo borrado con éxito."
    @update:isVisible="showSuccessBorrarModal = $event"
  />

  <ModalError
    :isVisible="showErrorBorrarModal"
    message="No se ha podido borrar el torneo. Contacta con el administrador."
    @update:isVisible="showErrorBorrarModal = $event"
  />
</template>

<script setup lang="ts">
import { TorneoPropioDTO } from "@/interfaces/Torneo";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";
import {
  VDataTable,
  VCard,
  VCardTitle,
  VDivider,
  VTextField,
} from "vuetify/components";
import { useAuth } from "@/composables/useAuth";
import {
  getTorneosCreadosUsuario,
  deleteTorneo,
} from "@/services/TorneosService";

const { getidUsuario } = useAuth();
const idUsuarioLogger = ref<string | null>(getidUsuario.value);

const search = ref<string>("");
const items = ref<TorneoPropioDTO[]>([]);
const isLoading = ref<boolean>(true);

const router = useRouter();
const showSuccessBorrarModal = ref<boolean>(false);
const showErrorBorrarModal = ref<boolean>(false);

const headers = [{ title: "NOMBRE", key: "nombreTorneo" }];

const viewDetails = (idTorneo: number) => {
  router.push({ name: "detalle-torneo-gestion", params: { idTorneo } });
};

const viewDetailsTorneoEquipos = (idTorneo: number) => {
  router.push({ name: "detalle-torneo-gestion-equipos", params: { idTorneo } });
};

const viewDetailsTorneoIndividualMasDeUnaLista = (idTorneo: number) => {
  router.push({
    name: "detalle-torneo-gestion-individual-mas",
    params: { idTorneo },
  });
};

const deleteTournament = async (idTorneo: number) => {
  try {
    await deleteTorneo(idTorneo);
    items.value = items.value.filter((item) => item.idTorneo !== idTorneo);
    showSuccessBorrarModal.value = true;
  } catch (error) {
    console.error("Error deleting tournament:", error);
    showErrorBorrarModal.value = true;
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
