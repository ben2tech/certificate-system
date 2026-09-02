const API_URL = import.meta.env.VITE_API_URL || "https://script.google.com/macros/s/AKfycbxcl69Pupjiyrec6mgqrzWHZFefhys0s25AIqrBdjgXh5nzkXp9S4t3H1Pe3xDefEyY/exec";

/**
 * ดึงข้อมูลจาก Google Apps Script พร้อม Cache-Buster
 */
export async function getFromGAS(params = {}) {
  const url = new URL(API_URL);
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
 * ส่งข้อมูล POST ไปยัง Google Apps Script (รองรับ Browser Redirect & CORS)
 */
export async function postGAS(data) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(data),
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { success: true };
    }
  } catch (err) {
    // Fallback ด้วย mode no-cors เพื่อให้มั่นใจว่า Request ส่งถึง Google Apps Script แน่นอน
    console.warn("POST CORS fallback:", err);
    await fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(data),
    });
    return { success: true };
  }
}

/**
 * ค้นหาข้อมูลเกียรติบัตรนักเรียน
 */
export async function searchStudent(studentId) {
  if (!studentId) return { success: false, data: {} };
  const cleanId = String(studentId).trim();

  try {
    const listRes = await getFromGAS({ action: "list", keyword: cleanId, pageSize: 100 });
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
            activity: item.activity || "สัปดาห์วิทยาศาสตร์",
            certNo: item.certNo || "",
            studentId: item.studentId,
            year: item.year,
            prefix: item.template || item.prefix || "",
          });
        });
        return { success: true, data: grouped };
      }
    }
    return await getFromGAS({ action: "search", studentId: cleanId });
  } catch (err) {
    console.error("Search API Error:", err);
    return { success: false, data: {} };
  }
}
