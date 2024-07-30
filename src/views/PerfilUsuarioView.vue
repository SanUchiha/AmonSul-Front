<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <h2>Configuración</h2>
          </v-card-title>
          <v-card-text>
            <div v-if="isLoading">
              <v-row justify="center" align="center" style="height: 100px">
                <v-col cols="12" class="text-center">
                  <ProgressCircular />
                </v-col>
              </v-row>
            </div>
            <div v-else-if="user">
              <v-row>
                <v-col cols="12" class="d-flex justify-space-between">
                  <v-text-field
                    label="Nombre"
                    v-model="user!.nombreUsuario"
                    readonly
                  ></v-text-field>
                </v-col>
                <v-divider></v-divider>
                <v-col cols="12" class="d-flex justify-space-between">
                  <v-text-field
                    label="Primer Apellido"
                    v-model="user!.primerApellido"
                    readonly
                  ></v-text-field>
                </v-col>
                <v-divider></v-divider>
                <v-col cols="12" class="d-flex justify-space-between">
                  <v-text-field
                    label="Segundo Apellido"
                    v-model="user!.segundoApellido"
                    readonly
                  ></v-text-field>
                </v-col>
                <v-divider></v-divider>
                <v-col cols="12" class="d-flex justify-space-between">
                  <v-text-field
                    label="Email"
                    v-model="user!.email"
                    type="email"
                    readonly
                  ></v-text-field>
                </v-col>
                <v-divider></v-divider>
                <v-col cols="12" class="d-flex justify-space-between">
                  <v-text-field
                    label="Nick"
                    v-model="user!.nick"
                    readonly
                  ></v-text-field>
                </v-col>
                <v-divider></v-divider>
                <v-col cols="12" class="d-flex justify-space-between">
                  <v-text-field
                    label="ciudad"
                    v-model="user!.ciudad"
                    readonly
                  ></v-text-field>
                </v-col>
                <v-divider></v-divider>
                <v-col cols="12" class="d-flex justify-space-between">
                  <v-text-field
                    label="Fecha de nacimiento"
                    v-model="user!.fechaNacimiento"
                    readonly
                  ></v-text-field>
                </v-col>
                <v-divider></v-divider>
                <v-col cols="12">
                  <v-text-field
                    ref="nombreFaccionField"
                    label="Comunidad de juego"
                    v-model="selectedFaccionName"
                    readonly
                    append-inner-icon="mdi-pencil"
                    @click:append-inner="openEditFaccionDialog"
                  ></v-text-field>
                </v-col>
                <v-divider></v-divider>
                <v-col cols="12" class="d-flex justify-space-between">
                  <v-text-field
                    label="Teléfono"
                    v-model="user!.telefono"
                    readonly
                  ></v-text-field>
                </v-col>
              </v-row>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal for editing faction -->
    <v-dialog v-model="editFaccionDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Editar Comunidad de juego</span>
        </v-card-title>
        <v-card-text>
          <v-combobox
            v-model="selectedFaccionName"
            :items="faccionesCombo"
            item-value="idFaccion"
            label="Selecciona una comunidad"
          ></v-combobox>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" @click="closeEditFaccionDialog"
            >Cancelar</v-btn
          >
          <v-btn color="blue darken-1" @click="saveFaccion">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="feedbackDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ feedbackTitle }}</span>
        </v-card-title>
        <v-card-text>
          <p>{{ feedbackMessage }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" @click="closeFeedbackDialog">
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { UsuarioViewDTO } from "@/interfaces/Usuario";
import { editarFaccion, getUsuario } from "@/services/UsuariosService";
import { onMounted, ref } from "vue";
import { useAuth } from "@/composables/useAuth";
import ProgressCircular from "@/components/Commons/ProgressCircular.vue";
import { getFacciones } from "@/services/FaccionesService";
import { EditarFaccionDTO, FaccionDTO } from "@/interfaces/Faccion";

const user = ref<UsuarioViewDTO>();
const isLoading = ref(true);
const { getUser } = useAuth();
const email = ref<string>(await getUser.value!);
const facciones = ref<FaccionDTO[]>([]);
const editFaccionDialog = ref(false);
const selectedFaccionName = ref<string>("");
const faccionesCombo = ref<string[]>([]);

const feedbackDialog = ref(false);
const feedbackMessage = ref("");
const feedbackTitle = ref("");

onMounted(async () => {
  try {
    isLoading.value = true;

    const responseUsuario = await getUsuario(email.value);
    user.value = responseUsuario.data;
    const faccionesResponse = await getFacciones();
    facciones.value = faccionesResponse.data;
    const faccionEncontrada: FaccionDTO | undefined = facciones.value.find(
      (f) => f.idFaccion === user.value?.idFaccion
    );
    if (faccionEncontrada) {
      user.value!.faccion = faccionEncontrada;
      selectedFaccionName.value = faccionEncontrada.nombreFaccion;
    }
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
  } finally {
    isLoading.value = false;
  }
});

const openEditFaccionDialog = () => {
  editFaccionDialog.value = true;
  faccionesCombo.value = facciones.value.map((x) => x.nombreFaccion);
};

const closeEditFaccionDialog = () => {
  editFaccionDialog.value = false;
};

const saveFaccion = async () => {
  const faccionSelected: FaccionDTO = facciones.value.find(
    (x) => x.nombreFaccion === selectedFaccionName.value
  )!;

  const body: EditarFaccionDTO = {
    idFaccion: faccionSelected.idFaccion,
    idUsuario: user.value!.idUsuario,
  };

  try {
    await editarFaccion(body);
    feedbackTitle.value = "Éxito";
    feedbackMessage.value =
      "La comunidad de juego ha sido actualizada correctamente.";

    const responseUsuario = await getUsuario(email.value);
    user.value = responseUsuario.data;
    const faccionesResponse = await getFacciones();
    facciones.value = faccionesResponse.data;
    const faccionEncontrada: FaccionDTO | undefined = facciones.value.find(
      (f) => f.idFaccion === user.value?.idFaccion
    );
    if (faccionEncontrada) {
      user.value!.faccion = faccionEncontrada;
      selectedFaccionName.value = faccionEncontrada.nombreFaccion;
    }
  } catch (error) {
    console.error("Error al editar la facción:", error);
    feedbackTitle.value = "Error";
    feedbackMessage.value =
      "Ha habido un problema al actualizar la comunidad de juego.";

    const responseUsuario = await getUsuario(email.value);
    user.value = responseUsuario.data;
    const faccionesResponse = await getFacciones();
    facciones.value = faccionesResponse.data;
    const faccionEncontrada: FaccionDTO | undefined = facciones.value.find(
      (f) => f.idFaccion === user.value?.idFaccion
    );
    if (faccionEncontrada) {
      user.value!.faccion = faccionEncontrada;
      selectedFaccionName.value = faccionEncontrada.nombreFaccion;
    }
  }

  closeEditFaccionDialog();
  feedbackDialog.value = true;
};

const closeFeedbackDialog = () => {
  feedbackDialog.value = false;
};
</script>

<style scoped>
.d-flex {
  display: flex;
}

.justify-space-between {
  justify-content: space-between;
}

.text-center {
  text-align: center;
}
</style>
