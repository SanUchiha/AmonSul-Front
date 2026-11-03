import { computed, inject, provide, ref, type InjectionKey, type Ref } from "vue";
import { ClassificationType } from "@/Constant/TipoClasificacion";

// Con el sistema alemán cada partida reparte 20 puntos según la diferencia del resultado. La vista que conoce el
// torneo lo comparte con sus tarjetas de partida, que enseñan esos puntos junto al resultado
const SISTEMA_ALEMAN: InjectionKey<Readonly<Ref<boolean>>> = Symbol("sistemaAleman");

export const compartirSistemaAleman = (
  tipoClasificacion: () => number | null | undefined
) =>
  provide(
    SISTEMA_ALEMAN,
    computed(() => tipoClasificacion() === ClassificationType.ALEMAN)
  );

// Sin quien lo diga, la partida solo enseña su resultado
export const useSistemaAleman = () => inject(SISTEMA_ALEMAN, ref(false));
