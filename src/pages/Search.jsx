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
  Container,
  Fade,
} from "@mui/material";

import {
  Search as SearchIcon,
  BadgeOutlined,
  EmojiEvents,
  Person,
  School,
  ErrorOutline,
} from "@mui/icons-material";

import { searchStudent } from "../services/api";
import CertificateCanvas from "../components/CertificateCanvas";

export default function Search() {
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
    try {
      const res = await searchStudent(studentId.trim());
      setResult(res.data || {});
    } catch {
      alert("ค้นหาไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setResult({});
    }
    setHasSearched(true);
    setLoading(false);
  }

  const certList = result ? Object.values(result).flat() : [];

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
      <Container maxWidth="md">
        {/* หัวเว็บ */}
        <Box textAlign="center" mb={4}>
          <Box
            component="img"
            src="./logo.png"
            alt="School Logo"
            onError={(e) => {
              e.currentTarget.src = "logo.png";
            }}
            sx={{
              width: { xs: 90, sm: 110 },
              height: { xs: 90, sm: 110 },
              objectFit: "contain",
              mb: 2,
            }}
          />
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{
              color: "#ffffff",
              fontSize: { xs: "1.8rem", sm: "2.4rem" },
            }}
          >
            ระบบค้นหาเกียรติบัตรออนไลน์
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.8)", mt: 1 }}>
            กรอกรหัสนักเรียนเพื่อค้นหาและพิมพ์เกียรติบัตร
          </Typography>
        </Box>

        {/* ช่องค้นหา */}
        <Paper
          elevation={10}
          sx={{
            p: { xs: 2.5, sm: 3.5 },
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.95)",
            maxWidth: 620,
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
              }}
            >
              {loading ? "กำลังค้นหา..." : "ค้นหา"}
            </Button>
          </Stack>
        </Paper>

        {/* Loading */}
        {loading && (
          <Box textAlign="center" py={6}>
            <CircularProgress size={40} sx={{ color: "#FFD700", mb: 2 }} />
            <Typography variant="body1" color="white">
              กำลังค้นหาข้อมูลเกียรติบัตร...
            </Typography>
          </Box>
        )}

        {/* ผลการค้นหา */}
        {!loading && hasSearched && (
          <Fade in={true}>
            <Box mt={4}>
              {certList.length > 0 ? (
                <Stack spacing={4}>
                  {certList.map((c, i) => {
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
                        {/* ข้อมูลนักเรียน */}
                        <Box sx={{ mb: 2.5, p: 2, borderRadius: 2, bgcolor: "rgba(255, 255, 255, 0.05)" }}>
                          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                            <Box>
                              <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                                <EmojiEvents sx={{ color: "#FFD700", fontSize: 22 }} />
                                <Typography variant="h6" sx={{ color: "#FFD700", fontWeight: 700 }}>
                                  {c.activity}
                                </Typography>
                              </Stack>
                              <Stack direction="row" flexWrap="wrap" gap={1.5}>
                                <Typography variant="body2" sx={{ color: "#E2E8F0", display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <Person sx={{ fontSize: 18, color: "#90CAF9" }} /> {c.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "#CBD5E1", display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <School sx={{ fontSize: 18, color: "#A7F3D0" }} /> {c.school}
                                </Typography>
                              </Stack>
                            </Box>
                            {c.certNo && (
                              <Typography variant="body2" sx={{ color: "#FFD700", fontWeight: 700 }}>
                                เลขที่: {c.certNo}
                              </Typography>
                            )}
                          </Stack>
                        </Box>

                        {/* เกียรติบัตร */}
                        <Box sx={{ maxWidth: 640, mx: "auto" }}>
                          <CertificateCanvas
                            name={c.name}
                            school={c.school}
                            activity={c.activity}
                            year={c.year}
                            certNo={c.certNo}
                            prefix={c.prefix || c.template || c.activity || "sci2569"}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              ) : (
                <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3, bgcolor: "rgba(255, 255, 255, 0.95)", maxWidth: 620, mx: "auto" }}>
                  <ErrorOutline color="error" sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h6" fontWeight={700} color="error">
                    ไม่พบข้อมูลเกียรติบัตร
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ไม่พบข้อมูลสำหรับรหัส "<strong>{studentId}</strong>"
                  </Typography>
                </Paper>
              )}
            </Box>
          </Fade>
        )}
      </Container>

      {/* Footer */}
      <Box textAlign="center" mt={6} color="rgba(255, 255, 255, 0.5)">
        <Typography variant="caption">
          ระบบออกเกียรติบัตรออนไลน์ (E-Certificate Management System)
        </Typography>
      </Box>
    </Box>
  );
}
