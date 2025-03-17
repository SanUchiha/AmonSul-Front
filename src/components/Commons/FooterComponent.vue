<template>
    <v-footer app class="footer">
        <v-container>
        <v-row justify="center">
            <v-col cols="12" class="text-center">
            <!--<v-btn text class="mx-2" to="/reglas">Reglas de Torneos</v-btn>
            <v-btn text class="mx-2" to="/soporte">Soporte</v-btn>-->
            <v-btn text class="mx-2" to="/contacto">Contacto</v-btn>
            <v-btn text href="https://www.paypal.com/donate?hosted_button_id=PCW6MDL3WBE6N" target="_blank">
                Donar con PayPal
            </v-btn>
            </v-col>
            <v-col cols="12" class="text-center">
            <p class="text-caption">&copy; {{ new Date().getFullYear() }} Amon Sûl Tournaments. Todos los derechos reservados.</p>
            </v-col>
        </v-row>
        </v-container>
    </v-footer>
</template>

<style scoped>
    .footer {
        background-color: #1e1e1e;
        color: white;
        padding: 10px 0;
    }
</style>
