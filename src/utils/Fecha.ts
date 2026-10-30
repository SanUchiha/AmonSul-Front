export const formatFechaSpa = async (fecha: string): Promise<string> => {
  if (fecha !== null){
    const [year, month, day] = fecha.split("-");
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
  }
  return "";
};

export const formatFechaSpaWhitoutAsync = (fecha: string): string => {
  if (!fecha) return "";
  const [year, month, day] = fecha.split(/[-/]/);
  return `${day}/${month}/${year}`;
};


export const formatFechaDB = async (fecha: string): Promise<string> => {
  const [day, month, year] = fecha.split("/");
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
};

// Hoy como "AAAA-MM-DD", para comparar días sin horas
export const diaDeHoy = () => new Date().toLocaleDateString("sv-SE");

// El último día de un evento: su fecha de fin o, si no la tiene válida (anterior al inicio), la de inicio
export const ultimoDiaEvento = (inicio: string, fin?: string | null) => {
  const diaInicio = inicio.slice(0, 10);
  const diaFin = (fin ?? "").slice(0, 10);
  return diaFin >= diaInicio ? diaFin : diaInicio;
};

// "AAAA-MM-DD" de una fecha del back; "" si no la hay o es la vacía (0001-01-01) de un DateOnly
export const fechaConocida = (fecha: string | null | undefined) =>
  fecha && Number(fecha.slice(0, 4)) > 1900 ? fecha.slice(0, 10) : "";

// Sin fecha devuelve "": hay usuarios sin fecha de nacimiento y el split rompía su perfil
export const convertirFecha = (dateString: string | null | undefined) => {
  if (!dateString) return "";

  const dateParts = dateString.split("-");

  if (dateParts.length !== 3) {
    return dateString;
  }

  const day = dateParts[0];
  const month = dateParts[1];
  const year = dateParts[2];

  return `${year}/${month}/${day}`;
};

export const obtenerFechaActual = () => {
  const hoy = new Date();
  const dia = String(hoy.getDate()).padStart(2, '0');
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const anio = hoy.getFullYear();
  return `${anio}/${mes}/${dia}`;
}

