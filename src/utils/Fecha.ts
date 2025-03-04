export const formatFechaSpa = async (fecha: string): Promise<string> => {
  const [year, month, day] = fecha.split("-");
  const formattedDate = `${day}/${month}/${year}`;
  return formattedDate;
};

export const formatFechaDB = async (fecha: string): Promise<string> => {
  const [day, month, year] = fecha.split("/");
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
};

export const convertirFecha = (dateString: string) => {
  const dateParts = dateString.split("-");

  if (dateParts.length !== 3) {
    throw new Error("El formato de la fecha debe ser dd-mm-aaaa");
  }

  const day = dateParts[0];
  const month = dateParts[1];
  const year = dateParts[2];

  return `${year}-${month}-${day}`;
};
