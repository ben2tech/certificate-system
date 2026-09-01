import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Stack
} from "@mui/material";

import { verifyCertificate } from "../../services/api";

export default function Verify() {

  const [params] = useSearchParams();
  const [data, setData] = useState(null);

  useEffect(() => {

    const id = params.get("id");

    if (!id) return;

    verifyCertificate(id).then(setData);

  }, []);

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
          maxWidth: 600
        }}
      >

        <Typography
          variant="h4"
          mb={3}
        >
          ตรวจสอบเกียรติบัตร
        </Typography>

        {data?.verified ? (

          <Stack spacing={2}>

            <Chip
              label="ผ่านการตรวจสอบ"
              color="success"
            />

            <Typography>
              ชื่อ: {data.data.name}
            </Typography>

            <Typography>
              โรงเรียน: {data.data.school}
            </Typography>

            <Typography>
              กิจกรรม: {data.data.activity}
            </Typography>

            <Typography>
              เลขที่: {data.data.certNo}
            </Typography>

          </Stack>

        ) : (

          <Chip
            label="ไม่พบข้อมูล"
            color="error"
          />

        )}

      </Paper>

    </Box>

  );

}