import { useState } from "react";
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

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address.", { position: "top-center", autoClose: 3000 });
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.", { position: "top-center", autoClose: 3000 });
      return;
    }

    setLoading(true);

    try {
      await axios.post("/api/auth/register", { username, email, password });

      toast.success("Registration successful! You can now log in.", {
        position: "top-center",
        autoClose: 1000,
      });

      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      console.error("Registration failed", err);
      toast.error(err.response?.data?.message || "Registration failed. Please try again.", {
        position: "top-center",
        autoClose: 3000,
      });
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      width="100vw"
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
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          mb={3}
          gap={1.5}
        >
          <Box
            backgroundColor="#2d3e50"
            component="img"
            src="/iconLogo.png"
            alt="Logo"
            sx={{ height: 40, objectFit: 'contain' }}
          />
          <Typography variant="h4" align="center" color="primary" mb={3}>
            Create an Account
          </Typography>
        </Box>

        <form onSubmit={handleRegister}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

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
            disabled={loading}
            sx={{
              backgroundColor: '#4a7ebb',
              fontWeight: 'bold',
              ':hover': {
                backgroundColor: '#3b6ca8',
              },
            }}
          >
            Register
          </Button>
        </form>

        <Typography align="center" variant="body2" mt={3}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#4a7ebb", fontWeight: 500 }}>
            Log in
          </Link>
        </Typography>
      </Paper>
      <ToastContainer />
    </Box>
  );
}

export default RegisterPage;



