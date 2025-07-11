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
          <tr>
            <td>
              <v-chip
                @click="goToUserDetail(item.idUsuario)"
                color="orange"
                dark
                >{{ item.nick }}</v-chip
              >
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
              <v-chip v-if="item.idLista" color="orange" dark>{{
                item.ejercito
              }}</v-chip>
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
                    <v-list-item-title>
                      <v-chip
                        @click="goToUserDetail(participante.idUsuario)"
                        :color="
                          item.idCapitan === participante.idUsuario
                            ? 'teal'
                            : 'orange'
                        "
                        dark
                      >
                        {{ participante.nick }}
                      </v-chip>
                      <span
                        dark
                        outlined
                        small
                        class="ml-2"
                        :style="{
                          color: getColorPorEjercito(participante.ejercito),
                        }"
                      >
                        {{ participante.ejercito }}
                      </span>

                      <v-btn
                        v-if="participante.idLista != 0"
                        icon
                        class="ml-2"
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
                          width="30"
                          height="30"
                        />
                      </v-btn>
                    </v-list-item-title>
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
import { ref, defineProps, watch } from "vue";
import ModalVerLista from "../Inscripcion/ModalVerLista.vue";
import { useRouter } from "vue-router";
import { ArmyDTO } from "@/interfaces/Army";
import { appsettings } from "@/settings/appsettings";

const props = defineProps<{
  torneo: Torneo | undefined;
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
const router = useRouter();
const listadoEjercitos = ref<ArmyDTO[]>(appsettings.armies);

watch(
  () => props.torneo,
  async (nuevoTorneo) => {
    if (!nuevoTorneo) return;

    isLoading.value = true;

    try {
      if (nuevoTorneo.tipoTorneo === "Individual") {
        const response = await getInfoTorneoCreado(nuevoTorneo.idTorneo);
        torneoIndividual.value = response.data;
      } else {
        const response = await getInfoTorneoEquipoCreado(nuevoTorneo.idTorneo);
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
  const responseLista = await getListaById(idLista);
  const listaJugadorDTO: ListaJugador = {
    listaData: responseLista.data.listaData,
    nick: nombre,
    nombreEjercito: ejercito,
  };
  listaJugador.value = listaJugadorDTO;
  showVerListaModal.value = true;
};

const goToUserDetail = (idUsuario: number) => {
  router.push({ name: "detalle-jugador", params: { idUsuario: idUsuario } });
};

function getColorPorEjercito(nombreEjercito: string): string {
  const ejercito = listadoEjercitos.value.find(
    (e) => e.name === nombreEjercito
  );
  if (!ejercito) return "grey";
  return ejercito.band === "good" ? "green" : "purple";
}
</script>

<style scoped>
.clickable-row {
  cursor: pointer;
}
</style>
