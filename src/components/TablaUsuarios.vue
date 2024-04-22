<template>
  <v-icon>mdi-heart</v-icon>

  <v-table density="compact">
    <thead>
      <tr>
        <th class="text-center">id</th>
        <th class="text-center">Nombre</th>
        <th class="text-center">Nick</th>
        <th class="text-center">Correo</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in usuarios" :key="item.id">
        <td>{{ item.id }}</td>
        <td>
          <router-link :to="{ name: 'detalle-jugador', params:{id:item.id}}">{{ item.name }}</router-link>
        </td>
        <td>{{ item.username }}</td>
        <td>{{ item.email }}</td>
      </tr>
    </tbody>
  </v-table>
</template>

<script setup lang="ts">
import { IUsuario } from '@/interfaces/Usuario';
import { onMounted, ref } from 'vue';
import { getUsers } from '../services/UsuariosService';

const usuarios = ref<IUsuario[]>([]);

onMounted(async () => {
  usuarios.value = await getUsers();
});
</script>

<style scoped>
/* Estilos personalizados */
</style>
