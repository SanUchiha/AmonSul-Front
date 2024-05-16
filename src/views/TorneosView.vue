<template>
  <div>
    <NavBar />
    <div class="vista-torneos">
      <div
        class="tarjeta-torneo"
        v-for="torneo in listaTorneos"
        :key="torneo.ID_Torneo"
      >
        <!-- Contenido de la tarjeta del torneo -->
        <h2>{{ torneo.Nombre_Torneo }}</h2>
        <p>
          FECHA: {{ torneo.Fecha_Inicio_Torneo.getDate() }}/{{
            torneo.Fecha_Inicio_Torneo.getDay()
          }}/{{ torneo.Fecha_Inicio_Torneo.getFullYear() }}
        </p>
        <p>LUGAR: {{ torneo.Lugar_Torneo }}</p>
        <p>RONDAS: {{ torneo.Numero_Partidas }}</p>
        <p>PRECIO: {{ torneo.Precio_Torneo }}</p>
        <p>PUNTOS: {{ torneo.Puntos_Torneo }}</p>
        <p>
          <button @click="goToDetalle(torneo.ID_Torneo)" type="button">
            Ver mas detalle
          </button>
        </p>

        <!-- Otros detalles del torneo como fechas, precios, etc. -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NavBar from "@/components/NavBar.vue";
import { Torneo } from "@/interfaces/Torneo";
import { useRouter } from "vue-router";
import { getTorneosMock } from "@/services/TorneosService";
import { onMounted, ref } from "vue";

const listaTorneos = ref<Torneo[]>([]);
const router = useRouter();

onMounted(async () => {
  listaTorneos.value = await getTorneosMock();
});

const goToDetalle = (idTorneo: number) => {
  router.push(`/detalle-torneo/${idTorneo}`);
};
</script>

<style scoped>
/* Estilos para la vista de torneos y las tarjetas */
.vista-torneos {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.tarjeta-torneo {
  width: 300px;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 20px;
  margin: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
