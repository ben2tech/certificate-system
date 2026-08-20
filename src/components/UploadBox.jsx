import { useState } from "react";
import * as XLSX from "xlsx";
import {
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { importExcel } from "../services/adminApi";

export default function UploadBox({ onFinish }) {

  const [mode, setMode] = useState("append");
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function readFile(file) {

    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();

    if (!["xlsx","xls","csv"].includes(ext)) {
      alert("รองรับเฉพาะไฟล์ Excel (.xlsx/.xls/.csv)");
      return;
    }

    try {

      const buffer = await file.arrayBuffer();

      const wb = XLSX.read(buffer,{type:"array"});

      const ws = wb.Sheets[wb.SheetNames[0]];

      const data = XLSX.utils.sheet_to_json(ws,{defval:""});

      validate(data);

    } catch(err){

      console.error(err);

      alert("อ่านไฟล์ไม่สำเร็จ");

    }

  }

  function validate(data){

    const err=[];
    const ok=[];

    data.forEach((r,i)=>{

      if(!r.StudentID){

        err.push({
          row:i+2,
          message:"ไม่มี StudentID"
        });

        return;

      }

      if(!r.Name){

        err.push({
          row:i+2,
          message:"ไม่มี Name"
        });

        return;

      }

      ok.push(r);

    });

    setRows(ok);
    setErrors(err);

  }

  async function upload(){

    if(rows.length===0){

      alert("ไม่มีข้อมูลนำเข้า");

      return;

    }

    setLoading(true);

    try{

      const res = await importExcel(rows,mode);

      alert(
        `นำเข้าสำเร็จ ${res.imported} รายการ`
      );

      setRows([]);
      setErrors([]);

      onFinish && onFinish();

    }catch(err){

      alert(err.message);

    }

    setLoading(false);

  }

  function handleDrop(e){

    e.preventDefault();

    setDragging(false);

    readFile(e.dataTransfer.files[0]);

  }

  return(

    <Card
      sx={{
        borderRadius:4,
        overflow:"hidden"
      }}
    >

      <CardContent>

        <Typography
          variant="h6"
          fontWeight={700}
          mb={2}
        >
          📥 นำเข้ารายชื่อจาก Excel
        </Typography>

        <RadioGroup
          row
          value={mode}
          onChange={e=>setMode(e.target.value)}
        >

          <FormControlLabel
            value="append"
            control={<Radio/>}
            label="เพิ่มต่อท้าย"
          />

          <FormControlLabel
            value="replace"
            control={<Radio/>}
            label="แทนที่ทั้งหมด"
          />

        </RadioGroup>

        <Box
          onDragOver={e=>{
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={()=>{
            setDragging(false);
          }}
          onDrop={handleDrop}
          sx={{
            mt:2,
            p:5,
            textAlign:"center",
            border:"2px dashed",
            borderColor:dragging?"primary.main":"grey.400",
            borderRadius:3,
            background:dragging
              ?"rgba(25,118,210,.08)"
              :"transparent",
            transition:".2s"
          }}
        >

          <CloudUploadIcon
            sx={{
              fontSize:60,
              color:"primary.main"
            }}
          />

          <Typography mt={2}>
            ลากไฟล์ Excel มาวางที่นี่
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            mb={2}
          >
            รองรับ .xlsx .xls และ .csv
          </Typography>

          <Button
            component="label"
            variant="contained"
            startIcon={<UploadFileIcon/>}
          >

            เลือกไฟล์

            <input
              hidden
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={e=>readFile(e.target.files[0])}
            />

          </Button>

        </Box>

        {loading && (

          <Box mt={3}>

            <LinearProgress/>

            <Typography
              mt={1}
              textAlign="center"
            >
              กำลังนำเข้าข้อมูล...
            </Typography>

          </Box>

        )}

        {rows.length>0 && (

          <Box mt={3}>

            <Typography
              fontWeight={700}
              mb={1}
            >
              ตัวอย่างข้อมูล ({rows.length} รายการ)
            </Typography>

            <Table size="small">

              <TableHead>

                <TableRow>

                  <TableCell>StudentID</TableCell>
                  <TableCell>ชื่อ</TableCell>
                  <TableCell>กิจกรรม</TableCell>

                </TableRow>

              </TableHead>

              <TableBody>

                {rows.slice(0,5).map((r,i)=>(

                  <TableRow key={i}>

                    <TableCell>{r.StudentID}</TableCell>

                    <TableCell>{r.Name}</TableCell>

                    <TableCell>{r.Activity}</TableCell>

                  </TableRow>

                ))}

              </TableBody>

            </Table>

            {rows.length>5 && (

              <Typography
                variant="caption"
                display="block"
                mt={1}
              >
                แสดง 5 จาก {rows.length} รายการ
              </Typography>

            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{mt:3}}
              onClick={upload}
            >
              นำเข้าข้อมูล
            </Button>

          </Box>

        )}

        {errors.length>0 && (

          <Box mt={3}>

            <Typography
              fontWeight={700}
              color="error"
              mb={1}
            >
              พบข้อผิดพลาด {errors.length} รายการ
            </Typography>

            {errors.slice(0,10).map((e,i)=>(

              <Chip
                key={i}
                label={`แถว ${e.row} : ${e.message}`}
                color="error"
                sx={{mr:1,mb:1}}
              />

            ))}

            {errors.length>10 && (

              <Typography variant="caption">
                และอีก {errors.length-10} รายการ
              </Typography>

            )}

          </Box>

        )}

      </CardContent>

    </Card>

  );

}