import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
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
  TextField
} from "@mui/material";

import {
  Upload,
  Undo,
  Redo,
  Save,
  Download,
  GridOn,
  TextFields,
  Preview
} from "@mui/icons-material";

import { saveTemplate } from "../services/adminApi";

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

  /***********************
   * Canvas
   ***********************/
  useEffect(() => {

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 1123,
      height: 794,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true
    });

    fabricRef.current = canvas;

    drawGrid();

    const saved = localStorage.getItem("autosave-template");

    if (saved) {
      canvas.loadFromJSON(saved, () => canvas.renderAll());
    }

    saveHistory();

    canvas.on("object:modified", saveHistory);
    canvas.on("object:added", saveHistory);

    return () => canvas.dispose();

  }, []);

  /***********************
   * Auto Save
   ***********************/
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

  /***********************
   * Grid
   ***********************/
  function drawGrid() {

    const canvas = fabricRef.current;

    if (!canvas) return;

    const oldGrid = canvas.getObjects().filter(o => o.grid);

    oldGrid.forEach(o => canvas.remove(o));

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

  /***********************
   * History
   ***********************/
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

  /***********************
   * Text
   ***********************/
  function addText(text) {

    const canvas = fabricRef.current;

    const obj = new fabric.Textbox(text, {

      left: 220,
      top: 180,
      width: 650,

      fontSize,
      fill: color,
      fontFamily

    });

    canvas.add(obj);

    canvas.setActiveObject(obj);

  }

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

  /***********************
   * Background
   ***********************/
  function uploadBackground(e) {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {

      fabric.Image.fromURL(reader.result, img => {

        img.scaleToWidth(1123);
        img.scaleToHeight(794);

        fabricRef.current.setBackgroundImage(
          img,
          fabricRef.current.renderAll.bind(fabricRef.current)
        );

      });

    };

    reader.readAsDataURL(file);

  }

  /***********************
   * Preview
   ***********************/
  function previewTemplate() {

    const canvas = fabricRef.current;

    canvas.getObjects().forEach(obj => {

      if (!obj.text) return;

      obj.text = obj.text
        .replaceAll("{{NAME}}", SAMPLE.NAME)
        .replaceAll("{{SCHOOL}}", SAMPLE.SCHOOL)
        .replaceAll("{{ACTIVITY}}", SAMPLE.ACTIVITY)
        .replaceAll("{{YEAR}}", SAMPLE.YEAR)
        .replaceAll("{{CERT_NO}}", SAMPLE.CERT_NO);

    });

    canvas.renderAll();

  }

  /***********************
   * Export
   ***********************/
  function exportPNG() {

    const url = fabricRef.current.toDataURL({
      format: "png",
      quality: 1
    });

    download(url, "certificate.png");

  }

  function exportJPEG() {

    const url = fabricRef.current.toDataURL({
      format: "jpeg",
      quality: 1
    });

    download(url, "certificate.jpg");

  }

  function exportPDF() {

    const url = fabricRef.current.toDataURL({
      format: "png",
      quality: 1
    });

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [1123, 794]
    });

    pdf.addImage(url, "PNG", 0, 0, 1123, 794);

    pdf.save("certificate.pdf");

  }

  function download(url, name) {

    const a = document.createElement("a");

    a.href = url;
    a.download = name;

    a.click();

  }

  /***********************
   * Save Template
   ***********************/
  async function saveCurrentTemplate() {

    try {

      await saveTemplate({

        activity: "วันวิทยาศาสตร์",
        prefix: "SCI",
        templateId: "designer-" + Date.now(),

        json: JSON.stringify(
          fabricRef.current.toJSON()
        )

      });

      alert("บันทึก Template สำเร็จ");

    } catch (err) {

      alert(err.message);

    }

  }

  return (

    <Box>

      <Typography
        variant="h4"
        fontWeight={700}
        mb={3}
      >
        🎨 Template Designer
      </Typography>

      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={3}
      >

        <Paper
          sx={{
            width: { lg: 320 },
            p: 2,
            borderRadius: 4
          }}
        >

          <Typography fontWeight={700}>
            เครื่องมือ
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={2}>

            <Button
              component="label"
              variant="outlined"
              startIcon={<Upload />}
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
              startIcon={<TextFields />}
              onClick={() => addText("ข้อความ")}
            >
              เพิ่มข้อความ
            </Button>

            {[
              "{{NAME}}",
              "{{SCHOOL}}",
              "{{ACTIVITY}}",
              "{{YEAR}}",
              "{{CERT_NO}}"
            ].map(v => (

              <Button
                key={v}
                variant="outlined"
                size="small"
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
                onChange={(e) => setFontFamily(e.target.value)}
              >

                <MenuItem value="Prompt">Prompt</MenuItem>
                <MenuItem value="Sarabun">Sarabun</MenuItem>
                <MenuItem value="Kanit">Kanit</MenuItem>

              </Select>

            </FormControl>

            <Typography>
              ขนาด {fontSize}
            </Typography>

            <Slider
              value={fontSize}
              min={16}
              max={80}
              onChange={(e, v) => setFontSize(v)}
            />

            <TextField
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />

            <Button
              variant="outlined"
              onClick={updateSelected}
            >
              ใช้กับข้อความที่เลือก
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

        <Paper
          sx={{
            flex: 1,
            p: 2,
            borderRadius: 4,
            overflow: "auto"
          }}
        >

          <canvas ref={canvasRef} />

        </Paper>

      </Stack>

    </Box>

  );

}