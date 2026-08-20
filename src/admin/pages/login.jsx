import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Paper, TextField, Button, Typography } from "@mui/material";

export default function Login() {
  const nav = useNavigate();

  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  function login() {
    if (user === "admin" && pass === "1234") {
      localStorage.setItem("adminLogin", "true");
      nav("/admin");
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
    >
      <Paper sx={{ p: 4, width: 360 }}>
        <Typography variant="h5" mb={3}>
          Admin Login
        </Typography>

        <TextField
          fullWidth
          label="Username"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Password"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Button fullWidth variant="contained" onClick={login}>
          เข้าสู่ระบบ
        </Button>
      </Paper>
    </Box>
  );
}