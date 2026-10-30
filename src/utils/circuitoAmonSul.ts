// El Amon Sûl de cada año: todos los eventos suman en el de su año, van solos y no se quitan.
// Sin distinguir mayúsculas ni tildes, como el back
export const esCircuitoAmonSul = (nombre?: string | null) =>
  (nombre ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase()
    .startsWith("amon sul");
