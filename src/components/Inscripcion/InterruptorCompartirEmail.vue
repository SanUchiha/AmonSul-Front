<template>
  <!-- Si el organizador puede ver tu correo: lo decides tú y lo cambias cuando quieras -->
  <v-switch
    :model-value="compartir"
    color="primary"
    density="compact"
    inset
    hide-details="auto"
    :loading="guardando"
    :disabled="guardando"
    label="Compartir mi correo con el organizador"
    :messages="
      compartir
        ? 'El organizador puede verlo para contactarte si hace falta.'
        : 'El organizador no ve tu correo.'
    "
    @update:model-value="cambiar"
  />
</template>

<script setup lang="ts">
import { defineProps, ref } from "vue";
import { cambiarCompartirEmailAsync } from "@/services/InscripcionesService";
import { useToast } from "@/composables/useToast";

const props = defineProps<{
  idInscripcion: number;
  valor?: boolean | null;
}>();

const { triggerToast } = useToast();
const compartir = ref(!!props.valor);
const guardando = ref(false);

const cambiar = async (valor: boolean | null) => {
  const nuevo = !!valor;
  guardando.value = true;
  try {
    await cambiarCompartirEmailAsync(props.idInscripcion, nuevo);
    compartir.value = nuevo;
    triggerToast(
      "success",
      nuevo
        ? "El organizador ya puede ver tu correo"
        : "El organizador ya no ve tu correo"
    );
  } catch (error) {
    console.error(error);
    triggerToast("error", "No se ha podido cambiar");
  } finally {
    guardando.value = false;
  }
};
</script>
