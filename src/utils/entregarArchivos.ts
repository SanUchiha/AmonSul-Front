import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

export interface ArchivoParaEntregar {
  blob: Blob;
  nombre: string;
}

// Múltiplo de 3: cada bloque se pasa a base64 por separado y los trozos tienen que poder unirse
const BYTES_POR_BLOQUE = 3 * 1024 * 1024;

const aBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve((lector.result as string).split(",")[1]);
    lector.onerror = () => reject(lector.error);
    lector.readAsDataURL(blob);
  });

// Por bloques: un PDF con las listas de un torneo puede pesar decenas de MB y no conviene pasarlo de una vez al nativo
const guardarEnCache = async ({ blob, nombre }: ArchivoParaEntregar) => {
  // El nombre lleva el del torneo, que puede tener caracteres que no valen en un fichero
  const path = nombre.replace(/[\\/:*?"<>|]/g, "_");
  const directory = Directory.Cache;
  await Filesystem.writeFile({
    path,
    directory,
    data: await aBase64(blob.slice(0, BYTES_POR_BLOQUE)),
  });
  for (
    let inicio = BYTES_POR_BLOQUE;
    inicio < blob.size;
    inicio += BYTES_POR_BLOQUE
  ) {
    await Filesystem.appendFile({
      path,
      directory,
      data: await aBase64(blob.slice(inicio, inicio + BYTES_POR_BLOQUE)),
    });
  }
  return (await Filesystem.getUri({ path, directory })).uri;
};

const descargar = ({ blob, nombre }: ArchivoParaEntregar) => {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
};

// En la web se descargan. En la app el WebView no descarga nada: se abre el menú de compartir del sistema,
// con el que se guardan en Drive o se envían
export const entregarArchivos = async (
  archivos: ArchivoParaEntregar[],
  { titulo, texto }: { titulo?: string; texto?: string } = {}
): Promise<void> => {
  if (!Capacitor.isNativePlatform()) {
    for (let i = 0; i < archivos.length; i++) {
      // Seguidas, el navegador puede saltarse alguna
      if (i > 0) await new Promise(resolve => setTimeout(resolve, 500));
      descargar(archivos[i]);
    }
    return;
  }

  const files: string[] = [];
  for (const archivo of archivos) files.push(await guardarEnCache(archivo));
  try {
    await Share.share({
      files,
      title: titulo,
      text: texto,
      dialogTitle: titulo,
    });
  } catch (error) {
    // Cerrar el menú sin elegir nada también llega como error
    if (!String(error).toLowerCase().includes("cancel")) throw error;
  }
};
