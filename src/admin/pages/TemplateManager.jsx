import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Stack,
  CircularProgress
} from "@mui/material";

import { Add, Edit } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../components/AdminLayout";
import { getTemplates } from "../services/adminApi";

export default function TemplateManager() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);

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

  return (

    <AdminLayout>

      <Box>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >

          <Typography
            variant="h4"
            fontWeight={700}
          >
            📄 Template Manager
          </Typography>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate("/admin/designer")}
          >
            สร้าง Template
          </Button>

        </Stack>

        {loading ? (

          <Box display="flex" justifyContent="center" mt={6}>
            <CircularProgress />
          </Box>

        ) : templates.length === 0 ? (

          <Card>

            <CardContent>

              <Typography>
                ยังไม่มี Template
              </Typography>

            </CardContent>

          </Card>

        ) : (

          <Grid container spacing={3}>

            {templates.map((item, index) => (

              <Grid item xs={12} md={6} lg={4} key={index}>

                <Card sx={{ borderRadius: 3 }}>

                  <CardContent>

                    <Typography variant="h6">
                      {item.activity}
                    </Typography>

                    <Typography color="text.secondary">
                      Prefix: {item.prefix}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ mt: 1 }}
                    >
                      Template ID:
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        wordBreak: "break-all"
                      }}
                    >
                      {item.templateId}
                    </Typography>

                    <Button
                      sx={{ mt: 2 }}
                      variant="outlined"
                      startIcon={<Edit />}
                      fullWidth
                      onClick={() => navigate("/admin/designer")}
                    >
                      เปิด Designer
                    </Button>

                  </CardContent>

                </Card>

              </Grid>

            ))}

          </Grid>

        )}

      </Box>

    </AdminLayout>

  );

}