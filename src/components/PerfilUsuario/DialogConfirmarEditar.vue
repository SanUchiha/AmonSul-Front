<template>
  <v-dialog v-model="localDialogoEdicion" max-width="500px">
    <v-card>
      <v-card-title>
        <span class="headline">Editar {{ label }}</span>
      </v-card-title>
      <v-card-text>
        <v-form ref="form">
          <v-text-field
            v-model="localValorEdicion"
            :label="label"
            required
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="tonal" color="blue darken-1" @click="cerrarDialogo"
          >Cancelar</v-btn
        >
        <v-btn variant="tonal" color="blue darken-1" @click="guardarCambios"
          >Guardar</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from "vue";

const props = defineProps({
  dialogoEdicion: Boolean,
  campoEdicion: String,
  valorEdicion: String,
  label: String,
});

const emit = defineEmits(["update:dialogoEdicion", "guardar"]);

const localDialogoEdicion = ref(props.dialogoEdicion);
const localValorEdicion = ref(props.valorEdicion);

watch(
  () => props.dialogoEdicion,
  (newVal) => {
    localDialogoEdicion.value = newVal;
  }
);

watch(
  () => props.valorEdicion,
  (newVal) => {
    localValorEdicion.value = newVal;
  }
);

watch(
  () => localDialogoEdicion.value,
  (newVal) => {
    if (newVal !== props.dialogoEdicion) {
      emit("update:dialogoEdicion", newVal);
    }
  }
);

const cerrarDialogo = () => {
  localDialogoEdicion.value = false;
};

const guardarCambios = () => {
  emit("guardar", localValorEdicion.value);
  cerrarDialogo();
};
</script>

<style scoped>
.headline {
  font-weight: bold;
}
</style>
