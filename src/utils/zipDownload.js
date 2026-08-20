import JSZip from "jszip";

export async function downloadZip(files){

  const zip=new JSZip();

  await Promise.all(

    files.map(async(file)=>{

      const res=await fetch(file.url);

      const blob=await res.blob();

      zip.file(file.name,blob);

    })

  );

  const content=await zip.generateAsync({
    type:"blob"
  });

  const a=document.createElement("a");

  a.href=URL.createObjectURL(content);

  a.download="Certificates.zip";

  a.click();

}