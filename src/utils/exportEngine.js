import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportPNG(canvas){

  const url=canvas.toDataURL({
    format:"png",
    quality:1
  });

  download(url,"certificate.png");

}

export async function exportJPEG(canvas,quality=0.92){

  const url=canvas.toDataURL({
    format:"jpeg",
    quality
  });

  download(url,"certificate.jpg");

}

export async function exportPDF(element){

  const canvas=await html2canvas(element,{
    scale:2,
    useCORS:true,
    backgroundColor:"#ffffff"
  });

  const img=canvas.toDataURL("image/png");

  const pdf=new jsPDF({
    orientation:"landscape",
    unit:"px",
    format:[canvas.width,canvas.height]
  });

  pdf.addImage(
    img,
    "PNG",
    0,
    0,
    canvas.width,
    canvas.height
  );

  pdf.save("certificate.pdf");

}

function download(url,name){

  const a=document.createElement("a");

  a.href=url;
  a.download=name;

  a.click();

}