<template>
  <div v-if="isLoading">
    <LoadingGandalf />
  </div>
  <div v-else>
    <v-card flat>
      <v-card-title class="d-flex align-center pe-2">
        <v-row>
          <v-col cols="12" sm="4">
            <v-icon class="me-2" color="primary">mdi-account-group</v-icon>
            Usuarios
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="search"
              density="compact"
              label="Buscar usuario"
              prepend-inner-icon="mdi-magnify"
              variant="solo-filled"
              flat
              hide-details
              single-line
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-select
              v-model="selectedFaction"
              :items="factions"
              label="Filtrar por facción"
              clearable
            ></v-select>
          </v-col>
        </v-row>
        
        <!--TODO Filtrar por provincia
        <v-select
          v-model="selectedProvince"
          :items="provinces"
          label="Filtrar por provincia"
          clearable
          class="ml-2"
        ></v-select>
        -->
        
      </v-card-title>
      <v-divider></v-divider>
      <v-data-table
        :items="filteredItems"
        :loading="isLoading"
        :headers="headers"
        class="custom-table"
        item-key="nick"
      >
        <template v-slot:item="{ item }">
          <tr @click="goToUserDetail(item.idUsuario)" class="clickable-row">
            <td>
              <v-avatar size="32" class="me-2">
                <v-img :src="item.avatar || defaultAvatar" alt="Avatar" />
              </v-avatar>
              {{ item.nick }}
            </td>
            <td>
              <v-icon class="me-2" color="success">mdi-shield-sword</v-icon>
              {{ item.faccion?.nombreFaccion || "N/A" }}
            </td>
            <td>
              <v-icon class="me-2" color="info">mdi-map-marker</v-icon>
              {{ item.ciudad }}
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { UsuarioDTO } from "@/interfaces/Usuario";
import { onMounted, ref, computed, defineProps } from "vue";
import { useRouter } from "vue-router";
import LoadingGandalf from "../Commons/LoadingGandalf.vue";
import defaultAvatar from "@/assets/icons/perfil.png";

const props = defineProps({
  usuarios: {
    type: Array,
    required: true,
  },
});

const search = ref<string>("");
const items = ref<UsuarioDTO[]>([]);
const isLoading = ref<boolean>(true);
const router = useRouter();
const selectedProvince = ref<string | null>(null);
const selectedFaction = ref<string | null>(null);

const headers = [
  { title: "Nick", key: "nick", align: "start" },
  { title: "Facción", key: "faccion.nombreFaccion" },
  { title: "Ciudad", key: "ciudad" },
];

const provinces = computed(() => [
  ...new Set(items.value.map((user) => user.ciudad).filter(Boolean)),
]);

const factions = computed(() => [
  ...new Set(items.value.map((user) => user.faccion?.nombreFaccion).filter(Boolean)),
]);

const filteredItems = computed(() => {
  return items.value.filter((user) => {
    return (
      (!selectedProvince.value || user.ciudad === selectedProvince.value) &&
      (!selectedFaction.value || user.faccion?.nombreFaccion === selectedFaction.value) &&
      (search.value === "" || user.nick.toLowerCase().includes(search.value.toLowerCase()))
    );
  });
});

const goToUserDetail = (idUsuario: number) => {
  router.push({ name: "detalle-jugador", params: { idUsuario: idUsuario } });
};

onMounted(async () => {
  try {
    isLoading.value = true;
    items.value = [...props.usuarios].sort((a, b) => a.nick.localeCompare(b.nick));
    console.log("items.value:", items.value);
  } catch (error) {
    console.error("Error al obtener la clasificación de Elo:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.custom-table {
  background-color: #2d2f33;
  color: white;
}
.clickable-row {
  cursor: pointer;
  transition: background-color 0.3s;
}
.clickable-row:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
