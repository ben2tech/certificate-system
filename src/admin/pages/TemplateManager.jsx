import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, Grid, Button, Stack, CircularProgress, Chip } from "@mui/material";
import { Palette, Refresh } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { getFromGAS } from "../../services/api";

export default function TemplateManager() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadTemplates() {
    setLoading(true);
    try {
      const res = await getFromGAS({ action: "templates" });
      setTemplates(res.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  return (
    <AdminLayout>
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={700} color="#0f172a">
              🎨 จัดการ Template เกียรติบัตร
            </Typography>
            <Typography variant="body2" color="text.secondary">
              เลือกกิจกรรมเพื่อเปิดหน้าออกแบบตำแหน่งตัวอักษรบนภาพพื้นหลัง
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadTemplates}>
            รีเฟรช
          </Button>
        </Stack>

        {loading ? (
          <Box textAlign="center" py={8}><CircularProgress /></Box>
        ) : templates.length === 0 ? (
          <Card sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
            <Typography variant="h6">ยังไม่มี Template ในระบบ</Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {templates.map((t, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card sx={{ borderRadius: 3, boxShadow: "0 4px 14px rgba(0,0,0,0.06)", p: 1 }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                      <Typography variant="h6" fontWeight={700}>
                        {t.activity || "สัปดาห์วิทยาศาสตร์"}
                      </Typography>
                      <Chip label={t.prefix || "sci2569"} size="small" color="primary" sx={{ fontWeight: 700 }} />
                    </Stack>

                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                      ไฟล์ภาพ: /cer/{t.prefix ? t.prefix.toLowerCase() : "sci2569"}.png
                    </Typography>

                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Palette />}
                      onClick={() => navigate(`/admin/designer?activity=${encodeURIComponent(t.activity || "")}&prefix=${encodeURIComponent(t.prefix || "")}`)}
                      sx={{ fontWeight: 700, borderRadius: 2 }}
                    >
                      เปิด Designer
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </AdminLayout>
  );
}
