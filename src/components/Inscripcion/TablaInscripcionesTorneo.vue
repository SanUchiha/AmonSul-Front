<template>
  <v-table :loading="isLoading">
    <thead>
      <tr>
        <th>Torneo</th>
        <th class="text-center">Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="torneo in listaTorneos" :key="torneo.idInscripcion">
        <td>{{ torneo.nombreTorneo }}</td>
        <td class="text-center">
          <v-btn icon @click="verDetalleInscripcion(torneo.idInscripcion)">
            <v-icon color="primary">mdi-eye</v-icon>
          </v-btn>
          <v-btn icon @click="verLista(torneo.idInscripcion)">
            <v-icon color="primary">mdi-file-send</v-icon>
          </v-btn>
          <v-btn icon @click="eliminarInscripcion(torneo.idInscripcion)">
            <v-icon color="red">mdi-cancel</v-icon>
          </v-btn>
        </td>
      </tr>
    </tbody>
  </v-table>

  <v-dialog v-model="showSuccessModal" max-width="400">
    <v-card>
      <v-card-title class="headline">Éxito</v-card-title>
      <v-card-text>Eliminado con éxito.</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="showSuccessModal = false">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showErrorModal" max-width="400">
    <v-card>
      <v-card-title class="headline">Error</v-card-title>
      <v-card-text>No se ha podido eliminar. Intente nuevamente.</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="showErrorModal = false">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showVerListaModal" max-width="500">
    <v-card>
      <v-card-title class="headline">Lista</v-card-title>
      <v-card-text>
        <div v-if="!hasLista">
          <v-textarea
            v-model="listaText"
            label="Ingrese la lista"
            rows="10"
            clear-icon="mdi-close-circle"
            clearable
          ></v-textarea>
        </div>
        <div v-else>
          <v-textarea
            v-model="listaText"
            label="Tu lista"
            rows="10"
            clear-icon="mdi-close-circle"
            clearable
          ></v-textarea>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <div v-if="!hasLista">
          <v-btn color="primary" @click="enviarLista">Enviar</v-btn>
        </div>
        <div v-else>
          <v-btn color="primary" @click="modificarLista">Modificar</v-btn>
        </div>
        <v-btn color="secondary" @click="showVerListaModal = false"
          >Cancelar</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { defineProps, onMounted, ref } from "vue";
import { InscripcionUsuarioDTO } from "@/interfaces/Inscripcion";
import {
  CrearListaTorneoRequestDTO,
  ModificarListaTorneoRequestDTO,
} from "@/interfaces/Lista";
import router from "@/router";
import {
  cancelarInscripcion,
  getInscripcionesUser,
} from "@/services/InscripcionesService";
import {
  subirListaTorneo,
  modificarListaTorneo,
  verlista,
} from "@/services/ListasService";

const props = defineProps<{
  isLoading: boolean;
  listaTorneos: InscripcionUsuarioDTO[];
}>();

const currentInscripcionId = ref<number | null>(null);
const currentTorneoId = ref<number | null>(null);
const listaText = ref<string>("");
const idLista = ref<number>();
const hasLista = ref<boolean>(false);
const listaTorneos = ref<InscripcionUsuarioDTO[]>([]);

const showSuccessModal = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);
const showVerListaModal = ref<boolean>(false);

const verDetalleInscripcion = (idInscripcion: number) => {
  currentInscripcionId.value = idInscripcion;
  currentTorneoId.value =
    listaTorneos.value.find(
      (i) => i.idInscripcion == currentInscripcionId.value
    )?.idTorneo ?? null;
  router.push(`/detalle-torneo/${currentTorneoId.value}`);
};

const enviarLista = async () => {
  const requestLista: CrearListaTorneoRequestDTO = {
    idInscripcion: currentInscripcionId.value!,
    listaData: listaText.value,
  };

  await subirListaTorneo(requestLista);

  showVerListaModal.value = false;
};

const modificarLista = async () => {
  const requestLista: ModificarListaTorneoRequestDTO = {
    idInscripcion: currentInscripcionId.value!,
    listaData: listaText.value,
    idLista: idLista.value!,
  };

  await modificarListaTorneo(requestLista);

  showVerListaModal.value = false;
};

const verLista = async (idInscripcion: number) => {
  currentInscripcionId.value = idInscripcion;

  try {
    const response = await verlista(currentInscripcionId.value);
    hasLista.value = true;

    listaText.value = response.listaData;
    idLista.value = response.idLista;
  } catch {
    //
  }

  showVerListaModal.value = true;
};

const eliminarInscripcion = async (idInscripcion: number) => {
  try {
    const response = await cancelarInscripcion(idInscripcion);

    if (response.request?.status === 200) {
      showSuccessModal.value = true;
      listaTorneos.value = await getInscripcionesUser(
        listaTorneos.value[0].idUsuario.toString()
      );
    } else {
      showErrorModal.value = true;
    }
  } catch {
    showErrorModal.value = true;
  }
};

onMounted(async () => {
  listaTorneos.value = props.listaTorneos;
});
</script>

<style scoped>
thead {
  background-color: #5b2269;
  color: white;
  text-align: center;
}

tbody tr {
  transition: background-color 0.3s;
}

tbody tr:hover {
  background-color: #3c4041;
}

.text-center {
  text-align: center;
}
</style>
