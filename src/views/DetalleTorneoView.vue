<template>
  <div>
    <NavBar />

    <!-- Contenido de la vista de detalle del torneo -->
    <div v-if="torneo">
      <h2>{{ torneo.Nombre_Torneo }}</h2>
      <p>{{ torneo.Descripción_Torneo }}</p>
      <p>
        <strong>Fecha de inicio:</strong>
        {{ formatDate(torneo.Fecha_Inicio_Torneo) }}
      </p>
      <p>
        <strong>Fecha de fin:</strong> {{ formatDate(torneo.Fecha_Fin_Torneo) }}
      </p>
      <p><strong>Precio:</strong> {{ torneo.Precio_Torneo }}</p>
      <p><strong>Número de partidas:</strong> {{ torneo.Numero_Partidas }}</p>
      <p><strong>Puntos asignados:</strong> {{ torneo.Puntos_Torneo }}</p>
      <p><strong>Estado del torneo:</strong> {{ torneo.Estado_Torneo }}</p>
      <p><strong>Lugar:</strong> {{ torneo.Lugar_Torneo }}</p>
      <p><strong>Tipo de torneo:</strong> {{ torneo.Tipo_Torneo }}</p>
      <p>
        <strong>Torneo privado:</strong>
        {{ torneo.Es_Privado_Torneo ? "Sí" : "No" }}
      </p>
      <p>
        <strong>Fecha de entrega de listas:</strong>
        {{ formatDate(torneo.Fecha_Entrega_Listas) }}
      </p>
      <p>
        <strong>Fecha límite de inscripción:</strong>
        {{ formatDate(torneo.Fecha_Fin_Inscripcion) }}
      </p>
      <p><strong>Bases del torneo:</strong> {{ torneo.Bases_Torneo }}</p>
      <p>
        <strong>Horario:</strong> de {{ torneo.Hora_Inicio_Torneo }} a
        {{ torneo.Hora_Fin_Torneo }}
      </p>
    </div>

    <div v-else>
      <p>Cargando detalles del torneo...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import NavBar from "@/components/NavBar.vue";
import { Torneo } from "@/interfaces/Torneo";
import { getTorneoByIdMock } from "@/services/TorneosService";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
let torneo = ref<Torneo>();

onMounted(async () => {
  const idTorneo = Number(route.params.idTorneo); // Obtener el ID del torneo de los parámetros de la URL
  torneo.value = await getTorneoByIdMock(idTorneo);
});
const formatDate = (date: string | number | Date) => {
  const options = { year: "numeric", month: "numeric", day: "numeric" };
  return new Date(date).toLocaleDateString();
};
</script>

<style scoped>
/* Estilos para la vista de detalle del torneo */
/* Puedes agregar estilos personalizados según sea necesario */
</style>
