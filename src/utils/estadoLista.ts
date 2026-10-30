// Los estados de una lista: el valor que se guarda en la base de datos y cómo se enseña. OK: la ha dado por buena
// el organizador; ILEGAL: la ha marcado él y hay que cambiarla
export const ESTADOS_LISTA = [
  { valor: "NO ENTREGADA", corto: "Sin entregar", color: "warning" },
  { valor: "ENTREGADA", corto: "Entregada", color: "success" },
  { valor: "OK", corto: "Validada", color: "success" },
  { valor: "ILEGAL", corto: "Ilegal", color: "error" },
] as const;

// Sin estado o con uno desconocido, como sin entregar
export const estadoLista = (estado?: string | null) => {
  const valor = (estado ?? "").toUpperCase();
  const encontrado = ESTADOS_LISTA.find(e => e.valor === valor) ?? ESTADOS_LISTA[0];
  return {
    corto: encontrado.corto,
    texto: `Lista ${encontrado.corto.toLowerCase()}`,
    color: encontrado.color,
  };
};

// El bando de una lista entregada: good es Luz y evil, Oscuridad. Sin bando, nada
export const bandoLista = (bando?: string | null) => {
  const valor = (bando ?? "").toLowerCase();
  if (valor === "good") return { texto: "Luz" };
  if (valor === "evil") return { texto: "Oscuridad" };
  return null;
};
