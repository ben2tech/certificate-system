/**
 * src/config/templates.js
 * จัดการภาพพื้นหลังและพิกัดตัวอักษร
 */

export const CERT_TEMPLATES = {
  SCI2569: {
    background: "/cer/sci2569.png",
    name: { left: 232, top: 142, fontSize: 22, color: "#C0392B", font: "Prompt", align: "left" },
    certNo: { left: 938, top: 62, fontSize: 12, color: "#000000", font: "Sarabun", align: "left" },
  },
  DEFAULT: {
    background: "/cer/sci2569.png",
    name: { left: 232, top: 142, fontSize: 22, color: "#C0392B", font: "Prompt", align: "left" },
    certNo: { left: 938, top: 62, fontSize: 12, color: "#000000", font: "Sarabun", align: "left" },
  },
};

export function getTemplate(activity = "") {
  const act = String(activity || "").trim().toLowerCase();
  if (act.includes("sci") || act.includes("วิทย์")) {
    return CERT_TEMPLATES.SCI2569;
  }
  return CERT_TEMPLATES.DEFAULT;
}
