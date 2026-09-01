import { useState, useEffect } from "react";
import { Box, CircularProgress, Button, Stack } from "@mui/material";
import { Image as ImageIcon, PictureAsPdf } from "@mui/icons-material";
import { jsPDF } from "jspdf";
import { getTemplate } from "../config/templates";

/**
 * ฟังก์ชันสร้าง DataURL ของเกียรติบัตรบน Canvas
 */
export async function generateCertificateUrl({ name = "", certNo = "", activity = "" }) {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1131; // A4 แนวนอน
  const ctx = canvas.getContext("2d");

  // พื้นหลังสีขาว
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const tpl = getTemplate(activity);

  // 1. วาดภาพพื้นหลัง
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = tpl.background;
    await new Promise((resolve) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve();
      };
      img.onerror = () => resolve();
    });
  } catch (e) {
    console.warn("BG Load:", e);
  }

  // รอ Fonts พร้อม
  try {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
  } catch (e) {}

  const scale = 1600 / 1123;

  // 2. วาดชื่อนักเรียน
  if (name) {
    const n = tpl.name;
    const fSize = Math.round(n.fontSize * scale);
    ctx.font = `normal ${fSize}px '${n.font}', sans-serif`;
    ctx.fillStyle = n.color;
    ctx.textAlign = n.align;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(name, n.left * scale, n.top * scale + fSize * 0.85);
  }

  // 3. วาดเลขที่เกียรติบัตร
  if (certNo) {
    const c = tpl.certNo;
    const fSize = Math.round(c.fontSize * scale);
    ctx.font = `normal ${fSize}px '${c.font}', sans-serif`;
    ctx.fillStyle = c.color;
    ctx.textAlign = c.align;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(certNo, c.left * scale, c.top * scale + fSize * 0.85);
  }

  return canvas.toDataURL("image/png", 1.0);
}

export default function CertificateCanvas({ name = "", certNo = "", activity = "" }) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    generateCertificateUrl({ name, certNo, activity }).then((res) => {
      if (active) {
        setUrl(res);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [name, certNo, activity]);

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
    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1600, 1131] });
    pdf.addImage(url, "PNG", 0, 0, 1600, 1131);
    pdf.save(`${fileName}.pdf`);
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* ภาพพรีวิว */}
      <Box
        sx={{
          width: "100%",
          aspectRatio: "1123 / 794",
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
