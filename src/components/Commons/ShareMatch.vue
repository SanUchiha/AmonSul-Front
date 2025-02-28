<template>
    <v-card-actions class="pb-10 v-card-actions">
        <v-btn @click="compartirPartida" variant="text">
            <img src="@/assets/icons/shareMatch.png" alt="Icono personalizado" width="60" height="60">
        </v-btn>
    </v-card-actions>
</template>

<script setup lang="ts">
import html2canvas from "html2canvas";
import { ViewPartidaTorneoDTO } from "@/interfaces/Partidas";
import { ViewPartidaAmistosaDTO } from "@/interfaces/Partidas";
import { defineProps, computed } from "vue";

const props = defineProps<{
  matchTorneo?: ViewPartidaTorneoDTO;
  matchAmistosa?: ViewPartidaAmistosaDTO;
}>();

const match = computed(() => props.matchTorneo ?? props.matchAmistosa);

const compartirPartida = async (event: Event) => {

    if (match.value){
        const targetElement = (event.currentTarget as HTMLElement).closest(".match-card");
    
        if (!targetElement) {
            console.error("No se encontró la tarjeta de partida.");
            return;
        }
    
        const targetCard = targetElement as HTMLElement; // Conversión segura a HTMLElement
        const cardActions = targetCard.querySelector(".v-card-actions") as HTMLElement | null; // 🔹 Buscamos correctamente
    
        try {
            // 🔹 Ocultar `v-card-actions` antes de capturar la imagen
            if (cardActions){
                // 🔹 Animación suave
                cardActions.style.transition = "opacity 0.3s ease-in-out, height 0.3s ease-in-out";
                cardActions.style.opacity = "0";
                cardActions.style.height = "0";
    
                // 🔹 Esperar a que termine la animación antes de aplicar `display: none`
                setTimeout(() => {
                    if (cardActions) {
                    cardActions.style.display = "none";
                    }
                }, 300); // 300ms → igual a la duración de la animación
            } 
    
            const canvas = await html2canvas(targetCard); 
    
            // 🔹 Restaurar `v-card-actions` después de la captura
            if (cardActions) {
                cardActions.style.display = "flex"; // Restaurar el display
                cardActions.style.opacity = "1";
                cardActions.style.height = "auto";
            }
    
            const image = canvas.toDataURL("image/png");
    
            if (navigator.share) {
            const blob = await fetch(image).then(res => res.blob());
            const file = new File([blob], "partida.png", { type: "image/png" });
    
            await navigator.share({
                title: "¡Mira mi partida de Warhammer!",
                text: `Partida entre ${match.value.nickUsuario1} y ${match.value.nickUsuario2}`,
                files: [file],
            });
            } else {
            const link = document.createElement("a");
            link.href = image;
            link.download = "partida.png";
            link.click();
            }
        } catch (error) {
            console.error("Error al compartir la partida:", error);
        }
    }
};
</script>