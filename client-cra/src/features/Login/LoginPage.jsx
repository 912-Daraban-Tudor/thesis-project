import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../api/axiosInstance";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address.", { position: "top-center", autoClose: 2000 });
      return;
    }

    try {
      const response = await axios.post("/api/auth/login", { email, password });
      const { token } = response.data;
      localStorage.setItem("token", token);

      toast.success("Login successful! Redirecting...", { position: "top-center", autoClose: 1500 });
      setTimeout(() => navigate("/main"), 1500);
    } catch (err) {
      console.error("Login failed", err);
      toast.error(err.response?.data?.message || "Login failed. Please try again.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
      px={2}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          borderRadius: 4,
        }}
      >
        <Typography variant="h4" align="center" color="primary" mb={3}>
          Welcome Back
        </Typography>

        <form onSubmit={handleLogin}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 3 }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{
              backgroundColor: '#4a7ebb',
              fontWeight: 'bold',
              ':hover': {
                backgroundColor: '#3b6ca8',
              },
            }}
          >
            Log In
          </Button>
        </form>

        <Typography align="center" variant="body2" mt={3}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#4a7ebb", fontWeight: 500 }}>
            Register here
          </Link>
        </Typography>
      </Paper>
      <ToastContainer />
    </Box>
  );
}

export default LoginPage;
