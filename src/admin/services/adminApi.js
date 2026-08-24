import axios from "axios";

const API = import.meta.env.VITE_API_URL;

async function postGAS(data) {
  // Using text/plain prevents browser CORS preflight (OPTIONS) which Google Apps Script does not support
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(data)
  });
  return await res.json();
}

export async function getDashboard() {
  const res = await axios.get(API, {
    params: { action: "dashboard" }
  });
  return res.data;
}

export async function getTemplates() {
  const res = await axios.get(API, {
    params: { action: "templates" }
  });
  return res.data;
}

export async function generateAll() {
  return await postGAS({
    action: "generateAll"
  });
}

export async function generateOne(studentId) {
  return await postGAS({
    action: "generateOne",
    studentId
  });
}

export async function getCertificates(page = 1, pageSize = 20, keyword = "") {
  const res = await axios.get(API, {
    params: {
      action: "list",
      page,
      pageSize,
      keyword
    }
  });
  return res.data;
}

export async function deleteCertificates(ids) {
  return await postGAS({
    action: "delete",
    ids
  });
}

export async function saveTemplate(data) {
  return await postGAS({
    action: "saveTemplate",
    ...data
  });
}

export async function importExcel(data) {
  return await postGAS({
    action: "import",
    ...data
  });
}