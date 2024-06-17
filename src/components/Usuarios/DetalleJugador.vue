<template>
  <div class="jugador-card">
    <h2>Componente con el Detalle del Jugador</h2>

    <div v-if="jugador">
      <p><strong>ID:</strong> {{ jugador.id }}</p>
      <p><strong>Nombre:</strong> {{ jugador.correo }}</p>
      <p><strong>Nombre de usuario:</strong> {{ jugador.password }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getUser } from '@/services/UsuariosService';
import { IUsuario } from '@/interfaces/Usuario';

const jugador = ref<IUsuario>({
  id: 0,
  correo:"",
  password:""  
});

onMounted(async () => {
  const route = useRoute();
  const idJugador = route.params.idJugador;

  if (typeof idJugador === 'string') {
    jugador.value = await getUser(parseInt(idJugador));
  } else {
    jugador.value = await getUser(idJugador);
  }
});
</script>

<style scoped>
.jugador-card {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.jugador-card h2 {
  font-size: 24px;
  margin-bottom: 20px;
}

.jugador-card p {
  margin-bottom: 10px;
}
</style>