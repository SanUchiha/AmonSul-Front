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
