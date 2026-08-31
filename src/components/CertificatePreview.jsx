import { useState, useEffect, useMemo } from "react";
import { Box, CircularProgress } from "@mui/material";

/**
 * สร้างรูปภาพเกียรติบัตร PNG ความละเอียดสูงในหน่วยความจำ (In-Memory Canvas)
 */
export async function generateCertificatePngDataUrl({
  name = "",
  school = "",
  activity = "",
  year = "",
  certNo = "",
  background = "https://lh3.googleusercontent.com/d/1cg0Jh7mNZBHq_e8ytmWZRoJN6S7d7CiHJ-ROsxIgTGA=w1600",
  customVariables = null,
}) {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1131; // มาตราส่วน A4 แนวนอน (1600x1131)
  const ctx = canvas.getContext("2d");

  // เติมพื้นหลังสีขาว
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 1. วาดภาพพื้นหลัง Template
  if (background) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = background;
      await new Promise((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve();
        };
        img.onerror = () => resolve();
      });
    } catch (e) {
      console.warn("Background load warning:", e);
    }
  }

  // รอโหลด Font
  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  } catch (e) {}

  const scale = 1600 / 1123; // สเกลตำแหน่งจาก Designer 1123px เป็น 1600px

  // 2. วาดตัวแปรข้อความ (Name, CertNo, School, etc.)
  if (customVariables && customVariables.length > 0) {
    customVariables.forEach((obj) => {
      let textContent = obj.text || "";
      textContent = textContent
        .replace(/\{\{NAME\}\}/g, name || "")
        .replace(/\{\{CERT_NO\}\}/g, certNo || "")
        .replace(/\{\{SCHOOL\}\}/g, school || "")
        .replace(/\{\{ACTIVITY\}\}/g, activity || "")
        .replace(/\{\{YEAR\}\}/g, String(year || ""));

      const fontSize = Math.round((obj.fontSize || 34) * scale);
      const fontWeight = obj.fontWeight || 700;
      const fontFamily = obj.fontFamily || "Prompt";
      const fill = typeof obj.fill === "string" ? obj.fill : "#0F172A";
      const textAlign = obj.textAlign || "left";
      let x = (obj.left || 0) * scale;
      if (textAlign === "center") {
        if (obj.width && obj.width > 50) {
          x = ((obj.left || 0) + (obj.width / 2)) * scale;
        } else {
          x = canvas.width / 2;
        }
      } else if (textAlign === "right") {
        if (obj.width && obj.width > 50) {
          x = ((obj.left || 0) + obj.width) * scale;
        }
      }

      const y = (obj.top || 0) * scale + fontSize * 0.85;

      ctx.font = `${fontWeight} ${fontSize}px '${fontFamily}', 'Sarabun', 'Prompt', sans-serif`;
      ctx.fillStyle = fill;
      ctx.textAlign = textAlign;
      ctx.textBaseline = "alphabetic";
      ctx.fillText(textContent, x, y);
    });
  } else {
    // ตำแหน่งมาตรฐานที่คำนวณตำแหน่งช่องว่างของใบประกาศเกียรติบัตรอย่างแม่นยำ 100%
    // 1. เลขที่เกียรติบัตร (อยู่มุมขวาบน ตรงกับแนวคำว่า "เลขที่" ใน Template)
    if (certNo) {
      ctx.font = `600 ${Math.round(15 * scale)}px 'Sarabun', 'Prompt', sans-serif`;
      ctx.fillStyle = "#334155";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(certNo, canvas.width * 0.772, canvas.height * 0.081);
    }

    // 2. ชื่อผู้ได้รับเกียรติบัตร (กึ่งกลาง ระหว่างคำว่า "ขอมอบเกียรติบัตรฉบับนี้ไว้เพื่อแสดงว่า" และ "ได้เข้าร่วม...")
    if (name) {
      ctx.font = `bold ${Math.round(36 * scale)}px 'Sarabun', 'Prompt', sans-serif`;
      ctx.fillStyle = "#0D47A1";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(name, canvas.width / 2, canvas.height * 0.468);
    }
  }

  return canvas.toDataURL("image/png", 1.0);
}

