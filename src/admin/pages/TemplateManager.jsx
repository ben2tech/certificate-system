import { useEffect, useState } from "react";
import { 
  Box, Card, CardContent, Typography, Grid, Button, Stack, 
  CircularProgress, Chip, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField 
} from "@mui/material";
import { Palette, Refresh, Add, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { getFromGAS, postGAS } from "../../services/api";

export default function TemplateManager() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [addOpen, setAddOpen] = useState(false);
  const [newActivity, setNewActivity] = useState("");
  const [newPrefix, setNewPrefix] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  async function handleAddTemplate() {
    if (!newActivity.trim() || !newPrefix.trim()) return alert("กรุณากรอกชื่อกิจกรรมและรหัส (Prefix)");
    setIsSubmitting(true);
    try {
      await postGAS({
        action: "saveTemplate",
        activity: newActivity.trim(),
        prefix: newPrefix.trim().toLowerCase(),
        templateId: `tpl-${Date.now()}`,
        json: "{}"
      });
      setAddOpen(false);
      setNewActivity("");
      setNewPrefix("");
      loadTemplates();
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
    setIsSubmitting(false);
  }

  async function handleDeleteTemplate(id, actName) {
    if (!id) return;
    if (!confirm(`คุณต้องการลบกิจกรรม "${actName}" ใช่หรือไม่?`)) return;
    try {
      await postGAS({ action: "deleteTemplate", templateId: id });
      loadTemplates();
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการลบ");
    }
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
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<Refresh />} onClick={loadTemplates}>
              รีเฟรช
            </Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => setAddOpen(true)}>
              เพิ่มกิจกรรม
            </Button>
          </Stack>
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
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {t.activity || "สัปดาห์วิทยาศาสตร์"}
                        </Typography>
                        <Chip label={t.prefix || "sci2569"} size="small" color="primary" sx={{ fontWeight: 700, mt: 0.5 }} />
                      </Box>
                      <IconButton color="error" onClick={() => handleDeleteTemplate(t.templateId, t.activity)}>
                        <Delete />
                      </IconButton>
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

        {/* Dialog เพิ่มกิจกรรม */}
        <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle fontWeight={700}>เพิ่มกิจกรรมใหม่</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3} mt={1}>
              <TextField
                label="ชื่อกิจกรรม (Activity)"
                placeholder="เช่น กิจกรรมวันแม่"
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
                fullWidth
              />
              <TextField
                label="รหัสกิจกรรม (Prefix)"
                placeholder="เช่น mom2569 (ใช้ตั้งชื่อไฟล์รูปภาพด้วย)"
                value={newPrefix}
                onChange={(e) => setNewPrefix(e.target.value)}
                fullWidth
              />
              <Typography variant="body2" color="error">
                * หลังจากเพิ่มกิจกรรมแล้ว อย่าลืมอัปโหลดไฟล์รูปภาพไปที่ <strong>public/cer/</strong> โดยใช้ชื่อเดียวกับ Prefix (เช่น {newPrefix || "prefix"}.png) ด้วยนะครับ
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleAddTemplate} variant="contained" disabled={isSubmitting}>
              {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}
