import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Stack,
  TextField
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";

import {
  getCertificates,
  deleteCertificates,
  generateOne
} from "../services/adminApi";

export default function DataGridTable({ onRefresh }) {

  const [rows, setRows] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [selection, setSelection] = useState([]);

  async function load(search = "") {

    const res = await getCertificates(1, 1000, search);

    setRows((res.data || []).map(r => ({
      id: r.row,
      ...r
    })));

  }

  useEffect(() => {

    load();

  }, []);

  async function remove() {

    if (!selection.length) return;

    if (!confirm("ยืนยันการลบ?")) return;

    await deleteCertificates(selection);

    await load(keyword);

    onRefresh && onRefresh();

  }

  const columns = [

    {
      field: "studentId",
      headerName: "รหัส",
      width: 120
    },

    {
      field: "name",
      headerName: "ชื่อ",
      flex: 1
    },

    {
      field: "activity",
      headerName: "กิจกรรม",
      width: 180
    },

    {
      field: "certNo",
      headerName: "เลขที่",
      width: 170
    },

    {
      field: "status",
      headerName: "สถานะ",
      width: 120
    },

    {
      field: "action",
      headerName: "จัดการ",
      width: 220,

      renderCell: ({ row }) => (

        <Stack direction="row" spacing={1}>

          <Button
            size="small"
            onClick={() => generateOne(row.studentId)}
          >
            สร้าง
          </Button>

          {row.pdfId && (

            <Button
              size="small"
              onClick={() => window.open(
                `https://drive.google.com/file/d/${row.pdfId}/preview`
              )}
            >
              ดู
            </Button>

          )}

        </Stack>

      )

    }

  ];

  return (

    <Box>

      <Stack
        direction="row"
        spacing={1}
        mb={2}
      >

        <TextField
          size="small"
          placeholder="ค้นหา"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />

        <Button
          variant="contained"
          onClick={() => load(keyword)}
        >
          ค้นหา
        </Button>

        <Button
          color="error"
          variant="contained"
          onClick={remove}
        >
          ลบ
        </Button>

      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        checkboxSelection
        pageSizeOptions={[10, 20, 50]}
        onRowSelectionModelChange={setSelection}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10
            }
          }
        }}
        sx={{ minHeight: 520 }}
      />

    </Box>

  );

}