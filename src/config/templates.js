/**
 * src/config/templates.js
 * จัดการภาพพื้นหลังและพิกัดตัวอักษร
 */

export const DEFAULT_COORDINATES = [
  {
    type: "textbox",
    text: "{{NAME}}",
    left: 232,
    top: 142,
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
    fontSize: 12,
    fontFamily: "Sarabun",
    fill: "#000000",
    textAlign: "left",
    fontWeight: "normal",
  },
];

export function getBackgroundUrl(activity = "", prefix = "") {
  const base = import.meta.env.BASE_URL || "./";
  const normalizedBase = base.endsWith("/") ? base : base + "/";

  const p = String(prefix || "").trim().toLowerCase();
  const a = String(activity || "").trim().toLowerCase();

  if (p) return `${normalizedBase}cer/${p}.png`;
  if (a.includes("sci") || a.includes("วิทย์")) return `${normalizedBase}cer/sci2569.png`;
  if (a.includes("soc") || a.includes("สังคม")) return `${normalizedBase}cer/social69.png`;
  if (a) return `${normalizedBase}cer/${a}.png`;
  return `${normalizedBase}cer/sci2569.png`;
}

export function getTemplate(activity = "") {
  return {
    background: getBackgroundUrl(activity),
    name: { left: 232, top: 142, fontSize: 22, color: "#C0392B", font: "Prompt", align: "left" },
    certNo: { left: 938, top: 62, fontSize: 12, color: "#000000", font: "Sarabun", align: "left" },
  };
}
