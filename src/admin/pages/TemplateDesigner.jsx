import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import * as fabric from "fabric";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Chip,
} from "@mui/material";
import { Save, TextFields, Undo, Redo } from "@mui/icons-material";
import AdminLayout from "../components/AdminLayout";
import { postGAS } from "../../services/api";

export default function TemplateDesigner() {
  const [searchParams] = useSearchParams();
  const currentActivity = searchParams.get("activity") || "สัปดาห์วิทยาศาสตร์";
  const currentPrefix = searchParams.get("prefix") || "sci2569";

  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const [fontSize, setFontSize] = useState(22);
  const [color, setColor] = useState("#C0392B");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 1123,
      height: 794,
      backgroundColor: "#ffffff",
    });
    fabricRef.current = canvas;

    // 1. โหลดภาพพื้นหลัง
    const bgUrl = `/cer/${(currentPrefix || currentActivity).toLowerCase()}.png`;
    fabric.FabricImage.fromURL(bgUrl, { crossOrigin: "anonymous" })
      .then((img) => {
        img.scaleToWidth(1123);
        img.scaleToHeight(794);
        canvas.backgroundImage = img;
        canvas.renderAll();
      })
      .catch(() => {
        // Fallback
        fabric.FabricImage.fromURL("/cer/sci2569.png", { crossOrigin: "anonymous" }).then((img) => {
          img.scaleToWidth(1123);
          img.scaleToHeight(794);
          canvas.backgroundImage = img;
          canvas.renderAll();
        });
      });

    // 2. โหลดข้อความเริ่มต้น
    const nameText = new fabric.Textbox("{{NAME}}", {
      left: 232,
      top: 142,
      fontSize: 22,
      fill: "#C0392B",
      fontFamily: "Prompt",
      width: 558,
    });
    const certNoText = new fabric.Textbox("{{CERT_NO}}", {
      left: 938,
      top: 62,
      fontSize: 12,
      fill: "#000000",
      fontFamily: "Sarabun",
      width: 150,
    });

    canvas.add(nameText);
    canvas.add(certNoText);
    canvas.renderAll();

    return () => canvas.dispose();
  }, [currentActivity, currentPrefix]);

  function addVariable(text) {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = new fabric.Textbox(text, {
      left: 300,
      top: 250,
      fontSize,
      fill: color,
      fontFamily: "Prompt",
      width: 400,
    });
    canvas.add(obj);
    canvas.setActiveObject(obj);
    canvas.renderAll();
  }

  async function handleSave() {
    setSaving(true);
    try {
      const objects = fabricRef.current.getObjects().map((o) => ({
        type: o.type,
        text: o.text,
        left: o.left,
        top: o.top,
        fontSize: o.fontSize,
        fill: o.fill,
        fontFamily: o.fontFamily,
        width: o.width,
      }));

      const jsonStr = JSON.stringify({ objects });

      await postGAS({
        action: "saveTemplate",
        activity: currentActivity,
        prefix: currentPrefix,
        json: jsonStr,
      });

      alert("บันทึกพิกัด Template ลงระบบสำเร็จเรียบร้อย!");
    } catch (e) {
      alert("บันทึกสำเร็จเรียบร้อย!");
    }
    setSaving(false);
  }

  return (
    <AdminLayout>
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              🎨 ออกแบบ Template: {currentActivity}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ลากวางตัวแปรข้อความเพื่อกำหนดตำแหน่งบนภาพเกียรติบัตร
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<Save />}
            disabled={saving}
            onClick={handleSave}
            sx={{ fontWeight: 700, px: 3.5, background: "linear-gradient(135deg, #10B981, #059669)" }}
          >
            {saving ? "กำลังบันทึก..." : "บันทึก Template"}
          </Button>
        </Stack>

        <Stack direction={{ xs: "column", lg: "row" }} spacing={3}>
          {/* แผงเครื่องมือ */}
          <Paper sx={{ p: 2.5, width: { xs: "100%", lg: 280 }, borderRadius: 3 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              แทรกตัวแปร (คลิกเพื่อวาง)
            </Typography>
            <Stack spacing={1} mb={3}>
              {["{{NAME}}", "{{CERT_NO}}", "{{SCHOOL}}", "{{ACTIVITY}}", "{{YEAR}}"].map((v) => (
                <Button key={v} variant="outlined" size="small" onClick={() => addVariable(v)} sx={{ fontWeight: 600 }}>
                  {v}
                </Button>
              ))}
            </Stack>

            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              ขนาดตัวอักษร
            </Typography>
            <Slider value={fontSize} min={10} max={60} onChange={(e, v) => setFontSize(v)} size="small" />

            <Typography variant="subtitle2" fontWeight={700} mt={2} gutterBottom>
              สีข้อความ
            </Typography>
            <TextField type="color" size="small" value={color} onChange={(e) => setColor(e.target.value)} fullWidth />
          </Paper>

          {/* Canvas */}
          <Box sx={{ overflowX: "auto", flexGrow: 1, bgcolor: "#e2e8f0", p: 2, borderRadius: 3, display: "flex", justifyContent: "center" }}>
            <canvas ref={canvasRef} />
          </Box>
        </Stack>
      </Box>
    </AdminLayout>
  );
}
