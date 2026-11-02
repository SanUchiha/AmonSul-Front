<template>
  <v-footer app class="footer">
    <v-container>
      <v-row justify="center">
        <v-col cols="12" class="text-center">
          <v-btn class="mx-2" to="/contacto">Contacto</v-btn>
          <v-btn
            class="mx-2"
            href="https://paypal.me/sanuchiha"
            target="_blank"
          >
            Donar con PayPal
          </v-btn>
        </v-col>
        <v-col cols="12" class="text-center">
          <p class="text-caption">
            &copy; {{ new Date().getFullYear() }} Amon Sûl. Una App para
            gobernarlos a todos.
          </p>
          <router-link to="/politica-privacidad" class="text-caption enlace">
            Política de privacidad
          </router-link>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<style scoped>
.enlace {
  color: inherit;
  opacity: 0.8;
}

.footer {
  background-color: #1e1e1e;
  color: white;
  padding: 10px 0;
}
</style>
