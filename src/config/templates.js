// การตั้งค่า Template และพิกัดต่างๆ สำหรับเกียรติบัตรแต่ละกิจกรรม
// คุณสามารถนำ JSON ที่ได้จาก Template Designer มาวางอัปเดตในนี้ได้ เพื่อให้ใช้งานได้บนทุกอุปกรณ์ (มือถือ/คอม)
// ภาพพื้นหลังจะถูกดึงจากโฟลเดอร์ public/cer/ โดยใช้ชื่อตามคีย์ในนี้ หรือชื่อกิจกรรม

export const PRESET_TEMPLATES = {
  SCI2569: {
    background: "/cer/sci2569.png", // ภาพที่อยู่ใน public/cer/sci2569.png
    objects: [
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
    ]
  },
  SOCIAL69: {
    background: "/cer/social69.png", // ภาพที่อยู่ใน public/cer/social69.png
    objects: [
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
    ]
  },
  DEFAULT: {
    background: "/cer/default.png", // ภาพพื้นหลังเริ่มต้น
    objects: [
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
    ]
  }
};

/**
 * ฟังก์ชันช่วยค้นหา Template จากชื่อกิจกรรม
 */
export function getTemplateConfig(activity = "", prefix = "") {
  const normalizedActivity = (activity || "").trim().toLowerCase();
  const normalizedPrefix = (prefix || "").trim().toUpperCase();
  
  if (PRESET_TEMPLATES[normalizedPrefix]) {
    return PRESET_TEMPLATES[normalizedPrefix];
  }
  
  // ตรวจสอบจากชื่อกิจกรรมตรงๆ หรือคำใกล้เคียง
  if (normalizedActivity.includes("วิทย์") || normalizedActivity.includes("sci2569")) {
    return PRESET_TEMPLATES.SCI2569;
  }
  
  if (normalizedActivity.includes("สังคม") || normalizedActivity.includes("social69")) {
    return PRESET_TEMPLATES.SOCIAL69;
  }
  
  // หรืออาจจะส่งมาเป็นภาษาอังกฤษให้ตรงกับ Key ก็ได้
  const key = normalizedActivity.toUpperCase();
  if (PRESET_TEMPLATES[key]) {
    return PRESET_TEMPLATES[key];
  }

  // กำหนดไฟล์พื้นหลังแบบออโต้ ถ้าไม่มีใน PRESET จะชี้ไปที่ /cer/ชื่อกิจกรรม.png
  // เผื่อผู้ดูแลระบบแค่โยนไฟล์เข้าไปใน /cer/ โดยไม่ต้องเขียนโค้ด
  if (normalizedActivity) {
    const autoBackground = `/cer/${normalizedActivity}.png`;
    return {
      background: autoBackground,
      objects: PRESET_TEMPLATES.DEFAULT.objects
    };
  }

  return PRESET_TEMPLATES.DEFAULT;
}
