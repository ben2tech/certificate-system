import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Button,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";

import { Add, Edit, Palette, Refresh, Image as ImageIcon, OpenInNew } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../components/AdminLayout";
import { getTemplates, saveTemplate } from "../services/adminApi";

export default function TemplateManager() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);

  // Modal State for Add/Edit Template
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editActivity, setEditActivity] = useState("");
  const [editPrefix, setEditPrefix] = useState("");
  const [editTemplateId, setEditTemplateId] = useState("");

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    setLoading(true);
    try {
      const res = await getTemplates();
      setTemplates(res.data || []);
    } catch (err) {
      console.error(err);
      alert("โหลด Template ไม่สำเร็จ");
    }
    setLoading(false);
  }

  function handleOpenAdd() {
    setEditActivity("");
    setEditPrefix("CERT");
    setEditTemplateId("");
    setDialogOpen(true);
  }

  function handleOpenEdit(item) {
    setEditActivity(item.activity || "");
    setEditPrefix(item.prefix || "CERT");
    setEditTemplateId(item.templateId || "");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!editActivity.trim()) {
      alert("กรุณาระบุชื่อกิจกรรม");
      return;
    }

    setSaving(true);
    try {
      await saveTemplate({
        activity: editActivity.trim(),
        prefix: editPrefix.trim() || "CERT",
        templateId: editTemplateId.trim(),
      });
      alert("บันทึก Template สำเร็จ!");
      setDialogOpen(false);
      await loadTemplates();
    } catch (err) {
      alert("บันทึกไม่สำเร็จ: " + (err.message || "เกิดข้อผิดพลาด"));
    }
    setSaving(false);
  }

  // สร้าง path thumbnail จากชื่อกิจกรรม (ดึงจาก /cer/ ไม่ใช้ Google Drive)
  function getThumbnailUrl(item) {
    const key = (item?.activity || "default").trim().toLowerCase();
    return `/cer/${key}.png`;
  }

  return (
    <AdminLayout>
      <Box>
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          mb={4}
        >
          <Box>
            <Typography variant="h4" fontWeight={700} color="primary">
              📄 จัดการ Template & พื้นหลังเกียรติบัตร
            </Typography>
            <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
              กำหนดพื้นหลังและตั้งค่าเกียรติบัตรแยกตามแต่ละกิจกรรม (สัปดาห์วิทยาศาสตร์, ภาษาไทย ฯลฯ)
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadTemplates}
            >
              รีเฟรช
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenAdd}
              sx={{
                background: "linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)",
                fontWeight: 700,
              }}
            >
              เพิ่ม Template กิจกรรม
            </Button>
          </Stack>
        </Stack>

        {/* Content */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress />
          </Box>
        ) : templates.length === 0 ? (
          <Card sx={{ borderRadius: 3, p: 4, textAlign: "center" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                ยังไม่มี Template เกียรติบัตร
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mb: 3 }}>
                คลิกปุ่มด้านล่างเพื่อเพิ่ม Template และผูกพื้นหลังกับกิจกรรม
              </Typography>
              <Button variant="contained" startIcon={<Add />} onClick={handleOpenAdd}>
                เพิ่ม Template แรก
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2.5}>
            {templates.map((item, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                    border: "1px solid #e2e8f0",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                      <Typography variant="h6" fontWeight={700} color="#1e293b">
                        {item.activity}
                      </Typography>
                      <Chip
                        label={item.prefix || "CERT"}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 700 }}
                      />
                    </Stack>

                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2.5 }}>
                      ภาพพื้นหลัง: /cer/{item.activity ? item.activity.toLowerCase() : "default"}.png
                    </Typography>

                    <Stack direction="row" spacing={1.5}>
                      <Button
                        variant="outlined"
                        size="medium"
                        startIcon={<Edit />}
                        fullWidth
                        onClick={() => handleOpenEdit(item)}
                      >
                        แก้ไขข้อมูล
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        size="medium"
                        startIcon={<Palette />}
                        fullWidth
                        onClick={() =>
                          navigate(
                            `/admin/designer?activity=${encodeURIComponent(
                              item.activity || ""
                            )}&templateId=${encodeURIComponent(
                              item.templateId || ""
                            )}&prefix=${encodeURIComponent(item.prefix || "CERT")}`
                          )
                        }
                        sx={{ fontWeight: 700 }}
                      >
                        เปิด Designer
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Dialog Add/Edit Template */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
            {editActivity ? `แก้ไข Template: ${editActivity}` : "เพิ่ม Template กิจกรรมใหม่"}
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                label="ชื่อกิจกรรม (Activity Name)"
                placeholder="เช่น สัปดาห์วิทยาศาสตร์, กิจกรรมสถานศึกษาสีขาว"
                value={editActivity}
                onChange={(e) => setEditActivity(e.target.value)}
                fullWidth
                required
                helperText="ต้องตรงกับชื่อกิจกรรมในไฟล์ Excel หรือข้อมูลนักเรียน"
              />

              <TextField
                label="Prefix เลขที่เกียรติบัตร"
                placeholder="เช่น SCI69, CERT, THAI"
                value={editPrefix}
                onChange={(e) => setEditPrefix(e.target.value)}
                fullWidth
              />

              <Box sx={{ mt: 1, p: 2, bgcolor: "#e0f2fe", borderRadius: 2, border: "1px dashed #38bdf8" }}>
                <Typography variant="subtitle2" color="#0369a1" fontWeight={700} gutterBottom>
                  🖼️ การตั้งค่ารูปพื้นหลัง
                </Typography>
                <Typography variant="body2" color="#0c4a6e">
                  ระบบจะค้นหาไฟล์รูปพื้นหลังอัตโนมัติจากโฟลเดอร์ <strong>public/cer/</strong> 
                  โดยใช้ชื่องานเป็นชื่อไฟล์ เช่น หากตั้งชื่อกิจกรรมว่า <strong>sci2569</strong> ระบบจะดึงภาพจาก <strong>/cer/sci2569.png</strong>
                </Typography>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 1 }}>
            <Button onClick={() => setDialogOpen(false)} disabled={saving}>
              ยกเลิก
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              sx={{ px: 3, fontWeight: 700 }}
            >
              {saving ? "กำลังบันทึก..." : "บันทึก Template"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}