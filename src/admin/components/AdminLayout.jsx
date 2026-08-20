import { Box, Button, Stack, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("adminLogin");
    navigate("/admin/login");
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 240,
          bgcolor: "#0F4C81",
          color: "white",
          p: 3
        }}
      >
        <Typography variant="h6" mb={3}>
          Admin Panel
        </Typography>

        <Stack spacing={2}>
          <Button component={Link} to="/admin" sx={{ color: "white", justifyContent: "flex-start" }}>
            Dashboard
          </Button>

          <Button component={Link} to="/admin/templates" sx={{ color: "white", justifyContent: "flex-start" }}>
            Templates
          </Button>

          <Button component={Link} to="/admin/designer" sx={{ color: "white", justifyContent: "flex-start" }}>
            Template Designer
          </Button>

          <Button color="error" variant="contained" onClick={logout}>
            ออกจากระบบ
          </Button>
        </Stack>
      </Box>

      {/* เนื้อหาหน้า */}
      <Box sx={{ flex: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
}