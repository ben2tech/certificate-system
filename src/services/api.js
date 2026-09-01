const API = import.meta.env.VITE_API_URL || "https://script.google.com/macros/s/AKfycbxcl69Pupjiyrec6mgqrzWHZFefhys0s25AIqrBdjgXh5nzkXp9S4t3H1Pe3xDefEyY/exec";

/**
 * ฟังก์ชันยิง GET Request ไปยัง Google Apps Script (มี Cache-Busting เสมอ)
 */
export async function getGAS(params = {}) {
  const url = new URL(API);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      url.searchParams.append(k, v);
    }
  });
  url.searchParams.append("_t", Date.now().toString());

  const res = await fetch(url.toString(), {
    method: "GET",
    redirect: "follow",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  return await res.json();
}

/**
 * ฟังก์ชันยิง POST Request ไปยัง Google Apps Script
 */
export async function postGAS(data) {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    redirect: "follow",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  return await res.json();
}

// === ฝั่งนักเรียน (Student APIs) ===

/**
 * ค้นหาข้อมูลเกียรติบัตรของนักเรียน
 */
export async function searchCertificate(studentId) {
  if (!studentId) return { success: false, data: {} };
  const cleanId = String(studentId).trim();

  try {
    const listRes = await getGAS({ action: "list", keyword: cleanId, pageSize: 100 });
    if (listRes && listRes.data && listRes.data.length > 0) {
      const matches = listRes.data.filter(
        (item) => String(item.studentId).trim() === cleanId
      );

      if (matches.length > 0) {
        const grouped = {};
        matches.forEach((item) => {
          const y = String(item.year || "2569").trim();
          if (!grouped[y]) grouped[y] = [];
          grouped[y].push({
            name: item.name || "",
            school: item.school || "เบญจมราชรังสฤษฎิ์ ๒",
            activity: item.activity || "",
            certNo: item.certNo || "",
            template: item.template || item.Template || "",
            studentId: item.studentId,
            year: item.year,
          });
        });
        return { success: true, data: grouped };
      }
    }
    return await getGAS({ action: "search", studentId: cleanId });
  } catch (err) {
    console.error("Search API Error:", err);
    return { success: false, data: {} };
  }
}

/**
 * ตรวจสอบความถูกต้องของเกียรติบัตร (Verify)
 */
export async function verifyCertificate(id) {
  return await getGAS({ action: "verify", id });
}

/**
 * ดึงรายการ Templates และพิกัด JSON ทั้งหมดจาก Google Sheets
 */
export async function getTemplates() {
  return await getGAS({ action: "templates" });
}

// === ฝั่งผู้ดูแลระบบ (Admin APIs) ===

export async function getDashboard() {
  return await getGAS({ action: "dashboard" });
}

export async function getCertificates(page = 1, pageSize = 20, keyword = "") {
  return await getGAS({ action: "list", page, pageSize, keyword });
}

export async function saveTemplate(data) {
  return await postGAS({ action: "saveTemplate", ...data });
}

export async function deleteCertificates(ids) {
  return await postGAS({ action: "delete", ids });
}

export async function importExcel(data) {
  return await postGAS({ action: "import", ...data });
}

export async function generateAll() {
  return await postGAS({ action: "generateAll" });
}

export async function generateOne(studentId) {
  return await postGAS({ action: "generateOne", studentId });
}