import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import { UserContext } from "../context/UserContext";
import { apiUrl } from "../config/api";

function Login() {
  const { login } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo =
    location.state?.from ||
    new URLSearchParams(location.search).get("redirect") ||
    "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event) {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(
        apiUrl("/api/users/login"),
        {
          email: email.trim().toLowerCase(),
          password,
        }
      );

      // UserContext wuxuu kaydinayaa userInfo iyo token
      login(data);

      // Admin wuxuu aadayaa dashboard-ka
      if (data.isAdmin) {
        navigate("/admin");
      } else {
        navigate(redirectTo);
      }
    } catch (currentError) {
      console.error("Login error:", currentError);

      setError(
        currentError.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <p style={smallLabelStyle}>Riani Shop</p>

        <h1 style={titleStyle}>Login</h1>

        <p style={subtitleStyle}>
          Sign in to access your account.
        </p>

        {error && (
          <div style={errorMessageStyle}>{error}</div>
        )}

        <form onSubmit={handleLogin} style={formStyle}>
          <div style={formGroupStyle}>
            <label htmlFor="email" style={labelStyle}>
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              style={inputStyle}
              autoComplete="email"
              required
            />
          </div>

          <div style={formGroupStyle}>
            <label htmlFor="password" style={labelStyle}>
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              style={inputStyle}
              autoComplete="current-password"
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
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
  maxWidth: "480px",
  padding: "35px",
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
  fontSize: "40px",
};

const subtitleStyle = {
  margin: "9px 0 25px",
  color: "#666666",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
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

export default Login;