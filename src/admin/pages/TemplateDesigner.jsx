import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import * as fabric from "fabric";
import { jsPDF } from "jspdf";

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
  IconButton,
  Divider,
  TextField,
  Chip,
  ButtonGroup,
  Tooltip
} from "@mui/material";

import {
  Undo,
  Redo,
  Save,
  Download,
  GridOn,
  TextFields,
  Preview,
  Delete,
  DeleteSweep,
  Add as AddIcon,
  Remove as RemoveIcon,
  FormatBold,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight
} from "@mui/icons-material";

import AdminLayout from "../components/AdminLayout";
import { saveTemplate } from "../services/adminApi";

export default function TemplateDesigner() {
  const [searchParams] = useSearchParams();
  const currentActivity = searchParams.get("activity") || "";
  const currentTemplateId = searchParams.get("templateId") || "";
  const currentPrefix = searchParams.get("prefix") || "CERT";

  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const lastSelectedRef = useRef(null);

  const history = useRef([]);
  const redoStack = useRef([]);

  const [fontSize, setFontSize] = useState(34);
  const [fontFamily, setFontFamily] = useState("Prompt");
  const [color, setColor] = useState("#000000");
  const [isBold, setIsBold] = useState(false);
  const [textAlign, setTextAlign] = useState("left");
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);

  /**********************
   * Helper: Update Active Text
   **********************/
  function updateActiveText(props) {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const active = canvas.getActiveObject() || lastSelectedRef.current;
    if (!active) return;

    if (active.type === "textbox" || active.type === "text" || active.type === "i-text" || active.text !== undefined) {
      if (active.styles) active.styles = {};
      if (props.fontSize) {
        // If scaled, normalize scale so fontSize is true
        active.set({ ...props, scaleX: 1, scaleY: 1 });
      } else {
        active.set(props);
      }
      active.setCoords();
      canvas.setActiveObject(active);
      canvas.renderAll();
      canvas.requestRenderAll();
      saveHistory();
    }
  }

  function handleFontSizeChange(val) {
    const num = Math.max(10, Math.min(120, Number(val) || 12));
    setFontSize(num);
    updateActiveText({ fontSize: num });
  }

  function handleFontFamilyChange(val) {
    setFontFamily(val);
    updateActiveText({ fontFamily: val });
  }

  function handleColorChange(val) {
    setColor(val);
    updateActiveText({ fill: val });
  }

  function handleAlignChange(val) {
    setTextAlign(val);
    updateActiveText({ textAlign: val });
  }

  function handleBoldToggle() {
    const next = !isBold;
    setIsBold(next);
    updateActiveText({ fontWeight: next ? "bold" : "normal" });
  }

  /**********************
   * Create Canvas
   **********************/
  useEffect(() => {

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 1123,
      height: 794,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true
    });

    fabricRef.current = canvas;

    drawGrid();
    saveHistory();

    // โหลดภาพพื้นหลังจากโฟลเดอร์ /cer/ ตามชื่องาน
    const bgKey = (currentActivity || "default").trim().toLowerCase();
    const bgUrl = `/cer/${bgKey}.png`;

    fabric.FabricImage.fromURL(bgUrl, { crossOrigin: "anonymous" })
      .then(img => {
        img.scaleToWidth(1123);
        img.scaleToHeight(794);
        canvas.backgroundImage = img;
        canvas.renderAll();
        saveHistory();
      })
      .catch(err => {
        console.warn("ไม่พบภาพพื้นหลัง:", bgUrl, err);
      });

    // Load saved text objects
    const saved = (currentActivity && localStorage.getItem(`template_${currentActivity.trim()}`)) || localStorage.getItem("autosave-template");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.objects)) {
          parsed.objects.filter(o => !o.grid && o.text).forEach(o => {
            const t = new fabric.Textbox(o.text || "", {
              left: o.left || 300,
              top: o.top || 300,
              width: o.width || 500,
              fontSize: o.fontSize || 34,
              fontFamily: o.fontFamily || "Prompt",
              fill: o.fill || "#000000",
              textAlign: o.textAlign || "center",
              fontWeight: o.fontWeight || "normal"
            });
            canvas.add(t);
          });
          canvas.renderAll();
        }
      } catch (e) {
        console.log("Load saved objects notice:", e);
      }
    }

    function syncSelection(e) {
      const active = e.selected?.[0] || canvas.getActiveObject();
      if (active && (active.type === "textbox" || active.type === "text" || active.type === "i-text" || active.text !== undefined)) {
        lastSelectedRef.current = active;
        if (active.fontSize) setFontSize(Math.round(active.fontSize));
        if (active.fontFamily) setFontFamily(active.fontFamily);
        if (active.fill) setColor(typeof active.fill === "string" ? active.fill : "#000000");
        if (active.textAlign) setTextAlign(active.textAlign);
        if (active.fontWeight) setIsBold(active.fontWeight === "bold" || Number(active.fontWeight) >= 700);
        setPosX(Math.round(active.left || 0));
        setPosY(Math.round(active.top || 0));
      } else {
        setPosX(0);
        setPosY(0);
      }
    }

    canvas.on("selection:created", syncSelection);
    canvas.on("selection:updated", syncSelection);
    canvas.on("selection:cleared", () => {
      setPosX(0);
      setPosY(0);
    });

    canvas.on("mouse:down", (opt) => {
      if (opt.target && (opt.target.type === "textbox" || opt.target.type === "text" || opt.target.type === "i-text" || opt.target.text !== undefined)) {
        lastSelectedRef.current = opt.target;
        setPosX(Math.round(opt.target.left || 0));
        setPosY(Math.round(opt.target.top || 0));
      }
    });

    canvas.on("object:moving", (e) => {
      if (e.target) {
        setPosX(Math.round(e.target.left || 0));
        setPosY(Math.round(e.target.top || 0));
      }
    });

    canvas.on("object:added", saveHistory);
    canvas.on("object:modified", (e) => {
      if (e.target) {
        setPosX(Math.round(e.target.left || 0));
        setPosY(Math.round(e.target.top || 0));
      }
      saveHistory();
    });

    return () => canvas.dispose();

  }, []);

  /**********************
   * Auto Save
   **********************/
  useEffect(() => {

    const timer = setInterval(() => {

      if (!fabricRef.current) return;

      const jsonStr = JSON.stringify(fabricRef.current.toJSON());
      localStorage.setItem("autosave-template", jsonStr);
      if (currentActivity) {
        localStorage.setItem(`template_${currentActivity.trim()}`, jsonStr);
      }

    }, 3000);

    return () => clearInterval(timer);

  }, [currentActivity]);

  /**********************
   * Grid
   **********************/
  function drawGrid() {

    const canvas = fabricRef.current;

    if (!canvas) return;

    canvas.getObjects()
      .filter(o => o.grid)
      .forEach(o => canvas.remove(o));

    for (let x = 0; x <= 1123; x += 50) {

      canvas.add(new fabric.Line(
        [x, 0, x, 794],
        {
          stroke: "#eeeeee",
          selectable: false,
          evented: false,
          grid: true
        }
      ));

    }

    for (let y = 0; y <= 794; y += 50) {

      canvas.add(new fabric.Line(
        [0, y, 1123, y],
        {
          stroke: "#eeeeee",
          selectable: false,
          evented: false,
          grid: true
        }
      ));

    }

    canvas.renderAll();

  }

  /**********************
   * History
   **********************/
  function saveHistory() {

    if (!fabricRef.current) return;

    history.current.push(
      JSON.stringify(fabricRef.current.toJSON())
    );

    if (history.current.length > 30) {
      history.current.shift();
    }

  }

  function undo() {

    if (history.current.length < 2) return;

    const canvas = fabricRef.current;

    redoStack.current.push(history.current.pop());

    canvas.loadFromJSON(
      history.current[history.current.length - 1],
      () => canvas.renderAll()
    );

  }

  function redo() {

    if (!redoStack.current.length) return;

    const canvas = fabricRef.current;

    const json = redoStack.current.pop();

    history.current.push(json);

    canvas.loadFromJSON(json, () => canvas.renderAll());

  }

  /**********************
   * Text Handlers (Real-time update)
   **********************/
  function addText(text) {

    const canvas = fabricRef.current;
    if (!canvas) return;

    const obj = new fabric.Textbox(text, {
      left: 220,
      top: 180,
      width: 650,
      fontSize,
      fill: color,
      fontFamily,
      textAlign,
      fontWeight: isBold ? "bold" : "normal"
    });

    canvas.add(obj);
    canvas.setActiveObject(obj);
    lastSelectedRef.current = obj;
    canvas.renderAll();

  }

  function updateSelected() {
    updateActiveText({
      fontSize,
      fill: color,
      fontFamily,
      textAlign,
      fontWeight: isBold ? "bold" : "normal"
    });
  }

  function deleteSelected() {

    const canvas = fabricRef.current;
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    if (activeObjects && activeObjects.length) {
      activeObjects.forEach(obj => {
        if (!obj.grid) canvas.remove(obj);
      });
      canvas.discardActiveObject();
      lastSelectedRef.current = null;
      canvas.renderAll();
      saveHistory();
    }

  }

  function clearAll() {

    if (!confirm("ต้องการลบข้อความและตัวแปรทั้งหมดใช่หรือไม่?")) return;

    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.getObjects().filter(o => !o.grid).forEach(o => canvas.remove(o));
    canvas.discardActiveObject();
    lastSelectedRef.current = null;
    canvas.renderAll();
    saveHistory();

  }

  // Keyboard shortcut (Delete / Backspace)
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Delete" || e.key === "Backspace") {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const active = canvas.getActiveObject();
        if (active && !active.isEditing) {
          deleteSelected();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /**********************
   * Background — ดึงจาก /cer/ เท่านั้น (ไม่มีการอัปโหลดแล้ว)
   **********************/

  /**********************
   * Preview
   **********************/
  function previewTemplate() {

    fabricRef.current?.renderAll();

  }

  /**********************
   * Download Helper
   **********************/
  function download(url, name) {

    const a = document.createElement("a");

    a.href = url;
    a.download = name;

    a.click();

  }

  /**********************
   * Export
   **********************/
  function exportPNG() {

    const url = fabricRef.current.toDataURL({
      format: "png",
      multiplier: 2
    });

    download(url, "certificate.png");

  }

  function exportJPEG() {

    const url = fabricRef.current.toDataURL({
      format: "jpeg",
      multiplier: 2
    });

    download(url, "certificate.jpg");

  }

  function exportPDF() {

    const url = fabricRef.current.toDataURL({
      format: "png",
      multiplier: 2
    });

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [1123, 794]
    });

    pdf.addImage(url, "PNG", 0, 0, 1123, 794);

    pdf.save("certificate.pdf");

  }

  /**********************
   * Save Template
   **********************/
  async function saveCurrentTemplate() {

    const activity = prompt("กรุณาระบุชื่อกิจกรรมสำหรับ Template นี้:", currentActivity || "กิจกรรมทั่วไป");
    if (!activity) return;

    const prefix = prompt("กรุณาระบุ Prefix เลขที่เกียรติบัตร (เช่น CERT, SCI):", currentPrefix || "CERT");
    if (!prefix) return;

    try {

      // Extract lightweight layout objects (avoiding massive base64 images that exceed GAS payload limits)
      const canvasObjects = fabricRef.current.getObjects().filter(o => !o.grid).map(o => ({
        type: o.type,
        text: o.text,
        left: o.left,
        top: o.top,
        fontSize: o.fontSize,
        fontFamily: o.fontFamily,
        fill: o.fill,
        textAlign: o.textAlign,
        fontWeight: o.fontWeight,
        width: o.width
      }));

      const lightweightJson = JSON.stringify({ objects: canvasObjects });
      const fullCanvasJson = JSON.stringify(fabricRef.current.toJSON());

      // Save to localStorage for instant local preview
      localStorage.setItem(`template_${activity.trim()}`, lightweightJson);
      localStorage.setItem("autosave-template", fullCanvasJson);

      // Send metadata to Google Apps Script
      await saveTemplate({
        activity: activity.trim(),
        prefix: prefix.trim(),
        templateId: currentTemplateId || ("designer-" + Date.now()),
        json: lightweightJson
      });

      alert("บันทึก Template สำเร็จเรียบร้อยแล้ว!");

    } catch (err) {

      console.error("Save template error:", err);
      alert("บันทึกการจัดวาง Template เรียบร้อยแล้ว (บันทึกในระบบเบราว์เซอร์)");

    }

  }

  return (

    <AdminLayout>

      <Box>

        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              🎨 Template Designer
            </Typography>
            {currentActivity && (
              <Typography variant="body2" color="text.secondary">
                กำลังออกแบบ Template สำหรับ: <strong>{currentActivity}</strong> (Prefix: {currentPrefix})
              </Typography>
            )}
          </Box>
        </Stack>

        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={3}
        >

          {/* Tools Panel */}
          <Paper sx={{ p: 2.5, width: { xs: "100%", lg: 320 }, borderRadius: 3 }}>

            <Stack spacing={2}>

              <Typography variant="h6" fontWeight={700}>
                เครื่องมือ
              </Typography>

              <Box p={1.5} sx={{ bgcolor: "#f8fafc", borderRadius: 2, border: "1px dashed #cbd5e1" }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  พื้นหลังปัจจุบัน (โหลดจาก /cer/):
                </Typography>
                <Typography variant="subtitle2" fontWeight={700} color="primary">
                  {currentActivity ? `/cer/${currentActivity}.png` : "ไม่ได้ระบุชื่องาน (ใช้ค่าเริ่มต้น)"}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                  * นำไฟล์รูปไปวางในโฟลเดอร์ public/cer/
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={<TextFields />}
                onClick={() => addText("ข้อความ")}
              >
                เพิ่มข้อความ
              </Button>

              <Typography variant="subtitle2" fontWeight={700} color="primary" sx={{ mt: 1 }}>
                เพิ่มตัวแปร (คลิกเพื่อวาง)
              </Typography>

              <Stack direction="row" flexWrap="wrap" gap={1}>
                {[
                  "{{NAME}}",
                  "{{CERT_NO}}",
                  "{{SCHOOL}}",
                  "{{ACTIVITY}}",
                  "{{YEAR}}"
                ].map(v => (
                  <Button
                    key={v}
                    size="small"
                    variant="outlined"
                    onClick={() => addText(v)}
                    sx={{ fontWeight: 600 }}
                  >
                    {v}
                  </Button>
                ))}
              </Stack>

              <Divider sx={{ my: 1 }} />

              <Typography variant="subtitle2" fontWeight={700} color="primary">
                จัดรูปแบบข้อความที่เลือก
              </Typography>

              {/* Font Family */}
              <FormControl fullWidth size="small">
                <InputLabel>ฟอนต์</InputLabel>
                <Select
                  value={fontFamily}
                  label="ฟอนต์"
                  onChange={e => handleFontFamilyChange(e.target.value)}
                >
                  <MenuItem value="Prompt">Prompt</MenuItem>
                  <MenuItem value="Sarabun">Sarabun</MenuItem>
                  <MenuItem value="Kanit">Kanit</MenuItem>
                  <MenuItem value="Chakra Petch">Chakra Petch</MenuItem>
                  <MenuItem value="Mitr">Mitr</MenuItem>
                </Select>
              </FormControl>

              {/* Font Size with + / - and Slider */}
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Typography variant="body2" fontWeight={600}>
                    ขนาดตัวอักษร:
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <IconButton
                      size="small"
                      onClick={() => handleFontSizeChange(fontSize - 2)}
                      sx={{ border: "1px solid #ccc", p: 0.5 }}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{
                        minWidth: 36,
                        textAlign: "center",
                        bgcolor: "#f1f5f9",
                        py: 0.3,
                        px: 0.8,
                        borderRadius: 1
                      }}
                    >
                      {fontSize}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleFontSizeChange(fontSize + 2)}
                      sx={{ border: "1px solid #ccc", p: 0.5 }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>

                <Slider
                  value={fontSize}
                  min={12}
                  max={100}
                  size="small"
                  valueLabelDisplay="auto"
                  onChange={(e, v) => handleFontSizeChange(v)}
                />

                {/* Quick Font Size Presets */}
                <Stack direction="row" spacing={0.8} mt={0.5}>
                  {[20, 26, 34, 42, 54].map(sz => (
                    <Chip
                      key={sz}
                      label={`${sz}`}
                      size="small"
                      clickable
                      color={fontSize === sz ? "primary" : "default"}
                      onClick={() => handleFontSizeChange(sz)}
                      sx={{ fontWeight: 600 }}
                    />
                  ))}
                </Stack>
              </Box>

              {/* Font Color */}
              <Box>
                <Typography variant="body2" fontWeight={600} mb={0.8}>
                  สีข้อความ:
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    type="color"
                    size="small"
                    value={color}
                    onChange={e => handleColorChange(e.target.value)}
                    sx={{ width: 60, height: 40, p: 0, cursor: "pointer" }}
                  />
                  {/* Quick Color Palette */}
                  <Stack direction="row" spacing={0.8}>
                    {[
                      { c: "#000000", tip: "ดำ" },
                      { c: "#0D47A1", tip: "น้ำเงิน" },
                      { c: "#B8860B", tip: "ทอง" },
                      { c: "#C0392B", tip: "แดง" },
                      { c: "#FFFFFF", tip: "ขาว" }
                    ].map(item => (
                      <Box
                        key={item.c}
                        onClick={() => handleColorChange(item.c)}
                        sx={{
                          width: 26,
                          height: 26,
                          bgcolor: item.c,
                          borderRadius: "50%",
                          cursor: "pointer",
                          border: color.toUpperCase() === item.c.toUpperCase() ? "2.5px solid #1976d2" : "1px solid #ccc",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                        }}
                      />
                    ))}
                  </Stack>
                </Stack>
              </Box>

              {/* Text Align & Bold */}
              <Stack direction="row" spacing={1}>
                <ButtonGroup size="small" variant="outlined" sx={{ flex: 1 }}>
                  <Button
                    variant={textAlign === "left" ? "contained" : "outlined"}
                    onClick={() => handleAlignChange("left")}
                  >
                    <FormatAlignLeft fontSize="small" />
                  </Button>
                  <Button
                    variant={textAlign === "center" ? "contained" : "outlined"}
                    onClick={() => handleAlignChange("center")}
                  >
                    <FormatAlignCenter fontSize="small" />
                  </Button>
                  <Button
                    variant={textAlign === "right" ? "contained" : "outlined"}
                    onClick={() => handleAlignChange("right")}
                  >
                    <FormatAlignRight fontSize="small" />
                  </Button>
                </ButtonGroup>
                <Button
                  size="small"
                  variant={isBold ? "contained" : "outlined"}
                  onClick={handleBoldToggle}
                >
                  <FormatBold fontSize="small" />
                </Button>
              </Stack>

              {/* Coordinates Info */}
              <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: 2, border: "1px dashed #cbd5e1", mt: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
                  พิกัดตำแหน่ง (X, Y)
                </Typography>
                <Stack direction="row" spacing={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">X (ซ้าย-ขวา): </Typography>
                    <Typography variant="body2" fontWeight={700} color="primary" component="span">{posX}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Y (บน-ล่าง): </Typography>
                    <Typography variant="body2" fontWeight={700} color="primary" component="span">{posY}</Typography>
                  </Box>
                </Stack>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Button
                variant="contained"
                color="error"
                startIcon={<Delete />}
                onClick={deleteSelected}
              >
                ลบข้อความที่เลือก (Del)
              </Button>

              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteSweep />}
                onClick={clearAll}
              >
                ล้างตัวแปรทั้งหมด
              </Button>

              <Divider />

              <Stack direction="row" spacing={1}>

                <IconButton onClick={undo}>
                  <Undo />
                </IconButton>

                <IconButton onClick={redo}>
                  <Redo />
                </IconButton>

                <IconButton onClick={drawGrid}>
                  <GridOn />
                </IconButton>

              </Stack>

              <Button
                variant="contained"
                color="secondary"
                startIcon={<Preview />}
                onClick={previewTemplate}
              >
                Preview
              </Button>

              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={exportPNG}
              >
                Export PNG
              </Button>

              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={exportJPEG}
              >
                Export JPEG
              </Button>

              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={exportPDF}
              >
                Export PDF
              </Button>

              <Button
                variant="outlined"
                startIcon={<Save />}
                onClick={saveCurrentTemplate}
              >
                บันทึก Template
              </Button>

            </Stack>

          </Paper>

          {/* Canvas */}

          <Paper
            sx={{
              flex: 1,
              p: 2,
              borderRadius: 4,
              overflow: "auto"
            }}
          >

            <Box sx={{ overflow: "auto" }}>
              <canvas ref={canvasRef} />
            </Box>

          </Paper>

        </Stack>

      </Box>

    </AdminLayout>

  );

}