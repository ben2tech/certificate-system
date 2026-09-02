/**
 * src/config/templates.js
 * จัดการภาพพื้นหลังและพิกัดตำแหน่งตัวอักษรของเกียรติบัตร
 * สามารถกำหนดและปรับแต่งพิกัดได้ที่นี่โดยตรง ไม่ต้องกำหนดใน Google Sheets
 */

// พิกัดมาตรฐานสำหรับกิจกรรมทั่วไป (บน Canvas ขนาด 1123 x 794 px)
export const DEFAULT_COORDINATES = [
  {
    type: "textbox",
    text: "{{NAME}}",
    left: 261,
    top: 365,
    width: 600,
    fontSize: 28,
    fontFamily: "Prompt",
    fill: "#0D47A1",
    textAlign: "center",
    fontWeight: "bold",
  },
  {
    type: "textbox",
    text: "{{ACTIVITY}}",
    left: 261,
    top: 435,
    width: 600,
    fontSize: 20,
    fontFamily: "Prompt",
    fill: "#1E293B",
    textAlign: "center",
    fontWeight: "normal",
  },
  {
    type: "textbox",
    text: "{{SCHOOL}}",
    left: 261,
    top: 485,
    width: 600,
    fontSize: 18,
    fontFamily: "Sarabun",
    fill: "#475569",
    textAlign: "center",
    fontWeight: "normal",
  },
  {
    type: "textbox",
    text: "{{CERT_NO}}",
    left: 850,
    top: 55,
    width: 220,
    fontSize: 14,
    fontFamily: "Sarabun",
    fill: "#334155",
    textAlign: "right",
    fontWeight: "normal",
  },
];

// พิกัดเฉพาะสำหรับแต่ละกิจกรรม (หากต้องการแยกเลย์เอาต์พิเศษ)
export const ACTIVITY_TEMPLATES = {
  sci2569: [
    {
      type: "textbox",
      text: "{{NAME}}",
      left: 261,
      top: 370,
      width: 600,
      fontSize: 28,
      fontFamily: "Prompt",
      fill: "#0D47A1",
      textAlign: "center",
      fontWeight: "bold",
    },
    {
      type: "textbox",
      text: "{{CERT_NO}}",
      left: 850,
      top: 60,
      width: 220,
      fontSize: 14,
      fontFamily: "Sarabun",
      fill: "#1E293B",
      textAlign: "right",
      fontWeight: "normal",
    },
  ],
  social69: [
    {
      type: "textbox",
      text: "{{NAME}}",
      left: 261,
      top: 370,
      width: 600,
      fontSize: 28,
      fontFamily: "Prompt",
      fill: "#7C2D12",
      textAlign: "center",
      fontWeight: "bold",
    },
    {
      type: "textbox",
      text: "{{CERT_NO}}",
      left: 850,
      top: 60,
      width: 220,
      fontSize: 14,
      fontFamily: "Sarabun",
      fill: "#1E293B",
      textAlign: "right",
      fontWeight: "normal",
    },
  ],
};

/**
 * ดึงพิกัดตำแหน่งเริ่มต้นตามกิจกรรม/Prefix
 */
export function getCoordinatesForActivity(activity = "", prefix = "") {
  const p = String(prefix || "").trim().toLowerCase();
  const a = String(activity || "").trim().toLowerCase();

  if (p && ACTIVITY_TEMPLATES[p]) return ACTIVITY_TEMPLATES[p];
  if (a && ACTIVITY_TEMPLATES[a]) return ACTIVITY_TEMPLATES[a];

  if (a.includes("sci") || a.includes("วิทย์")) return ACTIVITY_TEMPLATES.sci2569 || DEFAULT_COORDINATES;
  if (a.includes("soc") || a.includes("สังคม")) return ACTIVITY_TEMPLATES.social69 || DEFAULT_COORDINATES;

  return DEFAULT_COORDINATES;
}

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
