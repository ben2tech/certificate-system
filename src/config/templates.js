/**
 * src/config/templates.js
 * จัดการภาพพื้นหลังและพิกัดตำแหน่งตัวอักษรของเกียรติบัตร
 * สามารถกำหนดและปรับแต่งพิกัดได้ที่นี่โดยตรง ไม่ต้องกำหนดใน Google Sheets
 */

// พิกัดมาตรฐานสำหรับเกียรติบัตร (บน Canvas ขนาด 1123 x 794 px)
// ภาพพื้นหลังมีข้อความกิจกรรมและโรงเรียนพิมพ์ไว้อยู่แล้ว จึงวาดเฉพาะชื่อและเลขที่ เพื่อไม่ให้ทับซ้อน
export const DEFAULT_COORDINATES = [
  {
    type: "textbox",
    text: "{{NAME}}",
    left: 346,
    top: 325,
    width: 450,
    fontSize: 26,
    fontFamily: "Sarabun",
    fill: "#080684",
    textAlign: "center",
    fontWeight: "bold",
  },
  {
    type: "textbox",
    text: "{{CERT_NO}}",
    left: 942,
    top: 65,
    width: 200,
    fontSize: 14,
    fontFamily: "Sarabun",
    fill: "#000000",
    textAlign: "left",
    fontWeight: "normal",
  }
];

// พิกัดเฉพาะสำหรับแต่ละกิจกรรม
export const ACTIVITY_TEMPLATES = {
  sci2569: [
    {
      type: "textbox",
      text: "{{NAME}}",
      left: 346,
      top: 325,
      width: 450,
      fontSize: 26,
      fontFamily: "Sarabun",
      fill: "#080684",
      textAlign: "center",
      fontWeight: "bold",
    },
    {
      type: "textbox",
      text: "{{CERT_NO}}",
      left: 942,
      top: 65,
      width: 200,
      fontSize: 14,
      fontFamily: "Sarabun",
      fill: "#000000",
      textAlign: "left",
      fontWeight: "normal",
    }
  ],
  social69: [
    {
      type: "textbox",
      text: "{{NAME}}",
      left: 211,
      top: 320,
      width: 700,
      fontSize: 28,
      fontFamily: "Prompt",
      fill: "#C0392B", // เปลี่ยนเป็นสีแดง
      textAlign: "center",
      fontWeight: "bold",
    },
    {
      type: "textbox",
      text: "{{CERT_NO}}",
      left: 925,
      top: 56,
      width: 150,
      fontSize: 14,
      fontFamily: "Sarabun",
      fill: "#1E293B",
      textAlign: "left",
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
