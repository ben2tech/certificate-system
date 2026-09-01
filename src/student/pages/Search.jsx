import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  InputAdornment,
  CircularProgress,
  Chip,
  Container,
  Fade,
  Dialog,
  DialogContent,
  IconButton,
} from "@mui/material";

import {
  Search as SearchIcon,
  BadgeOutlined,
  CalendarMonth,
  ErrorOutline,
  Close,
  ZoomIn,
  EmojiEvents,
  School,
  Person,
} from "@mui/icons-material";

import { searchCertificate, getTemplates } from "../../services/api";
import CertificateCanvas from "../../components/CertificateCanvas";

export default function Search() {
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [result, setResult] = useState(null);
  const [templates, setTemplates] = useState([]);

  // Modal ขยายภาพ
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    getTemplates()
      .then((res) => {
        if (res && res.data) setTemplates(res.data);
      })
      .catch((e) => console.log("Template load notice:", e));
  }, []);

  function findTemplate(c) {
    if (!templates || templates.length === 0) return null;
    const certAct = String(c?.activity || "").trim().toLowerCase();
    const certTpl = String(c?.template || "").trim().toLowerCase();
    const certNo = String(c?.certNo || "").trim().toLowerCase();

    // 1. Exact match
    let m = templates.find((t) => {
      const act = String(t?.activity || "").trim().toLowerCase();
      const pfx = String(t?.prefix || "").trim().toLowerCase();
      return (act && act === certAct) || (pfx && (pfx === certTpl || pfx === certAct));
    });
    if (m) return m;

    // 2. Keyword match
    m = templates.find((t) => {
      const act = String(t?.activity || "").trim().toLowerCase();
      const pfx = String(t?.prefix || "").trim().toLowerCase();
      if (pfx && (certAct.includes(pfx) || pfx.includes(certAct))) return true;
      if (act && (certAct.includes(act) || act.includes(certAct))) return true;
      if ((certAct.includes("วิทย์") || certNo.includes("sci")) && (pfx.includes("sci") || act.includes("วิทย์"))) return true;
      if ((certAct.includes("สังคม") || certNo.includes("soc")) && (pfx.includes("soc") || act.includes("สังคม"))) return true;
      return false;
    });
    if (m) return m;

    // 3. Fallback to any template with JSON
    return templates.find((t) => t.json && t.json.trim() !== "" && t.json.trim() !== "{}") || templates[0] || null;
  }

  async function handleSearch() {
    if (!studentId.trim()) {
      alert("กรุณากรอกรหัสนักเรียน");
      return;
    }

    setLoading(true);
    try {
      const [res, tplRes] = await Promise.all([
        searchCertificate(studentId.trim()),
        getTemplates().catch(() => null),
      ]);
      if (tplRes && tplRes.data) setTemplates(tplRes.data);
      setResult(res.data || {});
    } catch {
      alert("ค้นหาไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setResult({});
    }
    setHasSearched(true);
    setLoading(false);
  }

  function openFullscreen(cert, year) {
    setSelectedCert(cert);
    setSelectedYear(year);
    setDialogOpen(true);
  }

  function closeFullscreen() {
    setDialogOpen(false);
    setSelectedCert(null);
    setSelectedYear("");
  }

  const totalCerts = result
    ? Object.values(result).reduce((acc, list) => acc + list.length, 0)
    : 0;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)",
        py: { xs: 4, md: 8 },
        px: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Container maxWidth="lg">
        {/* หัวเว็บและโลโก้ */}
        <Box textAlign="center" mb={4}>
          <Box
            component="img"
            src="/logo.png"
            alt="School Logo"
            sx={{
              width: { xs: 90, sm: 110, md: 125 },
              height: { xs: 90, sm: 110, md: 125 },
              objectFit: "contain",
              filter: "drop-shadow(0 8px 24px rgba(0, 0, 0, 0.35))",
              mb: 2,
            }}
          />
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{
              color: "#ffffff",
              fontSize: { xs: "1.8rem", sm: "2.4rem", md: "2.8rem" },
              textShadow: "0 2px 10px rgba(0,0,0,0.3)",
            }}
          >
            ระบบค้นหาเกียรติบัตรออนไลน์
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: "rgba(255, 255, 255, 0.8)",
              mt: 1,
              fontSize: { xs: "0.95rem", md: "1.05rem" },
            }}
          >
            กรอกรหัสนักเรียนเพื่อค้นหาและดูเกียรติบัตร (E-Certificate)
          </Typography>
        </Box>

        {/* ช่องค้นหา */}
        <Paper
          elevation={12}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
            maxWidth: 680,
            mx: "auto",
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              placeholder="กรอกรหัสนักเรียน เช่น 12345"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              fullWidth
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeOutlined color="primary" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 3, fontSize: "1.05rem", bgcolor: "#f8fafc" },
              }}
            />
            <Button
              variant="contained"
              size="large"
              onClick={handleSearch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
              sx={{
                borderRadius: 3,
                px: 4,
                py: { xs: 1.5, sm: "auto" },
                fontSize: "1.05rem",
                fontWeight: 700,
                minWidth: 140,
                background: "linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)",
                boxShadow: "0 4px 14px rgba(25, 118, 210, 0.4)",
              }}
            >
              {loading ? "กำลังค้นหา..." : "ค้นหา"}
            </Button>
          </Stack>
        </Paper>

        {/* แสดงผลการค้นหา */}
        {loading && (
          <Fade in={true}>
            <Box textAlign="center" py={6}>
              <CircularProgress size={40} sx={{ color: "#FFD700", mb: 2 }} />
              <Typography variant="body1" color="white" fontWeight={600}>
                กำลังค้นหาข้อมูลเกียรติบัตร...
              </Typography>
            </Box>
          </Fade>
        )}

        {!loading && hasSearched && (
          <Fade in={true}>
            <Box mt={4}>
              {totalCerts > 0 ? (
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                    <Typography variant="h6" fontWeight={700} color="white">
                      ผลการค้นหา
                    </Typography>
                    <Chip label={`พบ ${totalCerts} รายการ`} color="warning" size="small" sx={{ fontWeight: 700 }} />
                  </Stack>

                  {Object.entries(result).map(([year, items]) => (
                    <Box key={year} mb={5}>
                      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                        <CalendarMonth sx={{ color: "#FFD700" }} />
                        <Typography variant="subtitle1" fontWeight={700} color="#FFD700">
                          ปีการศึกษา {year}
                        </Typography>
                      </Stack>

                      <Stack spacing={4}>
                        {items.map((c, i) => {
                          const matchTpl = findTemplate(c);
                          return (
                            <Box
                              key={i}
                              sx={{
                                borderRadius: 3,
                                bgcolor: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                p: { xs: 2, sm: 3 },
                              }}
                            >
                              {/* แถบข้อมูลนักเรียน */}
                              <Box sx={{ mb: 2.5, p: 2, borderRadius: 2, bgcolor: "rgba(255, 255, 255, 0.05)" }}>
                                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1.5}>
                                  <Box>
                                    <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                                      <EmojiEvents sx={{ color: "#FFD700", fontSize: 24 }} />
                                      <Typography variant="h6" sx={{ color: "#FFD700", fontWeight: 700 }}>
                                        {c.activity || "สัปดาห์วิทยาศาสตร์"}
                                      </Typography>
                                    </Stack>
                                    <Stack direction="row" flexWrap="wrap" gap={1.5} alignItems="center">
                                      {c.name && (
                                        <Typography variant="body2" sx={{ color: "#E2E8F0", display: "flex", alignItems: "center", gap: 0.5 }}>
                                          <Person sx={{ fontSize: 18, color: "#90CAF9" }} /> {c.name}
                                        </Typography>
                                      )}
                                      {c.school && (
                                        <Typography variant="body2" sx={{ color: "#CBD5E1", display: "flex", alignItems: "center", gap: 0.5 }}>
                                          <School sx={{ fontSize: 18, color: "#A7F3D0" }} /> {c.school}
                                        </Typography>
                                      )}
                                    </Stack>
                                  </Box>
                                  {c.certNo && (
                                    <Chip label={`เลขที่: ${c.certNo}`} sx={{ bgcolor: "rgba(255, 215, 0, 0.15)", color: "#FFD700", fontWeight: 700 }} />
                                  )}
                                </Stack>
                              </Box>

                              {/* ภาพเกียรติบัตร + ปุ่มดาวน์โหลด */}
                              <Box sx={{ maxWidth: 640, mx: "auto" }}>
                                <CertificateCanvas
                                  name={c.name}
                                  school={c.school}
                                  activity={c.activity}
                                  year={year}
                                  certNo={c.certNo}
                                  prefix={matchTpl?.prefix || ""}
                                  templateJson={matchTpl?.json || null}
                                  showActions={true}
                                />
                              </Box>
                            </Box>
                          );
                        })}
                      </Stack>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3, bgcolor: "rgba(255, 255, 255, 0.95)", maxWidth: 680, mx: "auto" }}>
                  <ErrorOutline color="error" sx={{ fontSize: 52, mb: 1 }} />
                  <Typography variant="h6" fontWeight={700} color="error" gutterBottom>
                    ไม่พบข้อมูลเกียรติบัตร
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ไม่พบข้อมูลสำหรับรหัสนักเรียน "<strong>{studentId}</strong>" กรุณาตรวจสอบรหัสนักเรียนอีกครั้ง
                  </Typography>
                </Paper>
              )}
            </Box>
          </Fade>
        )}
      </Container>

      {/* Footer */}
      <Box textAlign="center" mt={6} color="rgba(255, 255, 255, 0.5)">
        <Typography variant="caption" display="block">
          ระบบออกเกียรติบัตรออนไลน์ (E-Certificate Management System)
        </Typography>
      </Box>
    </Box>
  );
}