import { ArmyDTO } from "@/interfaces/Army";
import { appsettings } from "@/settings/appsettings";

// En la liga la lista va siempre con el ejército elegido al inscribirse
export const ejercitoPorNombre = (nombre: string): ArmyDTO => ({
  name: nombre,
  band: appsettings.armies.find(a => a.name === nombre)?.band ?? "",
});
