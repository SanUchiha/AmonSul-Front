import poblaciones from "@/settings/poblaciones";

// Provincias por su código del INE, el mismo que usan las poblaciones y el mapa
export const PROVINCIAS: Record<string, string> = {
  "01": "Álava",
  "02": "Albacete",
  "03": "Alicante",
  "04": "Almería",
  "05": "Ávila",
  "06": "Badajoz",
  "07": "Illes Balears",
  "08": "Barcelona",
  "09": "Burgos",
  "10": "Cáceres",
  "11": "Cádiz",
  "12": "Castellón",
  "13": "Ciudad Real",
  "14": "Córdoba",
  "15": "A Coruña",
  "16": "Cuenca",
  "17": "Girona",
  "18": "Granada",
  "19": "Guadalajara",
  "20": "Gipuzkoa",
  "21": "Huelva",
  "22": "Huesca",
  "23": "Jaén",
  "24": "León",
  "25": "Lleida",
  "26": "La Rioja",
  "27": "Lugo",
  "28": "Madrid",
  "29": "Málaga",
  "30": "Murcia",
  "31": "Navarra",
  "32": "Ourense",
  "33": "Asturias",
  "34": "Palencia",
  "35": "Las Palmas",
  "36": "Pontevedra",
  "37": "Salamanca",
  "38": "Santa Cruz de Tenerife",
  "39": "Cantabria",
  "40": "Segovia",
  "41": "Sevilla",
  "42": "Soria",
  "43": "Tarragona",
  "44": "Teruel",
  "45": "Toledo",
  "46": "Valencia",
  "47": "Valladolid",
  "48": "Bizkaia",
  "49": "Zamora",
  "50": "Zaragoza",
  "51": "Ceuta",
  "52": "Melilla",
};

// Sin espacios, tildes ni mayúsculas: «Las palmas de gran canaria» y «Las Palmas de Gran Canaria» son la misma
const normalizar = (texto: string) =>
  texto.toLowerCase().replace(/\s/g, "").normalize("NFD").replace(/[̀-ͯ]/g, "");

// Se calcula una vez: son más de 8000 poblaciones
let porCiudad: Map<string, string> | null = null;
const indice = () => {
  if (porCiudad) return porCiudad;
  porCiudad = new Map();
  for (const poblacion of poblaciones) {
    const clave = normalizar(poblacion.label);
    if (!porCiudad.has(clave)) porCiudad.set(clave, poblacion.parent_code);
  }
  // Quien escribe la provincia como ciudad («Asturias», «Cantabria») también cuenta
  for (const [codigo, nombre] of Object.entries(PROVINCIAS)) {
    const clave = normalizar(nombre);
    if (!porCiudad.has(clave)) porCiudad.set(clave, codigo);
  }
  return porCiudad;
};

// El código del INE de la provincia de una ciudad, o null si no se reconoce
export const codigoProvinciaDeCiudad = (
  ciudad?: string | null
): string | null =>
  ciudad ? (indice().get(normalizar(ciudad)) ?? null) : null;
