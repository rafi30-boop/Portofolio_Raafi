import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth.js";
import Button from "../styles/components/ui/Button.jsx";
import Card from "../styles/components/ui/Card.jsx";
import Input from "../styles/components/ui/Input.jsx";
import toast from "react-hot-toast";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success("Login successful!");
      navigate("/admin");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "5rem 0",
      }}
    >
      <div style={{ maxWidth: "28rem", width: "90%", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card style={{ padding: "2rem" }}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <h1
                className="gradient-text"
                style={{
                  fontSize: "1.875rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                }}
              >
                Welcome Back
              </h1>
              <p style={{ color: "var(--gray-600)" }}>
                Login to access admin dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <Input
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />

              <Button
                type="submit"
                disabled={loading}
                style={{ width: "100%", marginTop: "0.5rem" }}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div
              style={{
                marginTop: "1.5rem",
                textAlign: "center",
                fontSize: "0.875rem",
                color: "var(--gray-500)",
              }}
            >
              <p>Demo credentials:</p>
              <p>Email: admin@example.com</p>
              <p>Password: admin123</p>
            </div>
          </Card>
        </motion.div>
      </div>

      <style>{`
        .dark .gradient-text {
          background: linear-gradient(135deg, var(--primary-400), var(--secondary-400));
          background-clip: text;
          -webkit-background-clip: text;
        }
      `}</style>
    </div>
  );
};

export default Login;
