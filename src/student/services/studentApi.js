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
  return await getGAS({ action: "search", studentId, birthday });
}

export async function verifyCertificate(id) {
  return await getGAS({ action: "verify", id });
}