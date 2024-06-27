<template>
  <v-card
    class="mx-auto"
    prepend-icon="mdi-alert"
    append-icon="mdi-alert"
    width="400"
  >
    <template v-slot:title>
      <span class="font-weight-black title-centered">Error Server</span>
    </template>

    <v-card-text class="bg-surface-light pt-4 title-centered">
      Ha ocurrido un error al intentar conectar con el servido. Intententelo de
      nuevo mas tarde.
    </v-card-text>
    <v-container>
      <v-row align="center" justify="center">
        <v-col cols="auto">
          <v-btn variant="outlined" to="inicio-sesion"> Volver</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script setup lang="ts"></script>

<style scoped>
.title-centered {
  display: block;
  width: 100%;
  text-align: center;
}
</style>
