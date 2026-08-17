import jsPDF from "jspdf";
import { ListaCompletaDTO } from "@/interfaces/Lista";

function comprimirImagen(base64: string, maxWidth = 1200, quality = 0.75): Promise<string> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let w = img.width;
      let h = img.height;
      if (w > maxWidth) { h = Math.round((h * maxWidth) / w); w = maxWidth; }
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(base64);
    img.src = base64;
  });
}

async function urlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Error leyendo imagen"));
    reader.readAsDataURL(blob);
  });
}

function descargarBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function generarPDFDeGrupo(
  listas: ListaCompletaDTO[],
  onProgress?: (idx: number) => void
): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let idx = 0; idx < listas.length; idx++) {
    const lista = listas[idx];

    if (idx > 0) doc.addPage();

    doc.setFontSize(18);
    doc.text(lista.nick, pageWidth / 2, 20, { align: "center" });

    if (lista.listaData) {
      try {
        let base64 = lista.listaData;
        if (lista.listaData.startsWith("http")) {
          base64 = await urlToBase64(lista.listaData);
        }
        const compressed = await comprimirImagen(base64);
        const imgProps = doc.getImageProperties(compressed);
        const margin = 15;
        const topMargin = 30;
        let imgWidth = pageWidth - margin * 2;
        let imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        const maxHeight = pageHeight - topMargin - margin;
        if (imgHeight > maxHeight) {
          imgHeight = maxHeight;
          imgWidth = (imgProps.width * imgHeight) / imgProps.height;
        }
        doc.addImage(compressed, "JPEG", (pageWidth - imgWidth) / 2, topMargin, imgWidth, imgHeight);
      } catch (err) {
        console.error(`Error con lista de ${lista.nick}:`, err);
        doc.setFontSize(12);
        doc.text("No se pudo cargar la imagen.", pageWidth / 2, 40, { align: "center" });
      }
    }

    onProgress?.(idx);
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  const buffer = doc.output("arraybuffer");
  return new Blob([buffer], { type: "application/pdf" });
}

export async function descargarListasPDF(
  listas: ListaCompletaDTO[],
  nombreTorneo: string,
  chunkSize?: number,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const baseName = (nombreTorneo || "listas_torneo") + "_listas";

  if (!chunkSize || chunkSize >= listas.length) {
    let procesados = 0;
    const blob = await generarPDFDeGrupo(listas, () => {
      onProgress?.(++procesados, listas.length);
    });
    descargarBlob(blob, `${baseName}.pdf`);
  } else {
    // Un PDF por chunk (ej: por equipo)
    const chunks: ListaCompletaDTO[][] = [];
    for (let i = 0; i < listas.length; i += chunkSize) chunks.push(listas.slice(i, i + chunkSize));

    let procesados = 0;
    for (let i = 0; i < chunks.length; i++) {
      const blob = await generarPDFDeGrupo(chunks[i], () => {
        onProgress?.(++procesados, listas.length);
      });
      const fileName = chunks.length > 1 ? `${baseName}_${i + 1}.pdf` : `${baseName}.pdf`;
      descargarBlob(blob, fileName);
    }
  }
}
