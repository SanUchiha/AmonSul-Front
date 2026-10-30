import {
  FASE_ELIMINATORIA,
  FASE_GRUPOS,
  FASE_TERCER_PUESTO,
} from "@/Constant/FormatoTorneo";
import { ClassificationType } from "@/Constant/TipoClasificacion";
import { PartidaTorneoDTO } from "@/interfaces/Partidas";
import {
  FilaClasificacionLiga,
  generarClasificacionLiga,
} from "@/utils/clasificacionLiga";

// Un lado de un cruce: un jugador, un hueco que se queda vacío o aún por decidir
export interface LadoCuadro {
  idUsuario: number | null;
  nick: string | null;
  pendiente: boolean;
}

export interface CruceCuadro {
  numero: number;
  // Solo existe en cuanto se conocen los dos jugadores
  partida: PartidaTorneoDTO | null;
  a: LadoCuadro;
  b: LadoCuadro;
  pasa: LadoCuadro;
  pierde: LadoCuadro;
}

export interface RondaCuadro {
  numero: number;
  nombre: string;
  cruces: CruceCuadro[];
}

export interface CuadroCopa {
  rondas: RondaCuadro[];
  tercerPuesto: CruceCuadro | null;
  campeon: LadoCuadro;
}

const HUECO: LadoCuadro = { idUsuario: null, nick: null, pendiente: false };
const POR_DECIDIR: LadoCuadro = { idUsuario: null, nick: null, pendiente: true };

export const esDelCuadro = (partida: PartidaTorneoDTO) =>
  partida.fase === FASE_ELIMINATORIA || partida.fase === FASE_TERCER_PUESTO;

// Por los cruces que tiene: la final tiene uno
export function nombreRonda(cruces: number) {
  switch (cruces) {
    case 1:
      return "Final";
    case 2:
      return "Semifinales";
    case 4:
      return "Cuartos de final";
    case 8:
      return "Octavos de final";
    case 16:
      return "Dieciseisavos de final";
    default:
      return `Ronda de ${cruces * 2}`;
  }
}

function potenciaDeDos(n: number) {
  let potencia = 1;
  while (potencia < n) potencia *= 2;
  return potencia;
}

/**
 * El cuadro entero a partir de los huecos de la primera ronda y de las partidas que ya existen, como lo monta el
 * back: el ganador del cruce c de una ronda va al cruce ceil(c/2) de la siguiente. Los cruces que aún no tienen
 * partida salen con sus lados conocidos o por decidir, y los que tienen un hueco vacío pasan sin jugar
 */
