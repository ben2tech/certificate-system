const API = import.meta.env.VITE_API_URL;

async function getGAS(params = {}) {
  const url = new URL(API);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
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

export async function searchCertificate(studentId, birthday = "") {
  if (!studentId) return { success: false, data: {} };
  const cleanId = String(studentId).trim();

  try {
    // 1. Fetch search data
    const searchRes = await getGAS({ action: "search", studentId: cleanId, birthday });

    // 2. Fetch full student record from list API to get name, school, certNo, etc.
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
            school: item.school || "",
            activity: item.activity || "",
            certNo: item.certNo || "",
            template: item.template || item.Template || "",
            studentId: item.studentId,
            year: item.year,
            preview: item.pdfId ? `https://drive.google.com/file/d/${item.pdfId}/preview` : "",
            download: item.pdfId ? `https://drive.google.com/uc?export=download&id=${item.pdfId}` : ""
          });
        });
        return { success: true, data: grouped };
      }
    }

    return searchRes;
  } catch (err) {
    console.error("search error fallback:", err);
    return await getGAS({ action: "search", studentId: cleanId, birthday });
  }
}

export async function verifyCertificate(id) {
  return await getGAS({ action: "verify", id });
}

export async function getTemplates() {
  return await getGAS({ action: "templates" });
}