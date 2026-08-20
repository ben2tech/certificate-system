import axios from "axios";

const API = import.meta.env.VITE_API_URL;

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
  const res = await axios.post(API, {
    action: "generateAll"
  });
  return res.data;
}

export async function generateOne(studentId) {
  const res = await axios.post(API, {
    action: "generateOne",
    studentId
  });
  return res.data;
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
  const res = await axios.post(API, {
    action: "delete",
    ids
  });
  return res.data;
}

export async function saveTemplate(data) {
  const res = await axios.post(API, {
    action: "saveTemplate",
    ...data
  });
  return res.data;
}

export async function importExcel(data) {
  const res = await axios.post(API, {
    action: "import",
    ...data
  });
  return res.data;
}