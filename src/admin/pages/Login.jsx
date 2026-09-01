import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Paper, Typography, TextField, Button, Stack } from "@mui/material";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin() {
    if (username === "admin" && password === "1234") {
      localStorage.setItem("adminLogin", "true");
      navigate("/admin");
      return;
    }
    alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ background: "linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)" }}
    >
      <Paper elevation={12} sx={{ p: 4, width: "100%", maxWidth: 400, borderRadius: 4, textAlign: "center" }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          🔐 Admin Login
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          เข้าสู่ระบบเพื่อจัดการ Template และข้อมูลเกียรติบัตร
        </Typography>

        <Stack spacing={2.5}>
          <TextField
            label="ชื่อผู้ใช้"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            autoFocus
          />
          <TextField
            label="รหัสผ่าน"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            fullWidth
          />
          <Button
            variant="contained"
            size="large"
            onClick={handleLogin}
            sx={{ py: 1.2, fontWeight: 700, borderRadius: 2 }}
          >
            เข้าสู่ระบบ
          </Button>
        </Stack>

        <Typography variant="caption" color="text.secondary" display="block" mt={3}>
          รหัสผ่านเริ่มต้น: admin / 1234
        </Typography>
      </Paper>
    </Box>
  );
}
