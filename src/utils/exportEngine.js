import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportPNG(canvas) {
  const url = canvas.toDataURL({
    format: "png",
    multiplier: 2
  });
  download(url, "certificate.png");
}

export async function exportJPEG(canvas, quality = 0.92) {
  const url = canvas.toDataURL({
    format: "jpeg",
    quality,
    multiplier: 2
  });
  download(url, "certificate.jpg");
}

export async function exportPDF(element) {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false
  });

  const img = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [canvas.width, canvas.height]
  });

  pdf.addImage(img, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save("certificate.pdf");
}

export async function downloadCertificateImage(element, fileName = "เกียรติบัตร.png") {
  const target = typeof element === "string" ? document.getElementById(element) : element;
  if (!target) return;

  const canvas = await html2canvas(target, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false
  });

  const url = canvas.toDataURL("image/png", 1.0);
  download(url, fileName);
}

export async function downloadCertificatePDF(element, fileName = "เกียรติบัตร.pdf") {
  const target = typeof element === "string" ? document.getElementById(element) : element;
  if (!target) return;

  const canvas = await html2canvas(target, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false
  });

  const img = canvas.toDataURL("image/png", 1.0);
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [canvas.width, canvas.height]
  });

  pdf.addImage(img, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save(fileName);
}

function download(url, name) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}