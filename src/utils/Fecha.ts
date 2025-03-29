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

export const convertirFecha = (dateString: string) => {
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

