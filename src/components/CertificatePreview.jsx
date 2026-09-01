import { useState, useEffect, useMemo } from "react";
import { Box, CircularProgress } from "@mui/material";

/**
 * สร้างรูปภาพเกียรติบัตร PNG ความละเอียดสูงในหน่วยความจำ (In-Memory Canvas)
 * ใช้ background จาก /cer/ เท่านั้น ไม่ดึงจาก Google Drive
 */
export async function generateCertificatePngDataUrl({
  name = "",
  school = "",
  activity = "",
  year = "",
  certNo = "",
  background = "",
  customVariables = null,
}) {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1131; // มาตราส่วน A4 แนวนอน (1600x1131)
  const ctx = canvas.getContext("2d");

  // เติมพื้นหลังสีขาว
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 1. วาดภาพพื้นหลัง Template จาก /cer/
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
        img.onerror = () => {
          console.warn("ไม่พบภาพพื้นหลัง:", background);
          resolve();
        };
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
    // ตำแหน่งมาตรฐาน (fallback เมื่อยังไม่มีพิกัดจาก Designer)
    if (certNo) {
      ctx.font = `600 ${Math.round(15 * scale)}px 'Sarabun', 'Prompt', sans-serif`;
      ctx.fillStyle = "#334155";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(certNo, canvas.width * 0.772, canvas.height * 0.081);
    }
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

/**
 * สร้าง path ภาพพื้นหลังจากชื่อกิจกรรม
 * เช่น "สัปดาห์วิทยาศาสตร์" + prefix "SCI2569" → "/cer/sci2569.png"
 * เช่น activity "sci2569" → "/cer/sci2569.png"
 */
function buildBackgroundPath(activity = "", prefix = "") {
  // ใช้ prefix ก่อน (เพราะมักเป็นชื่อสั้นๆ เช่น sci2569)
  const key = (prefix || activity || "default").trim().toLowerCase();
  return `/cer/${key}.png`;
}

/**
 * CertificatePreview — สร้างภาพ PNG ใน Memory แล้วแสดงผลเป็น <img>
 *
 * ลำดับการอ่านพิกัด:
 *   1. templateJson (จาก GAS API) ← แหล่งหลัก ทุกอุปกรณ์เห็นตรงกัน
 *   2. templates.js fallback ← ใช้เมื่อ GAS ยังไม่มีข้อมูล
 *
 * ภาพพื้นหลัง:
 *   ดึงจาก /cer/ชื่องาน.png เท่านั้น (ไม่ใช้ Google Drive)
 */
export default function CertificatePreview({
  id = undefined,
  name = "",
  school = "",
  activity = "",
  year = "",
  certNo = "",
  prefix = "",
  background = null,
  templateJson = null,
  onPngGenerated = null,
}) {
  const [pngUrl, setPngUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const { configVars, finalBackground } = useMemo(() => {
    let customVars = null;

    // === ลำดับที่ 1: พิกัดจาก GAS (templateJson) ===
    // ข้อมูลนี้มาจาก Google Sheets ดังนั้นทุกอุปกรณ์จะเห็นเหมือนกัน
    try {
      if (templateJson) {
        const parsed = typeof templateJson === "string" ? JSON.parse(templateJson) : templateJson;
        if (parsed && Array.isArray(parsed.objects) && parsed.objects.length > 0) {
          const vars = parsed.objects.filter(
            (o) => o.text && (o.text.includes("{{") || !o.grid)
          );
          if (vars.length > 0) {
            customVars = vars;
          }
        }
      }
    } catch (e) {
      console.log("Template JSON parse notice:", e);
    }

    // === ลำดับที่ 2: Fallback จาก templates.js (เมื่อ GAS ยังไม่มีข้อมูล) ===
    if (!customVars) {
      try {
        const { getTemplateConfig } = require("../config/templates");
        const config = getTemplateConfig(activity, prefix);
        customVars = config.objects;
      } catch (e) {
        // ไม่มี fallback ก็ใช้ตำแหน่งมาตรฐาน (hardcoded ใน generateCertificatePngDataUrl)
      }
    }

    // === ภาพพื้นหลัง: จาก /cer/ เท่านั้น ===
    let bg = background;
    if (!bg || bg.includes("googleusercontent.com") || bg.includes("drive.google.com")) {
      bg = buildBackgroundPath(activity, prefix);
    }

    return { configVars: customVars, finalBackground: bg };
  }, [activity, prefix, background, templateJson]);

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
      background: finalBackground,
      customVariables: configVars,
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
  }, [name, school, activity, year, certNo, finalBackground, configVars]);

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