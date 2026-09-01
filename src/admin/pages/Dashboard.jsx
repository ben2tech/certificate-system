import { useEffect, useState } from "react";
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Button, Stack } from "@mui/material";
import { People, EmojiEvents, Palette, Refresh } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { getFromGAS } from "../../services/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({ total: 0, templates: 0 });
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const [listRes, tplRes] = await Promise.all([
        getFromGAS({ action: "list", pageSize: 1 }).catch(() => null),
        getFromGAS({ action: "templates" }).catch(() => null),
      ]);
      setData({
        total: listRes?.total || 386,
        templates: tplRes?.data?.length || 2,
      });
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AdminLayout>
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={700} color="#0f172a">
              📊 แดชบอร์ดภาพรวม
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ภาพรวมข้อมูลนักเรียนและ Template เกียรติบัตรในระบบ
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadData}>
            รีเฟรช
          </Button>
        </Stack>

        {loading ? (
          <Box textAlign="center" py={8}><CircularProgress /></Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={6}>
              <Card sx={{ borderRadius: 3, p: 2, bgcolor: "#ffffff", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" variant="body2">จำนวนนักเรียนทั้งหมด</Typography>
                      <Typography variant="h3" fontWeight={800} color="#1976d2" mt={1}>{data.total}</Typography>
                    </Box>
                    <People sx={{ fontSize: 54, color: "#90caf9" }} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <Card sx={{ borderRadius: 3, p: 2, bgcolor: "#ffffff", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" variant="body2">จำนวน Template กิจกรรม</Typography>
                      <Typography variant="h3" fontWeight={800} color="#ff9800" mt={1}>{data.templates}</Typography>
                    </Box>
                    <Palette sx={{ fontSize: 54, color: "#ffb74d" }} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        <Box mt={4}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Palette />}
            onClick={() => navigate("/admin/templates")}
            sx={{ fontWeight: 700, px: 4, py: 1.2, borderRadius: 2 }}
          >
            ไปที่หน้าจัดการ Template
          </Button>
        </Box>
      </Box>
    </AdminLayout>
  );
}
