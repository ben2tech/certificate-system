/**
 * การตั้งค่า Template และพิกัดเริ่มต้นสำหรับเกียรติบัตร
 * ภาพพื้นหลังจะดึงจากโฟลเดอร์ /cer/ โดยตรง
 */

export const DEFAULT_OBJECTS = [
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
 */
export function resolveBackgroundPath(activity = "", prefix = "") {
  const cleanPrefix = String(prefix || "").trim().toLowerCase();
  const cleanActivity = String(activity || "").trim().toLowerCase();

  if (cleanPrefix) {
    return `/cer/${cleanPrefix}.png`;
  }
  if (cleanActivity.includes("sci") || cleanActivity.includes("วิทย์")) {
    return "/cer/sci2569.png";
  }
  if (cleanActivity.includes("soc") || cleanActivity.includes("สังคม")) {
    return "/cer/social69.png";
  }
  if (cleanActivity) {
    return `/cer/${cleanActivity}.png`;
  }
  return "/cer/sci2569.png";
}

/**
 * ดึง config สำหรับกิจกรรม (fallback เมื่อยังไม่มีใน GAS)
 */
export function getTemplateConfig(activity = "", prefix = "") {
  return {
    background: resolveBackgroundPath(activity, prefix),
    objects: DEFAULT_OBJECTS,
  };
}
