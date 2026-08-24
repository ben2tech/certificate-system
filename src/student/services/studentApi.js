import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export async function searchCertificate(studentId, birthday = "") {
  const params = { action: "search", studentId };
  if (birthday) params.birthday = birthday;
  const res = await axios.get(API, { params });
  return res.data;
}

export async function verifyCertificate(id) {
  const res = await axios.get(API, {
    params: {
      action: "verify",
      id
    }
  });
  return res.data;
}