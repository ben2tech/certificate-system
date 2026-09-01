/**
 * src/config/templates.js
 * จัดการแมปปิ้งภาพพื้นหลังใน /cer/ และพิกัดสำรอง
 */

export const DEFAULT_COORDINATES = [
  {
    type: "textbox",
    text: "{{NAME}}",
    left: 232,
    top: 142,
    width: 558,
    fontSize: 22,
    fontFamily: "Prompt",
    fill: "#C0392B",
    textAlign: "left",
    fontWeight: "normal",
  },
  {
    type: "textbox",
    text: "{{CERT_NO}}",
    left: 938,
    top: 62,
    width: 650,
    fontSize: 12,
    fontFamily: "Sarabun",
    fill: "#000000",
    textAlign: "left",
    fontWeight: "normal",
  },
];

/**
 * ดึง path ภาพพื้นหลังจากชื่อกิจกรรมหรือ prefix
 * ไฟล์ทั้งหมดอยู่ใน public/cer/
 */
export function getBackgroundUrl(activity = "", prefix = "") {
  const p = String(prefix || "").trim().toLowerCase();
  const a = String(activity || "").trim().toLowerCase();

  if (p) return `/cer/${p}.png`;
  if (a.includes("sci") || a.includes("วิทย์")) return "/cer/sci2569.png";
  if (a.includes("soc") || a.includes("สังคม")) return "/cer/social69.png";
  if (a) return `/cer/${a}.png`;
  return "/cer/sci2569.png";
}

/**
 * Fallback config เมื่อยังไม่มีการเซฟพิกัดจาก Designer
 */
export function getFallbackTemplate(activity = "", prefix = "") {
  return {
    background: getBackgroundUrl(activity, prefix),
    objects: DEFAULT_COORDINATES,
  };
}
