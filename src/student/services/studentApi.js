import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export async function searchCertificate(studentId, birthday) {
  const res = await axios.get(API, {
    params: {
      action: "search",
      studentId,
      birthday
    }
  });
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