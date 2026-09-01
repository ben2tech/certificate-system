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
  Tooltip,
} from "@mui/material";

import {
  Search as SearchIcon,
  BadgeOutlined,
  CalendarMonth,
  ErrorOutline,
  Close,
  ZoomIn,
  Download,
  PictureAsPdf,
  Image as ImageIcon,
  EmojiEvents,
  School,
  Person,
} from "@mui/icons-material";

import { searchCertificate, getTemplates } from "../services/studentApi";
import CertificatePreview from "../../components/CertificatePreview";
import { downloadCertificateImage, downloadCertificatePDF } from "../../utils/exportEngine";

export default function Search() {
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [result, setResult] = useState(null);
  const [templates, setTemplates] = useState([]);

  // Fullscreen dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");

  // Load templates list on mount to get background IDs per activity
  useEffect(() => {
    getTemplates()
      .then((res) => {
        if (res && res.data) {
          setTemplates(res.data);
        }
      })
      .catch((err) => console.log("Load templates notice:", err));
  }, []);

  const DEFAULT_BACKGROUND = "https://lh3.googleusercontent.com/d/1cg0Jh7mNZBHq_e8ytmWZRoJN6S7d7CiHJ-ROsxIgTGA=w1600";

  function findTemplate(c) {
    if (!templates || templates.length === 0) return null;
    const certTemplate = String(c?.template || "").trim().toLowerCase();
    const certActivity = String(c?.activity || "").trim().toLowerCase();

    // รวบรวม Templates ทั้งหมดที่ตรงกับกิจกรรมหรือ Template นี้
    const candidates = templates.filter((t) => {
      const act = (t.activity || "").trim().toLowerCase();
      const pfx = (t.prefix || "").trim().toLowerCase();
      if (certTemplate && (pfx === certTemplate || act === certTemplate || certTemplate.includes(pfx) || pfx.includes(certTemplate))) return true;
      if (certActivity && (act === certActivity || pfx === certActivity || act.includes(certActivity) || certActivity.includes(act))) return true;
      if (certActivity.includes("วิทย์") && (act.includes("วิทย์") || pfx.includes("sci"))) return true;
      return false;
    });

    if (candidates.length > 0) {
      // ให้ความสำคัญสูงสุดกับ Template ที่มีข้อมูล JSON จาก Template Designer
      const withJson = candidates.find((t) => t.json && t.json.trim() !== "" && t.json.trim() !== "{}");
      if (withJson) return withJson;
      return candidates[0];
    }

    return null;
  }

  function getBackgroundForCert(c) {
    // ให้ CertificatePreview โหลดจาก /cer/ พื้นฐานผ่าน getTemplateConfig เอง
    return null;
  }

  function getTemplateJsonForCert(c) {
    const match = findTemplate(c);
    return match?.json || null;
  }

  function getPrefixForCert(c) {
    const match = findTemplate(c);
    return match?.prefix ? match.prefix.trim() : String(c?.template || "").trim();
  }

  async function handleSearch() {
    if (!studentId.trim()) {
      alert("กรุณากรอกรหัสนักเรียน");
      return;
    }

    setLoading(true);

    try {
      // ดึงข้อมูลเกียรติบัตรพร้อมกับ Template ล่าสุดจาก Google Sheet แบบ Real-time
      const [res, tplRes] = await Promise.all([
        searchCertificate(studentId.trim()),
        getTemplates().catch(() => null),
      ]);

      if (tplRes && tplRes.data) {
        setTemplates(tplRes.data);
      }

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
        justifyContent: "space-between"
      }}
    >
      <Container maxWidth="lg">
        {/* Header Branding */}
        <Box textAlign="center" mb={4}>
          <Box
            component="img"
            src="/logo.png"
            alt="School Logo"
            sx={{
              width: { xs: 95, sm: 115, md: 130 },
              height: { xs: 95, sm: 115, md: 130 },
              objectFit: "contain",
              filter: "drop-shadow(0 8px 24px rgba(0, 0, 0, 0.35))",
              mb: 2,
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.06)"
              }
            }}
          />
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{
              color: "#ffffff",
              letterSpacing: "-0.5px",
              fontSize: { xs: "1.85rem", sm: "2.5rem", md: "3rem" },
              textShadow: "0 2px 10px rgba(0,0,0,0.3)"
            }}
          >
            ระบบค้นหาเกียรติบัตรออนไลน์
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: "rgba(255, 255, 255, 0.8)",
              mt: 1,
              fontSize: { xs: "0.95rem", md: "1.1rem" }
            }}
          >
            กรอกรหัสนักเรียนเพื่อค้นหาและดูเกียรติบัตร (E-Certificate)
          </Typography>
        </Box>

        {/* Search Card */}
        <Paper
          elevation={12}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
            maxWidth: 700,
            mx: "auto"
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="stretch"
          >
            <TextField
              placeholder="กรอกรหัสนักเรียน เช่น 12345"
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              fullWidth
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeOutlined color="primary" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 3,
                  fontSize: "1.1rem",
                  bgcolor: "#f8fafc"
                }
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
                minWidth: 150,
                background: "linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)",
                boxShadow: "0 4px 14px rgba(25, 118, 210, 0.4)",
                "&:hover": {
                  background: "linear-gradient(135deg, #1565C0 0%, #0A3880 100%)"
                }
              }}
            >
              {loading ? "กำลังค้นหา..." : "ค้นหา"}
            </Button>
          </Stack>
        </Paper>

        {/* Loading Indicator */}
        {loading && (
          <Fade in={true} timeout={400}>
            <Box textAlign="center" py={5}>
              <CircularProgress size={44} sx={{ color: "#FFD700", mb: 2 }} />
              <Typography variant="body1" color="white" fontWeight={600}>
                กำลังค้นหาข้อมูลเกียรติบัตร กรุณารอสักครู่...
              </Typography>
            </Box>
          </Fade>
        )}

        {/* Search Results */}
        {!loading && hasSearched && (
          <Fade in={true} timeout={500}>
            <Box mt={4}>
              {totalCerts > 0 ? (
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                    <Typography variant="h6" fontWeight={700} color="white">
                      ผลการค้นหา
                    </Typography>
                    <Chip
                      label={`พบ ${totalCerts} รายการ`}
                      color="warning"
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
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
                          const certElementId = `cert-preview-${year}-${i}`;
                          const fileName = `เกียรติบัตร_${c.name || studentId}_${c.activity || "กิจกรรม"}`;
                          return (
                            <Box key={i}>
                              {/* Certificate Preview Card */}
                              <Box
                                sx={{
                                  borderRadius: 3,
                                  overflow: "hidden",
                                  boxShadow: "0 10px 35px rgba(0,0,0,0.3)",
                                  bgcolor: "rgba(255,255,255,0.03)",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  p: { xs: 2, sm: 3 },
                                }}
                              >
                                {/* Activity & Student Information Header */}
                                <Box
                                  sx={{
                                    mb: 2.5,
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: "rgba(255, 255, 255, 0.05)",
                                    border: "1px solid rgba(255, 255, 255, 0.08)",
                                  }}
                                >
                                  <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    justifyContent="space-between"
                                    alignItems={{ xs: "flex-start", sm: "center" }}
                                    spacing={1.5}
                                  >
                                    <Box>
                                      <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                                        <EmojiEvents sx={{ color: "#FFD700", fontSize: 24 }} />
                                        <Typography variant="h6" sx={{ color: "#FFD700", fontWeight: 700, fontSize: { xs: "1rem", sm: "1.15rem" } }}>
                                          {c.activity || "สัปดาห์วิทยาศาสตร์"}
                                        </Typography>
                                      </Stack>
                                      <Stack direction="row" flexWrap="wrap" gap={1.5} alignItems="center">
                                        {c.name && (
                                          <Typography variant="body2" sx={{ color: "#E2E8F0", display: "flex", alignItems: "center", gap: 0.5 }}>
                                            <Person sx={{ fontSize: 18, color: "#90CAF9" }} />
                                            {c.name}
                                          </Typography>
                                        )}
                                        {c.school && (
                                          <Typography variant="body2" sx={{ color: "#CBD5E1", display: "flex", alignItems: "center", gap: 0.5 }}>
                                            <School sx={{ fontSize: 18, color: "#A7F3D0" }} />
                                            {c.school}
                                          </Typography>
                                        )}
                                      </Stack>
                                    </Box>

                                    {c.certNo && (
                                      <Chip
                                        label={`เลขที่: ${c.certNo}`}
                                        sx={{
                                          bgcolor: "rgba(255, 215, 0, 0.15)",
                                          color: "#FFD700",
                                          fontWeight: 700,
                                          fontSize: "0.85rem",
                                          border: "1px solid rgba(255, 215, 0, 0.3)",
                                        }}
                                      />
                                    )}
                                  </Stack>
                                </Box>

                                {/* Compact Certificate Preview */}
                                <Box
                                  sx={{
                                    width: "100%",
                                    maxWidth: { xs: "100%", sm: 540, md: 620 },
                                    mx: "auto",
                                    cursor: "pointer",
                                    position: "relative",
                                    borderRadius: 2,
                                    overflow: "hidden",
                                    boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
                                    "&:hover .cert-zoom-hint": {
                                      opacity: 1,
                                    },
                                  }}
                                  onClick={() => openFullscreen(c, year)}
                                >
                                  <CertificatePreview
                                    id={certElementId}
                                    name={c.name}
                                    school={c.school}
                                    activity={c.activity}
                                    year={year}
                                    certNo={c.certNo}
                                    prefix={getPrefixForCert(c)}
                                    background={getBackgroundForCert(c)}
                                    templateJson={getTemplateJsonForCert(c)}
                                  />

                                  {/* Zoom hint overlay */}
                                  <Box
                                    className="cert-zoom-hint"
                                    sx={{
                                      position: "absolute",
                                      inset: 0,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      bgcolor: "rgba(0,0,0,0.3)",
                                      opacity: 0,
                                      transition: "opacity 0.25s ease",
                                      zIndex: 5,
                                    }}
                                  >
                                    <Stack alignItems="center" spacing={0.5}>
                                      <ZoomIn sx={{ fontSize: 44, color: "white" }} />
                                      <Typography variant="body2" sx={{ color: "white", fontWeight: 700 }}>
                                        คลิกเพื่อดูขนาดเต็ม
                                      </Typography>
                                    </Stack>
                                  </Box>
                                </Box>

                                {/* Action Buttons */}
                                <Stack
                                  direction={{ xs: "column", sm: "row" }}
                                  spacing={1.5}
                                  justifyContent="center"
                                  alignItems="center"
                                  mt={2.5}
                                >
                                  <Button
                                    variant="outlined"
                                    startIcon={<ZoomIn />}
                                    onClick={() => openFullscreen(c, year)}
                                    sx={{
                                      color: "#90caf9",
                                      borderColor: "rgba(144, 202, 249, 0.5)",
                                      "&:hover": { borderColor: "#90caf9", bgcolor: "rgba(144, 202, 249, 0.1)" },
                                      fontWeight: 600,
                                      px: 2.5,
                                    }}
                                  >
                                    ดูขนาดเต็ม
                                  </Button>

                                  <Button
                                    variant="contained"
                                    startIcon={<ImageIcon />}
                                    onClick={() => downloadCertificateImage(certElementId, `${fileName}.png`)}
                                    sx={{
                                      background: "linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)",
                                      color: "white",
                                      fontWeight: 700,
                                      px: 3,
                                      boxShadow: "0 4px 14px rgba(25, 118, 210, 0.4)",
                                    }}
                                  >
                                    บันทึกรูปภาพ (PNG)
                                  </Button>

                                  <Button
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<PictureAsPdf />}
                                    onClick={() => downloadCertificatePDF(certElementId, `${fileName}.pdf`)}
                                    sx={{
                                      background: "linear-gradient(135deg, #FF6F00 0%, #E65100 100%)",
                                      color: "white",
                                      fontWeight: 700,
                                      px: 3,
                                      boxShadow: "0 4px 14px rgba(230, 81, 0, 0.4)",
                                    }}
                                  >
                                    ดาวน์โหลด PDF
                                  </Button>
                                </Stack>
                              </Box>
                            </Box>
                          );
                        })}
                      </Stack>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Paper
                  sx={{
                    p: 4,
                    textAlign: "center",
                    borderRadius: 3,
                    bgcolor: "rgba(255, 255, 255, 0.95)",
                    maxWidth: 700,
                    mx: "auto"
                  }}
                >
                  <ErrorOutline color="error" sx={{ fontSize: 56, mb: 1 }} />
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

      {/* Fullscreen Certificate Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeFullscreen}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 3 },
            bgcolor: "#0b1329",
            maxWidth: "96vw",
            maxHeight: "96vh",
            m: { xs: 0, sm: 2 },
            display: "flex",
            flexDirection: "column",
          }
        }}
      >
        {/* Top Control Bar in Modal */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            gap: 1.5,
            p: 2,
            px: { xs: 2, sm: 3 },
            bgcolor: "rgba(15, 23, 42, 0.95)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            zIndex: 10,
          }}
        >
          <Typography variant="h6" color="white" fontWeight={700} sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
            📜 เกียรติบัตร: {selectedCert?.name || ""}
          </Typography>

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            {selectedCert && (
              <>
                <Button
                  variant="contained"
                  size="medium"
                  startIcon={<ImageIcon />}
                  onClick={() =>
                    downloadCertificateImage(
                      "fullscreen-cert-element",
                      `เกียรติบัตร_${selectedCert.name || studentId}_${selectedCert.activity || ""}.png`
                    )
                  }
                  sx={{
                    background: "linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)",
                    fontWeight: 700,
                    px: { xs: 2, sm: 3 },
                    boxShadow: "0 4px 14px rgba(25, 118, 210, 0.4)",
                  }}
                >
                  บันทึกรูปภาพ (PNG)
                </Button>

                <Button
                  variant="contained"
                  size="medium"
                  startIcon={<PictureAsPdf />}
                  onClick={() =>
                    downloadCertificatePDF(
                      "fullscreen-cert-element",
                      `เกียรติบัตร_${selectedCert.name || studentId}_${selectedCert.activity || ""}.pdf`
                    )
                  }
                  sx={{
                    background: "linear-gradient(135deg, #FF6F00 0%, #E65100 100%)",
                    fontWeight: 700,
                    px: { xs: 2, sm: 3 },
                    boxShadow: "0 4px 14px rgba(230, 81, 0, 0.4)",
                  }}
                >
                  ดาวน์โหลด PDF
                </Button>
              </>
            )}

            <IconButton
              onClick={closeFullscreen}
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                color: "white",
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" }
              }}
            >
              <Close />
            </IconButton>
          </Stack>
        </Box>

        <DialogContent
          sx={{
            p: { xs: 1.5, sm: 3 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            overflowY: "auto",
            flexGrow: 1,
          }}
        >
          {selectedCert && (
            <Box sx={{ width: "100%", maxWidth: 1100, my: "auto" }}>
              <CertificatePreview
                id="fullscreen-cert-element"
                name={selectedCert.name}
                school={selectedCert.school}
                activity={selectedCert.activity}
                year={selectedYear}
                certNo={selectedCert.certNo}
                prefix={getPrefixForCert(selectedCert)}
                background={getBackgroundForCert(selectedCert)}
                templateJson={getTemplateJsonForCert(selectedCert)}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <Box textAlign="center" mt={6} color="rgba(255, 255, 255, 0.5)">
        <Typography variant="caption" display="block">
          ระบบออกเกียรติบัตรออนไลน์ (E-Certificate Management System)
        </Typography>
      </Box>
    </Box>
  );
}