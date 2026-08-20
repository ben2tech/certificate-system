import axios from "axios";

const API = import.meta.env.VITE_API_URL;

/*************************************************
 * Axios Instance
 *************************************************/

const api = axios.create({
  baseURL: API,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json"
  }
});

/*************************************************
 * Response Interceptor
 *************************************************/

api.interceptors.response.use(

  response => response,

  error => {

    console.error("API Error:", error);

    if (error.code === "ECONNABORTED") {

      throw new Error("หมดเวลาการเชื่อมต่อ");

    }

    if (error.response?.data?.message) {

      throw new Error(error.response.data.message);

    }

    throw new Error("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์");

  }

);

/*************************************************
 * Health Check
 *************************************************/

export async function healthCheck() {

  const { data } = await api.get("", {
    params: { action: "health" }
  });

  return data;

}

/*************************************************
 * Search Certificate
 *************************************************/

export async function searchCertificate(studentId, birthday) {

  const { data } = await api.get("", {

    params: {

      action: "search",
      studentId,
      birthday

    }

  });

  return data;

}

/*************************************************
 * Verify Certificate
 *************************************************/

export async function verifyCertificate(certNo) {

  const { data } = await api.get("", {

    params: {

      action: "verify",
      id: certNo

    }

  });

  return data;

}

/*************************************************
 * Get Templates
 *************************************************/

export async function getTemplates() {

  const { data } = await api.get("", {

    params: {

      action: "templates"

    }

  });

  return data;

}

/*************************************************
 * Dashboard
 *************************************************/

export async function getDashboard() {

  const { data } = await api.get("", {

    params: {

      action: "dashboard"

    }

  });

  return data;

}

/*************************************************
 * Preview URL
 *************************************************/

export function previewCertificate(fileId) {

  if (!fileId) return "";

  return `https://drive.google.com/file/d/${fileId}/preview`;

}

/*************************************************
 * Download URL
 *************************************************/

export function downloadCertificate(fileId) {

  if (!fileId) return "";

  return `https://drive.google.com/uc?export=download&id=${fileId}`;

}

/*************************************************
 * Verify URL
 *************************************************/

export function verifyUrl(certNo) {

  return `${API}?action=verify&id=${encodeURIComponent(certNo)}`;

}

/*************************************************
 * Open Preview
 *************************************************/

export function openPreview(fileId) {

  const url = previewCertificate(fileId);

  if (url) {

    window.open(url, "_blank");

  }

}

/*************************************************
 * Download File
 *************************************************/

export function downloadFile(fileId) {

  const url = downloadCertificate(fileId);

  if (url) {

    window.open(url, "_blank");

  }

}

/*************************************************
 * Export Axios Instance
 *************************************************/

export default api;