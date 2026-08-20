import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Divider,
  Chip
} from "@mui/material";

import {
  AutoAwesome,
  People,
  CheckCircle,
  Pending,
  Description,
  Archive
} from "@mui/icons-material";

import UploadBox from "../components/UploadBox";
import DataGridTable from "../components/DataGridTable";

import { downloadZip } from "../utils/zipDownload";

import {
  getDashboard,
  generateAll
} from "../services/adminApi";

export default function Admin() {

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  /*************************************************
   * LOAD DASHBOARD
   *************************************************/
  async function loadDashboard() {

    setLoading(true);

    try {

      const data = await getDashboard();

      setDashboard(data);

    } catch (err) {

      console.error(err);

      alert("โหลด Dashboard ไม่สำเร็จ");

    }

    setLoading(false);

  }

  useEffect(() => {
    loadDashboard();
  }, []);

  /*************************************************
   * GENERATE ALL
   *************************************************/
  async function generateAllCertificates() {

    if (!confirm("ต้องการสร้างเกียรติบัตรทั้งหมดใช่หรือไม่?")) return;

    setGenerating(true);

    try {

      const result = await generateAll();

      alert(`สร้างเกียรติบัตรสำเร็จ ${result.created} รายการ`);

      await loadDashboard();

    } catch (err) {

      alert(err.message);

    }

    setGenerating(false);

  }

  /*************************************************
   * DOWNLOAD ZIP
   *************************************************/
  async function downloadSelectedZip(rows) {

    const files = rows
      .filter(r => r.pdfId)
      .map(r => ({
        name: `${r.certNo}.pdf`,
        url: `https://drive.google.com/uc?export=download&id=${r.pdfId}`
      }));

    if (!files.length) {

      alert("ไม่มีไฟล์ PDF ให้ดาวน์โหลด");

      return;

    }

    await downloadZip(files);

  }

  if (loading) {

    return (

      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >

        <CircularProgress />

      </Box>

    );

  }

  const cards = [

    {
      title: "ทั้งหมด",
      value: dashboard.total,
      color: "#1976D2",
      icon: <People sx={{ fontSize: 40 }} />
    },

    {
      title: "สร้างแล้ว",
      value: dashboard.completed,
      color: "#2E7D32",
      icon: <CheckCircle sx={{ fontSize: 40 }} />
    },

    {
      title: "รอดำเนินการ",
      value: dashboard.pending,
      color: "#EF6C00",
      icon: <Pending sx={{ fontSize: 40 }} />
    },

    {
      title: "Templates",
      value: dashboard.templates,
      color: "#8E24AA",
      icon: <Description sx={{ fontSize: 40 }} />
    }

  ];

  return (

    <Box>

      {/* HEADER */}

      <Box mb={4}>

        <Typography
          variant="h4"
          fontWeight={700}
          color="primary"
        >
          🏫 Admin Dashboard
        </Typography>

        <Typography color="text.secondary">
          ระบบจัดการเกียรติบัตรโรงเรียน
        </Typography>

      </Box>

      {/* DASHBOARD CARDS */}

      <Grid container spacing={3} mb={4}>

        {cards.map(card => (

          <Grid
            item
            xs={12}
            sm={6}
            md={3}
            key={card.title}
          >

            <Card
              sx={{
                background: card.color,
                color: "white",
                borderRadius: 4
              }}
            >

              <CardContent>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >

                  <Box>

                    <Typography variant="body2">
                      {card.title}
                    </Typography>

                    <Typography
                      variant="h4"
                      fontWeight={700}
                    >
                      {card.value}
                    </Typography>

                  </Box>

                  {card.icon}

                </Stack>

              </CardContent>

            </Card>

          </Grid>

        ))}

      </Grid>

      {/* ACTION CARD */}

      <Card
        sx={{
          mb: 4,
          borderRadius: 4
        }}
      >

        <CardContent>

          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={2}
          >

            <Box>

              <Typography variant="h6">
                สร้างเกียรติบัตร
              </Typography>

              <Typography color="text.secondary">
                สร้าง PDF ให้ผู้รับเกียรติบัตรที่ยังไม่สร้างทั้งหมด
              </Typography>

            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
            >

              <Button
                variant="outlined"
                startIcon={<Archive />}
                disabled={!selectedRows.length}
                onClick={() => downloadSelectedZip(selectedRows)}
              >
                ZIP ({selectedRows.length})
              </Button>

              <Button
                variant="contained"
                size="large"
                startIcon={<AutoAwesome />}
                onClick={generateAllCertificates}
                disabled={generating}
                sx={{
                  minWidth: 220,
                  height: 52
                }}
              >

                {generating
                  ? "กำลังสร้าง..."
                  : "สร้างเกียรติบัตรทั้งหมด"}

              </Button>

            </Stack>

          </Stack>

        </CardContent>

      </Card>

      {/* IMPORT EXCEL */}

      <Box mb={4}>

        <UploadBox onFinish={loadDashboard} />

      </Box>

      {/* DATA GRID */}

      <Box mb={4}>

        <DataGridTable
          onRefresh={loadDashboard}
          onSelectionChange={setSelectedRows}
        />

      </Box>

      {/* ACTIVITY SUMMARY */}

      <Card sx={{ borderRadius: 4 }}>

        <CardContent>

          <Typography
            variant="h6"
            gutterBottom
          >
            📈 สรุปตามกิจกรรม
          </Typography>

          <Divider sx={{ mb: 2 }} />

          {Object.keys(dashboard.activities || {}).length === 0 ? (

            <Typography color="text.secondary">
              ยังไม่มีกิจกรรม
            </Typography>

          ) : (

            <Grid container spacing={2}>

              {Object.entries(dashboard.activities).map(([name, count]) => (

                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={name}
                >

                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: 3,
                      height: "100%"
                    }}
                  >

                    <CardContent>

                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >

                        <Box>

                          <Typography
                            variant="body1"
                            fontWeight={600}
                          >
                            {name}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            ผู้ได้รับเกียรติบัตร
                          </Typography>

                        </Box>

                        <Chip
                          label={`${count} คน`}
                          color="primary"
                        />

                      </Stack>

                    </CardContent>

                  </Card>

                </Grid>

              ))}

            </Grid>

          )}

        </CardContent>

      </Card>

    </Box>

  );

}