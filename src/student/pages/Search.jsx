import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Stack,
  InputAdornment,
  CircularProgress,
  Chip,
  Container,
  Divider,
  Fade,
  IconButton
} from "@mui/material";

import {
  Search as SearchIcon,
  WorkspacePremium,
  School,
  Download,
  Visibility,
  BadgeOutlined,
  CalendarMonth,
  AdminPanelSettings,
  ErrorOutline
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { searchCertificate } from "../services/studentApi";

export default function Search() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [result, setResult] = useState(null);

  async function handleSearch() {
    if (!studentId.trim()) {
      alert("กรุณากรอกรหัสนักเรียน");
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const res = await searchCertificate(studentId.trim());
      setResult(res.data || {});
    } catch {
      alert("ค้นหาไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setResult({});
    }

    setLoading(false);
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
      <Container maxWidth="md">
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
            กรอกรหัสนักเรียนเพื่อค้นหาและดาวน์โหลดเกียรติบัตร (E-Certificate)
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
            boxShadow: "0 20px 40px rgba(0,0,0,0.25)"
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

        {/* Search Results */}
        {hasSearched && (
          <Fade in={true} timeout={500}>
            <Box mt={4}>
              {totalCerts > 0 ? (
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
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
                    <Box key={year} mb={4}>
                      <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                        <CalendarMonth sx={{ color: "#FFD700" }} />
                        <Typography variant="subtitle1" fontWeight={700} color="#FFD700">
                          ปีการศึกษา {year}
                        </Typography>
                      </Stack>

                      <Stack spacing={2}>
                        {items.map((c, i) => (
                          <Card
                            key={i}
                            sx={{
                              borderRadius: 3,
                              transition: "transform 0.2s, box-shadow 0.2s",
                              "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow: "0 12px 28px rgba(0,0,0,0.2)"
                              }
                            }}
                          >
                            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                              <Stack
                                direction={{ xs: "column", sm: "row" }}
                                justifyContent="space-between"
                                alignItems={{ xs: "flex-start", sm: "center" }}
                                spacing={2}
                              >
                                <Box>
                                  <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                                    <WorkspacePremium color="primary" fontSize="small" />
                                    <Typography variant="h6" fontWeight={700} color="#1e293b">
                                      {c.activity || "เกียรติบัตร"}
                                    </Typography>
                                  </Stack>
                                  {c.name && (
                                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                                      ผู้รับ: <strong>{c.name}</strong> {c.school && `(${c.school})`}
                                    </Typography>
                                  )}
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      display: "inline-block",
                                      px: 1.2,
                                      py: 0.3,
                                      bgcolor: "#f1f5f9",
                                      borderRadius: 1.5,
                                      color: "#475569",
                                      fontWeight: 600,
                                      fontFamily: "monospace"
                                    }}
                                  >
                                    เลขที่: {c.certNo || "-"}
                                  </Typography>
                                </Box>

                                <Stack direction="row" spacing={1.5} width={{ xs: "100%", sm: "auto" }}>
                                  {c.preview && (
                                    <Button
                                      variant="outlined"
                                      startIcon={<Visibility />}
                                      onClick={() => window.open(c.preview, "_blank")}
                                      fullWidth
                                      sx={{ borderRadius: 2, px: 2 }}
                                    >
                                      ดู
                                    </Button>
                                  )}
                                  {c.download && (
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      startIcon={<Download />}
                                      onClick={() => window.open(c.download, "_blank")}
                                      fullWidth
                                      sx={{ borderRadius: 2, px: 2.5, fontWeight: 700 }}
                                    >
                                      ดาวน์โหลด
                                    </Button>
                                  )}
                                </Stack>
                              </Stack>
                            </CardContent>
                          </Card>
                        ))}
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
                    bgcolor: "rgba(255, 255, 255, 0.95)"
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

      {/* Footer & Admin link */}
      <Box textAlign="center" mt={6} color="rgba(255, 255, 255, 0.6)">
        <Typography variant="caption" display="block">
          ระบบออกเกียรติบัตรออนไลน์ (E-Certificate Management System)
        </Typography>
        <Button
          size="small"
          startIcon={<AdminPanelSettings />}
          onClick={() => navigate("/admin/login")}
          sx={{
            mt: 1,
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "0.75rem",
            textTransform: "none",
            "&:hover": { color: "#ffffff" }
          }}
        >
          สำหรับผู้ดูแลระบบ (Admin Login)
        </Button>
      </Box>
    </Box>
  );
}