// ค่าพรีเซ็ตพิกัดที่ออกแบบไว้จาก Template Designer (เพื่อให้มือถือ, ไอแพด, และคอมพิวเตอร์ ได้ตำแหน่งเดียวกัน 100%)
const PRESET_TEMPLATES = {
  SCI2569: [
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
  ],
  DEFAULT: [
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
  ],
};

/**
 * CertificatePreview — สร้างภาพ PNG ใน Memory แล้วแสดงผลเป็น <img> บนหน้าเว็บโดยตรง
 */
export default function CertificatePreview({
  id = undefined,
  name = "",
  school = "",
  activity = "",
  year = "",
  certNo = "",
  prefix = "",
  background = "https://lh3.googleusercontent.com/d/1cg0Jh7mNZBHq_e8ytmWZRoJN6S7d7CiHJ-ROsxIgTGA=w1600",
  templateJson = null,
  onPngGenerated = null,
}) {
  const [pngUrl, setPngUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  // ดึงตำแหน่งตัวแปรจาก Template
  const customVariables = useMemo(() => {
    try {
      // 1. จาก API Google Apps Script
      if (templateJson) {
        const parsed = typeof templateJson === "string" ? JSON.parse(templateJson) : templateJson;
        if (parsed && Array.isArray(parsed.objects) && parsed.objects.length > 0) {
          const vars = parsed.objects.filter(
            (o) => o.text && (o.text.includes("{{") || !o.grid)
          );
          if (vars.length > 0) return vars;
        }
      }

      // 2. จาก LocalStorage ของ Admin
      const keys = [
        prefix ? `template_${prefix.trim()}` : null,
        activity ? `template_${activity.trim()}` : null,
        "template_SCI2569",
        "template_sci2569",
        "template_กิจกรรมวิทย์",
        "template_สัปดาห์วิทยาศาสตร์",
        "autosave-template",
      ].filter(Boolean);

      for (const k of keys) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
          if (parsed && Array.isArray(parsed.objects) && parsed.objects.length > 0) {
            const vars = parsed.objects.filter(
              (o) => o.text && (o.text.includes("{{") || !o.grid)
            );
            if (vars.length > 0) return vars;
          }
        }
      }

      // 3. ใช้พรีเซ็ตพิกัดที่ออกแบบไว้จาก Template Designer
      const normalizedPrefix = (prefix || "").trim().toUpperCase();
      const normalizedActivity = (activity || "").trim().toLowerCase();
      if (PRESET_TEMPLATES[normalizedPrefix]) return PRESET_TEMPLATES[normalizedPrefix];
      if (normalizedActivity.includes("วิทย์") || normalizedPrefix.includes("SCI")) return PRESET_TEMPLATES.SCI2569;

      return PRESET_TEMPLATES.DEFAULT;
    } catch (e) {
      console.log("Template config parse notice:", e);
    }
    return PRESET_TEMPLATES.DEFAULT;
  }, [activity, prefix, templateJson]);

  // สร้างภาพ PNG ในหน่วยความจำเมื่อข้อมูลเปลี่ยน
  useEffect(() => {
    let active = true;
    setLoading(true);

    generateCertificatePngDataUrl({
      name,
      school,
      activity,
      year,
      certNo: String(certNo || "").trim(),
      background,
      customVariables,
    })
      .then((url) => {
        if (active) {
          setPngUrl(url);
          setLoading(false);
          if (onPngGenerated) onPngGenerated(url);
        }
      })
      .catch((err) => {
        console.error("Certificate generation error:", err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [name, school, activity, year, certNo, background, customVariables]);

  return (
    <Box
      id={id}
      sx={{
        width: "100%",
        maxWidth: 900,
        mx: "auto",
        position: "relative",
        aspectRatio: "1123 / 794",
        overflow: "hidden",
        borderRadius: 2,
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        bgcolor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {pngUrl ? (
        <Box
          component="img"
          src={pngUrl}
          data-cert-png={pngUrl}
          alt={`เกียรติบัตร ${name}`}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
            userSelect: "none",
          }}
        />
      ) : (
        <CircularProgress size={40} />
      )}
    </Box>
  );
}