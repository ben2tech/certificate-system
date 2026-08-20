import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Divider,
  IconButton
} from "@mui/material";

import {
  Search,
  Download,
  Visibility,
  School
} from "@mui/icons-material";

import { motion } from "framer-motion";
import { searchCertificate } from "../services/api";

export default function Home() {

  const [studentId, setStudentId] = useState("");
  const [birthday, setBirthday] = useState("");

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);

  async function search() {

    if (!studentId || !birthday) {

      alert("กรุณากรอกข้อมูลให้ครบ");

      return;

    }

    setLoading(true);

    try {

      const res = await searchCertificate(
        studentId,
        birthday
      );

      setResult(res.data || {});

    } catch (err) {

      alert(err.message);

    }

    setLoading(false);

  }

  return (

    <Box>

      {/* HERO */}

      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .45 }}
      >

        <Paper
          sx={{
            p: 5,
            borderRadius: 5,
            background:
              "linear-gradient(135deg,#0F4C81,#1976D2)",
            color: "white",
            textAlign: "center",
            mb: 4
          }}
        >

          <School sx={{ fontSize: 70 }} />

          <Typography
            variant="h3"
            fontWeight={700}
            mt={2}
          >
            ระบบค้นหาเกียรติบัตร
          </Typography>

          <Typography mt={1}>
            โรงเรียนเบญจมราชรังสฤษฎิ์ ๒
          </Typography>

        </Paper>

      </motion.div>

      {/* SEARCH */}

      <Paper
        sx={{
          p: 4,
          borderRadius: 4,
          mb: 4
        }}
      >

        <Typography
          variant="h6"
          fontWeight={700}
          mb={2}
        >
          ค้นหาเกียรติบัตร
        </Typography>

        <Stack spacing={2}>

          <TextField
            label="รหัสนักเรียน"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />

          <TextField
            label="วันเกิด (เช่น 15/03/2553)"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
          />

          <Button
            variant="contained"
            size="large"
            startIcon={<Search />}
            onClick={search}
          >
            ค้นหา
          </Button>

        </Stack>

      </Paper>

      {/* LOADING */}

      {loading && (

        <Box
          display="flex"
          justifyContent="center"
          my={5}
        >

          <CircularProgress />

        </Box>

      )}

      {/* RESULT */}

      {!loading && result && Object.keys(result).length === 0 && (

        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 4
          }}
        >

          <Typography variant="h6">
            ไม่พบเกียรติบัตร
          </Typography>

          <Typography color="text.secondary">
            กรุณาตรวจสอบรหัสนักเรียนและวันเกิดอีกครั้ง
          </Typography>

        </Paper>

      )}

      {!loading && result && Object.keys(result).length > 0 && (

        <Box>

          {Object.keys(result)
            .sort((a, b) => b - a)
            .map(year => (

              <Box key={year} mb={4}>

                <Typography
                  variant="h5"
                  color="primary"
                  fontWeight={700}
                  mb={2}
                >
                  ปีการศึกษา {year}
                </Typography>

                <Divider sx={{ mb: 2 }} />

                <Stack spacing={2}>

                  {result[year].map((cert, i) => (

                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                    >

                      <Card
                        sx={{
                          borderRadius: 4
                        }}
                      >

                        <CardContent>

                          <Typography
                            variant="h6"
                            fontWeight={700}
                          >
                            {cert.activity}
                          </Typography>

                          <Typography
                            color="text.secondary"
                            mt={1}
                          >
                            เลขที่ {cert.certNo}
                          </Typography>

                          <Stack
                            direction="row"
                            spacing={1}
                            mt={3}
                            flexWrap="wrap"
                          >

                            <Button
                              variant="contained"
                              startIcon={<Visibility />}
                              onClick={() =>
                                window.open(
                                  cert.preview,
                                  "_blank"
                                )
                              }
                            >
                              ดูเกียรติบัตร
                            </Button>

                            <Button
                              variant="outlined"
                              startIcon={<Download />}
                              onClick={() =>
                                window.open(
                                  cert.download,
                                  "_blank"
                                )
                              }
                            >
                              ดาวน์โหลด
                            </Button>

                          </Stack>

                          <Box mt={3}>

                            <iframe
                              src={cert.preview}
                              title={cert.certNo}
                              style={{
                                width: "100%",
                                height: "500px",
                                border: "none",
                                borderRadius: "12px"
                              }}
                            />

                          </Box>

                        </CardContent>

                      </Card>

                    </motion.div>

                  ))}

                </Stack>

              </Box>

            ))}

        </Box>

      )}

    </Box>

  );

}