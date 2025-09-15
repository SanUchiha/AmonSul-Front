<template>
  <v-container fluid class="pa-4">
    <v-row class="justify-center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="mx-auto pa-4" tonal>
          <v-card-title class="d-flex align-center justify-between">
            <v-icon>mdi-alert</v-icon>
            <span class="font-weight-black title-centered">Error Server</span>
            <v-icon>mdi-alert</v-icon>
          </v-card-title>

          <v-card-text class="bg-surface-light pt-4 title-centered">
            Ha ocurrido un error al intentar conectar con el servidor.
          </v-card-text>

          <v-card-actions class="d-flex justify-center">
            <v-btn variant="tonal" to="/inicio-sesion">Volver</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts"></script>

<style scoped>
.pa-4 {
  padding: 16px; /* Adjust padding as needed */
}

.title-centered {
  flex: 1; /* Makes sure the title takes up available space */
  text-align: center;
}

.bg-surface-light {
  background-color: #f5f5f5; /* Adjust this color as needed */
}

.v-card {
  width: 100%;
}

.v-card-title {
  display: flex;
  align-items: center;
}

.v-card-actions {
  margin-top: 1em;
}

.v-btn {
  text-transform: none;
}

.v-icon {
  font-size: 24px; /* Adjust the size of the icons if needed */
}
</style>
