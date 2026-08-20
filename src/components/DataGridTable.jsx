import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Typography
} from "@mui/material";

import {
  DataGrid,
  GridActionsCellItem
} from "@mui/x-data-grid";

import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import {
  getCertificates,
  deleteCertificates,
  generateOne,
  updateCertificate
} from "../services/adminApi";

export default function DataGridTable({
  onRefresh,
  onSelectionChange
}) {

  const [rows, setRows] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [selection, setSelection] = useState([]);
  const [loading, setLoading] = useState(false);

  /*************************************************
   * LOAD DATA
   *************************************************/

  async function load(search = keyword) {

    setLoading(true);

    try {

      const res = await getCertificates(1, 1000, search);

      setRows(
        (res.data || []).map(r => ({
          id: r.row,
          ...r
        }))
      );

    } catch (err) {

      alert(err.message);

    }

    setLoading(false);

  }

  useEffect(() => {
    load("");
  }, []);

  /*************************************************
   * DELETE
   *************************************************/

  async function handleDelete() {

    if (!selection.length) return;

    if (!confirm(`ลบ ${selection.length} รายการ?`)) return;

    try {

      await deleteCertificates(selection);

      await load();

      onRefresh && onRefresh();

    } catch (err) {

      alert(err.message);

    }

  }

  /*************************************************
   * GENERATE ONE
   *************************************************/

  async function handleGenerate(studentId) {

    try {

      await generateOne(studentId);

      await load();

      onRefresh && onRefresh();

    } catch (err) {

      alert(err.message);

    }

  }

  /*************************************************
   * INLINE EDIT
   *************************************************/

  async function processRowUpdate(newRow, oldRow) {

    try {

      await updateCertificate(newRow);

      const updatedRows = rows.map(r =>
        r.id === newRow.id ? newRow : r
      );

      setRows(updatedRows);

      onRefresh && onRefresh();

      return newRow;

    } catch (err) {

      alert("บันทึกไม่สำเร็จ");

      return oldRow;

    }

  }

  /*************************************************
   * COLUMNS
   *************************************************/

  const columns = useMemo(() => [

    {
      field: "studentId",
      headerName: "รหัส",
      width: 120
    },

    {
      field: "name",
      headerName: "ชื่อ-นามสกุล",
      flex: 1,
      minWidth: 220,
      editable: true
    },

    {
      field: "school",
      headerName: "โรงเรียน",
      flex: 1,
      minWidth: 170,
      editable: true
    },

    {
      field: "activity",
      headerName: "กิจกรรม",
      width: 180,
      editable: true
    },

    {
      field: "certNo",
      headerName: "เลขที่",
      width: 180
    },

    {
      field: "status",
      headerName: "สถานะ",
      width: 130,

      renderCell: ({ value }) => (

        <Chip
          size="small"
          label={value || "Pending"}
          color={
            value === "Completed"
              ? "success"
              : "warning"
          }
        />

      )

    },

    {
      field: "actions",
      type: "actions",
      headerName: "จัดการ",
      width: 150,

      getActions: ({ row }) => [

        <GridActionsCellItem
          icon={<AutoAwesomeIcon />}
          label="Generate"
          onClick={() => handleGenerate(row.studentId)}
        />,

        <GridActionsCellItem
          icon={<VisibilityIcon />}
          label="Preview"
          onClick={() => {

            if (row.pdfId) {

              window.open(
                `https://drive.google.com/file/d/${row.pdfId}/preview`,
                "_blank"
              );

            }

          }}
        />,

        <GridActionsCellItem
          icon={<DownloadIcon />}
          label="Download"
          onClick={() => {

            if (row.pdfId) {

              window.open(
                `https://drive.google.com/uc?export=download&id=${row.pdfId}`,
                "_blank"
              );

            }

          }}
        />

      ]

    }

  ], [rows]);

  /*************************************************
   * RENDER
   *************************************************/

  return (

    <Box
      className="glass"
      sx={{
        p: 2,
        borderRadius: 4
      }}
    >

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        mb={2}
      >

        <Typography variant="h6">
          รายชื่อผู้รับเกียรติบัตร
        </Typography>

        <Stack direction="row" spacing={1}>

          <TextField
            size="small"
            placeholder="ค้นหา..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") load();
            }}
          />

          <Button
            variant="contained"
            onClick={() => load()}
          >
            ค้นหา
          </Button>

          <Tooltip title="รีเฟรช">

            <IconButton onClick={() => load()}>

              <RefreshIcon />

            </IconButton>

          </Tooltip>

        </Stack>

      </Stack>

      {selection.length > 0 && (

        <Box
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: 2,
            background: "rgba(15,76,129,.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1
          }}
        >

          <Typography>
            เลือกแล้ว {selection.length} รายการ
          </Typography>

          <Button
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            ลบที่เลือก
          </Button>

        </Box>

      )}

      <DataGrid

        rows={rows}

        columns={columns}

        loading={loading}

        checkboxSelection

        disableRowSelectionOnClick

        pageSizeOptions={[10, 20, 50, 100]}

        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10
            }
          }
        }}

        processRowUpdate={processRowUpdate}

        onProcessRowUpdateError={(err) => {
          console.error(err);
        }}

        onRowSelectionModelChange={(ids) => {

          setSelection(ids);

          const selected = rows.filter(r => ids.includes(r.id));

          onSelectionChange && onSelectionChange(selected);

        }}

        sx={{
          minHeight: 560,
          border: "none",

          "& .MuiDataGrid-columnHeaders": {
            background: "#0F4C81",
            color: "#fff"
          },

          "& .MuiDataGrid-cell:focus": {
            outline: "none"
          },

          "& .MuiDataGrid-row:hover": {
            background: "rgba(25,118,210,.05)"
          }

        }}

      />

    </Box>

  );

}