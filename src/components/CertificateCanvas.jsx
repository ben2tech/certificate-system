import { useState, useEffect, useMemo } from "react";
import { Box, CircularProgress, Button, Stack } from "@mui/material";
import { Download, Image as ImageIcon, PictureAsPdf } from "@mui/icons-material";
import { jsPDF } from "jspdf";
import { getBackgroundUrl, DEFAULT_COORDINATES } from "../config/templates";

/**
 * ฟังก์ชันสร้างรูปภาพ DataURL บน HTML5 Canvas
 */
export async function renderCertificateCanvas({
  name = "",
  school = "",
  activity = "",
  year = "",
  certNo = "",
  backgroundUrl = "/cer/sci2569.png",
  objects = null,
}) {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1131; // สัดส่วน A4 แนวนอน (1600x1131)
  const ctx = canvas.getContext("2d");

  // พื้นหลังสีขาว
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 1. โหลดและวาดภาพพื้นหลัง
  const bgToLoad = backgroundUrl || "/cer/sci2569.png";
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = bgToLoad;
    await new Promise((resolve) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve();
      };
      img.onerror = () => {
        // Fallback to /cer/sci2569.png
        if (bgToLoad !== "/cer/sci2569.png") {
          const fallback = new Image();
          fallback.crossOrigin = "anonymous";
          fallback.src = "/cer/sci2569.png";
          fallback.onload = () => {
            ctx.drawImage(fallback, 0, 0, canvas.width, canvas.height);
            resolve();
          };
          fallback.onerror = () => resolve();
        } else {
          resolve();
        }
      };
    });
  } catch (e) {
    console.warn("Canvas BG Load:", e);
  }

  // รอ Fonts พร้อม
  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  } catch (e) {}

  const scale = 1600 / 1123; // สเกลตำแหน่ง 1123px (Designer) -> 1600px

  // 2. วาดตัวแปรข้อความ
  const textObjects = (objects && objects.length > 0) ? objects : DEFAULT_COORDINATES;

  textObjects.forEach((obj) => {
    let textContent = obj.text || "";
    textContent = textContent
      .replace(/\{\{NAME\}\}/g, name || "")
      .replace(/\{\{CERT_NO\}\}/g, certNo || "")
      .replace(/\{\{SCHOOL\}\}/g, school || "")
      .replace(/\{\{ACTIVITY\}\}/g, activity || "")
      .replace(/\{\{YEAR\}\}/g, String(year || ""));

    const fontSize = Math.round((obj.fontSize || 22) * scale);
    const fontWeight = obj.fontWeight || "normal";
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

  return canvas.toDataURL("image/png", 1.0);
}

/**
 * ดาวน์โหลดรูปภาพ PNG
 */
export function downloadPng(dataUrl, fileName = "certificate.png") {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * ดาวน์โหลดไฟล์ PDF
 */
export function downloadPdf(dataUrl, fileName = "certificate.pdf") {
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [1600, 1131],
  });
  pdf.addImage(dataUrl, "PNG", 0, 0, 1600, 1131);
  pdf.save(fileName);
}

/**
 * คอมโพเนนต์ CertificateCanvas — แสดงรูปภาพเกียรติบัตรคมชัด 100%
 */
export default function CertificateCanvas({
  name = "",
  school = "",
  activity = "",
  year = "",
  certNo = "",
  prefix = "",
  templateJson = null,
  showActions = false,
}) {
  const [dataUrl, setDataUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  // คำนวณพิกัดและพื้นหลัง
  const { resolvedObjects, resolvedBg } = useMemo(() => {
    let objs = null;
    if (templateJson) {
      try {
        const parsed = typeof templateJson === "string" ? JSON.parse(templateJson) : templateJson;
        if (parsed && Array.isArray(parsed.objects) && parsed.objects.length > 0) {
          objs = parsed.objects.filter((o) => o.text && !o.grid);
        }
      } catch (e) {
        console.log("JSON parse error:", e);
      }
    }
    const bg = getBackgroundUrl(activity, prefix);
    return { resolvedObjects: objs || DEFAULT_COORDINATES, resolvedBg: bg };
  }, [activity, prefix, templateJson]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    renderCertificateCanvas({
      name,
      school,
      activity,
      year,
      certNo: String(certNo || "").trim(),
      backgroundUrl: resolvedBg,
      objects: resolvedObjects,
    }).then((url) => {
      if (active) {
        setDataUrl(url);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [name, school, activity, year, certNo, resolvedBg, resolvedObjects]);

  const fileName = `เกียรติบัตร_${name || "นักเรียน"}_${activity || "กิจกรรม"}`;

  return (
    <Box sx={{ width: "100%" }}>
      {/* ภาพพรีวิว */}
      <Box
        sx={{
          width: "100%",
          aspectRatio: "1123 / 794",
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 10px 35px rgba(0,0,0,0.3)",
          bgcolor: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {dataUrl ? (
          <Box
            component="img"
            src={dataUrl}
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

      {/* ปุ่มดาวน์โหลด (ถ้าเปิดใช้งาน) */}
      {showActions && dataUrl && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="center"
          alignItems="center"
          mt={3}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<ImageIcon />}
            onClick={() => downloadPng(dataUrl, `${fileName}.png`)}
            sx={{
              background: "linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)",
              color: "white",
              fontWeight: 700,
              px: 3.5,
              py: 1.2,
              borderRadius: 2.5,
              boxShadow: "0 4px 14px rgba(25, 118, 210, 0.4)",
            }}
          >
            บันทึกรูปภาพ (PNG)
          </Button>

          <Button
            variant="contained"
            size="large"
            startIcon={<PictureAsPdf />}
            onClick={() => downloadPdf(dataUrl, `${fileName}.pdf`)}
            sx={{
              background: "linear-gradient(135deg, #FF6F00 0%, #E65100 100%)",
              color: "white",
              fontWeight: 700,
              px: 3.5,
              py: 1.2,
              borderRadius: 2.5,
              boxShadow: "0 4px 14px rgba(230, 81, 0, 0.4)",
            }}
          >
            ดาวน์โหลด PDF
          </Button>
        </Stack>
      )}
    </Box>
  );
}
