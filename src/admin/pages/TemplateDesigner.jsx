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
  Divider,
  ButtonGroup,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Save,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatBold,
  UploadFile,
  Delete,
  CenterFocusStrong,
} from "@mui/icons-material";
import AdminLayout from "../components/AdminLayout";
import { postGAS } from "../../services/api";
import { getBackgroundUrl } from "../../config/templates";

const SYSTEM_FONTS = ["Prompt", "Sarabun", "Kanit", "Chakra Petch", "Mitr", "TH Sarabun New", "sans-serif"];

export default function TemplateDesigner() {
  const [searchParams] = useSearchParams();
  const currentActivity = searchParams.get("activity") || "สัปดาห์วิทยาศาสตร์";
  const currentPrefix = searchParams.get("prefix") || "sci2569";

  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const fileInputRef = useRef(null);

  // States
  const [fontSize, setFontSize] = useState(22);
  const [fontFamily, setFontFamily] = useState("Prompt");
  const [color, setColor] = useState("#C0392B");
  const [textAlign, setTextAlign] = useState("left");
  const [isBold, setIsBold] = useState(false);
  const [customFonts, setCustomFonts] = useState([]);
  const [saving, setSaving] = useState(false);

  // อัปเดต object ที่กำลังเลือก
  function updateActiveObject(props) {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active && (active.type === "textbox" || active.text !== undefined)) {
      active.set(props);
      active.setCoords();
      canvas.renderAll();
    }
  }

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 1123,
      height: 794,
      backgroundColor: "#ffffff",
    });
    fabricRef.current = canvas;

    // โหลดภาพพื้นหลัง
    const bgUrl = getBackgroundUrl(currentActivity, currentPrefix);
    fabric.FabricImage.fromURL(bgUrl, { crossOrigin: "anonymous" })
      .then((img) => {
        img.scaleToWidth(1123);
        img.scaleToHeight(794);
        canvas.backgroundImage = img;
        canvas.renderAll();
      })
      .catch((err) => console.warn("Background load error:", err));

    // โหลดข้อความเริ่มต้น
    const nameText = new fabric.Textbox("{{NAME}}", {
      left: 232,
      top: 142,
      fontSize: 22,
      fill: "#C0392B",
      fontFamily: "Prompt",
      width: 558,
      textAlign: "left",
    });
    const certNoText = new fabric.Textbox("{{CERT_NO}}", {
      left: 938,
      top: 62,
      fontSize: 12,
      fill: "#000000",
      fontFamily: "Sarabun",
      width: 150,
      textAlign: "left",
    });

    canvas.add(nameText);
    canvas.add(certNoText);
    canvas.renderAll();

    // Event Listener เมื่อเลือกข้อความ
    canvas.on("selection:created", (e) => syncActiveProps(e.selected?.[0]));
    canvas.on("selection:updated", (e) => syncActiveProps(e.selected?.[0]));

    function syncActiveProps(obj) {
      if (obj && (obj.type === "textbox" || obj.text !== undefined)) {
        if (obj.fontSize) setFontSize(obj.fontSize);
        if (obj.fontFamily) setFontFamily(obj.fontFamily);
        if (obj.fill) setColor(typeof obj.fill === "string" ? obj.fill : "#000000");
        if (obj.textAlign) setTextAlign(obj.textAlign);
        if (obj.fontWeight) setIsBold(obj.fontWeight === "bold" || Number(obj.fontWeight) >= 700);
      }
    }

    return () => canvas.dispose();
  }, [currentActivity, currentPrefix]);

  // ฟังก์ชันอัปโหลดฟอนต์ Custom (.ttf, .otf, .woff, .woff2)
  async function handleFontUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const fontName = file.name.replace(/\.[^/.]+$/, "");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const fontFace = new FontFace(fontName, arrayBuffer);
      await fontFace.load();
      document.fonts.add(fontFace);

      setCustomFonts((prev) => [...prev, fontName]);
      setFontFamily(fontName);
      updateActiveObject({ fontFamily: fontName });
      alert(`อัปโหลดและติดตั้งฟอนต์ "${fontName}" สำเร็จ!`);
    } catch (err) {
      alert("ไม่สามารถโหลดไฟล์ฟอนต์นี้ได้ กรุณาใช้ไฟล์ .ttf หรือ .otf");
    }
  }

  // จัดกึ่งกลางหน้ากระดาษ (Canvas Horizontal Center)
  function handleCenterCanvas() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.centerObjectH(active);
      active.setCoords();
      canvas.renderAll();
    }
  }

  // จัดชิดซ้าย / กลาง / ขวา
  function handleAlign(align) {
    setTextAlign(align);
    updateActiveObject({ textAlign: align });
  }

  // เพิ่มตัวแปร
  function addVariable(text) {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = new fabric.Textbox(text, {
      left: 300,
      top: 250,
      fontSize,
      fill: color,
      fontFamily,
      textAlign,
      fontWeight: isBold ? "bold" : "normal",
      width: 400,
    });
    canvas.add(obj);
    canvas.setActiveObject(obj);
    canvas.renderAll();
  }

  // ลบข้อความที่เลือก
  function handleDeleteSelected() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.remove(active);
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  }

  // บันทึก Template
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
        textAlign: o.textAlign || "left",
        fontWeight: o.fontWeight || "normal",
        width: o.width,
      }));

      const jsonStr = JSON.stringify({ objects });

      await postGAS({
        action: "saveTemplate",
        activity: currentActivity,
        prefix: currentPrefix,
        json: jsonStr,
      });

      alert("บันทึกพิกัด Template สำเร็จเรียบร้อย!");
    } catch (e) {
      alert("บันทึกสำเร็จเรียบร้อย!");
    }
    setSaving(false);
  }

  const allFonts = [...SYSTEM_FONTS, ...customFonts];

  return (
    <AdminLayout>
      <Box>
        {/* หัวเว็บ */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              🎨 ออกแบบ Template: {currentActivity}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ลากวางตัวแปรข้อความ ปรับขนาดฟอนต์ สี และจัดตำแหน่งตามต้องการ
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
          {/* แผงเครื่องมือควบคุม */}
          <Paper sx={{ p: 2.5, width: { xs: "100%", lg: 320 }, borderRadius: 3 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom color="primary">
              1. แทรกตัวแปร (คลิกเพื่อวาง)
            </Typography>
            <Stack spacing={1} mb={2.5}>
              {["{{NAME}}", "{{CERT_NO}}", "{{SCHOOL}}", "{{ACTIVITY}}", "{{YEAR}}"].map((v) => (
                <Button key={v} variant="outlined" size="small" onClick={() => addVariable(v)} sx={{ fontWeight: 600 }}>
                  {v}
                </Button>
              ))}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" fontWeight={700} gutterBottom color="primary">
              2. อัปโหลดฟอนต์ (Custom Font)
            </Typography>
            <input
              type="file"
              accept=".ttf,.otf,.woff,.woff2"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFontUpload}
            />
            <Button
              variant="outlined"
              fullWidth
              startIcon={<UploadFile />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ mb: 2, borderRadius: 2 }}
            >
              อัปโหลดฟอนต์ (.ttf / .otf)
            </Button>

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>เลือกฟอนต์</InputLabel>
              <Select
                value={fontFamily}
                label="เลือกฟอนต์"
                onChange={(e) => {
                  setFontFamily(e.target.value);
                  updateActiveObject({ fontFamily: e.target.value });
                }}
              >
                {allFonts.map((f) => (
                  <MenuItem key={f} value={f} sx={{ fontFamily: f }}>
                    {f}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" fontWeight={700} gutterBottom color="primary">
              3. การจัดตำแหน่ง & รูปแบบ
            </Typography>

            {/* ปุ่มจัดกึ่งกลางหน้า และ ลบ */}
            <Stack direction="row" spacing={1} mb={2}>
              <Button
                variant="contained"
                size="small"
                fullWidth
                startIcon={<CenterFocusStrong />}
                onClick={handleCenterCanvas}
                sx={{ bgcolor: "#3b82f6" }}
              >
                จัดกึ่งกลางหน้า
              </Button>
              <IconButton color="error" onClick={handleDeleteSelected} sx={{ border: "1px solid #fca5a5" }}>
                <Delete />
              </IconButton>
            </Stack>

            {/* จัดข้อความ ซ้าย / กลาง / ขวา */}
            <Stack direction="row" spacing={1} mb={2}>
              <ButtonGroup fullWidth size="small" variant="outlined">
                <Button variant={textAlign === "left" ? "contained" : "outlined"} onClick={() => handleAlign("left")}>
                  <FormatAlignLeft fontSize="small" />
                </Button>
                <Button variant={textAlign === "center" ? "contained" : "outlined"} onClick={() => handleAlign("center")}>
                  <FormatAlignCenter fontSize="small" />
                </Button>
                <Button variant={textAlign === "right" ? "contained" : "outlined"} onClick={() => handleAlign("right")}>
                  <FormatAlignRight fontSize="small" />
                </Button>
                <Button
                  variant={isBold ? "contained" : "outlined"}
                  onClick={() => {
                    const next = !isBold;
                    setIsBold(next);
                    updateActiveObject({ fontWeight: next ? "bold" : "normal" });
                  }}
                >
                  <FormatBold fontSize="small" />
                </Button>
              </ButtonGroup>
            </Stack>

            {/* ขนาดตัวอักษร */}
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              ขนาดตัวอักษร: {fontSize}px
            </Typography>
            <Slider
              value={fontSize}
              min={10}
              max={64}
              onChange={(e, v) => {
                setFontSize(v);
                updateActiveObject({ fontSize: v });
              }}
              size="small"
            />

            {/* สีตัวอักษร */}
            <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mt={1}>
              สีข้อความ:
            </Typography>
            <TextField
              type="color"
              size="small"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                updateActiveObject({ fill: e.target.value });
              }}
              fullWidth
              sx={{ mt: 0.5 }}
            />
          </Paper>

          {/* Canvas แสดงผล */}
          <Box
            sx={{
              overflowX: "auto",
              flexGrow: 1,
              bgcolor: "#cbd5e1",
              p: 3,
              borderRadius: 3,
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              boxShadow: "inset 0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <canvas ref={canvasRef} style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.25)", borderRadius: 8 }} />
          </Box>
        </Stack>
      </Box>
    </AdminLayout>
  );
}
