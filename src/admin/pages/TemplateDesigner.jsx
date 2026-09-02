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
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Code,
  ContentCopy,
} from "@mui/icons-material";
import AdminLayout from "../components/AdminLayout";
import { postGAS, getFromGAS } from "../../services/api";
import { getBackgroundUrl, DEFAULT_COORDINATES, getCoordinatesForActivity } from "../../config/templates";

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
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [codePreview, setCodePreview] = useState(null);
  const [codeOpen, setCodeOpen] = useState(false);

  function handleShowCode() {
    if (!fabricRef.current) return;
    const objects = fabricRef.current.getObjects().map((o) => ({
      type: o.type,
      text: o.text,
      left: Math.round(o.left),
      top: Math.round(o.top),
      width: Math.round(o.width),
      fontSize: o.fontSize,
      fontFamily: o.fontFamily,
      fill: o.fill,
      textAlign: o.textAlign || "left",
      fontWeight: o.fontWeight || "normal",
    }));

    const codeStr = `${currentPrefix}: [\n` + objects.map(o => `    {
      type: "textbox",
      text: "${o.text}",
      left: ${o.left},
      top: ${o.top},
      width: ${o.width},
      fontSize: ${o.fontSize},
      fontFamily: "${o.fontFamily}",
      fill: "${o.fill}",
      textAlign: "${o.textAlign}",
      fontWeight: "${o.fontWeight}",
    }`).join(",\n") + `\n  ],`;

    setCodePreview(codeStr);
    setCodeOpen(true);
  }

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
    let isMounted = true;
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 1123,
      height: 794,
      backgroundColor: "#ffffff",
    });
    fabricRef.current = canvas;

    // 1. โหลดภาพพื้นหลัง
    const bgUrl = getBackgroundUrl(currentActivity, currentPrefix);
    fabric.FabricImage.fromURL(bgUrl, { crossOrigin: "anonymous" })
      .then((img) => {
        if (!isMounted) return;
        img.scaleToWidth(1123);
        img.scaleToHeight(794);
        canvas.backgroundImage = img;
        canvas.renderAll();
      })
      .catch((err) => console.warn("Background load error:", err));

    // 2. โหลดพิกัดที่เคยบันทึกไว้ (จาก GAS หรือ LocalStorage)
    async function loadSavedObjects() {
      let savedObjects = null;

      try {
        // ลองดึงจาก GAS ก่อน
        const tplRes = await getFromGAS({ action: "templates" });
        if (tplRes && tplRes.data) {
          const match = tplRes.data.find(
            (t) =>
              (t.prefix && t.prefix.toLowerCase() === currentPrefix.toLowerCase()) ||
              (t.activity && t.activity.toLowerCase() === currentActivity.toLowerCase())
          );
          if (match && match.json) {
            const parsed = JSON.parse(match.json);
            if (parsed && Array.isArray(parsed.objects) && parsed.objects.length > 0) {
              savedObjects = parsed.objects;
            }
          }
        }
      } catch (e) {
        console.warn("GAS template fetch error:", e);
      }

      // ถ้าไม่มีใน GAS ลองดึงจาก LocalStorage
      if (!savedObjects) {
        const local = localStorage.getItem(`template_${currentPrefix}`) || localStorage.getItem(`template_${currentActivity}`);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (parsed && Array.isArray(parsed.objects)) savedObjects = parsed.objects;
          } catch (e) {}
        }
      }

      // ถ้ายังไม่มีเลย ให้ใช้พิกัดตามกิจกรรมหรือ DEFAULT_COORDINATES
      const objectsToRender =
        savedObjects || getCoordinatesForActivity(currentActivity, currentPrefix);

      if (isMounted) {
        objectsToRender.forEach((obj) => {
          const tb = new fabric.Textbox(obj.text || "{{NAME}}", {
            left: obj.left || 232,
            top: obj.top || 142,
            fontSize: obj.fontSize || 22,
            fill: obj.fill || "#C0392B",
            fontFamily: obj.fontFamily || "Prompt",
            width: obj.width || 400,
            textAlign: obj.textAlign || "left",
            fontWeight: obj.fontWeight || "normal",
          });
          canvas.add(tb);
        });
        canvas.renderAll();
      }
    }

    loadSavedObjects();

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

    return () => {
      isMounted = false;
      canvas.dispose();
    };
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
      setToast({ open: true, message: `อัปโหลดและติดตั้งฟอนต์ "${fontName}" สำเร็จ!`, severity: "success" });
    } catch (err) {
      setToast({ open: true, message: "ไม่สามารถโหลดไฟล์ฟอนต์นี้ได้ กรุณาใช้ไฟล์ .ttf หรือ .otf", severity: "error" });
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
        left: Math.round(o.left),
        top: Math.round(o.top),
        fontSize: o.fontSize,
        fill: o.fill,
        fontFamily: o.fontFamily,
        textAlign: o.textAlign || "left",
        fontWeight: o.fontWeight || "normal",
        width: Math.round(o.width),
      }));

      const jsonStr = JSON.stringify({ objects });

      // เซฟลง LocalStorage
      localStorage.setItem(`template_${currentPrefix}`, jsonStr);
      localStorage.setItem(`template_${currentActivity}`, jsonStr);

      // เซฟลง Google Apps Script
      await postGAS({
        action: "saveTemplate",
        activity: currentActivity,
        prefix: currentPrefix,
        json: jsonStr,
      });

      setToast({ open: true, message: "✅ บันทึกพิกัด Template สำเร็จเรียบร้อย!", severity: "success" });
    } catch (e) {
      setToast({ open: true, message: "✅ บันทึกพิกัด Template เรียบร้อย!", severity: "success" });
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
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Code />}
              onClick={handleShowCode}
              sx={{ fontWeight: 700, px: 3.5, borderColor: "#10B981", color: "#10B981", "&:hover": { borderColor: "#059669", backgroundColor: "rgba(16, 185, 129, 0.04)" } }}
            >
              แสดงโค้ดพิกัด
            </Button>
            <Button
              variant="contained"
              size="large"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
              disabled={saving}
              onClick={handleSave}
              sx={{ fontWeight: 700, px: 3.5, background: "linear-gradient(135deg, #10B981, #059669)" }}
            >
              {saving ? "กำลังบันทึก..." : "บันทึก TEMPLATE"}
            </Button>
          </Stack>
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

        {/* แจ้งเตือน Toast */}
        <Snackbar
          open={toast.open}
          autoHideDuration={4000}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={toast.severity} sx={{ width: "100%", fontWeight: 700 }}>
            {toast.message}
          </Alert>
        </Snackbar>

        <Dialog open={codeOpen} onClose={() => setCodeOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>โค้ดพิกัดสำหรับ templates.js</Box>
            <Button
              variant="contained"
              size="small"
              startIcon={<ContentCopy />}
              onClick={() => {
                navigator.clipboard.writeText(codePreview);
                setToast({ open: true, message: "คัดลอกโค้ดเรียบร้อย!", severity: "success" });
              }}
            >
              คัดลอก
            </Button>
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              คุณสามารถนำโค้ดด้านล่างนี้ไปวางทับในไฟล์ <strong>src/config/templates.js</strong> ในส่วนของ <strong>ACTIVITY_TEMPLATES</strong> ได้เลยครับ
            </Typography>
            <Box
              component="pre"
              sx={{
                p: 2,
                bgcolor: "#1E293B",
                color: "#E2E8F0",
                borderRadius: 2,
                overflowX: "auto",
                fontFamily: "monospace",
                fontSize: 14,
              }}
            >
              {codePreview}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCodeOpen(false)} sx={{ fontWeight: 700 }}>
              ปิด
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}
