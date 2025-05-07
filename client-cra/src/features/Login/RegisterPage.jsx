import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    try {
      await axios.post("/api/auth/register", {
        username,
        email,
        password,
      });

      toast.success("Registration successful! You can now log in.", {
        position: "top-center",
        autoClose: 2000,
      });
      
      setTimeout(() => {
        navigate("/login");
      }, 2000); // match the toast time so it feels natural

    } catch (err) {
      console.error("Registration failed", err);
      toast.error(err.response?.data?.message || "Registration failed. Please try again.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Register</h1>
        <form onSubmit={handleRegister} style={styles.form}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>
            Register
          </button>
        </form>
        <p style={styles.switchText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.switchLink}>
            Log in
          </Link>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: "2rem",
  },
  card: {
    padding: "2rem",
    background: "#fff",
    borderRadius: "1rem",
    boxShadow: "0 0 20px rgba(0,0,0,0.1)",
    textAlign: "center",
    maxWidth: "400px",
    width: "100%",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "1.5rem",
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  input: {
    padding: "0.75rem 1rem",
    fontSize: "1rem",
    border: "1px solid #ddd",
    borderRadius: "0.5rem",
  },
  button: {
    padding: "0.75rem 1rem",
    fontSize: "1rem",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
  },
  switchText: {
    marginTop: "1rem",
    fontSize: "0.9rem",
    color: "#666",
  },
  switchLink: {
    color: "#4CAF50",
    textDecoration: "underline",
    cursor: "pointer",
  },
};

export default RegisterPage;
