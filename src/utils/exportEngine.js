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

  // 1. ถ้ามี <img> ที่เรนเดอร์ PNG ใน Memory ไว้แล้ว ให้ดาวน์โหลดไฟล์นั้นได้ทันที 100%
  const imgEl = target.querySelector ? target.querySelector("img") : (target.tagName === "IMG" ? target : null);
  if (imgEl && imgEl.src && imgEl.src.startsWith("data:image/png")) {
    download(imgEl.src, fileName);
    return;
  }

  // 2. Fallback
  const canvas = await html2canvas(target, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#ffffff",
    logging: false
  });

  const url = canvas.toDataURL("image/png", 1.0);
  download(url, fileName);
}

export async function downloadCertificatePDF(element, fileName = "เกียรติบัตร.pdf") {
  const target = typeof element === "string" ? document.getElementById(element) : element;
  if (!target) return;

  let imgData = null;
  const imgEl = target.querySelector ? target.querySelector("img") : (target.tagName === "IMG" ? target : null);
  if (imgEl && imgEl.src && imgEl.src.startsWith("data:image/png")) {
    imgData = imgEl.src;
  } else {
    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false
    });
    imgData = canvas.toDataURL("image/png", 1.0);
  }

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [1600, 1131]
  });

  pdf.addImage(imgData, "PNG", 0, 0, 1600, 1131);
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