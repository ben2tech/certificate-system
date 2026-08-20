import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Stack
} from "@mui/material";

import { searchCertificate } from "../services/studentApi";

export default function Search() {

  const [studentId, setStudentId] = useState("");
  const [birthday, setBirthday] = useState("");
  const [result, setResult] = useState(null);

  async function search() {

    try {

      const res = await searchCertificate(studentId, birthday);

      setResult(res.data || {});

    } catch {

      alert("ค้นหาไม่สำเร็จ");

    }

  }

  return (

    <Box
      display="flex"
      justifyContent="center"
      p={4}
    >

      <Paper
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 720
        }}
      >

        <Typography
          variant="h4"
          fontWeight={700}
          mb={3}
        >
          ค้นหาเกียรติบัตร
        </Typography>

        <Stack spacing={2}>

          <TextField
            label="รหัสนักเรียน"
            value={studentId}
            onChange={e => setStudentId(e.target.value)}
            fullWidth
          />

          <TextField
            label="วันเกิด (เช่น 15/03/2553)"
            value={birthday}
            onChange={e => setBirthday(e.target.value)}
            fullWidth
          />

          <Button
            variant="contained"
            onClick={search}
          >
            ค้นหา
          </Button>

        </Stack>

        <Box mt={4}>

          {result &&
            Object.entries(result).map(([year, items]) => (

              <Box key={year} mb={3}>

                <Typography
                  variant="h6"
                  mb={2}
                >
                  ปี {year}
                </Typography>

                {items.map((c, i) => (

                  <Card key={i} sx={{ mb: 2 }}>

                    <CardContent>

                      <Typography fontWeight={700}>
                        {c.activity}
                      </Typography>

                      <Typography>
                        เลขที่: {c.certNo}
                      </Typography>

                      <Stack direction="row" spacing={1} mt={2}>

                        <Button
                          variant="outlined"
                          onClick={() => window.open(c.preview)}
                        >
                          ดู
                        </Button>

                        <Button
                          variant="contained"
                          onClick={() => window.open(c.download)}
                        >
                          ดาวน์โหลด
                        </Button>

                      </Stack>

                    </CardContent>

                  </Card>

                ))}

              </Box>

            ))}

        </Box>

      </Paper>

    </Box>

  );

}