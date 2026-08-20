import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack
} from "@mui/material";

export default function Login() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin() {

    // ชั่วคราว ใช้ LocalStorage
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
      sx={{
        background:
          "linear-gradient(135deg,#0F4C81,#1976D2)"
      }}
    >

      <Paper
        elevation={8}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 420,
          borderRadius: 4
        }}
      >

        <Typography
          variant="h4"
          fontWeight={700}
          textAlign="center"
          mb={1}
        >
          Admin Login
        </Typography>

        <Typography
          textAlign="center"
          color="text.secondary"
          mb={4}
        >
          ระบบจัดการเกียรติบัตร
        </Typography>

        <Stack spacing={2}>

          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />

          <Button
            variant="contained"
            size="large"
            onClick={handleLogin}
          >
            เข้าสู่ระบบ
          </Button>

        </Stack>

        <Typography
          variant="caption"
          display="block"
          textAlign="center"
          mt={3}
          color="text.secondary"
        >
          Demo Login : admin / 1234
        </Typography>

      </Paper>

    </Box>

  );

}