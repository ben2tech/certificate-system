import { useEffect, useRef, useState } from "react";
import { Canvas, Textbox, FabricImage, Line } from "fabric";
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
  TextField
} from "@mui/material";

import {
  Undo,
  Redo,
  Save,
  Download,
  GridOn,
  TextFields,
  Image as ImageIcon,
  Preview
} from "@mui/icons-material";

import { saveTemplate } from "../services/adminApi";
import ExportDialog from "../components/ExportDialog";

import {
exportPNG,
exportJPEG,
exportPDF
} from "../utils/exportEngine";

const SAMPLE = {
  NAME: "สมชาย ใจดี",
  SCHOOL: "โรงเรียนเบญจมราชรังสฤษฎิ์ ๒",
  ACTIVITY: "วันวิทยาศาสตร์",
  YEAR: "2569",
  CERT_NO: "SCI-2569-00001"
};

export default function TemplateDesigner() {

  const canvasRef = useRef(null);
  const fabricRef = useRef(null);

  const history = useRef([]);
  const redoStack = useRef([]);

  const [fontSize, setFontSize] = useState(34);
  const [fontFamily, setFontFamily] = useState("Prompt");
  const [color, setColor] = useState("#000000");
  const [exportOpen,setExportOpen]=useState(false);

  /* ---------- สร้าง Canvas ---------- */

  useEffect(() => {

    const canvas = new Canvas(canvasRef.current, {
      width: 1123,
      height: 794,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true
    });

    fabricRef.current = canvas;

    drawGrid();

    history.current.push(JSON.stringify(canvas.toJSON()));

    canvas.on("object:modified", saveHistory);
    canvas.on("object:added", saveHistory);

    return () => canvas.dispose();

  }, []);

  /* ---------- Auto Save ---------- */

  useEffect(() => {

    const timer = setInterval(() => {

      if (!fabricRef.current) return;

      localStorage.setItem(
        "autosave-template",
        JSON.stringify(fabricRef.current.toJSON())
      );

    }, 5000);

    return () => clearInterval(timer);

  }, []);

  /* ---------- Grid ---------- */

  function drawGrid() {

    const canvas = fabricRef.current;
    if (!canvas) return;

    for (let i = 0; i < 1123; i += 50) {

      canvas.add(new Line([i, 0, i, 794], {
        stroke: "#eeeeee",
        selectable: false,
        evented: false
      }));

    }

    for (let i = 0; i < 794; i += 50) {

      canvas.add(new Line([0, i, 1123, i], {
        stroke: "#eeeeee",
        selectable: false,
        evented: false
      }));

    }

    canvas.sendObjectToBack(canvas.getObjects()[0]);

  }

  /* ---------- History ---------- */

  function saveHistory() {

    const canvas = fabricRef.current;

    history.current.push(JSON.stringify(canvas.toJSON()));

    if (history.current.length > 30) {
      history.current.shift();
    }

  }

  function undo() {

    if (history.current.length < 2) return;

    const canvas = fabricRef.current;

    redoStack.current.push(history.current.pop());

    canvas.loadFromJSON(
      history.current[history.current.length - 1]
    ).then(() => canvas.renderAll());

  }

  function redo() {

    if (!redoStack.current.length) return;

    const canvas = fabricRef.current;

    const json = redoStack.current.pop();

    history.current.push(json);

    canvas.loadFromJSON(json).then(() => canvas.renderAll());

  }

  /* ---------- เพิ่มข้อความ ---------- */

  function addText(text) {

    const canvas = fabricRef.current;

    const obj = new Textbox(text, {
      left: 180,
      top: 180,
      width: 700,
      fontSize,
      fill: color,
      fontFamily
    });

    canvas.add(obj);
    canvas.setActiveObject(obj);

  }

  /* ---------- เปลี่ยนพื้นหลัง ---------- */

  function uploadBackground(e) {

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async () => {

      const img = await FabricImage.fromURL(reader.result);

      img.scaleToWidth(1123);
      img.scaleToHeight(794);

      fabricRef.current.backgroundImage = img;
      fabricRef.current.renderAll();

    };

    reader.readAsDataURL(file);

  }

  /* ---------- แก้ข้อความ ---------- */

  function updateSelected() {

    const canvas = fabricRef.current;
    const obj = canvas.getActiveObject();

    if (!obj) return;

    obj.set({
      fontSize,
      fill: color,
      fontFamily
    });

    canvas.renderAll();

  }

  /* ---------- Preview ---------- */

  function preview() {

    const canvas = fabricRef.current;

    canvas.getObjects().forEach(obj => {

      if (obj.text) {

        obj.text = obj.text
          .replaceAll("{{NAME}}", SAMPLE.NAME)
          .replaceAll("{{SCHOOL}}", SAMPLE.SCHOOL)
          .replaceAll("{{ACTIVITY}}", SAMPLE.ACTIVITY)
          .replaceAll("{{YEAR}}", SAMPLE.YEAR)
          .replaceAll("{{CERT_NO}}", SAMPLE.CERT_NO);

      }

    });

    canvas.renderAll();

  }

  /* ---------- Export ---------- */

  function exportPNG() {

    const url = fabricRef.current.toDataURL({
      format: "png",
      quality: 1
    });

    const a = document.createElement("a");
    a.href = url;
    a.download = "certificate-template.png";
    a.click();

  }

  /* ---------- Save ---------- */

  async function saveCurrentTemplate() {

    const json = JSON.stringify(fabricRef.current.toJSON());

    try {

      await saveTemplate({
        activity: "วันวิทยาศาสตร์",
        prefix: "SCI",
        templateId: "designer-" + Date.now(),
        json
      });

      alert("บันทึกลง Google Sheets แล้ว");

    } catch (err) {

      alert(err.message);

    }

  }

  return (

    <Box>

      <Typography variant="h4" fontWeight={700} color="primary" mb={3}>
        🎨 Template Designer
      </Typography>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={3}>

        {/* Toolbar */}

        <Paper sx={{ width: { lg: 320 }, p: 2, borderRadius: 4 }}>

          <Typography fontWeight={700}>เครื่องมือ</Typography>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={2}>

            <Button
              component="label"
              variant="outlined"
              startIcon={<ImageIcon />}
            >
              พื้นหลัง
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={uploadBackground}
              />
            </Button>

            <Button
            variant="contained"
            startIcon={<Download/>}
            onClick={()=>setExportOpen(true)}
            >
            Export
            </Button>

            <Typography variant="subtitle2">ตัวแปร</Typography>

            {[
              "{{NAME}}",
              "{{SCHOOL}}",
              "{{ACTIVITY}}",
              "{{YEAR}}",
              "{{CERT_NO}}"
            ].map(v => (

              <Button
                key={v}
                size="small"
                variant="outlined"
                onClick={() => addText(v)}
              >
                {v}
              </Button>

            ))}

            <Divider />

            <FormControl fullWidth>

              <InputLabel>ฟอนต์</InputLabel>

              <Select
                value={fontFamily}
                label="ฟอนต์"
                onChange={e => setFontFamily(e.target.value)}
              >

                <MenuItem value="Prompt">Prompt</MenuItem>
                <MenuItem value="Sarabun">Sarabun</MenuItem>
                <MenuItem value="Kanit">Kanit</MenuItem>

              </Select>

            </FormControl>

            <Typography>ขนาด {fontSize}</Typography>

            <Slider
              value={fontSize}
              min={16}
              max={80}
              onChange={(e, v) => setFontSize(v)}
            />

            <TextField
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
            />

            <Button variant="outlined" onClick={updateSelected}>
              ใช้กับข้อความที่เลือก
            </Button>

            <Divider />

            <Stack direction="row" spacing={1}>

              <IconButton onClick={undo}><Undo /></IconButton>
              <IconButton onClick={redo}><Redo /></IconButton>
              <IconButton onClick={drawGrid}><GridOn /></IconButton>

            </Stack>

            <Button
              variant="contained"
              color="secondary"
              startIcon={<Preview />}
              onClick={preview}
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
              variant="outlined"
              startIcon={<Save />}
              onClick={saveCurrentTemplate}
            >
              บันทึก Template
            </Button>

          </Stack>

        </Paper>

        {/* Canvas */}

        <Paper sx={{ flex: 1, p: 2, borderRadius: 4, overflow: "auto" }}>

          <canvas ref={canvasRef} />

        </Paper>

      </Stack>
<ExportDialog

open={exportOpen}

onClose={()=>setExportOpen(false)}

onPNG={()=>{

exportPNG(fabricRef.current);

setExportOpen(false);

}}

onJPEG={(q)=>{

exportJPEG(fabricRef.current,q);

setExportOpen(false);

}}

onPDF={()=>{

const element=canvasRef.current.parentElement;

exportPDF(element);

setExportOpen(false);

}}

/>
    </Box>

  );

}