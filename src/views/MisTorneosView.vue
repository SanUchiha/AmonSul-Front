<template>
  <v-container>
    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-else>
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
    </div>

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
          <div v-if="lista.length < 1">
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
          <div v-if="lista.length < 1">
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
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { InscripcionUsuarioDTO } from "@/interfaces/Inscripcion";
import {
  cancelarInscripcion,
  getInscripcionesUser,
} from "@/services/InscripcionesService";
import { useAuth } from "@/composables/useAuth";
import { useRouter } from "vue-router";
import {
  CrearListaTorneoRequestDTO,
  ModificarListaTorneoRequestDTO,
} from "@/interfaces/Lista";
import {
  subirListaTorneo,
  verlista,
  modificarListaTorneo,
} from "@/services/ListasService";

const { getidUsuario } = useAuth();
const isLoading = ref<boolean>(true);
const error = ref<string | null>(null);
const router = useRouter();

const listaTorneos = ref<InscripcionUsuarioDTO[]>([]);
const idUsuario = ref<string>(getidUsuario.value!);

const showSuccessModal = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);

const showVerListaModal = ref<boolean>(false);
const listaText = ref<string>("");
const currentInscripcionId = ref<number | null>(null);
const lista = ref<string>("");
const idLista = ref<number>();

const verDetalleInscripcion = (idInscripcion: number) => {
  router.push(`/detalle-inscripcion/${idInscripcion}`);
};

const enviarLista = async () => {
  console.log("Lista enviada para la inscripción:");
  console.log("Contenido de la lista:", listaText.value);

  const requestLista: CrearListaTorneoRequestDTO = {
    idInscripcion: currentInscripcionId.value!,
    listaData: listaText.value,
  };

  console.log(requestLista);

  const response = await subirListaTorneo(requestLista);

  showVerListaModal.value = false;
};

const modificarLista = async () => {
  console.log("Lista modificada para la inscripción:");
  console.log("Contenido de la lista:", listaText.value);

  const requestLista: ModificarListaTorneoRequestDTO = {
    idInscripcion: currentInscripcionId.value!,
    listaData: listaText.value,
    idLista: idLista.value!,
  };

  console.log(requestLista);

  const response = await modificarListaTorneo(requestLista);

  showVerListaModal.value = false;
};

const verLista = async (idInscripcion: number) => {
  currentInscripcionId.value = idInscripcion;
  lista.value = "Prueva ";
  listaText.value = lista.value;

  const response = await verlista(currentInscripcionId.value);

  console.log(response);
  listaText.value = response.listaData;
  idLista.value = response.idLista;

  showVerListaModal.value = true;
};

const eliminarInscripcion = async (idInscripcion: number) => {
  try {
    const response = await cancelarInscripcion(idInscripcion);

    if (response.request?.status === 200) {
      showSuccessModal.value = true;
      listaTorneos.value = await getInscripcionesUser(idUsuario.value);
    } else {
      showErrorModal.value = true;
    }
  } catch {
    showErrorModal.value = true;
  }
};

onMounted(async () => {
  try {
    listaTorneos.value = await getInscripcionesUser(idUsuario.value);
  } catch (err) {
    error.value = "Error al obtener datos del usuario";
    console.error("Error al obtener datos del usuario:", err);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.loading {
  text-align: center;
  font-size: 1.5em;
  margin-top: 20px;
}

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
