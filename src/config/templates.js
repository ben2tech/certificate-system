/**
 * src/config/templates.js
 * จัดการภาพพื้นหลังและพิกัดตัวอักษร
 */

export const DEFAULT_COORDINATES = [
  {
    type: "textbox",
    text: "{{NAME}}",
    left: 336,
    top: 415,
    fontSize: 28,
    fontFamily: "Prompt",
    fill: "#0D47A1",
    textAlign: "center",
    fontWeight: "bold",
    width: 450,
  },
  {
    type: "textbox",
    text: "{{CERT_NO}}",
    left: 850,
    top: 62,
    fontSize: 14,
    fontFamily: "Sarabun",
    fill: "#000000",
    textAlign: "left",
    fontWeight: "normal",
    width: 200,
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
