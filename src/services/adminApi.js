import axios from "axios";

const API=import.meta.env.VITE_API_URL;

const api=axios.create({
  baseURL:API
});

export async function getDashboard(){

  const res=await api.get("",{
    params:{action:"dashboard"}
  });

  return res.data;

}

export async function getTemplates(){

  const res=await api.get("",{
    params:{action:"templates"}
  });

  return res.data;

}

export async function getCertificates(page=1,pageSize=20,keyword=""){

  const res=await api.get("",{
    params:{
      action:"list",
      page,
      pageSize,
      keyword
    }
  });

  return res.data;

}

export async function generateAll(){

  const res=await api.post("",{
    action:"generateAll"
  });

  return res.data;

}

export async function generateOne(studentId){

  const res=await api.post("",{
    action:"generateOne",
    studentId
  });

  return res.data;

}

export async function updateCertificate(data){

  const res=await api.post("",{
    action:"update",
    ...data
  });

  return res.data;

}

export async function deleteCertificates(rows){

  const res=await api.post("",{
    action:"delete",
    rows
  });

  return res.data;

}

export async function importExcel(data,mode="append"){

  const res=await api.post("",{
    action:"import",
    mode,
    data
  });

  return res.data;

}

export async function saveTemplate(data){

  const res=await api.post("",{
    action:"saveTemplate",
    ...data
  });

  return res.data;

}

export async function getTemplate(id){

  const res=await api.get("",{
    params:{
      action:"template",
      id
    }
  });

  return res.data;

}

export async function deleteTemplate(id){

  const res=await api.post("",{
    action:"deleteTemplate",
    id
  });

  return res.data;

}