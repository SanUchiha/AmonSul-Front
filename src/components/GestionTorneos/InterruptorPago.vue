<template>
  <!-- El pago de un toque, igual en todas las gestiones; se toca sin abrir ni desplegar la tarjeta -->
  <div class="flex-shrink-0" @click.stop>
    <v-switch
      :model-value="pagado"
      color="success"
      density="compact"
      hide-details
      :loading="guardando"
      :disabled="guardando"
      class="interruptor"
      @update:model-value="cambiar"
    >
      <template #label>
        <span class="text-body-2" :class="pagado ? 'text-success' : 'text-warning'">
          {{ pagado ? "Pagado" : "No pagado" }}
        </span>
      </template>
    </v-switch>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useToast } from "@/composables/useToast";
import { updateEstadoPago, updateEstadoPagoEquipo } from "@/services/InscripcionesService";

// Una inscripción o, en equipos y parejas, el equipo entero
const props = defineProps<{
  esPago?: string | null;
  idInscripcion?: number;
  idEquipo?: number;
}>();

const emit = defineEmits<{ (e: "cambiado", esPago: "SI" | "NO"): void }>();

const { triggerToast } = useToast();
const guardando = ref(false);
const pagado = computed(() => (props.esPago ?? "").toUpperCase() === "SI");

const cambiar = async (valor: boolean | null) => {
  const esPago = valor ? "SI" : "NO";
  guardando.value = true;
  try {
    if (props.idEquipo) await updateEstadoPagoEquipo({ idEquipo: props.idEquipo, esPago });
    else if (props.idInscripcion) await updateEstadoPago({ idInscripcion: props.idInscripcion, esPago });
    else return;
    emit("cambiado", esPago);
    triggerToast("success", esPago === "SI" ? "Marcado como pagado." : "Marcado como no pagado.");
  } catch (error) {
    console.error("Error actualizando el pago:", error);
    triggerToast("error", "No se ha podido cambiar el pago.");
  } finally {
    guardando.value = false;
  }
};
</script>

<style scoped>
/* Sin el alto mínimo del campo: cabe en la línea de estado de la tarjeta */
.interruptor :deep(.v-selection-control) {
  min-height: 0;
}
</style>
