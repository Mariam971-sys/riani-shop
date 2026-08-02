import { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import { UserContext } from "../context/UserContext";
import { apiUrl } from "../config/api";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(UserContext);

  const redirectTo =
    location.state?.from ||
    new URLSearchParams(location.search).get("redirect") ||
    "/";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (name.length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(
        apiUrl("/api/users/register"),
        {
          name,
          email,
          password,
        }
      );

      login(data);

      if (data.isAdmin) {
        navigate("/admin");
      } else {
        navigate(redirectTo);
      }
    } catch (currentError) {
      console.error("Registration error:", currentError);

      setError(
        currentError.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <p style={smallLabelStyle}>Riani Shop</p>

        <h1 style={titleStyle}>Create Account</h1>

        <p style={subtitleStyle}>
          Register to save your details and place orders.
        </p>

        {error && (
          <div style={errorMessageStyle}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={formGroupStyle}>
            <label htmlFor="register-name" style={labelStyle}>
              Full Name
            </label>

            <input
              id="register-name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              style={inputStyle}
              autoComplete="name"
              required
            />
          </div>

          <div style={formGroupStyle}>
            <label htmlFor="register-email" style={labelStyle}>
              Email
            </label>

            <input
              id="register-email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle}
              autoComplete="email"
              required
            />
          </div>

          <div style={formGroupStyle}>
            <label htmlFor="register-password" style={labelStyle}>
              Password
            </label>

            <input
              id="register-password"
              type="password"
              name="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              style={inputStyle}
              autoComplete="new-password"
              required
            />
          </div>

          <div style={formGroupStyle}>
            <label
              htmlFor="register-confirm-password"
              style={labelStyle}
            >
              Confirm Password
            </label>

            <input
              id="register-confirm-password"
              type="password"
              name="confirmPassword"
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={inputStyle}
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p style={loginTextStyle}>
          Already have an account?{" "}
          <Link to="/login" style={loginLinkStyle}>
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}

const pageStyle = {
  minHeight: "70vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  padding: "70px 20px",
  backgroundColor: "#f8f8f8",
};

const cardStyle = {
  width: "100%",
  maxWidth: "500px",
  padding: "35px",
  boxSizing: "border-box",
  border: "1px solid #e2e2e2",
  borderRadius: "12px",
  backgroundColor: "#ffffff",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
};

const smallLabelStyle = {
  margin: "0 0 7px",
  color: "#777777",
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "1px",
};

const titleStyle = {
  margin: 0,
  fontSize: "clamp(32px, 7vw, 40px)",
};

const subtitleStyle = {
  margin: "9px 0 25px",
  color: "#666666",
  lineHeight: 1.6,
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "19px",
};

const formGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const labelStyle = {
  fontSize: "14px",
  fontWeight: "700",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "14px 15px",
  border: "1px solid #cccccc",
  borderRadius: "7px",
  fontSize: "15px",
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  border: "none",
  borderRadius: "7px",
  backgroundColor: "#111111",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "700",
};

const errorMessageStyle = {
  marginBottom: "20px",
  padding: "13px 15px",
  borderRadius: "7px",
  backgroundColor: "#ffe7e7",
  color: "#b00020",
};

const loginTextStyle = {
  margin: "24px 0 0",
  textAlign: "center",
  color: "#666666",
};

const loginLinkStyle = {
  color: "#111111",
  fontWeight: "700",
};

export default Register;