export function montarCuadro(
  partidas: PartidaTorneoDTO[],
  inscripciones: {
    idUsuario: number;
    nick?: string | null;
    posicionCuadro?: number | null;
  }[],
  conTercerPuesto: boolean
): CuadroCopa | null {
  const enCuadro = inscripciones.filter(i => i.posicionCuadro);
  if (enCuadro.length === 0) return null;

  const existentes = new Map<string, PartidaTorneoDTO>();
  partidas
    .filter(esDelCuadro)
    .forEach(p => existentes.set(`${p.fase}-${p.numeroRonda}-${p.cruce}`, p));

  const tamano = potenciaDeDos(Math.max(...enCuadro.map(i => i.posicionCuadro ?? 0)));
  const numeroRondas = Math.log2(tamano);
  let nivel: LadoCuadro[] = Array.from({ length: tamano }, () => HUECO);
  enCuadro.forEach(i => {
    nivel[(i.posicionCuadro ?? 1) - 1] = {
      idUsuario: i.idUsuario,
      nick: i.nick ?? null,
      pendiente: false,
    };
  });

  const resolver = (
    fase: string,
    ronda: number,
    numero: number,
    a: LadoCuadro,
    b: LadoCuadro
  ): CruceCuadro => {
    const partida = existentes.get(`${fase}-${ronda}-${numero}`) ?? null;
    if (partida) {
      const lado1: LadoCuadro = { idUsuario: partida.idUsuario1, nick: partida.nick1, pendiente: false };
      const lado2: LadoCuadro = { idUsuario: partida.idUsuario2, nick: partida.nick2, pendiente: false };
      const pasa =
        partida.idUsuarioPasa === partida.idUsuario1
          ? lado1
          : partida.idUsuarioPasa === partida.idUsuario2
            ? lado2
            : POR_DECIDIR;
      const pierde = pasa === lado1 ? lado2 : pasa === lado2 ? lado1 : POR_DECIDIR;
      return { numero, partida, a: lado1, b: lado2, pasa, pierde };
    }
    // Sin partida: o falta saber quién llega, o uno pasa sin jugar porque el otro hueco se queda vacío
    if (a.pendiente || b.pendiente || (a.idUsuario && b.idUsuario))
      return { numero, partida, a, b, pasa: POR_DECIDIR, pierde: POR_DECIDIR };
    return {
      numero,
      partida,
      a,
      b,
      pasa: a.idUsuario ? a : b.idUsuario ? b : HUECO,
      pierde: HUECO,
    };
  };

  const rondas: RondaCuadro[] = [];
  let perdedoresSemis: LadoCuadro[] = [HUECO, HUECO];
  for (let ronda = 1; ronda <= numeroRondas; ronda++) {
    const cruces: CruceCuadro[] = [];
    for (let c = 0; c < nivel.length / 2; c++)
      cruces.push(resolver(FASE_ELIMINATORIA, ronda, c + 1, nivel[2 * c], nivel[2 * c + 1]));
    if (ronda === numeroRondas - 1) perdedoresSemis = cruces.map(c => c.pierde);
    rondas.push({ numero: ronda, nombre: nombreRonda(cruces.length), cruces });
    nivel = cruces.map(c => c.pasa);
  }

  const tercerPuesto =
    conTercerPuesto && numeroRondas >= 2
      ? resolver(FASE_TERCER_PUESTO, numeroRondas, 1, perdedoresSemis[0], perdedoresSemis[1])
      : null;

  return { rondas, tercerPuesto, campeon: nivel[0] };
}

// Cómo se nombra una partida: su grupo y jornada, o su ronda del cuadro si se conoce el cuadro entero o al menos
// cuántas rondas tiene; si no, "Eliminatoria" sin más
export function etiquetaPartidaCopa(
  partida: Pick<PartidaTorneoDTO, "fase" | "grupo" | "numeroRonda">,
  cuadro?: CuadroCopa | null,
  rondasCuadro?: number | null
) {
  if (partida.fase === FASE_TERCER_PUESTO) return "Tercer puesto";
  if (partida.fase === FASE_ELIMINATORIA) {
    const enCuadro = cuadro?.rondas.find(r => r.numero === partida.numeroRonda)?.nombre;
    if (enCuadro) return enCuadro;
    // La ronda r de un cuadro de n rondas tiene 2^(n - r) cruces
    if (rondasCuadro && partida.numeroRonda <= rondasCuadro)
      return nombreRonda(2 ** (rondasCuadro - partida.numeroRonda));
    return "Eliminatoria";
  }
  return `Grupo ${partida.grupo} · Jornada ${partida.numeroRonda}`;
}

// La clasificación de cada grupo con lo jugado; la del grupo g está en la posición g - 1
export function clasificacionGrupos(
  partidas: PartidaTorneoDTO[],
  // Solo hacen falta los puntos extra que da el organizador
  inscripciones: { idUsuario: number; puntosExtra?: number | null }[],
  numeroGrupos: number,
  tipo: ClassificationType | undefined
): FilaClasificacionLiga[][] {
  const deGrupos = partidas.filter(p => p.fase === FASE_GRUPOS);
  return Array.from({ length: numeroGrupos }, (_, g) =>
    generarClasificacionLiga(
      deGrupos.filter(p => p.grupo === g + 1),
      inscripciones,
      tipo
    )
  );
}

// Con el cuadro hecho, los que están en él; antes, los primeros de cada grupo si acabaran ahora
export function clasificadosCopa(
  grupos: FilaClasificacionLiga[][],
  inscripciones: { idUsuario: number; posicionCuadro?: number | null }[],
  porGrupo: number
) {
  const enCuadro = inscripciones.filter(i => i.posicionCuadro);
  if (enCuadro.length > 0) return enCuadro.map(i => i.idUsuario);
  return grupos.flatMap(filas =>
    filas.filter(f => f.posicion <= porGrupo).map(f => f.idUsuario)
  );
}
