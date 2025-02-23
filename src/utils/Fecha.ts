export const formatFechaSpa = async (fecha: string): Promise<string> => {
  if (fecha !== null){
    const [year, month, day] = fecha.split("-");
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
  }
  return "";
};

export const formatFechaDB = async (fecha: string): Promise<string> => {
  const [day, month, year] = fecha.split("/");
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
};
