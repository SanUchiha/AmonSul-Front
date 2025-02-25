<template>
    <v-card class="profile-section">
        <v-avatar size="120" class="avatar">
            <v-img src="https://placehold.co/120" alt="Avatar"></v-img>
        </v-avatar>
        <h2 class="player-name text-wrap">{{ user.nombreUsuario }} {{ user.primerApellido }} {{ user.segundoApellido }} <v-icon size="x-small">mdi-pen</v-icon></h2>
        <h2 class="player-name text-wrap">{{ user.nick }}</h2>
        <v-divider class="mb-3"></v-divider>
        <p class="profile-info"><strong>Clan:</strong> {{selectedFaccionName }}</p>
        <p class="profile-info"><strong>Población:</strong> {{ user.ciudad }}</p>
        <p class="profile-info"><strong>Email:</strong> {{ user.email }}</p>
        <p class="profile-info"><strong>Fecha de nacimiento:</strong> {{ user.fechaNacimiento }}</p>
        <p class="profile-info"><strong>Teléfono:</strong> {{ user.telefono }}</p>
    </v-card>
</template>
<script setup lang="ts">
import {UsuarioViewDTO} from "@/interfaces/Usuario";
import {
  defineProps,
} from "vue";

const props = defineProps<{
  user: UsuarioViewDTO;
  selectedFaccionName: string
}>();

</script>
<style scoped>
.profile-section {
    padding: 20px;
    text-align: center;
    background: #212121;
    color: white;
    border-radius: 12px;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5);
}
.avatar {
    margin-bottom: 10px;
    border: 3px solid #f5e1a4;
}
.player-name {
    font-size: 22px;
    font-weight: bold;
    margin-bottom: 10px;
    color: #f5e1a4;
}

.profile-info {
    font-size: 16px;
    color: #e0e0e0;
}
</style>