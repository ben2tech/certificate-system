/**
 * Fallback Template Config
 * ใช้เมื่อ Google Apps Script ยังไม่มีข้อมูล JSON สำหรับกิจกรรมนี้
 * ภาพพื้นหลังจะดึงจาก /cer/ชื่องาน.png อัตโนมัติ
 */

const DEFAULT_OBJECTS = [
  {
    type: "textbox",
    text: "{{NAME}}",
    left: 398,
    top: 340,
    width: 327,
    fontSize: 26,
    fontFamily: "Sarabun",
    fill: "#0D47A1",
    textAlign: "center",
    fontWeight: "bold",
  },
  {
    type: "textbox",
    text: "{{CERT_NO}}",
    left: 770,
    top: 52,
    width: 250,
    fontSize: 16,
    fontFamily: "Sarabun",
    fill: "#334155",
    textAlign: "left",
    fontWeight: "bold",
  },
];

/**
 * ดึง config สำหรับกิจกรรม (fallback เท่านั้น)
 * ถ้ามีข้อมูล JSON จาก GAS จะไม่ใช้ไฟล์นี้
 */
export function getTemplateConfig(activity = "", prefix = "") {
  const key = (prefix || activity || "default").trim().toLowerCase();
  return {
    background: `/cer/${key}.png`,
    objects: DEFAULT_OBJECTS,
  };
}
