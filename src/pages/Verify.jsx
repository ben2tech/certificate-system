import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Stack,
  Chip,
  Divider
} from "@mui/material";

import {
  Verified,
  Search,
  ErrorOutline,
  Download,
  Visibility
} from "@mui/icons-material";

import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  verifyCertificate,
  previewCertificate,
  downloadCertificate
} from "../services/api";

export default function Verify() {

  const [searchParams] = useSearchParams();

  const [certNo, setCertNo] = useState(searchParams.get("id") || "");

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);

  async function search(no = certNo) {

    if (!no) {

      alert("กรุณากรอกเลขที่เกียรติบัตร");

      return;

    }

    setLoading(true);

    try {

      const res = await verifyCertificate(no);

      setResult(res);

    } catch (err) {

      alert(err.message);

    }

    setLoading(false);

  }

  useEffect(() => {

    if (searchParams.get("id")) {

      search(searchParams.get("id"));

    }

  }, []);

  return (

    <Box>

      {/* Header */}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >

        <Paper
          sx={{
            p: 5,
            borderRadius: 5,
            textAlign: "center",
            background:
              "linear-gradient(135deg,#0F4C81,#1976D2)",
            color: "white",
            mb: 4
          }}
        >

          <Verified sx={{ fontSize: 70 }} />

          <Typography
            variant="h3"
            fontWeight={700}
            mt={2}
          >
            ตรวจสอบเกียรติบัตร
          </Typography>

          <Typography mt={1}>
            ตรวจสอบความถูกต้องของเกียรติบัตรจาก QR Code หรือเลขที่เกียรติบัตร
          </Typography>

        </Paper>

      </motion.div>

      {/* Search */}

      <Paper sx={{ p: 4, borderRadius: 4, mb: 4 }}>

        <Typography
          variant="h6"
          fontWeight={700}
          mb={2}
        >
          ค้นหาเลขที่เกียรติบัตร
        </Typography>

        <Stack spacing={2}>

          <TextField
            label="เลขที่เกียรติบัตร"
            placeholder="เช่น SCI-2569-00001"
            value={certNo}
            onChange={(e) => setCertNo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") search();
            }}
          />

          <Button
            variant="contained"
            size="large"
            startIcon={<Search />}
            onClick={() => search()}
          >
            ตรวจสอบ
          </Button>

        </Stack>

      </Paper>

      {/* Loading */}

      {loading && (

        <Box display="flex" justifyContent="center" my={5}>

          <CircularProgress />

        </Box>

      )}

      {/* Result */}

      {!loading && result && (

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >

          <Paper sx={{ p: 4, borderRadius: 4 }}>

            {result.verified ? (

              <>

                <Box textAlign="center" mb={3}>

                  <Verified
                    color="success"
                    sx={{ fontSize: 70 }}
                  />

                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color="success.main"
                  >
                    ผ่านการตรวจสอบ
                  </Typography>

                  <Chip
                    label="Verified"
                    color="success"
                    sx={{ mt: 1 }}
                  />

                </Box>

                <Divider sx={{ mb: 3 }} />

                <Stack spacing={2}>

                  <InfoRow
                    label="ชื่อผู้รับ"
                    value={result.data.name}
                  />

                  <InfoRow
                    label="รหัสนักเรียน"
                    value={result.data.studentId}
                  />

                  <InfoRow
                    label="โรงเรียน"
                    value={result.data.school}
                  />

                  <InfoRow
                    label="ปีการศึกษา"
                    value={result.data.year}
                  />

                  <InfoRow
                    label="กิจกรรม"
                    value={result.data.activity}
                  />

                  <InfoRow
                    label="เลขที่"
                    value={result.data.certNo}
                  />

                </Stack>

                {result.data.pdfId && (

                  <>

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={2}
                      mt={4}
                    >

                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Visibility />}
                        onClick={() =>
                          window.open(
                            previewCertificate(result.data.pdfId),
                            "_blank"
                          )
                        }
                      >
                        ดูเกียรติบัตร
                      </Button>

                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={() =>
                          window.open(
                            downloadCertificate(result.data.pdfId),
                            "_blank"
                          )
                        }
                      >
                        ดาวน์โหลด
                      </Button>

                    </Stack>

                    <Box mt={3}>

                      <iframe
                        title="certificate"
                        src={previewCertificate(result.data.pdfId)}
                        style={{
                          width: "100%",
                          height: "520px",
                          border: "none",
                          borderRadius: "12px"
                        }}
                      />

                    </Box>

                  </>

                )}

              </>

            ) : (

              <Box textAlign="center">

                <ErrorOutline
                  color="error"
                  sx={{ fontSize: 70 }}
                />

                <Typography
                  variant="h5"
                  color="error"
                  fontWeight={700}
                  mt={2}
                >
                  ไม่พบข้อมูล
                </Typography>

                <Typography color="text.secondary" mt={1}>
                  ไม่พบเลขที่เกียรติบัตรในระบบ
                </Typography>

              </Box>

            )}

          </Paper>

        </motion.div>

      )}

    </Box>

  );

}

/*************************************************
 * Info Row
 *************************************************/

function InfoRow({ label, value }) {

  return (

    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      py={1}
      borderBottom="1px solid rgba(0,0,0,.06)"
    >

      <Typography color="text.secondary">
        {label}
      </Typography>

      <Typography fontWeight={600}>
        {value || "-"}
      </Typography>

    </Box>

  );

}