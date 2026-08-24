const API = import.meta.env.VITE_API_URL;

async function getGAS(params = {}) {
  const url = new URL(API);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) {
      url.searchParams.append(k, v);
    }
  });
  const res = await fetch(url.toString(), {
    method: "GET",
    redirect: "follow"
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return await res.json();
}

async function postGAS(data) {
  // Using text/plain prevents browser CORS preflight (OPTIONS) which Google Apps Script does not support
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    redirect: "follow",
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return await res.json();
}

export async function getDashboard() {
  return await getGAS({ action: "dashboard" });
}

export async function getTemplates() {
  return await getGAS({ action: "templates" });
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
  return await getGAS({
    action: "list",
    page,
    pageSize,
    keyword
  });
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