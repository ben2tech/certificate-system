import { useState } from "react";
import {
  Paper,
  Typography,
  Button,
  Stack
} from "@mui/material";

import * as XLSX from "xlsx";
import { importExcel } from "../services/adminApi";

export default function UploadBox({ onFinish }) {

  const [loading, setLoading] = useState(false);

  async function upload(e) {

    const file = e.target.files[0];

    if (!file) return;

    setLoading(true);

    try {

      const buffer = await file.arrayBuffer();

      const wb = XLSX.read(buffer);

      const sheet = wb.Sheets[wb.SheetNames[0]];

      const rows = XLSX.utils.sheet_to_json(sheet);

      await importExcel({ rows });

      alert("นำเข้าข้อมูลสำเร็จ");

      onFinish && onFinish();

    } catch {

      alert("นำเข้าไม่สำเร็จ");

    }

    setLoading(false);

  }

  return (

    <Paper sx={{ p: 3 }}>

      <Typography
        variant="h6"
        mb={2}
      >
        นำเข้า Excel
      </Typography>

      <Stack spacing={2}>

        <Button
          component="label"
          variant="contained"
          disabled={loading}
        >
          {loading ? "กำลังนำเข้า..." : "เลือกไฟล์ Excel"}

          <input
            hidden
            type="file"
            accept=".xlsx,.xls"
            onChange={upload}
          />

        </Button>

      </Stack>

    </Paper>

  );

}