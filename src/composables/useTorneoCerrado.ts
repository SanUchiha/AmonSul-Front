import { inject, provide, ref, type InjectionKey, type Ref } from "vue";

// Con los resultados guardados el torneo está cerrado: el back ya no deja cambiar resultados, puntos extra ni quién
// juega. La gestión lo comparte con sus tarjetas y tablas para que no enseñen lo que ya no se puede tocar
const TORNEO_CERRADO: InjectionKey<Readonly<Ref<boolean>>> = Symbol("torneoCerrado");

export const compartirTorneoCerrado = (cerrado: Readonly<Ref<boolean>>) =>
  provide(TORNEO_CERRADO, cerrado);

// Fuera de una gestión no hay nada que ocultar
export const useTorneoCerrado = () => inject(TORNEO_CERRADO, ref(false));
