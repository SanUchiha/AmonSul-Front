<template>
  <!-- Puntos extra que da el organizador: se tocan sin abrir lo que haya debajo -->
  <div class="d-flex align-center flex-shrink-0" @click.stop>
    <v-btn
      icon="mdi-minus"
      size="x-small"
      variant="tonal"
      :disabled="guardando"
      aria-label="Quitar un punto extra"
      @click.stop="cambiar(-1)"
    />
    <span class="mx-2 text-body-2 font-weight-bold puntos">{{ inscripcion.puntosExtra ?? 0 }}</span>
    <v-btn
      icon="mdi-plus"
      size="x-small"
      variant="tonal"
      :disabled="guardando"
      aria-label="Sumar un punto extra"
      @click.stop="cambiar(1)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "@/composables/useToast";
import { updatePuntosExtraAsync } from "@/services/InscripcionesService";

const props = defineProps<{
  inscripcion: { idInscripcion: number; idUsuario: number; puntosExtra?: number | null };
}>();

// Para que la vista recalcule su clasificación sin recargar
const emit = defineEmits<{
  (e: "cambiado", idUsuario: number, puntosExtra: number): void;
}>();

const { triggerToast } = useToast();
const guardando = ref(false);

const cambiar = async (puntos: number) => {
  const { inscripcion } = props;
  const anterior = inscripcion.puntosExtra ?? 0;
  guardando.value = true;
  // Se ve el cambio al momento y se deshace si falla
  // eslint-disable-next-line vue/no-mutating-props
  inscripcion.puntosExtra = anterior + puntos;
  try {
    await updatePuntosExtraAsync({
      idInscripcion: inscripcion.idInscripcion,
      puntosExtra: anterior + puntos,
    });
    emit("cambiado", inscripcion.idUsuario, anterior + puntos);
    triggerToast("success", "Puntos extra modificados correctamente.");
  } catch (error) {
    console.error("Error al actualizar puntos:", error);
    // eslint-disable-next-line vue/no-mutating-props
    inscripcion.puntosExtra = anterior;
    triggerToast("error", "Puntos extra no han podido ser modificados.");
  } finally {
    guardando.value = false;
  }
};
</script>

<style scoped>
.puntos {
  min-width: 1.5em;
  text-align: center;
}
</style>
