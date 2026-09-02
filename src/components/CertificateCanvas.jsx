import { useState, useEffect } from "react";
import { Box, CircularProgress, Button, Stack } from "@mui/material";
import { Image as ImageIcon, PictureAsPdf } from "@mui/icons-material";
import { jsPDF } from "jspdf";
import { getBackgroundUrl, DEFAULT_COORDINATES, getCoordinatesForActivity } from "../config/templates";

/**
 * ฟังก์ชันสร้าง DataURL ของเกียรติบัตรบน HTML5 Canvas
 * ความละเอียด 1600x1131 px มาตรฐาน A4 แนวนอน
 */
export async function generateCertificateUrl({
  name = "",
  school = "",
  activity = "",
  year = "",
  certNo = "",
  prefix = "",
  templateJson = null,
}) {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1131;
  const ctx = canvas.getContext("2d");

  // 1. พื้นหลังสีขาว
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. โหลดและวาดภาพพื้นหลัง
  const bgUrl = getBackgroundUrl(activity, prefix);
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = bgUrl;
    await new Promise((resolve) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve();
      };
      img.onerror = () => {
        const fallback = new Image();
        fallback.crossOrigin = "anonymous";
        fallback.src = getBackgroundUrl("sci2569");
        fallback.onload = () => {
          ctx.drawImage(fallback, 0, 0, canvas.width, canvas.height);
          resolve();
        };
        fallback.onerror = () => resolve();
      };
    });
  } catch (e) {
    console.warn("BG Load notice:", e);
  }

  // 3. โหลดฟอนต์ Prompt และ Sarabun ให้พร้อมก่อนวาดเสมอ
  try {
    if (document.fonts) {
      await Promise.allSettled([
        document.fonts.load("bold 40px 'Prompt'"),
        document.fonts.load("normal 20px 'Sarabun'"),
        document.fonts.ready,
      ]);
    }
  } catch (e) {}

  const scale = 1600 / 1123; // สเกล 1123px (Designer) -> 1600px

  // 4. แยกดึง Objects ที่จัดวางไว้
  let objects = null;
  if (templateJson) {
    try {
      const parsed = typeof templateJson === "string" ? JSON.parse(templateJson) : templateJson;
      if (parsed && Array.isArray(parsed.objects) && parsed.objects.length > 0) {
        objects = parsed.objects;
      }
    } catch (e) {
      console.warn("JSON parse notice:", e);
    }
  }

  if (!objects) {
    const local =
      localStorage.getItem(`template_${prefix}`) ||
      localStorage.getItem(`template_${activity}`) ||
      localStorage.getItem("template_sci2569");
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed && Array.isArray(parsed.objects) && parsed.objects.length > 0) {
          objects = parsed.objects;
        }
      } catch (e) {}
    }
  }

  const objectsToDraw =
    objects && objects.length > 0 ? objects : getCoordinatesForActivity(activity, prefix);

  // 5. วาดตัวแปรข้อความทุกตัวตามพิกัด 1:1 กับ Fabric.js
  objectsToDraw.forEach((obj) => {
    let rawText = obj.text || "";

    // แทนค่าตัวแปร
    let text = rawText
      .replace(/\{\{NAME\}\}/g, name || "")
      .replace(/\{\{CERT_NO\}\}/g, certNo || "")
      .replace(/\{\{SCHOOL\}\}/g, school || "เบญจมราชรังสฤษฎิ์ ๒")
      .replace(/\{\{ACTIVITY\}\}/g, activity || "")
      .replace(/\{\{YEAR\}\}/g, String(year || "2569"));

    if (text === rawText) {
      if (rawText.toUpperCase().includes("NAME")) text = name || "";
      if (rawText.toUpperCase().includes("CERT")) text = certNo || "";
    }

    if (!text.trim()) return;

    const fontSize = Math.round((obj.fontSize || 26) * scale);
    const fontFamily = obj.fontFamily || "Prompt";
    const fill = typeof obj.fill === "string" ? obj.fill : "#0D47A1";
    const textAlign = obj.textAlign || "left";
    const fontWeight = obj.fontWeight || "normal";

    let x = (obj.left || 0) * scale;
    if (textAlign === "center") {
      if (obj.width && obj.width > 20) {
        x = ((obj.left || 0) + obj.width / 2) * scale;
      } else {
        x = canvas.width / 2;
      }
    } else if (textAlign === "right") {
      if (obj.width && obj.width > 20) {
        x = ((obj.left || 0) + obj.width) * scale;
      }
    }

    // ใช้ textBaseline = "top" เพื่อให้ตรงกับ Fabric.js 1:1 ไม่มีเพี้ยน
    const y = (obj.top || 0) * scale;

    ctx.font = `${fontWeight} ${fontSize}px '${fontFamily}', 'Prompt', 'Sarabun', sans-serif`;
    ctx.fillStyle = fill;
    ctx.textAlign = textAlign;
    ctx.textBaseline = "top";
    ctx.fillText(text, x, y);
  });

  return canvas.toDataURL("image/png", 1.0);
}

export default function CertificateCanvas({
  name = "",
  school = "",
  activity = "",
  year = "",
  certNo = "",
  prefix = "",
  templateJson = null,
}) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    generateCertificateUrl({
      name,
      school,
      activity,
      year,
      certNo,
      prefix,
      templateJson,
    }).then((res) => {
      if (active) {
        setUrl(res);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [name, school, activity, year, certNo, prefix, templateJson]);

  const fileName = `เกียรติบัตร_${name || "นักเรียน"}_${activity || "กิจกรรม"}`;

  function downloadImage() {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function downloadPdf() {
    // บังคับขนาดมาตรฐานกระดาษ A4 แนวนอน 297mm x 210mm เต็มแผ่น
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    pdf.addImage(url, "PNG", 0, 0, 297, 210);
    pdf.save(`${fileName}.pdf`);
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* ภาพพรีวิวสัดส่วนกระดาษ A4 (297 : 210) */}
      <Box
        sx={{
          width: "100%",
          aspectRatio: "297 / 210",
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          bgcolor: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {url ? (
          <Box
            component="img"
            src={url}
            alt={`เกียรติบัตร ${name}`}
            sx={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          />
        ) : (
          <CircularProgress size={40} />
        )}
      </Box>

      {/* ปุ่มดาวน์โหลด */}
      {url && (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center" mt={3}>
          <Button
            variant="contained"
            size="large"
            startIcon={<ImageIcon />}
            onClick={downloadImage}
            sx={{
              background: "linear-gradient(135deg, #1976D2, #0D47A1)",
              fontWeight: 700,
              px: 3.5,
              py: 1.2,
              borderRadius: 2.5,
            }}
          >
            บันทึกรูปภาพ (PNG)
          </Button>

          <Button
            variant="contained"
            size="large"
            startIcon={<PictureAsPdf />}
            onClick={downloadPdf}
            sx={{
              background: "linear-gradient(135deg, #FF6F00, #E65100)",
              fontWeight: 700,
              px: 3.5,
              py: 1.2,
              borderRadius: 2.5,
            }}
          >
            ดาวน์โหลด PDF
          </Button>
        </Stack>
      )}
    </Box>
  );
}
