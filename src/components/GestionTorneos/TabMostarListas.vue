<template>
  <v-card flat>
    <v-card-title class="d-flex align-center">
      <p v-if="torneo?.tipoTorneo == 'Individual'">
        <v-icon left>mdi-account-group</v-icon> Participantes
      </p>
      <p v-else><v-icon left>mdi-account-group</v-icon> Equipos</p>
      <v-spacer />
      <v-text-field
        v-model="search"
        label="Buscar"
        prepend-inner-icon="mdi-magnify"
        variant="tonal"
        dense
      />
    </v-card-title>

    <v-divider />

    <!-- INDIVIDUAL -->
    <div v-if="torneo?.tipoTorneo == 'Individual'">
      <v-data-table
        v-model:search="search"
        :items="torneoIndividual?.inscripciones"
        :loading="isLoading"
        :headers="headers"
      >
        <template v-slot:item="{ item }">
          <tr @click="emit('goToUserDetail', item.idUsuario)">
            <td>
              <v-chip color="orange" dark>{{ item.nick }}</v-chip>
              <v-btn
                v-if="item.idLista != 0"
                icon
                @click.stop="verLista(item.idLista, item.nick, item.ejercito)"
              >
                <img
                  src="@/assets/icons/verdetalle.png"
                  alt="Detalle"
                  width="50"
                  height="50"
                />
              </v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
    </div>

    <!-- EQUIPOS -->
    <div v-else>
      <v-data-table
        v-model:search="search"
        :items="torneoEquipos?.equipos"
        :loading="isLoading"
        :headers="headersEquipos"
        class="styled-table"
        item-key="nombreEquipo"
      >
        <template v-slot:item="{ item }">
          <tr @click="toggleExpand(item.nombreEquipo)" class="clickable-row">
            <td>
              <v-avatar color="indigo" size="40">
                <img
                  src="@/assets/icons/equipos.png"
                  alt="Icono personalizado"
                  width="40"
                  height="40"
                />
              </v-avatar>
              &nbsp;
              <v-chip
                color="orange darken-2"
                text-color="white"
                class="font-weight-bold"
              >
                {{ item.nombreEquipo }}
              </v-chip>
            </td>
            <td class="text-center">
              <v-icon>
                {{
                  expanded.includes(item.nombreEquipo)
                    ? "mdi-chevron-up"
                    : "mdi-chevron-down"
                }}
              </v-icon>
            </td>
          </tr>

          <!-- Expandido -->
          <tr v-if="expanded.includes(item.nombreEquipo)">
            <td colspan="3">
              <v-card class="pa-3 mx-4 expanded-card">
                <p class="text-subtitle-1 font-weight-bold">Participantes</p>
                <v-list dense>
                  <v-list-item
                    v-for="participante in item.inscripciones"
                    :key="participante.idUsuario"
                  >
                    <template v-slot:prepend>
                      <v-btn
                        v-if="participante.idLista != 0"
                        icon
                        @click.stop="
                          verLista(
                            participante.idLista,
                            participante.nick,
                            participante.ejercito
                          )
                        "
                      >
                        <img
                          src="@/assets/icons/verdetalle.png"
                          alt="Detalle"
                          width="50"
                          height="50"
                        />
                      </v-btn>
                    </template>
                    <v-list-item-title
                      >&nbsp;
                      {{
                        participante.nick || "Desconocido"
                      }}</v-list-item-title
                    >
                  </v-list-item>
                </v-list>
              </v-card>
            </td>
          </tr>
        </template>
      </v-data-table>
    </div>
  </v-card>

  <!-- Modal ver lista -->
  <ModalVerLista
    v-model:isVisible="showVerListaModal"
    :listaJugador="listaJugador!"
  />
</template>

<script setup lang="ts">
import { TorneoEquipoGestionInfoDTO } from "@/interfaces/Inscripcion";
import { ListaJugador } from "@/interfaces/Lista";
import { Torneo, TorneoGestionInfoDTO } from "@/interfaces/Torneo";
import { getListaById } from "@/services/ListasService";
import {
  getInfoTorneoCreado,
  getInfoTorneoEquipoCreado,
} from "@/services/TorneosService";
import { ref, defineProps, defineEmits, watch } from "vue";
import ModalVerLista from "../Inscripcion/ModalVerLista.vue";

const props = defineProps<{
  torneo: Torneo | undefined;
}>();

const emit = defineEmits<{
  (e: "goToUserDetail", idUsuario: number): void;
}>();

const torneoIndividual = ref<TorneoGestionInfoDTO>();
const torneoEquipos = ref<TorneoEquipoGestionInfoDTO>();

const search = ref<string>("");
const isLoading = ref<boolean>(true);
const headers = [{ title: "Nick", key: "nick" }];
const headersEquipos = [{ title: "Nombre del equipo", key: "nombreEquipo" }];
const expanded = ref<string[]>([]);
const listaJugador = ref<ListaJugador>();
const showVerListaModal = ref<boolean>(false);

watch(
  () => props.torneo,
  async (nuevoTorneo) => {
    if (!nuevoTorneo) return;

    isLoading.value = true;

    try {
      if (nuevoTorneo.tipoTorneo === "Individual") {
        const response = await getInfoTorneoCreado(nuevoTorneo.idTorneo);
        console.log("participantes:", response.data);
        torneoIndividual.value = response.data;
      } else {
        const response = await getInfoTorneoEquipoCreado(nuevoTorneo.idTorneo);
        console.log("equipos:", response.data);
        torneoEquipos.value = response.data;
      }
    } catch (error) {
      console.error("Error al obtener participantes/equipos:", error);
    } finally {
      isLoading.value = false;
    }
  },
  { immediate: true }
);

function toggleExpand(nombreEquipo: string) {
  if (expanded.value.includes(nombreEquipo)) {
    expanded.value = expanded.value.filter((e) => e !== nombreEquipo);
  } else {
    expanded.value.push(nombreEquipo);
  }
}

const verLista = async (idLista: number, nombre: string, ejercito: string) => {
  console.log(idLista);
  const responseLista = await getListaById(idLista);
  const listaJugadorDTO: ListaJugador = {
    listaData: responseLista.data.listaData,
    nick: nombre,
    nombreEjercito: ejercito,
  };
  listaJugador.value = listaJugadorDTO;
  showVerListaModal.value = true;
};
</script>

<style scoped>
.clickable-row {
  cursor: pointer;
}
</style>
